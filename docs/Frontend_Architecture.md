# Frontend Architecture — StarterApp

> **Durum:** Taslak v1 — 2026-10-29
> Bu doküman `client/` projesinin bağlayıcı kurallarıdır. Kod bu dokümana uyar; kural değişecekse önce bu doküman güncellenir.
> Backend kuralları: [Backend_Architecture.md](Backend_Architecture.md). Frontend, backend'in API sözleşmesine (§5) birebir uyar.

---

## 1. Amaç ve öncelik

- Yeni projelerin önyüzü bu iskeletten başlar. Hedeflenen uygulama tipi: tablo ve form ağırlıklı, veri gösterip güncelleyen kurumsal ekranlar.
- Projede birden fazla kişi çalışacak. Bu yüzden **en önemli ölçüt okunabilirlik**: kod tabanına ilk kez bakan biri hangi sayfanın hangisinin altında olduğunu, bir ekranın hangi dosyalardan oluştuğunu tahmin etmeden görebilmeli.

---

## 2. Teknoloji ve sürümler

| Bileşen | Sürüm | Not |
|---|---|---|
| Angular | 22.x | Standalone component'ler, yeni control flow (`@if`, `@for`), signal'ler |
| Node.js | 24 LTS (en az 22.22.3) | Angular 22'nin minimum gereksinimi |
| UI kütüphanesi | PrimeNG 22 + `@primeuix/themes` | Tablo, form, dialog, toast, confirm dialog, menü |
| Grafikler | Apache ECharts 6 + `ngx-echarts` 22 | Apache 2.0 / MIT, ücretsiz; PrimeNG'nin `Chart` bileşeni kullanılmaz (§12) |
| İkonlar | primeicons | |
| State | NgRx 22 (`store`, `effects`, `store-devtools`) | Sadece oturum (§8) |
| Çeviri | ngx-translate 18 + http-loader | TR ve EN |
| Test | Angular CLI'ın varsayılan test altyapısı | Kurulumda netleşir |

ErpStockTracer'dan **taşınmayanlar:** jQuery, AdminLTE, Bootstrap JS, SweetAlert, `form-validate-angular`, `jwt-decode`.
Bunların karşılıkları sırasıyla PrimeNG bileşenleri, Reactive Forms ve NgRx'teki oturum bilgisidir.

---

## 3. Temel kural: klasör = URL = menü

**Klasör ağacı, URL ağacı ve menü ağacı aynıdır.** Birine bakan diğer ikisini bilir.

| Menü (DB) | URL | Klasör |
|---|---|---|
| Tanımlar (`menu_definitions`) | `/definitions` | `pages/definitions/` |
| └ Kategoriler (`menu_categories`) | `/definitions/categories` | `pages/definitions/categories/` |
| Yönetim (`menu_administration`) | `/administration` | `pages/administration/` |
| └ Kullanıcılar (`menu_users`) | `/administration/users` | `pages/administration/users/` |

- Menü kayıtları backend'de migration class'larıyla tutulur; `route` değerleri bu tabloya uyar (bkz. §16).
- Yeni bir sayfa eklenirken üçü birlikte eklenir: klasör, route ve menü kaydı.

---

## 4. Klasör yapısı

```
client/
├─ src/
│  ├─ app/
│  │  ├─ app.ts / app.html            kök component (sadece <router-outlet>)
│  │  ├─ app.config.ts                provider'lar: router, http + interceptor'lar, NgRx, PrimeNG, çeviri
│  │  ├─ app.routes.ts                en üst iskelet: login + shell + modül grupları (§5)
│  │  │
│  │  ├─ core/                        uygulamada tek olan şeyler
│  │  │  ├─ api/                      ApiResponse tipi, API adresleri
│  │  │  ├─ auth/                     NgRx oturum store'u, guard'lar, interceptor'lar, login/refresh servisi
│  │  │  ├─ layout/                   shell (topbar + sidebar + içerik), sidebar menüsü DB'den gelir
│  │  │  └─ errors/                   hata gösterimi (toast)
│  │  │
│  │  ├─ shared/                      sayfaların ortak kullandığı parçalar
│  │  │  ├─ page/                     Page: başlık + otomatik breadcrumb; Section: kart
│  │  │  ├─ charts/                   ortak grafik sarmalayıcısı: tema renkleri, TR biçimleri, yükleniyor/veri yok (§12)
│  │  │  └─ pages/                    not-found, forbidden
│  │  │
│  │  └─ pages/                       URL'nin birebir aynası
│  │     ├─ login/                    /login
│  │     ├─ home/                     /
│  │     ├─ definitions/              /definitions
│  │     │  ├─ definitions.routes.ts
│  │     │  └─ categories/            /definitions/categories
│  │     │     ├─ categories.routes.ts
│  │     │     ├─ category-list/      liste sayfası
│  │     │     ├─ category-form/      ekleme/düzenleme dialog'u
│  │     │     ├─ category-api.ts     HTTP servisi
│  │     │     └─ category.model.ts   backend DTO'larının tipleri
│  │     └─ administration/           /administration (sadece ADMIN)
│  │        ├─ administration.routes.ts
│  │        └─ users/                 /administration/users
│  │
│  ├─ assets/i18n/                    tr.json, en.json
│  └─ styles.css
├─ proxy.conf.json                    dev: /api → http://localhost:8080
├─ nginx.conf                         Docker: SPA + /api yönlendirmesi (§14)
├─ Dockerfile
└─ .dockerignore
```

