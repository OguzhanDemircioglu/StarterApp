import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_URL } from '../api/api-response';
import { sessionFeature } from './session.state';
import { TokenRefresher } from './token-refresher';

/** Token gerektirmeyen auth istekleri: token eklenmez, 401'de refresh denenmez (sonsuz döngü olmasın). */
const PUBLIC_AUTH_URLS = [
  `${API_URL}/auth/login`,
  `${API_URL}/auth/register`,
  `${API_URL}/auth/refresh`,
  `${API_URL}/auth/logout`,
];

/**
 * 1. Access token'ı Authorization başlığına ekler.
 * 2. 401 alan isteği bir kez refresh edip yeni token'la tekrarlar. Refresh de başarısızsa oturum temizlenir
 *    (TokenRefresher) ve hata yukarı iletilir; errorInterceptor bu 401 için mesaj göstermez.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (PUBLIC_AUTH_URLS.includes(request.url)) {
    return next(request);
  }

  const store = inject(Store);
  const refresher = inject(TokenRefresher);
  const token = store.selectSignal(sessionFeature.selectAccessToken)();

  return next(withToken(request, token)).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || !token) {
        return throwError(() => error);
      }
      return refresher.refresh().pipe(
        catchError(() => throwError(() => error)),
        switchMap((info) => next(withToken(request, info.accessToken))),
      );
    }),
  );
};

function withToken<T>(request: HttpRequest<T>, token: string | null): HttpRequest<T> {
  return token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
}
