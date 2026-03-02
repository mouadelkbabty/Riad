import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../../../core/services/reservation.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Reservation, RESERVATION_STATUS_CONFIG } from '../../../core/models';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [RouterLink, CommonModule, LoadingSpinnerComponent],
  template: `
  <div class="max-w-4xl mx-auto px-4 py-12">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-display font-bold text-riad-900">Mes réservations</h1>
      <a routerLink="/chambres" class="btn-primary">
        Nouvelle réservation
      </a>
    </div>

    @if (loading()) {
      <app-loading-spinner message="Chargement…" />
    } @else if (reservations().length === 0) {
      <div class="text-center py-20 card p-12">
        <div class="text-5xl mb-4">🏨</div>
        <h2 class="font-display text-xl font-semibold text-gray-700 mb-2">
          Aucune réservation
        </h2>
        <p class="text-gray-500 mb-6">
          Vous n'avez pas encore de réservation. Découvrez nos chambres !
        </p>
        <a routerLink="/chambres" class="btn-primary">Voir les chambres</a>
      </div>
    } @else {
      <div class="space-y-4">
        @for (r of reservations(); track r.id) {
          <div class="card p-5 flex flex-col md:flex-row gap-5">
            <!-- Room thumbnail -->
            <div class="w-full md:w-32 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-riad-100
                        flex items-center justify-center text-2xl">
              @if (r.room.coverPhotoUrl) {
                <img [src]="r.room.coverPhotoUrl" [alt]="r.room.name" class="w-full h-full object-cover">
              } @else {
                🏡
              }
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-3 mb-1">
                <h2 class="font-display font-semibold text-riad-900 truncate">
                  {{ r.room.name }}
                </h2>
                <span [class]="statusConfig(r.status).badgeClass">
                  {{ statusConfig(r.status).label }}
                </span>
              </div>
              <p class="text-xs text-gray-400 font-mono mb-2">{{ r.reservationNumber }}</p>
              <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                <span>📅 {{ r.checkIn | date:'dd MMM yyyy' }} → {{ r.checkOut | date:'dd MMM yyyy' }}</span>
                <span>👥 {{ r.numberOfGuests }} pers.</span>
                <span>🌙 {{ r.numberOfNights }} nuit{{ r.numberOfNights > 1 ? 's' : '' }}</span>
                <span class="font-semibold text-riad-700">{{ r.totalPrice | number }} MAD</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex-shrink-0 flex flex-col gap-2 justify-start">
              <a [routerLink]="['/reservations', r.id]" class="btn-secondary btn-sm">
                Détails
              </a>
            </div>
          </div>
        }
      </div>

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="flex items-center justify-center gap-3 mt-8">
          <button (click)="goToPage(page() - 1)" [disabled]="page() === 0"
                  class="btn-secondary btn-sm">←</button>
          <span class="text-sm text-gray-500">{{ page() + 1 }} / {{ totalPages() }}</span>
          <button (click)="goToPage(page() + 1)" [disabled]="page() + 1 >= totalPages()"
                  class="btn-secondary btn-sm">→</button>
        </div>
      }
    }
  </div>
  `,
})
export class MyReservationsComponent implements OnInit {
  private readonly reservationService = inject(ReservationService);

  readonly reservations = signal<Reservation[]>([]);
  readonly loading      = signal(true);
  readonly page         = signal(0);
  readonly totalPages   = signal(0);

  statusConfig(status: string) {
    return RESERVATION_STATUS_CONFIG[status as any] ?? { label: status, badgeClass: 'badge-gray' };
  }

  ngOnInit() { this.load(); }

  goToPage(p: number) { this.page.set(p); this.load(); }

  private load() {
    this.loading.set(true);
    this.reservationService.getMyReservations({ page: this.page(), size: 10 }).subscribe({
      next: res => {
        this.reservations.set(res.data.content);
        this.totalPages.set(res.data.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
