import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService  = inject(AuthService);
  const toastService = inject(ToastService);
  const router       = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/')) {
        // Try to refresh token
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap(res => {
              isRefreshing = false;
              const newToken = res.data.accessToken;
              refreshTokenSubject.next(newToken);
              return next(req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              }));
            }),
            catchError(err => {
              isRefreshing = false;
              authService.logout();
              return throwError(() => err);
            })
          );
        } else {
          // Wait for the ongoing refresh
          return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(token =>
              next(req.clone({
                setHeaders: { Authorization: `Bearer ${token!}` }
              }))
            )
          );
        }
      }

      if (error.status === 403) {
        toastService.error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
        router.navigate(['/']);
      } else if (error.status === 0) {
        toastService.error('Impossible de contacter le serveur. Vérifiez votre connexion.');
      } else if (error.status >= 500) {
        toastService.error('Une erreur serveur est survenue. Veuillez réessayer.');
      }

      return throwError(() => error);
    })
  );
};
