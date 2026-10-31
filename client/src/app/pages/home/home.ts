import { Component, computed, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import type { EChartsCoreOption } from 'echarts/core';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { sessionFeature } from '../../core/auth/session.state';
import { LanguageService } from '../../core/i18n/language';
import { Chart } from '../../shared/charts/chart';
import { formatDay, formatNumber } from '../../shared/charts/chart-format';
import { Page } from '../../shared/page/page';
import { Section } from '../../shared/page/section';
import { ChartBuilder, ChartContext } from './dashboard/dashboard.model';
import { financeCharts } from './dashboard/finance.charts';
import { menuCharts } from './dashboard/menu.charts';
import { operationsCharts } from './dashboard/operations.charts';
import { overviewCharts, overviewKpis } from './dashboard/overview.charts';
import { salesCharts } from './dashboard/sales.charts';
import { HomeReportApi } from './home-report-api';
import { PeriodValue } from './home-report.model';

const DAYS = 30;

const TABS: { title: string; build: ChartBuilder }[] = [
  { title: 'dash_tab_overview', build: overviewCharts },
  { title: 'dash_tab_sales', build: salesCharts },
  { title: 'dash_tab_menu', build: menuCharts },
  { title: 'dash_tab_operations', build: operationsCharts },
  { title: 'dash_tab_finance', build: financeCharts },
];

/**
 * / — iki örnek bir arada: sekmelerdeki restoran panosu mock veriyle bütün ECharts türlerini gösterir (dashboard/),
 * son sekmedeki "son 30 günde eklenen kategoriler" ise grafiğin backend'den beslendiği referans kalıptır.
 */
@Component({
  imports: [TranslatePipe, NzTabsModule, NzTagModule, Page, Section, Chart],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export default class Home {
  private readonly reportApi = inject(HomeReportApi);
  private readonly translate = inject(TranslateService);
  private readonly language = inject(LanguageService).current;

  protected readonly user = inject(Store).selectSignal(sessionFeature.selectUser);
  protected readonly loading = signal(true);
  private readonly points = signal<PeriodValue[]>([]);

  protected readonly empty = computed(() => this.points().every((point) => point.value === 0));

  private readonly context = computed<ChartContext>(() => ({
    t: (key) => this.translate.instant(key),
    language: this.language() ?? 'tr',
  }));

  protected readonly tabs = computed(() =>
    TABS.map((tab) => ({ title: tab.title, cards: tab.build(this.context()) })),
  );

  protected readonly kpis = computed(() =>
    overviewKpis(this.context()).map((kpi) => ({
      ...kpi,
      deltaText: formatNumber(Math.round(Math.abs(kpi.delta) * 10) / 10, this.context().language),
      good: kpi.delta >= 0 === kpi.higherIsBetter,
      up: kpi.delta >= 0,
    })),
  );

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
