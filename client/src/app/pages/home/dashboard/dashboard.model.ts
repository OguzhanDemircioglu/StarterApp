/** Anasayfadaki bir grafik kartı. title ve note metin anahtarıdır; kind grafik türünün ekranda görünen adıdır. */
export interface ChartCard {
  title: string;
  note: string;
  kind: string;
  /** Çizen kütüphane; verilmezse ECharts. */
  library?: string;
  options: Record<string, unknown>;
  height?: string;
  wide?: boolean;
}

/** Grafik ayarları üretilirken metin anahtarlarını çözer. */
export interface ChartContext {
  t: (key: string) => string;
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
