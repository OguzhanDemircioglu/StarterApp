import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from '../core/auth/auth.guards';
import { Surface } from './surface.model';

/** Kapalı ağ build'i (ng build -c production,internal): sadece yönetim paneli. Public sayfa, portal ve kayıt yok. */
export const SURFACE: Surface = 'internal';

export const SURFACE_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'admin' },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('../pages/login/login') },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('../pages/admin/admin.routes'),
  },
  { path: '**', redirectTo: 'admin' },
];
