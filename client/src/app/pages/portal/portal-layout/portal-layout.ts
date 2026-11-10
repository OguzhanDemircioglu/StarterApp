import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { filter } from 'rxjs';
import { SessionActions } from '../../../core/auth/session.actions';
import { sessionFeature } from '../../../core/auth/session.state';
import { MOCK_PROFILE, PORTAL_MENU, SITE_LINKS } from '../portal.mock';

/** Mezun Portalı iskeleti: üstte kurumsal bar, solda portal menüsü, ortada sayfa. */
@Component({
  selector: 'app-portal-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NzDropdownModule, NzIconModule, NzMenuModule],
  templateUrl: './portal-layout.html',
  styleUrl: './portal-layout.css',
})
export class PortalLayout {
  private readonly store = inject(Store);

  protected readonly menu = PORTAL_MENU;
  protected readonly siteLinks = SITE_LINKS;
  protected readonly profile = MOCK_PROFILE;
  protected readonly isAdmin = this.store.selectSignal(sessionFeature.selectIsAdmin);

  /** Dar ekranda sol menü üstte açılır; sayfa değişince kapanır. */
  protected readonly menuOpen = signal(false);

  constructor() {
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.menuOpen.set(false));
  }

  protected logout(): void {
    this.store.dispatch(SessionActions.logout());
  }
}
