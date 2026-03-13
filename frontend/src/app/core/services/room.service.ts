import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse, Room, RoomFilter, RoomRequest, PageRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly http = inject(HttpClient);
  private readonly api  = `${environment.apiUrl}/rooms`;

  getAll(page: PageRequest = {}, filter: RoomFilter = {}) {
    const hasFilter = filter.type || filter.minPrice != null || filter.maxPrice != null || filter.minCapacity != null;
    let params = new HttpParams()
      .set('page', page.page ?? 0)
      .set('size', page.size ?? 9);
    if (page.sort) params = params.set('sort', page.sort);

    if (hasFilter) {
      // Use dedicated filter endpoint
      if (filter.type)                    params = params.set('type', filter.type);
      if (filter.minPrice != null)        params = params.set('minPrice', filter.minPrice);
      if (filter.maxPrice != null)        params = params.set('maxPrice', filter.maxPrice);
      if (filter.minCapacity != null)     params = params.set('minCapacity', filter.minCapacity);
      return this.http.get<ApiResponse<PageResponse<Room>>>(`${this.api}/filter`, { params });
    }
    return this.http.get<ApiResponse<PageResponse<Room>>>(`${this.api}`, { params });
  }

  getAvailable(checkIn: string, checkOut: string, guests: number) {
    const params = new HttpParams()
      .set('checkIn', checkIn)
      .set('checkOut', checkOut)
      .set('guests', guests);
    return this.http.get<ApiResponse<Room[]>>(`${this.api}/available`, { params });
  }

  getById(id: number) {
    return this.http.get<ApiResponse<Room>>(`${this.api}/${id}`);
  }

  create(body: RoomRequest) {
    return this.http.post<ApiResponse<Room>>(this.api, body);
  }

  update(id: number, body: RoomRequest) {
    return this.http.put<ApiResponse<Room>>(`${this.api}/${id}`, body);
  }

  toggleAvailability(id: number) {
    return this.http.patch<ApiResponse<Room>>(`${this.api}/${id}/toggle-availability`, {});
  }

  delete(id: number) {
    return this.http.delete<ApiResponse<null>>(`${this.api}/${id}`);
  }
}
