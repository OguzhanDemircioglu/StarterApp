import { formatMonth, formatNumber } from '../../../shared/charts/chart-format';
import { ChartBuilder, Kpi } from './dashboard.model';
import {
  AVERAGE_TICKET,
  CHANNELS,
  FOOD_COST_RATIO,
  LAST_YEAR_REVENUE,
  MONTHLY_REVENUE,
  MONTHLY_TARGET,
  MONTHS,
  NET_PROFIT,
  OCCUPANCY,
  PAYMENT_METHODS,
  REVENUE_GROWTH,
  TOTAL_REVENUE,
} from './restaurant.mock';

const LAST_YEAR_FOOD_COST_RATIO = 36;
const LAST_YEAR_NET_PROFIT = 1980;

export function overviewKpis(): Kpi[] {
  return [
    {
      label: 'dash_kpi_revenue',
      value: `${formatNumber(TOTAL_REVENUE)} bin ₺`,
      delta: REVENUE_GROWTH,
      higherIsBetter: true,
    },
    {
      label: 'dash_kpi_profit',
      value: `${formatNumber(NET_PROFIT)} bin ₺`,
      delta: (NET_PROFIT / LAST_YEAR_NET_PROFIT - 1) * 100,
      higherIsBetter: true,
    },
    {
      label: 'dash_kpi_ticket',
      value: `${formatNumber(AVERAGE_TICKET.current)} ₺`,
      delta: (AVERAGE_TICKET.current / AVERAGE_TICKET.lastYear - 1) * 100,
      higherIsBetter: true,
    },
    {
      label: 'dash_kpi_food_cost',
      value: `%${formatNumber(Math.round(FOOD_COST_RATIO * 10) / 10)}`,
      delta: (FOOD_COST_RATIO / LAST_YEAR_FOOD_COST_RATIO - 1) * 100,
      higherIsBetter: false,
    },
  ];
}

export const overviewCharts: ChartBuilder = ({ t }) => {
  const months = MONTHS.map((month) => formatMonth(month));
  return [
    {
      title: 'dash_revenue_trend_title',
      note: 'dash_revenue_trend_note',
      kind: 'Çizgi',
      wide: true,
      options: {
        tooltip: { trigger: 'axis' },
        legend: {},
        xAxis: { type: 'category', data: months, boundaryGap: false },
        yAxis: { type: 'value' },
        series: [
          {
            type: 'line',
            name: t('dash_series_this_year'),
            data: MONTHLY_REVENUE,
            smooth: true,
            symbolSize: 8,
            lineStyle: { width: 2 },
            markLine: {
              silent: true,
              symbol: 'none',
              data: [{ yAxis: MONTHLY_TARGET, name: t('dash_series_target') }],
              label: { formatter: t('dash_series_target'), position: 'insideEndTop' },
              lineStyle: { color: '#898781' },
            },
          },
          {
            type: 'line',
            name: t('dash_series_last_year'),
            data: LAST_YEAR_REVENUE,
            smooth: true,
            symbolSize: 8,
            lineStyle: { width: 2 },
          },
        ],
      },
    },
    {
      title: 'dash_channel_mix_title',
      note: 'dash_channel_mix_note',
      kind: 'Sütun',
      wide: true,
      options: {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: {},
        xAxis: { type: 'category', data: months },
        yAxis: { type: 'value' },
        series: CHANNELS.map((channel) => ({
          type: 'bar',
          name: channel.name,
          stack: 'revenue',
          barWidth: '48%',
          data: channel.monthly,
          itemStyle: { borderColor: '#fff', borderWidth: 1 },
        })),
      },
    },
    {
      title: 'dash_payments_title',
      note: 'dash_payments_note',
      kind: 'Pasta',
      options: {
        tooltip: { valueFormatter: (value: number) => `%${value}` },
        legend: {},
        series: [
          {
            type: 'pie',
            radius: ['46%', '72%'],
            center: ['50%', '54%'],
            padAngle: 1,
            itemStyle: { borderRadius: 4 },
            label: { formatter: '%{c}' },
            data: PAYMENT_METHODS,
          },
        ],
      },
    },
    {
      title: 'dash_occupancy_title',
      note: 'dash_occupancy_note',
      kind: 'Gösterge',
      options: {
        tooltip: { show: false },
        series: [
          {
            type: 'gauge',
            min: 0,
            max: 100,
            progress: { show: true, width: 14 },
            axisLine: { lineStyle: { width: 14 } },
            axisTick: { show: false },
            splitLine: { length: 8, distance: 4, lineStyle: { color: '#c3c2b7' } },
            axisLabel: { distance: 22, color: '#898781' },
            pointer: { length: '58%', width: 4 },
            anchor: { show: true, size: 12, itemStyle: { borderWidth: 2, borderColor: '#2a78d6' } },
            title: { show: true, offsetCenter: [0, '72%'], fontSize: 13, color: '#52514e' },
            detail: { offsetCenter: [0, '50%'], formatter: '%{value}', fontSize: 28, color: 'inherit' },
            data: [{ value: OCCUPANCY, name: t('dash_occupancy_label') }],
          },
        ],
      },
    },
  ];
};
