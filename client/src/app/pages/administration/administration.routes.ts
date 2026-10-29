import { Routes } from '@angular/router';

/** /administration — "Yönetim" menü grubu; sadece ADMIN (adminGuard app.routes.ts'te). */
export default [
  { path: '', pathMatch: 'full', redirectTo: 'users' },
  {
    path: 'users',
    data: { title: 'menu_users' },
    loadChildren: () => import('./users/users.routes'),
  },
] satisfies Routes;
