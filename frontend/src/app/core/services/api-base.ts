/** Base URL de l'API Spring Boot (voir backend/src/main/resources/application.properties, server.port). */
export const API_BASE = 'http://localhost:8081/api';

/** Origine du backend, pour résoudre les URLs de photos servies sous /media/** (voir FileStorageService). */
export const MEDIA_BASE = API_BASE.replace(/\/api$/, '');

/** Préfixe une URL de photo renvoyée par l'API (chemin relatif "/media/…") par l'origine du backend. */
export function mediaUrl(path: string): string {
  return path.startsWith('http') ? path : `${MEDIA_BASE}${path}`;
}
