import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
  <div class="min-h-screen flex items-center justify-center px-4 py-16 bg-riad-50">
    <div class="w-full max-w-md">
      <!-- Card -->
      <div class="card p-8">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-14 h-14 rounded-full bg-riad-600 flex items-center justify-center mx-auto mb-3">
            <span class="text-white font-display text-xl font-bold">ر</span>
          </div>
          <h1 class="text-2xl font-display font-semibold text-riad-900">Bienvenue</h1>
          <p class="text-gray-500 text-sm mt-1">Connectez-vous à votre compte</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
          <div>
            <label class="form-label">Adresse e-mail</label>
            <input formControlName="email" type="email" autocomplete="email"
                   placeholder="vous@exemple.com"
                   class="form-field"
                   [class.border-red-400]="submitted && form.get('email')?.invalid">
            @if (submitted && form.get('email')?.hasError('required')) {
              <p class="form-error">L'e-mail est requis</p>
            }
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="form-label mb-0">Mot de passe</label>
              <a routerLink="/auth/forgot-password"
                 class="text-xs text-riad-600 hover:underline">
                Mot de passe oublié ?
              </a>
            </div>
            <input formControlName="password" type="password" autocomplete="current-password"
                   placeholder="••••••••"
                   class="form-field"
                   [class.border-red-400]="submitted && form.get('password')?.invalid">
            @if (submitted && form.get('password')?.hasError('required')) {
              <p class="form-error">Le mot de passe est requis</p>
            }
          </div>

          @if (errorMsg()) {
            <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {{ errorMsg() }}
            </div>
          }

          <button type="submit" [disabled]="loading()"
                  class="btn-primary w-full justify-center py-3">
            @if (loading()) {
              <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Connexion…
            } @else {
              Se connecter
            }
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?
          <a routerLink="/auth/register" class="text-riad-600 font-medium hover:underline">
            S'inscrire
          </a>
        </p>
      </div>
    </div>
  </div>
  `,
})
export class LoginComponent {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast       = inject(ToastService);
  private readonly router      = inject(Router);
  private readonly route       = inject(ActivatedRoute);

  readonly loading  = signal(false);
  readonly errorMsg = signal('');
  submitted = false;

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit() {
    this.submitted = true;
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.errorMsg.set('');

    this.authService.login(this.form.getRawValue() as any).subscribe({
      next: () => {
        this.toast.success('Connexion réussie. Bienvenue !');
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: err => {
        this.loading.set(false);
        this.errorMsg.set(
          err.error?.message ?? 'Identifiants incorrects. Veuillez réessayer.'
        );
      },
    });
  }
}
