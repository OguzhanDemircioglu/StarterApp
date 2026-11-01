import type { CustomSeriesRenderItem } from 'echarts';
import { CHART_COLORS, SEQUENTIAL_COLORS } from '../../../shared/charts/chart-colors';
import { formatNumber } from '../../../shared/charts/chart-format';
import { ChartBuilder, ChartCard } from './dashboard.model';
import { TURKEY_MAP } from './gallery.charts';
import { DELIVERY_ROUTES, MASS_ROUTES, ROUTE_HUB } from './restaurant.mock';

const ORANGE = CHART_COLORS[1];
const BLUE = CHART_COLORS[0];
/** Kuyruklu efekt önceki kareleri silmediği için harita çizilmesin diye ayrı katmanda durur. */
const TRAIL_LAYER = 1;
const VEHICLE = 'path://M2 0h6v4h2l2 3v5H0V7l2-3z';
const REVEAL_MS = 5000;
const REVEAL_STAGGER = 0.07;
const REVEAL_CURVE_LENGTH = 1.1;
const LINE = { color: ORANGE, width: 1.5, opacity: 0.8 };

const GEO = {
  map: TURKEY_MAP,
  roam: true,
  top: 8,
  bottom: 8,
  left: 8,
  right: 8,
  silent: true,
  itemStyle: { areaColor: '#f0efec', borderColor: '#fff', borderWidth: 0.5 },
};

const HUB_POINT = {
  type: 'scatter',
  coordinateSystem: 'geo',
  symbolSize: 9,
  itemStyle: { color: BLUE, borderColor: '#fff', borderWidth: 1 },
  data: [{ name: ROUTE_HUB.name, value: ROUTE_HUB.position }],
  tooltip: { show: false },
};

const toCity = DELIVERY_ROUTES.map((route) => ({ coords: [ROUTE_HUB.position, route.position], value: route.tons }));
const fromCity = DELIVERY_ROUTES.map((route) => ({ coords: [route.position, ROUTE_HUB.position], value: route.tons }));
const maxTons = Math.max(...DELIVERY_ROUTES.map((route) => route.tons));

/** Kesik çizgi hile: boşluk çizgi boyu kadardır, kaydırıldıkça çizgi uçtan uca belirir. */
const renderReveal: CustomSeriesRenderItem = (params, api) => {
  const [x1, y1] = api.coord(ROUTE_HUB.position);
  const [x2, y2] = api.coord([api.value(0) as number, api.value(1) as number]);
  const length = Math.hypot(x2 - x1, y2 - y1) * REVEAL_CURVE_LENGTH;
  const start = ((params.dataIndex as number) * REVEAL_STAGGER) % 0.4;
  return {
    type: 'bezierCurve',
    shape: {
      x1,
      y1,
      x2,
      y2,
      cpx1: (x1 + x2) / 2 + (y2 - y1) * 0.2,
      cpy1: (y1 + y2) / 2 - (x2 - x1) * 0.2,
    },
    style: { fill: 'none', stroke: ORANGE, lineWidth: 2, lineDash: [length, length], lineDashOffset: length },
    keyframeAnimation: {
      duration: REVEAL_MS,
      loop: true,
      keyframes: [
        { percent: start, style: { lineDashOffset: length } },
        { percent: Math.min(start + 0.45, 0.95), style: { lineDashOffset: 0 } },
        { percent: 1, style: { lineDashOffset: 0 } },
      ],
    },
  } as never;
};

function lines(options: Record<string, unknown>): Record<string, unknown> {
  return { type: 'lines', coordinateSystem: 'geo', data: toCity, lineStyle: LINE, tooltip: { show: false }, ...options };
}

function card(id: string, kind: string, series: unknown[], extra: Record<string, unknown> = {}): ChartCard {
  return {
    title: `dash_route_${id}_title`,
    note: `dash_route_${id}_note`,
    kind,
    options: { geo: GEO, tooltip: { show: false }, series: [...series, HUB_POINT], ...extra },
  };
}

