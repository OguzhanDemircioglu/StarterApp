import { CHART_COLORS, NEGATIVE_COLOR, NEUTRAL_COLOR, POSITIVE_COLOR } from '../../../shared/charts/chart-colors';
import { formatDay, formatMonth, formatNumber } from '../../../shared/charts/chart-format';
import { ChartBuilder, ChartContext } from './dashboard.model';
import {
  CASH_BALANCE,
  CASH_MONTHS,
  CHANNELS,
  EXPENSES,
  expenseTotal,
  LAMB_PRICES,
  NET_PROFIT,
  TAX,
  TOTAL_REVENUE,
} from './restaurant.mock';

interface WaterfallStep {
  name: string;
  value: number;
  base: number;
  color: string;
}

/** Şelale: ciro tam bar, her gider öncekinin bittiği yerden aşağı iner, net kâr tam bar. */
export function waterfallSteps({ t }: ChartContext): WaterfallStep[] {
  const costs = [
    ...EXPENSES.map((group) => ({ name: group.name, value: expenseTotal(group) })),
    { name: t('dash_finance_tax'), value: TAX },
  ];
  let remaining = TOTAL_REVENUE;
  const steps = costs.map(({ name, value }) => {
    remaining -= value;
    return { name, value, base: remaining, color: NEGATIVE_COLOR };
  });
  return [
    { name: t('dash_finance_revenue'), value: TOTAL_REVENUE, base: 0, color: POSITIVE_COLOR },
    ...steps,
    { name: t('dash_finance_net'), value: NET_PROFIT, base: 0, color: CHART_COLORS[2] },
  ];
}

