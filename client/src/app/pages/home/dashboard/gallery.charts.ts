import { CHART_COLORS, ORDINAL_COLORS, SEQUENTIAL_COLORS } from '../../../shared/charts/chart-colors';
import { formatMonth, formatNumber, formatWeekday } from '../../../shared/charts/chart-format';
import { echarts } from '../../../shared/charts/echarts-setup';
import { ChartBuilder } from './dashboard.model';
import {
  ADANA_PRICES,
  BRANCH_CHANNEL_SHARES,
  BRANCH_POSITIONS,
  BRANCHES,
  CHANNELS,
  DISH_PERFORMANCE,
  MENU,
  MONTHLY_REVENUE,
  MONTHS,
  RECIPES,
  SATISFACTION_MATRIX,
  SUPPLIERS,
  TEA_SALES,
} from './restaurant.mock';
import turkeyProvinces from './turkey-provinces.json';

export const TURKEY_MAP = 'turkey';

/** 81 ilin sınırları: Natural Earth (kamu malı), datamaps paketinden (MIT) alındı, isimleri düzeltildi. */
echarts.registerMap(TURKEY_MAP, turkeyProvinces as never);

const RACE_DISHES = 8;
const SUMMER_MONTHS = ['2026-06', '2026-08'];

export const galleryCharts: ChartBuilder = ({ t }) => {
  const months = MONTHS.map((month) => formatMonth(month));
  const dishes = MENU.flatMap((category) => category.children ?? []);
  const raceDishes = [...dishes].sort((a, b) => (b.value ?? 0) - (a.value ?? 0)).slice(0, RACE_DISHES);
  const revenueOf = (name: string) => dishes.find((dish) => dish.name === name)?.value ?? 0;
  const ingredients = [...new Set(RECIPES.flatMap((recipe) => recipe.ingredients))];
  let cumulative = 0;
  const raceShares = MONTHLY_REVENUE.map((revenue) => {
    cumulative += revenue;
    return cumulative;
  }).map((value) => value / cumulative);

  return [
    {
      title: 'dash_turkey_title',
      note: 'dash_turkey_note',
      kind: 'Harita + akış + efektli nokta',
      wide: true,
      height: '420px',
      options: {
        tooltip: {},
        visualMap: {
          seriesIndex: 0,
          min: 0,
          max: Math.max(...SUPPLIERS.map((supplier) => supplier.tons)),
          orient: 'horizontal',
          left: 16,
          bottom: 0,
          itemHeight: 140,
          itemWidth: 12,
          inRange: { color: SEQUENTIAL_COLORS },
        },
        geo: {
          map: TURKEY_MAP,
          roam: true,
          top: 8,
          bottom: 40,
          itemStyle: { areaColor: '#f0efec', borderColor: '#fff', borderWidth: 0.5 },
          emphasis: { label: { show: true }, itemStyle: { areaColor: '#c3c2b7' } },
          select: { disabled: true },
        },
        series: [
          {
            type: 'map',
            geoIndex: 0,
            name: t('dash_series_tons'),
            data: SUPPLIERS.map((supplier) => ({ name: supplier.province, value: supplier.tons })),
          },
          {
            type: 'lines',
            coordinateSystem: 'geo',
            data: SUPPLIERS.map((supplier) => ({ coords: [supplier.position, BRANCH_POSITIONS[supplier.target]] })),
            lineStyle: { color: CHART_COLORS[1], width: 1.5, curveness: 0.25, opacity: 0.8 },
            effect: { show: true, period: 5, symbolSize: 5, trailLength: 0, color: CHART_COLORS[1] },
            tooltip: { show: false },
          },
          {
            type: 'effectScatter',
            coordinateSystem: 'geo',
            name: t('dash_series_branches'),
            symbolSize: 10,
            rippleEffect: { scale: 3 },
            itemStyle: { color: CHART_COLORS[1] },
            label: { show: true, position: 'right', formatter: '{b}', color: '#0b0b0b', fontWeight: 600 },
            // İstanbul'daki iki şube haritada neredeyse aynı noktada: etiketleri ayrılır.
            data: Object.entries(BRANCH_POSITIONS).map(([name, position]) => ({
              name,
              value: position,
              label: { position: name === 'Beşiktaş' ? 'top' : 'right' },
            })),
          },
        ],
      },
    },
    {
      title: 'dash_race_title',
      note: 'dash_race_note',
      kind: 'Sıralama yarışı + zaman çizelgesi',
      wide: true,
      height: '400px',
      options: {
        baseOption: {
          timeline: {
            axisType: 'category',
            autoPlay: true,
            playInterval: 1600,
            data: months,
            left: 24,
            right: 24,
            bottom: 0,
            label: { color: '#898781' },
          },
          grid: { top: 8, bottom: 72, right: 72 },
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          xAxis: { type: 'value', max: 'dataMax' },
          yAxis: { type: 'category', inverse: true, data: raceDishes.map((dish) => dish.name) },
          animationDurationUpdate: 1400,
          animationEasingUpdate: 'linear',
          series: [
            {
              type: 'bar',
              name: t('dash_series_revenue'),
              realtimeSort: true,
              colorBy: 'data',
              barWidth: '60%',
              itemStyle: { borderRadius: [0, 4, 4, 0] },
              label: {
                show: true,
                position: 'right',
                color: '#52514e',
                formatter: ({ value }: { value: number }) => formatNumber(value),
              },
            },
          ],
        },
        // Her ürün yılın farklı döneminde güçlenir: sıralama böylece ay ay değişir.
        options: raceShares.map((share) => ({
          series: [
            {
              data: raceDishes.map((dish, index) => {
                const wobble = ((index % 3) - 1) * (1 - share) * 0.5;
                return Math.round((dish.value ?? 0) * share * (1 + wobble));
              }),
            },
          ],
        })),
      },
    },
    {
      title: 'dash_step_title',
      note: 'dash_step_note',
      kind: 'Basamaklı çizgi + işaret noktası',
      options: {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: months },
        yAxis: { type: 'value', min: 440 },
        series: [
          {
            type: 'line',
            name: t('dash_series_price'),
            step: 'end',
            data: ADANA_PRICES,
            symbolSize: 8,
            lineStyle: { width: 2 },
            markPoint: {
              symbolSize: 40,
              data: [{ type: 'max', name: t('dash_series_price') }],
              itemStyle: { color: CHART_COLORS[1] },
            },
          },
        ],
      },
    },
    {
      title: 'dash_share_area_title',
      note: 'dash_share_area_note',
      kind: '%100 alan + bölge vurgusu',
      options: {
        tooltip: { trigger: 'axis', valueFormatter: (value: number) => `%${value}` },
        legend: {},
        xAxis: { type: 'category', data: months, boundaryGap: false },
        yAxis: { type: 'value', max: 100, axisLabel: { formatter: '%{value}' } },
        series: CHANNELS.map((channel, index) => ({
          type: 'line',
          name: channel.name,
          stack: 'share',
          showSymbol: false,
          lineStyle: { width: 1 },
          areaStyle: { opacity: 0.75 },
          data: channel.monthly.map((value, month) => Math.round((value / MONTHLY_REVENUE[month]) * 1000) / 10),
          ...(index === 0
            ? {
                markArea: {
                  silent: true,
                  itemStyle: { color: 'rgba(11, 11, 11, 0.06)' },
                  label: { formatter: t('dash_summer_label'), color: '#52514e', position: 'insideTop' },
                  data: [SUMMER_MONTHS.map((month) => ({ xAxis: formatMonth(month) }))],
                },
              }
            : {}),
        })),
      },
    },
    {
      title: 'dash_share_bar_title',
      note: 'dash_share_bar_note',
      kind: '%100 sütun',
      options: {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (value: number) => `%${value}` },
        legend: {},
        xAxis: { type: 'value', max: 100, axisLabel: { formatter: '%{value}' } },
        yAxis: { type: 'category', data: BRANCH_CHANNEL_SHARES.map((branch) => branch.name) },
        series: CHANNELS.map((channel, index) => ({
          type: 'bar',
          name: channel.name,
          stack: 'share',
          barWidth: '48%',
          itemStyle: { borderColor: '#fff', borderWidth: 1 },
          data: BRANCH_CHANNEL_SHARES.map((branch) => branch.shares[index]),
        })),
      },
    },
    {
      title: 'dash_rose_title',
      note: 'dash_rose_note',
      kind: 'Gül grafiği + erişilebilirlik deseni',
      options: {
        aria: { enabled: true, decal: { show: true } },
        tooltip: {},
        series: [
          {
            type: 'pie',
            name: t('dash_series_tea'),
            roseType: 'radius',
            radius: ['14%', '74%'],
            itemStyle: { borderRadius: 4 },
            data: TEA_SALES.map((value, day) => ({ name: formatWeekday(day), value })),
          },
        ],
      },
    },
    {
      title: 'dash_nested_title',
      note: 'dash_nested_note',
      kind: 'İç içe pasta + kaydırmalı gösterge',
      options: {
        tooltip: {},
        legend: { type: 'scroll', left: 16, right: 16 },
        series: [
          {
            type: 'pie',
            name: t('dash_series_revenue'),
            radius: ['0%', '34%'],
            center: ['50%', '56%'],
            label: { position: 'inner', color: '#fff', fontSize: 11 },
            itemStyle: { borderColor: '#fff', borderWidth: 2 },
            data: MENU.map((category, index) => ({
              name: category.name,
              value: (category.children ?? []).reduce((total, dish) => total + (dish.value ?? 0), 0),
              itemStyle: { color: CHART_COLORS[index] },
            })),
          },
          {
            type: 'pie',
            name: t('dash_series_revenue'),
            radius: ['44%', '68%'],
            center: ['50%', '56%'],
            label: { show: false },
            itemStyle: { borderColor: '#fff', borderWidth: 2 },
            data: MENU.flatMap((category, index) =>
              (category.children ?? []).map((dish) => ({
                name: dish.name,
                value: dish.value,
                itemStyle: { color: CHART_COLORS[index], opacity: 0.75 },
              })),
            ),
          },
        ],
      },
    },
    {
      title: 'dash_bubble_title',
      note: 'dash_bubble_note',
      kind: 'Baloncuk + görsel eşleme',
      options: {
        grid: { right: 32, bottom: 40 },
        tooltip: {
          formatter: ({ name, value }: { name: string; value: number[] }) =>
            `${name}<br>${formatNumber(value[0])} ${t('dash_unit_portions')} · %${value[1]}<br>` +
            `${t('dash_series_revenue')}: ${formatNumber(value[2])}`,
        },
        xAxis: { type: 'value', name: t('dash_axis_sold'), nameLocation: 'middle', nameGap: 28, min: 0 },
        yAxis: { type: 'value', name: t('dash_axis_margin'), min: 30, max: 90 },
        visualMap: {
          type: 'piecewise',
          dimension: 2,
          orient: 'horizontal',
          top: 0,
          left: 'center',
          pieces: [
            { min: 0, max: 899, label: t('dash_band_low'), color: ORDINAL_COLORS[0] },
            { min: 900, max: 1999, label: t('dash_band_mid'), color: ORDINAL_COLORS[2] },
            { min: 2000, label: t('dash_band_high'), color: ORDINAL_COLORS[4] },
          ],
        },
        series: [
          {
            type: 'scatter',
            symbolSize: (value: number[]) => Math.sqrt(value[2]) / 2.4,
            itemStyle: { borderColor: '#fff', borderWidth: 2, opacity: 0.85 },
            data: DISH_PERFORMANCE.map((dish) => ({
              name: dish.name,
              value: [dish.sold, dish.margin, revenueOf(dish.name)],
            })),
          },
        ],
      },
    },
    {
      title: 'dash_force_title',
      note: 'dash_force_note',
      kind: 'Kuvvet yerleşimli ağ + küçük harita',
      wide: true,
      height: '420px',
      options: {
        tooltip: { show: false },
        legend: {},
        thumbnail: { width: '18%', height: '26%' },
        series: [
          {
            type: 'graph',
            layout: 'force',
            roam: true,
            force: { repulsion: 170, edgeLength: [44, 90], gravity: 0.18 },
            categories: [{ name: t('dash_series_dishes') }, { name: t('dash_series_ingredients') }],
            label: { show: true, position: 'right', color: '#52514e' },
            lineStyle: { color: '#c3c2b7', width: 1.5 },
            emphasis: { focus: 'adjacency' },
            data: [
              ...RECIPES.map((recipe) => ({ name: recipe.dish, category: 0, symbolSize: 20 })),
              ...ingredients.map((name) => ({ name, category: 1, symbolSize: 12 })),
            ],
            links: RECIPES.flatMap((recipe) =>
              recipe.ingredients.map((target) => ({ source: recipe.dish, target })),
            ),
          },
        ],
      },
    },
    {
      title: 'dash_matrix_title',
      note: 'dash_matrix_note',
      kind: 'Matris ısı haritası',
      options: {
        tooltip: {
          formatter: ({ value }: { value: [string, string, number] }) => `${value[0]} · ${value[1]}: ${value[2]}`,
        },
        visualMap: {
          min: 70,
          max: 96,
          orient: 'horizontal',
          left: 'center',
          bottom: 0,
          itemHeight: 140,
          itemWidth: 12,
          inRange: { color: SEQUENTIAL_COLORS },
        },
        matrix: {
          top: 8,
          bottom: 48,
          left: 16,
          right: 16,
          x: { data: MENU.map((category) => category.name) },
          y: { data: BRANCHES.map((branch) => branch.name) },
        },
        series: [
          {
            type: 'heatmap',
            coordinateSystem: 'matrix',
            data: SATISFACTION_MATRIX.map(([branch, category, value]) => [category, branch, value]),
            label: { show: true, formatter: ({ value }: { value: unknown[] }) => String(value[2]) },
          },
        ],
      },
    },
    {
      title: 'dash_brush_title',
      note: 'dash_brush_note',
      kind: 'Araç kutusu + fırça',
      options: {
        grid: { right: 32, bottom: 40 },
        tooltip: {
          formatter: ({ name, value }: { name: string; value: number[] }) => `${name}<br>${value[0]} · %${value[1]}`,
        },
        toolbox: {
          right: 16,
          top: 0,
          feature: {
            brush: { title: { rect: t('dash_tool_rect'), polygon: t('dash_tool_polygon'), clear: t('dash_tool_clear') } },
            dataZoom: { title: { zoom: t('dash_tool_zoom'), back: t('dash_tool_back') } },
            restore: { title: t('dash_tool_restore') },
            saveAsImage: { title: t('dash_tool_save') },
          },
        },
        brush: {
          toolbox: ['rect', 'polygon', 'clear'],
          xAxisIndex: 0,
          inBrush: { color: CHART_COLORS[1] },
          outOfBrush: { colorAlpha: 0.2 },
        },
        xAxis: { type: 'value', name: t('dash_axis_sold'), nameLocation: 'middle', nameGap: 28, min: 0 },
        yAxis: { type: 'value', name: t('dash_axis_margin'), min: 30, max: 90 },
        series: [
          {
            type: 'scatter',
            symbolSize: 12,
            itemStyle: { borderColor: '#fff', borderWidth: 2 },
            data: DISH_PERFORMANCE.map((dish) => ({ name: dish.name, value: [dish.sold, dish.margin] })),
          },
        ],
      },
    },
    {
      title: 'dash_transform_title',
      note: 'dash_transform_note',
      kind: 'Veri seti dönüşümü + grafik öğesi',
      options: {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        graphic: {
          type: 'text',
          left: 'center',
          top: 'middle',
          silent: true,
          rotation: Math.PI / 8,
          style: { text: t('dash_watermark'), fontSize: 44, fontWeight: 600, fill: 'rgba(11, 11, 11, 0.06)' },
        },
        dataset: [
          { source: MENU.flatMap((category) => (category.children ?? []).map((dish) => [dish.name, dish.value, category.name])) },
          { transform: { type: 'filter', config: { dimension: 2, value: 'Ana yemek' } } },
          { fromDatasetIndex: 1, transform: { type: 'sort', config: { dimension: 1, order: 'asc' } } },
        ],
        xAxis: { type: 'value' },
        yAxis: { type: 'category' },
        series: [
          {
            type: 'bar',
            name: t('dash_series_revenue'),
            datasetIndex: 2,
            encode: { x: 1, y: 0 },
            barWidth: '56%',
            itemStyle: { borderRadius: [0, 4, 4, 0] },
          },
        ],
      },
    },
  ];
};
