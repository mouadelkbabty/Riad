import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-riad-950 text-riad-200 mt-24">
      <!-- Zellige pattern strip -->
      <div class="h-2 bg-gradient-to-r from-riad-600 via-terracotta-500 to-morocco-gold"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
          <!-- Brand -->
          <div>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-full bg-riad-600 flex items-center justify-center">
                <span class="text-white font-display font-bold">ر</span>
              </div>
              <span class="font-display text-xl text-white">Riad Dar Atlas</span>
            </div>
            <p class="text-sm leading-relaxed text-riad-400">
              Une demeure ancestrale au cœur de la médina, alliant
              architecture traditionnelle et confort moderne.
            </p>
            <p class="mt-4 text-sm text-riad-400 font-arabic">
              دار الأطلس — بيت أصيل في قلب المدينة
            </p>
          </div>

          <!-- Quick links -->
          <div>
            <h3 class="text-white font-semibold mb-4">Navigation</h3>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/"            class="hover:text-riad-400 transition-colors">Accueil</a></li>
              <li><a routerLink="/chambres"     class="hover:text-riad-400 transition-colors">Nos Chambres</a></li>
              <li><a routerLink="/reservations" class="hover:text-riad-400 transition-colors">Réservations</a></li>
              <li><a routerLink="/auth/login"   class="hover:text-riad-400 transition-colors">Connexion</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h3 class="text-white font-semibold mb-4">Contact</h3>
            <ul class="space-y-2 text-sm text-riad-400">
              <li class="flex items-start gap-2">
                <span>📍</span>
                <span>Derb Zitoun El Kedim, Médina<br>Marrakech 40000, Maroc</span>
              </li>
              <li class="flex items-center gap-2">
                <span>📞</span>
                <a href="tel:+212524000000" class="hover:text-riad-300 transition-colors">
                  +212 524 000 000
                </a>
              </li>
              <li class="flex items-center gap-2">
                <span>✉️</span>
                <a href="mailto:contact@riad-daratlas.ma" class="hover:text-riad-300 transition-colors">
                  contact&#64;riad-daratlas.ma
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom bar -->
        <div class="border-t border-riad-800 mt-12 pt-8 flex flex-col sm:flex-row
                    items-center justify-between gap-4 text-xs text-riad-500">
          <p>© {{ year }} Riad Dar Atlas. Tous droits réservés.</p>
          <p>Conçu avec ❤️ au Maroc</p>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
