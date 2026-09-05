import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TopNavComponent } from '../../../shared/components/top-nav/top-nav.component';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';
import { SiteFooterComponent } from '../../../shared/components/site-footer/site-footer.component';
import { AdminService } from '../../../core/services/admin.service';
import { SessionService } from '../../../core/services/session.service';
import { I18nService } from '../../../core/services/i18n.service';
import { mediaUrl } from '../../../core/services/api-base';
import { Role } from '../../../core/models/auth.models';
import { Annonce } from '../../../core/models/property.model';
import { statutVisibilite } from '../../../core/utils/annonce-statut.util';

type Mode = 'vue' | 'edition';

interface UtilisateurFormValue {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: Role;
  motDePasse: string;
  confirmerMotDePasse: string;
  nouveauMotDePasse: string;
  confirmerNouveauMotDePasse: string;
  /** Chaîne ISO ("2027-03-15") liée à un <input type="date">, ou '' pour aucun accès. */
  dateAccesExpire: string;
}

function emptyForm(): UtilisateurFormValue {
  return {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: 'PROPRIETAIRE',
    motDePasse: '',
    confirmerMotDePasse: '',
    nouveauMotDePasse: '',
    confirmerNouveauMotDePasse: '',
    dateAccesExpire: '',
  };
}

/**
 * Back-office — fiche compte utilisateur (admin) : création (route "nouveau", toujours en mode
 * édition, y compris d'autres comptes ADMIN) ou consultation (route :id, ouvre d'abord une vue en
 * lecture seule — bouton "Modifier" pour basculer sur le formulaire, ou lien direct avec ?edit=1
 * depuis la liste des propriétaires) avec suspendre/réactiver/supprimer, l'état d'abonnement (phase
 * 4 — modifiable manuellement par l'admin, ex. paiement en échec réseau) et la liste des annonces de
 * ce compte (cliquables vers leur fiche admin) — CRUD complet côté administrateur.
 */
