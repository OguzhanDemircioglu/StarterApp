import { CHART_COLORS, SEQUENTIAL_COLORS } from '../../../shared/charts/chart-colors';
import { formatMonth, formatWeekday } from '../../../shared/charts/chart-format';
import { ChartBuilder } from './dashboard.model';
import { TURKEY_MAP } from './gallery.charts';
import { FLOOR_MAP } from './operations.charts';
import {
  BRANCHES,
  COURIER_LINES,
  COVERS_BY_HOUR,
  CUSTOMER_NETWORK,
  DISH_PERFORMANCE,
  FLOOR_ZONES,
  IMPORT_ROUTES,
  MONTHLY_REVENUE,
  MONTHS,
  OCCUPANCY,
  OPENING_HOURS,
  REVIEW_WORDS,
  SUPPLIERS,
  TICKET_POINTS,
  VENT_FIELD,
} from './restaurant.mock';

const VIEW_3D = { alpha: 22, beta: 40, distance: 210 };
const AXIS_3D = { axisLine: { lineStyle: { color: '#c3c2b7' } }, splitLine: { lineStyle: { color: '#e1e0d9' } } };
const GRID_3D = { boxWidth: 120, boxDepth: 80, boxHeight: 60, viewControl: VIEW_3D, ...AXIS_3D };
const ISTANBUL = [29, 41];
/** WebGL serileri harita ve eksenlerin üstündeki kendi katmanına çizilir; aynı katmanda altta kalır. */
const GL_LAYER = 1;
/** polygons3D haritanın merkezine değil köşesine oturur (echarts-gl + ECharts 6): kat planının yarısı kadar kaydırılır. */
const FLOOR_OFFSET = [50, -40];

