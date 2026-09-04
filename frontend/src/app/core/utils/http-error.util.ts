import { HttpErrorResponse } from '@angular/common/http';

/**
 * Traduit une erreur HTTP en message utilisateur, sans jamais attribuer une cause métier
 * (ex. "email déjà utilisé") à une panne réseau/CORS/serveur indisponible (status 0 ou 5xx).
 */
export function describeAuthError(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return "Impossible de contacter le serveur — vérifiez votre connexion ou réessayez dans un instant.";
    }
    if (err.status >= 500) {
      return 'Le serveur MA PIOL rencontre un problème — réessayez dans un instant.';
    }
    const backendMessage = (err.error as { message?: string } | null)?.message;
    if (backendMessage) {
      return backendMessage;
    }
  }
  return fallback;
}
