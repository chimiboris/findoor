import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from './api-base';
import { SessionService } from './session.service';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);

  async register(request: RegisterRequest): Promise<void> {
    const auth = await firstValueFrom(this.http.post<AuthResponse>(`${API_BASE}/auth/inscription`, request));
    this.session.setSession(auth);
  }

  async login(request: LoginRequest): Promise<void> {
    const auth = await firstValueFrom(this.http.post<AuthResponse>(`${API_BASE}/auth/connexion`, request));
    this.session.setSession(auth);
  }

  logout(): void {
    this.session.logout();
  }
}
