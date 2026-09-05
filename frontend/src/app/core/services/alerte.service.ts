import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from './api-base';
import { Filters } from './listings.service';
import { Alerte, AlerteCreateRequest } from '../models/alerte.model';

/** Alertes de recherche (phase 6) — création publique depuis les filtres de recherche, supervision admin. */
@Injectable({ providedIn: 'root' })
export class AlerteService {
  private readonly http = inject(HttpClient);

  creer(data: AlerteCreateRequest): Promise<Alerte> {
    return firstValueFrom(this.http.post<Alerte>(`${API_BASE}/public/alertes`, data));
  }

  desabonner(token: string): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${API_BASE}/public/alertes/${token}/desabonner`, {}));
  }

  toutes(): Promise<Alerte[]> {
    return firstValueFrom(this.http.get<Alerte[]>(`${API_BASE}/admin/alertes`));
  }

  /** Construit la requête de création d'alerte à partir des filtres de recherche courants + un email. */
  static depuisFiltres(f: Filters, email: string): AlerteCreateRequest {
    return {
      transaction: f.transaction,
      region: f.region,
      departement: f.departement,
      arrondissement: f.arrondissement,
      quartier: f.quartier,
      types: f.types,
      meubleOui: f.meubleOui,
      meubleNon: f.meubleNon,
      prixMin: f.prixMin,
      prixMax: f.prixMax,
      email,
    };
  }
}
