import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TopNavComponent } from '../../../shared/components/top-nav/top-nav.component';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';
import { SiteFooterComponent } from '../../../shared/components/site-footer/site-footer.component';
import { AdminService } from '../../../core/services/admin.service';
import { I18nService } from '../../../core/services/i18n.service';
import { AdminStats } from '../../../core/models/admin.model';

/** Tableau de bord du back-office admin — vue d'ensemble + accès à la modération et aux comptes. */
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TopNavComponent, BackButtonComponent, SiteFooterComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
  private readonly adminService = inject(AdminService);
  readonly i18n = inject(I18nService);

  readonly loading = signal(true);
  readonly stats = signal<AdminStats | null>(null);

  constructor() {
    this.charger();
  }

  async charger(): Promise<void> {
    this.loading.set(true);
    try {
      this.stats.set(await this.adminService.stats());
    } finally {
      this.loading.set(false);
    }
  }
}
