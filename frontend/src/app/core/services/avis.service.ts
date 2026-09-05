import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from './api-base';
import { Avis, AvisCreateRequest, AvisResume } from '../models/avis.model';

/** Avis sur les annonces (phase 6) — dépôt public, lecture publique (publiés), modération admin. */
@Injectable({ providedIn: 'root' })
export class AvisService {
  private readonly http = inject(HttpClient);

  deposer(annonceId: number, data: AvisCreateRequest): Promise<Avis> {
    return firstValueFrom(this.http.post<Avis>(`${API_BASE}/public/annonces/${annonceId}/avis`, data));
  }

  publies(annonceId: number): Promise<Avis[]> {
    return firstValueFrom(this.http.get<Avis[]>(`${API_BASE}/public/annonces/${annonceId}/avis`));
  }

  resume(annonceId: number): Promise<AvisResume> {
    return firstValueFrom(this.http.get<AvisResume>(`${API_BASE}/public/annonces/${annonceId}/avis/resume`));
  }

  tousLesAvis(): Promise<Avis[]> {
    return firstValueFrom(this.http.get<Avis[]>(`${API_BASE}/admin/avis`));
  }

  approuver(id: number): Promise<Avis> {
    return firstValueFrom(this.http.patch<Avis>(`${API_BASE}/admin/avis/${id}/approuver`, {}));
  }

  rejeter(id: number): Promise<Avis> {
    return firstValueFrom(this.http.patch<Avis>(`${API_BASE}/admin/avis/${id}/rejeter`, {}));
  }

  supprimer(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${API_BASE}/admin/avis/${id}`));
  }
}
