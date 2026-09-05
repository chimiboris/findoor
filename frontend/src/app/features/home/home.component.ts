import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TopNavComponent } from '../../shared/components/top-nav/top-nav.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';
import { SiteFooterComponent } from '../../shared/components/site-footer/site-footer.component';
import { ListingsService } from '../../core/services/listings.service';
import { I18nService } from '../../core/services/i18n.service';
import { SeoService } from '../../core/services/seo.service';
import { REGIONS, arrOf, departementsOf } from '../../core/data/geo-cameroun';
import { TYPES_ACHETER, TYPES_LOUER, Transaction } from '../../core/models/property.model';

/** Accueil — port fidèle de la maquette validée (phase 2) : hero, recherche rapide, catégories, sélection, étapes, CTA propriétaire. */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TopNavComponent, PropertyCardComponent, SiteFooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly listingsService = inject(ListingsService);
  private readonly seo = inject(SeoService);
  readonly i18n = inject(I18nService);

  readonly regions = REGIONS;
  readonly featured = computed(() => this.listingsService.featured());
  readonly stats = computed(() => {
    const s = this.listingsService.stats();
    return { total: s.annonces, verifiedPct: s.proprietairesVerifiesPct, villes: s.villes, regions: s.regions };
  });

  readonly heroTxn = signal<Transaction>('louer');
  readonly heroRegion = signal('Centre');
  readonly heroDept = signal('');
  readonly heroArr = signal('');
  readonly heroType = signal('');
  readonly heroBudget = signal('');

  readonly heroDepts = computed(() => departementsOf(this.heroRegion()));
  readonly heroArrs = computed(() => arrOf(this.heroRegion(), this.heroDept()));
  readonly heroTypes = computed(() => (this.heroTxn() === 'louer' ? TYPES_LOUER : TYPES_ACHETER));

  ngOnInit(): void {
    this.heroType.set(this.heroTypes()[0]);
    this.seo.set({
      title: 'Findoor',
      description: 'Findoor : trouvez ou publiez un logement en location, un bien ou un terrain en vente au Cameroun.',
      path: '/',
    });
  }

  setHeroTxn(t: Transaction): void {
    this.heroTxn.set(t);
    this.heroType.set(this.heroTypes()[0]);
  }

  onHeroRegionChange(): void {
    this.heroDept.set('');
    this.heroArr.set('');
  }

  onHeroDeptChange(): void {
    this.heroArr.set('');
  }

  search(): void {
    const budget = parseFloat(this.heroBudget().replace(/\D/g, ''));
    this.listingsService.resetFilters();
    this.listingsService.setFilters({
      transaction: this.heroTxn(),
      region: this.heroRegion(),
      departement: this.heroDept(),
      arrondissement: this.heroArr(),
      types: this.heroType() ? [this.heroType()] : [],
      prixMax: isNaN(budget) ? null : budget,
    });
    this.router.navigate(['/recherche']);
  }

  goCategory(transaction: Transaction, extra?: { meuble?: boolean; type?: string }): void {
    this.listingsService.resetFilters();
    this.listingsService.setFilters({
      transaction,
      meubleOui: extra?.meuble === true,
      meubleNon: extra?.meuble === false,
      types: extra?.type ? [extra.type] : [],
    });
    this.router.navigate(['/recherche']);
  }

  goResults(): void {
    this.router.navigate(['/recherche']);
  }
}
