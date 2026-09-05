import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

/** Protège les routes /proprietaire/** — nécessite un compte PROPRIETAIRE (ou ADMIN) connecté. */
export const proprietaireGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);

  if (session.hasRole('PROPRIETAIRE', 'ADMIN')) return true;

  return router.createUrlTree(['/connexion']);
};
