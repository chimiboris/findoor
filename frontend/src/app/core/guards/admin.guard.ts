import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

/** Protège les routes /admin/** — nécessite un compte ADMIN connecté. */
export const adminGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);

  if (session.hasRole('ADMIN')) return true;

  return router.createUrlTree(['/connexion']);
};
