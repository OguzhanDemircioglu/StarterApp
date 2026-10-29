import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '@ngx-translate/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { filter, map, startWith } from 'rxjs';
import { sessionFeature } from '../../auth/session.state';

/**
 * Menü ağacı backend'den (SessionInfo.menus) gelir; burada sadece çizilir.
 * ADMIN'e özel menüleri backend zaten süzmüş olarak gönderir. Alt menüsü olan düğümler grup olur,
 * olmayanlar sayfa bağlantısıdır. Ağaç derinliği sınırsızdır (şablon kendini çağırır).
 */
@Component({
  selector: 'app-sidebar-menu',
  imports: [NgTemplateOutlet, RouterLink, TranslatePipe, NzMenuModule, NzIconModule],
  templateUrl: './sidebar-menu.html',
})
export class SidebarMenu {
  private readonly router = inject(Router);

  readonly collapsed = input(false);
  protected readonly menus = inject(Store).selectSignal(sessionFeature.selectMenus);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { requireSync: true },
  );

  /** Açık sayfanın üst grubu açık gelir. */
  protected isInside(route: string | null): boolean {
    return !!route && route !== '/' && this.currentUrl().startsWith(route);
  }
}
