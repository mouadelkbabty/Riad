import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RoomService } from '../../../core/services/room.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Room } from '../../../core/models';
import { format, addDays, differenceInDays } from 'date-fns';

@Component({
  selector: 'app-create-reservation',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
  <div class="max-w-2xl mx-auto px-4 py-12">
    <nav class="text-sm text-gray-400 mb-6 flex items-center gap-2">
      <a routerLink="/" class="hover:text-riad-600">Accueil</a><span>/</span>
      <a routerLink="/chambres" class="hover:text-riad-600">Chambres</a><span>/</span>
      <span class="text-gray-700">Demande de réservation</span>
    </nav>

    <h1 class="text-3xl font-display font-bold text-riad-900 mb-8">Demande de réservation</h1>

    @if (submitted()) {
      <!-- Confirmation message -->
      <div class="card p-8 text-center space-y-4">
        <div class="text-5xl">✅</div>
        <h2 class="font-display font-semibold text-2xl text-riad-900">Demande envoyée !</h2>
        <p class="text-gray-600 max-w-md mx-auto">
          Votre demande de réservation a été envoyée avec succès.
          Nous vous contacterons bientôt pour confirmer votre séjour.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <a routerLink="/chambres" class="btn-secondary justify-center">
            Voir d'autres chambres
          </a>
          <a routerLink="/" class="btn-primary justify-center">
            Retour à l'accueil
          </a>
        </div>
      </div>
    } @else if (loadingRoom()) {
      <app-loading-spinner />
    } @else if (!room()) {
      <p class="text-gray-500">Chambre non trouvée.
        <a routerLink="/chambres" class="text-riad-600 underline">Choisir une chambre</a>
      </p>
    } @else {
      <!-- Room summary -->
      <div class="card p-5 flex gap-4 mb-8">
        <div class="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-riad-100 flex items-center justify-center text-2xl">
          @if (room()!.coverPhotoUrl) {
            <img [src]="room()!.coverPhotoUrl" [alt]="room()!.name" class="w-full h-full object-cover">
          } @else {
            🏡
          }
        </div>
        <div>
          <p class="text-xs text-riad-500 font-medium uppercase tracking-wide">{{ room()!.typeName }}</p>
          <h2 class="font-display font-semibold text-lg text-riad-900">{{ room()!.name }}</h2>
          <p class="text-sm text-gray-500">{{ room()!.pricePerNight | number }} MAD / nuit · {{ room()!.capacity }} pers. max</p>
        </div>
      </div>

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="submit()" class="card p-6 space-y-5">
        <!-- Contact info -->
        <h3 class="font-display font-semibold text-lg text-riad-900">Vos coordonnées</h3>

        <div>
          <label for="fullName" class="form-label">Nom complet *</label>
          <input id="fullName" formControlName="fullName" type="text"
                 placeholder="Votre nom complet"
                 class="form-field"
                 [class.border-red-300]="form.get('fullName')?.invalid && form.get('fullName')?.touched">
          @if (form.get('fullName')?.invalid && form.get('fullName')?.touched) {
            <p class="text-red-500 text-xs mt-1">Le nom complet est obligatoire.</p>
          }
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="email" class="form-label">Adresse email *</label>
            <input id="email" formControlName="email" type="email"
                   placeholder="votre@email.com"
                   class="form-field"
                   [class.border-red-300]="form.get('email')?.invalid && form.get('email')?.touched">
            @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
              <p class="text-red-500 text-xs mt-1">L'email est obligatoire.</p>
            }
            @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
              <p class="text-red-500 text-xs mt-1">L'adresse email n'est pas valide.</p>
            }
          </div>
          <div>
            <label for="phone" class="form-label">Téléphone *</label>
            <input id="phone" formControlName="phone" type="tel"
                   placeholder="+212 600 000 000"
                   class="form-field"
                   [class.border-red-300]="form.get('phone')?.invalid && form.get('phone')?.touched">
            @if (form.get('phone')?.invalid && form.get('phone')?.touched) {
              <p class="text-red-500 text-xs mt-1">Le numéro de téléphone est obligatoire.</p>
            }
          </div>
        </div>

        <hr class="border-gray-200">

        <!-- Stay details -->
        <h3 class="font-display font-semibold text-lg text-riad-900">Détails du séjour</h3>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="checkIn" class="form-label">Date d'arrivée *</label>
            <input id="checkIn" formControlName="checkIn" type="date"
                   [min]="today"
                   class="form-field">
          </div>
          <div>
            <label for="checkOut" class="form-label">Date de départ *</label>
            <input id="checkOut" formControlName="checkOut" type="date"
                   [min]="form.get('checkIn')?.value || today"
                   class="form-field">
          </div>
        </div>

        <div>
          <label for="numberOfGuests" class="form-label">Nombre de voyageurs *</label>
          <select id="numberOfGuests" formControlName="numberOfGuests" class="form-field">
            @for (n of guestOptions(); track n) {
              <option [value]="n">{{ n }} personne{{ n > 1 ? 's' : '' }}</option>
            }
          </select>
        </div>

        <div>
          <label for="message" class="form-label">Message (optionnel)</label>
          <textarea id="message" formControlName="message" rows="3"
                    placeholder="Demandes spéciales, allergies, heure d'arrivée…"
                    class="form-field resize-none"></textarea>
        </div>

        <!-- Price summary -->
        @if (nights() > 0) {
          <div class="bg-riad-50 rounded-xl p-4 text-sm space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">{{ room()!.pricePerNight | number }} MAD × {{ nights() }} nuit{{ nights() > 1 ? 's' : '' }}</span>
              <span>{{ total() | number }} MAD</span>
            </div>
            <hr class="border-riad-200">
            <div class="flex justify-between font-bold text-riad-900">
              <span>Total estimé</span>
              <span>{{ total() | number }} MAD</span>
            </div>
          </div>
        }

        @if (errorMsg()) {
          <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {{ errorMsg() }}
          </div>
        }

        <div class="flex gap-3 pt-2">
          <a routerLink="/chambres" class="btn-secondary flex-1 justify-center">Annuler</a>
          <button type="submit" [disabled]="form.invalid || !canSubmit() || submitting()"
                  class="btn-primary flex-1 justify-center">
            @if (submitting()) {
              <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            } @else {
              Envoyer la demande
            }
          </button>
        </div>
      </form>
    }
  </div>
  `,
})
export class CreateReservationComponent implements OnInit {
  private readonly roomService        = inject(RoomService);
  private readonly reservationService = inject(ReservationService);
  private readonly toast              = inject(ToastService);
  private readonly route              = inject(ActivatedRoute);
  private readonly fb                 = inject(FormBuilder);

  readonly room        = signal<Room | null>(null);
  readonly loadingRoom = signal(true);
  readonly submitting  = signal(false);
  readonly submitted   = signal(false);
  readonly errorMsg    = signal('');
  readonly nights      = signal(0);
  readonly total       = signal(0);

  readonly today = format(new Date(), 'yyyy-MM-dd');

  form = this.fb.group({
    fullName:       ['', [Validators.required, Validators.maxLength(100)]],
    email:          ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    phone:          ['', [Validators.required, Validators.maxLength(20)]],
    checkIn:        [this.today, Validators.required],
    checkOut:       [format(addDays(new Date(), 2), 'yyyy-MM-dd'), Validators.required],
    numberOfGuests: [2, [Validators.required, Validators.min(1)]],
    message:        ['', Validators.maxLength(500)],
  });

  constructor() {
    this.form.get('checkIn')?.valueChanges.subscribe(() => this.recalculate());
    this.form.get('checkOut')?.valueChanges.subscribe(() => this.recalculate());
  }

  guestOptions() {
    return Array.from({ length: this.room()?.capacity ?? 10 }, (_, i) => i + 1);
  }

  canSubmit() {
    return this.nights() > 0;
  }

  ngOnInit() {
    const q = this.route.snapshot.queryParams;
    const roomId = +q['roomId'];
    if (q['checkIn'])  this.form.patchValue({ checkIn: q['checkIn'] });
    if (q['checkOut']) this.form.patchValue({ checkOut: q['checkOut'] });
    if (q['guests'])   this.form.patchValue({ numberOfGuests: +q['guests'] });

    if (!roomId) {
      this.loadingRoom.set(false);
      return;
    }

    this.roomService.getById(roomId).subscribe({
      next: res => { this.room.set(res.data); this.recalculate(); this.loadingRoom.set(false); },
      error: () => this.loadingRoom.set(false),
    });
  }

  recalculate() {
    const checkIn = this.form.get('checkIn')?.value;
    const checkOut = this.form.get('checkOut')?.value;
    if (checkIn && checkOut) {
      const n = differenceInDays(new Date(checkOut), new Date(checkIn));
      this.nights.set(Math.max(0, n));
      this.total.set(this.nights() * (this.room()?.pricePerNight ?? 0));
    }
  }

  submit() {
    if (this.form.invalid || !this.canSubmit() || this.submitting()) return;
    this.submitting.set(true);
    this.errorMsg.set('');

    const v = this.form.getRawValue();
    this.reservationService.sendGuestRequest({
      roomId:          this.room()!.id,
      fullName:        v.fullName!,
      email:           v.email!,
      phone:           v.phone!,
      numberOfGuests:  v.numberOfGuests!,
      checkIn:         v.checkIn!,
      checkOut:        v.checkOut!,
      message:         v.message || undefined,
    }).subscribe({
      next: () => {
        this.submitted.set(true);
        this.toast.success('Votre demande de réservation a été envoyée !');
      },
      error: err => {
        this.submitting.set(false);
        this.errorMsg.set(err.error?.message ?? 'Erreur lors de l\'envoi de la demande.');
      },
    });
  }
}
