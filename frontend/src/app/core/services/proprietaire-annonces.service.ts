import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from './api-base';
import { Annonce } from '../models/property.model';
import { AnnonceFormValue } from '../models/annonce-create.model';

/** Gestion des annonces du propriétaire connecté — API `/api/proprietaire/annonces` (JWT requis). */
@Injectable({ providedIn: 'root' })
export class ProprietaireAnnoncesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE}/proprietaire/annonces`;

  mesAnnonces(): Promise<Annonce[]> {
    return firstValueFrom(this.http.get<Annonce[]>(this.base));
  }

  uneAnnonce(id: number): Promise<Annonce> {
    return firstValueFrom(this.http.get<Annonce>(`${this.base}/${id}`));
  }

  creer(valeur: AnnonceFormValue, photos: File[]): Promise<Annonce> {
    return firstValueFrom(this.http.post<Annonce>(this.base, this.toFormData(valeur, photos)));
  }

  modifier(id: number, valeur: AnnonceFormValue, photos: File[]): Promise<Annonce> {
    return firstValueFrom(this.http.put<Annonce>(`${this.base}/${id}`, this.toFormData(valeur, photos)));
  }

  supprimer(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base}/${id}`));
  }

  private toFormData(valeur: AnnonceFormValue, photos: File[]): FormData {
    const form = new FormData();
    form.append('data', new Blob([JSON.stringify(valeur)], { type: 'application/json' }));
    for (const photo of photos) form.append('photos', photo, photo.name);
    return form;
  }
}
