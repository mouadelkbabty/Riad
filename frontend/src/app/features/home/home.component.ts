import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomService } from '../../core/services/room.service';
import { PhotoService } from '../../core/services/photo.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { Room } from '../../core/models';
import { I18nService } from '../../core/services/i18n.service';
import { format, addDays } from 'date-fns';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
  <!-- ══════════ HERO ══════════ -->
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-riad-950 via-riad-900 to-riad-800">
      <div class="absolute inset-0 opacity-20"
           style="background-image: url('/assets/patterns/zellige.svg');
                  background-size: 120px;"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 text-center px-4 max-w-4xl mx-auto">
      <p class="text-riad-400 text-sm font-medium tracking-[0.3em] uppercase mb-4">
        {{ i18n.t.home.heroSubtitle }}
      </p>
      <h1 class="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
        Riad Dar Atlas
      </h1>
      <p class="text-riad-200 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
        {{ i18n.t.home.heroDesc }}
      </p>

      <!-- Quick search bar -->
      <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20 max-w-3xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div class="md:col-span-1">
            <label class="block text-xs text-riad-300 mb-1">{{ i18n.t.home.checkIn }}</label>
            <input type="date" [(ngModel)]="search.checkIn"
                   [min]="today"
                   class="w-full bg-white/20 text-white rounded-lg px-3 py-2 text-sm
                          border border-white/30 focus:outline-none focus:ring-2 focus:ring-riad-400
                          placeholder-riad-300">
          </div>
          <div class="md:col-span-1">
            <label class="block text-xs text-riad-300 mb-1">{{ i18n.t.home.checkOut }}</label>
            <input type="date" [(ngModel)]="search.checkOut"
                   [min]="search.checkIn || today"
                   class="w-full bg-white/20 text-white rounded-lg px-3 py-2 text-sm
                          border border-white/30 focus:outline-none focus:ring-2 focus:ring-riad-400">
          </div>
          <div class="md:col-span-1">
            <label class="block text-xs text-riad-300 mb-1">{{ i18n.t.home.guests }}</label>
            <select [(ngModel)]="search.guests"
                    class="w-full bg-white/20 text-white rounded-lg px-3 py-2 text-sm
                           border border-white/30 focus:outline-none focus:ring-2 focus:ring-riad-400">
              @for (n of [1,2,3,4,5,6]; track n) {
                <option [value]="n" class="text-gray-900">
                  {{ n }} {{ n > 1 ? i18n.t.home.persons : i18n.t.home.person }}
                </option>
              }
            </select>
          </div>
          <div>
            <label class="block text-xs text-transparent mb-1">Go</label>
            <button (click)="searchRooms()" class="btn-primary w-full btn-lg justify-center">
              {{ i18n.t.home.search }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
      <svg class="w-6 h-6 text-riad-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 9l-7 7-7-7"/>
      </svg>
    </div>
  </section>

  <!-- ══════════ VALUES STRIP ══════════ -->
  <section class="bg-riad-600 py-8">
    <div class="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
      @for (val of values(); track val.icon) {
        <div class="text-white">
          <div class="text-3xl mb-1">{{ val.icon }}</div>
          <div class="font-semibold text-sm">{{ val.label }}</div>
          <div class="text-riad-200 text-xs mt-0.5">{{ val.desc }}</div>
        </div>
      }
    </div>
  </section>

  <!-- ══════════ FEATURED ROOMS ══════════ -->
  <section class="py-24 px-4 max-w-7xl mx-auto">
    <h2 class="section-title">{{ i18n.t.home.featuredRooms }}</h2>
    <p class="section-subtitle">{{ i18n.t.home.featuredRoomsDesc }}</p>

    <div class="divider-ornament mt-8 mb-12">
      <span class="text-2xl">✦</span>
    </div>

    @if (loadingRooms()) {
      <app-loading-spinner [message]="i18n.t.common.loading" />
    } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        @for (room of featuredRooms(); track room.id) {
          <a [routerLink]="['/chambres', room.id]"
             class="card group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1
                    dark:bg-gray-800 dark:hover:shadow-gray-900/60">
            <!-- Room image -->
            <div class="relative overflow-hidden aspect-[4/3]">
              <div class="w-full h-full bg-gradient-to-br from-riad-200 to-riad-300
                          dark:from-gray-700 dark:to-gray-600
                          flex items-center justify-center text-riad-500 text-4xl font-display">
                @if (getCoverPhotoUrl(room)) {
                  <img [src]="getCoverPhotoUrl(room)" [alt]="room.name"
                       class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                } @else {
                  🏡
                }
              </div>
              <div class="absolute top-3 left-3">
                <span class="badge bg-riad-600 text-white text-xs">
                  {{ room.typeName }}
                </span>
              </div>
            </div>
            <!-- Info -->
            <div class="p-5">
              <div class="flex items-start justify-between mb-2">
                <h3 class="font-display font-semibold text-lg text-riad-900 dark:text-riad-200">{{ room.name }}</h3>
                <div class="text-right flex-shrink-0 ml-2">
                  <span class="text-riad-600 dark:text-riad-400 font-bold">{{ room.pricePerNight | number }} MAD</span>
                  <span class="text-gray-400 dark:text-gray-500 text-xs block">{{ i18n.t.rooms.perNight }}</span>
                </div>
              </div>
              <p class="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">{{ getRoomDescription(room) }}</p>
              <div class="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                <span>👥 {{ room.capacity }}</span>
                <span>📐 {{ room.surface }} m²</span>
                <span>✨ {{ room.amenities.length }}</span>
              </div>
            </div>
          </a>
        }
      </div>
      <div class="text-center mt-12">
        <a routerLink="/chambres" class="btn-secondary btn-lg">
          {{ i18n.t.home.viewAll }}
        </a>
      </div>
    }
  </section>

  <!-- ══════════ GALLERY STRIP ══════════ -->
  <section class="bg-riad-950 dark:bg-gray-950 py-20">
    <div class="max-w-7xl mx-auto px-4">
      <h2 class="section-title text-white">Galerie</h2>
      <div class="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
        @for (photo of galleryPhotos(); track photo.id; let i = $index) {
          <div class="overflow-hidden rounded-xl aspect-square"
               [class.md:col-span-2]="i === 0"
               [class.md:row-span-2]="i === 0">
            <div class="w-full h-full bg-riad-800 flex items-center justify-center text-riad-600 text-2xl">
              @if (photo.fileUrl) {
                <img [src]="photo.fileUrl" [alt]="photo.altText"
                     class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
              } @else {
                🏛️
              }
            </div>
          </div>
        }
        @if (galleryPhotos().length === 0 && !loadingGallery()) {
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="overflow-hidden rounded-xl aspect-square bg-riad-800 flex items-center
                        justify-center text-4xl" [class.md:col-span-2]="i === 1">
              🕌
            </div>
          }
        }
      </div>
    </div>
  </section>

  <!-- ══════════ HOW TO BOOK ══════════ -->
  <section class="py-20 px-4 bg-riad-50 dark:bg-gray-900">
    <div class="max-w-5xl mx-auto text-center">
      <h2 class="section-title">{{ i18n.t.home.howItWorks }}</h2>
      <p class="section-subtitle">{{ i18n.t.home.howItWorksDesc }}</p>

      <div class="divider-ornament mt-6 mb-12">
        <span class="text-2xl">✦</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="card p-8 text-center">
          <div class="w-14 h-14 rounded-full bg-riad-100 dark:bg-riad-900 text-riad-600 dark:text-riad-300 flex items-center justify-center text-2xl mx-auto mb-4">1</div>
          <h3 class="font-display font-semibold text-lg text-riad-900 dark:text-riad-200 mb-2">{{ i18n.t.home.step1Title }}</h3>
          <p class="text-gray-500 dark:text-gray-400 text-sm">{{ i18n.t.home.step1Desc }}</p>
        </div>
        <div class="card p-8 text-center">
          <div class="w-14 h-14 rounded-full bg-riad-100 dark:bg-riad-900 text-riad-600 dark:text-riad-300 flex items-center justify-center text-2xl mx-auto mb-4">2</div>
          <h3 class="font-display font-semibold text-lg text-riad-900 dark:text-riad-200 mb-2">{{ i18n.t.home.step2Title }}</h3>
          <p class="text-gray-500 dark:text-gray-400 text-sm">{{ i18n.t.home.step2Desc }}</p>
        </div>
        <div class="card p-8 text-center">
          <div class="w-14 h-14 rounded-full bg-riad-100 dark:bg-riad-900 text-riad-600 dark:text-riad-300 flex items-center justify-center text-2xl mx-auto mb-4">3</div>
          <h3 class="font-display font-semibold text-lg text-riad-900 dark:text-riad-200 mb-2">{{ i18n.t.home.step3Title }}</h3>
          <p class="text-gray-500 dark:text-gray-400 text-sm">{{ i18n.t.home.step3Desc }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ══════════ CTA ══════════ -->
  <section class="py-24 px-4 text-center max-w-3xl mx-auto">
    <h2 class="section-title mb-4">{{ i18n.t.home.ctaTitle }}</h2>
    <p class="text-gray-500 dark:text-gray-400 text-lg mb-10">
      {{ i18n.t.home.ctaDesc }}
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a routerLink="/chambres" class="btn-primary btn-lg">
        {{ i18n.t.home.viewRooms }}
      </a>
    </div>
  </section>
  `,
})
export class HomeComponent implements OnInit {
  private readonly roomService  = inject(RoomService);
  private readonly photoService = inject(PhotoService);
  private readonly router       = inject(Router);
  readonly i18n                 = inject(I18nService);

  readonly featuredRooms   = signal<Room[]>([]);
  readonly galleryPhotos   = signal<any[]>([]);
  readonly loadingRooms    = signal(true);
  readonly loadingGallery  = signal(true);

  readonly today = format(new Date(), 'yyyy-MM-dd');

  readonly values = computed(() => [
    { icon: '🕌', label: this.i18n.t.home.v1Label, desc: this.i18n.t.home.v1Desc },
    { icon: '⭐', label: this.i18n.t.home.v2Label, desc: this.i18n.t.home.v2Desc },
    { icon: '🌿', label: this.i18n.t.home.v3Label, desc: this.i18n.t.home.v3Desc },
    { icon: '🍵', label: this.i18n.t.home.v4Label, desc: this.i18n.t.home.v4Desc },
  ]);

  search = {
    checkIn:  this.today,
    checkOut: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    guests:   2,
  };

  ngOnInit() {
    this.loadRooms();
    this.loadGallery();
  }

  searchRooms() {
    this.router.navigate(['/chambres'], {
      queryParams: {
        checkIn:  this.search.checkIn,
        checkOut: this.search.checkOut,
        guests:   this.search.guests,
      },
    });
  }

  getCoverPhotoUrl(room: Room): string | null {
    if (room.coverPhotoUrl) return room.coverPhotoUrl;
    const cover = (room as any).coverPhoto;
    if (cover?.fileUrl) return cover.fileUrl;
    if (room.photos?.length > 0) return room.photos[0].fileUrl;
    return null;
  }

  getRoomDescription(room: Room): string {
    const lang = this.i18n.lang();
    if (lang === 'ar' && room.descriptionAr) return room.descriptionAr;
    if (lang === 'fr' && room.descriptionFr) return room.descriptionFr;
    return room.description;
  }

  private loadRooms() {
    this.roomService.getAll({ page: 0, size: 3 }).subscribe({
      next: res => {
        this.featuredRooms.set(res.data.content);
        this.loadingRooms.set(false);
      },
      error: () => this.loadingRooms.set(false),
    });
  }

  private loadGallery() {
    this.photoService.getGallery().subscribe({
      next: res => {
        this.galleryPhotos.set(res.data.slice(0, 6));
        this.loadingGallery.set(false);
      },
      error: () => this.loadingGallery.set(false),
    });
  }
}