**Kurallar:**
- **Bir ekranın bütün dosyaları kendi klasöründedir:** component'ler, servis, model ve route dosyası. Bir modülü silmek ya da kopyalamak tek klasör işlemidir.
- `core/` sadece uygulamada **bir kez** olan şeyleri içerir. Bir sayfaya özel kod buraya konmaz.
- `shared/` sadece **birden fazla sayfanın** kullandığı parçaları içerir. Tek bir sayfanın kullandığı bir şey o sayfanın klasöründe kalır.
- ErpStockTracer'daki gibi türe göre klasörler (`components/`, `models/`, `pipes/`, `services/`) **yoktur**.

---

## 5. Routing

### 5.1 Her seviye sadece kendi çocuklarını bilir

```ts
// app.routes.ts: ilk bakışta bütün iskelet
export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login') },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/home/home'), data: { title: 'menu_home' } },
      { path: 'definitions', data: { title: 'menu_definitions' },
        loadChildren: () => import('./pages/definitions/definitions.routes') },
      { path: 'administration', data: { title: 'menu_administration' }, canActivate: [adminGuard],
        loadChildren: () => import('./pages/administration/administration.routes') },
      { path: 'forbidden', loadComponent: () => import('./shared/pages/forbidden') },
    ],
  },
  { path: '**', loadComponent: () => import('./shared/pages/not-found') },
];
```

```ts
// pages/definitions/definitions.routes.ts
export default [
  { path: '', pathMatch: 'full', redirectTo: 'categories' },
  { path: 'categories', data: { title: 'menu_categories' },
    loadChildren: () => import('./categories/categories.routes') },
] satisfies Routes;
```

### 5.2 Kurallar

- **Path'ler kebab-case ve küçük harf:** `/definitions/categories`. ErpStockTracer'daki `Customers`, `RecipeDetails` gibi karışık yazımlar kullanılmaz.
- **Lazy loading:** Her sayfa `loadComponent`, her grup `loadChildren` ile yüklenir; ilk açılış hızlı kalır. Lazy yüklenen dosyalar `export default` kullanır.
- **`data.title`:** Her route'un başlığı bir çeviri anahtarıdır, menüdeki `title_key` ile aynıdır. Sayfa başlığı ve breadcrumb buradan **otomatik** üretilir; sayfalarda elle breadcrumb yazılmaz.
- **Guard'lar:**
  - Giriş kontrolü (`authGuard`) **tek yerde**, shell'de durur. Bütün çocukları korur; her route'a ayrıca yazılmaz.
  - Admin kontrolü (`adminGuard`) admin grubunda durur.
  - Guard'lar sadece kullanıcı deneyimi içindir: yetkisiz kullanıcıya boş ekran yerine 403 sayfası gösterir. Asıl güvenlik backend'dedir (`@PreAuthorize`).
- **Layout dışı sayfalar:** Shell'in dışında sadece `login` ve `**` (404) bulunur. Giriş gerektiren hiçbir sayfa shell'in dışına konmaz. ErpStockTracer'daki `requirements-planning/:id` hatası buradan çıkmıştı.
- **Detay sayfaları:** Detay sayfası ana sayfanın altında yer alır: `/definitions/categories/:id`.

---

## 6. İsimlendirme

