import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { TopNavComponent } from '../../shared/components/top-nav/top-nav.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';
import { PropertyMapComponent } from '../../shared/components/property-map/property-map.component';
import { SiteFooterComponent } from '../../shared/components/site-footer/site-footer.component';
import { ListingsService } from '../../core/services/listings.service';
import { MessageService } from '../../core/services/message.service';
import { AvisService } from '../../core/services/avis.service';
import { FavorisService } from '../../core/services/favoris.service';
import { I18nService } from '../../core/services/i18n.service';
import { SeoService } from '../../core/services/seo.service';
import { mediaUrl } from '../../core/services/api-base';
import { whatsappUrlFor, PLATFORM_WHATSAPP_URL } from '../../core/services/platform-contact';
import { Annonce, TYPE_ICON } from '../../core/models/property.model';
import { Avis, AvisResume } from '../../core/models/avis.model';

interface ContactFormValue {
  nom: string;
  email: string;
  telephone: string;
  contenu: string;
}

function emptyContactForm(): ContactFormValue {
  return { nom: '', email: '', telephone: '', contenu: '' };
}

interface AvisFormValue {
  nom: string;
  email: string;
  note: number;
  commentaire: string;
}

function emptyAvisForm(): AvisFormValue {
  return { nom: '', email: '', note: 5, commentaire: '' };
}

interface PriceLabel {
  big: string;
  small: string;
}

const TYPE_PATHS: Record<string, string> = {
  bed: '<path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6"/><path d="M3 18v2M21 18v2"/><path d="M3 12V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  studio: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 14h16M12 4v10"/>',
  house: '<path d="M4 11.5L12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9"/>',
  villa: '<path d="M3 20V9l6-4 6 4v11"/><path d="M15 20v-8l6 3v5"/><path d="M8 20v-5h3v5"/>',
  land: '<path d="M3 20h18"/><path d="M4 20L10 5l4 8 3-4 3 11"/>',
  shop: '<path d="M4 8l1.5-4h13L20 8"/><path d="M4 8v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8"/><path d="M9 20v-6h6v6"/>',
};

