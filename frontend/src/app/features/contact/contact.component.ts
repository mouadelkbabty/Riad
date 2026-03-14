import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-riad-50 dark:bg-gray-900">

      <!-- Hero -->
      <section class="relative bg-riad-950 dark:bg-gray-950 text-white py-24 px-4 text-center overflow-hidden">
        <div class="absolute inset-0 opacity-5"
             style="background-image: repeating-linear-gradient(45deg, #b86c12 0, #b86c12 1px, transparent 0, transparent 50%); background-size: 10px 10px;"></div>
        <div class="relative max-w-3xl mx-auto">
          <div class="inline-flex items-center gap-2 bg-riad-800/60 text-riad-300 text-xs font-medium px-4 py-2 rounded-full mb-6">
            <span>✉️</span>
            <span>{{ i18n.t.contact.title }}</span>
          </div>
          <h1 class="text-4xl md:text-5xl font-display font-bold mb-4">{{ i18n.t.contact.title }}</h1>
          <p class="text-riad-300 text-lg max-w-xl mx-auto">{{ i18n.t.contact.subtitle }}</p>
        </div>
      </section>

      <!-- Colour strip -->
      <div class="h-1.5 bg-gradient-to-r from-riad-600 via-terracotta-500 to-morocco-gold"></div>

      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">

          <!-- Contact channels -->
          <div class="space-y-6">

            <!-- WhatsApp card -->
            <a [href]="whatsappHref"
               target="_blank" rel="noopener noreferrer"
               class="card p-6 flex items-start gap-5 hover:shadow-lg transition-shadow group no-underline">
              <div class="shrink-0 w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center
                          group-hover:scale-105 transition-transform">
                <!-- WhatsApp icon -->
                <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.528 5.845L.057 23.243a.75.75 0 00.917.957l5.65-1.481A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.694-.503-5.241-1.383l-.376-.215-3.904 1.023 1.04-3.794-.233-.389A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-display text-lg font-semibold text-riad-900 dark:text-riad-200 mb-1">
                  {{ i18n.t.contact.whatsappTitle }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">{{ i18n.t.contact.whatsappDesc }}</p>
                <span class="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400
                             group-hover:gap-2.5 transition-all">
                  {{ i18n.t.contact.whatsappBtn }}
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </span>
              </div>
            </a>

            <!-- Instagram card -->
            <a [href]="instagramHref"
               target="_blank" rel="noopener noreferrer"
               class="card p-6 flex items-start gap-5 hover:shadow-lg transition-shadow group no-underline">
              <div class="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center
                          group-hover:scale-105 transition-transform
                          bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                <!-- Instagram icon -->
                <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-display text-lg font-semibold text-riad-900 dark:text-riad-200 mb-1">
                  {{ i18n.t.contact.instagramTitle }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">{{ i18n.t.contact.instagramDesc }}</p>
                <span class="inline-flex items-center gap-1.5 text-sm font-medium text-pink-600 dark:text-pink-400
                             group-hover:gap-2.5 transition-all">
                  {{ i18n.t.contact.instagramBtn }}
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </span>
              </div>
            </a>

            <!-- Email card -->
            <a [href]="mailHref"
               class="card p-6 flex items-start gap-5 hover:shadow-lg transition-shadow group no-underline">
              <div class="shrink-0 w-14 h-14 rounded-2xl bg-riad-600 flex items-center justify-center
                          group-hover:scale-105 transition-transform">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-display text-lg font-semibold text-riad-900 dark:text-riad-200 mb-1">
                  {{ i18n.t.contact.emailTitle }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">{{ i18n.t.contact.emailDesc }}</p>
                <p class="text-sm font-medium text-riad-600 dark:text-riad-400 mb-3">contact&#64;riad-lee.ma</p>
                <span class="inline-flex items-center gap-1.5 text-sm font-medium text-riad-600 dark:text-riad-400
                             group-hover:gap-2.5 transition-all">
                  {{ i18n.t.contact.emailBtn }}
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </span>
              </div>
            </a>

          </div>

          <!-- Contact form -->
          <div class="card p-8">
            <h2 class="font-display text-2xl font-semibold text-riad-900 dark:text-riad-200 mb-6">
              {{ i18n.t.contact.formTitle }}
            </h2>

            @if (sent()) {
              <div class="flex flex-col items-center justify-center py-12 text-center gap-4 animate-fade-in">
                <div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <p class="text-lg font-medium text-gray-800 dark:text-gray-200">{{ i18n.t.contact.successMsg }}</p>
              </div>
            } @else {
              <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5" novalidate>

                <!-- Name -->
                <div>
                  <label for="name" class="form-label">{{ i18n.t.contact.name }}</label>
                  <input id="name" formControlName="name" type="text"
                         class="form-field"
                         [class.border-red-400]="submitted && form.get('name')?.invalid"
                         [placeholder]="i18n.t.contact.namePlaceholder">
                  @if (submitted && form.get('name')?.hasError('required')) {
                    <p class="form-error">{{ i18n.t.contact.required }}</p>
                  }
                </div>

                <!-- Email -->
                <div>
                  <label for="email" class="form-label">{{ i18n.t.contact.email }}</label>
                  <input id="email" formControlName="email" type="email"
                         class="form-field"
                         [class.border-red-400]="submitted && form.get('email')?.invalid"
                         [placeholder]="i18n.t.contact.emailPlaceholder">
                  @if (submitted && form.get('email')?.hasError('required')) {
                    <p class="form-error">{{ i18n.t.contact.required }}</p>
                  }
                  @if (submitted && form.get('email')?.hasError('email')) {
                    <p class="form-error">{{ i18n.t.contact.invalidEmail }}</p>
                  }
                </div>

                <!-- Subject -->
                <div>
                  <label for="subject" class="form-label">{{ i18n.t.contact.subject }}</label>
                  <input id="subject" formControlName="subject" type="text"
                         class="form-field"
                         [class.border-red-400]="submitted && form.get('subject')?.invalid"
                         [placeholder]="i18n.t.contact.subjectPlaceholder">
                  @if (submitted && form.get('subject')?.hasError('required')) {
                    <p class="form-error">{{ i18n.t.contact.required }}</p>
                  }
                </div>

                <!-- Message -->
                <div>
                  <label for="message" class="form-label">{{ i18n.t.contact.message }}</label>
                  <textarea id="message" formControlName="message" rows="5"
                            class="form-field resize-none"
                            [class.border-red-400]="submitted && form.get('message')?.invalid"
                            [placeholder]="i18n.t.contact.messagePlaceholder"></textarea>
                  @if (submitted && form.get('message')?.hasError('required')) {
                    <p class="form-error">{{ i18n.t.contact.required }}</p>
                  }
                </div>

                <button type="submit" class="btn-primary w-full btn-lg">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                  {{ i18n.t.contact.send }}
                </button>

              </form>
            }
          </div>

        </div>
      </div>
    </div>
  `,
})
export class ContactComponent {
  readonly i18n = inject(I18nService);
  private readonly fb = inject(FormBuilder);

  readonly sent = signal(false);
  submitted = false;

  readonly whatsappPhone = '212524000000';
  readonly instagramHandle = 'riadlee';
  readonly contactEmail = 'contact@riad-lee.ma';

  get whatsappHref(): string {
    const msg = encodeURIComponent('Bonjour, je souhaite obtenir des informations sur le Riad Lee.');
    return `https://wa.me/${this.whatsappPhone}?text=${msg}`;
  }

  get instagramHref(): string {
    return `https://www.instagram.com/${this.instagramHandle}/`;
  }

  get mailHref(): string {
    return `mailto:${this.contactEmail}`;
  }

  form = this.fb.group({
    name:    ['', Validators.required],
    email:   ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', Validators.required],
  });

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    const { name, subject, message } = this.form.getRawValue();
    const mailtoHref = `mailto:${this.contactEmail}?subject=${encodeURIComponent(subject ?? '')}&body=${encodeURIComponent(`${name ?? ''}\n\n${message ?? ''}`)}`;
    window.location.href = mailtoHref;
    this.sent.set(true);
  }
}
