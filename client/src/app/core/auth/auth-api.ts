import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL, ApiResponse, unwrap } from '../api/api-response';
import { ChangePasswordRequest, RegisterRequest, SessionInfo } from './session.model';

/**
 * login, refresh ve logout cookie (refresh_token) ile çalışır; bu yüzden withCredentials ile çağrılır.
 * Bu üç istek Authorization başlığı taşımaz (authInterceptor).
 */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);

  login(email: string, password: string): Observable<SessionInfo> {
    return this.http
      .post<ApiResponse<SessionInfo>>(`${API_URL}/auth/login`, { email, password }, { withCredentials: true })
      .pipe(unwrap());
  }

  /** Sadece yerel geliştirmede vardır (TokenRefresher.restore). */
  devLogin(): Observable<SessionInfo> {
    return this.http
      .post<ApiResponse<SessionInfo>>(`${API_URL}/auth/dev-login`, null, { withCredentials: true })
      .pipe(unwrap());
  }

  register(request: RegisterRequest): Observable<null> {
    return this.http.post<ApiResponse<null>>(`${API_URL}/auth/register`, request).pipe(unwrap());
  }

  refresh(): Observable<SessionInfo> {
    return this.http
      .post<ApiResponse<SessionInfo>>(`${API_URL}/auth/refresh`, null, { withCredentials: true })
      .pipe(unwrap());
  }

  logout(): Observable<null> {
    return this.http
      .post<ApiResponse<null>>(`${API_URL}/auth/logout`, null, { withCredentials: true })
      .pipe(unwrap());
  }

  changePassword(request: ChangePasswordRequest): Observable<null> {
    return this.http.put<ApiResponse<null>>(`${API_URL}/auth/password`, request).pipe(unwrap());
  }
}
