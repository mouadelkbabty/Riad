import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../../core/services/room.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Room, RoomType, ROOM_TYPE_LABELS } from '../../../core/models';

@Component({
  selector: 'app-room-management',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
  <div class="max-w-7xl mx-auto px-4 py-12">
    <div class="flex items-center justify-between mb-8">
      <div>
        <a routerLink="/admin" class="text-sm text-gray-400 hover:text-riad-600 mb-1 block">← Tableau de bord</a>
        <h1 class="text-3xl font-display font-bold text-riad-900">Gestion des chambres</h1>
      </div>
      <button (click)="openForm(null)" class="btn-primary">+ Ajouter une chambre</button>
    </div>

    @if (loading()) {
      <app-loading-spinner />
    } @else {
      <div class="card overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-riad-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chambre</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix/nuit</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacité</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            @for (room of rooms(); track room.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900">{{ room.name }}</td>
                <td class="px-4 py-3 text-gray-500">{{ room.typeName }}</td>
                <td class="px-4 py-3">{{ room.pricePerNight | number }} MAD</td>
                <td class="px-4 py-3">{{ room.capacity }} pers.</td>
                <td class="px-4 py-3">
                  <span [class]="room.available ? 'badge-green' : 'badge-red'" class="badge">
                    {{ room.available ? 'Disponible' : 'Indisponible' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right flex items-center justify-end gap-2">
                  <button (click)="toggleAvailability(room)" class="btn-ghost btn-sm">
                    {{ room.available ? 'Désactiver' : 'Activer' }}
                  </button>
                  <button (click)="openForm(room)" class="btn-secondary btn-sm">Modifier</button>
                  <button (click)="deleteRoom(room)" class="btn-danger btn-sm">Supprimer</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <!-- Modal form -->
    @if (showForm()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b">
            <h2 class="font-display font-semibold text-xl text-riad-900">
              {{ editingRoom() ? 'Modifier' : 'Ajouter' }} une chambre
            </h2>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="form-label">Nom de la chambre *</label>
              <input [(ngModel)]="formData.name" type="text" class="form-field" placeholder="Chambre Jasmin">
            </div>
            <div>
              <label class="form-label">Type *</label>
              <select [(ngModel)]="formData.type" class="form-field">
                @for (t of roomTypeOptions; track t.value) {
                  <option [value]="t.value">{{ t.label }}</option>
                }
              </select>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="form-label">Prix / nuit (MAD) *</label>
                <input [(ngModel)]="formData.pricePerNight" type="number" min="0" class="form-field">
              </div>
              <div>
                <label class="form-label">Capacité *</label>
                <input [(ngModel)]="formData.capacity" type="number" min="1" max="20" class="form-field">
              </div>
              <div>
                <label class="form-label">Surface (m²)</label>
                <input [(ngModel)]="formData.surface" type="number" min="0" class="form-field">
              </div>
            </div>
            <div>
              <label class="form-label">Description</label>
              <textarea [(ngModel)]="formData.description" rows="3"
                        class="form-field resize-none" placeholder="Description de la chambre…"></textarea>
            </div>
            <div>
              <label class="form-label">Équipements (séparés par des virgules)</label>
              <input [(ngModel)]="amenitiesStr" type="text" class="form-field"
                     placeholder="WiFi, Climatisation, Vue jardin…">
            </div>
            <div class="flex items-center gap-2">
              <input type="checkbox" [(ngModel)]="formData.available" id="avail" class="rounded">
              <label for="avail" class="text-sm text-gray-700">Disponible à la réservation</label>
            </div>
          </div>
          <div class="p-6 border-t flex gap-3">
            <button (click)="showForm.set(false)" class="btn-ghost flex-1">Annuler</button>
            <button (click)="saveRoom()" [disabled]="saving()" class="btn-primary flex-1 justify-center">
              @if (saving()) {
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              } @else {
                {{ editingRoom() ? 'Modifier' : 'Créer' }}
              }
            </button>
          </div>
        </div>
      </div>
    }
  </div>
  `,
})
export class RoomManagementComponent implements OnInit {
  private readonly roomService = inject(RoomService);
  private readonly toast       = inject(ToastService);

  readonly rooms       = signal<Room[]>([]);
  readonly loading     = signal(true);
  readonly showForm    = signal(false);
  readonly saving      = signal(false);
  readonly editingRoom = signal<Room | null>(null);
  amenitiesStr = '';

  readonly roomTypeOptions = (Object.keys(ROOM_TYPE_LABELS) as RoomType[]).map(k => ({
    value: k, label: ROOM_TYPE_LABELS[k],
  }));

  formData = this.emptyForm();

  ngOnInit() { this.loadRooms(); }

  openForm(room: Room | null) {
    this.editingRoom.set(room);
    this.formData = room
      ? { ...room }
      : this.emptyForm();
    this.amenitiesStr = room ? (room.amenities || []).join(', ') : '';
    this.showForm.set(true);
  }

  saveRoom() {
    this.saving.set(true);
    const body = {
      ...this.formData,
      amenities: this.amenitiesStr.split(',').map(a => a.trim()).filter(Boolean),
    } as any;

    const op = this.editingRoom()
      ? this.roomService.update(this.editingRoom()!.id, body)
      : this.roomService.create(body);

    op.subscribe({
      next: () => {
        this.toast.success(this.editingRoom() ? 'Chambre modifiée.' : 'Chambre créée.');
        this.showForm.set(false);
        this.saving.set(false);
        this.loadRooms();
      },
      error: err => {
        this.saving.set(false);
        this.toast.error(err.error?.message ?? 'Erreur lors de la sauvegarde.');
      },
    });
  }

  toggleAvailability(room: Room) {
    this.roomService.toggleAvailability(room.id).subscribe({
      next: res => {
        this.rooms.update(list => list.map(r => r.id === room.id ? res.data : r));
        this.toast.info(`Chambre ${res.data.available ? 'activée' : 'désactivée'}.`);
      },
      error: () => this.toast.error('Impossible de modifier le statut.'),
    });
  }

  deleteRoom(room: Room) {
    if (!confirm(`Supprimer la chambre "${room.name}" ?`)) return;
    this.roomService.delete(room.id).subscribe({
      next: () => { this.rooms.update(l => l.filter(r => r.id !== room.id)); this.toast.success('Chambre supprimée.'); },
      error: err => this.toast.error(err.error?.message ?? 'Impossible de supprimer.'),
    });
  }

  private loadRooms() {
    this.loading.set(true);
    this.roomService.getAll({ page: 0, size: 100 }).subscribe({
      next: res => { this.rooms.set(res.data.content); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  private emptyForm() {
    return { name: '', type: 'STANDARD' as RoomType, pricePerNight: 800, capacity: 2, surface: 25, description: '', descriptionFr: '', available: true };
  }
}
