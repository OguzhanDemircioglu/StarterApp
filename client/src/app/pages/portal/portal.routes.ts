import { Routes } from '@angular/router';
import { PortalLayout } from './portal-layout/portal-layout';

/**
 * /portal: USER rolünün arayüzü (Mezun Portalı). Admin shell'inden ayrı, kendi iskeleti vardır.
 * Şimdilik sadece Profilim dolu; diğer menüler "yakında" sayfası gösterir.
 */
export default [
  {
    path: '',
    component: PortalLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'profile' },
      { path: 'profile', loadComponent: () => import('./profile/profile') },
      { path: '**', loadComponent: () => import('./coming-soon/coming-soon') },
    ],
  },
] satisfies Routes;
