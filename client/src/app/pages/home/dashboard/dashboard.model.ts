import type { EChartsCoreOption } from 'echarts/core';

/** Anasayfadaki bir grafik kartı. title ve note çeviri anahtarıdır; kind grafiğin ECharts türüdür. */
export interface ChartCard {
  title: string;
  note: string;
  kind: string;
  options: EChartsCoreOption;
  height?: string;
  wide?: boolean;
}

/** Grafik ayarları üretilirken gereken dil bilgisi. */
export interface ChartContext {
  t: (key: string) => string;
  language: string;
}

export type ChartBuilder = (context: ChartContext) => ChartCard[];

/** Üst sıradaki özet kutusu. label çeviri anahtarı; delta geçen yıla göre yüzde değişim. */
export interface Kpi {
  label: string;
  value: string;
  delta: number;
  /** Artışın iyi mi kötü mü olduğu: maliyet artışı kötüdür. */
  higherIsBetter: boolean;
}
