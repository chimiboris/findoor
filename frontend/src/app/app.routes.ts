import { Routes } from '@angular/router';

/** Phase 1 : socle uniquement (accueil + auth). Les routes annonces/propriétaire/admin arrivent aux phases suivantes. */
export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent) },
  { path: 'connexion', loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent) },
  { path: 'inscription', loadComponent: () => import('./features/auth/register.component').then((m) => m.RegisterComponent) },
  { path: '**', redirectTo: '' },
];
