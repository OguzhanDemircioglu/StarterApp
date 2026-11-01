import type { CustomSeriesRenderItem } from 'echarts';
import { CHART_COLORS, NEGATIVE_COLOR, NEUTRAL_COLOR, POSITIVE_COLOR, SEQUENTIAL_COLORS } from '../../../shared/charts/chart-colors';
import { formatMonth, formatNumber } from '../../../shared/charts/chart-format';
import { ChartBuilder } from './dashboard.model';
import {
  BRANCH_CHANNEL_SHARES,
  BRANCHES,
  CHANNELS,
  DISH_RANKS,
  LAST_YEAR_REVENUE,
  MENU,
  MONTHLY_REVENUE,
  MONTHS,
  OCCUPANCY,
  OPENING_PROJECT,
  PAYMENT_METHODS,
  SALES_EVENTS,
  seededRandom,
  TEA_SALES,
  TICKET_POINTS,
  TICKET_BY_BRANCH,
  TOTAL_REVENUE,
} from './restaurant.mock';

const MUTED = '#898781';
const INK = '#52514e';
const HISTOGRAM_STEP = 50;
const DENSITY_POINTS = 32;
const WAFFLE_SIZE = 10;
const HEX_HOUR = 0.5;
const HEX_AMOUNT = 60;
const SAMPLES = 120;

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/** Örneklerin yoğunluk eğrisi: violin ve ridgeline bunu çizer. [değer, yoğunluk] döner, yoğunluk 0-1 arasıdır. */
function density(samples: number[], min: number, max: number): [number, number][] {
  const bandwidth = (max - min) / 14;
  const points = Array.from({ length: DENSITY_POINTS }, (_, index) => {
    const value = min + ((max - min) * index) / (DENSITY_POINTS - 1);
    const height = sum(samples.map((sample) => Math.exp(-(((value - sample) / bandwidth) ** 2) / 2)));
    return [value, height] as [number, number];
  });
  const peak = Math.max(...points.map((point) => point[1]));
  return points.map(([value, height]) => [value, height / peak]);
}

const ticketSamples = (branch: number) => TICKET_BY_BRANCH[branch];

/** Örnekler aynı değerde üst üste binmesin diye yana açılır. */
function beeswarm(samples: number[], column: number): [number, number][] {
  const seen = new Map<number, number>();
  return samples.map((sample) => {
    const bin = Math.round(sample / 25);
    const count = seen.get(bin) ?? 0;
    seen.set(bin, count + 1);
    const side = count % 2 === 0 ? 1 : -1;
    return [column + (side * Math.ceil(count / 2) * 0.035), sample];
  });
}

const hexBins = (() => {
  const counts = new Map<string, [number, number, number]>();
  for (const [hour, amount] of TICKET_POINTS) {
    const row = Math.round(amount / HEX_AMOUNT);
    const shift = row % 2 === 0 ? 0 : HEX_HOUR / 2;
    const column = Math.round((hour - shift) / HEX_HOUR);
    const key = `${column}:${row}`;
    const bin = counts.get(key) ?? [column * HEX_HOUR + shift, row * HEX_AMOUNT, 0];
    bin[2]++;
    counts.set(key, bin);
  }
  return [...counts.values()];
})();

const renderHexagon: CustomSeriesRenderItem = (_params, api) => {
  const [x, y] = api.coord([api.value(0), api.value(1)]);
  const [width, height] = api.size?.([HEX_HOUR, HEX_AMOUNT]) as number[];
  return {
    type: 'polygon',
    shape: {
      points: [
        [x, y - height * 0.66],
        [x + width / 2, y - height * 0.33],
        [x + width / 2, y + height * 0.33],
        [x, y + height * 0.66],
        [x - width / 2, y + height * 0.33],
        [x - width / 2, y - height * 0.33],
      ],
    },
    style: { fill: api.visual('color') as string },
  };
};

