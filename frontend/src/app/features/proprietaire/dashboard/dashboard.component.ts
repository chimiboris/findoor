import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TopNavComponent } from '../../../shared/components/top-nav/top-nav.component';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';
import { SiteFooterComponent } from '../../../shared/components/site-footer/site-footer.component';
import { ProprietaireAnnoncesService } from '../../../core/services/proprietaire-annonces.service';
import { MessageService } from '../../../core/services/message.service';
import { PaymentService } from '../../../core/services/payment.service';
import { SessionService } from '../../../core/services/session.service';
import { I18nService } from '../../../core/services/i18n.service';
import { mediaUrl } from '../../../core/services/api-base';
import { Annonce } from '../../../core/models/property.model';
import { Abonnement } from '../../../core/models/payment.model';
import { statutVisibilite } from '../../../core/utils/annonce-statut.util';

/** Tableau de bord propriétaire — mes annonces, statistiques simples, actions d'édition/suppression. */
@Component({
  selector: 'app-proprietaire-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TopNavComponent, BackButtonComponent, SiteFooterComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly annoncesService = inject(ProprietaireAnnoncesService);
  private readonly messageService = inject(MessageService);
  private readonly paymentService = inject(PaymentService);
  private readonly router = inject(Router);
  readonly session = inject(SessionService);
  readonly i18n = inject(I18nService);
  readonly mediaUrl = mediaUrl;

  readonly loading = signal(true);
  readonly annonces = signal<Annonce[]>([]);
  readonly confirmingDeleteId = signal<number | null>(null);
  readonly deleting = signal(false);
  readonly messagesNonLus = signal(0);
  readonly abonnement = signal<Abonnement | null>(null);

  readonly stats = computed(() => {
    const a = this.annonces();
    return {
      total: a.length,
      louer: a.filter((x) => x.transaction === 'louer').length,
      acheter: a.filter((x) => x.transaction === 'acheter').length,
    };
  });

  constructor() {
    this.charger();
    this.messageService.nonLus().then((n) => this.messagesNonLus.set(n)).catch(() => void 0);
    this.paymentService.monAbonnement().then((a) => this.abonnement.set(a)).catch(() => void 0);
  }

  formatDate(iso: string): string {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(iso));
  }

  async charger(): Promise<void> {
    this.loading.set(true);
    try {
      this.annonces.set(await this.annoncesService.mesAnnonces());
    } finally {
      this.loading.set(false);
    }
  }

  editer(a: Annonce): void {
    this.router.navigate(['/proprietaire/annonces', a.id, 'editer']);
  }

  demanderSuppression(id: number): void {
    this.confirmingDeleteId.set(id);
  }

  annulerSuppression(): void {
    this.confirmingDeleteId.set(null);
  }

  async confirmerSuppression(id: number): Promise<void> {
    this.deleting.set(true);
    try {
      await this.annoncesService.supprimer(id);
      this.annonces.update((a) => a.filter((x) => x.id !== id));
      this.confirmingDeleteId.set(null);
    } finally {
      this.deleting.set(false);
    }
  }

  fmt(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(n);
  }

  readonly statutVisibilite = statutVisibilite;

  prixAffiche(a: Annonce): string {
    if (a.uniteM2) return `${this.fmt(a.prix)} FCFA/m²`;
    return `${this.fmt(a.prix)} FCFA${a.unite ? ' ' + a.unite : ''}`;
  }
}
