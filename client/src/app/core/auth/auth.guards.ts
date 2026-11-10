import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { isStaff } from './roles';
import { Role } from './session.model';
import { sessionFeature } from './session.state';

/**
 * Guard'lar kullanıcı deneyimi içindir (boş ekran yerine login ya da rolün kendi arayüzü).
 * Asıl güvenlik backend'dedir: yol kuralları (/api/admin/**, /api/portal/**) ve yüzey (APP_SURFACE).
 */

/** Her rolün giriş sonrası arayüzü: ADMIN ve SUPERADMIN yönetim paneli, USER Mezun Portalı. */
export function homeFor(role: Role | undefined): string {
  return isStaff(role) ? '/admin' : '/user';
}

/** /admin ve /user'da durur. Giriş yoksa login'e, dönüş adresiyle gider. */
export const authGuard: CanActivateFn = (_route, state) => {
  const isAuthenticated = inject(Store).selectSignal(sessionFeature.selectIsAuthenticated)();
  return (
    isAuthenticated ||
    inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } })
  );
};

/** /admin'de durur: yönetim paneli sadece ADMIN ve SUPERADMIN içindir, USER kendi arayüzüne gider. */
export const adminGuard: CanActivateFn = () => {
  const isAdmin = inject(Store).selectSignal(sessionFeature.selectIsAdmin)();
  return isAdmin || inject(Router).createUrlTree([homeFor('USER')]);
};

/** /user'da durur: Mezun Portalı sadece USER içindir. Yönetim kullanıcıları mezun gibi davranamaz. */
export const userGuard: CanActivateFn = () => {
  const role = inject(Store).selectSignal(sessionFeature.selectUser)()?.role;
  return role === 'USER' || inject(Router).createUrlTree([homeFor(role)]);
};

/** Login sayfasında durur: zaten giriş yapmış kullanıcı kendi arayüzüne gider. */
export const guestGuard: CanActivateFn = () => {
  const store = inject(Store);
  const isAuthenticated = store.selectSignal(sessionFeature.selectIsAuthenticated)();
  return (
    !isAuthenticated ||
    inject(Router).createUrlTree([homeFor(store.selectSignal(sessionFeature.selectUser)()?.role)])
  );
};
