import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL, ApiResponse, unwrap } from '../../core/api/api-response';
import { PeriodValue } from './home-report.model';

/** Anasayfa grafiğinin rapor endpoint'i. Toplama backend'de yapılır (Backend_Architecture.md §5.5). */
@Injectable({ providedIn: 'root' })
export class HomeReportApi {
  private readonly http = inject(HttpClient);

  categoriesCreated(days: number): Observable<PeriodValue[]> {
    return this.http
      .get<ApiResponse<PeriodValue[]>>(`${API_URL}/reports/categories-created`, { params: { days } })
      .pipe(unwrap());
  }
}
