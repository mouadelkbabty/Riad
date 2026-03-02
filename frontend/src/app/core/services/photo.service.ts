import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, Photo } from '../models';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private readonly http = inject(HttpClient);
  private readonly api  = `${environment.apiUrl}/photos`;

  getGallery() {
    return this.http.get<ApiResponse<Photo[]>>(`${this.api}/gallery`);
  }

  getRoomPhotos(roomId: number) {
    return this.http.get<ApiResponse<Photo[]>>(`${this.api}/rooms/${roomId}`);
  }

  upload(file: File, altText: string, caption?: string, roomId?: number) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('altText', altText);
    if (caption) formData.append('caption', caption);
    if (roomId != null) formData.append('roomId', roomId.toString());
    return this.http.post<ApiResponse<Photo>>(this.api, formData);
  }

  setCover(id: number) {
    return this.http.patch<ApiResponse<Photo>>(`${this.api}/${id}/cover`, {});
  }

  delete(id: number) {
    return this.http.delete<ApiResponse<null>>(`${this.api}/${id}`);
  }

  /** Build the full URL for a photo (handles relative and absolute URLs). */
  resolveUrl(url: string): string {
    if (!url) return '/assets/images/placeholder.jpg';
    if (url.startsWith('http')) return url;
    return `${environment.uploadsBaseUrl}/${url}`;
  }
}
