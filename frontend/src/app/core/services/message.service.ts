import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from './api-base';
import { MessageAnnonce, MessageCreateRequest } from '../models/message.model';

/** Messagerie visiteur → propriétaire (phase 6) — envoi public + consultation côté propriétaire. */
@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly http = inject(HttpClient);

  /** Envoi depuis la fiche annonce — aucune authentification requise. */
  envoyer(annonceId: number, data: MessageCreateRequest): Promise<MessageAnnonce> {
    return firstValueFrom(this.http.post<MessageAnnonce>(`${API_BASE}/public/annonces/${annonceId}/messages`, data));
  }

  mesMessages(): Promise<MessageAnnonce[]> {
    return firstValueFrom(this.http.get<MessageAnnonce[]>(`${API_BASE}/proprietaire/messages`));
  }

  nonLus(): Promise<number> {
    return firstValueFrom(this.http.get<{ nonLus: number }>(`${API_BASE}/proprietaire/messages/non-lus`)).then((r) => r.nonLus);
  }

  marquerLu(id: number): Promise<MessageAnnonce> {
    return firstValueFrom(this.http.patch<MessageAnnonce>(`${API_BASE}/proprietaire/messages/${id}/lu`, {}));
  }
}
