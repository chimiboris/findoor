import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Lang, TRANSLATIONS } from '../i18n/translations';

const LANG_KEY = 'findoor-lang';

/** Langue de l'interface (FR/EN) — sûr en SSR, persisté côté navigateur (même schéma que ThemeService). */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly lang = signal<Lang>(this.readPreferred());

  constructor() {
    if (this.isBrowser) {
      document.documentElement.lang = this.lang();
    }
  }

  private readPreferred(): Lang {
    if (!this.isBrowser) return 'fr';
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === 'fr' || stored === 'en') return stored;
    return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'fr';
  }

  set(lang: Lang): void {
    this.lang.set(lang);
    if (this.isBrowser) {
      localStorage.setItem(LANG_KEY, lang);
      document.documentElement.lang = lang;
    }
  }

  /** Traduit une clé ; {var} dans la chaîne est remplacé par vars[var]. */
  t(key: string, vars?: Record<string, string | number>): string {
    let text = TRANSLATIONS[this.lang()][key] ?? TRANSLATIONS.fr[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
    }
    return text;
  }
}
