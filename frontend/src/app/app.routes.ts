import { Routes } from '@angular/router';
import { proprietaireGuard } from './core/guards/proprietaire.guard';
import { adminGuard } from './core/guards/admin.guard';

/**
 * Phase 3 : vitrine publique complète (accueil, recherche, fiche annonce) branchée sur l'API réelle,
 * + espace propriétaire (tableau de bord, création/édition d'annonce, guardé par rôle).
 * Phase 5 : back-office admin (CRUD complet annonces + utilisateurs, y compris créer d'autres admins).
 */
export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent) },
  { path: 'recherche', loadComponent: () => import('./features/search/search.component').then((m) => m.SearchComponent) },
  { path: 'annonce/:id', loadComponent: () => import('./features/listing-detail/listing-detail.component').then((m) => m.ListingDetailComponent) },
  { path: 'favoris', loadComponent: () => import('./features/favoris/favoris.component').then((m) => m.FavorisComponent) },
  {
    path: 'alertes/desabonner/:token',
    loadComponent: () => import('./features/alerte-desabonnement/alerte-desabonnement.component').then((m) => m.AlerteDesabonnementComponent),
  },
  {
    path: 'mentions-legales',
    data: { key: 'mentions' },
    loadComponent: () => import('./features/legal/legal-page.component').then((m) => m.LegalPageComponent),
  },
  {
    path: 'politique-de-confidentialite',
    data: { key: 'confidentialite' },
    loadComponent: () => import('./features/legal/legal-page.component').then((m) => m.LegalPageComponent),
  },
  { path: 'connexion', loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent) },
  { path: 'inscription', loadComponent: () => import('./features/auth/register.component').then((m) => m.RegisterComponent) },
  { path: 'mot-de-passe-oublie', loadComponent: () => import('./features/auth/forgot-password.component').then((m) => m.ForgotPasswordComponent) },
  {
    path: 'proprietaire/tableau-de-bord',
    canActivate: [proprietaireGuard],
    loadComponent: () => import('./features/proprietaire/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'proprietaire/messages',
    canActivate: [proprietaireGuard],
    loadComponent: () => import('./features/proprietaire/messages/proprietaire-messages.component').then((m) => m.ProprietaireMessagesComponent),
  },
  {
    path: 'proprietaire/annonces/nouvelle',
    canActivate: [proprietaireGuard],
    loadComponent: () => import('./features/proprietaire/annonce-form/annonce-form.component').then((m) => m.AnnonceFormComponent),
  },
  {
    path: 'proprietaire/annonces/:id/editer',
    canActivate: [proprietaireGuard],
    loadComponent: () => import('./features/proprietaire/annonce-form/annonce-form.component').then((m) => m.AnnonceFormComponent),
  },
  {
    path: 'proprietaire/abonnement',
    canActivate: [proprietaireGuard],
    loadComponent: () => import('./features/proprietaire/payment/payment.component').then((m) => m.PaymentComponent),
  },
  {
    path: 'admin/tableau-de-bord',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
  },
  {
    path: 'admin/annonces',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/annonces/admin-annonces.component').then((m) => m.AdminAnnoncesComponent),
  },
  {
    path: 'admin/annonces/nouvelle',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/annonce-detail/admin-annonce-detail.component').then((m) => m.AdminAnnonceDetailComponent),
  },
  {
    path: 'admin/annonces/:id',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/annonce-detail/admin-annonce-detail.component').then((m) => m.AdminAnnonceDetailComponent),
  },
  {
    path: 'admin/utilisateurs',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/utilisateurs/admin-utilisateurs.component').then((m) => m.AdminUtilisateursComponent),
  },
  {
    path: 'admin/utilisateurs/nouveau',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/utilisateur-detail/admin-utilisateur-detail.component').then((m) => m.AdminUtilisateurDetailComponent),
  },
  {
    path: 'admin/utilisateurs/:id',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/utilisateur-detail/admin-utilisateur-detail.component').then((m) => m.AdminUtilisateurDetailComponent),
  },
  {
    path: 'admin/avis',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/avis/admin-avis.component').then((m) => m.AdminAvisComponent),
  },
  {
    path: 'admin/alertes',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/alertes/admin-alertes.component').then((m) => m.AdminAlertesComponent),
  },
  { path: '**', redirectTo: '' },
];
