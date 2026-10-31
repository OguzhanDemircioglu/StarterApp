import { ContourLayer, GridLayer, HeatmapLayer, HexagonLayer, ScreenGridLayer } from '@deck.gl/aggregation-layers';
import { ArcLayer, ColumnLayer, GeoJsonLayer, PathLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { CHART_COLORS, SEQUENTIAL_COLORS } from '../../../shared/charts/chart-colors';
import { LayerFactory, MapTooltip, MapView } from '../../../shared/charts/deck-map';
import { BRANCH_POSITIONS, SUPPLIERS, seededRandom } from './restaurant.mock';
import turkeyProvinces from './turkey-provinces.json';

/** Haritalar sekmesindeki bir kart. title ve note metin anahtarıdır, kind ekranda görünen tür adıdır. */
export interface MapCard {
  title: string;
  note: string;
  kind: string;
  view: MapView;
  layers: LayerFactory;
  animated?: boolean;
  tooltip?: MapTooltip;
}

export type Position = [number, number];
type Color = [number, number, number];

const ORDER_COUNT = 8000;
const COURIER_COUNT = 10;
const COURIER_STEPS = 14;
const COURIER_LOOP_SECONDS = 12;

const ISTANBUL: MapView = { center: [29.03, 41.0], zoom: 11 };
const ISTANBUL_TILTED: MapView = { ...ISTANBUL, pitch: 50, bearing: -15 };
const TURKEY: MapView = { center: [34.5, 38.6], zoom: 4 };
const TURKEY_TILTED: MapView = { ...TURKEY, pitch: 40 };

export function rgb(hex: string): Color {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

const BLUE = rgb(CHART_COLORS[0]);
const ORANGE = rgb(CHART_COLORS[1]);
const GREEN = rgb(CHART_COLORS[2]);
const COLOR_RANGE = SEQUENTIAL_COLORS.map(rgb);

const BRANCHES = Object.entries(BRANCH_POSITIONS).map(([name, position]) => ({ name, position: position as Position }));
const ISTANBUL_BRANCHES = BRANCHES.filter((branch) => branch.name !== 'Alsancak');

/** Siparişlerin teslimat noktaları: İstanbul'daki iki şubenin çevresinde kümelenir. */
const ORDERS: Position[] = (() => {
  const random = seededRandom(7);
  const spread = () => (random() + random() + random() - 1.5) * 0.04;
  return Array.from({ length: ORDER_COUNT }, (_, index) => {
    const [lon, lat] = ISTANBUL_BRANCHES[index % 3 === 0 ? 1 : 0].position;
    return [lon + spread() * 1.3, lat + spread()];
  });
})();

/** Kurye rotaları: şubeden çıkıp sokak gibi kırılarak ilerler. */
const COURIER_ROUTES: Position[][] = (() => {
  const random = seededRandom(11);
  return Array.from({ length: COURIER_COUNT }, (_, index) => {
    let [lon, lat] = ISTANBUL_BRANCHES[index % 2].position;
    // Kadıköy doğuya, Beşiktaş batıya gider: iki yönde de kuzey karadır, güneyde deniz var.
    const directionLon = index % 2 === 0 ? 1 : -1;
    const directionLat = 1;
    const route: Position[] = [[lon, lat]];
    for (let step = 0; step < COURIER_STEPS; step++) {
      if (step % 2 === 0) {
        lon += directionLon * (0.004 + random() * 0.012);
      } else {
        lat += directionLat * (0.003 + random() * 0.008);
      }
      route.push([lon, lat]);
    }
    return route;
  });
})();

export function along(route: Position[], progress: number): Position {
  const position = progress * (route.length - 1);
  const index = Math.min(Math.floor(position), route.length - 2);
  const ratio = position - index;
  const [fromLon, fromLat] = route[index];
  const [toLon, toLat] = route[index + 1];
  return [fromLon + (toLon - fromLon) * ratio, fromLat + (toLat - fromLat) * ratio];
}

const TONS_BY_PROVINCE = new Map(SUPPLIERS.map((supplier) => [supplier.province, supplier.tons]));

type Province = (typeof turkeyProvinces.features)[number];

/** Yazının ilin ortasında durması için sınır kutusunun merkezi alınır. */
function provinceCenter(province: Province): Position {
  const points = province.geometry.coordinates.flat(3) as number[];
  const lons = points.filter((_, index) => index % 2 === 0);
  const lats = points.filter((_, index) => index % 2 === 1);
  return [(Math.min(...lons) + Math.max(...lons)) / 2, (Math.min(...lats) + Math.max(...lats)) / 2];
}

const LABELS = turkeyProvinces.features.map((province) => ({
  name: province.properties.name,
  position: provinceCenter(province),
}));

const positionOf = (position: Position) => position;

export const MAP_CARDS: MapCard[] = [
  {
    title: 'dash_map_hexagon_title',
    note: 'dash_map_hexagon_note',
    kind: 'Altıgen sütun',
    view: ISTANBUL_TILTED,
    layers: () => [
      new HexagonLayer<Position>({
        id: 'hexagon',
        data: ORDERS,
        getPosition: positionOf,
        radius: 350,
        extruded: true,
        elevationScale: 2.5,
        colorRange: COLOR_RANGE,
        opacity: 0.8,
      }),
    ],
  },
  {
    title: 'dash_map_grid_title',
    note: 'dash_map_grid_note',
    kind: 'Kare sütun',
    view: ISTANBUL_TILTED,
    layers: () => [
      new GridLayer<Position>({
        id: 'grid',
        data: ORDERS,
        getPosition: positionOf,
        cellSize: 600,
        extruded: true,
        elevationScale: 1.6,
        colorRange: COLOR_RANGE,
        opacity: 0.8,
      }),
    ],
  },
  {
    title: 'dash_map_heat_title',
    note: 'dash_map_heat_note',
    kind: 'Yoğunluk ısı haritası',
    view: ISTANBUL,
    layers: () => [
      new HeatmapLayer<Position>({
        id: 'heat',
        data: ORDERS,
        getPosition: positionOf,
        radiusPixels: 26,
        colorRange: COLOR_RANGE,
      }),
    ],
  },
  {
    title: 'dash_map_contour_title',
    note: 'dash_map_contour_note',
    kind: 'Kontur',
    view: ISTANBUL,
    layers: () => [
      new ContourLayer<Position>({
        id: 'contour',
        data: ORDERS,
        getPosition: positionOf,
        cellSize: 400,
        contours: [
          { threshold: [8, 20], color: [...COLOR_RANGE[1], 150] },
          { threshold: [20, 40], color: [...COLOR_RANGE[2], 180] },
          { threshold: [40, 500], color: [...COLOR_RANGE[3], 210] },
          { threshold: 8, color: [...COLOR_RANGE[4], 255], strokeWidth: 2 },
        ],
      }),
    ],
  },
  {
    title: 'dash_map_screen_title',
    note: 'dash_map_screen_note',
    kind: 'Ekran ızgarası',
    view: ISTANBUL,
    layers: () => [
      new ScreenGridLayer<Position>({
        id: 'screen',
        data: ORDERS,
        getPosition: positionOf,
        cellSizePixels: 18,
        colorRange: COLOR_RANGE,
        opacity: 0.7,
      }),
    ],
  },
  {
    title: 'dash_map_points_title',
    note: 'dash_map_points_note',
    kind: 'Ölçekli noktalar',
    view: ISTANBUL,
    layers: () => [
      new ScatterplotLayer<Position>({
        id: 'orders',
        data: ORDERS.slice(0, 1500),
        getPosition: positionOf,
        radiusUnits: 'pixels',
        getRadius: 2,
        getFillColor: [...BLUE, 110],
      }),
      new ScatterplotLayer<(typeof BRANCHES)[number]>({
        id: 'branches',
        data: ISTANBUL_BRANCHES,
        getPosition: (branch) => branch.position,
        radiusUnits: 'pixels',
        getRadius: 10,
        getFillColor: ORANGE,
        getLineColor: [255, 255, 255],
        stroked: true,
        lineWidthUnits: 'pixels',
        getLineWidth: 2,
        pickable: true,
      }),
    ],
    tooltip: (item) => (item as { name: string }).name,
  },
  {
    title: 'dash_map_arc_title',
    note: 'dash_map_arc_note',
    kind: 'Yay',
    view: TURKEY_TILTED,
    layers: () => [
      new ArcLayer<(typeof SUPPLIERS)[number]>({
        id: 'arcs',
        data: SUPPLIERS,
        getSourcePosition: (supplier) => supplier.position as Position,
        getTargetPosition: (supplier) => BRANCH_POSITIONS[supplier.target] as Position,
        getSourceColor: ORANGE,
        getTargetColor: BLUE,
        getWidth: (supplier) => supplier.tons / 12,
        pickable: true,
      }),
    ],
    tooltip: (item) => {
      const supplier = item as (typeof SUPPLIERS)[number];
      return `${supplier.province} → ${supplier.target}: ${supplier.tons} ton`;
    },
  },
  {
    title: 'dash_map_column_title',
    note: 'dash_map_column_note',
    kind: 'Coğrafi sütun',
    view: TURKEY_TILTED,
    layers: () => [
      new ColumnLayer<(typeof SUPPLIERS)[number]>({
        id: 'columns',
        data: SUPPLIERS,
        getPosition: (supplier) => supplier.position as Position,
        diskResolution: 12,
        radius: 26000,
        extruded: true,
        getElevation: (supplier) => supplier.tons * 5000,
        getFillColor: BLUE,
        pickable: true,
      }),
    ],
    tooltip: (item) => {
      const supplier = item as (typeof SUPPLIERS)[number];
      return `${supplier.province}: ${supplier.tons} ton`;
    },
  },
  {
    title: 'dash_map_path_title',
    note: 'dash_map_path_note',
    kind: 'Yol',
    view: ISTANBUL,
    layers: () => [
      new PathLayer<Position[]>({
        id: 'paths',
        data: COURIER_ROUTES,
        getPath: (route) => route,
        getColor: (_, { index }) => rgb(CHART_COLORS[index % 4]),
        widthUnits: 'pixels',
        getWidth: 3,
        capRounded: true,
        jointRounded: true,
      }),
    ],
  },
  {
    title: 'dash_map_live_title',
    note: 'dash_map_live_note',
    kind: 'Hareketli rota',
    view: ISTANBUL,
    animated: true,
    layers: (time) => {
      const couriers = COURIER_ROUTES.map((route, index) =>
        along(route, ((time / COURIER_LOOP_SECONDS + index / COURIER_COUNT) % 1)),
      );
      return [
        new PathLayer<Position[]>({
          id: 'routes',
          data: COURIER_ROUTES,
          getPath: (route) => route,
          getColor: [...BLUE, 70],
          widthUnits: 'pixels',
          getWidth: 2,
        }),
        new ScatterplotLayer<Position>({
          id: 'couriers',
          data: couriers,
          getPosition: positionOf,
          radiusUnits: 'pixels',
          getRadius: 6,
          getFillColor: ORANGE,
          updateTriggers: { getPosition: time },
        }),
      ];
    },
  },
  {
    title: 'dash_map_geojson_title',
    note: 'dash_map_geojson_note',
    kind: '3B GeoJSON',
    view: TURKEY_TILTED,
    layers: () => [
      new GeoJsonLayer({
        id: 'provinces',
        data: turkeyProvinces as never,
        extruded: true,
        wireframe: true,
        getElevation: (province) => (TONS_BY_PROVINCE.get(province.properties.name) ?? 0) * 1200,
        getFillColor: (province) =>
          TONS_BY_PROVINCE.has(province.properties.name) ? [...GREEN, 220] : [240, 239, 236, 160],
        getLineColor: [195, 194, 183],
        pickable: true,
      }),
    ],
    tooltip: (item) => {
      const { name } = (item as Province).properties;
      const tons = TONS_BY_PROVINCE.get(name);
      return tons ? `${name}: ${tons} ton` : name;
    },
  },
  {
    title: 'dash_map_text_title',
    note: 'dash_map_text_note',
    kind: 'Yazı',
    view: { center: [35, 39], zoom: 4.6 },
    layers: () => [
      new TextLayer<(typeof LABELS)[number]>({
        id: 'labels',
        data: LABELS,
        getPosition: (label) => label.position,
        getText: (label) => label.name,
        characterSet: 'auto',
        getSize: 10,
        getColor: (label) => (TONS_BY_PROVINCE.has(label.name) ? ORANGE : [82, 81, 78]),
      }),
    ],
  },
];