/** Fiche annonce — galerie, description, équipements, localisation, contact propriétaire. */
@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, TopNavComponent, PropertyCardComponent, PropertyMapComponent, SiteFooterComponent],
  templateUrl: './listing-detail.component.html',
  styleUrl: './listing-detail.component.scss',
})
export class ListingDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly listingsService = inject(ListingsService);
  private readonly messageService = inject(MessageService);
  private readonly avisService = inject(AvisService);
  private readonly favoris = inject(FavorisService);
  private readonly seo = inject(SeoService);
  readonly i18n = inject(I18nService);

  readonly phoneRevealed = signal(false);
  readonly selectedPhoto = signal(0);
  readonly justPublished = signal(this.route.snapshot.queryParamMap.get('publie') === '1');

  readonly showMessageForm = signal(false);
  readonly messageForm = signal<ContactFormValue>(emptyContactForm());
  readonly sendingMessage = signal(false);
  readonly messageSent = signal(false);
  readonly messageError = signal<string | null>(null);

  readonly showAvisForm = signal(false);
  readonly avisForm = signal<AvisFormValue>(emptyAvisForm());
  readonly sendingAvis = signal(false);
  readonly avisSent = signal(false);
  readonly avisError = signal<string | null>(null);
  readonly avisResume = signal<AvisResume>({ moyenne: 0, total: 0 });
  readonly avisList = signal<Avis[]>([]);

  readonly annonce = toSignal(
    this.route.paramMap.pipe(switchMap((p) => this.listingsService.getById$(Number(p.get('id'))))),
    { initialValue: undefined as Annonce | undefined },
  );

  readonly similar = toSignal(
    this.route.paramMap.pipe(switchMap((p) => this.listingsService.similarTo$(Number(p.get('id'))))),
    { initialValue: [] as Annonce[] },
  );

  readonly stars = [1, 2, 3, 4, 5];

  readonly hasPhotos = computed(() => (this.annonce()?.photos?.length ?? 0) > 0);

  /** Lien WhatsApp réel vers le propriétaire (numéro de son compte) — fallback sur la plateforme si absent. */
  readonly whatsappHref = computed(() => {
    const l = this.annonce();
    if (!l) return PLATFORM_WHATSAPP_URL;
    const message = `Bonjour, je suis intéressé(e) par votre annonce « ${l.titre} » sur Findoor.`;
    return whatsappUrlFor(l.ownerTelephone, message) ?? PLATFORM_WHATSAPP_URL;
  });

  readonly mediaUrl = mediaUrl;

  constructor() {
    // Réinitialise l'état d'interaction (téléphone révélé, formulaire message/avis) à chaque changement de fiche.
    this.route.paramMap.subscribe((p) => {
      this.phoneRevealed.set(false);
      this.selectedPhoto.set(0);
      this.showMessageForm.set(false);
      this.messageForm.set(emptyContactForm());
      this.sendingMessage.set(false);
      this.messageSent.set(false);
      this.messageError.set(null);
      this.showAvisForm.set(false);
      this.avisForm.set(emptyAvisForm());
      this.sendingAvis.set(false);
      this.avisSent.set(false);
      this.avisError.set(null);
      this.avisResume.set({ moyenne: 0, total: 0 });
      this.avisList.set([]);
      this.chargerAvis(Number(p.get('id')));
    });

    // SEO par fiche — titre/description/OG dynamiques + JSON-LD (schema.org), déclenché à chaque
    // chargement d'annonce (fonctionne en SSR : le HTML pré-rendu porte les bonnes balises).
    effect(() => {
      const l = this.annonce();
      if (!l) return;
      const lieu = `${l.quartier}, ${l.ville}`;
      const prixTxt = l.uniteM2 ? `${this.fmt(l.prix)} FCFA/m²` : `${this.fmt(l.prix)} FCFA${l.unite ?? ''}`;
      const description = `${l.titre} — ${lieu}. ${l.surface} m²${l.pieces ? `, ${l.pieces} pièces` : ''}. ${prixTxt}. ${l.desc.slice(0, 120)}`.trim();
      this.seo.set({
        title: l.titre,
        description,
        path: `/annonce/${l.id}`,
        image: l.photos?.[0] ? this.mediaUrl(l.photos[0]) : undefined,
        type: 'article',
      });
      this.seo.setJsonLd({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: l.titre,
        description: l.desc,
        image: (l.photos ?? []).map((p) => this.mediaUrl(p)),
        offers: {
          '@type': 'Offer',
          price: l.uniteM2 ? l.prixTotal : l.prix,
          priceCurrency: 'XAF',
          availability: 'https://schema.org/InStock',
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: l.ville,
          addressRegion: l.region,
          addressCountry: 'CM',
        },
      });
    });
  }

  private async chargerAvis(annonceId: number): Promise<void> {
    if (!annonceId) return;
    const [resume, liste] = await Promise.all([
      this.avisService.resume(annonceId).catch(() => ({ moyenne: 0, total: 0 }) as AvisResume),
      this.avisService.publies(annonceId).catch(() => [] as Avis[]),
    ]);
    this.avisResume.set(resume);
    this.avisList.set(liste);
  }

  fermerBanniere(): void {
    this.justPublished.set(false);
  }

  estFavori(): boolean {
    const l = this.annonce();
    return !!l && this.favoris.estFavori(l.id);
  }

  toggleFavori(): void {
    const l = this.annonce();
    if (l) this.favoris.basculer(l.id);
  }

  choisirPhoto(index: number): void {
    this.selectedPhoto.set(index);
  }

  price(): PriceLabel {
    const l = this.annonce();
    if (!l) return { big: '', small: '' };
    if (l.uniteM2) return { big: `${this.fmt(l.prix)} FCFA/m²`, small: this.i18n.t('detail.totalPrice', { total: this.fmt(l.prixTotal ?? 0) }) };
    if (l.transaction === 'louer') return { big: `${this.fmt(l.prix)} FCFA`, small: l.unite ?? '' };
    return { big: `${this.fmt(l.prix)} FCFA`, small: this.i18n.t('detail.netPrice') };
  }

  iconPath(): string {
    const l = this.annonce();
    const key = l ? (TYPE_ICON[l.type] ?? 'house') : 'house';
    return TYPE_PATHS[key] ?? TYPE_PATHS['house'];
  }

  photoGradient(): string {
    const l = this.annonce();
    const accent = l?.transaction === 'louer' ? 'var(--rent)' : 'var(--sale)';
    return `linear-gradient(150deg, var(--night), ${accent})`;
  }

  revealPhone(): void {
    this.phoneRevealed.set(true);
  }

  patchMessage(p: Partial<ContactFormValue>): void {
    this.messageForm.update((f) => ({ ...f, ...p }));
  }

  ouvrirFormulaireMessage(): void {
    this.messageSent.set(false);
    this.messageError.set(null);
    this.showMessageForm.set(true);
  }

  annulerMessage(): void {
    this.showMessageForm.set(false);
    this.messageError.set(null);
  }

  async envoyerMessage(): Promise<void> {
    const l = this.annonce();
    const f = this.messageForm();
    if (!l || !f.nom.trim() || !f.email.trim() || !f.contenu.trim()) {
      this.messageError.set(this.i18n.t('detail.messageErrorRequired'));
      return;
    }
    this.sendingMessage.set(true);
    this.messageError.set(null);
    try {
      await this.messageService.envoyer(l.id, {
        nom: f.nom.trim(),
        email: f.email.trim(),
        telephone: f.telephone.trim() || undefined,
        contenu: f.contenu.trim(),
      });
      this.messageSent.set(true);
      this.showMessageForm.set(false);
      this.messageForm.set(emptyContactForm());
    } catch {
      this.messageError.set(this.i18n.t('detail.messageErrorGeneric'));
    } finally {
      this.sendingMessage.set(false);
    }
  }

  patchAvis(p: Partial<AvisFormValue>): void {
    this.avisForm.update((f) => ({ ...f, ...p }));
  }

  choisirNote(note: number): void {
    this.patchAvis({ note });
  }

  ouvrirFormulaireAvis(): void {
    this.avisSent.set(false);
    this.avisError.set(null);
    this.showAvisForm.set(true);
  }

  annulerAvis(): void {
    this.showAvisForm.set(false);
    this.avisError.set(null);
  }

  async envoyerAvis(): Promise<void> {
    const l = this.annonce();
    const f = this.avisForm();
    if (!l || !f.nom.trim() || !f.commentaire.trim()) {
      this.avisError.set(this.i18n.t('detail.avisErrorRequired'));
      return;
    }
    this.sendingAvis.set(true);
    this.avisError.set(null);
    try {
      await this.avisService.deposer(l.id, {
        nom: f.nom.trim(),
        email: f.email.trim() || undefined,
        note: f.note,
        commentaire: f.commentaire.trim(),
      });
      this.avisSent.set(true);
      this.showAvisForm.set(false);
      this.avisForm.set(emptyAvisForm());
    } catch {
      this.avisError.set(this.i18n.t('detail.avisErrorGeneric'));
    } finally {
      this.sendingAvis.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/recherche']);
  }

  private fmt(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(n);
  }
}
