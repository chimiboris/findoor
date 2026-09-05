import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from './api-base';
import { Annonce } from '../models/property.model';
import { AnnonceFormValue } from '../models/annonce-create.model';
import { AdminStats, AdminUserCreateRequest, AdminUserUpdateRequest, UserAdmin } from '../models/admin.model';

/** Back-office administrateur — API `/api/admin/**` (JWT + rôle ADMIN requis), CRUD complet. */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE}/admin`;

  stats(): Promise<AdminStats> {
    return firstValueFrom(this.http.get<AdminStats>(`${this.base}/stats`));
  }

  // --- Annonces ---

  annonces(): Promise<Annonce[]> {
    return firstValueFrom(this.http.get<Annonce[]>(`${this.base}/annonces`));
  }

  uneAnnonce(id: number): Promise<Annonce> {
    return firstValueFrom(this.http.get<Annonce>(`${this.base}/annonces/${id}`));
  }

  creerAnnonce(valeur: AnnonceFormValue, photos: File[]): Promise<Annonce> {
    return firstValueFrom(this.http.post<Annonce>(`${this.base}/annonces`, this.toFormData(valeur, photos)));
  }

  modifierAnnonce(id: number, valeur: AnnonceFormValue, photos: File[]): Promise<Annonce> {
    return firstValueFrom(this.http.put<Annonce>(`${this.base}/annonces/${id}`, this.toFormData(valeur, photos)));
  }

  basculerAnnonce(id: number): Promise<Annonce> {
    return firstValueFrom(this.http.patch<Annonce>(`${this.base}/annonces/${id}/basculer`, {}));
  }

  supprimerAnnonce(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base}/annonces/${id}`));
  }

  // --- Utilisateurs ---

  utilisateurs(): Promise<UserAdmin[]> {
    return firstValueFrom(this.http.get<UserAdmin[]>(`${this.base}/utilisateurs`));
  }

  unUtilisateur(id: number): Promise<UserAdmin> {
    return firstValueFrom(this.http.get<UserAdmin>(`${this.base}/utilisateurs/${id}`));
  }

  creerUtilisateur(data: AdminUserCreateRequest): Promise<UserAdmin> {
    return firstValueFrom(this.http.post<UserAdmin>(`${this.base}/utilisateurs`, data));
  }

  modifierUtilisateur(id: number, data: AdminUserUpdateRequest): Promise<UserAdmin> {
    return firstValueFrom(this.http.put<UserAdmin>(`${this.base}/utilisateurs/${id}`, data));
  }

  basculerUtilisateur(id: number): Promise<UserAdmin> {
    return firstValueFrom(this.http.patch<UserAdmin>(`${this.base}/utilisateurs/${id}/basculer`, {}));
  }

  supprimerUtilisateur(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base}/utilisateurs/${id}`));
  }

  private toFormData(valeur: AnnonceFormValue, photos: File[]): FormData {
    const form = new FormData();
    form.append('data', new Blob([JSON.stringify(valeur)], { type: 'application/json' }));
    for (const photo of photos) form.append('photos', photo, photo.name);
    return form;
  }
}
