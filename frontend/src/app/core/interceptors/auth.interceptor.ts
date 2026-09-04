import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from '../services/session.service';

/** Ajoute le jeton Bearer sur les appels vers notre API. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const token = session.accessToken();

  if (!token || !req.url.includes('/api/')) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
