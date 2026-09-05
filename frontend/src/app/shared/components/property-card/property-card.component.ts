import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Annonce, TYPE_ICON } from '../../../core/models/property.model';
import { mediaUrl } from '../../../core/services/api-base';
import { I18nService } from '../../../core/services/i18n.service';
import { FavorisService } from '../../../core/services/favoris.service';

interface PriceLabel {
  big: string;
  small: string;
}

const TYPE_PATHS: Record<string, string> = {
  bed: '<path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6"/><path d="M3 18v2M21 18v2"/><path d="M3 12V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  studio: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 14h16M12 4v10"/>',
  house: '<path d="M4 11.5L12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9"/>',
  villa: '<path d="M3 20V9l6-4 6 4v11"/><path d="M15 20v-8l6 3v5"/><path d="M8 20v-5h3v5"/>',
  land: '<path d="M3 20h18"/><path d="M4 20L10 5l4 8 3-4 3 11"/>',
  shop: '<path d="M4 8l1.5-4h13L20 8"/><path d="M4 8v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8"/><path d="M9 20v-6h6v6"/>',
};

/** Vignette d'annonce réutilisable (accueil, résultats de recherche, annonces similaires, favoris). */
@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-card" role="link" tabindex="0" (click)="open()" (keydown.enter)="open()">
      <div class="p-photo" [style.background]="photo() ? 'center/cover url(' + photo() + ')' : photoGradient()">
        <span class="p-badge">{{ annonce.transaction === 'louer' ? i18n.t('card.forRent') : i18n.t('card.forSale') }}</span>
        <button
          type="button"
          class="fav-btn"
          [class.active]="estFavori()"
          (click)="toggleFavori($event)"
          [attr.aria-label]="estFavori() ? i18n.t('card.removeFavori') : i18n.t('card.addFavori')"
        >
          <svg viewBox="0 0 24 24" [attr.fill]="estFavori() ? 'currentColor' : 'none'"><path d="M12 21s-7.5-4.6-10-9.3C.4 8.2 2 4.5 5.6 4c2-.3 3.9.5 5.1 2.2C11.9 4.5 13.8 3.7 15.8 4c3.6.5 5.2 4.2 3.6 7.7C21.5 16.4 12 21 12 21z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
        </button>
        @if (!photo()) {
          <svg viewBox="0 0 24 24" [innerHTML]="iconPath()"></svg>
        }
        <span class="p-type">{{ annonce.type }}</span>
      </div>
      <div class="p-body">
        <div class="p-title">{{ annonce.titre }}</div>
        <div class="p-loc">
          <svg class="icon" viewBox="0 0 24 24"><path d="M12 22s7-6.4 7-12a7 7 0 1 0-14 0c0 5.6 7 12 7 12z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="2.4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
          {{ annonce.quartier }}, {{ annonce.ville }}
        </div>
        <div class="p-specs">
          <span>
            <svg class="icon" viewBox="0 0 24 24"><rect x="3" y="9" width="18" height="6" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M7 9v3M11 9v3M15 9v3" stroke="currentColor" stroke-width="1.6"/></svg>
            {{ annonce.surface }} m²
          </span>
          @if (annonce.pieces) {
            <span>
              <svg class="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 12h18M11 4v16" stroke="currentColor" stroke-width="1.6"/></svg>
              {{ annonce.pieces }} {{ i18n.t('card.rooms') }}
            </span>
          }
        </div>
        <div class="p-foot">
          <div class="p-price">{{ price().big }}<br /><small>{{ price().small }}</small></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .p-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; cursor: pointer; box-shadow: var(--shadow); transition: transform .15s; text-align: left; padding: 0; width: 100%; font-family: var(--font-body); }
    .p-card:hover { transform: translateY(-3px); }
    .p-photo { aspect-ratio: 4/3; position: relative; display: flex; align-items: center; justify-content: center; }
    .p-photo svg { width: 34%; opacity: .9; stroke: #fff; fill: none; }
    .p-photo .p-badge { position: absolute; top: 10px; left: 10px; font-family: var(--font-mono); font-size: .68rem; font-weight: 600; padding: 4px 9px; border-radius: 999px; background: rgba(0,0,0,.32); color: #fff; }
    .p-photo .p-type { position: absolute; bottom: 10px; left: 10px; color: #fff; font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; opacity: .9; }
    .fav-btn {
      position: absolute; top: 8px; right: 8px; width: 32px; height: 32px; border-radius: 50%; z-index: 2;
      display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.32); border: none; cursor: pointer;
      color: #fff; transition: background .15s, transform .1s;
    }
    .fav-btn:hover { background: rgba(0,0,0,.5); }
    .fav-btn:active { transform: scale(.9); }
    .fav-btn svg { width: 18px; height: 18px; }
    .fav-btn.active { color: var(--sale); background: rgba(255,255,255,.9); }
    .p-body { padding: 14px 15px 16px; }
    .p-title { font-weight: 700; font-size: .96rem; margin-bottom: 3px; color: var(--ink); }
    .p-loc { color: var(--ink-soft); font-size: .8rem; display: flex; align-items: center; gap: 5px; margin-bottom: 10px; }
    .p-loc .icon { width: .95em; height: .95em; }
    .p-specs { display: flex; gap: 12px; font-size: .76rem; color: var(--ink-soft); margin-bottom: 12px; }
    .p-specs span { display: inline-flex; align-items: center; gap: 4px; }
    .p-specs .icon { width: .9em; height: .9em; }
    .p-foot { display: flex; align-items: baseline; justify-content: space-between; border-top: 1px dashed var(--border); padding-top: 10px; }
    .p-price { font-family: var(--font-mono); font-weight: 600; font-size: 1.02rem; color: var(--ink); }
    .p-price small { font-family: var(--font-body); font-weight: 500; color: var(--ink-soft); font-size: .72rem; }
  `],
})
export class PropertyCardComponent {
  @Input({ required: true }) annonce!: Annonce;

  private readonly router = inject(Router);
  private readonly favoris = inject(FavorisService);
  readonly i18n = inject(I18nService);

  price(): PriceLabel {
    const l = this.annonce;
    if (l.uniteM2) return { big: `${this.fmt(l.prix)} FCFA/m²`, small: this.i18n.t('detail.totalPrice', { total: this.fmt(l.prixTotal ?? 0) }) };
    if (l.transaction === 'louer') return { big: `${this.fmt(l.prix)} FCFA`, small: l.unite ?? '' };
    return { big: `${this.fmt(l.prix)} FCFA`, small: this.i18n.t('detail.netPrice') };
  }

  photoGradient(): string {
    const accent = this.annonce.transaction === 'louer' ? 'var(--rent)' : 'var(--sale)';
    return `linear-gradient(150deg, var(--night), ${accent})`;
  }

  photo(): string | null {
    const first = this.annonce.photos?.[0];
    return first ? mediaUrl(first) : null;
  }

  iconPath(): string {
    const key = TYPE_ICON[this.annonce.type] ?? 'house';
    return TYPE_PATHS[key] ?? TYPE_PATHS['house'];
  }

  estFavori(): boolean {
    return this.favoris.estFavori(this.annonce.id);
  }

  toggleFavori(event: Event): void {
    event.stopPropagation();
    this.favoris.basculer(this.annonce.id);
  }

  open(): void {
    this.router.navigate(['/annonce', this.annonce.id]);
  }

  private fmt(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(n);
  }
}
