import { Component, computed, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import type { EChartsCoreOption } from 'echarts/core';
import { sessionFeature } from '../../core/auth/session.state';
import { LanguageService } from '../../core/i18n/language';
import { Chart } from '../../shared/charts/chart';
import { formatDay } from '../../shared/charts/chart-format';
import { Page } from '../../shared/page/page';
import { Section } from '../../shared/page/section';
import { HomeReportApi } from './home-report-api';
import { PeriodValue } from './home-report.model';

const DAYS = 30;

/** / — karşılama ve grafik ekranları için referans örnek: "son 30 günde eklenen kategoriler". */
@Component({
  imports: [TranslatePipe, Page, Section, Chart],
  templateUrl: './home.html',
})
export default class Home {
  private readonly reportApi = inject(HomeReportApi);
  private readonly translate = inject(TranslateService);
  private readonly language = inject(LanguageService).current;

  protected readonly user = inject(Store).selectSignal(sessionFeature.selectUser);
  protected readonly loading = signal(true);
  private readonly points = signal<PeriodValue[]>([]);

  protected readonly empty = computed(() => this.points().every((point) => point.value === 0));

  protected readonly chartOptions = computed<EChartsCoreOption>(() => {
    const language = this.language() ?? 'tr';
    return {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: this.points().map((point) => formatDay(point.period, language)) },
      yAxis: { type: 'value', minInterval: 1 },
      series: [
        {
          type: 'bar',
          name: this.translate.instant('home_chart_series'),
          data: this.points().map((point) => point.value),
        },
      ],
    };
  });

  constructor() {
    this.reportApi.categoriesCreated(DAYS).subscribe({
      next: (points) => {
        this.points.set(points);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
