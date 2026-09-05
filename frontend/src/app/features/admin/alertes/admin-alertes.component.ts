import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopNavComponent } from '../../../shared/components/top-nav/top-nav.component';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';
import { SiteFooterComponent } from '../../../shared/components/site-footer/site-footer.component';
import { AlerteService } from '../../../core/services/alerte.service';
import { I18nService } from '../../../core/services/i18n.service';
import { Alerte } from '../../../core/models/alerte.model';

/** Supervision des alertes de recherche (phase 6) — lecture seule, pour suivre l'usage de la fonctionnalité. */
@Component({
  selector: 'app-admin-alertes',
  standalone: true,
  imports: [CommonModule, FormsModule, TopNavComponent, BackButtonComponent, SiteFooterComponent],
  templateUrl: './admin-alertes.component.html',
  styleUrl: './admin-alertes.component.scss',
})
export class AdminAlertesComponent {
  private readonly alerteService = inject(AlerteService);
  readonly i18n = inject(I18nService);

  readonly loading = signal(true);
  readonly alertes = signal<Alerte[]>([]);
  readonly recherche = signal('');

  readonly filtres = computed(() => {
    const q = this.recherche().trim().toLowerCase();
    if (!q) return this.alertes();
    return this.alertes().filter((a) => a.email.toLowerCase().includes(q));
  });

  readonly actives = computed(() => this.alertes().filter((a) => a.actif).length);

  constructor() {
    this.charger();
  }

  async charger(): Promise<void> {
    this.loading.set(true);
    try {
      this.alertes.set(await this.alerteService.toutes());
    } finally {
      this.loading.set(false);
    }
  }

  resumeCriteres(a: Alerte): string {
    const parts: string[] = [a.transaction === 'louer' ? this.i18n.t('nav.rent') : this.i18n.t('nav.buy')];
    if (a.region) parts.push(a.region);
    if (a.departement) parts.push(a.departement);
    if (a.arrondissement) parts.push(a.arrondissement);
    if (a.quartier) parts.push(a.quartier);
    if (a.types.length) parts.push(a.types.join(', '));
    if (a.prixMin != null || a.prixMax != null) {
      parts.push(`${a.prixMin ?? '…'} - ${a.prixMax ?? '…'} FCFA`);
    }
    return parts.join(' · ');
  }

  formatDate(iso: string): string {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(iso));
  }
}
