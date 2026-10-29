import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL, ApiResponse, unwrap } from '../../../core/api/api-response';
import { CategoryCreateRequest, CategoryResponse, CategoryUpdateRequest } from './category.model';

/** Backend'deki CategoryController'ın birebir karşılığı. Hataları errorInterceptor gösterir. */
@Injectable({ providedIn: 'root' })
export class CategoryApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/categories`;

  getAll(): Observable<CategoryResponse[]> {
    return this.http.get<ApiResponse<CategoryResponse[]>>(this.url).pipe(unwrap());
  }

  create(request: CategoryCreateRequest): Observable<CategoryResponse> {
    return this.http.post<ApiResponse<CategoryResponse>>(this.url, request).pipe(unwrap());
  }

  update(id: number, request: CategoryUpdateRequest): Observable<CategoryResponse> {
    return this.http.put<ApiResponse<CategoryResponse>>(`${this.url}/${id}`, request).pipe(unwrap());
  }

  delete(id: number): Observable<null> {
    return this.http.delete<ApiResponse<null>>(`${this.url}/${id}`).pipe(unwrap());
  }
}
