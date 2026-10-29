import { Routes } from '@angular/router';

/** /definitions/categories — referans CRUD modülü. Yeni modül açarken bu klasör kopyalanır. */
export default [{ path: '', loadComponent: () => import('./category-list/category-list') }] satisfies Routes;
