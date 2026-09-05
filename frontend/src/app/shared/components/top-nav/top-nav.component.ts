import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { SessionService } from '../../../core/services/session.service';
import { I18nService } from '../../../core/services/i18n.service';
import { FavorisService } from '../../../core/services/favoris.service';
import type { Lang } from '../../../core/i18n/translations';

/** En-tête partagé (accueil / recherche / fiche annonce) — port fidèle de la maquette phase 2. */
@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  template: `
    @if (session.isAuthenticated()) {
      <div class="greeting-bar">
        <div class="wrap">
          <span>{{ greeting() }}, {{ session.user()?.prenom }}</span>
          <span class="wave">👋</span>
        </div>
      </div>
    }
    <header class="top">
      <div class="wrap top-row">
        <a class="brand" routerLink="/">
          <span class="mark">
            <svg class="icon" viewBox="0 0 24 24"><path d="M5 21V11a7 7 0 0 1 14 0v10" stroke-width="2" fill="none" stroke="currentColor"/><path d="M9 21v-6a3 3 0 0 1 6 0v6" stroke-width="2" fill="none" stroke="currentColor"/></svg>
          </span>
          Findoor
        </a>
        <nav class="primary-nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">{{ i18n.t('nav.home') }}</a>
          <a routerLink="/recherche" [queryParams]="{ transaction: 'louer' }" routerLinkActive="active">{{ i18n.t('nav.rent') }}</a>
          <a routerLink="/recherche" [queryParams]="{ transaction: 'acheter' }" routerLinkActive="active">{{ i18n.t('nav.buy') }}</a>
        </nav>
        <div class="top-actions">
          <a class="fav-link" routerLink="/favoris" [attr.aria-label]="i18n.t('nav.favoris')" [title]="i18n.t('nav.favoris')">
            <svg class="icon" viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.3C.4 8.2 2 4.5 5.6 4c2-.3 3.9.5 5.1 2.2C11.9 4.5 13.8 3.7 15.8 4c3.6.5 5.2 4.2 3.6 7.7C21.5 16.4 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
            @if (favoris.ids().length > 0) { <span class="fav-count">{{ favoris.ids().length }}</span> }
          </a>
          <label class="lang-switch" [attr.aria-label]="i18n.t('nav.lang')" [title]="i18n.t('nav.lang')">
            <svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
            <select [ngModel]="i18n.lang()" (ngModelChange)="setLang($event)" name="lang">
              <option value="fr">FR</option>
              <option value="en">EN</option>
            </select>
          </label>
          <button class="theme-toggle" (click)="theme.toggle()" [attr.aria-label]="i18n.t('nav.theme')" [title]="i18n.t('nav.theme')">
            @if (theme.theme() === 'dark') {
              <svg class="icon" viewBox="0 0 24 24"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
            } @else {
              <svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v2.6M12 18.9v2.6M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12h2.6M18.9 12h2.6M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            }
            <span>{{ i18n.t('nav.theme') }}</span>
          </button>
          @if (session.hasRole('ADMIN')) {
            <a class="btn btn-ghost btn-sm" routerLink="/admin/tableau-de-bord">{{ i18n.t('admin.nav') }}</a>
            <button class="btn btn-gold btn-sm" type="button" (click)="deconnexion()">{{ i18n.t('nav.logout') }}</button>
          } @else if (session.isAuthenticated()) {
            <a class="btn btn-ghost btn-sm" routerLink="/proprietaire/tableau-de-bord">{{ i18n.t('nav.myspace') }}</a>
            <button class="btn btn-gold btn-sm" type="button" (click)="deconnexion()">{{ i18n.t('nav.logout') }}</button>
          } @else {
            <a class="btn btn-ghost btn-sm" routerLink="/connexion">{{ i18n.t('nav.login') }}</a>
            <a class="btn btn-gold btn-sm" routerLink="/inscription">{{ i18n.t('nav.publish') }}</a>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .wrap { max-width: 1180px; margin: 0 auto; padding: 0 28px; }
    @media (max-width: 720px) { .wrap { padding: 0 18px; } }

    .greeting-bar { background: color-mix(in srgb, var(--gold) 14%, var(--surface)); border-bottom: 1px solid var(--border); }
    .greeting-bar .wrap { display: flex; align-items: center; gap: 6px; padding: 7px 28px; font-size: .82rem; font-weight: 700; color: var(--ink); }
    @media (max-width: 720px) { .greeting-bar .wrap { padding: 7px 18px; } }
    .greeting-bar .wave { font-size: .95rem; }

    header.top {
      position: sticky; top: 0; z-index: 40;
      background: var(--ground);
      border-bottom: 1px solid var(--border);
    }
    .top-row { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 28px; padding: 15px 0; }
    .brand { display: flex; align-items: center; gap: 9px; font-family: var(--font-display); font-weight: 800; font-size: 1.28rem; color: var(--ink); text-decoration: none; }
    .brand .mark { width: 30px; height: 30px; border-radius: 15px 15px 3px 3px; background: linear-gradient(160deg, var(--gold), var(--gold-strong)); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow); }
    .brand .mark .icon { width: 15px; height: 15px; color: var(--surface); }
    .primary-nav { display: flex; align-items: center; gap: 4px; margin-left: 6px; }
    .primary-nav a { background: none; border: none; padding: 9px 14px; border-radius: 999px; color: var(--ink-soft); font-weight: 600; font-size: .93rem; text-decoration: none; transition: background .15s, color .15s; }
    .primary-nav a:hover, .primary-nav a.active { color: var(--ink); background: var(--surface-raised); }
    .top-actions { margin-left: auto; display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 10px; }
    @media (max-width: 780px) { .primary-nav { display: none; } }

    .fav-link {
      position: relative; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px;
      border-radius: 999px; border: 1px solid var(--border); background: var(--surface); color: var(--ink);
      transition: border-color .15s, color .15s;
    }
    .fav-link:hover { border-color: var(--sale); color: var(--sale); }
    .fav-link .icon { width: 1.15em; height: 1.15em; }
    .fav-count {
      position: absolute; top: -4px; right: -4px; min-width: 16px; height: 16px; padding: 0 4px; border-radius: 999px;
      background: var(--sale); color: #fff; font-size: .62rem; font-weight: 800; display: flex; align-items: center; justify-content: center;
    }

    .lang-switch {
      display: flex; align-items: center; gap: 5px; height: 38px; padding: 0 10px;
      border-radius: 999px; border: 1px solid var(--border); background: var(--surface); color: var(--ink);
      cursor: pointer; transition: border-color .15s, color .15s;
    }
    .lang-switch:hover { border-color: var(--gold); color: var(--gold-strong); }
    .lang-switch .icon { width: 1.1em; height: 1.1em; flex-shrink: 0; }
    .lang-switch select {
      border: none; background: transparent; color: inherit; font-weight: 700; font-size: .82rem;
      font-family: var(--font-body); cursor: pointer; appearance: none; padding: 0 2px;
    }
    .lang-switch select:focus { outline: none; }

    .theme-toggle {
      display: flex; align-items: center; justify-content: center; gap: 7px; height: 38px; padding: 0 15px;
      border-radius: 999px; border: 1px solid var(--border); background: var(--surface); color: var(--ink);
      font-weight: 700; font-size: .87rem; font-family: var(--font-body); white-space: nowrap; cursor: pointer;
      transition: border-color .15s, color .15s;
    }
    .theme-toggle:hover { border-color: var(--gold); color: var(--gold-strong); }
    .theme-toggle .icon { width: 1.15em; height: 1.15em; }
    @media (max-width: 560px) { .theme-toggle span { display: none; } .theme-toggle { padding: 0; width: 38px; } }

    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; border-radius: 999px; border: 1px solid transparent; padding: 10px 20px; font-weight: 700; font-size: .92rem; white-space: nowrap; text-decoration: none; transition: transform .12s, box-shadow .12s, background .15s, border-color .15s; }
    .btn:active { transform: scale(.97); }
    .btn-gold { background: var(--gold); color: #fff; box-shadow: var(--shadow); }
    .btn-gold:hover { background: var(--gold-strong); }
    .btn-ghost { background: transparent; border-color: var(--border); color: var(--ink); }
    .btn-ghost:hover { border-color: var(--gold); color: var(--gold); }
    .btn-sm { padding: 7px 14px; font-size: .82rem; }
  `],
})
export class TopNavComponent {
  readonly theme = inject(ThemeService);
  readonly session = inject(SessionService);
  readonly i18n = inject(I18nService);
  readonly favoris = inject(FavorisService);
  private readonly router = inject(Router);

  setLang(lang: Lang): void {
    this.i18n.set(lang);
  }

  /** Message d'accueil selon l'heure locale — affiché au-dessus de l'en-tête sur toutes les pages
   * une fois connecté (propriétaire ou admin). */
  greeting(): string {
    const heure = new Date().getHours();
    if (heure < 12) return this.i18n.t('nav.greetingMorning');
    if (heure < 18) return this.i18n.t('nav.greetingAfternoon');
    return this.i18n.t('nav.greetingEvening');
  }

  deconnexion(): void {
    this.session.logout();
    this.router.navigateByUrl('/');
  }
}