- **Dosyalar Angular CLI ile üretilir** (`ng generate component`, `ng generate service`...). İsimlendirme CLI'ın varsayılanına uyar. Angular 20 ve sonrasında CLI `.component` gibi ekler koymaz: `category-list.ts`, `category-list.html`, `category-list.css`, sınıf adı `CategoryList`. Dosyanın türü uzantısından (`.ts` / `.html`) ve klasöründen anlaşılır.
- **Servisler** görevlerini anlatan bir adla üretilir ki modellerle karışmasın: `ng generate service category-api` komutu `category-api.ts` dosyasını, `CategoryApi` sınıfıyla üretir.
- **Modeller** `xxx.model.ts` dosyasında `interface` olarak yazılır ve backend DTO'larıyla birebir aynı alan adlarını kullanır (`CategoryResponse`, `CategoryCreateRequest`, `CategoryUpdateRequest`).
- **Route dosyaları** `xxx.routes.ts` olarak adlandırılır.
- Component selector ön eki `app-`'tir.

---

## 7. Sayfa yapısı

### 7.1 Ortak iskelet

Her sayfa aynı iskeleti kullanır. ErpStockTracer'daki `app-blank` ve `app-section` fikrinin devamıdır:

```html
<app-page>                         <!-- başlık + breadcrumb route ağacından otomatik -->
  <app-section title="category_list_title">
    ... tablo / form ...
  </app-section>
</app-page>
```

### 7.2 CRUD ekranı kalıbı (referans: `pages/definitions/categories`)

- **Liste (`category-list`):**
  - PrimeNG `Table`: sıralama, global arama kutusu ve sütun filtreleri tablonun kendisinde. Entity başına ayrı arama pipe'ı yazılmaz.
  - "Ekle", "Düzenle" ve "Sil" düğmeleri. Silmeden önce `ConfirmDialog` ile onay alınır.
- **Form (`category-form`):** PrimeNG `Dialog` içinde **tek form**, hem ekleme hem düzenleme için.
  - Typed Reactive Forms kullanılır; validation kuralları backend'deki `@NotBlank`/`@Size` kurallarıyla aynıdır.
  - Düzenlemede kaydın `version` değeri formda saklanır ve güncelleme isteğiyle geri gönderilir (backend §4.4).
- **Veri:** Liste ve form verisi component içinde signal'lerle tutulur; NgRx'e konmaz (§8).
- **Servis (`category-api`):** Backend endpoint'lerinin birebir karşılığıdır (`getAll`, `getById`, `create`, `update`, `delete`). `ApiResponse<T>` içinden `data`'yı çıkarıp `Observable<T>` döner.

---

## 8. Oturum ve NgRx

NgRx **sadece oturum** için kullanılır. CRUD ekranlarının verisi component'lerde kalır; böylece her yeni modül için action, reducer ve effect yazmak gerekmez.

### 8.1 State

```ts
interface SessionState {
  status: 'unknown' | 'authenticated' | 'anonymous';   // açılıştaki refresh bitene kadar 'unknown'
  accessToken: string | null;                          // sadece bellekte
  user: SessionUser | null;                            // id, email, fullName, role
  menus: MenuNode[];                                   // sidebar bu ağaçtan çizilir
}
```

- Bu, backend'in `SessionInfo` cevabının birebir karşılığıdır (backend §8.6). Kullanıcıya bağlı yeni bir değer gerektiğinde backend `SessionInfo`'ya ve bu state'e birer alan eklenir.
- **Token `localStorage`'a ya da `sessionStorage`'a yazılmaz.** Refresh token HttpOnly cookie'dedir ve JavaScript onu göremez.

### 8.2 Akışlar

| Ne zaman | Ne olur |
|---|---|
| Uygulama açılışı (F5 dahil) | `POST /api/auth/refresh` çağrılır. Başarılıysa store dolar (`authenticated`), değilse `anonymous` olur. Bu bitene kadar ekranda yükleniyor göstergesi görünür. |
| Login | `POST /api/auth/login`, cevaptaki `SessionInfo` ile store dolar, home'a gidilir |
| Bir istek 401 alırsa | Önce bir kez refresh denenir, istek yeni token'la tekrarlanır. Refresh de başarısızsa store temizlenir ve login'e gidilir. |
| Access token süresi dolmak üzereyken | Refresh ile store güncellenir. Menüler ve kullanıcı bilgisi de tazelenir. |
| Logout | `POST /api/auth/logout`, store temizlenir, login'e gidilir |

- **Tek uçuş (single-flight):** Aynı anda birden fazla istek 401 alırsa sadece **bir** refresh çağrısı yapılır; diğer istekler onun sonucunu bekler.
- Auth endpoint'leri (`/api/auth/*`) `withCredentials: true` ile çağrılır ki cookie gönderilsin.

