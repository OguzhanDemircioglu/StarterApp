# Frontend Architecture — StarterApp

> **Durum:** v2 — 2026-10-29 (client iskeletiyle senkron)
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
| Angular | 22.x | Standalone component'ler, `@if`/`@for`, signal'ler, zoneless (zone.js yok) |
| Node.js | 26 LTS (en az 22.22.3 / 24.15) | Angular 22'nin minimum gereksinimi |
| UI kütüphanesi | NG-ZORRO 22 (Ant Design) | **MIT**, şirket büyüklüğünden bağımsız ücretsiz |
| İkonlar | `@ant-design/icons-angular` (NG-ZORRO ile gelir) | Sadece kayıtlı ikonlar pakete girer (§11) |
| State | NgRx 22 (`store`, `effects`, `store-devtools`) | Sadece oturum (§8) |
| Metinler | ngx-translate 18 + http-loader | Sadece Türkçe (§10) |
| Test | Vitest (Angular CLI'ın varsayılanı) | `npx ng test` |

**Neden PrimeNG değil:** PrimeNG 2026'dan itibaren ticari lisansa geçti. Ücretsiz Community License yalnızca 5'ten az geliştiricili, 10'dan az çalışanlı ve 1 milyon dolardan az gelirli kuruluşlar için geçerli; diğerleri geliştirici başına ücret ödüyor ve paket bir lisans anahtarı istiyor. NG-ZORRO ve Angular Material MIT lisanslı; tablo ve form ağırlıklı ekranlara daha uygun olduğu için NG-ZORRO seçildi.

ErpStockTracer'dan **taşınmayanlar:** jQuery, AdminLTE, Bootstrap JS, SweetAlert, `form-validate-angular`, `jwt-decode`. Karşılıkları NG-ZORRO bileşenleri, Reactive Forms ve NgRx'teki oturum bilgisidir.

---

## 3. Temel kural: klasör = URL = menü

**Klasör ağacı, URL ağacı ve menü ağacı aynıdır.** Birine bakan diğer ikisini bilir.

Uygulamada üç arayüz vardır; her biri URL'nin ilk parçası ve `pages/` altında bir klasördür. Arayüzler iki ayrı **yüzeyde**
çalışır: dışarıya açık sunucu ve kapalı ağdaki sunucu (deploy/README.md).

| Arayüz | URL | Klasör | Kimler | Yüzey (build) |
|---|---|---|---|---|
| Public | `/` | `pages/public/` | Herkes, giriş gerekmez: Mezun Kart tanıtım sayfası | `public` |
| Mezun Portalı | `/user` | `pages/user/` | Sadece USER | `public` |
| Yönetim paneli | `/admin` | `pages/admin/` | ADMIN ve SUPERADMIN | `internal` |

- **Yüzey build zamanında seçilir** (`src/app/surface/`): `surface.ts` geliştirme içindir (`all`, üç arayüz birlikte);
  `angular.json`'daki `public` ve `internal` yapılandırmaları onu `surface.public.ts` ya da `surface.internal.ts` ile
  değiştirir (`fileReplacements`). Her dosya kendi route listesini taşır; böylece dışarıya açık build'e yönetim panelinin
  kodu hiç girmez, kapalı ağ build'inde de public sayfa ve portal yoktur. Kapalı ağ build'inde kayıt bağlantısı gösterilmez.
- **Yönetim kullanıcıları mezun gibi davranamaz:** `userGuard` portalı sadece USER'a açar; ADMIN ve SUPERADMIN'e portal
  menüsü gelmez (backend de `/api/portal/**`'ı reddeder).
- Girişten sonra herkes kendi arayüzüne gider (`homeFor(role)`: ADMIN ve SUPERADMIN → `/admin`, USER → `/user`). Rollerin
  tek tanımı `core/auth/roles.ts`'tedir (`isStaff`, `roleKey`, `roleColor`).

| Menü (DB) | URL | Klasör |
|---|---|---|
| Anasayfa (`menu_home`) | `/admin` | `pages/admin/home/` |
| Tanımlar (`menu_definitions`) | `/admin/definitions` | `pages/admin/definitions/` |
| └ Kategoriler (`menu_categories`) | `/admin/definitions/categories` | `pages/admin/definitions/categories/` |
| Yönetim (`menu_administration`) | `/admin/administration` | `pages/admin/administration/` |
| └ Kullanıcılar (`menu_users`) | `/admin/administration/users` | `pages/admin/administration/users/` |
| Mezun Portalı (`menu_portal`) | `/user` | `pages/user/` |
| └ Ana Sayfa, Profilim, Hizmetler, Staj / Kariyer, Etkinlikler, Duyurular, Mesajlar, Ayarlar, Yardım (`menu_portal_*`) | `/user/home`, `/user/profile` … | `pages/user/home/`, `pages/user/profile/` … |

- **İstisna, portalın üst menüsü:** Kurumlar, Hizmetler, Duyurular, Dijital Platform ve İletişim kurumsal sayfalardır, DB
  menüsünde değildir. Bağlantıları sabittir (`shared/program/program.mock.ts` → `SITE_LINKS`), sayfaları `/user/site/...`
  altında `pages/user/site/` klasöründedir ve portal iskeletinin içinde açılır. Portalın ana sayfasına (`/user/home`) sol
  menüden gidilir; üst menüde Ana Sayfa yoktur.
- Menü kayıtları backend'de migration class'larıyla tutulur (`V005_HierarchicalMenuRoutes`, `V006_PortalMenus`, `V007_RoleAreaRoutes`); `route` değerleri bu tabloya uyar. Yönetim menüleri `admin_only`'dir; USER'ın oturumuna sadece portal grubu gelir.
- Yeni bir sayfa eklenirken üçü birlikte eklenir: klasör, route ve menü kaydı.

---

## 4. Klasör yapısı

```
client/
├─ public/
│  └─ i18n/                            tr.json (§10)
├─ src/
│  ├─ main.ts, index.html, styles.css
│  ├─ theme.css                        ortak tema: --mk-* renkleri, .card/.btn/.tag…, NG-ZORRO kırmızı ana renk (§11)
│  └─ app/
│     ├─ app.ts                        kök component (sadece <router-outlet />)
│     ├─ app.config.ts                 provider'lar: router, http + interceptor'lar, NgRx, çeviri, NG-ZORRO
│     ├─ app.routes.ts                 en üst iskelet: yüzeyin route listesi (§5)
│     ├─ surface/                      yüzey: surface.ts (all), surface.public.ts, surface.internal.ts (§3)
│     │
│     ├─ core/                         uygulamada tek olan şeyler
│     │  ├─ api/                       ApiResponse tipi, unwrap(), API_URL
│     │  ├─ auth/                      oturum: NgRx store, effects, guard'lar, authInterceptor,
│     │  │                             TokenRefresher (tek uçuş refresh), şifre değiştirme dialog'u
│     │  ├─ layout/                    yönetim paneli kabuğu: shell, sidebar-menu (DB'den), topbar
│     │  ├─ notify/                    Notifier (bildirimler), errorInterceptor
│     │  └─ icons.ts                   kayıtlı ikonlar (§11)
│     │
│     ├─ shared/                       sayfaların ortak kullandığı parçalar
│     │  ├─ page/                      Page (başlık + otomatik breadcrumb), Section (kart)
│     │  ├─ forms/                     validateForm, maxBytes, sameAs
│     │  ├─ pages/                     forbidden (403), not-found (404)
│     │  ├─ theme/                     brand-logo, banner (kırmızı yaylar), institution-emblem, graduate-card (dijital kart)
│     │  ├─ program/                   Mezun Kart ortak verisi (geçici): haklar, kurumlar, çıktılar, duyurular, etkinlikler
│     │  └─ format/                    trDate / trNumber pipe'ları (Intl; Angular tr locale verisi kayıtlı değil)
│     │
│     └─ pages/                        URL'nin birebir aynası
│        ├─ public/                    /         public tanıtım sayfası (giriş gerekmez)
│        │  ├─ public.ts / .html / .css  program, imkânlar, başvuru adımları, çıktılar
│        │  ├─ public-header/ public-hero/ public-rights/ public-news/ public-footer/
│        │  └─ public.mock.ts          sayfa metinleri
│        ├─ login/                     /login
│        ├─ admin/                     /admin    yönetim paneli (sadece ADMIN)
│        │  ├─ admin.routes.ts         Shell + çocukları; 403 ve 404 de burada
│        │  ├─ home/                   /admin    pano: KPI, bekleyen başvurular, dağılımlar (CSS çubukları), duyuru, etkinlik, işlem kaydı
│        │  ├─ definitions/            /admin/definitions
│        │  │  ├─ definitions.routes.ts
│        │  │  └─ categories/          /admin/definitions/categories   ← REFERANS MODÜL
│        │  │     ├─ categories.routes.ts
│        │  │     ├─ category-list/    liste sayfası
│        │  │     ├─ category-form/    ekleme/düzenleme dialog'u
│        │  │     ├─ category-api.ts   HTTP servisi
│        │  │     └─ category.model.ts backend DTO'larının tipleri
│        │  └─ administration/         /admin/administration
│        │     ├─ administration.routes.ts
│        │     └─ users/               /admin/administration/users
│        └─ user/                      /user     USER rolünün arayüzü (Mezun Portalı), kendi iskeleti
│           ├─ user.routes.ts          sayfalar; path ve data.title backend menüleriyle aynı (V006, V007)
│           ├─ portal-layout/          üst bar + sol menü (oturumdaki menu_portal grubunun çocukları) + banner başlığı
│           ├─ portal.mock.ts          mezunun profil ve kart verisi (geçici)
│           ├─ home/ profile/ services/ career/ events/ announcements/ messages/ settings/ help/
│           │                          her sayfa: component + kendi *.mock.ts verisi (API gelince servis + model ile değişir)
│           └─ site/                   /user/site  üst menünün kurumsal sayfaları (sabit): platform/ institutions/ services/
│                                      announcements/ contact/
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
// surface/surface.ts (geliştirme, all): ilk bakışta bütün iskelet; public/internal dosyaları bunun alt kümesidir
export const SURFACE_ROUTES: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('../pages/public/public') },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('../pages/login/login') },
  { path: 'user', canActivate: [authGuard, userGuard], loadChildren: () => import('../pages/user/user.routes') },
  { path: 'admin', canActivate: [authGuard, adminGuard], loadChildren: () => import('../pages/admin/admin.routes') },
  { path: '**', redirectTo: '' },
];

// app.routes.ts
export const routes: Routes = SURFACE_ROUTES;
```

```ts
// pages/admin/admin.routes.ts: yönetim panelinin iskeleti
export default [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', data: { title: 'menu_home' }, loadComponent: () => import('./home/home') },
      { path: 'definitions', data: { title: 'menu_definitions' },
        loadChildren: () => import('./definitions/definitions.routes') },
      { path: 'administration', data: { title: 'menu_administration' },
        loadChildren: () => import('./administration/administration.routes') },
      { path: 'forbidden', data: { title: 'page_forbidden_title' }, loadComponent: () => import('../../shared/pages/forbidden') },
      { path: '**', data: { title: 'page_not_found_title' }, loadComponent: () => import('../../shared/pages/not-found') },
    ],
  },
] satisfies Routes;
```

```ts
// pages/admin/definitions/definitions.routes.ts
export default [
  { path: '', pathMatch: 'full', redirectTo: 'categories' },
  { path: 'categories', data: { title: 'menu_categories' },
    loadChildren: () => import('./categories/categories.routes') },
] satisfies Routes;
```

### 5.2 Kurallar

- **Path'ler kebab-case ve küçük harf:** `/admin/definitions/categories`.
- **Lazy loading:** Her sayfa `loadComponent`, her grup `loadChildren` ile yüklenir. Lazy yüklenen dosyalar `export default` kullanır.
- **`data.title`:** Her route'un başlığı bir çeviri anahtarıdır, menüdeki `title_key` ile aynıdır. Sayfa başlığı ve breadcrumb buradan **otomatik** üretilir (`shared/page/breadcrumb.ts`); sayfalarda elle breadcrumb yazılmaz.
- **Guard'lar** (`core/auth/auth.guards.ts`):
  - `authGuard` `/admin` ve `/user`'da durur ve altındaki bütün sayfaları korur. Giriş yoksa `returnUrl` ile login'e gönderir; girişten sonra o sayfaya, dönüş adresi yoksa rolün arayüzüne (`homeFor`) gidilir.
  - `adminGuard` `/admin`'de durur; USER'ı `/user`'a gönderir.
  - `userGuard` `/user`'da durur; ADMIN ve SUPERADMIN'i `/admin`'e gönderir (yönetim kullanıcıları portala giremez).
  - `guestGuard` login sayfasında durur; giriş yapmış kullanıcıyı kendi arayüzüne gönderir.
  - Public arayüz (`/`) guard'sızdır.
  - Guard'lar sadece kullanıcı deneyimi içindir. Asıl güvenlik backend'dedir (`@PreAuthorize`).
- **Her arayüzün kendi iskeleti vardır:** `/admin` Shell'i (DB menülü sidebar + topbar), `/user` portal iskeleti (`portal-layout`); `/` ve `/login` iskeletsizdir. Yönetim kullanıcıları portalı açamaz; admin sidebar'ında portal menüsü yoktur. Üç arayüz aynı temayı kullanır (§11). Yönetim panelinin 404 ve 403 sayfaları shell içindedir (`/admin/...`); kullanıcı menüyü kaybetmez. Üst seviyede bilinmeyen adresler public anasayfaya düşer.
- **Detay sayfaları** ana sayfanın altında yer alır: `/admin/definitions/categories/:id`. Route parametreleri component'e `input()` olarak gelir (`withComponentInputBinding`).

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

### 7.2 CRUD ekranı kalıbı (referans: `pages/admin/definitions/categories`)

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
| Yerel otomatik giriş | Sadece `npm start` ile: açılışta refresh başarısızsa `POST /api/auth/dev-login` denenir, admin olarak girilir. Adres `/login` ise atlanır, ekran görülebilsin diye. Production build bu çağrıyı yapmaz (`isDevMode()`). |
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

- Uygulama sadece Türkçedir, dil seçimi yoktur. Bütün metinler `public/i18n/tr.json`'dadır; ngx-translate bu dosyayı açılışta yükler. Backend mesajları anahtar olarak gönderdiği için anahtar yapısı korunur. NG-ZORRO `tr_TR` yerel ayarıyla çalışır.
- **Backend'in gönderdiği bütün anahtarlar** (`category_name_exists`, `auth_login_blocked`, menülerdeki `menu_categories`...) bu dosyalarda bulunmalıdır.
- Arayüz metinleri de anahtarla yazılır; HTML'de sabit Türkçe metin bulunmaz. Yazım backend'le aynıdır: düz, snake_case, ekran adıyla başlayan anahtarlar (`category_list_title`, `common_save`).
- Testle korunur: iki dosya aynı anahtarları içermeli ve her anahtar snake_case olmalı (`core/i18n/translations.spec.ts`).

---

## 11. Görünüm ve ikonlar

- **Tema (`src/theme.css`):** Göç İdaresi kırmızısı ve lacivert. `angular.json`'da NG-ZORRO'dan sonra yüklenir; public, Mezun Portalı ve yönetim paneli aynı tema ile çalışır.
  - Renkler `:root`'ta `--mk-*` değişkenleridir (`--mk-red`, `--mk-navy`, `--mk-teal`, `--mk-border`…).
  - Ortak parçalar global sınıflardır: `.card`, `.card-head`, `.btn` (`-primary`, `-sm`, `-ghost`), `.tag` (`-red`, `-green`, `-amber`, `-blue`), `.bubble`, `.avatar`, `.chip`, `.with-side`, `.rows`, `.mk-section`.
  - Sayfa component'leri host'a `mk-page` sınıfı verir (`host: { class: 'mk-page' }`): dikey 16px aralıklı yığın ve sayfa içi başlık/liste sıfırlamaları.
  - NG-ZORRO'nun mavi ana rengi bütün uygulamada kırmızıya çekilir (buton, switch, checkbox, sekme, odaklanan input).
  - Logo, banner, kurum amblemi ve dijital kart `shared/theme/` altındaki bileşenlerdir.
- **Grafik yoktur:** dağılımlar CSS çubuklarıyla gösterilir (§12).
- **Yönetim paneli kabuğu (Shell):** solda lacivert sidebar (logo, DB'den gelen menü ağacı, seçili menü kırmızı, dar ekranda otomatik daralır), üstte topbar (menüyü daralt, baş harfli avatar ve rol etiketi, şifre değiştir, çıkış; public site başka ağda olduğu için ona bağlantı yoktur), içerikte kırmızı yaylar ve sayfa.
- **Mezun Portalı kabuğu (`portal-layout`):** üstte kurumsal bar, solda lacivert portal menüsü, banner'da sayfa başlığı.
- **Login:** Temanın tek istisnası. Giriş ve kayıt formu aynı sayfadadır (`/login`); aralarındaki eğik panel geçişi tamamen `login.css`'tedir (`.wrapper.active`), görünmeyen form `inert` ile devre dışıdır. Geçişte iki form da sıfırlanır; `autocomplete` kapalıdır, formlar açılışta boş gelir. Dar ekranda eğik paneller gizlenir, sadece seçili form görünür. Doğrulama ve hata metinleri yine NG-ZORRO'nun form bileşenleridir.
- **İkonlar:** Sadece `core/icons.ts`'te listelenen ikonlar pakete girer. Backend'deki menüye (`menus.icon`) yeni bir ikon eklenirse buraya da eklenmelidir; ikon adları Ant Design adlarıdır (`home`, `setting`, `tag`, `team`).
- `styles.css` sadece genel ayarları içerir; ortak tema `theme.css`'tedir; component'e özel stiller kendi `.css` dosyasındadır. Component stil bütçesi dosya başına 4 kB uyarı / 8 kB hatadır; büyük sayfalar bölümlere ayrılır (ör. `pages/public/public-*`).
- **Paket boyutu:** İlk yükleme yaklaşık 1.2 MB ham, **~217 kB sıkıştırılmış** (yönetim paneli ve portal lazy yüklenir). Bunun büyük kısmı NG-ZORRO'nun CSS'idir. Bütçe `angular.json`'da 1.6 MB uyarı / 2 MB hata olarak ayarlıdır.

---

## 12. Grafikler

Bu dalda (`mezun-portal`) grafik yoktur: anasayfa panosu, `shared/charts/`, ECharts / ECharts GL / MapLibre / deck.gl paketleri ve `dash_` çevirileri kaldırıldı. Grafik gerekirse kalıp şablon dalında (`cray61`) durur: `shared/charts/` klasörü, `package.json` paketleri, `angular.json` `/vendor` kopyaları ve bu bölümün eski hâli oradan alınır.

---

## 13. Ekranlar (iskeletteki kapsam)

| Ekran | URL | Kimler |
|---|---|---|
| Public | `/` | Herkes: tanıtım sayfası (program, haklar, kurumlar, duyurular) |
| Login | `/login` | Herkes |
| Mezun Portalı | `/user/...` | Sadece USER (dışarıya açık yüzey) |
| Yönetim anasayfası | `/admin` | ADMIN: karşılama |
| Kategoriler (referans CRUD) | `/admin/definitions/categories` | ADMIN |
| Kullanıcılar | `/admin/administration/users` | ADMIN: liste, ekleme, düzenleme (rol, aktif/pasif), şifre sıfırlama, silme |
| Şifremi değiştir | topbar'dan dialog | Giriş yapmış herkes |
| 403 / 404 | `/admin/forbidden`, `/admin` altında bilinmeyen adresler | |

---

## 14. Docker

- **Multi-stage Dockerfile, iki imaj:** `node:26-alpine` imajında `ng build -c production,<SURFACE>` yapılır, çıkan dosyalar
  `nginx:1.30-alpine` imajına kopyalanır. Yüzey `SURFACE` build argümanıyla seçilir (`public` ya da `internal`); verilmezse
  build durur.
- Container'daki nginx **sadece dosya sunucusu ve yönlendirici** olarak çalışır (`client/nginx/<surface>.conf.template`):
  - `/api/` istekleri aynı yüzeydeki server'a gider; adres `API_UPSTREAM` ortam değişkenidir (varsayılan `server:8080`).
    Tarayıcı frontend ve backend'i aynı adreste görür: CORS gerekmez, `SameSite=Strict` cookie sorunsuz çalışır.
  - Yüzeyde olmayan yollar nginx'te 404'tür: public'te `/api/admin/`, internal'da `/api/auth/register` ve `/api/portal/`;
    ikisinde de `/api/auth/dev-login`. Server da aynı yolları kapatır (iki katmanlı koruma).
  - Bilinmeyen yollar `index.html`'e düşer; böylece `/admin/definitions/categories` sayfasında F5'e basınca 404 alınmaz.
  - Gerçek istemci IP'si `X-Forwarded-For` ile iletilir. Server'a `FORWARD_HEADERS_STRATEGY=native` verilir; brute-force anahtarı
    (`IP_email`) doğru IP'yi kullanır.
  - Hash'li JS ve CSS dosyaları 1 yıl önbelleğe alınır; `index.html` ve çeviri dosyaları alınmaz. Temel güvenlik başlıkları
    (`nosniff`, `Referrer-Policy`, `X-Frame-Options`) eklenir.
- Repo kökündeki `docker-compose.yml` iki yüzeyi yan yana kurar: `docker compose --profile app up -d` → `http://localhost:4200`
  (public) ve `http://localhost:4300` (internal). Gerçek kurulum: `deploy/`.

---

## 15. Geliştirme ortamı

- `npm start` (`ng serve`) `proxy.conf.json` ile çalışır; `/api` istekleri `http://localhost:8080`'e gider. Yüzey `all`'dur:
  public, portal ve yönetim paneli birlikte (`http://localhost:4200`). Dev girişi (otomatik ADMIN) sadece `all` ve `internal`'da yapılır.
- Gerçek build'ler gibi tek yüzey: `npm run start:public` (4200) ve `npm run start:internal` (4300). Backend `APP_SURFACE`
  verilmeden (`all`) çalışırken ikisi de aynı server'a bağlanır.
- Build: `npm run build:public`, `npm run build:internal` (`npm run build` = public).
- Testler: `npx ng test --watch=false` (Vitest).

---

## 16. Yeni sayfa ekleme (özet)

1. **Klasör:** `pages/admin/definitions/categories` kopyalanıp yeni ada göre değiştirilir (ör. `pages/admin/definitions/products`).
2. **Route:** Üst seviyedeki `xxx.routes.ts` dosyasına yeni çocuk eklenir; `data.title` olarak menüdeki `title_key` verilir.
3. **Model ve servis:** Backend DTO'larına göre güncellenir.
4. **Form doğrulaması:** Backend'deki `@NotBlank`/`@Size` kurallarıyla aynı validator'lar ve aynı mesaj anahtarları kullanılır.
5. **Çeviriler:** Yeni modülün mesaj anahtarları ve arayüz metinleri `tr.json`'a eklenir.
6. **Menü:** Backend'de yeni bir migration class'ıyla menü kaydı eklenir; `route` değeri klasör yoluyla aynıdır. Yeni bir ikon kullanılıyorsa `core/icons.ts`'e de eklenir.

---

## 17. Kapsam dışı / sonraya bırakılanlar

- Sayfalama (backend'le birlikte)
- Gerçek dashboard içerikleri
- Karanlık tema seçimi
- E2E testler
