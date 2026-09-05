import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { SessionService } from '../../core/services/session.service';
import { I18nService } from '../../core/services/i18n.service';
import { describeAuthError } from '../../core/utils/http-error.util';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { SiteFooterComponent } from '../../shared/components/site-footer/site-footer.component';

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
    BackButtonComponent,
    SiteFooterComponent,
  ],
  template: `
    <div class="back-float"><app-back-button fallback="/" /></div>
    <div class="wrap">
      <form class="card" [formGroup]="form" (ngSubmit)="submit()">
        <h1>{{ i18n.t('auth.loginTitle') }}</h1>
        <p class="subtitle">{{ i18n.t('auth.loginSubtitle') }}</p>

        <mat-form-field appearance="outline">
          <mat-label>{{ i18n.t('auth.email') }}</mat-label>
          <input matInput type="email" formControlName="email" autocomplete="email" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ i18n.t('auth.password') }}</mat-label>
          <input matInput [type]="showPassword() ? 'text' : 'password'" formControlName="motDePasse" autocomplete="current-password" />
          <button mat-icon-button matSuffix type="button" (click)="showPassword.set(!showPassword())" [attr.aria-label]="showPassword() ? i18n.t('auth.hidePassword') : i18n.t('auth.showPassword')">
            @if (showPassword()) {
              <svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7c2.1 0 3.9.6 5.4 1.4M23 12s-1.6 2.9-4.4 4.9M9.9 9.9a3 3 0 0 0 4.2 4.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3 3l18 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            } @else {
              <svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
            }
          </button>
        </mat-form-field>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
          @if (loading()) {
            <mat-spinner diameter="20" />
          } @else {
            {{ i18n.t('auth.loginBtn') }}
          }
        </button>

        <p class="hint"><a routerLink="/mot-de-passe-oublie">{{ i18n.t('auth.forgotLink') }}</a></p>
        <p class="hint">{{ i18n.t('auth.noAccount') }} <a routerLink="/inscription">{{ i18n.t('auth.createAccount') }}</a></p>
      </form>
    </div>
    <app-site-footer />
  `,
  styles: [`
    .back-float { position: fixed; top: 4px; left: 12px; z-index: 20; }
    .back-float ::ng-deep .back-btn { color: #134345; }
    .back-float ::ng-deep .back-btn:hover { color: #0f9b9b; }
    .wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f4f8f8; padding: 1rem; }
    .card { background: #fff; border-radius: 12px; box-shadow: 0 10px 30px rgba(15,155,155,.12); padding: 2.5rem; width: 100%; max-width: 26rem; display: flex; flex-direction: column; gap: .25rem; }
    h1 { margin: 0 0 .25rem; font-size: 1.5rem; font-weight: 600; color: #134345; }
    .subtitle { margin: 0 0 1.5rem; color: #6b7280; font-size: .9rem; }
    mat-form-field { width: 100%; }
    mat-form-field .icon { width: 20px; height: 20px; color: #6b7280; }
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
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  readonly i18n = inject(I18nService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);

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
      this.router.navigateByUrl(this.session.hasRole('ADMIN') ? '/admin/tableau-de-bord' : '/proprietaire/tableau-de-bord');
    } catch (err) {
      this.error.set(describeAuthError(err, this.i18n.t('auth.loginError')));
    } finally {
      this.loading.set(false);
    }
  }
}
