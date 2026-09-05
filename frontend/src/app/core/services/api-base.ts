import { environment } from '../../../environments/environment';

/** Base URL de l'API Spring Boot — voir src/environments (environment.ts en dev, environment.prod.ts en prod). */
export const API_BASE = environment.apiBase;

/** Origine du backend, pour résoudre les URLs de photos servies sous /media/** (voir FileStorageService). */
export const MEDIA_BASE = API_BASE.replace(/\/api$/, '');

/** Préfixe une URL de photo renvoyée par l'API (chemin relatif "/media/…") par l'origine du backend. */
export function mediaUrl(path: string): string {
  return path.startsWith('http') ? path : `${MEDIA_BASE}${path}`;
}
