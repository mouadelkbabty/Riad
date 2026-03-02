import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <header [class.scrolled]="scrolled()"
      class="sticky top-0 z-50 transition-all duration-300"
      [class.bg-white]="scrolled()"
      [class.bg-transparent]="!scrolled()"
      [class.shadow-md]="scrolled()">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-3 group">
            <div class="w-9 h-9 rounded-full bg-riad-600 flex items-center justify-center
                        group-hover:bg-riad-700 transition-colors">
              <span class="text-white font-display font-bold text-sm">ر</span>
            </div>
            <span class="font-display font-semibold text-lg"
                  [class.text-white]="!scrolled()"
                  [class.text-riad-900]="scrolled()">
              Riad Dar Atlas
            </span>
          </a>

          <!-- Desktop nav -->
          <div class="hidden md:flex items-center gap-6">
            <a routerLink="/chambres" routerLinkActive="font-semibold"
               class="text-sm transition-colors hover:text-riad-500"
               [class.text-white]="!scrolled()" [class.text-gray-700]="scrolled()">
              Chambres
            </a>

            @if (auth.isLoggedIn()) {
              <a routerLink="/reservations" routerLinkActive="font-semibold"
                 class="text-sm transition-colors hover:text-riad-500"
                 [class.text-white]="!scrolled()" [class.text-gray-700]="scrolled()">
                Mes réservations
              </a>
              @if (auth.isAdmin()) {
                <a routerLink="/admin" routerLinkActive="font-semibold"
                   class="text-sm transition-colors hover:text-riad-500"
                   [class.text-white]="!scrolled()" [class.text-gray-700]="scrolled()">
                  Administration
                </a>
              }
              <!-- User menu -->
              <div class="relative">
                <button (click)="menuOpen.set(!menuOpen())"
                        class="flex items-center gap-2 text-sm font-medium rounded-full
                               bg-riad-100 text-riad-800 px-3 py-1.5 hover:bg-riad-200 transition-colors">
                  <span class="w-6 h-6 rounded-full bg-riad-600 text-white flex items-center justify-center text-xs font-bold">
                    {{ userInitial() }}
                  </span>
                  {{ auth.currentUser()?.firstName }}
                </button>
                @if (menuOpen()) {
                  <div class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100
                              py-1 animate-fade-in">
                    <a routerLink="/profil" (click)="menuOpen.set(false)"
                       class="block px-4 py-2 text-sm text-gray-700 hover:bg-riad-50">
                      Mon profil
                    </a>
                    <hr class="my-1 border-gray-100">
                    <button (click)="logout()"
                            class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      Déconnexion
                    </button>
                  </div>
                }
              </div>
            } @else {
              <a routerLink="/auth/login"
                 class="btn-secondary btn-sm">
                Connexion
              </a>
              <a routerLink="/auth/register"
                 class="btn-primary btn-sm">
                Réserver
              </a>
            }
          </div>

          <!-- Mobile hamburger -->
          <button (click)="mobileOpen.set(!mobileOpen())"
                  class="md:hidden p-2 rounded-lg"
                  [class.text-white]="!scrolled()" [class.text-gray-700]="scrolled()">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              @if (mobileOpen()) {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"/>
              } @else {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 6h16M4 12h16M4 18h16"/>
              }
            </svg>
          </button>
        </div>

        <!-- Mobile menu -->
        @if (mobileOpen()) {
          <div class="md:hidden bg-white border-t border-gray-100 py-3 space-y-1 animate-slide-up">
            <a routerLink="/chambres" (click)="mobileOpen.set(false)"
               class="block px-4 py-2 text-sm text-gray-700 hover:bg-riad-50 rounded-lg">
              Chambres
            </a>
            @if (auth.isLoggedIn()) {
              <a routerLink="/reservations" (click)="mobileOpen.set(false)"
                 class="block px-4 py-2 text-sm text-gray-700 hover:bg-riad-50 rounded-lg">
                Mes réservations
              </a>
              <a routerLink="/profil" (click)="mobileOpen.set(false)"
                 class="block px-4 py-2 text-sm text-gray-700 hover:bg-riad-50 rounded-lg">
                Mon profil
              </a>
              @if (auth.isAdmin()) {
                <a routerLink="/admin" (click)="mobileOpen.set(false)"
                   class="block px-4 py-2 text-sm text-gray-700 hover:bg-riad-50 rounded-lg">
                  Administration
                </a>
              }
              <button (click)="logout()"
                      class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                Déconnexion
              </button>
            } @else {
              <a routerLink="/auth/login" (click)="mobileOpen.set(false)"
                 class="block px-4 py-2 text-sm text-gray-700 hover:bg-riad-50 rounded-lg">
                Connexion
              </a>
              <a routerLink="/auth/register" (click)="mobileOpen.set(false)"
                 class="block px-4 py-2 text-sm font-medium text-riad-600 hover:bg-riad-50 rounded-lg">
                S'inscrire
              </a>
            }
          </div>
        }
      </nav>
    </header>
  `,
})
export class NavbarComponent {
  readonly auth       = inject(AuthService);
  readonly scrolled   = signal(false);
  readonly menuOpen   = signal(false);
  readonly mobileOpen = signal(false);

  userInitial() {
    return this.auth.currentUser()?.firstName?.charAt(0)?.toUpperCase() ?? '?';
  }

  logout() {
    this.menuOpen.set(false);
    this.mobileOpen.set(false);
    this.auth.logout();
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 40);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-menu]')) {
      this.menuOpen.set(false);
    }
  }
}
