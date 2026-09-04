import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { describeAuthError } from '../../core/utils/http-error.util';

/** Écran de connexion — preuve de bout en bout de l'authentification JWT (phase 1). */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="wrap">
      <form class="card" [formGroup]="form" (ngSubmit)="submit()">
        <h1>Connexion propriétaire</h1>
        <p class="subtitle">Accédez à votre espace pour gérer vos annonces MA PIOL.</p>

        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" autocomplete="email" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Mot de passe</mat-label>
          <input matInput type="password" formControlName="motDePasse" autocomplete="current-password" />
        </mat-form-field>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
          @if (loading()) {
            <mat-spinner diameter="20" />
          } @else {
            Se connecter
          }
        </button>

        <p class="hint">Pas encore de compte propriétaire ? <a routerLink="/inscription">Créer un compte</a></p>
      </form>
    </div>
  `,
  styles: [`
    .wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f4f8f8; padding: 1rem; }
    .card { background: #fff; border-radius: 12px; box-shadow: 0 10px 30px rgba(15,155,155,.12); padding: 2.5rem; width: 100%; max-width: 26rem; display: flex; flex-direction: column; gap: .25rem; }
    h1 { margin: 0 0 .25rem; font-size: 1.5rem; font-weight: 600; color: #134345; }
    .subtitle { margin: 0 0 1.5rem; color: #6b7280; font-size: .9rem; }
    mat-form-field { width: 100%; }
    .error { color: #dc2626; font-size: .85rem; margin: -.5rem 0 .5rem; }
    button { margin-top: .5rem; height: 2.75rem; }
    .hint { text-align: center; font-size: .85rem; color: #6b7280; margin-top: 1.25rem; }
    .hint a { color: #0f9b9b; font-weight: 500; text-decoration: none; }
    .hint a:hover { text-decoration: underline; }
  `],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', Validators.required],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.authService.login(this.form.getRawValue());
      this.router.navigateByUrl('/');
    } catch (err) {
      this.error.set(describeAuthError(err, 'Email ou mot de passe incorrect.'));
    } finally {
      this.loading.set(false);
    }
  }
}
