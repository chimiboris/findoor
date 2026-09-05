import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Carte interactive réelle — Google Maps (iframe intégré, sans clé API : méthode `output=embed`,
 * suffisante pour un point précis avec repère) centrée sur la position GPS de l'annonce. Cliquer sur
 * "Ouvrir la localisation exacte" ouvre le même point sur Google Maps en plein écran, dans un nouvel
 * onglet, avec la précision maximale (zoom rue).
 */
@Component({
  selector: 'app-property-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-wrap">
      @if (embedUrl(); as src) {
        <iframe
          class="map-frame"
          [src]="src"
          [attr.title]="'Carte — ' + label"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      } @else {
        <div class="map-fallback">
          <svg class="icon" viewBox="0 0 24 24"><path d="M12 22s7-6.4 7-12a7 7 0 1 0-14 0c0 5.6 7 12 7 12z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="2.4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
          <span>{{ label }}</span>
        </div>
      }
    </div>
    <button type="button" class="open-full" [disabled]="!hasCoords()" (click)="openFullMap()">
      <svg class="icon" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Ouvrir la localisation exacte sur Google Maps
    </button>
  `,
  styles: [`
    .map-wrap { position: relative; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border); height: 220px; background: var(--surface-raised); }
    .map-frame { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
    .map-fallback { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: var(--ink-soft); font-size: .85rem; pointer-events: none; }
    .map-fallback .icon { width: 28px; height: 28px; }
    .open-full { display: inline-flex; align-items: center; gap: 7px; margin-top: 10px; background: transparent; border: 1px solid var(--border); color: var(--ink); border-radius: 999px; padding: 8px 16px; font-size: .84rem; font-weight: 700; cursor: pointer; font-family: var(--font-body); }
    .open-full:hover:not(:disabled) { border-color: var(--gold); color: var(--gold-strong); }
    .open-full:disabled { opacity: .5; cursor: not-allowed; }
    .open-full .icon { width: 1em; height: 1em; }
  `],
})
export class PropertyMapComponent implements OnChanges {
  @Input() lat: number | null | undefined;
  @Input() lng: number | null | undefined;
  @Input() label = '';

  private readonly sanitizer = inject(DomSanitizer);

  /** URL d'intégration Google Maps déjà sanitisée — recalculée uniquement quand lat/lng changent
   * (jamais à chaque cycle de détection de changement, pour éviter de recharger l'iframe en boucle). */
  readonly embedUrl = signal<SafeResourceUrl | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lat'] || changes['lng']) {
      this.embedUrl.set(this.hasCoords() ? this.buildEmbedUrl() : null);
    }
  }

  hasCoords(): boolean {
    return typeof this.lat === 'number' && typeof this.lng === 'number';
  }

  openFullMap(): void {
    if (!this.hasCoords()) return;
    window.open(`https://www.google.com/maps?q=${this.lat},${this.lng}`, '_blank', 'noopener');
  }

  private buildEmbedUrl(): SafeResourceUrl {
    const url = `https://www.google.com/maps?q=${this.lat},${this.lng}&z=16&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
