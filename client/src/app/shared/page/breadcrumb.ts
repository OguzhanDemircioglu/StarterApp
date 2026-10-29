import { ActivatedRouteSnapshot } from '@angular/router';

export interface Crumb {
  /** Çeviri anahtarı (route'taki data.title). */
  titleKey: string;
  url: string;
}

const HOME: Crumb = { titleKey: 'menu_home', url: '/' };

/**
 * Breadcrumb route ağacından üretilir; sayfalarda elle yazılmaz.
 * Her route'un sadece KENDİ data.title'ı okunur (routeConfig), çünkü boş path'li çocuklar
 * ebeveynin data'sını miras alır ve aynı başlık iki kez görünürdü.
 */
export function buildBreadcrumb(root: ActivatedRouteSnapshot): Crumb[] {
  const crumbs: Crumb[] = [];
  let url = '';
  let route: ActivatedRouteSnapshot | null = root;

  while (route) {
    const segment = route.url.map((part) => part.path).join('/');
    if (segment) {
      url += `/${segment}`;
    }
    const titleKey = route.routeConfig?.data?.['title'];
    if (typeof titleKey === 'string' && crumbs.at(-1)?.titleKey !== titleKey) {
      crumbs.push({ titleKey, url: url || '/' });
    }
    route = route.firstChild;
  }

  return crumbs[0]?.titleKey === HOME.titleKey ? crumbs : [HOME, ...crumbs];
}
