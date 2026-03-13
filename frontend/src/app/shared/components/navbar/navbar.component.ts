import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { I18nService, Language } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <header [class.scrolled]="scrolled()"
      class="sticky top-0 z-50 transition-all duration-300"
      [class.bg-white]="scrolled() && theme.theme() === 'light'"
      [class.bg-gray-900]="scrolled() && theme.theme() === 'dark'"
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
              [class.text-riad-900]="theme.theme() === 'light'"
              [class.text-riad-200]="scrolled() && theme.theme() === 'dark'"
              [class.text-white]="!scrolled() && theme.theme() === 'dark'">
              Riad Lee
            </span>
          </a>

          <!-- Desktop nav -->
          <div class="hidden md:flex items-center gap-4">
            <a routerLink="/chambres" routerLinkActive="font-semibold"
               class="text-sm transition-colors hover:text-riad-400"
               [class.text-gray-700]="theme.theme() === 'light'"
               [class.text-white]="!scrolled() && theme.theme() === 'dark'"
               [class.text-gray-300]="scrolled() && theme.theme() === 'dark'">
              {{ i18n.t.nav.rooms }}
            </a>

            <!-- Language switcher -->
            <div class="relative" data-menu>
              <button (click)="langOpen.set(!langOpen())"
                       class="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors
                         hover:bg-black/10 dark:hover:bg-white/10"
                       [class.text-gray-700]="theme.theme() === 'light'"
                       [class.text-white]="!scrolled() && theme.theme() === 'dark'"
                       [class.text-gray-300]="scrolled() && theme.theme() === 'dark'">
                <span>{{ currentLangLabel() }}</span>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              @if (langOpen()) {
                <div class="absolute right-0 mt-2 w-28 bg-white dark:bg-gray-800 rounded-xl shadow-xl
                            border border-gray-100 dark:border-gray-700 py-1 animate-fade-in z-50">
                  @for (lang of langs; track lang.code) {
                    <button (click)="setLang(lang.code)"
                            class="w-full text-left px-4 py-2 text-sm hover:bg-riad-50 dark:hover:bg-gray-700
                                   flex items-center gap-2"
                            [class.font-semibold]="i18n.lang() === lang.code"
                            [class.text-riad-600]="i18n.lang() === lang.code"
                            [class.text-gray-700]="i18n.lang() !== lang.code && theme.theme() === 'light'"
                            [class.text-gray-300]="i18n.lang() !== lang.code && theme.theme() === 'dark'">
                      <span>{{ lang.flag }}</span>
                      <span>{{ lang.label }}</span>
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Dark mode toggle -->
                <button (click)="theme.toggle()"
                  class="p-2 rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                  [class.text-gray-700]="theme.theme() === 'light'"
                  [class.text-white]="!scrolled() && theme.theme() === 'dark'"
                  [class.text-gray-300]="scrolled() && theme.theme() === 'dark'"
                  [title]="i18n.t.nav.toggleDark">
              @if (theme.theme() === 'dark') {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
                </svg>
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
              }
            </button>

            @if (auth.isLoggedIn() && auth.isAdmin()) {
                <a routerLink="/admin" routerLinkActive="font-semibold"
                  class="text-sm transition-colors hover:text-riad-400"
                  [class.text-gray-700]="theme.theme() === 'light'"
                  [class.text-white]="!scrolled() && theme.theme() === 'dark'"
                  [class.text-gray-300]="scrolled() && theme.theme() === 'dark'">
                {{ i18n.t.nav.admin }}
              </a>
              <!-- Admin menu -->
              <div class="relative" data-menu>
                <button (click)="menuOpen.set(!menuOpen())"
                        class="flex items-center gap-2 text-sm font-medium rounded-full
                               bg-riad-100 text-riad-800 px-3 py-1.5 hover:bg-riad-200 transition-colors
                               dark:bg-riad-900 dark:text-riad-200 dark:hover:bg-riad-800">
                  <span class="w-6 h-6 rounded-full bg-riad-600 text-white flex items-center justify-center text-xs font-bold">
                    {{ userInitial() }}
                  </span>
                  {{ auth.currentUser()?.firstName }}
                </button>
                @if (menuOpen()) {
                  <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl
                              border border-gray-100 dark:border-gray-700 py-1 animate-fade-in">
                    <button (click)="logout()"
                            class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      {{ i18n.t.nav.logout }}
                    </button>
                  </div>
                }
              </div>
            } @else {
              <a routerLink="/chambres" class="btn-primary btn-sm">
                {{ i18n.t.nav.book }}
              </a>
            }
          </div>

          <!-- Mobile: dark + hamburger -->
          <div class="md:hidden flex items-center gap-2">
            <!-- Mobile dark toggle -->
                <button (click)="theme.toggle()"
                  class="p-2 rounded-lg transition-colors"
                  [class.text-gray-700]="theme.theme() === 'light'"
                  [class.text-white]="!scrolled() && theme.theme() === 'dark'"
                  [class.text-gray-300]="scrolled() && theme.theme() === 'dark'">
              @if (theme.theme() === 'dark') {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
                </svg>
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
              }
            </button>

                <button (click)="mobileOpen.set(!mobileOpen())"
                  class="p-2 rounded-lg"
                  [class.text-gray-700]="theme.theme() === 'light'"
                  [class.text-white]="!scrolled() && theme.theme() === 'dark'"
                  [class.text-gray-300]="scrolled() && theme.theme() === 'dark'">
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
        </div>

        <!-- Mobile menu -->
        @if (mobileOpen()) {
          <div class="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 py-3 space-y-1 animate-slide-up">
            <a routerLink="/chambres" (click)="mobileOpen.set(false)"
               class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-riad-50 dark:hover:bg-gray-800 rounded-lg">
              {{ i18n.t.nav.rooms }}
            </a>
            <!-- Language selection -->
            <div class="px-4 py-2 flex items-center gap-2">
              @for (lang of langs; track lang.code) {
                <button (click)="setLang(lang.code)"
                        class="px-2 py-1 rounded text-xs font-medium transition-colors"
                        [class.bg-riad-600]="i18n.lang() === lang.code"
                        [class.text-white]="i18n.lang() === lang.code"
                        [class.text-gray-600]="i18n.lang() !== lang.code && theme.theme() === 'light'"
                        [class.text-gray-400]="i18n.lang() !== lang.code && theme.theme() === 'dark'"
                        [class.hover:bg-riad-100]="i18n.lang() !== lang.code">
                  {{ lang.flag }} {{ lang.code.toUpperCase() }}
                </button>
              }
            </div>
            @if (auth.isLoggedIn() && auth.isAdmin()) {
              <a routerLink="/admin" (click)="mobileOpen.set(false)"
                 class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-riad-50 dark:hover:bg-gray-800 rounded-lg">
                {{ i18n.t.nav.admin }}
              </a>
              <button (click)="logout()"
                      class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                {{ i18n.t.nav.logout }}
              </button>
            }
          </div>
        }
      </nav>
    </header>
  `,
})
export class NavbarComponent {
  readonly auth       = inject(AuthService);
  readonly theme      = inject(ThemeService);
  readonly i18n       = inject(I18nService);
  readonly scrolled   = signal(false);
  readonly menuOpen   = signal(false);
  readonly mobileOpen = signal(false);
  readonly langOpen   = signal(false);

  readonly langs = [
    { code: 'fr' as Language, label: 'Français', flag: '🇫🇷' },
    { code: 'en' as Language, label: 'English',  flag: '🇬🇧' },
    { code: 'ar' as Language, label: 'العربية',  flag: '🇲🇦' },
  ];

  currentLangLabel() {
    return this.langs.find(l => l.code === this.i18n.lang())?.flag ?? '🌐';
  }

  setLang(lang: Language) {
    this.i18n.setLang(lang);
    this.langOpen.set(false);
    this.mobileOpen.set(false);
  }

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
      this.langOpen.set(false);
    }
  }
}
