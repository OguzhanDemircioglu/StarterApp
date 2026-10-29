import { map, OperatorFunction } from 'rxjs';

/** Backend'in bütün cevaplarındaki değişmez format (Backend_Architecture.md §5.1). */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  traceId: string;
}

/** Bütün istekler göreli adrese gider: dev'de proxy.conf.json, Docker'da nginx backend'e yönlendirir. */
export const API_URL = '/api';

/** ApiResponse içinden sadece data'yı çıkarır; servisler sayfalara Observable<T> döner. */
export function unwrap<T>(): OperatorFunction<ApiResponse<T>, T> {
  return map((response) => response.data);
}
