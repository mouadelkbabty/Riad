import { Routes } from '@angular/router';
import { authGuard } from './core/guards';
import { adminGuard } from './core/guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Riad Lee — Accueil',
  },
  {
    path: 'chambres',
    loadComponent: () =>
      import('./features/rooms/room-list/room-list.component').then(m => m.RoomListComponent),
    title: 'Nos Chambres — Riad Lee',
  },
  {
    path: 'chambres/:id',
    loadComponent: () =>
      import('./features/rooms/room-detail/room-detail.component').then(m => m.RoomDetailComponent),
    title: 'Chambre — Riad Lee',
  },
  {
    path: 'reserver',
    loadComponent: () =>
      import('./features/reservations/create-reservation/create-reservation.component').then(m => m.CreateReservationComponent),
    title: 'Demande de réservation — Riad Dar Atlas',
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact — Riad Lee',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Connexion — Riad Lee',
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
    title: 'Page introuvable — Riad Lee',
  },
];
