import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard, userGuard } from '../core/auth/auth.guards';
import { Surface } from './surface.model';

/**
 * Bu build'in yüzeyi. Uygulama iki ayrı yerde çalışır (Frontend_Architecture.md §3):
 *   public    dışarıya açık: public tanıtım sayfası + Mezun Portalı (/user)          → surface.public.ts
 *   internal  kapalı ağ: yönetim paneli (/admin)                                       → surface.internal.ts
 *   all       sadece yerel geliştirme (npm start): ikisi birden                        → bu dosya
 * angular.json'daki public / internal yapılandırmaları bu dosyayı ilgili dosyayla değiştirir (fileReplacements);
 * böylece dışarıya açık build'e yönetim panelinin kodu hiç girmez.
 */
export const SURFACE: Surface = 'all';

export const SURFACE_ROUTES: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('../pages/public/public') },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('../pages/login/login') },
  {
    path: 'user',
    canActivate: [authGuard, userGuard],
    loadChildren: () => import('../pages/user/user.routes'),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('../pages/admin/admin.routes'),
  },
  { path: '**', redirectTo: '' },
];
