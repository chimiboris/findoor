import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoData {
  title: string;
  description: string;
  /** Chemin relatif (ex. "/annonce/222") — combiné à l'origine courante pour l'URL canonique + og:url. */
  path: string;
  image?: string;
  type?: 'website' | 'article';
}

const SITE_NAME = 'Findoor';
const DEFAULT_IMAGE = '/favicon.ico';

/**
 * Titre, description, balises Open Graph/Twitter et lien canonique par page (phase 7 — SEO).
 * Fonctionne en SSR (Meta/Title sont universels) ; le lien canonique est géré manuellement via
 * le DOM car Angular n'a pas d'API dédiée pour `<link rel="canonical">`.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  set(data: SeoData): void {
    const fullTitle = data.title === SITE_NAME ? SITE_NAME : `${data.title} · ${SITE_NAME}`;
    const origin = this.originFor();
    const url = `${origin}${data.path}`;
    const image = data.image ? (data.image.startsWith('http') ? data.image : `${origin}${data.image}`) : `${origin}${DEFAULT_IMAGE}`;

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: data.description });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:type', content: data.type ?? 'website' });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: data.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: data.description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
    this.setCanonical(url);
  }

  /** Injecte un bloc JSON-LD (schema.org) — remplace le précédent s'il existe déjà (une fiche à la fois). */
  setJsonLd(payload: Record<string, unknown> | null): void {
    const id = 'seo-jsonld';
    const existing = this.document.getElementById(id);
    if (existing) existing.remove();
    if (!payload) return;
    const script = this.document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(payload);
    this.document.head.appendChild(script);
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private originFor(): string {
    // location.origin fonctionne côté navigateur ; en SSR/prérendu, document.location peut être absent
    // selon le moteur de rendu serveur — repli sur le domaine de production pour que og:url/canonical
    // restent corrects dans le HTML pré-rendu plutôt que de planter.
    try {
      const origin = this.document.location?.origin;
      if (origin && origin !== 'null') return origin;
    } catch {
      /* document.location peut lever en environnement serveur selon le moteur DOM utilisé */
    }
    return 'https://findoor.cm';
  }
}
