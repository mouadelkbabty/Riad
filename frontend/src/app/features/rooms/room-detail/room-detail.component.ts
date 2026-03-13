import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../../core/services/room.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Room } from '../../../core/models';
import { format, addDays, differenceInDays } from 'date-fns';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
  @if (loading()) {
    <app-loading-spinner message="Chargement de la chambre…" />
  } @else if (!room()) {
    <div class="text-center py-20">
      <p class="text-gray-500">Chambre introuvable.</p>
      <a routerLink="/chambres" class="btn-secondary mt-4">Retour aux chambres</a>
    </div>
  } @else {
    <div class="max-w-7xl mx-auto px-4 py-12">
      <!-- Breadcrumb -->
      <nav class="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <a routerLink="/" class="hover:text-riad-600">Accueil</a>
        <span>/</span>
        <a routerLink="/chambres" class="hover:text-riad-600">Chambres</a>
        <span>/</span>
        <span class="text-gray-700">{{ room()!.name }}</span>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <!-- ─── Left: Photos + info ─── -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Photo gallery -->
          <div class="grid grid-cols-2 gap-3">
            @if (room()!.photos.length > 0) {
              <div class="col-span-2 md:col-span-1 rounded-2xl overflow-hidden aspect-[4/3]">
                <img [src]="room()!.photos[0].fileUrl" [alt]="room()!.photos[0].altText"
                     class="w-full h-full object-cover">
              </div>
              @for (photo of room()!.photos.slice(1, 3); track photo.id) {
                <div class="rounded-xl overflow-hidden aspect-[4/3]">
                  <img [src]="photo.fileUrl" [alt]="photo.altText"
                       class="w-full h-full object-cover">
                </div>
              }
            } @else {
              <div class="col-span-2 rounded-2xl bg-riad-100 aspect-[16/9] flex items-center justify-center text-6xl">
                🏡
              </div>
            }
          </div>

          <!-- Room info -->
          <div>
            <div class="flex items-start justify-between mb-3">
              <div>
                <span class="badge bg-riad-100 text-riad-700 mb-2">{{ room()!.typeName }}</span>
                <h1 class="text-3xl font-display font-bold text-riad-900">{{ room()!.name }}</h1>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-riad-600">{{ room()!.pricePerNight | number }} MAD</p>
                <p class="text-gray-400 text-sm">/ nuit</p>
              </div>
            </div>

            <div class="flex gap-5 text-sm text-gray-500 mb-5">
              <span>👥 {{ room()!.capacity }} personnes max.</span>
              <span>📐 {{ room()!.surface }} m²</span>
            </div>

            <p class="text-gray-600 leading-relaxed">{{ room()!.description }}</p>
          </div>

          <!-- Amenities -->
          @if (room()!.amenities.length) {
            <div>
              <h2 class="font-display font-semibold text-xl text-riad-900 mb-4">Équipements</h2>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                @for (amenity of room()!.amenities; track amenity) {
                  <div class="flex items-center gap-2 text-sm text-gray-600 bg-riad-50 rounded-lg px-3 py-2">
                    <span class="text-riad-500">✓</span>
                    {{ amenity }}
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <!-- ─── Right: Booking widget ─── -->
        <div class="lg:col-span-1">
          <div class="card p-6 sticky top-24">
            <h2 class="font-display font-semibold text-lg text-riad-900 mb-5">
              Réserver cette chambre
            </h2>

            <div class="space-y-4">
              <div>
                <label for="booking-checkin" class="form-label">Arrivée</label>
                <input id="booking-checkin" type="date" [(ngModel)]="booking.checkIn"
                       [min]="today" (ngModelChange)="recalculate()"
                       class="form-field">
              </div>
              <div>
                <label for="booking-checkout" class="form-label">Départ</label>
                <input id="booking-checkout" type="date" [(ngModel)]="booking.checkOut"
                       [min]="booking.checkIn || today" (ngModelChange)="recalculate()"
                       class="form-field">
              </div>
              <div>
                <label for="booking-guests" class="form-label">Voyageurs</label>
                <select id="booking-guests" [(ngModel)]="booking.guests" class="form-field">
                  @for (n of guestOptions(); track n) {
                    <option [value]="n">{{ n }} personne{{ n > 1 ? 's' : '' }}</option>
                  }
                </select>
              </div>

              @if (nights() > 0) {
                <div class="bg-riad-50 rounded-xl p-4 text-sm">
                  <div class="flex justify-between mb-2">
                    <span class="text-gray-600">{{ room()!.pricePerNight | number }} MAD × {{ nights() }} nuit{{ nights() > 1 ? 's' : '' }}</span>
                    <span class="font-semibold">{{ total() | number }} MAD</span>
                  </div>
                  <hr class="border-riad-200 my-2">
                  <div class="flex justify-between font-bold text-riad-800">
                    <span>Total estimé</span>
                    <span>{{ total() | number }} MAD</span>
                  </div>
                </div>
              }

              @if (!room()!.available) {
                <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 text-center">
                  Cette chambre est temporairement indisponible.
                </div>
              } @else {
                <button (click)="reserve()" [disabled]="!canReserve()"
                        class="btn-primary w-full justify-center py-3">
                  Réserver maintenant
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  }
  `,
})
export class RoomDetailComponent implements OnInit {
  @Input() id!: string;

  private readonly roomService  = inject(RoomService);
  private readonly toast        = inject(ToastService);
  private readonly router       = inject(Router);

  readonly room    = signal<Room | null>(null);
  readonly loading = signal(true);

  readonly today = format(new Date(), 'yyyy-MM-dd');

  booking = {
    checkIn:  this.today,
    checkOut: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    guests:   2,
  };

  nights = signal(0);
  total  = signal(0);

  guestOptions() {
    const max = this.room()?.capacity ?? 10;
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  canReserve() {
    return this.nights() > 0 && this.booking.guests > 0 && this.room()?.available;
  }

  ngOnInit() {
    this.roomService.getById(+this.id).subscribe({
      next: res => { this.room.set(res.data); this.recalculate(); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  recalculate() {
    if (this.booking.checkIn && this.booking.checkOut) {
      const n = differenceInDays(
        new Date(this.booking.checkOut),
        new Date(this.booking.checkIn)
      );
      this.nights.set(Math.max(0, n));
      this.total.set(this.nights() * (this.room()?.pricePerNight ?? 0));
    }
  }

  reserve() {
    this.router.navigate(['/reserver'], {
      queryParams: {
        roomId:   this.id,
        checkIn:  this.booking.checkIn,
        checkOut: this.booking.checkOut,
        guests:   this.booking.guests,
      },
    });
  }
}
