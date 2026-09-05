/**
 * Environnement de production (phase 8 — déploiement gratuit sur Render). `fileReplacements` dans
 * angular.json remplace environment.ts par ce fichier pour la configuration "production" — utilisé
 * dès la compilation, y compris pendant le prérendu (Angular a besoin de joindre la vraie API pour
 * générer les pages statiques).
 */
export const environment = {
  production: true,
  apiBase: 'https://findoor-backend-mooh.onrender.com/api',
};
