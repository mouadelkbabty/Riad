import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhotoService } from '../../../core/services/photo.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Photo } from '../../../core/models';

@Component({
  selector: 'app-gallery-management',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
  <div class="max-w-7xl mx-auto px-4 py-12">
    <div class="flex items-center justify-between mb-8">
      <div>
        <a routerLink="/admin" class="text-sm text-gray-400 hover:text-riad-600 mb-1 block">← Tableau de bord</a>
        <h1 class="text-3xl font-display font-bold text-riad-900">Gestion de la galerie</h1>
      </div>
    </div>

    <!-- Upload form -->
    <div class="card p-6 mb-8">
      <h2 class="font-semibold text-riad-900 mb-4">Ajouter une photo</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="md:col-span-1">
          <label class="form-label">Photo *</label>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif"
                 (change)="onFileSelect($event)"
                 class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0 file:bg-riad-100 file:text-riad-700
                        file:font-medium hover:file:bg-riad-200 cursor-pointer">
        </div>
        <div>
          <label class="form-label">Texte alternatif *</label>
          <input [(ngModel)]="upload.altText" type="text" class="form-field"
                 placeholder="Description de la photo">
        </div>
        <div>
          <label class="form-label">Légende (optionnel)</label>
          <input [(ngModel)]="upload.caption" type="text" class="form-field"
                 placeholder="Légende affichée">
        </div>
      </div>
      <button (click)="uploadPhoto()" [disabled]="!upload.file || uploading()"
              class="btn-primary mt-4">
        @if (uploading()) {
          <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          Envoi en cours…
        } @else {
          Télécharger la photo
        }
      </button>
    </div>

    <!-- Gallery grid -->
    @if (loading()) {
      <app-loading-spinner />
    } @else {
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        @for (photo of photos(); track photo.id) {
          <div class="group relative aspect-square rounded-xl overflow-hidden bg-riad-100">
            <img [src]="photo.fileUrl" [alt]="photo.altText"
                 class="w-full h-full object-cover">
            <!-- Overlay -->
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                        transition-opacity flex flex-col items-center justify-center gap-2">
              <p class="text-white text-xs px-2 text-center truncate w-full px-3">
                {{ photo.altText }}
              </p>
              <button (click)="deletePhoto(photo)"
                      class="text-white text-xs bg-red-600 px-3 py-1 rounded-lg hover:bg-red-700">
                Supprimer
              </button>
            </div>
          </div>
        }
        @if (photos().length === 0) {
          <div class="col-span-full text-center py-16 text-gray-400">
            <div class="text-4xl mb-3">🖼️</div>
            <p>Aucune photo dans la galerie.</p>
          </div>
        }
      </div>
    }
  </div>
  `,
})
export class GalleryManagementComponent implements OnInit {
  private readonly photoService = inject(PhotoService);
  private readonly toast        = inject(ToastService);

  readonly photos    = signal<Photo[]>([]);
  readonly loading   = signal(true);
  readonly uploading = signal(false);

  upload = { file: null as File | null, altText: '', caption: '' };

  ngOnInit() { this.loadPhotos(); }

  onFileSelect(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.upload.file = file;
  }

  uploadPhoto() {
    if (!this.upload.file || !this.upload.altText) {
      this.toast.warning('Sélectionnez un fichier et remplissez le texte alternatif.');
      return;
    }
    this.uploading.set(true);
    this.photoService.upload(this.upload.file, this.upload.altText, this.upload.caption || undefined)
      .subscribe({
        next: res => {
          this.photos.update(p => [res.data, ...p]);
          this.upload = { file: null, altText: '', caption: '' };
          this.uploading.set(false);
          this.toast.success('Photo ajoutée à la galerie.');
        },
        error: err => {
          this.uploading.set(false);
          this.toast.error(err.error?.message ?? 'Erreur lors du téléchargement.');
        },
      });
  }

  deletePhoto(photo: Photo) {
    if (!confirm('Supprimer cette photo ?')) return;
    this.photoService.delete(photo.id).subscribe({
      next: () => { this.photos.update(p => p.filter(x => x.id !== photo.id)); this.toast.success('Photo supprimée.'); },
      error: () => this.toast.error('Impossible de supprimer.'),
    });
  }

  private loadPhotos() {
    this.photoService.getGallery().subscribe({
      next: res => { this.photos.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
