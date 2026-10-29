import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { sessionFeature } from './session.state';

/**
 * Guard'lar kullanıcı deneyimi içindir (boş ekran yerine login ya da 403 sayfası).
 * Asıl güvenlik backend'dedir (@PreAuthorize).
 */

/** Shell'de durur ve bütün iç sayfaları korur. Giriş yoksa login'e, dönüş adresiyle gider. */
export const authGuard: CanActivateFn = (_route, state) => {
  const isAuthenticated = inject(Store).selectSignal(sessionFeature.selectIsAuthenticated)();
  return isAuthenticated || inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Yönetim grubunda durur. */
export const adminGuard: CanActivateFn = () => {
  const isAdmin = inject(Store).selectSignal(sessionFeature.selectIsAdmin)();
  return isAdmin || inject(Router).createUrlTree(['/forbidden']);
};

/** Login sayfasında durur: zaten giriş yapmış kullanıcı anasayfaya gider. */
export const guestGuard: CanActivateFn = () => {
  const isAuthenticated = inject(Store).selectSignal(sessionFeature.selectIsAuthenticated)();
  return !isAuthenticated || inject(Router).createUrlTree(['/']);
};
