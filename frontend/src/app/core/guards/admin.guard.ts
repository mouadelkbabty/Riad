import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const adminGuard: CanActivateFn = () => {
  const authService  = inject(AuthService);
  const toastService = inject(ToastService);
  const router       = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  toastService.error('Accès réservé aux administrateurs.');
  router.navigate(['/']);
  return false;
};
