import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard, staffGuard } from './core/auth/auth.guards';
import { Shell } from './core/layout/shell/shell';

/**
 * En üst iskelet. Her seviye sadece kendi çocuklarını bilir; klasör ağacı = URL ağacı = menü ağacı
 * (Frontend_Architecture.md §3, §5). data.title bir çeviri anahtarıdır; sayfa başlığı ve breadcrumb buradan üretilir.
 */
export const routes: Routes = [
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./pages/login/login') },
  // USER rolünün arayüzü: kendi iskeleti olan Mezun Portalı. Admin de önizleme için açabilir.
  { path: 'portal', canActivate: [authGuard], loadChildren: () => import('./pages/portal/portal.routes') },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard, staffGuard],
    children: [
      { path: '', data: { title: 'menu_home' }, loadComponent: () => import('./pages/home/home') },
      {
        path: 'definitions',
        data: { title: 'menu_definitions' },
        loadChildren: () => import('./pages/definitions/definitions.routes'),
      },
      {
        path: 'administration',
        data: { title: 'menu_administration' },
        canActivate: [adminGuard],
        loadChildren: () => import('./pages/administration/administration.routes'),
      },
      { path: 'forbidden', data: { title: 'page_forbidden_title' }, loadComponent: () => import('./shared/pages/forbidden') },
      { path: '**', data: { title: 'page_not_found_title' }, loadComponent: () => import('./shared/pages/not-found') },
    ],
  },
];
