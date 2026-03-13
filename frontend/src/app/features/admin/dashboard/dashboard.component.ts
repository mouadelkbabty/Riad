import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../../core/services/room.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

interface Stat {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule, LoadingSpinnerComponent],
  template: `
  <div class="max-w-7xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-display font-bold text-riad-900 mb-2">Administration</h1>
    <p class="text-gray-500 mb-10">Tableau de bord — Riad Lee</p>

    <!-- Stat cards -->
    @if (loading()) {
      <app-loading-spinner />
    } @else {
      <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        @for (s of stats(); track s.label) {
          <div class="card p-5">
            <div class="flex items-center justify-between mb-3">
              <span class="text-2xl">{{ s.icon }}</span>
              <span class="badge" [class]="s.color">{{ s.value }}</span>
            </div>
            <p class="text-sm text-gray-500">{{ s.label }}</p>
          </div>
        }
      </div>

      <!-- Quick links -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a routerLink="/admin/reservations"
           class="card p-6 hover:shadow-xl transition-shadow cursor-pointer group">
          <div class="text-3xl mb-3">📋</div>
          <h2 class="font-display font-semibold text-riad-900 mb-1">Réservations</h2>
          <p class="text-sm text-gray-500">Gérer et confirmer les réservations</p>
          <span class="text-riad-600 text-sm font-medium mt-3 block group-hover:underline">
            Accéder →
          </span>
        </a>
        <a routerLink="/admin/chambres"
           class="card p-6 hover:shadow-xl transition-shadow cursor-pointer group">
          <div class="text-3xl mb-3">🏠</div>
          <h2 class="font-display font-semibold text-riad-900 mb-1">Chambres</h2>
          <p class="text-sm text-gray-500">Ajouter et modifier les chambres</p>
          <span class="text-riad-600 text-sm font-medium mt-3 block group-hover:underline">
            Accéder →
          </span>
        </a>
        <a routerLink="/admin/galerie"
           class="card p-6 hover:shadow-xl transition-shadow cursor-pointer group">
          <div class="text-3xl mb-3">🖼️</div>
          <h2 class="font-display font-semibold text-riad-900 mb-1">Galerie</h2>
          <p class="text-sm text-gray-500">Gérer les photos du riad</p>
          <span class="text-riad-600 text-sm font-medium mt-3 block group-hover:underline">
            Accéder →
          </span>
        </a>
      </div>

      <!-- Recent reservations -->
      <div class="mt-10">
        <h2 class="font-display font-semibold text-xl text-riad-900 mb-4">
          Dernières réservations
        </h2>
        <div class="card overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-riad-50 text-left">
              <tr>
                <th class="px-4 py-3 text-xs font-medium text-gray-500 uppercase">N°</th>
                <th class="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
                <th class="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Chambre</th>
                <th class="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Arrivée</th>
                <th class="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th class="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Montant</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (r of recentReservations(); track r.id) {
                <tr class="hover:bg-riad-50 transition-colors">
                  <td class="px-4 py-3 font-mono text-xs text-gray-400">{{ r.reservationNumber }}</td>
                  <td class="px-4 py-3">{{ r.user.fullName }}</td>
                  <td class="px-4 py-3">{{ r.room.name }}</td>
                  <td class="px-4 py-3">{{ r.checkIn | date:'dd/MM/yyyy' }}</td>
                  <td class="px-4 py-3">
                    <span class="badge"
                          [class.badge-yellow]="r.status === 'PENDING'"
                          [class.badge-green]="r.status === 'CONFIRMED'"
                          [class.badge-red]="r.status === 'CANCELLED'"
                          [class.badge-blue]="r.status === 'COMPLETED'">
                      {{ r.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 font-semibold text-riad-700">
                    {{ r.totalPrice | number }} MAD
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="mt-3 text-right">
          <a routerLink="/admin/reservations" class="text-sm text-riad-600 hover:underline">
            Voir toutes les réservations →
          </a>
        </div>
      </div>
    }
  </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly roomService        = inject(RoomService);
  private readonly reservationService = inject(ReservationService);

  readonly loading             = signal(true);
  readonly stats               = signal<Stat[]>([]);
  readonly recentReservations  = signal<any[]>([]);

  ngOnInit() {
    Promise.all([
      this.loadRooms(),
      this.loadReservations(),
    ]).then(() => this.loading.set(false));
  }

  private loadRooms(): Promise<void> {
    return new Promise(resolve => {
      this.roomService.getAll({ page: 0, size: 100 }).subscribe({
        next: res => {
          const rooms  = res.data.content;
          const avail  = rooms.filter(r => r.available).length;
          this.stats.update(s => [
            ...s,
            { label: 'Chambres totales',    value: rooms.length, icon: '🏠', color: 'badge-blue'   },
            { label: 'Chambres disponibles', value: avail,        icon: '✅', color: 'badge-green'  },
          ]);
          resolve();
        },
        error: () => resolve(),
      });
    });
  }

  private loadReservations(): Promise<void> {
    return new Promise(resolve => {
      this.reservationService.getAll({ page: 0, size: 5 }).subscribe({
        next: res => {
          this.recentReservations.set(res.data.content);
          const pending   = res.data.content.filter((r: any) => r.status === 'PENDING').length;
          const confirmed = res.data.content.filter((r: any) => r.status === 'CONFIRMED').length;
          this.stats.update(s => [
            ...s,
            { label: 'Réservations en attente', value: pending,  icon: '⏳', color: 'badge-yellow' },
            { label: 'Réservations confirmées', value: confirmed, icon: '🎉', color: 'badge-green'  },
          ]);
          resolve();
        },
        error: () => resolve(),
      });
    });
  }
}
