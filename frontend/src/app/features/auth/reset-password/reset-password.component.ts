import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

function passwordsMatch(ctrl: AbstractControl) {
  const pw  = ctrl.get('newPassword')?.value;
  const cpw = ctrl.get('confirmPassword')?.value;
  return pw === cpw ? null : { mismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
  <div class="min-h-screen flex items-center justify-center px-4 py-16 bg-riad-50">
    <div class="w-full max-w-md">
      <div class="card p-8">
        <div class="text-center mb-8">
          <div class="w-14 h-14 rounded-full bg-riad-100 flex items-center justify-center mx-auto mb-3 text-3xl">
            🔒
          </div>
          <h1 class="text-2xl font-display font-semibold text-riad-900">Nouveau mot de passe</h1>
        </div>

        @if (!token()) {
          <div class="text-center text-red-600">
            Lien invalide ou expiré.
            <a routerLink="/auth/forgot-password" class="underline ml-1">Réessayer</a>
          </div>
        } @else if (!done()) {
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
            <div>
              <label class="form-label">Nouveau mot de passe</label>
              <input formControlName="newPassword" type="password"
                     placeholder="Minimum 8 caractères" class="form-field">
            </div>
            <div>
              <label class="form-label">Confirmer le mot de passe</label>
              <input formControlName="confirmPassword" type="password"
                     placeholder="Répétez le mot de passe" class="form-field">
              @if (form.hasError('mismatch') && submitted) {
                <p class="form-error">Les mots de passe ne correspondent pas</p>
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
              } @else {
                Réinitialiser
              }
            </button>
          </form>
        } @else {
          <div class="text-center">
            <div class="text-5xl mb-4">✅</div>
            <p class="text-gray-600 mb-6">Votre mot de passe a été mis à jour.</p>
            <a routerLink="/auth/login" class="btn-primary">Se connecter</a>
          </div>
        }
      </div>
    </div>
  </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast       = inject(ToastService);
  private readonly route       = inject(ActivatedRoute);

  readonly loading  = signal(false);
  readonly done     = signal(false);
  readonly errorMsg = signal('');
  readonly token    = signal('');
  submitted = false;

  form = this.fb.group({
    newPassword:     ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatch });

  ngOnInit() {
    this.token.set(this.route.snapshot.queryParams['token'] ?? '');
  }

  submit() {
    this.submitted = true;
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.authService.resetPassword({
      token:           this.token(),
      newPassword:     this.form.value.newPassword!,
      confirmPassword: this.form.value.confirmPassword!,
    }).subscribe({
      next:  () => { this.loading.set(false); this.done.set(true); },
      error: err => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message ?? 'Lien invalide ou expiré.');
      },
    });
  }
}
