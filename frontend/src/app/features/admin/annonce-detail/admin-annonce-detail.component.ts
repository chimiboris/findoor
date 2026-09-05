import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TopNavComponent } from '../../../shared/components/top-nav/top-nav.component';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';
import { SiteFooterComponent } from '../../../shared/components/site-footer/site-footer.component';
import { AdminService } from '../../../core/services/admin.service';
import { I18nService } from '../../../core/services/i18n.service';
import { mediaUrl } from '../../../core/services/api-base';
import { REGIONS, arrOf, departementsOf } from '../../../core/data/geo-cameroun';
import { TYPES_ACHETER, TYPES_LOUER, Transaction } from '../../../core/models/property.model';
import { AnnonceFormValue, emptyAnnonceForm } from '../../../core/models/annonce-create.model';
import { UserAdmin } from '../../../core/models/admin.model';
import { statutVisibilite as calculerStatutVisibilite } from '../../../core/utils/annonce-statut.util';

type Mode = 'vue' | 'edition';

/**
 * Back-office — fiche annonce (admin) : création (route sans :id, avec choix obligatoire du
 * propriétaire, toujours en mode édition) ou consultation (route :id, ouvre d'abord une vue en
 * lecture seule — bouton "Modifier" pour basculer sur le formulaire), avec les actions de modération
 * (suspendre/réactiver/supprimer) directement sur la fiche — CRUD complet pour l'administrateur.
 */
