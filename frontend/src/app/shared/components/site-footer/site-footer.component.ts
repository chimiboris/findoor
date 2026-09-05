import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ListingsService } from '../../../core/services/listings.service';
import { I18nService } from '../../../core/services/i18n.service';
import { Transaction } from '../../../core/models/property.model';
import { PLATFORM_WHATSAPP_URL, PLATFORM_EMAIL, PLATFORM_PHONE_DISPLAY } from '../../../core/services/platform-contact';

/** Pied de page Findoor — présent sur toutes les pages de l'application (voir chaque feature standalone). */
@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="site">
      <div class="wrap">
        <div class="foot-grid">
          <div>
            <a class="brand" routerLink="/">
              <span class="mark"><svg class="icon" viewBox="0 0 24 24"><path d="M5 21V11a7 7 0 0 1 14 0v10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 21v-6a3 3 0 0 1 6 0v6" fill="none" stroke="currentColor" stroke-width="2"/></svg></span>
              Findoor
            </a>
            <p class="tagline">{{ i18n.t('footer.tagline') }}</p>
          </div>
          <div>
            <h4>{{ i18n.t('footer.explore') }}</h4>
            <ul>
              <li><a (click)="goCategory('louer')">{{ i18n.t('nav.rent') }}</a></li>
              <li><a (click)="goCategory('acheter')">{{ i18n.t('nav.buy') }}</a></li>
              <li><a routerLink="/inscription">{{ i18n.t('nav.publish') }}</a></li>
            </ul>
          </div>
          <div>
            <h4>{{ i18n.t('footer.cities') }}</h4>
            <ul><li>Yaoundé</li><li>Douala</li><li>Kribi</li><li>Bafoussam</li></ul>
          </div>
          <div>
            <h4>{{ i18n.t('footer.about') }}</h4>
            <ul>
              <li>{{ i18n.t('footer.concept') }}</li>
              <li><a [href]="whatsappUrl" target="_blank" rel="noopener">{{ i18n.t('footer.contact') }} — {{ phoneDisplay }}</a></li>
              <li>
                <a [href]="'mailto:' + email" (click)="copierEmail()">{{ email }}</a>
                @if (emailCopie()) {
                  <span class="copied-hint">{{ i18n.t('footer.emailCopied') }}</span>
                }
              </li>
            </ul>
          </div>
        </div>
        <div class="foot-bottom">
          <span>{{ i18n.t('footer.rights') }}</span>
          <span class="foot-legal">
            <a routerLink="/mentions-legales">{{ i18n.t('footer.legalNotice') }}</a>
            <a routerLink="/politique-de-confidentialite">{{ i18n.t('footer.privacyPolicy') }}</a>
          </span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .wrap { max-width: 1180px; margin: 0 auto; padding: 0 28px; }
    @media (max-width: 720px) { .wrap { padding: 0 18px; } }
    .icon { width: 15px; height: 15px; color: var(--surface); }

    footer.site { background: var(--night); color: color-mix(in srgb, var(--ground) 78%, transparent); margin-top: 60px; }
    .foot-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 32px; padding: 50px 0 30px; }
    @media (max-width: 780px) { .foot-grid { grid-template-columns: 1fr 1fr; row-gap: 30px; } }
    @media (max-width: 480px) { .foot-grid { grid-template-columns: 1fr; } }

    .brand { display: flex; align-items: center; gap: 9px; font-family: var(--font-display); font-weight: 800; font-size: 1.15rem; color: var(--ground); text-decoration: none; margin-bottom: 10px; }
    .brand .mark { width: 26px; height: 26px; border-radius: 13px 13px 3px 3px; background: linear-gradient(160deg, var(--gold), var(--gold-strong)); display: flex; align-items: center; justify-content: center; }
    .tagline { font-size: .85rem; color: color-mix(in srgb, var(--ground) 60%, transparent); max-width: 32ch; margin: 0; }

    footer.site h4 { font-family: var(--font-display); font-size: .82rem; text-transform: uppercase; letter-spacing: .05em; color: color-mix(in srgb, var(--ground) 55%, transparent); margin: 0 0 12px; }
    footer.site ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 9px; }
    footer.site li { font-size: .87rem; }
    footer.site a { color: color-mix(in srgb, var(--ground) 82%, transparent); text-decoration: none; cursor: pointer; }
    footer.site a:hover { color: var(--gold); }
    .copied-hint { margin-left: 8px; font-size: .76rem; color: var(--gold); font-weight: 700; }

    .foot-bottom { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; border-top: 1px solid color-mix(in srgb, var(--ground) 14%, transparent); padding: 18px 0; font-size: .78rem; color: color-mix(in srgb, var(--ground) 50%, transparent); }
    .foot-legal { display: flex; gap: 16px; }
    .foot-legal a { color: inherit; }
    .foot-legal a:hover { color: var(--gold); }
  `],
})
export class SiteFooterComponent {
  private readonly router = inject(Router);
  private readonly listingsService = inject(ListingsService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly i18n = inject(I18nService);

  readonly whatsappUrl = PLATFORM_WHATSAPP_URL;
  readonly email = PLATFORM_EMAIL;
  readonly phoneDisplay = PLATFORM_PHONE_DISPLAY;
  readonly emailCopie = signal(false);

  goCategory(transaction: Transaction): void {
    this.listingsService.resetFilters();
    this.listingsService.setFilters({ transaction });
    this.router.navigate(['/recherche']);
  }

  /**
   * Copie l'adresse dans le presse-papiers en plus du `mailto:` — beaucoup de navigateurs n'ont
   * aucun client mail configuré, donc le clic ne semble sinon "rien faire" (bug signalé).
   */
  copierEmail(): void {
    if (!isPlatformBrowser(this.platformId) || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(this.email)
      .then(() => {
        this.emailCopie.set(true);
        setTimeout(() => this.emailCopie.set(false), 2500);
      })
      .catch(() => void 0);
  }
}