const renderMekko: CustomSeriesRenderItem = (_params, api) => {
  const [x0, y0] = api.coord([api.value(0), api.value(2)]);
  const [x1, y1] = api.coord([api.value(1), api.value(3)]);
  return {
    type: 'rect',
    shape: { x: x0, y: y1, width: x1 - x0 - 2, height: y0 - y1 - 2 },
    style: { fill: CHART_COLORS[api.value(4) as number] },
  };
};

const renderTask: CustomSeriesRenderItem = (_params, api) => {
  const start = api.coord([api.value(1), api.value(0)]);
  const end = api.coord([api.value(2), api.value(0)]);
  const height = (api.size?.([0, 1]) as number[])[1] * 0.5;
  return {
    type: 'rect',
    shape: { x: start[0], y: start[1] - height / 2, width: end[0] - start[0], height, r: 4 },
    style: { fill: CHART_COLORS[api.value(3) as number] },
  };
};

export const moreCharts: ChartBuilder = ({ t }) => {
  const months = MONTHS.map(formatMonth);
  const dishes = MENU.flatMap((category) => category.children ?? []);
  const topDishes = [...dishes].sort((a, b) => (a.value ?? 0) - (b.value ?? 0)).slice(-8);
  const ticketValues = TICKET_POINTS.map((point) => point[1]);
  const bins = new Map<number, number>();
  ticketValues.forEach((value) => {
    const bin = Math.floor(value / HISTOGRAM_STEP) * HISTOGRAM_STEP;
    bins.set(bin, (bins.get(bin) ?? 0) + 1);
  });
  const histogram = [...bins.entries()].sort((a, b) => a[0] - b[0]);

  const violins = BRANCHES.map((_, index) => density(ticketSamples(index), 150, 1000));
  const violinItem: CustomSeriesRenderItem = (params, api) => {
    const curve = violins[params.dataIndex];
    const halfWidth = (api.size?.([1, 0]) as number[])[0] * 0.4;
    const center = api.coord([params.dataIndex, 0])[0];
    const side = (sign: number) => curve.map(([value, height]) => [center + sign * height * halfWidth, api.coord([0, value])[1]]);
    return {
      type: 'polygon',
      shape: { points: [...side(1), ...side(-1).reverse()] },
      style: { fill: CHART_COLORS[params.dataIndex], opacity: 0.75 },
    };
  };

  const ridgeMonths = [0, 2, 4, 6, 8];
  const ridges = ridgeMonths.map((month, index) => {
    const random = seededRandom(100 + month);
    const center = 340 + month * 26;
    const samples = Array.from({ length: SAMPLES }, () => center + (random() + random() + random() - 1.5) * 170);
    return { name: months[month], curve: density(samples, 100, 900), row: index };
  });
  const ridgeItem: CustomSeriesRenderItem = (params, api) => {
    const { curve, row } = ridges[params.dataIndex];
    const base = api.coord([100, row])[1];
    const unit = (api.size?.([0, 1]) as number[])[1] * 1.7;
    const top = curve.map(([value, height]) => [api.coord([value, 0])[0], base - height * unit]);
    return {
      type: 'polygon',
      shape: { points: [[top[0][0], base], ...top, [top[top.length - 1][0], base]] },
      style: { fill: CHART_COLORS[0], opacity: 0.6, stroke: '#fff', lineWidth: 1 },
    };
  };

  const waffle = (() => {
    const cells = PAYMENT_METHODS.flatMap((method, index) => Array.from({ length: method.value }, () => index));
    return PAYMENT_METHODS.map((method, index) => ({
      name: method.name,
      points: cells.flatMap((owner, cell) =>
        owner === index ? [[cell % WAFFLE_SIZE, Math.floor(cell / WAFFLE_SIZE)]] : [],
      ),
    }));
  })();

  const lastYear = sum(LAST_YEAR_REVENUE);
  const gain = TOTAL_REVENUE - lastYear;
  const steps = [
    { name: t('dash_more_step_price'), value: Math.round(gain * 0.62) },
    { name: t('dash_more_step_covers'), value: Math.round(gain * 0.33) },
    { name: t('dash_more_step_online'), value: Math.round(gain * 0.28) },
  ];
  const discount = gain - sum(steps.map((step) => step.value));
  steps.push({ name: t('dash_more_step_discount'), value: discount });
  let running = lastYear;
  const cascade = steps.map((step) => {
    const base = step.value >= 0 ? running : running + step.value;
    running += step.value;
    return { ...step, base, amount: Math.abs(step.value) };
  });

  const bullets = [
    { name: t('dash_more_bullet_revenue'), value: 96, target: 100 },
    { name: t('dash_more_bullet_margin'), value: 108, target: 100 },
    { name: t('dash_more_bullet_rating'), value: 88, target: 100 },
    { name: t('dash_more_bullet_speed'), value: 74, target: 100 },
  ];
  const bulletAxis = bullets.map((bullet) => bullet.name);

  const sparkRows = CHANNELS.map((channel, index) => ({
    name: channel.name,
    values: channel.monthly,
    top: 8 + index * 24,
  }));

  return [
    {
      title: 'dash_more_lollipop_title',
      note: 'dash_more_lollipop_note',
      kind: 'Lolipop',
      options: {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: topDishes.map((dish) => dish.name) },
        series: [
          { type: 'bar', barWidth: 2, itemStyle: { color: NEUTRAL_COLOR }, data: topDishes.map((dish) => dish.value), tooltip: { show: false } },
          { type: 'scatter', name: t('dash_series_revenue'), symbolSize: 13, data: topDishes.map((dish) => [dish.value, dish.name]) },
        ],
      },
    },
    {
      title: 'dash_more_dumbbell_title',
      note: 'dash_more_dumbbell_note',
      kind: 'Dumbbell',
      options: {
        tooltip: {},
        legend: {},
        xAxis: { type: 'value', min: 390, interval: 30 },
        yAxis: { type: 'category', data: ['Kadıköy', 'Beşiktaş', 'Alsancak'] },
        series: [
          { type: 'bar', stack: 'gap', silent: true, itemStyle: { color: 'transparent' }, barWidth: 4, data: [445, 462, 398], tooltip: { show: false } },
          { type: 'bar', stack: 'gap', silent: true, itemStyle: { color: NEUTRAL_COLOR }, barWidth: 4, data: [65, 44, 61], tooltip: { show: false } },
          { type: 'scatter', name: '2025', symbolSize: 14, itemStyle: { color: CHART_COLORS[1] }, data: [[445, 'Kadıköy'], [462, 'Beşiktaş'], [398, 'Alsancak']] },
          { type: 'scatter', name: '2026', symbolSize: 14, itemStyle: { color: CHART_COLORS[0] }, data: [[510, 'Kadıköy'], [506, 'Beşiktaş'], [459, 'Alsancak']] },
        ],
      },
    },
    {
      title: 'dash_more_slope_title',
      note: 'dash_more_slope_note',
      kind: 'Eğim grafiği',
      options: {
        grid: { left: 72, right: 96 },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['2025', '2026'], boundaryGap: false, axisTick: { show: false } },
        yAxis: { type: 'value', show: false, min: 3.6, max: 5 },
        series: [
          { name: 'Lezzet', data: [4.3, 4.7] },
          { name: 'Servis', data: [4.5, 4.2] },
          { name: 'Hız', data: [3.8, 4.4] },
          { name: 'Fiyat', data: [4.1, 3.9] },
        ].map((row) => ({
          ...row,
          type: 'line',
          symbolSize: 9,
          lineStyle: { width: 2 },
          endLabel: { show: true, formatter: '{a} {c}', color: INK },
          label: { show: true, position: 'left', formatter: ({ dataIndex, value }: { dataIndex: number; value: number }) => (dataIndex === 0 ? String(value) : '') },
        })),
      },
    },
    {
      title: 'dash_more_bump_title',
      note: 'dash_more_bump_note',
      kind: 'Sıralama değişimi',
      options: {
        grid: { right: 112 },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: months, boundaryGap: false },
        yAxis: { type: 'value', inverse: true, min: 1, max: 5, interval: 1, axisLabel: { formatter: '{value}.' }, splitLine: { show: false } },
        series: DISH_RANKS.map((dish) => ({
          type: 'line',
          name: dish.name,
          data: dish.ranks,
          smooth: 0.3,
          symbolSize: 8,
          lineStyle: { width: 3 },
          endLabel: { show: true, formatter: '{a}', color: INK },
        })),
      },
    },
    {
      title: 'dash_more_mekko_title',
      note: 'dash_more_mekko_note',
      kind: 'Marimekko',
      options: {
        tooltip: {
          formatter: ({ value }: { value: [number, number, number, number, number, string] }) =>
            `${value[5]}: %${value[3] - value[2]}`,
        },
        legend: { data: CHANNELS.map((channel) => channel.name) },
        xAxis: { type: 'value', min: 0, max: 100, axisLabel: { show: false }, splitLine: { show: false } },
        yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '%{value}' }, splitLine: { show: false } },
        series: CHANNELS.map((channel, channelIndex) => {
          let left = 0;
          return {
            type: 'custom',
            name: channel.name,
            renderItem: renderMekko,
            encode: { x: [0, 1], y: [2, 3], tooltip: [3] },
            itemStyle: { color: CHART_COLORS[channelIndex] },
            label: { show: false },
            data: BRANCH_CHANNEL_SHARES.map((branch, index) => {
              const width = BRANCHES[index].share * 100;
              const bottom = sum(branch.shares.slice(0, channelIndex));
              const item = [left, left + width, bottom, bottom + branch.shares[channelIndex], channelIndex, branch.name];
              left += width;
              return item;
            }),
          };
        }),
      },
    },
    {
      title: 'dash_more_histogram_title',
      note: 'dash_more_histogram_note',
      kind: 'Histogram',
      options: {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: { type: 'category', data: histogram.map(([bin]) => bin), axisLabel: { interval: 3 } },
        yAxis: { type: 'value' },
        series: [
          {
            type: 'bar',
            name: t('dash_more_tickets'),
            barCategoryGap: '4%',
            data: histogram.map(([, count]) => count),
          },
        ],
      },
    },
    {
      title: 'dash_more_violin_title',
      note: 'dash_more_violin_note',
      kind: 'Keman grafiği',
      options: {
        tooltip: { show: false },
        xAxis: { type: 'category', data: BRANCHES.map((branch) => branch.name) },
        yAxis: { type: 'value', min: 150, max: 1000 },
        series: [{ type: 'custom', renderItem: violinItem, data: BRANCHES.map((_, index) => [index, 0]) }],
      },
    },
    {
      title: 'dash_more_ridge_title',
      note: 'dash_more_ridge_note',
      kind: 'Sırt grafiği',
      options: {
        tooltip: { show: false },
        grid: { top: 72 },
        xAxis: { type: 'value', min: 100, max: 900 },
        yAxis: { type: 'category', data: ridges.map((ridge) => ridge.name), boundaryGap: false, axisTick: { show: false }, splitLine: { show: false } },
        series: [{ type: 'custom', renderItem: ridgeItem, data: ridges.map((ridge) => [100, ridge.row]) }],
      },
    },
    {
      title: 'dash_more_swarm_title',
      note: 'dash_more_swarm_note',
      kind: 'Arı sürüsü',
      options: {
        tooltip: { show: false },
        xAxis: {
          type: 'value',
          min: -0.5,
          max: 2.5,
          interval: 1,
          axisLabel: { formatter: (value: number) => BRANCHES[value]?.name ?? '' },
          splitLine: { show: false },
        },
        yAxis: { type: 'value', min: 150, max: 1000 },
        series: BRANCHES.map((branch, index) => ({
          type: 'scatter',
          name: branch.name,
          symbolSize: 5,
          data: beeswarm(ticketSamples(index), index),
        })),
      },
    },
    {
      title: 'dash_more_hex_title',
      note: 'dash_more_hex_note',
      kind: 'Altıgen yoğunluk',
      options: {
        grid: { bottom: 56 },
        tooltip: { show: false },
        visualMap: {
          min: 0,
          max: Math.max(...hexBins.map((bin) => bin[2])),
          dimension: 2,
          orient: 'horizontal',
          left: 'center',
          bottom: 0,
          itemHeight: 140,
          itemWidth: 12,
          inRange: { color: SEQUENTIAL_COLORS },
        },
        xAxis: { type: 'value', min: 10, max: 24, name: t('dash_axis_hour'), nameLocation: 'middle', nameGap: 24 },
        yAxis: { type: 'value', min: 0, max: 1200 },
        series: [{ type: 'custom', renderItem: renderHexagon, encode: { x: 0, y: 1 }, data: hexBins }],
      },
    },
    {
      title: 'dash_more_waffle_title',
      note: 'dash_more_waffle_note',
      kind: 'Waffle',
      options: {
        tooltip: { formatter: ({ seriesName }: { seriesName: string }) => seriesName },
        legend: {},
        grid: { left: 96, right: 96, top: 40, bottom: 8 },
        xAxis: { type: 'category', data: [...Array(WAFFLE_SIZE).keys()], show: false },
        yAxis: { type: 'category', data: [...Array(WAFFLE_SIZE).keys()], show: false },
        series: waffle.map((group) => ({
          type: 'scatter',
          name: group.name,
          symbol: 'roundRect',
          symbolSize: 21,
          data: group.points,
        })),
      },
    },
    {
      title: 'dash_more_half_title',
      note: 'dash_more_half_note',
      kind: 'Yarım halka',
      options: {
        tooltip: { valueFormatter: (value: number) => `%${value}` },
        legend: {},
        series: [
          {
            type: 'pie',
            startAngle: 180,
            endAngle: 360,
            radius: ['52%', '92%'],
            center: ['50%', '82%'],
            padAngle: 1,
            itemStyle: { borderRadius: 4 },
            label: { formatter: '%{c}' },
            data: PAYMENT_METHODS,
          },
        ],
      },
    },
    {
      title: 'dash_more_cascade_title',
      note: 'dash_more_cascade_note',
      kind: 'Kaskad',
      options: {
        tooltip: { trigger: 'item' },
        xAxis: { type: 'value', min: 20000 },
        yAxis: {
          type: 'category',
          inverse: true,
          data: ['2025', ...cascade.map((step) => step.name), '2026'],
        },
        series: [
          {
            type: 'bar',
            stack: 'cascade',
            silent: true,
            tooltip: { show: false },
            itemStyle: { color: 'transparent' },
            data: [0, ...cascade.map((step) => step.base), 0],
          },
          {
            type: 'bar',
            stack: 'cascade',
            barWidth: '56%',
            name: t('dash_series_amount'),
            label: {
              show: true,
              position: 'right',
              color: INK,
              formatter: ({ value }: { value: number }) => formatNumber(value),
            },
            data: [
              { value: lastYear, itemStyle: { color: NEUTRAL_COLOR } },
              ...cascade.map((step) => ({
                value: step.amount,
                itemStyle: { color: step.value >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR },
              })),
              { value: TOTAL_REVENUE, itemStyle: { color: CHART_COLORS[2] } },
            ],
          },
        ],
      },
    },
    {
      title: 'dash_more_bullet_title',
      note: 'dash_more_bullet_note',
      kind: 'Mermi grafiği',
      options: {
        tooltip: { show: false },
        xAxis: { type: 'value', max: 120, axisLabel: { formatter: '%{value}' } },
        yAxis: { type: 'category', data: bulletAxis, inverse: true },
        series: [
          { type: 'bar', stack: 'range', barWidth: 26, silent: true, itemStyle: { color: '#e1e0d9' }, data: bullets.map(() => 70) },
          { type: 'bar', stack: 'range', barWidth: 26, silent: true, itemStyle: { color: '#f0efec' }, data: bullets.map(() => 50) },
          {
            type: 'bar',
            barGap: '-100%',
            barWidth: 9,
            name: t('dash_more_bullet_actual'),
            z: 3,
            itemStyle: { color: CHART_COLORS[0] },
            data: bullets.map((bullet) => bullet.value),
            label: { show: true, position: 'right', formatter: '%{c}', color: INK },
          },
          {
            type: 'scatter',
            symbol: 'rect',
            symbolSize: [3, 26],
            z: 4,
            itemStyle: { color: '#0b0b0b' },
            data: bullets.map((bullet) => [bullet.target, bullet.name]),
          },
        ],
      },
    },
    {
      title: 'dash_more_spark_title',
      note: 'dash_more_spark_note',
      kind: 'Küçük çizgi tablosu',
      options: {
        tooltip: { trigger: 'axis' },
        title: sparkRows.map((row) => ({
          text: row.name,
          left: 16,
          top: `${row.top + 6}%`,
          textStyle: { fontSize: 13, fontWeight: 500, color: INK },
        })),
        graphic: sparkRows.map((row) => ({
          type: 'text',
          right: 16,
          top: `${row.top + 6}%`,
          style: { text: formatNumber(row.values[row.values.length - 1]), fontSize: 13, fontWeight: 600, fill: '#0b0b0b' },
        })),
        grid: sparkRows.map((row) => ({ left: 120, right: 72, top: `${row.top}%`, height: '17%' })),
        xAxis: sparkRows.map((_, gridIndex) => ({ type: 'category', gridIndex, data: months, show: false, boundaryGap: false })),
        yAxis: sparkRows.map((_, gridIndex) => ({ type: 'value', gridIndex, show: false, scale: true })),
        series: sparkRows.map((row, index) => ({
          type: 'line',
          name: row.name,
          xAxisIndex: index,
          yAxisIndex: index,
          data: row.values,
          showSymbol: false,
          lineStyle: { width: 2 },
          areaStyle: { opacity: 0.1 },
          color: CHART_COLORS[index],
        })),
      },
    },
    {
      title: 'dash_more_ring_title',
      note: 'dash_more_ring_note',
      kind: 'İlerleme halkası',
      options: {
        tooltip: { show: false },
        series: [
          { name: t('dash_more_ring_revenue'), value: 96, center: '30%' },
          { name: t('dash_more_ring_occupancy'), value: OCCUPANCY, center: '70%' },
        ].map((ring, index) => ({
          type: 'gauge',
          startAngle: 90,
          endAngle: -270,
          center: [ring.center, '50%'],
          radius: '58%',
          min: 0,
          max: 100,
          pointer: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false },
          progress: { show: true, roundCap: true, width: 14, itemStyle: { color: CHART_COLORS[index] } },
          axisLine: { lineStyle: { width: 14, color: [[1, '#f0efec']] } },
          title: { offsetCenter: [0, '128%'], fontSize: 13, color: INK },
          detail: { offsetCenter: [0, 0], formatter: '%{value}', fontSize: 24, color: '#0b0b0b' },
          data: [{ name: ring.name, value: ring.value }],
        })),
      },
    },
    {
      title: 'dash_more_gantt_title',
      note: 'dash_more_gantt_note',
      kind: 'Gantt',
      options: {
        tooltip: {
          formatter: ({ value }: { value: [number, number, number, number] }) =>
            `${OPENING_PROJECT[value[0]].name}<br>${value[1]}. - ${value[2]}. hafta`,
        },
        xAxis: { type: 'value', min: 0, max: 26, interval: 6, axisLabel: { formatter: '{value}. hafta' } },
        yAxis: { type: 'category', inverse: true, data: OPENING_PROJECT.map((task) => task.name) },
        series: [
          {
            type: 'custom',
            renderItem: renderTask,
            encode: { x: [1, 2], y: 0 },
            data: OPENING_PROJECT.map((task, index) => [index, task.start, task.end, task.group]),
            markLine: {
              silent: true,
              symbol: 'none',
              label: { formatter: t('dash_more_today'), position: 'insideEndTop', color: INK },
              lineStyle: { color: NEGATIVE_COLOR },
              data: [{ xAxis: 11 }],
            },
          },
        ],
      },
    },
    {
      title: 'dash_more_season_title',
      note: 'dash_more_season_note',
      kind: 'Mevsimsel kutupsal',
      options: {
        tooltip: { trigger: 'axis' },
        legend: {},
        polar: { radius: '72%', center: ['50%', '56%'] },
        angleAxis: { type: 'category', data: months, startAngle: 90, boundaryGap: false, axisLabel: { color: MUTED } },
        radiusAxis: { min: 1000, axisLabel: { show: false }, axisLine: { show: false }, axisTick: { show: false } },
        series: [
          { name: t('dash_series_this_year'), data: MONTHLY_REVENUE },
          { name: t('dash_series_last_year'), data: LAST_YEAR_REVENUE },
        ].map((row) => ({
          ...row,
          type: 'line',
          coordinateSystem: 'polar',
          symbolSize: 6,
          lineStyle: { width: 2 },
        })),
      },
    },
    {
      title: 'dash_more_events_title',
      note: 'dash_more_events_note',
      kind: 'Olay zaman çizelgesi',
      wide: true,
      options: {
        grid: { top: 16, bottom: 24 },
        tooltip: { show: false },
        xAxis: { type: 'time', min: '2026-01-01', max: '2026-11-01', axisLabel: { color: MUTED } },
        yAxis: { type: 'value', min: -2, max: 2, show: false },
        series: [
          {
            type: 'bar',
            barWidth: 2,
            itemStyle: { color: NEUTRAL_COLOR },
            data: SALES_EVENTS.map((event, index) => {
              const up = index % 2 === 0;
              return {
                value: [event.date, up ? 1 : -1],
                label: {
                  show: true,
                  position: up ? 'top' : 'bottom',
                  formatter: event.name,
                  color: INK,
                },
              };
            }),
          },
          {
            type: 'scatter',
            symbolSize: 10,
            z: 3,
            data: SALES_EVENTS.map((event) => [event.date, 0]),
          },
        ],
      },
    },
    {
      title: 'dash_more_multiples_title',
      note: 'dash_more_multiples_note',
      kind: 'Küçük çoklu grafik',
      wide: true,
      height: '240px',
      options: {
        tooltip: { trigger: 'axis' },
        title: BRANCHES.map((branch, index) => ({
          text: branch.name,
          left: `${4 + index * 33}%`,
          top: 0,
          textStyle: { fontSize: 13, fontWeight: 600, color: INK },
        })),
        grid: BRANCHES.map((_, index) => ({
          left: `${4 + index * 33}%`,
          width: '27%',
          top: 32,
          bottom: 28,
        })),
        xAxis: BRANCHES.map((_, gridIndex) => ({
          type: 'category',
          gridIndex,
          data: months,
          boundaryGap: false,
          axisLabel: { interval: 2 },
        })),
        yAxis: BRANCHES.map((_, gridIndex) => ({ type: 'value', gridIndex, max: 1500, show: gridIndex === 0 })),
        series: BRANCHES.map((branch, index) => ({
          type: 'line',
          name: branch.name,
          xAxisIndex: index,
          yAxisIndex: index,
          showSymbol: false,
          lineStyle: { width: 2 },
          areaStyle: { opacity: 0.15 },
          color: CHART_COLORS[index],
          data: MONTHLY_REVENUE.map((revenue) => Math.round(revenue * branch.share)),
        })),
      },
    },
    {
      title: 'dash_more_tea_title',
      note: 'dash_more_tea_note',
      kind: 'Sütun + ortalama çizgisi',
      options: {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'] },
        yAxis: { type: 'value' },
        series: [
          {
            type: 'bar',
            name: t('dash_series_tea'),
            barWidth: '50%',
            itemStyle: { borderRadius: [4, 4, 0, 0] },
            data: TEA_SALES,
            markLine: {
              symbol: 'none',
              silent: true,
              data: [{ type: 'average', name: t('dash_more_average') }],
              label: { formatter: t('dash_more_average'), position: 'insideEndTop', color: INK },
              lineStyle: { color: CHART_COLORS[1] },
            },
          },
        ],
      },
    },
  ];
};
