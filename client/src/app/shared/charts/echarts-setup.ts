import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { DatasetComponent, GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

/**
 * ECharts'ın sadece kullanılan parçaları pakete girer (tree-shaking).
 * Yeni bir grafik türü (ör. HeatmapChart) ya da bileşen gerekirse buraya eklenir.
 */
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  CanvasRenderer,
]);

export { echarts };
