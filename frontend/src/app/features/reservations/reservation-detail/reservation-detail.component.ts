import { Component, inject, OnInit, Input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../../core/services/reservation.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Reservation, RESERVATION_STATUS_CONFIG } from '../../../core/models';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
  <div class="max-w-2xl mx-auto px-4 py-12">
    <nav class="text-sm text-gray-400 mb-6 flex items-center gap-2">
      <a routerLink="/reservations" class="hover:text-riad-600">Mes réservations</a>
      <span>/</span>
      <span class="text-gray-700">Détails</span>
    </nav>

    @if (loading()) {
      <app-loading-spinner />
    } @else if (!res()) {
      <p class="text-gray-500">Réservation introuvable.</p>
    } @else {
      <div class="card p-8">
        <!-- Header -->
        <div class="flex items-start justify-between mb-6">
          <div>
            <h1 class="text-2xl font-display font-bold text-riad-900 mb-1">
              {{ res()!.room.name }}
            </h1>
            <p class="text-xs text-gray-400 font-mono">{{ res()!.reservationNumber }}</p>
          </div>
          <span [class]="statusConfig(res()!.status).badgeClass + ' text-sm'">
            {{ statusConfig(res()!.status).label }}
          </span>
        </div>

        <!-- Details grid -->
        <div class="grid grid-cols-2 gap-4 text-sm mb-6">
          <div class="bg-riad-50 rounded-xl p-4">
            <p class="text-gray-400 text-xs mb-1">Arrivée</p>
            <p class="font-semibold text-riad-900">{{ res()!.checkIn | date:'EEE dd MMM yyyy' }}</p>
          </div>
          <div class="bg-riad-50 rounded-xl p-4">
            <p class="text-gray-400 text-xs mb-1">Départ</p>
            <p class="font-semibold text-riad-900">{{ res()!.checkOut | date:'EEE dd MMM yyyy' }}</p>
          </div>
          <div class="bg-riad-50 rounded-xl p-4">
            <p class="text-gray-400 text-xs mb-1">Voyageurs</p>
            <p class="font-semibold text-riad-900">{{ res()!.numberOfGuests }} personne{{ res()!.numberOfGuests > 1 ? 's' : '' }}</p>
          </div>
          <div class="bg-riad-50 rounded-xl p-4">
            <p class="text-gray-400 text-xs mb-1">Durée</p>
            <p class="font-semibold text-riad-900">{{ res()!.numberOfNights }} nuit{{ res()!.numberOfNights > 1 ? 's' : '' }}</p>
          </div>
        </div>

        <!-- Total -->
        <div class="flex items-center justify-between bg-riad-700 text-white rounded-xl p-4 mb-6">
          <span class="font-medium">Total</span>
          <span class="text-xl font-bold">{{ res()!.totalPrice | number }} MAD</span>
        </div>

        <!-- Special requests -->
        @if (res()!.specialRequests) {
          <div class="mb-6">
            <p class="text-xs text-gray-400 mb-1">Demandes spéciales</p>
            <p class="text-gray-700 text-sm bg-gray-50 rounded-lg p-3">{{ res()!.specialRequests }}</p>
          </div>
        }

        <!-- Cancellation reason -->
        @if (res()!.cancellationReason) {
          <div class="mb-6 bg-red-50 border border-red-100 rounded-lg p-3">
            <p class="text-xs text-red-400 mb-1">Motif d'annulation</p>
            <p class="text-red-700 text-sm">{{ res()!.cancellationReason }}</p>
          </div>
        }

        <!-- Cancel button -->
        @if (canCancel()) {
          @if (!showCancelForm()) {
            <button (click)="showCancelForm.set(true)" class="btn-danger w-full justify-center">
              Annuler la réservation
            </button>
          } @else {
            <div class="border border-red-200 rounded-xl p-4 space-y-3">
              <p class="text-sm font-medium text-red-700">Confirmer l'annulation</p>
              <textarea [(ngModel)]="cancelReason" rows="2"
                        placeholder="Motif de l'annulation (optionnel)"
                        class="form-field text-sm resize-none"></textarea>
              <div class="flex gap-3">
                <button (click)="showCancelForm.set(false)" class="btn-ghost flex-1">Retour</button>
                <button (click)="cancel()" [disabled]="cancelling()"
                        class="btn-danger flex-1 justify-center">
                  @if (cancelling()) {
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  } @else {
                    Confirmer l'annulation
                  }
                </button>
              </div>
            </div>
          }
        }

        <div class="mt-4">
          <a routerLink="/reservations" class="btn-ghost w-full justify-center">
            ← Retour à mes réservations
          </a>
        </div>
      </div>
    }
  </div>
  `,
})
export class ReservationDetailComponent implements OnInit {
  @Input() id!: string;

  private readonly reservationService = inject(ReservationService);
  private readonly authService        = inject(AuthService);
  private readonly toast              = inject(ToastService);

  readonly res          = signal<Reservation | null>(null);
  readonly loading      = signal(true);
  readonly showCancelForm = signal(false);
  readonly cancelling   = signal(false);
  cancelReason = '';

  statusConfig(status: string) {
    return RESERVATION_STATUS_CONFIG[status as any] ?? { label: status, badgeClass: 'badge-gray' };
  }

  canCancel() {
    const r = this.res();
    return r && (r.status === 'PENDING' || r.status === 'CONFIRMED');
  }

  ngOnInit() {
    this.reservationService.getById(+this.id).subscribe({
      next: res => { this.res.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  cancel() {
    this.cancelling.set(true);
    this.reservationService.cancel(+this.id, { reason: this.cancelReason }).subscribe({
      next: res => {
        this.res.set(res.data);
        this.toast.success('Réservation annulée.');
        this.showCancelForm.set(false);
        this.cancelling.set(false);
      },
      error: err => {
        this.cancelling.set(false);
        this.toast.error(err.error?.message ?? 'Impossible d\'annuler.');
      },
    });
  }
}
