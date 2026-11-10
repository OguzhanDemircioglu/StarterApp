import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, EMPTY, exhaustMap, ignoreElements, map, of, switchMap, tap, timer } from 'rxjs';
import { AuthApi } from './auth-api';
import { homeFor } from './auth.guards';
import { Role } from './session.model';
import { SessionActions } from './session.actions';
import { TokenRefresher } from './token-refresher';

/** Access token'ın süresi dolmadan bu kadar saniye önce yenilenir. */
const REFRESH_BEFORE_EXPIRY_SECONDS = 60;

@Injectable()
export class SessionEffects {
  private readonly actions$ = inject(Actions);
  private readonly authApi = inject(AuthApi);
  private readonly refresher = inject(TokenRefresher);
  private readonly router = inject(Router);

  readonly login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SessionActions.login),
      exhaustMap(({ email, password, returnUrl }) =>
        this.authApi.login(email, password).pipe(
          map((info) => SessionActions.loginSucceeded({ info, returnUrl })),
          // Hata mesajını errorInterceptor gösterir; burada sadece formun yükleniyor durumu kapanır.
          catchError(() => of(SessionActions.loginFailed())),
        ),
      ),
    ),
  );

  readonly register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SessionActions.register),
      exhaustMap(({ request, returnUrl }) =>
        this.authApi.register(request).pipe(
          map(() => SessionActions.login({ email: request.email, password: request.password, returnUrl })),
          // Hata mesajını errorInterceptor gösterir.
          catchError(() => of(SessionActions.loginFailed())),
        ),
      ),
    ),
  );

  readonly navigateAfterLogin$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SessionActions.loginSucceeded),
        tap(({ info, returnUrl }) => this.router.navigateByUrl(afterLoginUrl(returnUrl, info.user.role))),
      ),
    { dispatch: false },
  );

  readonly logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SessionActions.logout),
      exhaustMap(() =>
        this.authApi.logout().pipe(
          catchError(() => of(null)),
          map(() => SessionActions.cleared()),
        ),
      ),
    ),
  );

  readonly navigateToLogin$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SessionActions.cleared),
        tap(() => this.router.navigateByUrl('/login')),
      ),
    { dispatch: false },
  );

  /**
   * Access token süresi dolmadan yenilenir; böylece menüler ve kullanıcı bilgisi de tazelenir.
   * Her yeni token geldiğinde zamanlayıcı baştan kurulur, oturum bitince durur.
   */
  readonly scheduleRefresh$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SessionActions.loginSucceeded, SessionActions.refreshed, SessionActions.cleared, SessionActions.restoreFailed),
        switchMap((action) => {
          if (action.type !== SessionActions.loginSucceeded.type && action.type !== SessionActions.refreshed.type) {
            return EMPTY;
          }
          const delaySeconds = Math.max(action.info.expiresIn - REFRESH_BEFORE_EXPIRY_SECONDS, 30);
          return timer(delaySeconds * 1000).pipe(
            switchMap(() => this.refresher.refresh().pipe(catchError(() => EMPTY))),
            ignoreElements(),
          );
        }),
      ),
    { dispatch: false },
  );
}

/**
 * Girişten sonra gidilecek adres. Sadece uygulama içi adreslere dönülür; başka sitelere yönlendirme (open redirect)
 * engellenir. Dönüş adresi yoksa (ya da public anasayfaysa) kullanıcı rolünün arayüzüne gider.
 */
export function afterLoginUrl(returnUrl: string | null | undefined, role: Role): string {
  const inApp = !!returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//');
  return inApp && returnUrl !== '/' ? returnUrl : homeFor(role);
}
