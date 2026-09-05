import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TopNavComponent } from '../../shared/components/top-nav/top-nav.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { SiteFooterComponent } from '../../shared/components/site-footer/site-footer.component';
import { ListingsService } from '../../core/services/listings.service';
import { FavorisService } from '../../core/services/favoris.service';
import { I18nService } from '../../core/services/i18n.service';
import { Annonce } from '../../core/models/property.model';

/**
 * Mes favoris (phase 6) — annonces enregistrées par le visiteur, stockées dans son navigateur (voir
 * FavorisService, aucun compte requis). Les favoris dont l'annonce n'est plus visible (supprimée,
 * suspendue, abonnement du propriétaire expiré) sont silencieusement retirés de la liste.
 */
@Component({
  selector: 'app-favoris',
  standalone: true,
  imports: [CommonModule, RouterLink, TopNavComponent, PropertyCardComponent, BackButtonComponent, SiteFooterComponent],
  templateUrl: './favoris.component.html',
  styleUrl: './favoris.component.scss',
})
export class FavorisComponent {
  private readonly listingsService = inject(ListingsService);
  private readonly favorisService = inject(FavorisService);
  readonly i18n = inject(I18nService);

  readonly loading = signal(true);
  readonly annonces = signal<Annonce[]>([]);

  constructor() {
    this.charger();
  }

  async charger(): Promise<void> {
    this.loading.set(true);
    try {
      const ids = this.favorisService.ids();
      const resultats = await Promise.all(ids.map((id) => firstValueFrom(this.listingsService.getById$(id))));
      const valides: Annonce[] = [];
      resultats.forEach((a, i) => {
        if (a) valides.push(a);
        else this.favorisService.retirer(ids[i]);
      });
      this.annonces.set(valides);
    } finally {
      this.loading.set(false);
    }
  }
}