export const financeCharts: ChartBuilder = (context) => {
  const { t } = context;
  const steps = waterfallSteps(context);
  const revenue = t('dash_finance_revenue');
  const tax = t('dash_finance_tax');
  const net = t('dash_finance_net');
  const budgetItems = EXPENSES.flatMap((group) => group.children)
    .map((item) => ({ name: item.name, value: item.budget - item.value }))
    .sort((a, b) => a.value - b.value);
  const actualMonths = CASH_BALANCE.actual.length;

  return [
    {
      title: 'dash_flow_title',
      note: 'dash_flow_note',
      kind: 'Sankey akışı',
      wide: true,
      height: '400px',
      options: {
        tooltip: {},
        series: [
          {
            type: 'sankey',
            top: 8,
            bottom: 8,
            left: 8,
            right: 96,
            nodeWidth: 14,
            nodeGap: 12,
            emphasis: { focus: 'adjacency' },
            lineStyle: { color: 'source', opacity: 0.25, curveness: 0.5 },
            data: [
              ...CHANNELS.map(({ name }) => ({ name, itemStyle: { color: CHART_COLORS[0] } })),
              { name: revenue, itemStyle: { color: NEUTRAL_COLOR } },
              ...EXPENSES.map(({ name }) => ({ name, itemStyle: { color: CHART_COLORS[1] } })),
              ...EXPENSES.flatMap(({ children }) =>
                children.map(({ name }) => ({ name, itemStyle: { color: CHART_COLORS[1] } })),
              ),
              { name: tax, itemStyle: { color: NEUTRAL_COLOR } },
              { name: net, itemStyle: { color: CHART_COLORS[2] } },
            ],
            links: [
              ...CHANNELS.map(({ name, monthly }) => ({
                source: name,
                target: revenue,
                value: monthly.reduce((total, value) => total + value, 0),
              })),
              ...EXPENSES.map((group) => ({ source: revenue, target: group.name, value: expenseTotal(group) })),
              ...EXPENSES.flatMap((group) =>
                group.children.map(({ name, value }) => ({ source: group.name, target: name, value })),
              ),
              { source: revenue, target: tax, value: TAX },
              { source: revenue, target: net, value: NET_PROFIT },
            ],
          },
        ],
      },
    },
    {
      title: 'dash_waterfall_title',
      note: 'dash_waterfall_note',
      kind: 'Şelale',
      options: {
        tooltip: { trigger: 'item' },
        xAxis: { type: 'category', data: steps.map((step) => step.name), axisLabel: { interval: 0 } },
        yAxis: { type: 'value' },
        series: [
          {
            type: 'bar',
            stack: 'waterfall',
            silent: true,
            tooltip: { show: false },
            itemStyle: { color: 'transparent' },
            data: steps.map((step) => step.base),
          },
          {
            type: 'bar',
            stack: 'waterfall',
            barWidth: '56%',
            name: t('dash_series_amount'),
            label: {
              show: true,
              position: 'top',
              color: '#52514e',
              formatter: ({ value }: { value: number }) => formatNumber(value),
            },
            data: steps.map((step) => ({
              value: step.value,
              itemStyle: { color: step.color, borderRadius: [4, 4, 0, 0] },
            })),
          },
        ],
      },
    },
    {
      title: 'dash_expenses_title',
      note: 'dash_expenses_note',
      kind: 'Güneş patlaması',
      options: {
        tooltip: {},
        series: [
          {
            type: 'sunburst',
            radius: ['12%', '94%'],
            nodeClick: false,
            data: EXPENSES.map((group) => ({
              name: group.name,
              children: group.children.map(({ name, value }) => ({ name, value })),
            })),
            itemStyle: { borderColor: '#fff', borderWidth: 2 },
            label: { minAngle: 10, color: '#fff' },
            levels: [{}, { r0: '12%', r: '46%' }, { r0: '46%', r: '94%', label: { align: 'right' } }],
            emphasis: { focus: 'ancestor' },
          },
        ],
      },
    },
    {
      title: 'dash_budget_title',
      note: 'dash_budget_note',
      kind: 'Sapma sütunu',
      height: '340px',
      options: {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: { type: 'value' },
        yAxis: {
          type: 'category',
          data: budgetItems.map((item) => item.name),
          axisLine: { onZero: true },
          axisLabel: { show: false },
          axisTick: { show: false },
        },
        series: [
          {
            type: 'bar',
            name: t('dash_series_budget_gap'),
            barWidth: '60%',
            label: { show: true, formatter: '{b}', position: 'right', color: '#52514e' },
            labelLayout: { hideOverlap: false },
            data: budgetItems.map((item) => ({
              value: item.value,
              label: { position: item.value < 0 ? 'left' : 'right' },
              itemStyle: {
                color: item.value < 0 ? NEGATIVE_COLOR : POSITIVE_COLOR,
                borderRadius: item.value < 0 ? [4, 0, 0, 4] : [0, 4, 4, 0],
              },
            })),
          },
        ],
      },
    },
    {
      title: 'dash_cash_title',
      note: 'dash_cash_note',
      kind: 'Tahmin çizgisi',
      height: '340px',
      options: {
        tooltip: { trigger: 'axis' },
        legend: {},
        xAxis: { type: 'category', data: CASH_MONTHS.map((month) => formatMonth(month)), boundaryGap: false },
        yAxis: { type: 'value' },
        series: [
          {
            type: 'line',
            name: t('dash_series_actual'),
            data: CASH_BALANCE.actual,
            symbolSize: 8,
            lineStyle: { width: 2 },
            areaStyle: { opacity: 0.1 },
          },
          {
            type: 'line',
            name: t('dash_series_forecast'),
            data: [...Array(actualMonths - 1).fill(null), ...CASH_BALANCE.forecast],
            symbolSize: 8,
            lineStyle: { width: 2, type: 'dashed' },
          },
        ],
      },
    },
    {
      title: 'dash_lamb_title',
      note: 'dash_lamb_note',
      kind: 'Mum grafiği',
      wide: true,
      height: '360px',
      options: {
        grid: { top: 16, bottom: 56 },
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        xAxis: { type: 'category', data: LAMB_PRICES.map((row) => formatDay(row[0])) },
        yAxis: { type: 'value', scale: true },
        dataZoom: [{ type: 'inside' }, { type: 'slider', bottom: 8, height: 20 }],
        series: [
          {
            type: 'candlestick',
            name: t('dash_series_lamb'),
            data: LAMB_PRICES.map((row) => row.slice(1)),
            itemStyle: {
              color: NEGATIVE_COLOR,
              color0: POSITIVE_COLOR,
              borderColor: NEGATIVE_COLOR,
              borderColor0: POSITIVE_COLOR,
            },
          },
        ],
      },
    },
  ];
};
