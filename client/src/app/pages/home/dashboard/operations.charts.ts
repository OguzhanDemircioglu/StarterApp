import type { CustomSeriesRenderItem } from 'echarts';
import { CHART_COLORS, ORDINAL_COLORS, SEQUENTIAL_COLORS } from '../../../shared/charts/chart-colors';
import { formatNumber } from '../../../shared/charts/chart-format';
import { echarts } from '../../../shared/charts/echarts-setup';
import { ChartBuilder } from './dashboard.model';
import {
  BRANCHES,
  FLOOR_ZONES,
  ONLINE_FUNNEL,
  ORGANIZATION,
  PREP_TIMES,
  RECIPES,
  SERVICE_ROUTES,
  SHIFT_TEAMS,
  SHIFTS,
} from './restaurant.mock';

const FLOOR_MAP = 'floor-plan';
const SHIFT_NAMES = ['Sabah', 'Akşam'];
/** Bölge rengi açıktan koyuya değiştiği için etiket kendi zemininde durur. */
const ZONE_LABEL = {
  show: true,
  color: '#0b0b0b',
  fontWeight: 600,
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  padding: [2, 6],
  borderRadius: 4,
};

/** Harita türü coğrafya şart koşmaz: lokantanın kat planı küçük bir GeoJSON olarak çizilir. */
echarts.registerMap(FLOOR_MAP, {
  type: 'FeatureCollection',
  features: FLOOR_ZONES.map(({ name, x, y }) => ({
    type: 'Feature',
    properties: { name },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [x[0], y[0]],
          [x[1], y[0]],
          [x[1], y[1]],
          [x[0], y[1]],
          [x[0], y[0]],
        ],
      ],
    },
  })),
} as never);

const renderShift: CustomSeriesRenderItem = (_params, api) => {
  const start = api.coord([api.value(1), api.value(0)]);
  const end = api.coord([api.value(2), api.value(0)]);
  const height = (api.size?.([0, 1]) as number[])[1] * 0.56;
  return {
    type: 'rect',
    shape: { x: start[0], y: start[1] - height / 2, width: end[0] - start[0] - 2, height, r: 4 },
    style: { fill: CHART_COLORS[api.value(4) as number] },
  };
};

