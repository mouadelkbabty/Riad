import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
  <div class="min-h-screen flex items-center justify-center px-4 py-16 bg-riad-50">
    <div class="w-full max-w-md">
      <div class="card p-8">
        <div class="text-center mb-8">
          <div class="w-14 h-14 rounded-full bg-riad-600 flex items-center justify-center mx-auto mb-3">
            <span class="text-white font-display text-xl font-bold">ر</span>
          </div>
          <h1 class="text-2xl font-display font-semibold text-riad-900">Créer un compte</h1>
          <p class="text-gray-500 text-sm mt-1">Rejoignez la famille Dar Atlas</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Prénom</label>
              <input formControlName="firstName" type="text" autocomplete="given-name"
                     placeholder="Prénom" class="form-field"
                     [class.border-red-400]="submitted && form.get('firstName')?.invalid">
              @if (submitted && form.get('firstName')?.hasError('required')) {
                <p class="form-error">Requis</p>
              }
            </div>
            <div>
              <label class="form-label">Nom</label>
              <input formControlName="lastName" type="text" autocomplete="family-name"
                     placeholder="Nom" class="form-field"
                     [class.border-red-400]="submitted && form.get('lastName')?.invalid">
              @if (submitted && form.get('lastName')?.hasError('required')) {
                <p class="form-error">Requis</p>
              }
            </div>
          </div>

          <div>
            <label class="form-label">Adresse e-mail</label>
            <input formControlName="email" type="email" autocomplete="email"
                   placeholder="vous@exemple.com" class="form-field"
                   [class.border-red-400]="submitted && form.get('email')?.invalid">
            @if (submitted && form.get('email')?.hasError('required')) {
              <p class="form-error">L'e-mail est requis</p>
            }
            @if (submitted && form.get('email')?.hasError('email')) {
              <p class="form-error">E-mail invalide</p>
            }
          </div>

          <div>
            <label class="form-label">Téléphone (optionnel)</label>
            <input formControlName="phone" type="tel" autocomplete="tel"
                   placeholder="+212 6XX XX XX XX" class="form-field">
          </div>

          <div>
            <label class="form-label">Mot de passe</label>
            <input formControlName="password" type="password" autocomplete="new-password"
                   placeholder="Minimum 8 caractères" class="form-field"
                   [class.border-red-400]="submitted && form.get('password')?.invalid">
            @if (submitted && form.get('password')?.hasError('minlength')) {
              <p class="form-error">Minimum 8 caractères</p>
            }
            <p class="text-xs text-gray-400 mt-1">
              Doit contenir majuscule, minuscule, chiffre et caractère spécial.
            </p>
          </div>

          @if (errorMsg()) {
            <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {{ errorMsg() }}
            </div>
          }

          <button type="submit" [disabled]="loading()"
                  class="btn-primary w-full justify-center py-3 mt-2">
            @if (loading()) {
              <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Inscription…
            } @else {
              Créer mon compte
            }
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?
          <a routerLink="/auth/login" class="text-riad-600 font-medium hover:underline">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  </div>
  `,
})
export class RegisterComponent {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast       = inject(ToastService);
  private readonly router      = inject(Router);

  readonly loading  = signal(false);
  readonly errorMsg = signal('');
  submitted = false;

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    phone:     [''],
    password:  ['', [Validators.required, Validators.minLength(8),
                     Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z\\d]).{8,}$')]],
  });

  submit() {
    this.submitted = true;
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.errorMsg.set('');

    this.authService.register(this.form.getRawValue() as any).subscribe({
      next: () => {
        this.toast.success('Compte créé avec succès. Bienvenue !');
        this.router.navigate(['/']);
      },
      error: err => {
        this.loading.set(false);
        this.errorMsg.set(
          err.error?.message ?? 'Erreur lors de la création du compte.'
        );
      },
    });
  }
}