---

## 9. HTTP ve hata yönetimi

### 9.1 API sözleşmesi

```ts
interface ApiResponse<T> { success: boolean; message: string; data: T | null; traceId: string; }
```

Bütün istekler göreli `/api` adresine gider. Kodda `http://localhost:...` gibi sabit bir adres **bulunmaz**: dev'de `proxy.conf.json`, Docker'da nginx yönlendirir.

### 9.2 Interceptor'lar (sırasıyla)

1. **auth:** Access token'ı `Authorization: Bearer` başlığına ekler. `/api/auth/login|refresh|logout` isteklerine eklemez.
2. **refresh:** 401 alan isteği bir kez refresh edip tekrarlar (§8.2). Auth endpoint'lerinde çalışmaz; böylece sonsuz döngü oluşmaz.
3. **error:** Kalan bütün hataları tek yerde gösterir:
   - `message` anahtarını çevirip PrimeNG `Toast` ile gösterir.
   - Ağ hatasında (sunucuya ulaşılamadığında) genel bir mesaj gösterir.
   - Çevirisi bulunmayan anahtar için `unexpected_error` metnini gösterir.
   - Ekranlar başarılı durumu yazar. Hata durumunda form açık kalır; ekranlar ayrıca hata kodu yazmaz.

### 9.3 Status'a göre davranış

| Status | Davranış |
|---|---|
| 400, 422 | Toast'ta çevrilmiş mesaj; form açık kalır |
| 401 | Refresh dene, olmazsa login (toast yok) |
| 403 | Toast `access_denied` |
| 404 | Toast `record_not_found` (sayfa içindeki istekler için) |
| 409 `record_modified` | Toast ve listeyi yeniden yükleme önerisi |
| 429 | Toast `auth_login_blocked` |
| 500 ve ağ hatası | Toast `unexpected_error` |

Başarılı işlemlerde (`record_created`, `record_updated`, `record_deleted`) kısa bir başarı toast'u gösterilir.

---

## 10. Çeviri (i18n)

- ngx-translate kullanılır; dosyalar `src/assets/i18n/tr.json` ve `en.json`. Varsayılan dil Türkçedir.
- **Backend'in gönderdiği bütün anahtarlar** (`category_name_exists`, `auth_login_blocked`, menülerdeki `menu_categories`...) bu dosyalarda bulunmalıdır.
- Arayüz metinleri de anahtarla yazılır; HTML'de sabit Türkçe metin bulunmaz. Yazım backend'le aynıdır: düz, snake_case, ekran adıyla başlayan anahtarlar (`category_list_title`, `common_save`, `common_cancel`).
- Parametre gereken metinler çeviri dosyasındadır (ör. `"category_name_too_long": "Kategori adı en fazla 100 karakter olabilir"`).

---

## 11. Görünüm

