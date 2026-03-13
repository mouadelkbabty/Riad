import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  ApiResponse, PageResponse, Reservation,
  ReservationRequest, CancelReservationRequest,
  GuestReservationRequest,
  OccupiedDateRange, PageRequest
} from '../models';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly http = inject(HttpClient);
  private readonly api  = `${environment.apiUrl}/reservations`;

  sendGuestRequest(body: GuestReservationRequest) {
    return this.http.post<ApiResponse<void>>(`${this.api}/guest-request`, body);
  }

  create(body: ReservationRequest) {
    return this.http.post<ApiResponse<Reservation>>(this.api, body);
  }

  getMyReservations(page: PageRequest = {}) {
    const params = new HttpParams()
      .set('page', page.page ?? 0)
      .set('size', page.size ?? 10);
    return this.http.get<ApiResponse<PageResponse<Reservation>>>(`${this.api}/my`, { params });
  }

  getById(id: number) {
    return this.http.get<ApiResponse<Reservation>>(`${this.api}/${id}`);
  }

  getByNumber(number: string) {
    return this.http.get<ApiResponse<Reservation>>(`${this.api}/number/${number}`);
  }

  cancel(id: number, body: CancelReservationRequest) {
    return this.http.post<ApiResponse<Reservation>>(`${this.api}/${id}/cancel`, body);
  }

  getOccupiedDates(roomId: number) {
    return this.http.get<ApiResponse<OccupiedDateRange[]>>(
      `${this.api}/rooms/${roomId}/occupied-dates`
    );
  }

  // ── Admin endpoints ───────────────────────────────────────
  getAll(page: PageRequest = {}, status?: string) {
    let params = new HttpParams()
      .set('page', page.page ?? 0)
      .set('size', page.size ?? 20);
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<PageResponse<Reservation>>>(this.api, { params });
  }

  confirm(id: number) {
    return this.http.post<ApiResponse<Reservation>>(`${this.api}/${id}/confirm`, {});
  }
}
