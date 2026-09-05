import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TopNavComponent } from '../../../shared/components/top-nav/top-nav.component';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';
import { SiteFooterComponent } from '../../../shared/components/site-footer/site-footer.component';
import { MessageService } from '../../../core/services/message.service';
import { I18nService } from '../../../core/services/i18n.service';
import { whatsappUrlFor } from '../../../core/services/platform-contact';
import { MessageAnnonce } from '../../../core/models/message.model';

/** Messages reçus par le propriétaire connecté depuis ses fiches annonces (messagerie — phase 6). */
@Component({
  selector: 'app-proprietaire-messages',
  standalone: true,
  imports: [CommonModule, RouterLink, TopNavComponent, BackButtonComponent, SiteFooterComponent],
  templateUrl: './proprietaire-messages.component.html',
  styleUrl: './proprietaire-messages.component.scss',
})
export class ProprietaireMessagesComponent {
  private readonly messageService = inject(MessageService);
  readonly i18n = inject(I18nService);

  readonly loading = signal(true);
  readonly messages = signal<MessageAnnonce[]>([]);

  readonly nonLus = computed(() => this.messages().filter((m) => !m.lu).length);

  constructor() {
    this.charger();
  }

  async charger(): Promise<void> {
    this.loading.set(true);
    try {
      this.messages.set(await this.messageService.mesMessages());
    } finally {
      this.loading.set(false);
    }
  }

  async marquerLu(m: MessageAnnonce): Promise<void> {
    if (m.lu) return;
    const maj = await this.messageService.marquerLu(m.id);
    this.messages.update((liste) => liste.map((x) => (x.id === m.id ? maj : x)));
  }

  whatsappHref(m: MessageAnnonce): string | null {
    return whatsappUrlFor(m.expediteurTelephone, `Bonjour ${m.expediteurNom}, je réponds à votre message concernant « ${m.annonceTitre} » sur Findoor.`);
  }

  formatDate(iso: string): string {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  }
}
