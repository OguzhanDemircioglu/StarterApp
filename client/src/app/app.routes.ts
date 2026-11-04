import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/auth/auth.guards';
import { Shell } from './core/layout/shell/shell';

/**
 * En üst iskelet. Her seviye sadece kendi çocuklarını bilir; klasör ağacı = URL ağacı = menü ağacı
 * (Frontend_Architecture.md §3, §5). data.title bir çeviri anahtarıdır; sayfa başlığı ve breadcrumb buradan üretilir.
 */
export const routes: Routes = [
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./pages/login/login') },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', data: { title: 'menu_home' }, loadComponent: () => import('./pages/home/home') },
      {
        path: 'definitions',
        data: { title: 'menu_definitions' },
        canActivate: [roleGuard('USER')],
        loadChildren: () => import('./pages/definitions/definitions.routes'),
      },
      {
        path: 'administration',
        data: { title: 'menu_administration' },
        canActivate: [roleGuard('ADMIN')],
        loadChildren: () => import('./pages/administration/administration.routes'),
      },
      { path: 'forbidden', data: { title: 'page_forbidden_title' }, loadComponent: () => import('./shared/pages/forbidden') },
      { path: '**', data: { title: 'page_not_found_title' }, loadComponent: () => import('./shared/pages/not-found') },
    ],
  },
];
