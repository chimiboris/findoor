import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'findoor-theme';

/** Thème clair/sombre — bascule manuelle mémorisée par visiteur, au-dessus de prefers-color-scheme. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly theme = signal<Theme>('light');

  constructor() {
    if (!this.isBrowser) return;
    this.apply(this.readPreferred());
  }

  private readPreferred(): Theme {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      /* localStorage indisponible (navigation privée…) : on retombe sur la préférence système. */
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private apply(theme: Theme): void {
    this.theme.set(theme);
    if (!this.isBrowser) return;
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* stockage indisponible : sans impact fonctionnel, le thème reste actif pour la session. */
    }
  }

  toggle(): void {
    this.apply(this.theme() === 'dark' ? 'light' : 'dark');
  }
}
