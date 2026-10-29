import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL, ApiResponse, unwrap } from '../../../core/api/api-response';
import { UserCreateRequest, UserPasswordResetRequest, UserResponse, UserUpdateRequest } from './user.model';

/** Backend'deki UserController'ın birebir karşılığı (sadece ADMIN). */
@Injectable({ providedIn: 'root' })
export class UserApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/users`;

  getAll(): Observable<UserResponse[]> {
    return this.http.get<ApiResponse<UserResponse[]>>(this.url).pipe(unwrap());
  }

  create(request: UserCreateRequest): Observable<UserResponse> {
    return this.http.post<ApiResponse<UserResponse>>(this.url, request).pipe(unwrap());
  }

  update(id: number, request: UserUpdateRequest): Observable<UserResponse> {
    return this.http.put<ApiResponse<UserResponse>>(`${this.url}/${id}`, request).pipe(unwrap());
  }

  resetPassword(id: number, request: UserPasswordResetRequest): Observable<null> {
    return this.http.put<ApiResponse<null>>(`${this.url}/${id}/password`, request).pipe(unwrap());
  }

  delete(id: number): Observable<null> {
    return this.http.delete<ApiResponse<null>>(`${this.url}/${id}`).pipe(unwrap());
  }
}
