import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { hasRole } from './roles';
import { Role } from './session.model';
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

/**
 * Menü grubunun en düşük rolü (hiyerarşiyle: 'USER' yazan grup ADMIN ve SUPERADMIN'e de açıktır, OWNER'a değil).
 * Örnek: Yönetim grubu roleGuard('ADMIN'), Tanımlar grubu roleGuard('USER').
 */
export function roleGuard(required: Role): CanActivateFn {
  return () => {
    const role = inject(Store).selectSignal(sessionFeature.selectRole)();
    return hasRole(role, required) || inject(Router).createUrlTree(['/forbidden']);
  };
}

/** Login sayfasında durur: zaten giriş yapmış kullanıcı anasayfaya gider. */
export const guestGuard: CanActivateFn = () => {
  const isAuthenticated = inject(Store).selectSignal(sessionFeature.selectIsAuthenticated)();
  return !isAuthenticated || inject(Router).createUrlTree(['/']);
};
