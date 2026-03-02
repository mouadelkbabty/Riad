import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
  <div class="min-h-screen flex items-center justify-center px-4 py-16 bg-riad-50">
    <div class="w-full max-w-md">
      <div class="card p-8">
        <div class="text-center mb-8">
          <div class="w-14 h-14 rounded-full bg-riad-100 flex items-center justify-center mx-auto mb-3 text-3xl">
            🔑
          </div>
          <h1 class="text-2xl font-display font-semibold text-riad-900">Mot de passe oublié</h1>
          <p class="text-gray-500 text-sm mt-2">
            Entrez votre e-mail et nous vous enverrons un lien de réinitialisation.
          </p>
        </div>

        @if (!sent()) {
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
            <div>
              <label class="form-label">Adresse e-mail</label>
              <input formControlName="email" type="email" placeholder="vous@exemple.com"
                     class="form-field">
            </div>
            <button type="submit" [disabled]="loading()"
                    class="btn-primary w-full justify-center py-3">
              @if (loading()) {
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              } @else {
                Envoyer le lien
              }
            </button>
          </form>
        } @else {
          <div class="text-center">
            <div class="text-5xl mb-4">📧</div>
            <h2 class="font-semibold text-gray-800 mb-2">E-mail envoyé !</h2>
            <p class="text-gray-500 text-sm">
              Si un compte correspond à cette adresse, vous recevrez un lien
              de réinitialisation dans quelques minutes.
            </p>
          </div>
        }

        <p class="text-center text-sm text-gray-500 mt-6">
          <a routerLink="/auth/login" class="text-riad-600 hover:underline">
            ← Retour à la connexion
          </a>
        </p>
      </div>
    </div>
  </div>
  `,
})
export class ForgotPasswordComponent {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly sent    = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.authService.forgotPassword(this.form.getRawValue() as any).subscribe({
      next:  () => { this.loading.set(false); this.sent.set(true); },
      error: () => { this.loading.set(false); this.sent.set(true); }, // anti-enumeration
    });
  }
}
