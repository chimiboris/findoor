import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TopNavComponent } from '../../shared/components/top-nav/top-nav.component';
import { SiteFooterComponent } from '../../shared/components/site-footer/site-footer.component';
import { AlerteService } from '../../core/services/alerte.service';
import { I18nService } from '../../core/services/i18n.service';

type Etat = 'chargement' | 'succes' | 'erreur';

/** Page de désabonnement d'une alerte de recherche (phase 6) — lien reçu par email, sans authentification. */
@Component({
  selector: 'app-alerte-desabonnement',
  standalone: true,
  imports: [CommonModule, RouterLink, TopNavComponent, SiteFooterComponent],
  templateUrl: './alerte-desabonnement.component.html',
  styleUrl: './alerte-desabonnement.component.scss',
})
export class AlerteDesabonnementComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly alerteService = inject(AlerteService);
  readonly i18n = inject(I18nService);

  readonly etat = signal<Etat>('chargement');

  constructor() {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.etat.set('erreur');
      return;
    }
    this.alerteService
      .desabonner(token)
      .then(() => this.etat.set('succes'))
      .catch(() => this.etat.set('erreur'));
  }
}
