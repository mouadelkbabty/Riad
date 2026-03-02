import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import {
  AuthResponse, LoginRequest, RegisterRequest,
  ForgotPasswordRequest, ResetPasswordRequest,
  RefreshTokenRequest, User, ApiResponse
} from '../models';

const ACCESS_TOKEN_KEY  = 'riad_access_token';
const REFRESH_TOKEN_KEY = 'riad_refresh_token';
const USER_KEY          = 'riad_user';

interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly api    = `${environment.apiUrl}/auth`;

  // ── Signals ──────────────────────────────────────────────
  private _currentUser = signal<User | null>(this.loadUserFromToken());
  readonly currentUser  = this._currentUser.asReadonly();
  readonly isLoggedIn   = computed(() => !!this._currentUser());
  readonly isAdmin      = computed(() => this._currentUser()?.role === 'ADMIN');
  readonly isGuest      = computed(() => this._currentUser()?.role === 'GUEST');

  // ── Auth endpoints ────────────────────────────────────────
  login(body: LoginRequest) {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.api}/login`, body).pipe(
      tap(res => this.persistSession(res.data))
    );
  }

  register(body: RegisterRequest) {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.api}/register`, body).pipe(
      tap(res => this.persistSession(res.data))
    );
  }

  refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return throwError(() => new Error('No refresh token'));
    const body: RefreshTokenRequest = { refreshToken };
    return this.http.post<ApiResponse<AuthResponse>>(`${this.api}/refresh-token`, body).pipe(
      tap(res => this.persistSession(res.data)),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  logout() {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http.post(`${this.api}/logout`, { refreshToken }).subscribe({ error: () => {} });
    }
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  forgotPassword(body: ForgotPasswordRequest) {
    return this.http.post<ApiResponse<null>>(`${this.api}/forgot-password`, body);
  }

  resetPassword(body: ResetPasswordRequest) {
    return this.http.post<ApiResponse<null>>(`${this.api}/reset-password`, body);
  }

  // ── Token helpers ─────────────────────────────────────────
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    try {
      const { exp } = jwtDecode<JwtPayload>(token);
      return Date.now() >= exp * 1000 - 30_000; // 30s buffer
    } catch {
      return true;
    }
  }

  // ── Private helpers ───────────────────────────────────────
  private persistSession(auth: AuthResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY,  auth.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    this._currentUser.set(auth.user);
  }

  private clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
  }

  private loadUserFromToken(): User | null {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return null;
    try {
      const { exp } = jwtDecode<JwtPayload>(token);
      if (Date.now() >= exp * 1000) {
        // Token expired — clear silently
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        return null;
      }
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) as User : null;
    } catch {
      return null;
    }
  }
}
