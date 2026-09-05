import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TopNavComponent } from '../../../shared/components/top-nav/top-nav.component';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';
import { SiteFooterComponent } from '../../../shared/components/site-footer/site-footer.component';
import { AvisService } from '../../../core/services/avis.service';
import { I18nService } from '../../../core/services/i18n.service';
import { Avis } from '../../../core/models/avis.model';

type Onglet = 'EN_ATTENTE' | 'PUBLIE' | 'REJETE' | 'TOUS';

/** Modération des avis (phase 6) — file d'attente + historique, seul un ADMIN peut publier/rejeter/supprimer. */
@Component({
  selector: 'app-admin-avis',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TopNavComponent, BackButtonComponent, SiteFooterComponent],
  templateUrl: './admin-avis.component.html',
  styleUrl: './admin-avis.component.scss',
})
export class AdminAvisComponent {
  private readonly avisService = inject(AvisService);
  readonly i18n = inject(I18nService);

  readonly loading = signal(true);
  readonly avis = signal<Avis[]>([]);
  readonly onglet = signal<Onglet>('EN_ATTENTE');
  readonly busyId = signal<number | null>(null);
  readonly erreur = signal<string | null>(null);

  readonly filtres = computed(() => {
    const o = this.onglet();
    if (o === 'TOUS') return this.avis();
    return this.avis().filter((a) => a.statut === o);
  });

  readonly compteurs = computed(() => {
    const liste = this.avis();
    return {
      EN_ATTENTE: liste.filter((a) => a.statut === 'EN_ATTENTE').length,
      PUBLIE: liste.filter((a) => a.statut === 'PUBLIE').length,
      REJETE: liste.filter((a) => a.statut === 'REJETE').length,
      TOUS: liste.length,
    };
  });

  constructor() {
    this.charger();
  }

  async charger(): Promise<void> {
    this.loading.set(true);
    try {
      this.avis.set(await this.avisService.tousLesAvis());
    } finally {
      this.loading.set(false);
    }
  }

  async approuver(a: Avis): Promise<void> {
    this.erreur.set(null);
    this.busyId.set(a.id);
    try {
      const maj = await this.avisService.approuver(a.id);
      this.avis.update((liste) => liste.map((x) => (x.id === a.id ? maj : x)));
    } catch {
      this.erreur.set(this.i18n.t('admin.avisActionError'));
    } finally {
      this.busyId.set(null);
    }
  }

  async rejeter(a: Avis): Promise<void> {
    this.erreur.set(null);
    this.busyId.set(a.id);
    try {
      const maj = await this.avisService.rejeter(a.id);
      this.avis.update((liste) => liste.map((x) => (x.id === a.id ? maj : x)));
    } catch {
      this.erreur.set(this.i18n.t('admin.avisActionError'));
    } finally {
      this.busyId.set(null);
    }
  }

  async supprimer(a: Avis): Promise<void> {
    if (!confirm(this.i18n.t('admin.avisDeleteConfirm'))) return;
    this.erreur.set(null);
    this.busyId.set(a.id);
    try {
      await this.avisService.supprimer(a.id);
      this.avis.update((liste) => liste.filter((x) => x.id !== a.id));
    } catch {
      this.erreur.set(this.i18n.t('admin.avisActionError'));
    } finally {
      this.busyId.set(null);
    }
  }

  formatDate(iso: string): string {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  }

  readonly stars = [1, 2, 3, 4, 5];
}
