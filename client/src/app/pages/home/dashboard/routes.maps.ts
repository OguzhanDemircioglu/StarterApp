import { PathStyleExtension } from '@deck.gl/extensions';
import { ArcLayer, LineLayer, PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import { CHART_COLORS } from '../../../shared/charts/chart-colors';
import { MapView } from '../../../shared/charts/deck-map';
import { along, MapCard, Position, rgb } from './maps.charts';
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
