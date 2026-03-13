import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Language } from './i18n.service';

export interface ChatbotRoomInfo {
  id: number;
  name: string;
  description: string;
  type: string;
  pricePerNight: number;
  capacity: number;
  surface: number;
  available: boolean;
  amenities: string[];
  coverPhotoUrl: string | null;
}

export interface ChatbotResponse {
  message: string;
  type: 'text' | 'rooms' | 'error';
  rooms: ChatbotRoomInfo[] | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/chatbot';

  sendMessage(message: string, language: Language): Observable<ApiResponse<ChatbotResponse>> {
    return this.http.post<ApiResponse<ChatbotResponse>>(`${this.baseUrl}/message`, {
      message,
      language,
    });
  }

  getAvailableRooms(): Observable<ApiResponse<ChatbotRoomInfo[]>> {
    return this.http.get<ApiResponse<ChatbotRoomInfo[]>>(`${this.baseUrl}/available-rooms`);
  }
}
