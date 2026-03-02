import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div class="mb-6 text-8xl font-display font-bold text-riad-200">404</div>
      <h1 class="text-3xl font-display font-semibold text-riad-900 mb-3">
        Page introuvable
      </h1>
      <p class="text-gray-500 mb-8 max-w-md">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <a routerLink="/" class="btn-primary btn-lg">
        Retour à l'accueil
      </a>
    </div>
  `,
})
export class NotFoundComponent {}
