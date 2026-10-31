import { afterNextRender, Component, DestroyRef, ElementRef, inject, input, viewChild } from '@angular/core';

const BASE_MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
const WORKER_URL = '/vendor/maplibre-gl-worker.mjs';
const STYLESHEET_ID = 'maplibre-css';
const TURKISH_LABEL = ['coalesce', ['get', 'name:tr'], ['get', 'name']];

export interface MapView {
  center: [number, number];
  zoom: number;
  pitch?: number;
  bearing?: number;
}

/** time: harita açıldığından beri geçen saniye; sadece animasyonlu haritalarda değişir. */
export type LayerFactory = (time: number) => unknown[];

export type MapTooltip = (item: unknown) => string | null;

function loadStylesheet(): void {
  if (document.getElementById(STYLESHEET_ID)) {
    return;
  }
  const link = document.createElement('link');
  link.id = STYLESHEET_ID;
  link.rel = 'stylesheet';
  link.href = '/vendor/maplibre-gl.css';
  document.head.append(link);
}

/**
 * Coğrafi grafikler: altlık harita MapLibre, üstündeki katmanlar deck.gl.
 * ECharts'ın karşılayamadığı sokak ölçeğindeki haritalar içindir; il ve bölge haritası için <app-chart> yeterlidir.
 * Paketler büyük olduğu için ilk harita açılınca indirilir.
 *
 *   <app-deck-map [view]="view" [layers]="layers" />
 */
@Component({
  selector: 'app-deck-map',
  template: `<div #host class="map" [style.height]="height()"></div>`,
  styles: `
    .map {
      width: 100%;
      border-radius: 6px;
      overflow: hidden;
    }
  `,
})
export class DeckMap {
  readonly view = input.required<MapView>();
  readonly layers = input.required<LayerFactory>();
  readonly animated = input(false);
  readonly tooltip = input<MapTooltip>();
  readonly height = input('340px');

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private destroyed = false;
  private frame = 0;
  private map: { remove(): void } | null = null;

  constructor() {
    afterNextRender(() => void this.start());
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      cancelAnimationFrame(this.frame);
      this.map?.remove();
    });
  }

  private async start(): Promise<void> {
    loadStylesheet();
    const [{ Map, NavigationControl, setWorkerUrl }, { MapLibreOverlay }] = await Promise.all([
      import('maplibre-gl'),
      import('@deck.gl/maplibre'),
    ]);
    if (this.destroyed) {
      return;
    }
    // Paketleyici worker dosyasını taşımaz; angular.json onu /vendor altına kopyalar.
    setWorkerUrl(WORKER_URL);

    const map = new Map({ container: this.host().nativeElement, style: BASE_MAP_STYLE, ...this.view() });
    map.addControl(new NavigationControl({ showCompass: false }));
    // Altlık haritanın etiketleri varsa Türkçe, yoksa yerel adıyla yazılır.
    map.on('style.load', () => {
      for (const layer of map.getStyle().layers) {
        // Yol numarası tabelaları isim değil kod gösterir, onlara dokunulmaz.
        if (layer.type === 'symbol' && JSON.stringify(layer.layout?.['text-field'] ?? '').includes('name')) {
          map.setLayoutProperty(layer.id, 'text-field', TURKISH_LABEL as never);
        }
      }
    });
    this.map = map;

    const tooltip = this.tooltip();
    const overlay = new MapLibreOverlay({
      interleaved: true,
      layers: this.layers()(0) as never,
      getTooltip: tooltip ? ({ object }) => (object ? tooltip(object) : null) : undefined,
    });
    map.addControl(overlay as never);

    if (this.animated()) {
      const startedAt = performance.now();
      const tick = () => {
        overlay.setProps({ layers: this.layers()((performance.now() - startedAt) / 1000) as never });
        this.frame = requestAnimationFrame(tick);
      };
      this.frame = requestAnimationFrame(tick);
    }
  }
}
