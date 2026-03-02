import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../../core/services/room.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Room } from '../../../core/models';
import { format, addDays, differenceInDays } from 'date-fns';

@Component({
  selector: 'app-create-reservation',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
  <div class="max-w-2xl mx-auto px-4 py-12">
    <nav class="text-sm text-gray-400 mb-6 flex items-center gap-2">
      <a routerLink="/" class="hover:text-riad-600">Accueil</a><span>/</span>
      <a routerLink="/reservations" class="hover:text-riad-600">Réservations</a><span>/</span>
      <span class="text-gray-700">Nouvelle réservation</span>
    </nav>

    <h1 class="text-3xl font-display font-bold text-riad-900 mb-8">Nouvelle réservation</h1>

    @if (loadingRoom()) {
      <app-loading-spinner />
    } @else if (!room()) {
      <p class="text-gray-500">Chambre non trouvée.
        <a routerLink="/chambres" class="text-riad-600 underline">Choisir une chambre</a>
      </p>
    } @else {
      <!-- Room summary -->
      <div class="card p-5 flex gap-4 mb-8">
        <div class="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-riad-100 flex items-center justify-center text-2xl">
          @if (room()!.coverPhotoUrl) {
            <img [src]="room()!.coverPhotoUrl" [alt]="room()!.name" class="w-full h-full object-cover">
          } @else {
            🏡
          }
        </div>
        <div>
          <p class="text-xs text-riad-500 font-medium uppercase tracking-wide">{{ room()!.typeName }}</p>
          <h2 class="font-display font-semibold text-lg text-riad-900">{{ room()!.name }}</h2>
          <p class="text-sm text-gray-500">{{ room()!.pricePerNight | number }} MAD / nuit · {{ room()!.capacity }} pers. max</p>
        </div>
      </div>

      <!-- Form -->
      <div class="card p-6 space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Date d'arrivée</label>
            <input type="date" [(ngModel)]="form.checkIn" [min]="today"
                   (ngModelChange)="recalculate()" class="form-field">
          </div>
          <div>
            <label class="form-label">Date de départ</label>
            <input type="date" [(ngModel)]="form.checkOut"
                   [min]="form.checkIn || today"
                   (ngModelChange)="recalculate()" class="form-field">
          </div>
        </div>

        <div>
          <label class="form-label">Nombre de voyageurs</label>
          <select [(ngModel)]="form.guests" class="form-field">
            @for (n of guestOptions(); track n) {
              <option [value]="n">{{ n }} personne{{ n > 1 ? 's' : '' }}</option>
            }
          </select>
        </div>

        <div>
          <label class="form-label">Demandes spéciales (optionnel)</label>
          <textarea [(ngModel)]="form.specialRequests" rows="3"
                    placeholder="Allergies, préférences, heure d'arrivée…"
                    class="form-field resize-none"></textarea>
        </div>

        <!-- Price summary -->
        @if (nights() > 0) {
          <div class="bg-riad-50 rounded-xl p-4 text-sm space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">{{ room()!.pricePerNight | number }} MAD × {{ nights() }} nuit{{ nights() > 1 ? 's' : '' }}</span>
              <span>{{ total() | number }} MAD</span>
            </div>
            <hr class="border-riad-200">
            <div class="flex justify-between font-bold text-riad-900">
              <span>Total</span>
              <span>{{ total() | number }} MAD</span>
            </div>
          </div>
        }

        @if (errorMsg()) {
          <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {{ errorMsg() }}
          </div>
        }

        <div class="flex gap-3 pt-2">
          <a routerLink="/chambres" class="btn-secondary flex-1 justify-center">Annuler</a>
          <button (click)="submit()" [disabled]="!canSubmit() || submitting()"
                  class="btn-primary flex-1 justify-center">
            @if (submitting()) {
              <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            } @else {
              Confirmer la réservation
            }
          </button>
        </div>
      </div>
    }
  </div>
  `,
})
export class CreateReservationComponent implements OnInit {
  private readonly roomService        = inject(RoomService);
  private readonly reservationService = inject(ReservationService);
  private readonly toast              = inject(ToastService);
  private readonly route              = inject(ActivatedRoute);
  private readonly router             = inject(Router);

  readonly room        = signal<Room | null>(null);
  readonly loadingRoom = signal(true);
  readonly submitting  = signal(false);
  readonly errorMsg    = signal('');
  readonly nights      = signal(0);
  readonly total       = signal(0);

  readonly today = format(new Date(), 'yyyy-MM-dd');

  form = {
    checkIn:         this.today,
    checkOut:        format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    guests:          2,
    specialRequests: '',
  };

  guestOptions() {
    return Array.from({ length: this.room()?.capacity ?? 10 }, (_, i) => i + 1);
  }

  canSubmit() {
    return this.nights() > 0 && this.form.guests > 0;
  }

  ngOnInit() {
    const q = this.route.snapshot.queryParams;
    const roomId = +q['roomId'];
    if (q['checkIn'])  this.form.checkIn  = q['checkIn'];
    if (q['checkOut']) this.form.checkOut = q['checkOut'];
    if (q['guests'])   this.form.guests   = +q['guests'];

    if (!roomId) {
      this.loadingRoom.set(false);
      return;
    }

    this.roomService.getById(roomId).subscribe({
      next: res => { this.room.set(res.data); this.recalculate(); this.loadingRoom.set(false); },
      error: () => this.loadingRoom.set(false),
    });
  }

  recalculate() {
    const n = differenceInDays(new Date(this.form.checkOut), new Date(this.form.checkIn));
    this.nights.set(Math.max(0, n));
    this.total.set(this.nights() * (this.room()?.pricePerNight ?? 0));
  }

  submit() {
    if (!this.canSubmit() || this.submitting()) return;
    this.submitting.set(true);
    this.errorMsg.set('');

    this.reservationService.create({
      roomId:          this.room()!.id,
      checkIn:         this.form.checkIn,
      checkOut:        this.form.checkOut,
      numberOfGuests:  this.form.guests,
      specialRequests: this.form.specialRequests || undefined,
    }).subscribe({
      next: res => {
        this.toast.success('Réservation créée avec succès !');
        this.router.navigate(['/reservations', res.data.id]);
      },
      error: err => {
        this.submitting.set(false);
        this.errorMsg.set(err.error?.message ?? 'Erreur lors de la réservation.');
      },
    });
  }
}
