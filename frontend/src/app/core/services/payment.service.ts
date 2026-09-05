import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from './api-base';
import { Abonnement, Formule, Moyen, Paiement } from '../models/payment.model';

/** Abonnement propriétaire — paiement par PÉRIODE (phase 4), voir PaymentService (backend). */
@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);

  monAbonnement(): Promise<Abonnement> {
    return firstValueFrom(this.http.get<Abonnement>(`${API_BASE}/proprietaire/abonnement`));
  }

  demarrer(formule: Formule, moyen: Moyen): Promise<Paiement> {
    return firstValueFrom(this.http.post<Paiement>(`${API_BASE}/proprietaire/abonnement/paiements`, { formule, moyen }));
  }

  /** En simulation (aucun compte marchand CinetPay connecté), appelée directement par la page
   * d'abonnement au lieu d'un vrai webhook fournisseur — voir CinetPaySimulatedProvider côté backend. */
  confirmerSimule(reference: string): Promise<Paiement> {
    return firstValueFrom(this.http.post<Paiement>(`${API_BASE}/public/paiements/${reference}/confirmer`, {}));
  }
}
