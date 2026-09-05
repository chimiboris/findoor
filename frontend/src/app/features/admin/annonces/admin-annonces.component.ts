import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TopNavComponent } from '../../../shared/components/top-nav/top-nav.component';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';
import { SiteFooterComponent } from '../../../shared/components/site-footer/site-footer.component';
import { AdminService } from '../../../core/services/admin.service';
import { I18nService } from '../../../core/services/i18n.service';
import { mediaUrl } from '../../../core/services/api-base';
import { Annonce } from '../../../core/models/property.model';
import { statutVisibilite } from '../../../core/utils/annonce-statut.util';

type FiltreStatut = 'tous' | 'actives' | 'suspendues';

/** Modération des annonces — toutes les annonces (tous propriétaires), suspendre/réactiver/supprimer. */
@Component({
  selector: 'app-admin-annonces',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TopNavComponent, BackButtonComponent, SiteFooterComponent],
  templateUrl: './admin-annonces.component.html',
  styleUrl: './admin-annonces.component.scss',
})
export class AdminAnnoncesComponent {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  readonly i18n = inject(I18nService);
  readonly mediaUrl = mediaUrl;

  readonly loading = signal(true);
  readonly annonces = signal<Annonce[]>([]);
  readonly recherche = signal('');
  readonly filtreStatut = signal<FiltreStatut>('tous');
  readonly confirmingDeleteId = signal<number | null>(null);
  readonly busyId = signal<number | null>(null);

  readonly filtrees = computed(() => {
    const q = this.recherche().trim().toLowerCase();
    const statut = this.filtreStatut();
    return this.annonces().filter((a) => {
      if (statut === 'actives' && !a.actif) return false;
      if (statut === 'suspendues' && a.actif) return false;
      if (!q) return true;
      return (
        a.titre.toLowerCase().includes(q) ||
        a.ville.toLowerCase().includes(q) ||
        a.quartier.toLowerCase().includes(q) ||
        a.owner.toLowerCase().includes(q)
      );
    });
  });

  constructor() {
    this.charger();
  }

  readonly statutVisibilite = statutVisibilite;

  voir(a: Annonce): void {
    this.router.navigate(['/admin/annonces', a.id]);
  }

  async charger(): Promise<void> {
    this.loading.set(true);
    try {
      this.annonces.set(await this.adminService.annonces());
    } finally {
      this.loading.set(false);
    }
  }

  async basculer(a: Annonce): Promise<void> {
    this.busyId.set(a.id);
    try {
      const maj = await this.adminService.basculerAnnonce(a.id);
      this.annonces.update((liste) => liste.map((x) => (x.id === a.id ? maj : x)));
    } finally {
      this.busyId.set(null);
    }
  }

  demanderSuppression(id: number): void {
    this.confirmingDeleteId.set(id);
  }

  annulerSuppression(): void {
    this.confirmingDeleteId.set(null);
  }

  async confirmerSuppression(id: number): Promise<void> {
    this.busyId.set(id);
    try {
      await this.adminService.supprimerAnnonce(id);
      this.annonces.update((liste) => liste.filter((x) => x.id !== id));
      this.confirmingDeleteId.set(null);
    } finally {
      this.busyId.set(null);
    }
  }

  fmt(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(n);
  }

  prixAffiche(a: Annonce): string {
    if (a.uniteM2) return `${this.fmt(a.prix)} FCFA/m²`;
    return `${this.fmt(a.prix)} FCFA${a.unite ? ' ' + a.unite : ''}`;
  }
}
