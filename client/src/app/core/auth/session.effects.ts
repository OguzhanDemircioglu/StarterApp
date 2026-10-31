import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, EMPTY, exhaustMap, ignoreElements, map, of, switchMap, tap, timer } from 'rxjs';
import { AuthApi } from './auth-api';
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
        tap(({ returnUrl }) => this.router.navigateByUrl(safeReturnUrl(returnUrl))),
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

/** Sadece uygulama içi adreslere dönülür; başka sitelere yönlendirme (open redirect) engellenir. */
export function safeReturnUrl(returnUrl: string | null | undefined): string {
  return returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/';
}
