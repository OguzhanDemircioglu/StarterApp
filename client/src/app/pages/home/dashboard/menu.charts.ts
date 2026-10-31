import { CHART_COLORS } from '../../../shared/charts/chart-colors';
import { formatNumber, formatWeekday } from '../../../shared/charts/chart-format';
import { ChartBuilder } from './dashboard.model';
import { BASKET_LINKS, DISH_PERFORMANCE, DISH_PROFILES, MENU, TEA_SALES } from './restaurant.mock';

const TOP_DISHES = 10;
const TEA_GLASS = 'path://M3 0h18l-3 24H6z';
const SOLD_THRESHOLD = 2000;
const MARGIN_THRESHOLD = 55;

export const menuCharts: ChartBuilder = ({ t, language }) => {
  const dishes = MENU.flatMap((category) => category.children ?? []);
  const topDishes = [...dishes].sort((a, b) => (a.value ?? 0) - (b.value ?? 0)).slice(-TOP_DISHES);
  const toPoint = (dish: (typeof DISH_PERFORMANCE)[number]) => ({ name: dish.name, value: [dish.sold, dish.margin] });

  return [
    {
      title: 'dash_menu_tree_title',
      note: 'dash_menu_tree_note',
      kind: 'treemap',
      wide: true,
      height: '380px',
      options: {
        tooltip: {},
        series: [
          {
            type: 'treemap',
            name: t('dash_series_revenue'),
            data: MENU,
            top: 8,
            left: 8,
            right: 8,
            bottom: 8,
            roam: false,
            nodeClick: false,
            breadcrumb: { show: false },
            upperLabel: { show: true, height: 26, color: '#fff', fontWeight: 600 },
            label: {
              formatter: ({ name, value }: { name: string; value: number }) => `${name}\n${formatNumber(value, language)}`,
            },
            levels: [
              { itemStyle: { borderWidth: 0, gapWidth: 4 } },
              { itemStyle: { borderWidth: 4, gapWidth: 2, borderColorSaturation: 0.5 } },
              { colorSaturation: [0.45, 0.7], itemStyle: { gapWidth: 2, borderColorSaturation: 0.6 } },
            ],
          },
        ],
      },
    },
    {
      title: 'dash_top_dishes_title',
      note: 'dash_top_dishes_note',
      kind: 'bar (horizontal)',
      height: '360px',
      options: {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: topDishes.map((dish) => dish.name) },
        series: [
          {
            type: 'bar',
            name: t('dash_series_revenue'),
            data: topDishes.map((dish) => dish.value),
            barWidth: '56%',
            itemStyle: { borderRadius: [0, 4, 4, 0] },
            label: {
              show: true,
              position: 'right',
              color: '#52514e',
              formatter: ({ value }: { value: number }) => formatNumber(value, language),
            },
          },
        ],
      },
    },
    {
      title: 'dash_engineering_title',
      note: 'dash_engineering_note',
      kind: 'scatter + effectScatter',
      height: '360px',
      options: {
        grid: { right: 32 },
        tooltip: {
          formatter: ({ name, value }: { name: string; value: [number, number] }) =>
            `${name}<br>${value[0]} ${t('dash_unit_portions')} · %${value[1]}`,
        },
        legend: {},
        xAxis: { type: 'value', name: t('dash_axis_sold'), nameLocation: 'middle', nameGap: 28, min: 0 },
        yAxis: { type: 'value', name: t('dash_axis_margin'), min: 30, max: 90 },
        series: [
          {
            type: 'scatter',
            name: t('dash_series_dishes'),
            symbolSize: 12,
            itemStyle: { borderColor: '#fff', borderWidth: 2 },
            data: DISH_PERFORMANCE.filter((dish) => !dish.star).map(toPoint),
            markLine: {
              silent: true,
              symbol: 'none',
              label: { show: false },
              lineStyle: { color: '#c3c2b7' },
              data: [{ xAxis: SOLD_THRESHOLD }, { yAxis: MARGIN_THRESHOLD }],
            },
          },
          {
            type: 'effectScatter',
            name: t('dash_series_stars'),
            symbolSize: 14,
            rippleEffect: { scale: 2.6 },
            label: { show: true, position: 'top', formatter: '{b}', color: '#52514e' },
            data: DISH_PERFORMANCE.filter((dish) => dish.star).map(toPoint),
          },
        ],
      },
    },
    {
      title: 'dash_profile_title',
      note: 'dash_profile_note',
      kind: 'parallel',
      options: {
        tooltip: { show: false },
        legend: {},
        parallel: { left: 40, right: 56, top: 64, bottom: 24 },
        parallelAxis: [
          { dim: 0, name: t('dash_axis_price') },
          { dim: 1, name: t('dash_axis_cost') },
          { dim: 2, name: t('dash_axis_prep') },
          { dim: 3, name: t('dash_axis_rating'), min: 4, max: 5 },
          { dim: 4, name: t('dash_axis_sold') },
        ],
        series: DISH_PROFILES.map((dish) => ({
          type: 'parallel',
          name: dish.name,
          data: [dish.values],
          lineStyle: { width: 2, opacity: 0.9 },
        })),
      },
    },
    {
      title: 'dash_basket_title',
      note: 'dash_basket_note',
      kind: 'chord',
      options: {
        tooltip: {},
        series: [
          {
            type: 'chord',
            data: MENU.map((category, index) => ({ name: category.name, itemStyle: { color: CHART_COLORS[index] } })),
            links: BASKET_LINKS,
            clockwise: false,
            padAngle: 3,
            minAngle: 12,
            label: { show: true },
            lineStyle: { color: 'target', opacity: 0.35 },
            emphasis: { focus: 'adjacency' },
          },
        ],
      },
    },
    {
      title: 'dash_tea_title',
      note: 'dash_tea_note',
      kind: 'pictorialBar',
      options: {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: {
          type: 'category',
          data: TEA_SALES.map((_, day) => formatWeekday(day, language)),
          axisTick: { show: false },
        },
        yAxis: { type: 'value', splitLine: { show: false } },
        series: [
          {
            type: 'pictorialBar',
            name: t('dash_series_tea'),
            symbol: TEA_GLASS,
            symbolRepeat: true,
            symbolClip: true,
            symbolBoundingData: Math.max(...TEA_SALES),
            symbolSize: [18, 22],
            symbolMargin: 2,
            data: TEA_SALES,
          },
        ],
      },
    },
  ];
};
