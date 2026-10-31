import tr from '../../../../../public/i18n/tr.json';
import { ChartCard, ChartContext } from './dashboard.model';
import { financeCharts, waterfallSteps } from './finance.charts';
import { menuCharts } from './menu.charts';
import { operationsCharts } from './operations.charts';
import { overviewCharts, overviewKpis } from './overview.charts';
import { salesCharts } from './sales.charts';
import { DAILY_REVENUE, FLOOR_ZONES, CHANNELS, MENU, MONTHLY_REVENUE, TOTAL_REVENUE } from './restaurant.mock';

const context: ChartContext = { t: (key) => key, language: 'tr' };
const cards: ChartCard[] = [overviewCharts, salesCharts, menuCharts, operationsCharts, financeCharts].flatMap((build) =>
  build(context),
);

/** echarts/charts paketindeki bütün türler: pano her birini en az bir kez göstermeli. */
const ALL_SERIES_TYPES = [
  'bar',
  'boxplot',
  'candlestick',
  'chord',
  'custom',
  'effectScatter',
  'funnel',
  'gauge',
  'graph',
  'heatmap',
  'line',
  'lines',
  'map',
  'parallel',
  'pictorialBar',
  'pie',
  'radar',
  'sankey',
  'scatter',
  'sunburst',
  'themeRiver',
  'tree',
  'treemap',
];

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

describe('restaurant dashboard', () => {
  it('uses every ECharts series type', () => {
    const series = cards.flatMap((card) => card.options['series'] as { type: string }[]);
    expect([...new Set(series.map((item) => item.type))].sort()).toEqual([...ALL_SERIES_TYPES].sort());
  });

  it('has a translation for every title, note and label', () => {
    const missing = new Set<string>();
    const collecting: ChartContext = {
      language: 'tr',
      t: (key) => {
        if (!(key in tr)) {
          missing.add(key);
        }
        return key;
      },
    };
    [overviewCharts, salesCharts, menuCharts, operationsCharts, financeCharts].forEach((build) => build(collecting));
    overviewKpis(context).forEach((kpi) => collecting.t(kpi.label));
    cards.forEach((card) => [card.title, card.note].forEach(collecting.t));
    expect([...missing]).toEqual([]);
  });

  it('keeps the story consistent: every view adds up to the same revenue', () => {
    expect(sum(MONTHLY_REVENUE)).toBe(TOTAL_REVENUE);
    expect(sum(CHANNELS.flatMap((channel) => channel.monthly))).toBe(TOTAL_REVENUE);
    expect(sum(MENU.flatMap((category) => category.children ?? []).map((dish) => dish.value ?? 0))).toBe(TOTAL_REVENUE);
    expect(sum(FLOOR_ZONES.map((zone) => zone.revenue))).toBe(CHANNELS[0].monthly.reduce((a, b) => a + b, 0));
    expect(sum(DAILY_REVENUE.map((day) => day.value))).toBeCloseTo(TOTAL_REVENUE, -1);
  });

  it('waterfall steps down from revenue exactly to net profit', () => {
    const steps = waterfallSteps(context);
    const net = steps[steps.length - 1];
    const lastCost = steps[steps.length - 2];
    expect(lastCost.base).toBe(net.value);
  });
});
