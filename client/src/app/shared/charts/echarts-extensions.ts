import { echarts } from './echarts-setup';

const SCRIPTS = ['echarts-gl.min.js', 'echarts-liquidfill.min.js', 'echarts-wordcloud.min.js'];

function loadScript(file: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `/vendor/${file}`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Could not load ${file}`));
    document.head.append(script);
  });
}

let loading: Promise<unknown> | null = null;

/**
 * ECharts'ın ana paketinde olmayan türler: 3B/WebGL, kelime bulutu, sıvı dolum.
 * Bu paketler ECharts 6 ile npm üzerinden derlenemiyor: kaynakları iç dosyalara ulaşamıyor, dist/ dosyaları ise
 * paketlenince ECharts'ın ayrı bir kopyasına kayıt oluyor. Bu yüzden angular.json onları /vendor altına kopyalar,
 * burada script olarak yüklenir ve window.echarts üzerinden uygulamadaki ECharts'a kayıt olurlar.
 * Çok yer kapladıkları için ilk yüklemeye girmezler; sadece kullanan ekran çağırır.
 */
export function loadEchartsExtensions(): Promise<unknown> {
  (window as unknown as { echarts: typeof echarts }).echarts = echarts;
  loading ??= Promise.all(SCRIPTS.map(loadScript));
  return loading;
}