- PrimeNG'nin hazır temalarından biri (`@primeuix/themes`) kullanılır; renkler tema değişkenleriyle özelleştirilir.
- **Shell:** üstte topbar (uygulama adı, kullanıcı adı ve rolü, dil seçimi, şifre değiştirme, çıkış), solda sidebar (DB'den gelen menü ağacı), sağda içerik alanı.
- Ekran dar olduğunda sidebar açılır kapanır bir panele dönüşür.
- `styles.css` sadece genel ayarları içerir; component stilleri kendi `.css` dosyasındadır.

---

## 12. Grafikler

Uygulamalarda çok sayıda grafik kullanılacak. Bu yüzden grafikler için tek bir kütüphane ve tek bir kalıp vardır.

- **Kütüphane:** Apache ECharts (`ngx-echarts`). Projede ikinci bir grafik kütüphanesi bulunmaz; PrimeNG'nin `Chart` bileşeni kullanılmaz.
- **Ortak sarmalayıcı (`shared/charts/`):** Sayfalar ECharts'ı doğrudan değil, bu sarmalayıcı üzerinden kullanır. Sarmalayıcının işleri:
  - Renkleri PrimeNG temasından alıp bütün grafiklere uygular.
  - Sayı ve tarihleri Türkçe biçimde gösterir.
  - "Yükleniyor" ve "veri yok" durumlarını tek tip gösterir.
  - Pencere boyutu değişince grafiği yeniden boyutlandırır.
- Sayfa sadece veriyi ve grafik türünü verir. 50 grafik de olsa hepsi aynı görünür.
- **Paket boyutu:** ECharts'ın sadece kullanılan grafik türleri ve bileşenleri yüklenir (tree-shaking). Lazy loading sayesinde grafik kodu yalnızca grafiğin olduğu sayfa açılınca iner.
- **Veri:** Grafikler ham kayıtlarla değil, backend'in özet döndüren rapor endpoint'leriyle beslenir (backend §5.5). Frontend'de toplama ya da gruplama yapılmaz.
- **Örnek:** Anasayfadaki "son 30 günde eklenen kategoriler" grafiği referans kalıptır. Yeni rapor ekranları bu örnekten kopyalanır.

---

## 13. Ekranlar (iskeletteki kapsam)

| Ekran | URL | Kimler |
|---|---|---|
| Login | `/login` | Herkes |
| Anasayfa | `/` | Giriş yapmış herkes: karşılama ve örnek grafik (§12) |
| Kategoriler (referans CRUD) | `/definitions/categories` | Giriş yapmış herkes |
| Kullanıcılar | `/administration/users` | ADMIN: liste, ekleme, düzenleme (rol, aktif/pasif), şifre sıfırlama, silme |
| Şifremi değiştir | topbar'dan dialog | Giriş yapmış herkes |
| 403 / 404 | `/forbidden`, `**` | |

---

## 14. Docker

- **Multi-stage Dockerfile:** `node:24-alpine` imajında `ng build` yapılır, çıkan dosyalar `nginx:alpine` imajına kopyalanır.
- Container'daki nginx **sadece dosya sunucusu ve yönlendirici** olarak çalışır (`client/nginx.conf`):
  - Bilinmeyen yollar `index.html`'e düşer; böylece `/definitions/categories` sayfasında F5'e basınca 404 alınmaz.
  - `/api/` istekleri `server:8080` adresine yönlendirilir. Tarayıcı frontend ve backend'i aynı adreste görür: CORS gerekmez, `SameSite=Strict` cookie sorunsuz çalışır.
  - Gerçek istemci IP'si `X-Forwarded-For` başlığıyla backend'e iletilir. Compose'da server'a `FORWARD_HEADERS_STRATEGY=native` verilir; brute-force anahtarı (`IP_email`) böylece doğru IP'yi kullanır.
  - Hash'li JS ve CSS dosyaları uzun süre önbelleğe alınır, `index.html` ise hiç alınmaz.
- Repo kökündeki `docker-compose.yml`'ye `client` servisi eklenir (`app` profili). Erişim adresi: `http://localhost:4200`.

---

## 15. Geliştirme ortamı

- `npm start` komutu `ng serve`'i `proxy.conf.json` ile çalıştırır; `/api` istekleri `http://localhost:8080`'e gider.
- Backend dev profilinde çalışırken frontend `http://localhost:4200` adresinden açılır.

---

## 16. Backend'e etkisi

- Menü route'ları hiyerarşik hale getirilir: `/categories` → `/definitions/categories`, `/users` → `/administration/users`. Uygulanmış migration'lar değiştirilmeyeceği için bu yeni bir migration'la yapılır (`V005_HierarchicalMenuRoutes`).
- Grup menülerine (`menu_definitions`, `menu_administration`) de kendi route'ları verilir (`/definitions`, `/administration`).
- Anasayfa da DB'deki menüye eklenir (`menu_home`, `/`); böylece sidebar tamamen DB'den gelir.
- Anasayfadaki örnek grafik için örnek bir rapor endpoint'i eklenir: `GET /api/reports/categories-created?days=30`. Son 30 günde eklenen kategorileri, Türkiye saatine göre güne gruplanmış olarak döner. Kural için bkz. backend §5.5.

---

## 17. Yeni sayfa ekleme (özet)

1. **Klasör:** `pages/definitions/categories` kopyalanıp yeni ada göre değiştirilir (ör. `pages/definitions/products`).
2. **Route:** Üst seviyedeki `xxx.routes.ts` dosyasına yeni çocuk eklenir; `data.title` olarak menüdeki `title_key` verilir.
3. **Model ve servis:** Backend DTO'larına göre güncellenir.
4. **Çeviriler:** Yeni modülün mesaj anahtarları ve arayüz metinleri `tr.json` ve `en.json`'a eklenir.
5. **Menü:** Backend'de yeni bir migration class'ıyla menü kaydı eklenir; `route` değeri klasör yoluyla aynıdır.

---

## 18. Kapsam dışı / sonraya bırakılanlar

- Sayfalama (backend'le birlikte)
- Gerçek dashboard içerikleri (iskelette sadece bir örnek grafik var)
- Karanlık tema seçimi
- E2E testler
