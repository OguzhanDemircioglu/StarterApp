import { Routes } from '@angular/router';

/** /definitions — "Tanımlar" menü grubunun sayfaları. */
export default [
  { path: '', pathMatch: 'full', redirectTo: 'categories' },
  {
    path: 'categories',
    data: { title: 'menu_categories' },
    loadChildren: () => import('./categories/categories.routes'),
  },
] satisfies Routes;
