import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { SessionService } from '../../core/services/session.service';

/**
 * Accueil provisoire — socle technique (phase 1). Remplacé par la vraie page d'accueil
 * (recherche par transaction/catégorie/ville/quartier) une fois les maquettes validées (phase 2).
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule],
  template: `
    <div class="hero">
      <h1>Findoor</h1>
      <p>Location et vente de biens immobiliers — plateforme en construction.</p>

      @if (session.isAuthenticated()) {
        <p class="welcome">Bienvenue, {{ session.user()?.prenom }} 👋</p>
        <button mat-stroked-button color="primary" (click)="session.logout()">Se déconnecter</button>
      } @else {
        <div class="actions">
          <a mat-flat-button color="primary" routerLink="/connexion">Connexion</a>
          <a mat-stroked-button color="primary" routerLink="/inscription">Créer un compte propriétaire</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; background: linear-gradient(180deg, #eafbfb, #ffffff); text-align: center; padding: 1rem; }
    h1 { font-size: 2.5rem; font-weight: 700; color: #0f9b9b; margin: 0; letter-spacing: .05em; }
    p { color: #4b5563; margin: 0; }
    .welcome { font-weight: 500; color: #134345; }
    .actions { display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap; justify-content: center; }
  `],
})
export class HomeComponent {
  readonly session = inject(SessionService);
}
