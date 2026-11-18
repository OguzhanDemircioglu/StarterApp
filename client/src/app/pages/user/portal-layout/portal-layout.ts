import { Component, DestroyRef, ElementRef, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
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
import { AmbientBg } from '../../../shared/theme/ambient-bg';
import { Banner } from '../../../shared/theme/banner';
import { BrandLogo } from '../../../shared/theme/brand-logo';
import { LiquidNav } from '../../../shared/theme/liquid-nav';
import { revealOnScroll } from '../../../shared/theme/reveal';
import { SITE_LINKS } from '../../../shared/program/program.mock';
import { MOCK_PROFILE } from '../portal.mock';

/** Portal grubunun kök menüsü (backend V006_PortalMenus, route'u V007_RoleAreaRoutes ile /user). */
const PORTAL_ROUTE = '/user';

/** Üst menünün kurumsal sayfaları bu adresin altındadır; breadcrumb kökü buna göre seçilir. */
const SITE_ROUTE = '/user/site';

/** Her sayfa açılışında sırayla, yumuşakça beliren parçalar: sayfa başlığı ve açılan sayfanın kartları. */
const REVEAL = '.page-title > *, .content > :not(app-banner, .page-title, router-outlet) :is(.card, .chips)';

/** Mezun Portalı iskeleti: üstte kurumsal bar, solda portal menüsü (DB'den), ortada sayfa. */
@Component({
  selector: 'app-portal-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, NzDropdownModule, NzIconModule, NzMenuModule, AmbientBg, Banner, BrandLogo, LiquidNav],
  host: { class: 'mk-premium' },
  templateUrl: './portal-layout.html',
  styleUrl: './portal-layout.css',
})
export class PortalLayout {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  /** Önceki sayfanın giriş animasyonu izlemesini bırakır. */
  private stopReveal = (): void => {};

  protected readonly siteLinks = SITE_LINKS;
  protected readonly profile = MOCK_PROFILE;

  /** Sol menü: oturumla gelen menü ağacındaki portal grubunun çocukları. */
  private readonly menus = this.store.selectSignal(sessionFeature.selectMenus);
  protected readonly menu = computed(() => this.menus().find((m) => m.route === PORTAL_ROUTE)?.children ?? []);

  /** Banner'daki başlık: açık sayfanın route'undaki data.title (çeviri anahtarı). */
  protected readonly titleKey = signal<string | null>(null);

  /** Dar ekranda sol menü üstte açılır; sayfa değişince kapanır. */
  protected readonly menuOpen = signal(false);

  /** Açık adres; breadcrumb kökü (Mezun Kart ya da Mezun Portalı) buna göre belirlenir. */
  private readonly url = signal(this.router.url);
  protected readonly isSitePage = computed(() => this.url().startsWith(SITE_ROUTE));

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopReveal());
    this.titleKey.set(deepestTitle(this.router.routerState.snapshot.root));
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.titleKey.set(deepestTitle(this.router.routerState.snapshot.root));
        this.url.set(this.router.url);
        this.menuOpen.set(false);
        this.revealPage();
      });
  }

  /** Yeni sayfa çizildikten sonra başlığı ve kartları sırayla getirir. */
  private revealPage(): void {
    afterNextRender(
      () => {
        this.stopReveal();
        this.stopReveal = revealOnScroll(this.host.nativeElement, REVEAL);
      },
      { injector: this.injector },
    );
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
