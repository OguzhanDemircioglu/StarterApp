import { Routes } from '@angular/router';
import { Shell } from '../../core/layout/shell/shell';

/**
 * /admin: yönetim paneli (sadece ADMIN, adminGuard app.routes.ts'te). Solda DB'den gelen menü, üstte topbar.
 * data.title bir çeviri anahtarıdır; sayfa başlığı ve breadcrumb buradan üretilir.
 */
export default [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', data: { title: 'menu_home' }, loadComponent: () => import('./home/home') },
      {
        path: 'definitions',
        data: { title: 'menu_definitions' },
        loadChildren: () => import('./definitions/definitions.routes'),
      },
      {
        path: 'administration',
        data: { title: 'menu_administration' },
        loadChildren: () => import('./administration/administration.routes'),
      },
      {
        path: 'forbidden',
        data: { title: 'page_forbidden_title' },
        loadComponent: () => import('../../shared/pages/forbidden'),
      },
      {
        path: '**',
        data: { title: 'page_not_found_title' },
        loadComponent: () => import('../../shared/pages/not-found'),
      },
    ],
  },
] satisfies Routes;
