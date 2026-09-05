import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TopNavComponent } from '../../../shared/components/top-nav/top-nav.component';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';
import { SiteFooterComponent } from '../../../shared/components/site-footer/site-footer.component';
import { AdminService } from '../../../core/services/admin.service';
import { I18nService } from '../../../core/services/i18n.service';
import { UserAdmin } from '../../../core/models/admin.model';

/**
 * Gestion des comptes — tous les utilisateurs, cliquables vers leur fiche complète (CRUD, y compris
 * suspendre/réactiver/supprimer d'autres comptes ADMIN — seul son propre compte reste protégé, voir
 * AdminUtilisateurDetailComponent).
 */
@Component({
  selector: 'app-admin-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TopNavComponent, BackButtonComponent, SiteFooterComponent],
  templateUrl: './admin-utilisateurs.component.html',
  styleUrl: './admin-utilisateurs.component.scss',
})
export class AdminUtilisateursComponent {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  readonly i18n = inject(I18nService);

  readonly loading = signal(true);
  readonly utilisateurs = signal<UserAdmin[]>([]);
  readonly recherche = signal('');
  readonly busyId = signal<number | null>(null);
  readonly erreur = signal<string | null>(null);

  readonly filtres = computed(() => {
    const q = this.recherche().trim().toLowerCase();
    if (!q) return this.utilisateurs();
    return this.utilisateurs().filter(
      (u) => u.nom.toLowerCase().includes(q) || u.prenom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  });

  constructor() {
    this.charger();
  }

  voir(u: UserAdmin): void {
    this.router.navigate(['/admin/utilisateurs', u.id]);
  }

  async charger(): Promise<void> {
    this.loading.set(true);
    try {
      this.utilisateurs.set(await this.adminService.utilisateurs());
    } finally {
      this.loading.set(false);
    }
  }

  async basculer(u: UserAdmin): Promise<void> {
    this.erreur.set(null);
    this.busyId.set(u.id);
    try {
      const maj = await this.adminService.basculerUtilisateur(u.id);
      this.utilisateurs.update((liste) => liste.map((x) => (x.id === u.id ? maj : x)));
    } catch {
      this.erreur.set(this.i18n.t('admin.cannotSuspendAdmin'));
    } finally {
      this.busyId.set(null);
    }
  }

  formatDate(iso: string): string {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(iso));
  }
}
