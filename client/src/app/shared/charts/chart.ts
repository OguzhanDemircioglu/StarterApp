import { Component, computed, inject, input } from '@angular/core';
import type { EChartsCoreOption } from 'echarts/core';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { LanguageService } from '../../core/i18n/language';
import { CHART_COLORS } from './chart-colors';
import { formatNumber } from './chart-format';
import { echarts } from './echarts-setup';

const AXES = ['xAxis', 'yAxis', 'xAxis3D', 'yAxis3D', 'zAxis3D'];

/** Sayısal eksenin etiketleri de seçili dilde yazılır: 3.000 / 3,000. */
function localizedAxis(axis: unknown, language: string): unknown {
  const { type, axisLabel } = axis as { type?: string; axisLabel?: object };
  if (type !== 'value') {
    return axis;
  }
  const formatter = (value: number) => formatNumber(value, language);
  return { ...(axis as object), axisLabel: { formatter, ...axisLabel } };
}

/** Sayfanın verdiği ayarlara ortak görünümü ekler. */
function withDefaults(options: EChartsCoreOption, language: string): EChartsCoreOption {
  return {
    color: CHART_COLORS,
    ...options,
    // ECharts 6 göstergeyi alta koyar ve eksen etiketleriyle çakışır; varsayılanımız üsttür.
    ...(options['legend'] ? { legend: { top: 0, ...(options['legend'] as object) } } : {}),
    ...Object.fromEntries(
      AXES.filter((axis) => options[axis]).map((axis) => [axis, localizedAxis(options[axis], language)]),
    ),
    // outerBoundsMode: eksen etiketleri ve adları grafiğin içinde kalır, kesilmez.
    grid: {
      left: 16,
      right: 16,
      top: 40,
      bottom: 16,
      outerBoundsMode: 'same',
      ...(options['grid'] as object | undefined),
    },
    tooltip: {
      valueFormatter: (value: unknown) => (typeof value === 'number' ? formatNumber(value, language) : String(value)),
      ...(options['tooltip'] as object | undefined),
    },
  };
}

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
    // Zaman çizelgeli grafiklerde ayarlar baseOption içindedir; ECharts üst seviyedekileri yok sayar.
    const baseOption = options['baseOption'] as EChartsCoreOption | undefined;
    return baseOption ? { ...options, baseOption: withDefaults(baseOption, language) } : withDefaults(options, language);
  });
}
