# client

StarterApp'in Angular önyüzü. Bağlayıcı kurallar ve tasarım kararları:
[docs/Frontend_Architecture.md](../docs/Frontend_Architecture.md).

| | |
|---|---|
| Angular | 22 (standalone, signal'ler, zoneless) |
| UI | NG-ZORRO 22 (Ant Design, MIT) |
| Grafikler | Apache ECharts 6 (`ngx-echarts`) |
| State | NgRx 22 (sadece oturum) |
| Çeviri | ngx-translate (TR / EN) |
| Node.js | 26 LTS (en az 22.22.3) |

## Çalıştırma

Önce backend'i dev profiliyle başlatın (bkz. [server/README.md](../server/README.md)). Sonra:

```bash
npm install
npm start
```

`http://localhost:4200` adresinden açılır. `/api` istekleri `proxy.conf.json` ile `http://localhost:8080`'e gider.
Giriş bilgileri backend'in ilk admin kullanıcısıdır (`server/.env` → `ADMIN_EMAIL`, `ADMIN_PASSWORD`).

## Test ve build

```bash
npx ng test --watch=false
npx ng build
```

## Klasör = URL = menü

```
src/app/
├─ core/      oturum (NgRx), interceptor'lar, layout, bildirimler, dil, ikonlar
├─ shared/    page + section iskeleti, grafik sarmalayıcısı, form yardımcıları, 403/404
└─ pages/     URL'nin aynası: login, home, definitions/categories, administration/users
```

## Yeni sayfa ekleme

Referans modül `src/app/pages/definitions/categories`'dir. Örnek olarak `Ürünler`:

1. `pages/definitions/categories` klasörünü `pages/definitions/products` olarak kopyalayın; dosya, sınıf ve selector adlarını değiştirin.
2. `pages/definitions/definitions.routes.ts`'e yeni çocuğu ekleyin: `{ path: 'products', data: { title: 'menu_products' }, loadChildren: ... }`.
3. `product.model.ts`'i backend DTO'larına, `product-api.ts`'i backend endpoint'lerine göre güncelleyin.
4. Form doğrulamasını backend'deki `@NotBlank`/`@Size` kurallarıyla aynı yapın; hata metinleri aynı anahtarları kullanır.
5. Yeni anahtarları `public/i18n/tr.json` ve `en.json`'a ekleyin (`npx ng test` eksik anahtarı yakalar).
6. Backend'de menü kaydını yeni bir migration class'ıyla ekleyin (`route: '/definitions/products'`).
   Yeni bir ikon kullanıyorsanız `src/app/core/icons.ts`'e de ekleyin.

Component'ler CLI ile üretilir: `npx ng generate component pages/definitions/products/product-list`.

## Docker

`client/Dockerfile` uygulamayı build edip nginx ile sunar; nginx `/api` isteklerini server container'ına iletir.
Repo kökünde: `docker compose --profile app up -d` → `http://localhost:4200`.

## Yerel otomatik giriş

`npm start` ile çalışırken login ekranı atlanır: server dev profilindeyse `ADMIN_EMAIL` kullanıcısıyla otomatik giriş yapılır.
Login ekranını görmek için adresi `/login` yapın. Docker ile çalışan uygulamada ve prod'da bu özellik yoktur.
