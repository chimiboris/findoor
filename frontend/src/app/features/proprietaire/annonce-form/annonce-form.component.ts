import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TopNavComponent } from '../../../shared/components/top-nav/top-nav.component';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';
import { SiteFooterComponent } from '../../../shared/components/site-footer/site-footer.component';
import { ProprietaireAnnoncesService } from '../../../core/services/proprietaire-annonces.service';
import { PaymentService } from '../../../core/services/payment.service';
import { I18nService } from '../../../core/services/i18n.service';
import { mediaUrl } from '../../../core/services/api-base';
import { describeAuthError } from '../../../core/utils/http-error.util';
import { REGIONS, arrOf, departementsOf } from '../../../core/data/geo-cameroun';
import { TYPES_ACHETER, TYPES_LOUER, Transaction } from '../../../core/models/property.model';
import { AnnonceFormValue, emptyAnnonceForm } from '../../../core/models/annonce-create.model';

/** Création / édition d'annonce (mode déterminé par la présence de :id dans la route). */
@Component({
  selector: 'app-annonce-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TopNavComponent, BackButtonComponent, SiteFooterComponent],
  templateUrl: './annonce-form.component.html',
  styleUrl: './annonce-form.component.scss',
})
export class AnnonceFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly annoncesService = inject(ProprietaireAnnoncesService);
  private readonly paymentService = inject(PaymentService);
  readonly i18n = inject(I18nService);
  readonly mediaUrl = mediaUrl;

  readonly PHOTOS_MIN = 2;
  readonly PHOTOS_MAX = 5;

  readonly regions = REGIONS;
  readonly editId = signal<number | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = signal<AnnonceFormValue>(emptyAnnonceForm());
  readonly existingPhotos = signal<string[]>([]);
  readonly newFiles = signal<{ file: File; preview: string }[]>([]);
  readonly nouvelEquip = signal('');

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
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.editId.set(id);
      this.charger(id);
    } else {
      // Création : impossible de publier sans abonnement actif (phase 4) — direction la souscription.
      this.paymentService
        .monAbonnement()
        .then((ab) => {
          if (!ab.actif) this.router.navigateByUrl('/proprietaire/abonnement');
        })
        .catch(() => void 0);
    }
  }

  private async charger(id: number): Promise<void> {
    this.loading.set(true);
    try {
      const a = await this.annoncesService.uneAnnonce(id);
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
    } catch {
      this.error.set(this.i18n.t('form.errorLoad'));
    } finally {
      this.loading.set(false);
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
      };
      const photos = this.newFiles().map((n) => n.file);
      const id = this.editId();
      const resultat = id ? await this.annoncesService.modifier(id, payload, photos) : await this.annoncesService.creer(payload, photos);
      this.router.navigate(['/annonce', resultat.id]);
    } catch (err) {
      this.error.set(describeAuthError(err, this.i18n.t('form.errorGeneric')));
    } finally {
      this.saving.set(false);
    }
  }
}
