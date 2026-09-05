import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TopNavComponent } from '../../shared/components/top-nav/top-nav.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { SiteFooterComponent } from '../../shared/components/site-footer/site-footer.component';
import { ListingsService, Sort } from '../../core/services/listings.service';
import { AlerteService } from '../../core/services/alerte.service';
import { I18nService } from '../../core/services/i18n.service';
import { SeoService } from '../../core/services/seo.service';
import { REGIONS, arrOf, departementsOf } from '../../core/data/geo-cameroun';
import { TYPES_ACHETER, TYPES_LOUER } from '../../core/models/property.model';

/** Recherche — filtres complets (région → département → arrondissement, quartier, type, budget). */
@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, TopNavComponent, PropertyCardComponent, BackButtonComponent, SiteFooterComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly alerteService = inject(AlerteService);
  private readonly seo = inject(SeoService);
  readonly listingsService = inject(ListingsService);
  readonly i18n = inject(I18nService);

  readonly regions = REGIONS;
  readonly filters = this.listingsService.filters;
  readonly results = this.listingsService.results;

  readonly showAlerteForm = signal(false);
  readonly alerteEmail = signal('');
  readonly sendingAlerte = signal(false);
  readonly alerteSent = signal(false);
  readonly alerteError = signal<string | null>(null);

  readonly depts = computed(() => departementsOf(this.filters().region));
  readonly arrs = computed(() => arrOf(this.filters().region, this.filters().departement));
  readonly types = computed(() => (this.filters().transaction === 'louer' ? TYPES_LOUER : TYPES_ACHETER));

  constructor() {
    // Abonnement direct (plutôt que withComponentInputBinding) : se redéclenche de façon fiable même
    // en reclique sur le même lien "Louer"/"Acheter" depuis l'en-tête, la page restant sur /recherche.
    this.route.queryParamMap.subscribe((params) => {
      const t = params.get('transaction');
      if (t === 'louer' || t === 'acheter') this.setTxn(t);
    });
    this.seo.set({
      title: this.i18n.t('search.title'),
      description: 'Parcourez les annonces immobilières au Cameroun — location et vente, filtrées par région, ville, quartier, type de bien et budget.',
      path: '/recherche',
    });
  }

  setTxn(t: 'louer' | 'acheter'): void {
    this.listingsService.setFilters({ transaction: t, types: [] });
  }

  onRegionChange(region: string): void {
    this.listingsService.setFilters({ region, departement: '', arrondissement: '' });
  }

  onDeptChange(departement: string): void {
    this.listingsService.setFilters({ departement, arrondissement: '' });
  }

  onArrChange(arrondissement: string): void {
    this.listingsService.setFilters({ arrondissement });
  }

  onQuartierChange(quartier: string): void {
    this.listingsService.setFilters({ quartier });
  }

  toggleMeuble(which: 'oui' | 'non'): void {
    if (which === 'oui') this.listingsService.setFilters({ meubleOui: !this.filters().meubleOui });
    else this.listingsService.setFilters({ meubleNon: !this.filters().meubleNon });
  }

  toggleType(type: string): void {
    const current = this.filters().types;
    const types = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
    this.listingsService.setFilters({ types });
  }

  setMin(value: string): void {
    const n = parseFloat(value.replace(/\D/g, ''));
    this.listingsService.setFilters({ prixMin: isNaN(n) ? null : n });
  }

  setMax(value: string): void {
    const n = parseFloat(value.replace(/\D/g, ''));
    this.listingsService.setFilters({ prixMax: isNaN(n) ? null : n });
  }

  setSort(sort: Sort): void {
    this.listingsService.setFilters({ sort });
  }

  reset(): void {
    this.listingsService.resetFilters();
  }

  ouvrirAlerteForm(): void {
    this.alerteSent.set(false);
    this.alerteError.set(null);
    this.showAlerteForm.set(true);
  }

  annulerAlerteForm(): void {
    this.showAlerteForm.set(false);
    this.alerteError.set(null);
  }

  async creerAlerte(): Promise<void> {
    const email = this.alerteEmail().trim();
    if (!email) {
      this.alerteError.set(this.i18n.t('search.alertErrorRequired'));
      return;
    }
    this.sendingAlerte.set(true);
    this.alerteError.set(null);
    try {
      await this.alerteService.creer(AlerteService.depuisFiltres(this.filters(), email));
      this.alerteSent.set(true);
      this.showAlerteForm.set(false);
      this.alerteEmail.set('');
    } catch {
      this.alerteError.set(this.i18n.t('search.alertErrorGeneric'));
    } finally {
      this.sendingAlerte.set(false);
    }
  }
}
