import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../../core/services/room.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Room, ROOM_TYPE_LABELS, RoomType } from '../../../core/models';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
  <div class="min-h-screen bg-riad-50">
    <!-- Page header -->
    <div class="bg-riad-900 text-white py-20 px-4 text-center">
      <h1 class="section-title text-white">Nos Chambres & Suites</h1>
      <p class="section-subtitle text-riad-300 mt-3">
        Choisissez votre havre de paix parmi nos {{ totalRooms() }} hébergements
      </p>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="flex flex-col lg:flex-row gap-8">

        <!-- ─── Filters sidebar ─── -->
        <aside class="lg:w-64 flex-shrink-0">
          <div class="card p-5 sticky top-20 space-y-5">
            <h2 class="font-semibold text-riad-900">Filtres</h2>

            <div>
              <label class="form-label">Type de chambre</label>
              <select [(ngModel)]="filter.type" (ngModelChange)="applyFilter()"
                      class="form-field">
                <option value="">Tous les types</option>
                @for (entry of roomTypes; track entry.value) {
                  <option [value]="entry.value">{{ entry.label }}</option>
                }
              </select>
            </div>

            <div>
              <label class="form-label">Prix max / nuit (MAD)</label>
              <input [(ngModel)]="filter.maxPrice" (ngModelChange)="applyFilter()"
                     type="number" min="0" max="10000" step="100"
                     placeholder="Ex: 3000" class="form-field">
            </div>

            <div>
              <label class="form-label">Capacité min.</label>
              <select [(ngModel)]="filter.minCapacity" (ngModelChange)="applyFilter()"
                      class="form-field">
                <option [ngValue]="undefined">Toutes</option>
                @for (n of [1,2,3,4,5]; track n) {
                  <option [value]="n">{{ n }}+ personnes</option>
                }
              </select>
            </div>

            <button (click)="resetFilter()" class="btn-ghost w-full text-sm">
              Réinitialiser les filtres
            </button>
          </div>
        </aside>

        <!-- ─── Room grid ─── -->
        <div class="flex-1">
          @if (loading()) {
            <app-loading-spinner message="Chargement des chambres…" />
          } @else if (rooms().length === 0) {
            <div class="text-center py-20 text-gray-400">
              <div class="text-5xl mb-4">🏠</div>
              <p>Aucune chambre disponible pour ces critères.</p>
              <button (click)="resetFilter()" class="btn-secondary mt-4">
                Effacer les filtres
              </button>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              @for (room of rooms(); track room.id) {
                <a [routerLink]="['/chambres', room.id]"
                   class="card group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div class="relative overflow-hidden aspect-[4/3]">
                    <div class="w-full h-full bg-gradient-to-br from-riad-100 to-riad-200
                                flex items-center justify-center text-4xl text-riad-400">
                      @if (room.coverPhotoUrl) {
                        <img [src]="room.coverPhotoUrl" [alt]="room.name"
                             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                      } @else {
                        🏡
                      }
                    </div>
                    <div class="absolute top-3 left-3 flex gap-2">
                      <span class="badge bg-riad-700 text-white">{{ room.typeName }}</span>
                      @if (!room.available) {
                        <span class="badge bg-red-100 text-red-700">Indisponible</span>
                      }
                    </div>
                  </div>
                  <div class="p-5">
                    <div class="flex items-start justify-between mb-2">
                      <h3 class="font-display font-semibold text-riad-900">{{ room.name }}</h3>
                      <div class="text-right ml-2">
                        <span class="text-riad-600 font-bold text-sm">{{ room.pricePerNight | number }} MAD</span>
                        <span class="text-gray-400 text-xs block">/ nuit</span>
                      </div>
                    </div>
                    <p class="text-gray-500 text-sm line-clamp-2 mb-3">{{ room.description }}</p>
                    <div class="flex items-center gap-3 text-xs text-gray-400 border-t pt-3">
                      <span>👥 {{ room.capacity }}</span>
                      <span>📐 {{ room.surface }} m²</span>
                      <span class="ml-auto text-riad-600 font-medium text-sm">Voir →</span>
                    </div>
                  </div>
                </a>
              }
            </div>

            <!-- Pagination -->
            @if (totalPages() > 1) {
              <div class="flex items-center justify-center gap-3 mt-10">
                <button (click)="goToPage(currentPage() - 1)"
                        [disabled]="currentPage() === 0"
                        class="btn-secondary btn-sm">←</button>
                <span class="text-sm text-gray-500">
                  Page {{ currentPage() + 1 }} / {{ totalPages() }}
                </span>
                <button (click)="goToPage(currentPage() + 1)"
                        [disabled]="currentPage() + 1 >= totalPages()"
                        class="btn-secondary btn-sm">→</button>
              </div>
            }
          }
        </div>
      </div>
    </div>
  </div>
  `,
})
export class RoomListComponent implements OnInit {
  private readonly roomService = inject(RoomService);
  private readonly route       = inject(ActivatedRoute);

  readonly rooms        = signal<Room[]>([]);
  readonly loading      = signal(true);
  readonly totalRooms   = signal(0);
  readonly totalPages   = signal(0);
  readonly currentPage  = signal(0);

  readonly roomTypes = (Object.keys(ROOM_TYPE_LABELS) as RoomType[]).map(k => ({
    value: k, label: ROOM_TYPE_LABELS[k],
  }));

  filter: { type?: string; maxPrice?: number; minCapacity?: number } = {};

  ngOnInit() {
    // Read query params for quick search from home
    const q = this.route.snapshot.queryParams;
    if (q['checkIn'] && q['checkOut']) {
      this.loadAvailable(q['checkIn'], q['checkOut'], +q['guests'] || 1);
    } else {
      this.loadRooms();
    }
  }

  applyFilter() {
    this.currentPage.set(0);
    this.loadRooms();
  }

  resetFilter() {
    this.filter = {};
    this.currentPage.set(0);
    this.loadRooms();
  }

  goToPage(p: number) {
    this.currentPage.set(p);
    this.loadRooms();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private loadRooms() {
    this.loading.set(true);
    this.roomService.getAll(
      { page: this.currentPage(), size: 9 },
      { type: this.filter.type as any, maxPrice: this.filter.maxPrice, minCapacity: this.filter.minCapacity }
    ).subscribe({
      next: res => {
        this.rooms.set(res.data.content);
        this.totalRooms.set(res.data.totalElements);
        this.totalPages.set(res.data.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadAvailable(checkIn: string, checkOut: string, guests: number) {
    this.loading.set(true);
    this.roomService.getAvailable(checkIn, checkOut, guests).subscribe({
      next: res => {
        this.rooms.set(res.data);
        this.totalRooms.set(res.data.length);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.loadRooms(); },
    });
  }
}
