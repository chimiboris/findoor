import { Component, Input, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { I18nService } from '../../../core/services/i18n.service';

/**
 * Bouton "Retour" réutilisable, affiché en haut à gauche de chaque page (sous l'en-tête).
 * Revient dans l'historique du navigateur quand c'est possible, sinon navigue vers `fallback`.
 */
@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button type="button" class="back-btn" (click)="goBack()">
      <svg class="icon" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" fill="none" stroke="currentColor" stroke-width="2.6"/></svg>
      {{ label || i18n.t('common.back') }}
    </button>
  `,
  styles: [`
    .back-btn {
      display: inline-flex; align-items: center; gap: 8px; margin: 18px 0 0;
      background: transparent; border: none; padding: 0; cursor: pointer;
      font-weight: 700; font-size: .87rem; color: var(--ink-soft); font-family: var(--font-body);
    }
    .back-btn:hover { color: var(--gold-strong); }
    .icon { width: 1.35em; height: 1.35em; }
  `],
})
export class BackButtonComponent {
  @Input() label = '';
  @Input() fallback = '/';

  readonly i18n = inject(I18nService);
  private readonly location = inject(Location);
  private readonly router = inject(Router);

  goBack(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigateByUrl(this.fallback);
    }
  }
}