export const extensionCharts: ChartBuilder = ({ t, language }) => {
  const weekdays = [0, 1, 2, 3, 4, 5, 6].map((day) => formatWeekday(day, language));
  const months = MONTHS.map((month) => formatMonth(month, language));
  const maxCovers = Math.max(...COVERS_BY_HOUR.map((cell) => cell[2]));

  return [
    {
      title: 'dash_liquid_title',
      note: 'dash_liquid_note',
      kind: 'liquidFill',
      options: {
        tooltip: { show: false },
        series: [
          {
            type: 'liquidFill',
            data: [OCCUPANCY / 100, (OCCUPANCY - 6) / 100, (OCCUPANCY - 12) / 100],
            radius: '82%',
            color: [CHART_COLORS[0], SEQUENTIAL_COLORS[2], SEQUENTIAL_COLORS[1]],
            backgroundStyle: { color: '#f0efec' },
            outline: { borderDistance: 4, itemStyle: { borderWidth: 3, borderColor: CHART_COLORS[0] } },
            label: { fontSize: 36, color: '#0b0b0b', insideColor: '#fff' },
          },
        ],
      },
    },
    {
      title: 'dash_words_title',
      note: 'dash_words_note',
      kind: 'wordCloud',
      options: {
        tooltip: {},
        series: [
          {
            type: 'wordCloud',
            name: t('dash_series_mentions'),
            shape: 'circle',
            sizeRange: [13, 46],
            rotationRange: [0, 0],
            gridSize: 8,
            left: 'center',
            top: 'center',
            width: '92%',
            height: '92%',
            textStyle: { fontWeight: 600 },
            data: REVIEW_WORDS.map((word, index) => ({
              ...word,
              textStyle: { color: CHART_COLORS[index % 4] },
            })),
          },
        ],
      },
    },
    {
      title: 'dash_bar3d_title',
      note: 'dash_bar3d_note',
      kind: 'bar3D',
      height: '380px',
      options: {
        tooltip: {},
        visualMap: { show: false, min: 0, max: maxCovers, inRange: { color: SEQUENTIAL_COLORS } },
        xAxis3D: { type: 'category', data: OPENING_HOURS.map((hour) => `${hour}:00`), name: '' },
        yAxis3D: { type: 'category', data: weekdays, name: '' },
        zAxis3D: { type: 'value', name: '' },
        grid3D: GRID_3D,
        series: [{ type: 'bar3D', data: COVERS_BY_HOUR, shading: 'color', bevelSize: 0.2 }],
      },
    },
    {
      title: 'dash_line3d_title',
      note: 'dash_line3d_note',
      kind: 'line3D',
      height: '380px',
      options: {
        tooltip: {},
        legend: {},
        xAxis3D: { type: 'category', data: months, name: '' },
        yAxis3D: { type: 'category', data: BRANCHES.map((branch) => branch.name), name: '' },
        zAxis3D: { type: 'value', name: '' },
        grid3D: GRID_3D,
        series: BRANCHES.map((branch, row) => ({
          type: 'line3D',
          name: branch.name,
          lineStyle: { width: 4 },
          data: MONTHLY_REVENUE.map((revenue, month) => [month, row, Math.round(revenue * branch.share)]),
        })),
      },
    },
    {
      title: 'dash_scatter3d_title',
      note: 'dash_scatter3d_note',
      kind: 'scatter3D',
      height: '380px',
      options: {
        tooltip: {},
        xAxis3D: { type: 'value', name: t('dash_axis_sold') },
        yAxis3D: { type: 'value', name: t('dash_axis_margin'), min: 30, max: 90 },
        zAxis3D: { type: 'value', name: t('dash_axis_contribution') },
        grid3D: GRID_3D,
        series: [
          {
            type: 'scatter3D',
            symbolSize: 12,
            itemStyle: { color: CHART_COLORS[0], opacity: 0.9 },
            data: DISH_PERFORMANCE.map((dish) => ({
              name: dish.name,
              value: [dish.sold, dish.margin, Math.round((dish.sold * dish.margin) / 100)],
            })),
          },
        ],
      },
    },
    {
      title: 'dash_surface_title',
      note: 'dash_surface_note',
      kind: 'surface',
      height: '380px',
      options: {
        tooltip: { show: false },
        visualMap: { show: false, min: 40, max: 130, dimension: 2, inRange: { color: SEQUENTIAL_COLORS } },
        xAxis3D: { type: 'value', name: t('dash_axis_price_change') },
        yAxis3D: { type: 'value', name: t('dash_axis_temperature') },
        zAxis3D: { type: 'value', name: '' },
        grid3D: GRID_3D,
        series: [
          {
            type: 'surface',
            wireframe: { show: false },
            shading: 'color',
            equation: {
              x: { min: -20, max: 20, step: 1 },
              y: { min: 0, max: 40, step: 1 },
              z: (x: number, y: number) => 100 - 1.1 * x - ((y - 24) * (y - 24)) / 18,
            },
          },
        ],
      },
    },
    {
      title: 'dash_map3d_title',
      note: 'dash_map3d_note',
      kind: 'map3D',
      height: '380px',
      options: {
        tooltip: {},
        series: [
          {
            type: 'map3D',
            map: TURKEY_MAP,
            name: t('dash_series_tons'),
            shading: 'lambert',
            light: { main: { intensity: 1.4, alpha: 40, beta: 30 }, ambient: { intensity: 0.5 } },
            regionHeight: 1,
            boxWidth: 120,
            viewControl: { alpha: 38, beta: 8, distance: 120 },
            itemStyle: { color: '#f0efec', borderColor: '#c3c2b7', borderWidth: 0.5 },
            emphasis: { itemStyle: { color: CHART_COLORS[1] } },
            data: SUPPLIERS.map((supplier) => ({
              name: supplier.province,
              value: supplier.tons,
              height: supplier.tons / 3,
              itemStyle: { color: CHART_COLORS[0] },
            })),
          },
        ],
      },
    },
    {
      title: 'dash_polygons3d_title',
      note: 'dash_polygons3d_note',
      kind: 'polygons3D',
      height: '380px',
      options: {
        tooltip: { show: false },
        geo3D: {
          map: FLOOR_MAP,
          shading: 'color',
          regionHeight: 0.5,
          boxWidth: 100,
          itemStyle: { color: '#f0efec', borderColor: '#c3c2b7', borderWidth: 1 },
          viewControl: { alpha: 36, beta: 20, distance: 190 },
        },
        series: [
          {
            type: 'polygons3D',
            coordinateSystem: 'geo3D',
            shading: 'lambert',
            data: FLOOR_ZONES.filter((zone) => zone.revenue > 0).map(({ x, y, revenue }) => ({
              coords: [
                [
                  [x[0] + FLOOR_OFFSET[0], y[0] + FLOOR_OFFSET[1]],
                  [x[1] + FLOOR_OFFSET[0], y[0] + FLOOR_OFFSET[1]],
                  [x[1] + FLOOR_OFFSET[0], y[1] + FLOOR_OFFSET[1]],
                  [x[0] + FLOOR_OFFSET[0], y[1] + FLOOR_OFFSET[1]],
                ],
              ],
              height: revenue / 800,
              itemStyle: { color: CHART_COLORS[0] },
            })),
          },
        ],
      },
    },
    {
      title: 'dash_globe_title',
      note: 'dash_globe_note',
      kind: 'lines3D + globe',
      height: '380px',
      options: {
        tooltip: { show: false },
        globe: {
          baseColor: SEQUENTIAL_COLORS[0],
          shading: 'color',
          viewControl: { autoRotate: true, autoRotateSpeed: 6, targetCoord: ISTANBUL, distance: 170 },
        },
        series: [
          {
            type: 'lines3D',
            coordinateSystem: 'globe',
            effect: { show: true, trailWidth: 3, trailLength: 0.2, trailColor: CHART_COLORS[1] },
            lineStyle: { width: 2, color: CHART_COLORS[1], opacity: 0.6 },
            data: IMPORT_ROUTES.map((route) => [route.from, ISTANBUL]),
          },
        ],
      },
    },
    {
      title: 'dash_lines_gl_title',
      note: 'dash_lines_gl_note',
      kind: 'linesGL',
      height: '380px',
      options: {
        tooltip: { show: false },
        grid: { top: 16, right: 32, bottom: 40 },
        xAxis: { type: 'value', name: t('dash_axis_km'), nameLocation: 'middle', nameGap: 28, min: -20, max: 20 },
        yAxis: { type: 'value', min: -20, max: 20 },
        series: [
          {
            type: 'linesGL',
            coordinateSystem: 'cartesian2d',
            zlevel: GL_LAYER,
            polyline: true,
            lineStyle: { color: CHART_COLORS[1], opacity: 0.35, width: 1 },
            data: COURIER_LINES,
          },
        ],
      },
    },
    {
      title: 'dash_scatter_gl_title',
      note: 'dash_scatter_gl_note',
      kind: 'scatterGL',
      height: '380px',
      options: {
        tooltip: { show: false },
        grid: { right: 32, bottom: 40 },
        xAxis: { type: 'value', name: t('dash_axis_hour'), nameLocation: 'middle', nameGap: 28, min: 10, max: 25 },
        yAxis: { type: 'value', name: t('dash_axis_ticket') },
        dataZoom: [{ type: 'inside' }],
        series: [
          {
            type: 'scatterGL',
            zlevel: GL_LAYER,
            symbolSize: 2,
            itemStyle: { color: CHART_COLORS[0], opacity: 0.25 },
            data: TICKET_POINTS,
          },
        ],
      },
    },
    {
      title: 'dash_graph_gl_title',
      note: 'dash_graph_gl_note',
      kind: 'graphGL',
      height: '380px',
      options: {
        tooltip: { show: false },
        series: [
          {
            type: 'graphGL',
            nodes: CUSTOMER_NETWORK.nodes.map((node) => ({
              ...node,
              symbolSize: node.value,
              itemStyle: { color: CHART_COLORS[node.category] },
            })),
            edges: CUSTOMER_NETWORK.edges,
            lineStyle: { color: '#c3c2b7', opacity: 0.2, width: 1 },
            forceAtlas2: { steps: 5, stopThreshold: 1, jitterTolerence: 10, edgeWeight: [0.2, 1], gravity: 0.5, scaling: 1 },
          },
        ],
      },
    },
    {
      title: 'dash_flow_gl_title',
      note: 'dash_flow_gl_note',
      kind: 'flowGL',
      wide: true,
      height: '340px',
      options: {
        tooltip: { show: false },
        grid: { top: 16 },
        xAxis: { type: 'value', min: 0, max: 40, axisLabel: { show: false } },
        yAxis: { type: 'value', min: 0, max: 20, axisLabel: { show: false } },
        series: [
          {
            type: 'flowGL',
            zlevel: GL_LAYER,
            data: VENT_FIELD,
            particleDensity: 96,
            particleSpeed: 2,
            particleSize: 2,
            itemStyle: { color: CHART_COLORS[0], opacity: 0.6 },
          },
        ],
      },
    },
  ];
};
