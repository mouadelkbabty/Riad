import { Routes } from '@angular/router';
import { authGuard, guestGuard, adminGuard } from './core/guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Riad Dar Atlas — Accueil',
  },
  {
    path: 'chambres',
    loadComponent: () =>
      import('./features/rooms/room-list/room-list.component').then(m => m.RoomListComponent),
    title: 'Nos Chambres — Riad Dar Atlas',
  },
  {
    path: 'chambres/:id',
    loadComponent: () =>
      import('./features/rooms/room-detail/room-detail.component').then(m => m.RoomDetailComponent),
    title: 'Chambre — Riad Dar Atlas',
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent),
        title: 'Connexion — Riad Dar Atlas',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(m => m.RegisterComponent),
        title: 'Inscription — Riad Dar Atlas',
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        title: 'Mot de passe oublié — Riad Dar Atlas',
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
        title: 'Réinitialiser le mot de passe — Riad Dar Atlas',
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: 'reservations',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/reservations/my-reservations/my-reservations.component').then(m => m.MyReservationsComponent),
        title: 'Mes Réservations — Riad Dar Atlas',
      },
      {
        path: 'nouvelle',
        loadComponent: () =>
          import('./features/reservations/create-reservation/create-reservation.component').then(m => m.CreateReservationComponent),
        title: 'Nouvelle Réservation — Riad Dar Atlas',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/reservations/reservation-detail/reservation-detail.component').then(m => m.ReservationDetailComponent),
        title: 'Détails Réservation — Riad Dar Atlas',
      },
    ],
  },
  {
    path: 'profil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then(m => m.ProfileComponent),
    title: 'Mon Profil — Riad Dar Atlas',
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Tableau de bord — Administration',
      },
      {
        path: 'chambres',
        loadComponent: () =>
          import('./features/admin/room-management/room-management.component').then(m => m.RoomManagementComponent),
        title: 'Gestion Chambres — Administration',
      },
      {
        path: 'reservations',
        loadComponent: () =>
          import('./features/admin/reservation-management/reservation-management.component').then(m => m.ReservationManagementComponent),
        title: 'Gestion Réservations — Administration',
      },
      {
        path: 'galerie',
        loadComponent: () =>
          import('./features/admin/gallery-management/gallery-management.component').then(m => m.GalleryManagementComponent),
        title: 'Gestion Galerie — Administration',
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page introuvable — Riad Dar Atlas',
  },
];
