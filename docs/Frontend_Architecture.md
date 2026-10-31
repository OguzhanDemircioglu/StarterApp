# Frontend Architecture — StarterApp

> **Durum:** v2 — 2026-10-29 (client iskeletiyle senkron)
> Bu doküman `client/` projesinin bağlayıcı kurallarıdır. Kod bu dokümana uyar; kural değişecekse önce bu doküman güncellenir.
> Backend kuralları: [Backend_Architecture.md](Backend_Architecture.md). Frontend, backend'in API sözleşmesine (§5) birebir uyar.

---

## 1. Amaç ve öncelik

- Yeni projelerin önyüzü bu iskeletten başlar. Hedeflenen uygulama tipi: tablo, form ve grafik ağırlıklı, veri gösterip güncelleyen kurumsal ekranlar.
- Projede birden fazla kişi çalışacak. Bu yüzden **en önemli ölçüt okunabilirlik**: kod tabanına ilk kez bakan biri hangi sayfanın hangisinin altında olduğunu, bir ekranın hangi dosyalardan oluştuğunu tahmin etmeden görebilmeli.

---

## 2. Teknoloji ve sürümler

| Bileşen | Sürüm | Not |
|---|---|---|
| Angular | 22.x | Standalone component'ler, `@if`/`@for`, signal'ler, zoneless (zone.js yok) |
| Node.js | 26 LTS (en az 22.22.3 / 24.15) | Angular 22'nin minimum gereksinimi |
| UI kütüphanesi | NG-ZORRO 22 (Ant Design) | **MIT**, şirket büyüklüğünden bağımsız ücretsiz |
| İkonlar | `@ant-design/icons-angular` (NG-ZORRO ile gelir) | Sadece kayıtlı ikonlar pakete girer (§11) |
| Grafikler | Apache ECharts 6 + `ngx-echarts` 22 | Apache 2.0 / MIT, ücretsiz (§12) |
| State | NgRx 22 (`store`, `effects`, `store-devtools`) | Sadece oturum (§8) |
| Çeviri | ngx-translate 18 + http-loader | TR ve EN (§10) |
| Test | Vitest (Angular CLI'ın varsayılanı) | `npx ng test` |

**Neden PrimeNG değil:** PrimeNG 2026'dan itibaren ticari lisansa geçti. Ücretsiz Community License yalnızca 5'ten az geliştiricili, 10'dan az çalışanlı ve 1 milyon dolardan az gelirli kuruluşlar için geçerli; diğerleri geliştirici başına ücret ödüyor ve paket bir lisans anahtarı istiyor. NG-ZORRO ve Angular Material MIT lisanslı; tablo ve form ağırlıklı ekranlara daha uygun olduğu için NG-ZORRO seçildi.

ErpStockTracer'dan **taşınmayanlar:** jQuery, AdminLTE, Bootstrap JS, SweetAlert, `form-validate-angular`, `jwt-decode`. Karşılıkları NG-ZORRO bileşenleri, Reactive Forms ve NgRx'teki oturum bilgisidir.

---

## 3. Temel kural: klasör = URL = menü

**Klasör ağacı, URL ağacı ve menü ağacı aynıdır.** Birine bakan diğer ikisini bilir.

| Menü (DB) | URL | Klasör |
|---|---|---|
| Anasayfa (`menu_home`) | `/` | `pages/home/` |
| Tanımlar (`menu_definitions`) | `/definitions` | `pages/definitions/` |
| └ Kategoriler (`menu_categories`) | `/definitions/categories` | `pages/definitions/categories/` |
| Yönetim (`menu_administration`) | `/administration` | `pages/administration/` |
| └ Kullanıcılar (`menu_users`) | `/administration/users` | `pages/administration/users/` |

- Menü kayıtları backend'de migration class'larıyla tutulur (`V005_HierarchicalMenuRoutes`); `route` değerleri bu tabloya uyar.
- Yeni bir sayfa eklenirken üçü birlikte eklenir: klasör, route ve menü kaydı.

---

## 4. Klasör yapısı

```
client/
├─ public/
│  └─ i18n/                            tr.json, en.json (§10)
├─ src/
│  ├─ main.ts, index.html, styles.css
│  └─ app/
│     ├─ app.ts                        kök component (sadece <router-outlet />)
│     ├─ app.config.ts                 provider'lar: router, http + interceptor'lar, NgRx, çeviri, NG-ZORRO
│     ├─ app.routes.ts                 en üst iskelet: login + shell + modül grupları (§5)
│     │
│     ├─ core/                         uygulamada tek olan şeyler
│     │  ├─ api/                       ApiResponse tipi, unwrap(), API_URL
│     │  ├─ auth/                      oturum: NgRx store, effects, guard'lar, authInterceptor,
│     │  │                             TokenRefresher (tek uçuş refresh), şifre değiştirme dialog'u
│     │  ├─ layout/                    shell, sidebar-menu (DB'den), topbar
│     │  ├─ notify/                    Notifier (bildirimler), errorInterceptor
│     │  ├─ i18n/                      LanguageService (TR/EN)
│     │  └─ icons.ts                   kayıtlı ikonlar (§11)
│     │
│     ├─ shared/                       sayfaların ortak kullandığı parçalar
│     │  ├─ page/                      Page (başlık + otomatik breadcrumb), Section (kart)
│     │  ├─ charts/                    Chart sarmalayıcısı, ECharts kurulumu, biçimlendirme (§12)
│     │  ├─ forms/                     validateForm, maxBytes, sameAs
│     │  └─ pages/                     forbidden (403), not-found (404)
│     │
│     └─ pages/                        URL'nin birebir aynası
│        ├─ login/                     /login
│        ├─ home/                      /            (örnek grafik + rapor servisi)
│        ├─ definitions/               /definitions
│        │  ├─ definitions.routes.ts
│        │  └─ categories/             /definitions/categories   ← REFERANS MODÜL
│        │     ├─ categories.routes.ts
│        │     ├─ category-list/       liste sayfası
│        │     ├─ category-form/       ekleme/düzenleme dialog'u
│        │     ├─ category-api.ts      HTTP servisi
│        │     └─ category.model.ts    backend DTO'larının tipleri
│        └─ administration/            /administration (sadece ADMIN)
│           ├─ administration.routes.ts
│           └─ users/                  /administration/users
├─ proxy.conf.json                     dev: /api → http://localhost:8080
├─ nginx.conf                          Docker: SPA + /api yönlendirmesi (§14)
├─ Dockerfile
└─ .dockerignore
```

**Kurallar:**
- **Bir ekranın bütün dosyaları kendi klasöründedir:** component'ler, servis, model ve route dosyası. Bir modülü silmek ya da kopyalamak tek klasör işlemidir.
- `core/` sadece uygulamada **bir kez** olan şeyleri içerir. Bir sayfaya özel kod buraya konmaz.
- `shared/` sadece **birden fazla sayfanın** kullandığı parçaları içerir. Tek bir sayfanın kullandığı bir şey o sayfanın klasöründe kalır.
- Türe göre klasörler (`components/`, `models/`, `pipes/`, `services/`) **yoktur**.

---

## 5. Routing

### 5.1 Her seviye sadece kendi çocuklarını bilir

```ts
// app.routes.ts: ilk bakışta bütün iskelet
export const routes: Routes = [
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./pages/login/login') },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', data: { title: 'menu_home' }, loadComponent: () => import('./pages/home/home') },
      { path: 'definitions', data: { title: 'menu_definitions' },
        loadChildren: () => import('./pages/definitions/definitions.routes') },
      { path: 'administration', data: { title: 'menu_administration' }, canActivate: [adminGuard],
        loadChildren: () => import('./pages/administration/administration.routes') },
      { path: 'forbidden', data: { title: 'page_forbidden_title' }, loadComponent: () => import('./shared/pages/forbidden') },
      { path: '**', data: { title: 'page_not_found_title' }, loadComponent: () => import('./shared/pages/not-found') },
    ],
  },
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

- **Path'ler kebab-case ve küçük harf:** `/definitions/categories`.
- **Lazy loading:** Her sayfa `loadComponent`, her grup `loadChildren` ile yüklenir. Lazy yüklenen dosyalar `export default` kullanır.
- **`data.title`:** Her route'un başlığı bir çeviri anahtarıdır, menüdeki `title_key` ile aynıdır. Sayfa başlığı ve breadcrumb buradan **otomatik** üretilir (`shared/page/breadcrumb.ts`); sayfalarda elle breadcrumb yazılmaz.
- **Guard'lar** (`core/auth/auth.guards.ts`):
  - `authGuard` **tek yerde**, shell'de durur ve bütün iç sayfaları korur. Giriş yoksa `returnUrl` ile login'e gönderir; girişten sonra o sayfaya dönülür.
  - `adminGuard` yönetim grubunda durur; yetkisiz kullanıcıyı `/forbidden`'a gönderir.
  - `guestGuard` login sayfasında durur; giriş yapmış kullanıcıyı anasayfaya gönderir.
  - Guard'lar sadece kullanıcı deneyimi içindir. Asıl güvenlik backend'dedir (`@PreAuthorize`).
- **Shell'in dışında sadece login vardır.** 404 ve 403 sayfaları da shell içindedir; kullanıcı menüyü kaybetmez.
- **Detay sayfaları** ana sayfanın altında yer alır: `/definitions/categories/:id`. Route parametreleri component'e `input()` olarak gelir (`withComponentInputBinding`).

---

## 6. İsimlendirme

- **Dosyalar Angular CLI ile üretilir** (`ng generate component`, `ng generate service`...) ve CLI'ın varsayılanına uyar. Angular 22 CLI ek koymaz: `category-list.ts`, `category-list.html`, `category-list.css`, sınıf adı `CategoryList`.
- **Servisler** görevini anlatan bir adla üretilir ki modellerle karışmasın: `ng generate service category-api` → `category-api.ts`, `CategoryApi`.
- **Modeller** `xxx.model.ts` dosyasında `interface` olarak yazılır ve backend DTO'larıyla birebir aynı alan adlarını kullanır.
- **Route dosyaları** `xxx.routes.ts` olarak adlandırılır.
- Component selector ön eki `app-`'tir. Sayfa component'lerinin selector'ı yoktur (route ile yüklenir).

---

## 7. Sayfa yapısı

### 7.1 Ortak iskelet

```html
<app-page>                                  <!-- breadcrumb + başlık, route ağacından otomatik -->
  <app-section title="category_list_title"> <!-- NG-ZORRO kartı; başlık çeviri anahtarı -->
    <div sectionActions class="section-actions"> ...arama, yenile, ekle... </div>
    ...tablo...
  </app-section>
</app-page>
```

### 7.2 CRUD ekranı kalıbı (referans: `pages/definitions/categories`)

- **Liste (`category-list`):**
  - `nz-table`: sıralama sütun başlığında (`nzSortFn`), sayfalama tablonun kendisinde.
  - Arama tek bir `computed` ile yapılır; entity başına ayrı arama pipe'ı yazılmaz.
  - Silme `nz-popconfirm` ile onay alınarak yapılır.
- **Form (`category-form`):** `nz-modal` içinde **tek form**, hem ekleme hem düzenleme için.
  - Liste şablonunda açıkça görünür: `<app-category-form [(open)]="formOpen" [category]="editing()" (saved)="load()" />`.
  - Typed Reactive Forms kullanılır. Doğrulama kuralları ve hata metinlerinin anahtarları backend'deki `@NotBlank`/`@Size` kurallarıyla aynıdır (`category_name_required`...).
  - Düzenlemede kaydın `version` değeri güncelleme isteğiyle geri gönderilir; bu arada değiştiyse 409 `record_modified` gelir.
  - Hata durumunda form açık kalır; mesajı errorInterceptor gösterir.
- **Veri:** Liste ve form verisi component içinde signal'lerle tutulur; NgRx'e konmaz (§8).
- **Servis (`category-api`):** Backend endpoint'lerinin birebir karşılığıdır. `unwrap()` ile `ApiResponse<T>` içinden `data`'yı çıkarıp `Observable<T>` döner.

---

## 8. Oturum ve NgRx

NgRx **sadece oturum** için kullanılır (`core/auth/session.*`). CRUD ekranlarının verisi component'lerde kalır; böylece her yeni modül için action, reducer ve effect yazmak gerekmez.

### 8.1 State

```ts
interface SessionState {
  status: 'unknown' | 'authenticated' | 'anonymous';   // açılıştaki sessiz giriş bitene kadar 'unknown'
  accessToken: string | null;                          // sadece bellekte
  expiresIn: number;
  user: SessionUser | null;                            // id, email, fullName, role
  menus: MenuNode[];                                   // sidebar bu ağaçtan çizilir
  loginPending: boolean;
}
```

- Bu, backend'in `SessionInfo` cevabının karşılığıdır (backend §8.6). Kullanıcıya bağlı yeni bir değer gerektiğinde backend `SessionInfo`'ya ve bu state'e birer alan eklenir.
- **Token `localStorage`'a ya da `sessionStorage`'a yazılmaz.** Refresh token HttpOnly cookie'dedir ve JavaScript onu göremez.

### 8.2 Akışlar

| Ne zaman | Ne olur |
|---|---|
| Uygulama açılışı (F5 dahil) | `provideAppInitializer` içinde `POST /api/auth/refresh` çağrılır. Başarılıysa store dolar, değilse `anonymous` olur. Uygulama bu bitmeden başlamaz. |
| Login | `POST /api/auth/login`, store dolar, `returnUrl`'e (yoksa `/`) gidilir. Başka sitelere yönlendirme engellenir (`safeReturnUrl`). |
| Kayıt | `POST /api/auth/register`, başarılıysa aynı bilgilerle Login akışına geçilir. |
| Bir istek 401 alırsa | `authInterceptor` bir kez refresh dener ve isteği yeni token'la tekrarlar. Refresh de başarısızsa store temizlenir ve login'e gidilir. |
| Access token süresi dolmadan 60 sn önce | Refresh ile store güncellenir; menüler ve kullanıcı bilgisi de tazelenir. |
| Logout | `POST /api/auth/logout`, store temizlenir, login'e gidilir. |

- **Tek uçuş (single-flight):** Aynı anda birden fazla istek 401 alırsa sadece **bir** refresh çağrısı yapılır, diğerleri onun sonucunu bekler (`TokenRefresher`). Bu davranış testle korunur.
- Cookie ile çalışan auth endpoint'leri (`login`, `refresh`, `logout`) `withCredentials: true` ile çağrılır ve Authorization başlığı taşımaz.

---

## 9. HTTP ve hata yönetimi

### 9.1 API sözleşmesi

```ts
interface ApiResponse<T> { success: boolean; message: string; data: T; traceId: string; }
```

Bütün istekler göreli `/api` adresine gider. Kodda sabit bir sunucu adresi **bulunmaz**: dev'de `proxy.conf.json`, Docker'da nginx yönlendirir.

### 9.2 Interceptor'lar

`provideHttpClient(withInterceptors([errorInterceptor, authInterceptor]))`. Sıra önemlidir:

1. **`authInterceptor`** (içte): Token'ı ekler; 401 alan isteği bir kez refresh edip tekrarlar.
2. **`errorInterceptor`** (dışta): Refresh denemesinden sonra kalan hataları tek yerde gösterir.
   - `message` anahtarını çevirip NG-ZORRO mesajı olarak gösterir.
   - Ağ hatasında `common_network_error` gösterir.
   - Anahtar formatında olmayan cevaplarda (ör. HTML hata sayfası) ve çevirisi bulunmayan anahtarlarda `unexpected_error` gösterir; ekrana ham metin çıkmaz.
   - 401'leri yalnızca login isteğinde gösterir; diğer 401'leri oturum akışı yönetir.

Ekranlar sadece başarılı durumu yazar (`notifier.success('record_created')`). Hata durumunda form açık kalır.

Çeviri dosyaları interceptor'lardan geçmez (`useHttpBackend: true`): token gerekmez, ayrıca errorInterceptor çeviri servisini kullandığı için aksi halde döngüsel bağımlılık oluşur.

### 9.3 Status'a göre davranış

| Status | Davranış |
|---|---|
| 400, 422 | Çevrilmiş mesaj; form açık kalır |
| 401 | Refresh dene, olmazsa login (mesaj yok; login isteğinde `auth_invalid_credentials`) |
| 403 | `access_denied` |
| 404 | `record_not_found` |
| 409 | `record_modified` ("listeyi yenileyip tekrar deneyin") |
| 429 | `auth_login_blocked` |
| 500, ağ hatası | `unexpected_error`, `common_network_error` |

---

## 10. Çeviri (i18n)

- ngx-translate; dosyalar `public/i18n/tr.json` ve `en.json`. Varsayılan dil Türkçedir. Dil seçimi topbar'dan ve login ekranından değişir, tarayıcıda hatırlanır; NG-ZORRO'nun kendi metinleri (tablo, tarih seçici) de birlikte değişir.
- **Backend'in gönderdiği bütün anahtarlar** (`category_name_exists`, `auth_login_blocked`, menülerdeki `menu_categories`...) bu dosyalarda bulunmalıdır.
- Arayüz metinleri de anahtarla yazılır; HTML'de sabit Türkçe metin bulunmaz. Yazım backend'le aynıdır: düz, snake_case, ekran adıyla başlayan anahtarlar (`category_list_title`, `common_save`).
- Testle korunur: iki dosya aynı anahtarları içermeli ve her anahtar snake_case olmalı (`core/i18n/translations.spec.ts`).

---

## 11. Görünüm ve ikonlar

- NG-ZORRO'nun varsayılan Ant Design teması; stiller `angular.json`'dan yüklenir.
- **Shell:** solda koyu sidebar (DB'den gelen menü ağacı, dar ekranda otomatik daralır), üstte topbar (menüyü daralt, dil, kullanıcı adı ve rolü, şifre değiştir, çıkış), ortada sayfa.
- **Login:** Temanın tek istisnası. Giriş ve kayıt formu aynı sayfadadır (`/login`); aralarındaki eğik panel geçişi tamamen `login.css`'tedir (`.wrapper.active`), görünmeyen form `inert` ile devre dışıdır. Geçişte iki form da sıfırlanır; `autocomplete` kapalıdır, formlar açılışta boş gelir. Dar ekranda eğik paneller gizlenir, sadece seçili form görünür. Doğrulama ve hata metinleri yine NG-ZORRO'nun form bileşenleridir.
- **İkonlar:** Sadece `core/icons.ts`'te listelenen ikonlar pakete girer. Backend'deki menüye (`menus.icon`) yeni bir ikon eklenirse buraya da eklenmelidir; ikon adları Ant Design adlarıdır (`home`, `setting`, `tag`, `team`).
- `styles.css` sadece genel ayarları içerir; component stilleri kendi `.css` dosyasındadır.
- **Paket boyutu:** İlk yükleme yaklaşık 1.4 MB ham, **~260 kB sıkıştırılmış**. Bunun büyük kısmı NG-ZORRO'nun CSS'idir. Bütçe `angular.json`'da 1.6 MB uyarı / 2 MB hata olarak ayarlıdır.

---

## 12. Grafikler

Uygulamalarda çok sayıda grafik kullanılacak. Bu yüzden grafikler için tek bir kütüphane ve tek bir kalıp vardır.

- **Kütüphane:** Apache ECharts (`ngx-echarts`). Projede ikinci bir grafik kütüphanesi bulunmaz.
- **Ortak sarmalayıcı (`shared/charts/chart.ts`):** Sayfalar ECharts'ı doğrudan değil, `<app-chart>` üzerinden kullanır:
  - Ortak renk paleti ve kenar boşlukları.
  - Seçili dile göre sayı biçimi (tooltip).
  - "Yükleniyor" (`nz-spin`) ve "veri yok" (`nz-empty`) durumları.
  - Pencere boyutu değişince otomatik yeniden boyutlandırma.
- Sayfa sadece grafiğin kendi ayarlarını (seriler, eksenler) verir.
- **Paket boyutu:** `echarts-setup.ts` sadece kullanılan grafik türlerini ve bileşenleri kaydeder (bar, line, pie). Yeni bir tür gerekirse oraya eklenir. ECharts sadece grafiğin olduğu sayfa açılınca yüklenir.
- **Veri:** Grafikler backend'in özet döndüren rapor endpoint'leriyle beslenir (backend §5.5). Frontend'de toplama yapılmaz; günler `formatDay` ile seçili dilde gösterilir.
- **Örnek:** Anasayfadaki "son 30 günde eklenen kategoriler" grafiği (`pages/home/`) referans kalıptır.

---

## 13. Ekranlar (iskeletteki kapsam)

| Ekran | URL | Kimler |
|---|---|---|
| Login | `/login` | Herkes |
| Anasayfa | `/` | Giriş yapmış herkes: karşılama ve örnek grafik |
| Kategoriler (referans CRUD) | `/definitions/categories` | Giriş yapmış herkes |
| Kullanıcılar | `/administration/users` | ADMIN: liste, ekleme, düzenleme (rol, aktif/pasif), şifre sıfırlama, silme |
| Şifremi değiştir | topbar'dan dialog | Giriş yapmış herkes |
| 403 / 404 | `/forbidden`, bilinmeyen adresler | |

---

## 14. Docker

- **Multi-stage Dockerfile:** `node:26-alpine` imajında `ng build` yapılır, çıkan dosyalar `nginx:1.30-alpine` imajına kopyalanır.
- Container'daki nginx **sadece dosya sunucusu ve yönlendirici** olarak çalışır (`client/nginx.conf`):
  - Bilinmeyen yollar `index.html`'e düşer; böylece `/definitions/categories` sayfasında F5'e basınca 404 alınmaz.
  - `/api/` istekleri `server:8080` adresine yönlendirilir. Tarayıcı frontend ve backend'i aynı adreste görür: CORS gerekmez, `SameSite=Strict` cookie sorunsuz çalışır.
  - Gerçek istemci IP'si `X-Forwarded-For` ile iletilir. Compose'da server'a `FORWARD_HEADERS_STRATEGY=native` verilir; brute-force anahtarı (`IP_email`) doğru IP'yi kullanır.
  - Hash'li JS ve CSS dosyaları 1 yıl önbelleğe alınır; `index.html` ve çeviri dosyaları alınmaz.
- Repo kökündeki `docker-compose.yml`'deki `client` servisi `app` profilindedir: `docker compose --profile app up -d` → `http://localhost:4200`.

---

## 15. Geliştirme ortamı

- `npm start` (`ng serve`) `proxy.conf.json` ile çalışır; `/api` istekleri `http://localhost:8080`'e gider.
- Backend dev profilinde çalışırken frontend `http://localhost:4200` adresinden açılır.
- Testler: `npx ng test --watch=false` (Vitest).

---

## 16. Yeni sayfa ekleme (özet)

1. **Klasör:** `pages/definitions/categories` kopyalanıp yeni ada göre değiştirilir (ör. `pages/definitions/products`).
2. **Route:** Üst seviyedeki `xxx.routes.ts` dosyasına yeni çocuk eklenir; `data.title` olarak menüdeki `title_key` verilir.
3. **Model ve servis:** Backend DTO'larına göre güncellenir.
4. **Form doğrulaması:** Backend'deki `@NotBlank`/`@Size` kurallarıyla aynı validator'lar ve aynı mesaj anahtarları kullanılır.
5. **Çeviriler:** Yeni modülün mesaj anahtarları ve arayüz metinleri `tr.json` ve `en.json`'a eklenir (test eksikleri yakalar).
6. **Menü:** Backend'de yeni bir migration class'ıyla menü kaydı eklenir; `route` değeri klasör yoluyla aynıdır. Yeni bir ikon kullanılıyorsa `core/icons.ts`'e de eklenir.

---

## 17. Kapsam dışı / sonraya bırakılanlar

- Sayfalama (backend'le birlikte)
- Gerçek dashboard içerikleri (iskelette sadece bir örnek grafik var)
- Karanlık tema seçimi
- E2E testler
