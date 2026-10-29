import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, Routes } from '@angular/router';
import { buildBreadcrumb } from './breadcrumb';

@Component({ template: '' })
class Empty {}

// app.routes.ts ile aynı şekil: grup route'u loadChildren yerine children ile.
const routes: Routes = [
  {
    path: '',
    component: Empty,
    children: [
      { path: '', data: { title: 'menu_home' }, component: Empty },
      {
        path: 'definitions',
        data: { title: 'menu_definitions' },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'categories' },
          {
            path: 'categories',
            data: { title: 'menu_categories' },
            children: [{ path: '', component: Empty }],
          },
        ],
      },
    ],
  },
];

describe('buildBreadcrumb', () => {
  async function crumbsFor(url: string) {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    return buildBreadcrumb(router.routerState.snapshot.root);
  }

  it('follows the route tree and starts from home', async () => {
    expect(await crumbsFor('/definitions/categories')).toEqual([
      { titleKey: 'menu_home', url: '/' },
      { titleKey: 'menu_definitions', url: '/definitions' },
      { titleKey: 'menu_categories', url: '/definitions/categories' },
    ]);
  });

  it('does not repeat a title inherited by an empty-path child', async () => {
    const crumbs = await crumbsFor('/definitions/categories');
    expect(crumbs.filter((crumb) => crumb.titleKey === 'menu_categories')).toHaveLength(1);
  });

  it('shows only home on the home page', async () => {
    expect(await crumbsFor('/')).toEqual([{ titleKey: 'menu_home', url: '/' }]);
  });
});
