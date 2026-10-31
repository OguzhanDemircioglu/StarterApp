import { CHART_COLORS, SEQUENTIAL_COLORS } from '../../../shared/charts/chart-colors';
import { formatNumber } from '../../../shared/charts/chart-format';
import { ChartBuilder, ChartCard } from './dashboard.model';
import { TURKEY_MAP } from './gallery.charts';
import { DELIVERY_ROUTES, ROUTE_HUB } from './restaurant.mock';

const ORANGE = CHART_COLORS[1];
const BLUE = CHART_COLORS[0];
/** Kuyruklu efekt önceki kareleri silmediği için harita çizilmesin diye ayrı katmanda durur. */
const TRAIL_LAYER = 1;
const VEHICLE = 'path://M2 0h6v4h2l2 3v5H0V7l2-3z';
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
