import { SEQUENTIAL_COLORS } from '../../../shared/charts/chart-colors';
import { formatDay, formatMonth, formatNumber, formatWeekday } from '../../../shared/charts/chart-format';
import { ChartBuilder } from './dashboard.model';
import {
  BRANCHES,
  COVERS_BY_HOUR,
  CURRENT_MONTH_SHARES,
  DAILY_REVENUE,
  ONLINE_ORDERS_BY_HOUR,
  OPENING_HOURS,
  QUARTERS,
  WEEKLY_CATEGORY_SALES,
} from './restaurant.mock';

const LAST_DAYS = 30;
const WEEK = [0, 1, 2, 3, 4, 5, 6];

export const salesCharts: ChartBuilder = ({ t, language }) => {
  const lastDays = DAILY_REVENUE.slice(-LAST_DAYS);
  const weekdays = WEEK.map((day) => formatWeekday(day, language));
  // Takvim bileşeni günleri Pazar'dan başlayarak ister.
  const calendarDays = [6, 0, 1, 2, 3, 4, 5].map((day) => formatWeekday(day, language));
  const dailyValues = DAILY_REVENUE.map((day) => day.value);

  return [
    {
      title: 'dash_daily_title',
      note: 'dash_daily_note',
      kind: 'line (area)',
      wide: true,
      options: {
        tooltip: { trigger: 'axis' },
        legend: {},
        xAxis: { type: 'category', boundaryGap: false, data: lastDays.map((day) => formatDay(day.day, language)) },
        yAxis: { type: 'value' },
        series: CURRENT_MONTH_SHARES.map((channel) => ({
          type: 'line',
          name: channel.name,
          stack: 'revenue',
          showSymbol: false,
          lineStyle: { width: 1 },
          areaStyle: { opacity: 0.7 },
          data: lastDays.map((day) => Math.round(day.value * channel.share * 10) / 10),
        })),
      },
    },
    {
      title: 'dash_calendar_title',
      note: 'dash_calendar_note',
      kind: 'heatmap (calendar)',
      wide: true,
      height: '230px',
      options: {
        tooltip: {
          formatter: ({ value }: { value: [string, number] }) =>
            `${formatDay(value[0], language)}: ${formatNumber(value[1], language)} bin ₺`,
        },
        visualMap: {
          min: Math.min(...dailyValues),
          max: Math.max(...dailyValues),
          orient: 'horizontal',
          right: 16,
          top: 0,
          itemHeight: 120,
          itemWidth: 12,
          inRange: { color: SEQUENTIAL_COLORS },
        },
        calendar: {
          range: [DAILY_REVENUE[0].day, DAILY_REVENUE[DAILY_REVENUE.length - 1].day],
          top: 56,
          left: 40,
          right: 16,
          bottom: 8,
          cellSize: ['auto', 18],
          itemStyle: { borderColor: '#fff', borderWidth: 2 },
          splitLine: { show: false },
          yearLabel: { show: false },
          dayLabel: { firstDay: 1, nameMap: calendarDays, color: '#898781' },
          monthLabel: {
            nameMap: Array.from({ length: 12 }, (_, month) =>
              formatMonth(`2026-${String(month + 1).padStart(2, '0')}`, language),
            ),
            color: '#898781',
          },
        },
        series: [
          {
            type: 'heatmap',
            coordinateSystem: 'calendar',
            data: DAILY_REVENUE.map((day) => [day.day, day.value]),
          },
        ],
      },
    },
    {
      title: 'dash_peak_hours_title',
      note: 'dash_peak_hours_note',
      kind: 'heatmap',
      options: {
        grid: { top: 16, bottom: 56 },
        tooltip: {
          formatter: ({ value }: { value: [number, number, number] }) =>
            `${weekdays[value[1]]} ${OPENING_HOURS[value[0]]}:00: ${value[2]} ${t('dash_unit_covers')}`,
        },
        xAxis: { type: 'category', data: OPENING_HOURS.map((hour) => `${hour}:00`), splitArea: { show: false } },
        yAxis: { type: 'category', data: weekdays, inverse: true, splitArea: { show: false } },
        visualMap: {
          min: 0,
          max: Math.max(...COVERS_BY_HOUR.map((cell) => cell[2])),
          orient: 'horizontal',
          left: 'center',
          bottom: 0,
          itemHeight: 140,
          itemWidth: 12,
          inRange: { color: SEQUENTIAL_COLORS },
        },
        series: [
          {
            type: 'heatmap',
            data: COVERS_BY_HOUR,
            itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 2 },
          },
        ],
      },
    },
    {
      title: 'dash_hourly_title',
      note: 'dash_hourly_note',
      kind: 'bar (polar)',
      options: {
        tooltip: {},
        polar: { radius: ['14%', '82%'] },
        angleAxis: {
          type: 'category',
          data: ONLINE_ORDERS_BY_HOUR.map((_, hour) => `${hour}:00`),
          startAngle: 90,
          axisLabel: { interval: 2, color: '#898781' },
        },
        radiusAxis: { axisLabel: { show: false }, axisLine: { show: false }, axisTick: { show: false } },
        series: [
          {
            type: 'bar',
            name: t('dash_series_orders'),
            coordinateSystem: 'polar',
            data: ONLINE_ORDERS_BY_HOUR,
            itemStyle: { borderRadius: 2 },
          },
        ],
      },
    },
    {
      title: 'dash_river_title',
      note: 'dash_river_note',
      kind: 'themeRiver',
      options: {
        tooltip: { trigger: 'axis', axisPointer: { type: 'line' } },
        legend: {},
        singleAxis: { type: 'time', top: 40, bottom: 32, left: 24, right: 24 },
        series: [{ type: 'themeRiver', data: WEEKLY_CATEGORY_SALES, label: { show: false } }],
      },
    },
    {
      title: 'dash_branches_title',
      note: 'dash_branches_note',
      kind: 'bar (grouped)',
      options: {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: {},
        xAxis: { type: 'category', data: QUARTERS.map((quarter) => quarter.name) },
        yAxis: { type: 'value' },
        series: BRANCHES.map((branch) => ({
          type: 'bar',
          name: branch.name,
          barGap: '10%',
          itemStyle: { borderRadius: [4, 4, 0, 0] },
          data: QUARTERS.map((quarter) => Math.round(quarter.revenue * branch.share)),
        })),
      },
    },
  ];
};
