import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '@ngx-translate/core';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { filter } from 'rxjs';
import { SessionActions } from '../../../core/auth/session.actions';
import { sessionFeature } from '../../../core/auth/session.state';
import { MOCK_PROFILE, SITE_LINKS } from '../portal.mock';

/** Portal grubunun kök menüsü (backend V006_PortalMenus). */
const PORTAL_ROUTE = '/portal';

/** Mezun Portalı iskeleti: üstte kurumsal bar, solda portal menüsü (DB'den), ortada sayfa. */
@Component({
  selector: 'app-portal-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, NzDropdownModule, NzIconModule, NzMenuModule],
  templateUrl: './portal-layout.html',
  styleUrl: './portal-layout.css',
})
export class PortalLayout {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  protected readonly siteLinks = SITE_LINKS;
  protected readonly profile = MOCK_PROFILE;
  protected readonly isAdmin = this.store.selectSignal(sessionFeature.selectIsAdmin);

  /** Sol menü: oturumla gelen menü ağacındaki portal grubunun çocukları. */
  private readonly menus = this.store.selectSignal(sessionFeature.selectMenus);
  protected readonly menu = computed(() => this.menus().find((m) => m.route === PORTAL_ROUTE)?.children ?? []);

  /** Banner'daki başlık: açık sayfanın route'undaki data.title (çeviri anahtarı). */
  protected readonly titleKey = signal<string | null>(null);

  /** Dar ekranda sol menü üstte açılır; sayfa değişince kapanır. */
  protected readonly menuOpen = signal(false);

  constructor() {
    this.titleKey.set(deepestTitle(this.router.routerState.snapshot.root));
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.titleKey.set(deepestTitle(this.router.routerState.snapshot.root));
        this.menuOpen.set(false);
      });
  }

  protected logout(): void {
    this.store.dispatch(SessionActions.logout());
  }
}

function deepestTitle(root: ActivatedRouteSnapshot): string | null {
  let title: string | null = null;
  for (let route: ActivatedRouteSnapshot | null = root; route; route = route.firstChild) {
    const key = route.routeConfig?.data?.['title'];
    if (typeof key === 'string') {
      title = key;
    }
  }
  return title;
}
