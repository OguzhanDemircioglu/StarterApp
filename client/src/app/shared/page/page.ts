import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { filter, map, startWith } from 'rxjs';
import { buildBreadcrumb } from './breadcrumb';

/**
 * Her sayfanın dış iskeleti: breadcrumb + başlık + içerik.
 * Başlık ve breadcrumb route ağacındaki data.title değerlerinden otomatik üretilir.
 *
 *   <app-page>
 *     <app-section title="category_list_title"> ... </app-section>
 *   </app-page>
 */
@Component({
  selector: 'app-page',
  imports: [RouterLink, TranslatePipe, NzBreadCrumbModule],
  templateUrl: './page.html',
  styleUrl: './page.css',
})
export class Page {
  private readonly router = inject(Router);

  protected readonly crumbs = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null),
      map(() => buildBreadcrumb(this.router.routerState.snapshot.root)),
    ),
    { requireSync: true },
  );

  protected readonly title = computed(() => this.crumbs().at(-1)?.titleKey ?? '');
}
