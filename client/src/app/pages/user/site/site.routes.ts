import { Routes } from '@angular/router';

/**
 * /user/site: üst menünün kurumsal sayfaları (Kurumlar, Hizmetler, Duyurular, Dijital Platform, İletişim). Portal iskeletinin içinde
 * açılır. Bağlantıları shared/program/program.mock.ts'teki SITE_LINKS'tedir; DB menüsünde değildir.
 */
export default [
  { path: '', pathMatch: 'full', redirectTo: 'platform' },
  { path: 'platform', data: { title: 'menu_site_platform' }, loadComponent: () => import('./platform/platform') },
  {
    path: 'institutions',
    data: { title: 'menu_site_institutions' },
    loadComponent: () => import('./institutions/institutions'),
  },
  { path: 'services', data: { title: 'menu_site_services' }, loadComponent: () => import('./services/site-services') },
  {
    path: 'announcements',
    data: { title: 'menu_site_announcements' },
    loadComponent: () => import('./announcements/site-announcements'),
  },
  { path: 'contact', data: { title: 'menu_site_contact' }, loadComponent: () => import('./contact/contact') },
] satisfies Routes;
