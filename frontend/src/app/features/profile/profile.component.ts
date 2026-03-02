import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
  <div class="max-w-2xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-display font-bold text-riad-900 mb-8">Mon profil</h1>

    @if (authService.currentUser(); as user) {
      <div class="card p-8 space-y-6">
        <!-- Avatar -->
        <div class="flex items-center gap-5">
          <div class="w-16 h-16 rounded-full bg-riad-600 flex items-center justify-center
                      text-white text-2xl font-display font-bold flex-shrink-0">
            {{ user.firstName.charAt(0).toUpperCase() }}{{ user.lastName.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h2 class="text-xl font-display font-semibold text-riad-900">{{ user.fullName }}</h2>
            <p class="text-gray-500 text-sm">{{ user.email }}</p>
            <span class="badge mt-1"
                  [class.badge-green]="user.role === 'ADMIN'"
                  [class.badge-blue]="user.role === 'GUEST'">
              {{ user.role === 'ADMIN' ? 'Administrateur' : 'Client' }}
            </span>
          </div>
        </div>

        <hr class="border-gray-100">

        <!-- Info -->
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-gray-400 text-xs mb-1">Prénom</p>
            <p class="font-medium text-gray-800">{{ user.firstName }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs mb-1">Nom</p>
            <p class="font-medium text-gray-800">{{ user.lastName }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs mb-1">E-mail</p>
            <p class="font-medium text-gray-800">{{ user.email }}</p>
          </div>
          @if (user.phone) {
            <div>
              <p class="text-gray-400 text-xs mb-1">Téléphone</p>
              <p class="font-medium text-gray-800">{{ user.phone }}</p>
            </div>
          }
          <div>
            <p class="text-gray-400 text-xs mb-1">Membre depuis</p>
            <p class="font-medium text-gray-800">{{ user.createdAt | date:'MMMM yyyy' }}</p>
          </div>
        </div>

        <hr class="border-gray-100">

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3">
          <a routerLink="/reservations" class="btn-primary flex-1 justify-center">
            Mes réservations
          </a>
          <button (click)="logout()" class="btn-danger flex-1 justify-center">
            Se déconnecter
          </button>
        </div>
      </div>
    }
  </div>
  `,
})
export class ProfileComponent {
  readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  logout() {
    this.authService.logout();
  }
}
