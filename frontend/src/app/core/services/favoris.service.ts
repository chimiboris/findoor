import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const STORAGE_KEY = 'findoor_favoris';

/**
 * Favoris (phase 6) — stockés dans le navigateur du visiteur (localStorage), sans compte requis,
 * conformément au plan ("compte optionnel pour favoris/alertes") : la plupart des visiteurs
 * n'ont pas de compte sur Findoor (seuls les propriétaires/admins en ont un aujourd'hui), donc les
 * favoris doivent fonctionner sans authentification. Ils restent propres à cet appareil/navigateur.
 */
@Injectable({ providedIn: 'root' })
export class FavorisService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly ids = signal<number[]>(this.lire());

  private lire(): number[] {
    if (!this.isBrowser) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as number[]) : [];
    } catch {
      return [];
    }
  }

  private ecrire(ids: number[]): void {
    this.ids.set(ids);
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // Stockage indisponible (navigation privée, etc.) — les favoris ne persistent simplement pas.
    }
  }

  estFavori(id: number): boolean {
    return this.ids().includes(id);
  }

  basculer(id: number): void {
    const courants = this.ids();
    this.ecrire(courants.includes(id) ? courants.filter((x) => x !== id) : [...courants, id]);
  }

  retirer(id: number): void {
    this.ecrire(this.ids().filter((x) => x !== id));
  }
}
