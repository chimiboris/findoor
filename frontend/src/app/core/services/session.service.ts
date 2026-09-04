import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthResponse, Role, UserResponse } from '../models/auth.models';

const TOKEN_KEY = 'findoor_access_token';
const REFRESH_KEY = 'findoor_refresh_token';
const USER_KEY = 'findoor_user';

/** Session côté client — sûre en SSR (aucun accès à localStorage côté serveur). */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly accessToken = signal<string | null>(this.readStorage(TOKEN_KEY));
  readonly user = signal<UserResponse | null>(this.readUser());

  private readStorage(key: string): string | null {
    return this.isBrowser ? localStorage.getItem(key) : null;
  }

  private readUser(): UserResponse | null {
    const raw = this.readStorage(USER_KEY);
    return raw ? (JSON.parse(raw) as UserResponse) : null;
  }

  setSession(auth: AuthResponse): void {
    this.accessToken.set(auth.accessToken);
    this.user.set(auth.utilisateur);
    if (this.isBrowser) {
      localStorage.setItem(TOKEN_KEY, auth.accessToken);
      localStorage.setItem(REFRESH_KEY, auth.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(auth.utilisateur));
    }
  }

  getRefreshToken(): string | null {
    return this.readStorage(REFRESH_KEY);
  }

  logout(): void {
    this.accessToken.set(null);
    this.user.set(null);
    if (this.isBrowser) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken();
  }

  hasRole(...roles: Role[]): boolean {
    const role = this.user()?.role;
    return !!role && roles.includes(role);
  }
}