export const operationsCharts: ChartBuilder = ({ t, language }) => {
  const dishes = RECIPES.map((recipe) => recipe.dish);
  const ingredients = [...new Set(RECIPES.flatMap((recipe) => recipe.ingredients))];

  return [
    {
      title: 'dash_floor_title',
      note: 'dash_floor_note',
      kind: 'map + lines',
      height: '360px',
      options: {
        tooltip: {},
        visualMap: {
          seriesIndex: 0,
          min: 0,
          max: 8000,
          orient: 'horizontal',
          left: 'center',
          bottom: 0,
          itemHeight: 140,
          itemWidth: 12,
          inRange: { color: SEQUENTIAL_COLORS },
        },
        geo: {
          map: FLOOR_MAP,
          roam: false,
          aspectScale: 1,
          top: 8,
          bottom: 48,
          label: ZONE_LABEL,
          itemStyle: { borderColor: '#fff', borderWidth: 3, areaColor: '#f0efec' },
          emphasis: { label: ZONE_LABEL, itemStyle: { areaColor: '#f0efec' } },
          select: { disabled: true },
        },
        series: [
          {
            type: 'map',
            geoIndex: 0,
            name: t('dash_series_revenue'),
            data: FLOOR_ZONES.filter((zone) => zone.revenue > 0).map((zone) => ({ name: zone.name, value: zone.revenue })),
          },
          {
            type: 'lines',
            coordinateSystem: 'geo',
            name: t('dash_series_plates'),
            data: SERVICE_ROUTES.map((route) => ({ coords: [route.from, route.to], value: route.plates })),
            lineStyle: { color: '#eb6834', width: 2, curveness: 0.2, opacity: 0.8 },
            effect: { show: true, period: 4, symbolSize: 6, trailLength: 0, color: '#eb6834' },
            tooltip: { show: false },
          },
        ],
      },
    },
    {
      title: 'dash_prep_title',
      note: 'dash_prep_note',
      kind: 'boxplot',
      height: '360px',
      options: {
        tooltip: {
          formatter: ({ name, value }: { name: string; value: number[] }) =>
            `${name}<br>${t('dash_prep_median')}: ${value[3]} ${t('dash_unit_minutes')}<br>` +
            `${t('dash_prep_range')}: ${value[1]} - ${value[5]} ${t('dash_unit_minutes')}`,
        },
        xAxis: { type: 'category', data: PREP_TIMES.map((row) => row.name) },
        yAxis: { type: 'value', name: t('dash_unit_minutes') },
        series: [
          {
            type: 'boxplot',
            data: PREP_TIMES.map((row) => row.box),
            boxWidth: [24, 48],
            itemStyle: { color: '#cde2fb', borderColor: '#2a78d6', borderWidth: 2 },
          },
        ],
      },
    },
    {
      title: 'dash_shifts_title',
      note: 'dash_shifts_note',
      kind: 'custom',
      wide: true,
      height: '280px',
      options: {
        tooltip: {
          formatter: ({ value }: { value: [number, number, number, string] }) =>
            `${SHIFT_TEAMS[value[0]]} · ${value[3]}<br>${value[1]}:00 - ${value[2]}:00`,
        },
        xAxis: { type: 'value', min: 8, max: 24, interval: 2, axisLabel: { formatter: '{value}:00' } },
        yAxis: { type: 'category', data: SHIFT_TEAMS },
        series: [
          {
            type: 'custom',
            renderItem: renderShift,
            encode: { x: [1, 2], y: 0 },
            data: SHIFTS.map((shift) => [
              SHIFT_TEAMS.indexOf(shift.team),
              shift.start,
              shift.end,
              shift.shift,
              SHIFT_NAMES.indexOf(shift.shift),
            ]),
          },
        ],
      },
    },
    {
      title: 'dash_funnel_title',
      note: 'dash_funnel_note',
      kind: 'funnel',
      options: {
        tooltip: {},
        color: ORDINAL_COLORS,
        series: [
          {
            type: 'funnel',
            name: t('dash_series_orders'),
            top: 16,
            bottom: 16,
            left: '4%',
            width: '58%',
            gap: 2,
            sort: 'none',
            label: {
              position: 'right',
              color: '#52514e',
              formatter: ({ name, value }: { name: string; value: number }) => `${name}: ${formatNumber(value, language)}`,
            },
            data: ONLINE_FUNNEL,
          },
        ],
      },
    },
    {
      title: 'dash_scores_title',
      note: 'dash_scores_note',
      kind: 'radar',
      options: {
        tooltip: {},
        legend: {},
        radar: {
          radius: '64%',
          center: ['50%', '56%'],
          indicator: ['dash_score_taste', 'dash_score_service', 'dash_score_speed', 'dash_score_hygiene', 'dash_score_price'].map(
            (key) => ({ name: t(key), min: 50, max: 100 }),
          ),
        },
        series: [
          {
            type: 'radar',
            areaStyle: { opacity: 0.12 },
            lineStyle: { width: 2 },
            data: BRANCHES.map((branch) => ({ name: branch.name, value: branch.scores })),
          },
        ],
      },
    },
    {
      title: 'dash_org_title',
      note: 'dash_org_note',
      kind: 'tree',
      height: '380px',
      options: {
        tooltip: { show: false },
        series: [
          {
            type: 'tree',
            data: [ORGANIZATION],
            top: 16,
            bottom: 16,
            left: 88,
            right: 112,
            symbolSize: 10,
            initialTreeDepth: -1,
            expandAndCollapse: false,
            lineStyle: { color: '#c3c2b7', width: 1.5 },
            label: { position: 'left', verticalAlign: 'middle', align: 'right' },
            leaves: { label: { position: 'right', align: 'left' } },
          },
        ],
      },
    },
    {
      title: 'dash_recipes_title',
      note: 'dash_recipes_note',
      kind: 'graph',
      height: '380px',
      options: {
        tooltip: { show: false },
        legend: {},
        series: [
          {
            type: 'graph',
            layout: 'circular',
            circular: { rotateLabel: true },
            categories: [{ name: t('dash_series_dishes') }, { name: t('dash_series_ingredients') }],
            label: { show: true, position: 'right', color: '#52514e' },
            lineStyle: { color: '#c3c2b7', width: 1.5, curveness: 0.3 },
            emphasis: { focus: 'adjacency' },
            top: 88,
            bottom: 64,
            left: 96,
            right: 96,
            data: [
              ...dishes.map((name) => ({ name, category: 0, symbolSize: 18 })),
              ...ingredients.map((name) => ({ name, category: 1, symbolSize: 10 })),
            ],
            links: RECIPES.flatMap((recipe) =>
              recipe.ingredients.map((target) => ({ source: recipe.dish, target })),
            ),
          },
        ],
      },
    },
  ];
};
