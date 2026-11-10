# client

StarterApp'in Angular önyüzü. Bağlayıcı kurallar ve tasarım kararları:
[docs/Frontend_Architecture.md](../docs/Frontend_Architecture.md).

| | |
|---|---|
| Angular | 22 (standalone, signal'ler, zoneless) |
| UI | NG-ZORRO 22 (Ant Design, MIT) |
| State | NgRx 22 (sadece oturum) |
| Metinler | ngx-translate (sadece Türkçe) |
| Node.js | 26 LTS (en az 22.22.3) |

## Çalıştırma

Önce backend'i dev profiliyle başlatın (bkz. [server/README.md](../server/README.md)). Sonra:

```bash
npm install
npm start
```

`http://localhost:4200` adresinden açılır (`/` public, `/user` Mezun Portalı, `/admin` yönetim paneli; iki yüzey birlikte).
Gerçek build'ler gibi tek yüzey için: `npm run start:public` (4200) ya da `npm run start:internal` (4300). Build:
`npm run build:public`, `npm run build:internal`. Dışarıya açık build'e yönetim panelinin kodu hiç girmez
(`src/app/surface/`, Frontend_Architecture.md §3). `/api` istekleri `proxy.conf.json` ile `http://localhost:8080`'e gider.
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
├─ shared/    page + section iskeleti, form yardımcıları, 403/404, tema bileşenleri (theme/), ortak program verisi (program/), Türkçe biçim pipe'ları (format/)
└─ pages/     URL'nin aynası: public (/), login, admin/ (yönetim paneli: home, definitions/categories, administration/users), user/ (Mezun Portalı)
```

Ortak tema (Göç İdaresi kırmızısı + lacivert, `.card`/`.btn`/`.tag` sınıfları, NG-ZORRO ana rengi) `src/theme.css`'tedir; public, portal ve yönetim paneli aynı temayı kullanır.

## Yeni sayfa ekleme

Referans modül `src/app/pages/admin/definitions/categories`'dir. Örnek olarak `Ürünler`:

1. `pages/admin/definitions/categories` klasörünü `pages/admin/definitions/products` olarak kopyalayın; dosya, sınıf ve selector adlarını değiştirin.
2. `pages/admin/definitions/definitions.routes.ts`'e yeni çocuğu ekleyin: `{ path: 'products', data: { title: 'menu_products' }, loadChildren: ... }`.
3. `product.model.ts`'i backend DTO'larına, `product-api.ts`'i backend endpoint'lerine göre güncelleyin.
4. Form doğrulamasını backend'deki `@NotBlank`/`@Size` kurallarıyla aynı yapın; hata metinleri aynı anahtarları kullanır.
5. Yeni anahtarları `public/i18n/tr.json`'a ekleyin.
6. Backend'de menü kaydını yeni bir migration class'ıyla ekleyin (`route: '/admin/definitions/products'`).
   Yeni bir ikon kullanıyorsanız `src/app/core/icons.ts`'e de ekleyin.

Component'ler CLI ile üretilir: `npx ng generate component pages/admin/definitions/products/product-list`.

## Docker

`client/Dockerfile` uygulamayı build edip nginx ile sunar; nginx `/api` isteklerini server container'ına iletir.
Repo kökünde: `docker compose --profile app up -d` → `http://localhost:4200` (dışarıya açık yüzey) ve
`http://localhost:4300` (kapalı ağ yüzeyi). İmaj yüzeyi `SURFACE` build argümanıyla seçilir:
`docker build --build-arg SURFACE=public .` ya da `--build-arg SURFACE=internal`. nginx ayarları `nginx/` altındadır.

## Yerel otomatik giriş

`npm start` ile çalışırken login ekranı atlanır: server dev profilindeyse `ADMIN_EMAIL` kullanıcısıyla otomatik giriş yapılır.
Login ekranını görmek için adresi `/login` yapın. Docker ile çalışan uygulamada ve prod'da bu özellik yoktur.
