import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { PasswordResetService, CanalOtp } from '../../core/services/password-reset.service';
import { passwordsMatchValidator } from '../../core/utils/password-match.validator';
import { I18nService } from '../../core/services/i18n.service';
import { describeAuthError } from '../../core/utils/http-error.util';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { SiteFooterComponent } from '../../shared/components/site-footer/site-footer.component';

/**
 * Mot de passe oublié — en 2 étapes : demande d'un code OTP (email ou téléphone), puis saisie du
 * code + nouveau mot de passe. Fonctionne pour un compte propriétaire comme pour un compte admin
 * (même table utilisateurs côté backend).
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    BackButtonComponent,
    SiteFooterComponent,
  ],
  template: `
    <div class="back-float"><app-back-button fallback="/connexion" /></div>
    <div class="wrap">
      <div class="card">
        @if (etape() === 'demande') {
          <form [formGroup]="demandeForm" (ngSubmit)="envoyerCode()">
            <h1>{{ i18n.t('auth.forgotTitle') }}</h1>
            <p class="subtitle">{{ i18n.t('auth.forgotSubtitle') }}</p>

            <mat-radio-group formControlName="canal" class="canal-group">
              <mat-radio-button value="EMAIL">{{ i18n.t('auth.channelEmail') }}</mat-radio-button>
              <mat-radio-button value="SMS">{{ i18n.t('auth.channelSms') }}</mat-radio-button>
            </mat-radio-group>

            <mat-form-field appearance="outline">
              <mat-label>{{ demandeForm.value.canal === 'SMS' ? i18n.t('auth.phone') : i18n.t('auth.email') }}</mat-label>
              <input matInput formControlName="identifiant" autocomplete="off" />
            </mat-form-field>

            @if (error()) {
              <p class="error">{{ error() }}</p>
            }

            <button mat-flat-button color="primary" type="submit" [disabled]="demandeForm.invalid || loading()">
              @if (loading()) {
                <mat-spinner diameter="20" />
              } @else {
                {{ i18n.t('auth.sendCode') }}
              }
            </button>

            <p class="hint"><a routerLink="/connexion">{{ i18n.t('auth.backToLogin') }}</a></p>
          </form>
        } @else {
          <form [formGroup]="resetForm" (ngSubmit)="reinitialiser()">
            <h1>{{ i18n.t('auth.resetTitle') }}</h1>
            <p class="subtitle">{{ i18n.t('auth.resetSubtitle', { identifiant: demandeForm.value.identifiant ?? '' }) }}</p>

            <mat-form-field appearance="outline">
              <mat-label>{{ i18n.t('auth.code') }}</mat-label>
              <input matInput formControlName="code" autocomplete="one-time-code" maxlength="6" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ i18n.t('auth.newPassword') }}</mat-label>
              <input matInput [type]="showPassword() ? 'text' : 'password'" formControlName="nouveauMotDePasse" autocomplete="new-password" />
              <button mat-icon-button matSuffix type="button" (click)="showPassword.set(!showPassword())" [attr.aria-label]="showPassword() ? i18n.t('auth.hidePassword') : i18n.t('auth.showPassword')">
                @if (showPassword()) {
                  <svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7c2.1 0 3.9.6 5.4 1.4M23 12s-1.6 2.9-4.4 4.9M9.9 9.9a3 3 0 0 0 4.2 4.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3 3l18 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                } @else {
                  <svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
                }
              </button>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ i18n.t('auth.confirmNewPassword') }}</mat-label>
              <input matInput [type]="showConfirm() ? 'text' : 'password'" formControlName="confirmerMotDePasse" autocomplete="new-password" />
              <button mat-icon-button matSuffix type="button" (click)="showConfirm.set(!showConfirm())" [attr.aria-label]="showConfirm() ? i18n.t('auth.hidePassword') : i18n.t('auth.showPassword')">
                @if (showConfirm()) {
                  <svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7c2.1 0 3.9.6 5.4 1.4M23 12s-1.6 2.9-4.4 4.9M9.9 9.9a3 3 0 0 0 4.2 4.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3 3l18 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                } @else {
                  <svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
                }
              </button>
            </mat-form-field>
            @if (resetForm.errors?.['mismatch'] && resetForm.get('confirmerMotDePasse')?.touched) {
              <p class="error">{{ i18n.t('auth.passwordMismatch') }}</p>
            }

            @if (error()) {
              <p class="error">{{ error() }}</p>
            }
            @if (succes()) {
              <p class="success">{{ i18n.t('auth.resetSuccess') }}</p>
            }

            <button mat-flat-button color="primary" type="submit" [disabled]="resetForm.invalid || loading()">
              @if (loading()) {
                <mat-spinner diameter="20" />
              } @else {
                {{ i18n.t('auth.resetBtn') }}
              }
            </button>

            <p class="hint">
              <a (click)="etape.set('demande')">{{ i18n.t('auth.resendCode') }}</a>
            </p>
          </form>
        }
      </div>
    </div>
    <app-site-footer />
  `,
  styles: [`
    .back-float { position: fixed; top: 4px; left: 12px; z-index: 20; }
    .back-float ::ng-deep .back-btn { color: #134345; }
    .back-float ::ng-deep .back-btn:hover { color: #0f9b9b; }
    .wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f4f8f8; padding: 1rem; }
    .card { background: #fff; border-radius: 12px; box-shadow: 0 10px 30px rgba(15,155,155,.12); padding: 2.5rem; width: 100%; max-width: 26rem; }
    form { display: flex; flex-direction: column; gap: .25rem; }
    h1 { margin: 0 0 .25rem; font-size: 1.5rem; font-weight: 600; color: #134345; }
    .subtitle { margin: 0 0 1.25rem; color: #6b7280; font-size: .9rem; }
    .canal-group { display: flex; gap: 1.5rem; margin-bottom: 1rem; }
    mat-form-field { width: 100%; }
    mat-form-field .icon { width: 20px; height: 20px; color: #6b7280; }
    .error { color: #dc2626; font-size: .85rem; margin: -.5rem 0 .5rem; }
    .success { color: #0f9b6b; font-size: .85rem; margin: -.5rem 0 .5rem; }
    button { margin-top: .5rem; height: 2.75rem; }
    .hint { text-align: center; font-size: .85rem; color: #6b7280; margin-top: 1.25rem; }
    .hint a { color: #0f9b9b; font-weight: 500; text-decoration: none; cursor: pointer; }
    .hint a:hover { text-decoration: underline; }
  `],
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly resetService = inject(PasswordResetService);
  private readonly router = inject(Router);
  readonly i18n = inject(I18nService);

  readonly etape = signal<'demande' | 'reinitialisation'>('demande');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly succes = signal(false);
  readonly showPassword = signal(false);
  readonly showConfirm = signal(false);

  readonly demandeForm = this.fb.nonNullable.group({
    canal: ['EMAIL' as CanalOtp, Validators.required],
    identifiant: ['', Validators.required],
  });

  readonly resetForm = this.fb.nonNullable.group(
    {
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      nouveauMotDePasse: ['', [Validators.required, Validators.minLength(8)]],
      confirmerMotDePasse: ['', Validators.required],
    },
    { validators: passwordsMatchValidator('nouveauMotDePasse', 'confirmerMotDePasse') },
  );

  async envoyerCode(): Promise<void> {
    if (this.demandeForm.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      const { identifiant, canal } = this.demandeForm.getRawValue();
      await this.resetService.demanderCode(identifiant, canal);
      this.etape.set('reinitialisation');
    } catch (err) {
      this.error.set(describeAuthError(err, this.i18n.t('auth.forgotError')));
    } finally {
      this.loading.set(false);
    }
  }

  async reinitialiser(): Promise<void> {
    if (this.resetForm.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    this.succes.set(false);
    try {
      const identifiant = this.demandeForm.getRawValue().identifiant;
      const { code, nouveauMotDePasse } = this.resetForm.getRawValue();
      await this.resetService.reinitialiser(identifiant, code, nouveauMotDePasse);
      this.resetForm.reset();
      this.succes.set(true);
      setTimeout(() => this.router.navigateByUrl('/connexion'), 1500);
    } catch (err) {
      this.error.set(describeAuthError(err, this.i18n.t('auth.resetError')));
    } finally {
      this.loading.set(false);
    }
  }
}
