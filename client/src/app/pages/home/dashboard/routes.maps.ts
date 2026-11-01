import { PathStyleExtension } from '@deck.gl/extensions';
import { ArcLayer, IconLayer, LineLayer, PathLayer, PolygonLayer, ScatterplotLayer } from '@deck.gl/layers';
import { CHART_COLORS } from '../../../shared/charts/chart-colors';
import { MapView } from '../../../shared/charts/deck-map';
import { along, MapCard, Position, rgb } from './maps.charts';
import streetRoutes from './courier-streets.json';
import { DELIVERY_ROUTES, IMPORT_ROUTES, ROUTE_HUB } from './restaurant.mock';

type Route = (typeof DELIVERY_ROUTES)[number];

const ORANGE = rgb(CHART_COLORS[1]);
const BLUE = rgb(CHART_COLORS[0]);
const HUB = ROUTE_HUB.position as Position;
const LOOP_SECONDS = 5;
const PARTICLES_PER_ROUTE = 3;

const TURKEY_TILTED: MapView = { center: [34.5, 39], zoom: 4, pitch: 45 };
const TURKEY: MapView = { center: [34.5, 38.6], zoom: 4 };
const WORLD: MapView = { center: [30, 25], zoom: 1, pitch: 30 };

/** Gerçek sokak geometrisi: OpenStreetMap verisi (ODbL), OSRM ile bir kez hesaplanıp dosyaya kaydedildi. */
const STREETS = streetRoutes as Position[][];
const STREET_VIEW: MapView = { center: [29.04, 41.03], zoom: 11 };
const STREET_LOOP_SECONDS = 14;
const TRAIL_SEGMENTS = 22;
const TRAIL_SHARE = 0.22;
const TRUCK_LENGTH = 0.0016;
const TRUCK_WIDTH = 0.0006;
const ARROW_ICON = {
  url: `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><path d="M32 4 56 58 32 46 8 58z" fill="#2a78d6" stroke="#fff" stroke-width="4"/></svg>',
  )}`,
  width: 64,
  height: 64,
};

const streetProgress = (time: number, index: number) => (time / STREET_LOOP_SECONDS + index / STREETS.length) % 1;

/** Gidiş yönünün derecesi: ikon ve kamyon yola göre döner. */
function heading(route: Position[], progress: number): number {
  const [fromLon, fromLat] = along(route, Math.max(progress - 0.01, 0));
  const [toLon, toLat] = along(route, Math.min(progress + 0.01, 1));
  return (Math.atan2(toLon - fromLon, toLat - fromLat) * 180) / Math.PI;
}

/** Yönüne döndürülmüş dikdörtgen: yüksekliği verilince 3B kutu olur. */
function box([lon, lat]: Position, angle: number, length: number, width: number, shift = 0): Position[] {
  const radians = (angle * Math.PI) / 180;
  const along = [Math.sin(radians), Math.cos(radians)];
  const across = [along[1], -along[0]];
  return [
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1],
  ].map(([forward, side]) => [
    lon + along[0] * (forward * length + shift) + across[0] * side * width,
    lat + along[1] * (forward * length + shift) + across[1] * side * width,
  ]);
}

const target = (route: Route) => route.position as Position;
const width = (route: Route) => 1 + route.tons / 25;

function arc(id: string, props: Record<string, unknown>): ArcLayer<Route> {
  return new ArcLayer<Route>({
    id,
    data: DELIVERY_ROUTES,
    getSourcePosition: () => HUB,
    getTargetPosition: target,
    getSourceColor: BLUE,
    getTargetColor: ORANGE,
    getWidth: width,
    ...props,
  });
}

