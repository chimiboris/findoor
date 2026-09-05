import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from './api-base';

export type CanalOtp = 'EMAIL' | 'SMS';

/** Mot de passe oublié — demande d'un code OTP puis réinitialisation (propriétaires et administrateurs). */
@Injectable({ providedIn: 'root' })
export class PasswordResetService {
  private readonly http = inject(HttpClient);

  demanderCode(identifiant: string, canal: CanalOtp): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${API_BASE}/auth/mot-de-passe-oublie`, { identifiant, canal }));
  }

  reinitialiser(identifiant: string, code: string, nouveauMotDePasse: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${API_BASE}/auth/reinitialiser-mot-de-passe`, { identifiant, code, nouveauMotDePasse }),
    );
  }
}
