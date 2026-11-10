import { Routes } from '@angular/router';
import { authGuard, guestGuard, userGuard } from '../core/auth/auth.guards';
import { Surface } from './surface.model';

/** Dışarıya açık build (ng build -c production,public): public tanıtım sayfası ve Mezun Portalı. Yönetim paneli yok. */
export const SURFACE: Surface = 'public';

export const SURFACE_ROUTES: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('../pages/public/public') },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('../pages/login/login') },
  {
    path: 'user',
    canActivate: [authGuard, userGuard],
    loadChildren: () => import('../pages/user/user.routes'),
  },
  { path: '**', redirectTo: '' },
];