@Component({
  selector: 'app-admin-annonce-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TopNavComponent, BackButtonComponent, SiteFooterComponent],
  templateUrl: './admin-annonce-detail.component.html',
  styleUrl: './admin-annonce-detail.component.scss',
})
export class AdminAnnonceDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adminService = inject(AdminService);
  readonly i18n = inject(I18nService);
  readonly mediaUrl = mediaUrl;

  readonly PHOTOS_MIN = 2;
  readonly PHOTOS_MAX = 5;

  readonly regions = REGIONS;
  readonly editId = signal<number | null>(null);
  readonly mode = signal<Mode>('edition');
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly confirmingDelete = signal(false);

  readonly form = signal<AnnonceFormValue>(emptyAnnonceForm());
  readonly existingPhotos = signal<string[]>([]);
  readonly newFiles = signal<{ file: File; preview: string }[]>([]);
  readonly nouvelEquip = signal('');

  readonly ownerUserId = signal<number | null>(null);
  readonly ownerNom = signal<string>('');
  readonly owners = signal<UserAdmin[]>([]);
  readonly ownerTelephone = signal<string | null>(null);
  readonly actif = signal<boolean>(true);
  readonly abonnementProprietaireActif = signal<boolean>(true);
  readonly selectedPhoto = signal(0);
  readonly statutVisibilite = computed(() => calculerStatutVisibilite({ actif: this.actif(), abonnementProprietaireActif: this.abonnementProprietaireActif() }));

  readonly depts = computed(() => departementsOf(this.form().region));
  readonly arrs = computed(() => arrOf(this.form().region, this.form().departement));
  readonly types = computed(() => (this.form().transaction === 'louer' ? TYPES_LOUER : TYPES_ACHETER));
  readonly estTerrain = computed(() => this.form().type === 'Terrain');
  readonly prixTotalEstime = computed(() => {
    const f = this.form();
    return f.uniteM2 && f.prix && f.surface ? f.prix * f.surface : null;
  });
  readonly totalPhotos = computed(() => this.existingPhotos().length + this.newFiles().length);

  constructor() {
    this.chargerProprietaires();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.editId.set(id);
      this.mode.set('vue');
      this.charger(id);
    }
  }

  private async chargerProprietaires(): Promise<void> {
    try {
      const tous = await this.adminService.utilisateurs();
      this.owners.set(tous.filter((u) => u.role !== 'VISITEUR' && u.actif).sort((a, b) => a.nom.localeCompare(b.nom)));
    } catch {
      // Non bloquant : le sélecteur restera vide, l'utilisateur peut réessayer en rechargeant.
    }
  }

  private async charger(id: number): Promise<void> {
    this.loading.set(true);
    try {
      const a = await this.adminService.uneAnnonce(id);
      this.form.set({
        transaction: a.transaction,
        type: a.type,
        meuble: a.meuble ?? null,
        region: a.region,
        departement: a.departement,
        ville: a.ville,
        quartier: a.quartier,
        prix: a.prix,
        unite: a.unite ?? '',
        uniteM2: !!a.uniteM2,
        prixTotal: a.prixTotal ?? null,
        titre: a.titre,
        surface: a.surface,
        pieces: a.pieces ?? null,
        chambres: a.chambres ?? null,
        desc: a.desc,
        equip: [...a.equip],
      });
      this.existingPhotos.set([...(a.photos ?? [])]);
      this.ownerUserId.set(a.ownerUserId ?? null);
      this.ownerNom.set(a.owner);
      this.ownerTelephone.set(a.ownerTelephone ?? null);
      this.actif.set(a.actif ?? true);
      this.abonnementProprietaireActif.set(a.abonnementProprietaireActif ?? true);
      this.selectedPhoto.set(0);
    } catch {
      this.error.set(this.i18n.t('form.errorLoad'));
    } finally {
      this.loading.set(false);
    }
  }

  choisirPhoto(index: number): void {
    this.selectedPhoto.set(index);
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
      this.router.navigateByUrl('/admin/annonces');
    }
  }

  patch(p: Partial<AnnonceFormValue>): void {
    this.form.update((f) => ({ ...f, ...p }));
  }

  fmt(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(n);
  }

  setTransaction(t: Transaction): void {
    const types = t === 'louer' ? TYPES_LOUER : TYPES_ACHETER;
    const type = types[0];
    this.patch({ transaction: t, type, meuble: t === 'louer' ? true : null, uniteM2: type === 'Terrain', unite: t === 'louer' ? '/mois' : '' });
  }

  setType(type: string): void {
    this.patch({ type, uniteM2: type === 'Terrain' });
  }

  onRegionChange(region: string): void {
    this.patch({ region, departement: '', ville: '' });
  }

  onDeptChange(departement: string): void {
    this.patch({ departement, ville: '' });
  }

  onOwnerChange(id: string): void {
    this.ownerUserId.set(id ? Number(id) : null);
  }

  ajouterEquip(): void {
    const v = this.nouvelEquip().trim();
    if (!v) return;
    this.patch({ equip: [...this.form().equip, v] });
    this.nouvelEquip.set('');
  }

  retirerEquip(i: number): void {
    this.patch({ equip: this.form().equip.filter((_, idx) => idx !== i) });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    const placesRestantes = Math.max(0, this.PHOTOS_MAX - this.totalPhotos());
    if (files.length > placesRestantes) {
      this.error.set(this.i18n.t('form.errorPhotosMax', { max: this.PHOTOS_MAX }));
    }
    const ajouts = files.slice(0, placesRestantes).map((file) => ({ file, preview: URL.createObjectURL(file) }));
    this.newFiles.update((f) => [...f, ...ajouts]);
    input.value = '';
  }

  retirerNouveauFichier(i: number): void {
    this.newFiles.update((f) => f.filter((_, idx) => idx !== i));
  }

  retirerPhotoExistante(url: string): void {
    this.existingPhotos.update((p) => p.filter((x) => x !== url));
  }

  async submit(): Promise<void> {
    this.error.set(null);
    const f = this.form();
    if (!this.ownerUserId()) {
      this.error.set(this.i18n.t('admin.errorOwnerRequired'));
      return;
    }
    if (!f.region || !f.departement || !f.ville || !f.quartier.trim() || !f.titre.trim() || !f.desc.trim() || !f.prix || !f.surface) {
      this.error.set(this.i18n.t('form.errorRequired'));
      return;
    }
    if (this.totalPhotos() < this.PHOTOS_MIN || this.totalPhotos() > this.PHOTOS_MAX) {
      this.error.set(this.i18n.t('form.errorPhotosRange', { min: this.PHOTOS_MIN, max: this.PHOTOS_MAX }));
      return;
    }

    this.saving.set(true);
    try {
      const payload: AnnonceFormValue = {
        ...f,
        prixTotal: f.uniteM2 ? this.prixTotalEstime() : null,
        keepPhotos: this.existingPhotos(),
        ownerUserId: this.ownerUserId(),
      };
      const photos = this.newFiles().map((n) => n.file);
      const id = this.editId();
      if (id) {
        await this.adminService.modifierAnnonce(id, payload, photos);
        this.mode.set('vue');
        await this.charger(id);
      } else {
        const resultat = await this.adminService.creerAnnonce(payload, photos);
        this.router.navigate(['/admin/annonces', resultat.id]);
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
    this.busy.set(true);
    try {
      const maj = await this.adminService.basculerAnnonce(id);
      this.actif.set(maj.actif ?? true);
      this.abonnementProprietaireActif.set(maj.abonnementProprietaireActif ?? true);
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
    try {
      await this.adminService.supprimerAnnonce(id);
      this.router.navigateByUrl('/admin/annonces');
    } finally {
      this.busy.set(false);
    }
  }
}
