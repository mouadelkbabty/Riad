import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../../core/services/reservation.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Reservation, RESERVATION_STATUS_CONFIG } from '../../../core/models';

@Component({
  selector: 'app-reservation-management',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
  <div class="max-w-7xl mx-auto px-4 py-12">
    <div class="flex items-center justify-between mb-8">
      <div>
        <a routerLink="/admin" class="text-sm text-gray-400 hover:text-riad-600 mb-1 block">← Tableau de bord</a>
        <h1 class="text-3xl font-display font-bold text-riad-900">Gestion des réservations</h1>
      </div>
    </div>

    <!-- Filter tabs -->
    <div class="flex gap-2 mb-6 flex-wrap">
      @for (s of statusFilters; track s.value) {
        <button (click)="filterStatus.set(s.value); loadReservations()"
                class="btn-sm"
                [class.btn-primary]="filterStatus() === s.value"
                [class.btn-secondary]="filterStatus() !== s.value">
          {{ s.label }}
        </button>
      }
    </div>

    @if (loading()) {
      <app-loading-spinner />
    } @else {
      <div class="card overflow-x-auto">
        <table class="w-full text-sm min-w-[800px]">
          <thead class="bg-riad-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chambre</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            @for (r of reservations(); track r.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-mono text-xs text-gray-400">{{ r.reservationNumber }}</td>
                <td class="px-4 py-3">
                  <p class="font-medium text-gray-900">{{ r.user.fullName }}</p>
                  <p class="text-xs text-gray-400">{{ r.user.email }}</p>
                </td>
                <td class="px-4 py-3 text-gray-600">{{ r.room.name }}</td>
                <td class="px-4 py-3 text-xs">
                  <p>{{ r.checkIn | date:'dd/MM/yy' }} → {{ r.checkOut | date:'dd/MM/yy' }}</p>
                  <p class="text-gray-400">{{ r.numberOfNights }} nuits · {{ r.numberOfGuests }} pers.</p>
                </td>
                <td class="px-4 py-3 font-semibold text-riad-700">{{ r.totalPrice | number }} MAD</td>
                <td class="px-4 py-3">
                  <span class="badge" [class]="statusConfig(r.status).badgeClass">
                    {{ statusConfig(r.status).label }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    @if (r.status === 'PENDING') {
                      <button (click)="confirm(r)" class="btn-sm bg-green-600 text-white hover:bg-green-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
                        Confirmer
                      </button>
                    }
                    @if (r.status === 'PENDING' || r.status === 'CONFIRMED') {
                      <button (click)="cancel(r)" class="btn-danger btn-sm">Annuler</button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (totalPages() > 1) {
        <div class="flex items-center justify-center gap-3 mt-6">
          <button (click)="goToPage(page() - 1)" [disabled]="page() === 0" class="btn-secondary btn-sm">←</button>
          <span class="text-sm text-gray-500">{{ page() + 1 }} / {{ totalPages() }}</span>
          <button (click)="goToPage(page() + 1)" [disabled]="page() + 1 >= totalPages()" class="btn-secondary btn-sm">→</button>
        </div>
      }
    }
  </div>
  `,
})
export class ReservationManagementComponent implements OnInit {
  private readonly reservationService = inject(ReservationService);
  private readonly toast              = inject(ToastService);

  readonly reservations = signal<Reservation[]>([]);
  readonly loading      = signal(true);
  readonly page         = signal(0);
  readonly totalPages   = signal(0);
  readonly filterStatus = signal('');

  readonly statusFilters = [
    { value: '',          label: 'Toutes' },
    { value: 'PENDING',   label: 'En attente' },
    { value: 'CONFIRMED', label: 'Confirmées' },
    { value: 'CANCELLED', label: 'Annulées' },
    { value: 'COMPLETED', label: 'Terminées' },
  ];

  statusConfig(status: string) {
    return RESERVATION_STATUS_CONFIG[status as any] ?? { label: status, badgeClass: 'badge-gray' };
  }

  ngOnInit() { this.loadReservations(); }

  loadReservations() {
    this.loading.set(true);
    this.reservationService.getAll(
      { page: this.page(), size: 20 },
      this.filterStatus() || undefined
    ).subscribe({
      next: res => {
        this.reservations.set(res.data.content);
        this.totalPages.set(res.data.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goToPage(p: number) { this.page.set(p); this.loadReservations(); }

  confirm(r: Reservation) {
    this.reservationService.confirm(r.id).subscribe({
      next: res => {
        this.reservations.update(l => l.map(x => x.id === r.id ? res.data : x));
        this.toast.success('Réservation confirmée.');
      },
      error: err => this.toast.error(err.error?.message ?? 'Erreur lors de la confirmation.'),
    });
  }

  cancel(r: Reservation) {
    const reason = prompt('Motif d\'annulation (optionnel) :') ?? '';
    this.reservationService.cancel(r.id, { reason }).subscribe({
      next: res => {
        this.reservations.update(l => l.map(x => x.id === r.id ? res.data : x));
        this.toast.info('Réservation annulée.');
      },
      error: err => this.toast.error(err.error?.message ?? 'Impossible d\'annuler.'),
    });
  }
}
