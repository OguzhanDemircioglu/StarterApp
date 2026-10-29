import { Routes } from '@angular/router';

/** /administration/users — kullanıcı yönetimi. */
export default [{ path: '', loadComponent: () => import('./user-list/user-list') }] satisfies Routes;