export const routeCharts: ChartBuilder = ({ t }) => [
  card('straight', 'Düz çizgi', [lines({})]),
  card('curve', 'Eğri', [lines({ lineStyle: { ...LINE, curveness: 0.3 } })]),
  card('arrow', 'Ok uçlu', [lines({ symbol: ['none', 'arrow'], symbolSize: 9, lineStyle: { ...LINE, curveness: 0.2 } })]),
  card('dashed', 'Kesikli', [lines({ lineStyle: { ...LINE, type: 'dashed', curveness: 0.2 } })]),
  card('dots', 'Akan nokta', [
    lines({
      lineStyle: { ...LINE, curveness: 0.2, opacity: 0.3 },
      effect: { show: true, period: 4, symbolSize: 6, trailLength: 0, color: ORANGE },
    }),
  ]),
  card('trail', 'Kuyruklu ışık', [
    lines({
      zlevel: TRAIL_LAYER,
      lineStyle: { ...LINE, curveness: 0.2, opacity: 0.1 },
      effect: { show: true, period: 5, symbolSize: 4, trailLength: 0.6, color: ORANGE },
    }),
  ]),
  card('vehicle', 'Hareketli araç', [
    lines({
      lineStyle: { ...LINE, curveness: 0.2, opacity: 0.35 },
      effect: { show: true, period: 7, symbol: VEHICLE, symbolSize: 15, trailLength: 0, color: BLUE },
    }),
  ]),
  card('speed', 'Sabit hız', [
    lines({
      lineStyle: { ...LINE, curveness: 0.2, opacity: 0.3 },
      effect: { show: true, constantSpeed: 40, symbolSize: 6, trailLength: 0, color: ORANGE },
    }),
  ]),
  card('width', 'Hacme göre kalınlık', [
    lines({
      data: toCity.map((route) => ({
        ...route,
        lineStyle: { ...LINE, curveness: 0.2, width: 1 + (route.value / maxTons) * 8 },
      })),
    }),
  ]),
  card(
    'color',
    'Hacme göre renk',
    [lines({ lineStyle: { width: 3, curveness: 0.2, opacity: 0.9 }, tooltip: { show: false } })],
    {
      visualMap: {
        seriesIndex: 0,
        min: 0,
        max: maxTons,
        orient: 'horizontal',
        left: 16,
        bottom: 0,
        itemHeight: 120,
        itemWidth: 10,
        inRange: { color: SEQUENTIAL_COLORS.slice(1) },
      },
    },
  ),
  card('both', 'Çift yönlü', [
    lines({ name: t('dash_route_outbound'), lineStyle: { ...LINE, curveness: 0.25 } }),
    lines({ name: t('dash_route_inbound'), data: fromCity, lineStyle: { ...LINE, color: BLUE, curveness: 0.25 } }),
  ], { legend: {} }),
  card('stops', 'Çok duraklı', [
    lines({
      polyline: true,
      data: [{ coords: [ROUTE_HUB.position, ...DELIVERY_ROUTES.map((route) => route.position)] }],
      lineStyle: { ...LINE, width: 2 },
      effect: { show: true, constantSpeed: 50, symbolSize: 7, trailLength: 0, color: BLUE },
    }),
    {
      type: 'scatter',
      coordinateSystem: 'geo',
      symbolSize: 7,
      itemStyle: { color: ORANGE },
      data: DELIVERY_ROUTES.map((route) => route.position),
      tooltip: { show: false },
    },
  ]),
  card('label', 'Etiketli', [
    lines({
      lineStyle: { ...LINE, curveness: 0.2 },
      label: {
        show: true,
        position: 'middle',
        fontSize: 11,
        color: '#52514e',
        formatter: ({ value }: { value: number }) => `${formatNumber(value)} ton`,
      },
    }),
  ]),
  card('ends', 'Dalgalı uç noktalar', [
    lines({ lineStyle: { ...LINE, curveness: 0.2, opacity: 0.4 } }),
    {
      type: 'effectScatter',
      coordinateSystem: 'geo',
      symbolSize: 8,
      rippleEffect: { scale: 3.4 },
      itemStyle: { color: ORANGE },
      data: DELIVERY_ROUTES.map((route) => ({ name: route.name, value: route.position })),
      tooltip: { show: false },
    },
  ]),
  card('gradient', 'Renk geçişli', [
    lines({
      data: DELIVERY_ROUTES.map((route) => {
        const [x1, y1] = ROUTE_HUB.position;
        const [x2, y2] = route.position;
        return {
          coords: [ROUTE_HUB.position, route.position],
          lineStyle: {
            width: 3,
            curveness: 0.2,
            opacity: 0.9,
            color: {
              type: 'linear',
              x: x1 < x2 ? 0 : 1,
              y: y1 > y2 ? 0 : 1,
              x2: x1 < x2 ? 1 : 0,
              y2: y1 > y2 ? 1 : 0,
              colorStops: [
                { offset: 0, color: BLUE },
                { offset: 1, color: ORANGE },
              ],
            },
          },
        };
      }),
    }),
  ]),
  card('reveal', 'Çizilerek beliren', [
    {
      type: 'custom',
      coordinateSystem: 'geo',
      renderItem: renderReveal,
      silent: true,
      data: DELIVERY_ROUTES.map((route) => [...route.position, route.tons]),
    },
  ]),
  card('mass', 'Binlerce hat', [
    lines({
      large: true,
      largeThreshold: 100,
      data: MASS_ROUTES.map((coords) => ({ coords })),
      lineStyle: { color: ORANGE, width: 0.4, opacity: 0.12 },
    }),
  ]),
  card('pies', 'Harita üstünde pasta', [
    lines({ lineStyle: { ...LINE, opacity: 0.25 } }),
    ...DELIVERY_ROUTES.map((route) => ({
      type: 'pie',
      coordinateSystem: 'geo',
      center: route.position,
      radius: 6 + route.tons / 7,
      label: { show: false },
      tooltip: { show: false },
      data: [
        { name: t('dash_route_food'), value: route.tons * 0.6, itemStyle: { color: BLUE } },
        { name: t('dash_route_drink'), value: route.tons * 0.25, itemStyle: { color: ORANGE } },
        { name: t('dash_route_other'), value: route.tons * 0.15, itemStyle: { color: CHART_COLORS[2] } },
      ],
    })),
  ]),
  card('network', 'Ağ (graph)', [
    {
      type: 'graph',
      coordinateSystem: 'geo',
      layout: 'none',
      lineStyle: { color: ORANGE, width: 1.5, opacity: 0.6 },
      itemStyle: { color: BLUE },
      label: { show: true, position: 'right', fontSize: 11, color: '#52514e' },
      labelLayout: { hideOverlap: true },
      data: [
        { name: ROUTE_HUB.name, value: ROUTE_HUB.position, symbolSize: 16 },
        ...DELIVERY_ROUTES.map((route) => ({ name: route.name, value: route.position, symbolSize: 6 + route.tons / 12 })),
      ],
      links: DELIVERY_ROUTES.map((route) => ({ source: ROUTE_HUB.name, target: route.name })),
    },
  ]),
];

/** ECharts GL gerektirir: eklentiler yüklendikten sonra çizilir. */
export const routeChart3D = (): ChartCard => ({
  title: 'dash_route_3d_title',
  note: 'dash_route_3d_note',
  kind: '3B akış',
  library: 'ECharts GL',
  options: {
    tooltip: { show: false },
    geo3D: {
      map: TURKEY_MAP,
      shading: 'color',
      regionHeight: 1,
      boxWidth: 120,
      itemStyle: { color: '#f0efec', borderColor: '#c3c2b7', borderWidth: 0.5 },
      viewControl: { alpha: 42, distance: 78 },
      silent: true,
    },
    series: [
      {
        type: 'lines3D',
        coordinateSystem: 'geo3D',
        effect: { show: true, trailWidth: 3, trailLength: 0.25, trailColor: ORANGE },
        lineStyle: { width: 1, color: ORANGE, opacity: 0.4 },
        data: DELIVERY_ROUTES.map((route) => [ROUTE_HUB.position, route.position]),
      },
    ],
  },
});
