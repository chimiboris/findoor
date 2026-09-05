import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TopNavComponent } from '../../../shared/components/top-nav/top-nav.component';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';
import { SiteFooterComponent } from '../../../shared/components/site-footer/site-footer.component';
import { PaymentService } from '../../../core/services/payment.service';
import { I18nService } from '../../../core/services/i18n.service';
import { Abonnement, FORMULES, MOYENS, Formule, Moyen } from '../../../core/models/payment.model';

/**
 * Choix d'une formule d'abonnement (phase 4) — paiement par PÉRIODE d'accès pour le compte, pas pour
 * une annonce en particulier : une fois payé, toutes les annonces (actuelles et futures) du
 * propriétaire deviennent publiables/visibles pour la durée achetée. Paiement SIMULÉ : aucun compte
 * marchand CinetPay n'est connecté (voir CinetPaySimulatedProvider côté backend).
 */
@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TopNavComponent, BackButtonComponent, SiteFooterComponent],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
})
export class PaymentComponent {
  private readonly router = inject(Router);
  private readonly paymentService = inject(PaymentService);
  readonly i18n = inject(I18nService);

  readonly formules = FORMULES;
  readonly moyens = MOYENS;

  readonly loading = signal(true);
  readonly abonnement = signal<Abonnement | null>(null);
  readonly formule = signal<Formule>('SIX_MOIS');
  readonly moyen = signal<Moyen>('MTN_MOMO');
  readonly paying = signal(false);
  readonly error = signal<string | null>(null);

  readonly formuleChoisie = computed(() => this.formules.find((f) => f.id === this.formule())!);

  constructor() {
    this.charger();
  }

  async charger(): Promise<void> {
    this.loading.set(true);
    try {
      this.abonnement.set(await this.paymentService.monAbonnement());
    } catch {
      this.error.set(this.i18n.t('payment.errorLoad'));
    } finally {
      this.loading.set(false);
    }
  }

  fmt(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(n);
  }

  formatDate(iso: string): string {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(iso));
  }

  async payer(): Promise<void> {
    this.paying.set(true);
    this.error.set(null);
    try {
      const transaction = await this.paymentService.demarrer(this.formule(), this.moyen());
      // Simulation : on confirme immédiatement (un vrai CinetPay redirigerait vers sa page hébergée,
      // puis appellerait son propre webhook après le paiement effectif de l'utilisateur).
      await this.paymentService.confirmerSimule(transaction.reference);
      this.router.navigate(['/proprietaire/tableau-de-bord'], { queryParams: { abonne: '1' } });
    } catch {
      this.error.set(this.i18n.t('payment.errorGeneric'));
    } finally {
      this.paying.set(false);
    }
  }
}
