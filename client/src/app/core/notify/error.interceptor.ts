import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_URL } from '../api/api-response';
import { Notifier } from './notifier';

/** Backend'in mesaj anahtarı formatı (snake_case). */
const MESSAGE_KEY = /^[a-z0-9]+(_[a-z0-9]+)*$/;

/**
 * Bütün HTTP hatalarını tek yerde gösterir. Sayfalar hata durumunu ayrıca ele almaz; form açık kalır.
 * 401'ler login dışında gösterilmez: onları authInterceptor (refresh) ve oturum akışı yönetir.
 * Zincirin en dışındadır: authInterceptor'ın refresh denemesinden sonra çalışır.
 */
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const notifier = inject(Notifier);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && shouldNotify(error, request.url)) {
        notifier.error(messageKeyOf(error));
      }
      return throwError(() => error);
    }),
  );
};

function shouldNotify(error: HttpErrorResponse, url: string): boolean {
  return error.status !== 401 || url === `${API_URL}/auth/login`;
}

export function messageKeyOf(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'common_network_error';
  }
  const key = error.error?.message;
  if (typeof key === 'string' && MESSAGE_KEY.test(key)) {
    return key;
  }
  return error.status >= 500 ? 'unexpected_error' : 'invalid_request';
}
