import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TopNavComponent } from '../../shared/components/top-nav/top-nav.component';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { SiteFooterComponent } from '../../shared/components/site-footer/site-footer.component';
import { I18nService } from '../../core/services/i18n.service';
import { SeoService } from '../../core/services/seo.service';
import { LEGAL_PAGES, LegalPageKey } from './legal-content';

/** Page légale générique (mentions légales / politique de confidentialité) — contenu par clé de route. */
@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [CommonModule, TopNavComponent, BackButtonComponent, SiteFooterComponent],
  templateUrl: './legal-page.component.html',
  styleUrl: './legal-page.component.scss',
})
export class LegalPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  readonly i18n = inject(I18nService);

  readonly page = LEGAL_PAGES[this.route.snapshot.data['key'] as LegalPageKey];

  constructor() {
    this.seo.set({ title: this.page.title, description: this.page.title, path: '/' + this.route.snapshot.url.map((s) => s.path).join('/') });
  }
}
