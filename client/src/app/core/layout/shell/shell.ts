import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { Banner } from '../../../shared/theme/banner';
import { BrandLogo } from '../../../shared/theme/brand-logo';
import { SidebarMenu } from '../sidebar-menu/sidebar-menu';
import { Topbar } from '../topbar/topbar';

/**
 * Yönetim panelinin (/admin) kabuğu: solda DB'den gelen menü, üstte topbar, ortada sayfa (router-outlet).
 * Tema Mezun Portalı ile aynıdır (src/theme.css); route'lar pages/admin/admin.routes.ts'te.
 */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, NzLayoutModule, SidebarMenu, Topbar, Banner, BrandLogo],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  /** Dar ekranlarda menü otomatik kapanır (nzBreakpoint). */
  protected readonly collapsed = signal(false);
}