@Component({
  selector: 'app-admin-utilisateur-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TopNavComponent, BackButtonComponent, SiteFooterComponent],
  templateUrl: './admin-utilisateur-detail.component.html',
  styleUrl: './admin-utilisateur-detail.component.scss',
})
export class AdminUtilisateurDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adminService = inject(AdminService);
  private readonly session = inject(SessionService);
  readonly i18n = inject(I18nService);
  readonly mediaUrl = mediaUrl;

  readonly editId = signal<number | null>(null);
  readonly mode = signal<Mode>('edition');
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly confirmingDelete = signal(false);

  readonly form = signal<UtilisateurFormValue>(emptyForm());
  readonly actif = signal<boolean>(true);
  readonly dateCreation = signal<string | null>(null);
  readonly emailVerifie = signal<boolean>(false);
  readonly abonnementActif = signal<boolean>(false);

  readonly annonces = signal<Annonce[]>([]);
  readonly annoncesLoading = signal(false);

  readonly showPassword = signal(false);
  readonly showConfirm = signal(false);
  readonly showNewPassword = signal(false);
  readonly showConfirmNew = signal(false);

  readonly estSoiMeme = computed(() => this.editId() !== null && this.editId() === this.session.user()?.id);

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.editId.set(id);
      this.mode.set(this.route.snapshot.queryParamMap.get('edit') === '1' ? 'edition' : 'vue');
      this.charger(id);
      this.chargerAnnonces(id);
    }
  }

  private async charger(id: number): Promise<void> {
    this.loading.set(true);
    try {
      const u = await this.adminService.unUtilisateur(id);
      this.form.set({
        nom: u.nom,
        prenom: u.prenom,
        email: u.email,
        telephone: u.telephone,
        role: u.role,
        motDePasse: '',
        confirmerMotDePasse: '',
        nouveauMotDePasse: '',
        confirmerNouveauMotDePasse: '',
        dateAccesExpire: u.dateAccesExpire ?? '',
      });
      this.actif.set(u.actif);
      this.dateCreation.set(u.dateCreation);
      this.emailVerifie.set(u.emailVerifie);
      this.abonnementActif.set(u.abonnementActif);
    } catch {
      this.error.set(this.i18n.t('admin.errorLoadUser'));
    } finally {
      this.loading.set(false);
    }
  }

  private async chargerAnnonces(id: number): Promise<void> {
    this.annoncesLoading.set(true);
    try {
      const toutes = await this.adminService.annonces();
      this.annonces.set(toutes.filter((a) => a.ownerUserId === id));
    } finally {
      this.annoncesLoading.set(false);
    }
  }

  modifier(): void {
    this.mode.set('edition');
  }

  annulerEdition(): void {
    const id = this.editId();
    if (id) {
      this.error.set(null);
      this.mode.set('vue');
      this.charger(id);
    } else {
      this.router.navigateByUrl('/admin/utilisateurs');
    }
  }

  patch(p: Partial<UtilisateurFormValue>): void {
    this.form.update((f) => ({ ...f, ...p }));
  }

  async submit(): Promise<void> {
    this.error.set(null);
    const f = this.form();
    if (!f.nom.trim() || !f.prenom.trim() || !f.email.trim() || !f.telephone.trim()) {
      this.error.set(this.i18n.t('form.errorRequired'));
      return;
    }
    const id = this.editId();
    if (!id && f.motDePasse.length < 8) {
      this.error.set(this.i18n.t('admin.errorPasswordLength'));
      return;
    }
    if (!id && f.motDePasse !== f.confirmerMotDePasse) {
      this.error.set(this.i18n.t('auth.passwordMismatch'));
      return;
    }
    if (id && f.nouveauMotDePasse && f.nouveauMotDePasse !== f.confirmerNouveauMotDePasse) {
      this.error.set(this.i18n.t('auth.passwordMismatch'));
      return;
    }

    this.saving.set(true);
    try {
      if (id) {
        const maj = await this.adminService.modifierUtilisateur(id, {
          nom: f.nom,
          prenom: f.prenom,
          email: f.email,
          telephone: f.telephone,
          role: f.role,
          dateAccesExpire: f.dateAccesExpire,
          ...(f.nouveauMotDePasse ? { nouveauMotDePasse: f.nouveauMotDePasse } : {}),
        });
        this.actif.set(maj.actif);
        this.abonnementActif.set(maj.abonnementActif);
        this.patch({ nouveauMotDePasse: '', confirmerNouveauMotDePasse: '' });
        this.mode.set('vue');
      } else {
        const cree = await this.adminService.creerUtilisateur({
          nom: f.nom,
          prenom: f.prenom,
          email: f.email,
          telephone: f.telephone,
          motDePasse: f.motDePasse,
          role: f.role,
          ...(f.dateAccesExpire ? { dateAccesExpire: f.dateAccesExpire } : {}),
        });
        this.router.navigate(['/admin/utilisateurs', cree.id]);
        return;
      }
    } catch {
      this.error.set(this.i18n.t('form.errorGeneric'));
    } finally {
      this.saving.set(false);
    }
  }

  async basculer(): Promise<void> {
    const id = this.editId();
    if (!id) return;
    this.error.set(null);
    this.busy.set(true);
    try {
      const maj = await this.adminService.basculerUtilisateur(id);
      this.actif.set(maj.actif);
    } catch {
      this.error.set(this.i18n.t('admin.cannotSuspendAdmin'));
    } finally {
      this.busy.set(false);
    }
  }

  demanderSuppression(): void {
    this.confirmingDelete.set(true);
  }

  annulerSuppression(): void {
    this.confirmingDelete.set(false);
  }

  async confirmerSuppression(): Promise<void> {
    const id = this.editId();
    if (!id) return;
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.adminService.supprimerUtilisateur(id);
      this.router.navigateByUrl('/admin/utilisateurs');
    } catch {
      this.error.set(this.i18n.t('admin.cannotSuspendAdmin'));
      this.confirmingDelete.set(false);
    } finally {
      this.busy.set(false);
    }
  }

  formatDate(iso: string): string {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(iso));
  }

  fmt(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(n);
  }

  roleLabel(): string {
    const key: Record<Role, string> = { VISITEUR: 'admin.roleVisiteur', PROPRIETAIRE: 'admin.roleProprietaire', ADMIN: 'admin.roleAdmin' };
    return this.i18n.t(key[this.form().role]);
  }

  readonly statutVisibilite = statutVisibilite;

  prixAffiche(a: Annonce): string {
    if (a.uniteM2) return `${this.fmt(a.prix)} FCFA/m²`;
    return `${this.fmt(a.prix)} FCFA${a.unite ? ' ' + a.unite : ''}`;
  }
}
