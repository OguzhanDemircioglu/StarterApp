import { Component, computed, inject, input } from '@angular/core';
import type { EChartsCoreOption } from 'echarts/core';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { LanguageService } from '../../core/i18n/language';
import { formatNumber } from './chart-format';
import { echarts } from './echarts-setup';

/** Ant Design paleti: bütün grafikler aynı renkleri kullanır. */
const CHART_COLORS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#13c2c2', '#722ed1', '#eb2f96', '#fa8c16'];

/**
 * Bütün grafikler bu bileşen üzerinden çizilir (Frontend_Architecture.md §12):
 * ortak renkler, dil duyarlı sayı biçimi, "yükleniyor" ve "veri yok" durumları, otomatik yeniden boyutlandırma.
 * Sayfa sadece grafiğin kendi ayarlarını (seriler, eksenler) verir.
 *
 *   <app-chart [options]="options()" [loading]="loading()" [empty]="empty()" />
 */
@Component({
  selector: 'app-chart',
  imports: [NgxEchartsDirective, NzSpinModule, NzEmptyModule],
  providers: [provideEchartsCore({ echarts })],
  template: `
    <nz-spin [nzSpinning]="loading()">
      @if (empty() && !loading()) {
        <nz-empty class="chart-empty" [style.height]="height()" />
      } @else {
        <div echarts [options]="mergedOptions()" [style.height]="height()"></div>
      }
    </nz-spin>
  `,
  styles: `
    .chart-empty {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  `,
})
export class Chart {
  private readonly language = inject(LanguageService).current;

  readonly options = input.required<EChartsCoreOption>();
  readonly loading = input(false);
  readonly empty = input(false);
  readonly height = input('320px');

  protected readonly mergedOptions = computed<EChartsCoreOption>(() => {
    const options = this.options();
    const language = this.language() ?? 'tr';
    return {
      color: CHART_COLORS,
      grid: { left: 16, right: 16, top: 32, bottom: 16, containLabel: true },
      ...options,
      tooltip: {
        valueFormatter: (value: unknown) => (typeof value === 'number' ? formatNumber(value, language) : String(value)),
        ...(options['tooltip'] as object | undefined),
      },
    };
  });
}