export const ROUTE_MAP_CARDS: MapCard[] = [
  {
    title: 'dash_route_street_title',
    note: 'dash_route_street_note',
    kind: 'Sokak üstünde rota',
    view: STREET_VIEW,
    animated: true,
    layers: (time) => [
      new PathLayer<Position[]>({
        id: 'streets',
        data: STREETS,
        getPath: (route) => route,
        getColor: [...BLUE, 180],
        widthUnits: 'pixels',
        getWidth: 3,
        capRounded: true,
        jointRounded: true,
      }),
      new ScatterplotLayer<Position>({
        id: 'street-couriers',
        data: STREETS.map((route, index) => along(route, streetProgress(time, index))),
        getPosition: (position) => position,
        radiusUnits: 'pixels',
        getRadius: 6,
        getFillColor: ORANGE,
        getLineColor: [255, 255, 255],
        stroked: true,
        lineWidthUnits: 'pixels',
        getLineWidth: 2,
        updateTriggers: { getPosition: time },
      }),
    ],
  },
  {
    title: 'dash_route_trips_title',
    note: 'dash_route_trips_note',
    kind: 'Solan iz',
    view: STREET_VIEW,
    animated: true,
    layers: (time) => [
      new LineLayer<{ from: Position; to: Position; age: number }>({
        id: 'trails',
        data: STREETS.flatMap((route, index) => {
          const head = streetProgress(time, index);
          return Array.from({ length: TRAIL_SEGMENTS }, (_, step) => {
            const age = step / TRAIL_SEGMENTS;
            const from = Math.max(head - (age + 1 / TRAIL_SEGMENTS) * TRAIL_SHARE, 0);
            const to = Math.max(head - age * TRAIL_SHARE, 0);
            return { from: along(route, from), to: along(route, to), age };
          });
        }),
        getSourcePosition: (segment) => segment.from,
        getTargetPosition: (segment) => segment.to,
        getColor: (segment) => [...ORANGE, Math.round(255 * (1 - segment.age))],
        getWidth: 4,
        updateTriggers: { getSourcePosition: time, getTargetPosition: time, getColor: time },
      }),
    ],
  },
  {
    title: 'dash_route_icon_title',
    note: 'dash_route_icon_note',
    kind: 'Dönen ikon',
    view: STREET_VIEW,
    animated: true,
    layers: (time) => [
      new PathLayer<Position[]>({
        id: 'icon-roads',
        data: STREETS,
        getPath: (route) => route,
        getColor: [...BLUE, 70],
        widthUnits: 'pixels',
        getWidth: 2,
      }),
      new IconLayer<{ position: Position; angle: number }>({
        id: 'icons',
        data: STREETS.map((route, index) => {
          const progress = streetProgress(time, index);
          return { position: along(route, progress), angle: heading(route, progress) };
        }),
        getIcon: () => ARROW_ICON,
        getPosition: (item) => item.position,
        getAngle: (item) => -item.angle,
        getSize: 26,
        sizeUnits: 'pixels',
        updateTriggers: { getPosition: time, getAngle: time },
      }),
    ],
  },
  {
    title: 'dash_route_truck_title',
    note: 'dash_route_truck_note',
    kind: '3B araç',
    view: { center: [29.058, 41.0], zoom: 12.6, pitch: 55, bearing: -20 },
    animated: true,
    layers: (time) => {
      const trucks = STREETS.slice(0, 3).flatMap((route, index) => {
        const progress = streetProgress(time, index);
        const position = along(route, progress);
        const angle = heading(route, progress);
        return [
          { polygon: box(position, angle, TRUCK_LENGTH, TRUCK_WIDTH, -TRUCK_LENGTH * 0.4), height: 220, color: BLUE },
          { polygon: box(position, angle, TRUCK_LENGTH * 0.35, TRUCK_WIDTH, TRUCK_LENGTH * 1.05), height: 150, color: ORANGE },
        ];
      });
      return [
        new PathLayer<Position[]>({
          id: 'truck-roads',
          data: STREETS.slice(0, 3),
          getPath: (route) => route,
          getColor: [...BLUE, 110],
          widthUnits: 'pixels',
          getWidth: 3,
        }),
        new PolygonLayer<(typeof trucks)[number]>({
          id: 'trucks',
          data: trucks,
          extruded: true,
          getPolygon: (truck) => truck.polygon,
          getElevation: (truck) => truck.height,
          getFillColor: (truck) => truck.color,
          updateTriggers: { getPolygon: time },
        }),
      ];
    },
  },
  {
    title: 'dash_route_arc_title',
    note: 'dash_route_arc_note',
    kind: 'Yüksek yay',
    view: TURKEY_TILTED,
    layers: () => [arc('arc-high', { getHeight: 1.2 })],
  },
  {
    title: 'dash_route_tilt_title',
    note: 'dash_route_tilt_note',
    kind: 'Yatık yay',
    view: TURKEY_TILTED,
    layers: () => [arc('arc-tilt', { getHeight: 0.6, getTilt: (_: Route, { index }: { index: number }) => (index % 2 ? 60 : -60) })],
  },
  {
    title: 'dash_route_great_title',
    note: 'dash_route_great_note',
    kind: 'Büyük daire',
    view: WORLD,
    layers: () => [
      new ArcLayer<(typeof IMPORT_ROUTES)[number]>({
        id: 'arc-great',
        data: IMPORT_ROUTES,
        greatCircle: true,
        getSourcePosition: (route) => route.from as Position,
        getTargetPosition: () => HUB,
        getSourceColor: ORANGE,
        getTargetColor: BLUE,
        getWidth: 2,
      }),
    ],
  },
  {
    title: 'dash_route_line_title',
    note: 'dash_route_line_note',
    kind: 'Düz çizgi',
    view: TURKEY,
    layers: () => [
      new LineLayer<Route>({
        id: 'line',
        data: DELIVERY_ROUTES,
        getSourcePosition: () => HUB,
        getTargetPosition: target,
        getColor: ORANGE,
        getWidth: width,
      }),
    ],
  },
  {
    title: 'dash_route_dash_title',
    note: 'dash_route_dash_note',
    kind: 'Kesikli yol',
    view: TURKEY,
    layers: () => [
      new PathLayer<Route, { getDashArray: [number, number] }>({
        id: 'dashed',
        data: DELIVERY_ROUTES,
        getPath: (route) => [HUB, target(route)],
        getColor: ORANGE,
        widthUnits: 'pixels',
        getWidth: 2,
        getDashArray: [6, 4],
        extensions: [new PathStyleExtension({ dash: true })],
      }),
    ],
  },
  {
    title: 'dash_route_particles_title',
    note: 'dash_route_particles_note',
    kind: 'Akan parçacık',
    view: TURKEY,
    animated: true,
    layers: (time) => {
      const particles = DELIVERY_ROUTES.flatMap((route) =>
        Array.from({ length: PARTICLES_PER_ROUTE }, (_, index) =>
          along([HUB, target(route)], (time / LOOP_SECONDS + index / PARTICLES_PER_ROUTE) % 1),
        ),
      );
      return [
        new LineLayer<Route>({
          id: 'base',
          data: DELIVERY_ROUTES,
          getSourcePosition: () => HUB,
          getTargetPosition: target,
          getColor: [...ORANGE, 70],
          getWidth: 1,
        }),
        new ScatterplotLayer<Position>({
          id: 'particles',
          data: particles,
          getPosition: (position) => position,
          radiusUnits: 'pixels',
          getRadius: 4,
          getFillColor: BLUE,
          updateTriggers: { getPosition: time },
        }),
      ];
    },
  },
];
