import { Component, computed, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgTemplateOutlet } from '@angular/common';
import type { EChartsCoreOption } from 'echarts/core';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { sessionFeature } from '../../core/auth/session.state';
import { Chart } from '../../shared/charts/chart';
import { formatDay, formatNumber } from '../../shared/charts/chart-format';
import { Page } from '../../shared/page/page';
import { Section } from '../../shared/page/section';
import { loadEchartsExtensions } from '../../shared/charts/echarts-extensions';
import { ChartBuilder, ChartContext } from './dashboard/dashboard.model';
import { extensionCharts } from './dashboard/extensions.charts';
import { financeCharts } from './dashboard/finance.charts';
import { galleryCharts } from './dashboard/gallery.charts';
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
  { title: 'dash_tab_gallery', build: galleryCharts },
];

/**
 * / — iki örnek bir arada: sekmelerdeki restoran panosu mock veriyle bütün ECharts türlerini gösterir (dashboard/),
 * son sekmedeki "son 30 günde eklenen kategoriler" ise grafiğin backend'den beslendiği referans kalıptır.
 */
@Component({
  imports: [NgTemplateOutlet, TranslatePipe, NzTabsModule, NzTagModule, Page, Section, Chart],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export default class Home {
  private readonly reportApi = inject(HomeReportApi);
  private readonly translate = inject(TranslateService);

  protected readonly user = inject(Store).selectSignal(sessionFeature.selectUser);
  protected readonly loading = signal(true);
  private readonly points = signal<PeriodValue[]>([]);

  protected readonly empty = computed(() => this.points().every((point) => point.value === 0));

  private readonly context: ChartContext = { t: (key) => this.translate.instant(key) };

  protected readonly tabs = TABS.map((tab) => ({ title: tab.title, cards: tab.build(this.context) }));

  /** 3B ve eklenti grafikleri büyük paketler kullanır: sadece sekmesi açılınca indirilir. */
  private readonly extensionsReady = signal(false);
  protected readonly extensionCards = computed(() => (this.extensionsReady() ? extensionCharts(this.context) : []));

  protected readonly kpis = overviewKpis().map((kpi) => ({
    ...kpi,
    deltaText: formatNumber(Math.round(Math.abs(kpi.delta) * 10) / 10),
    good: kpi.delta >= 0 === kpi.higherIsBetter,
    up: kpi.delta >= 0,
  }));

  protected readonly chartOptions = computed<EChartsCoreOption>(() => ({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: this.points().map((point) => formatDay(point.period)) },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        type: 'bar',
        name: this.translate.instant('home_chart_series'),
        data: this.points().map((point) => point.value),
      },
    ],
  }));

  protected async loadExtensions(): Promise<void> {
    await loadEchartsExtensions();
    this.extensionsReady.set(true);
  }

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
