import { Routes } from '@angular/router';
import { PortalLayout } from './portal-layout/portal-layout';

/**
 * /portal: USER rolünün arayüzü (Mezun Portalı). Admin shell'inden ayrı, kendi iskeleti vardır.
 * Path'ler ve başlıklar backend menüleriyle aynıdır (V006_PortalMenus). Sayfalar şimdilik sabit verilerle çalışır;
 * her sayfanın verisi kendi klasöründeki *.mock.ts dosyasındadır.
 */
export default [
  {
    path: '',
    component: PortalLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', data: { title: 'menu_portal_home' }, loadComponent: () => import('./home/home') },
      { path: 'profile', data: { title: 'menu_portal_profile' }, loadComponent: () => import('./profile/profile') },
      { path: 'services', data: { title: 'menu_portal_services' }, loadComponent: () => import('./services/services') },
      { path: 'career', data: { title: 'menu_portal_career' }, loadComponent: () => import('./career/career') },
      { path: 'events', data: { title: 'menu_portal_events' }, loadComponent: () => import('./events/events') },
      {
        path: 'announcements',
        data: { title: 'menu_portal_announcements' },
        loadComponent: () => import('./announcements/announcements'),
      },
      { path: 'messages', data: { title: 'menu_portal_messages' }, loadComponent: () => import('./messages/messages') },
      { path: 'settings', data: { title: 'menu_portal_settings' }, loadComponent: () => import('./settings/settings') },
      { path: 'help', data: { title: 'menu_portal_help' }, loadComponent: () => import('./help/help') },
      { path: '**', redirectTo: 'home' },
    ],
  },
] satisfies Routes;
