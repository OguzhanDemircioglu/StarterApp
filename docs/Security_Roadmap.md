# Güvenlik ve Süperadmin Yol Haritası

> **Durum (2026-11-04):** Bütün kararlar verildi (§6), uygulama Faz 1 ile başlıyor. Henüz hiçbir madde uygulanmadı.
> Kararlar verildikçe bu dosya güncellenir; uygulanan maddeler `Backend_Architecture.md` ve `Frontend_Architecture.md`'ye taşınır.

## 1. Amaç

- Dört rol: `USER` (normal kullanıcı), `ADMIN` (yönetim ekranları), `OWNER` (projenin sahibi, salt okunur metrikler),
  `SUPERADMIN` (tam yetki).
- İki tür ekran: normal kullanıcı ekranları ve yönetim ekranları. Süperadmin, yönetim ekranlarına ek olarak kendi menülerini
  görür; sahip yalnızca metrik ekranlarını görür.
- Süperadmin, adminlerin yaptığı işleri görebilir, değiştirebilir, geri alabilir ve silebilir.
- Süperadmin proje metriklerini izleyebilir.
- Sahip, müşterinin soracağı soruları (kaç kişi kullanıyor, neye ne kadar tıklanmış, en çok hangi ekran) toplu
  metriklerle cevaplayabilir.
- Hedef: maksimum güvenlik.

## 2. Kaynak

Fikirler PetStockPro projesinin dokümanlarından alındı (yerelde `D:\Projeler\PetStockPro\docs`):
`SUPERADMIN-YETKILERI.md`, `EKRAN-SUPERADMIN.md`, `EKRAN-AUTH.md`, `EKRAN-AYARLAR.md` §2.5,
`DEPLOYMENT.md` §8, `DATABASE-SCHEMA.md` (audit_logs). PetStockPro Next.js + Supabase olduğu için kod değil, **tasarım**
taşınır. Bu dosya, o projeye erişim olmadan da devam edilebilecek kadar ayrıntıyı içerir. `OWNER` rolü ve kullanım
istatistikleri (§4.11, §4.12) PetStockPro'da yoktur, bu projeye özgüdür.

## 3. StarterApp'te zaten olanlar (yeniden yazılmayacak)

- RS256 imzalı 15 dakikalık access token; refresh token rotation ve çalınma tespiti (§8 Backend_Architecture).
- Refresh cookie `HttpOnly`, `SameSite=Strict`, `Path=/api/auth`.
- Kullanıcı taraması koruması: kayıtlı olmayan e-postada da sahte hash ile şifre kontrolü, aynı hata mesajı.
- `IP_email` anahtarlı brute-force engeli (5 deneme → 1 saat) ve kayıt hız sınırı.
- Son aktif admin silinemez/pasife alınamaz; admin şifre sıfırlarsa/pasife alırsa kullanıcının oturumları iptal edilir.
- `@PreAuthorize` ile endpoint koruması; "menü gizlemek güvenlik değildir" kuralı.

## 4. Eklenecekler

### 4.1 Roller ve yetki hiyerarşisi

- `Role` enum'una `SUPERADMIN` ve `OWNER` eklenir.
- Spring Security `RoleHierarchy`: `SUPERADMIN > ADMIN > USER` ve `SUPERADMIN > OWNER`.
  - `OWNER` zincirin içinde **değildir**: `OWNER > ADMIN` denirse sahip adminin bütün yazma yetkilerini alırdı.
    Sahip `ADMIN`/`USER` yetkilerini miras almaz; yalnızca `OWNER` ile korunan metrik endpoint'lerine erişir.
  - Sahibin normal kullanıcı ekranlarını kullanması gerekirse `USER` yetkisi ayrıca verilir (açık karar değil, ihtiyaç
    çıkarsa eklenir).
- Yönetim kapsamı: admin yalnızca `USER`'ları yönetir; başka admini, sahibi ve süperadmini yönetemez, kimsenin rolünü
  değiştiremez. Backend kuralı: hedef kullanıcının rolü işlemi yapanınkinden düşük olmalı.
- Süperadmin yalnızca migration ile oluşur (ilk admin gibi, `V002_InitialAdmin` örneği; env'den `SUPERADMIN_EMAIL`).
  Kayıt formundan ya da ekrandan oluşturulamaz, kimse rolünü `SUPERADMIN`'e yükseltemez.
- Son süperadmin silinemez, pasife alınamaz, rolü düşürülemez (bugünkü `user_last_admin` kuralının benzeri).
- Menüler DB'den geliyor; `menus.admin_only` doğrusal bir `min_role` ile değiştirilemez, çünkü `OWNER` zincirin dışında.
  Bunun yerine menüyü görebilen rollerin kümesi tutulur (`menu_roles` tablosu ya da rol listesi kolonu, yeni migration ile).
  Süperadmin hiyerarşi sayesinde hepsini görür.
- Süperadmin sayfaları ayrı uygulama/subdomain değil, aynı uygulamada ayrı menü grubu: frontend'de klasör = URL kuralıyla
  örneğin `/system/...`. Backend'de `/api/system/**` için `SecurityConfig`'te yol kuralı **ve** `@PreAuthorize` (çift katman).
  Sahip ekranları için aynısı: `/insights/...` ve `/api/insights/**`.

### 4.2 Audit log (süperadminin "adminin yaptığını görme ve geri alma" temeli)

- Hibernate Envers değil, kendi tablomuz (`audit_logs`) kullanılır (§6.1).
- Tablo: kim (`user_id`, `session_id`), ne zaman, işlem (`action`), varlık (`entity_type`, `entity_id`),
  `before_state` / `after_state` (JSON), `reason`, `ip`, `user_agent`, `trace_id`.
- Değiştirilemez: süperadmin dahil kimse UPDATE/DELETE yapamaz.
  - PostgreSQL: UPDATE/DELETE'i reddeden trigger; mümkünse uygulama DB kullanıcısına bu tabloda sadece INSERT/SELECT yetkisi.
  - Ek öneri (PetStockPro'da yok): her satır bir öncekinin hash'ini taşır (hash zinciri); sonradan oynama fark edilir.
  - H2'de trigger aynı şekilde çalışmaz: dev'de koruma uygulama katmanında kalır, doğrulama PostgreSQL testlerinde yapılır
    (Backend_Architecture §10.6).
- Auth olayları da yazılır: başarılı/başarısız giriş, kilit, şifre ve 2FA değişimi, oturum iptali.
- Süreli temizlik işi bu tabloya **dokunmaz**.
- "Geri al" doğrudan SQL ile değil, ilgili servis üzerinden yapılır (iş kuralları ve `@Version` korunur) ve kendisi de
  audit'e yeni satır olarak yazılır.
- Kullanım istatistikleri (§4.11) bu tabloya **yazılmaz**; ikisinin amacı ve saklama kuralları farklıdır.

### 4.3 İki faktörlü doğrulama (TOTP)

Telefondaki authenticator uygulamalarının (Google/Microsoft Authenticator, Authy, 1Password) ürettiği 6 haneli kod.

- Politika:

  | Rol | TOTP |
  |---|---|
  | `SUPERADMIN` | Her zaman zorunlu, kapatılamaz |
  | `OWNER` | Varsayılan isteğe bağlı (sahip kendisi açıp kapatır); süperadmin zorunlu yapabilir veya zorunluluğu kaldırabilir |
  | `ADMIN` | Varsayılan isteğe bağlı; süperadmin rol bazında zorunlu yapabilir |
  | `USER` | Varsayılan isteğe bağlı; süperadmin rol bazında zorunlu yapabilir |

- Politika bir ayar tablosunda rol başına tutulur. Değiştirmek step-up ve sebep ister, audit'e yazılır.
- Zorunluluk açıldığında TOTP'si olmayan kullanıcı bir sonraki girişte kurulum ekranına yönlendirilir; kurmadan başka
  hiçbir endpoint'e erişemez (token yalnızca kurulum endpoint'lerine izin veren kısıtlı kapsamla verilir).
- Zorunlu olduğu sürece kullanıcı kendi TOTP'sini kapatamaz.
- RFC 6238, 30 saniye, 6 hane, ±1 pencere tolerans. Dış servis gerekmez (HMAC-SHA1); QR kod frontend'de üretilebilir.
- 8 adet tek kullanımlık yedek kod; sadece bir kez gösterilir, hash'li saklanır, kullanılınca işaretlenir.
- TOTP gizli anahtarı DB'de şifreli (AES-GCM); şifreleme anahtarı JWT anahtarları gibi dosyadan/Docker secret'tan gelir.
- Yanlış TOTP kodu şifre sayacına eklenmez ama ayrıca sınırlanır.

### 4.4 Yetki yükseltme (step-up)

- Riskli işlemlerden önce (silme, rol değiştirme, geri alma, 2FA/şifre sıfırlama, TOTP politikası) şifre + TOTP tekrar sorulur.
- Başarılıysa oturuma 5 dakikalık "yükseltilmiş" işaret konur; işlemler bu süre içinde tekrar sormaz.
- Süperadmin işlemlerinde **sebep zorunludur** ve audit'e yazılır.
- Süperadmin işlemlerine hız sınırı (PetStockPro: 5/dakika, 20/saat).
- `OWNER` salt okunur olduğu için step-up gerektiren bir işlemi yoktur.

### 4.5 Oturum sertleştirme

- Rol başına süre (refresh token / oturum ömrü):

  | Rol | Toplam süre | Boşta kalınca biter |
  |---|---|---|
  | `USER` | 90 gün (bugünkü gibi) | Hayır |
  | `OWNER` | 7 gün | Hayır |
  | `ADMIN` | 12 saat | 1 saat |
  | `SUPERADMIN` | 8 saat | 30 dakika |

  "Boşta" = son refresh'ten bu yana geçen süre. Sahip salt okunur olduğu için süresi uzundur.
- Yetkili isteklerde her istekte oturumun iptal edilip edilmediği kontrol edilir (`sid` → `user_sessions`).
  Bugün kabul edilen "rolü değişen kullanıcının token'ı 15 dakika daha geçerli" sınırı adminler için kapanır.
- Rol değişince (ör. `USER` → `OWNER`) kullanıcının oturumları iptal edilir; yeni rol yeni girişte gelir.
- "Aktif oturumlarım" ve "tüm cihazlardan çıkış" ekranları (veri `user_sessions`'ta hazır).

### 4.6 Hesap bazlı kilit

- **Bugünkü açık:** sayaç `IP_email` üzerinde; farklı IP'lerden tek hesaba yapılan dağıtık saldırıyı durdurmaz.
- Mevcut IP_email engeline ek olarak hesap bazlı sayaç: 5 yanlış → 1 saat; 24 saat içinde art arda 3 kilit → 24 saat.
- Kilidi süperadmin açabilir (sebep zorunlu, audit). E-posta altyapısı gelince "şifremi unuttum" da kilidi açar.

### 4.7 Süperadmin kullanıcı araçları

Her biri sebep ister, step-up ister ve audit'e yazılır:
- Rol değiştirme: `USER` ↔ `ADMIN` ↔ `OWNER`. `SUPERADMIN`'e yükseltme yoktur (§4.1).
- TOTP politikası: rol bazında zorunlu yapma/kaldırma (§4.3).
- Şifreyi zorla sıfırlama (geçici şifre + ilk girişte değiştirme zorunluluğu).
- 2FA sıfırlama (kullanıcı sonraki girişte yeniden kurar).
- Tüm oturumları kapatma.
- Hesabı kilitleme/açma (süreli veya süresiz).
- Silinmiş kaydı geri getirme ve audit'ten değişikliği geri alma.

### 4.8 Güvenlik başlıkları

- **Bugünkü durum:** `client/nginx.conf` sadece `Cache-Control` yazıyor. API cevaplarında Spring Security'nin varsayılan
  başlıkları var, ama uygulamayı sunan nginx'te yok.
- nginx'e eklenecekler: `Content-Security-Policy` (`frame-ancestors 'none'` dahil), `Strict-Transport-Security`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.
- CSP, anasayfadaki ECharts, ECharts GL, MapLibre ve deck.gl (worker'lar, `/vendor` scriptleri, OpenFreeMap) ve
  NG-ZORRO'nun inline stilleriyle birlikte tarayıcıda test edilmelidir.

### 4.9 Süperadmin metrik paneli

- Sistem metrikleri: Spring Actuator + Micrometer (JVM bellek, HTTP gecikmesi p95, 5xx oranı, DB bağlantı havuzu).
  Actuator dışarıya değil ayrı iç porta açılır (`management.server.port`); panel veriyi backend üzerinden alır.
- İş metrikleri: mevcut rapor kalıbıyla native SQL (kullanıcı sayıları, aktif oturum, başarısız giriş, engellenen
  IP/hesap, audit işlem sayıları, son hatalar).
- Panel sadece okur; işlemler kendi ekranlarından yapılır. Paneli görüntülemek de audit'e yazılır.
- Süperadmin sahip panelini (§4.12) de görür.
- Not: `deploy/compose.observability.yml` ile kurulan Grafana, Prometheus eklenerek sistem metriklerini de gösterebilir.
  O durumda bu paneldeki sistem metrikleri bölümü Grafana'ya bırakılabilir; karar Faz 3'te verilir.

### 4.10 E-posta gerektirenler

- Şifremi unuttum (30 dakikalık tek kullanımlık link, kilidi de açar), e-posta doğrulama.
- Kilit ve yeni cihazdan giriş uyarıları.
- Süperadmin girişi için IP izin listesi (liste dışı IP'den girişte uyarı).
- Sızmış şifre kontrolü (HaveIBeenPwned k-anonymity API; dışarıya sadece hash'in ilk 5 karakteri gider).

### 4.11 Kullanım istatistikleri (sahip panelinin veri kaynağı)

Bugün böyle bir veri toplanmıyor; audit log yalnızca yönetim işlemlerini tutar.

- Frontend sayfa görüntülemelerini (router geçişleri) ve işaretlenmiş önemli tıklamaları biriktirir, toplu olarak
  backend'e gönderir (ör. 10 saniyede bir veya sayfa kapanırken `sendBeacon`). Tıklama takibi açıkça işaretlenen
  elemanlarla sınırlıdır (ör. bir directive ile olay adı verilir); her tıklama toplanmaz.
- Ham olay tablosu: olay tipi, olay adı / sayfa yolu, zaman, rol, oturum kimliği. `user_id` ve IP **tutulmaz**;
  günlük tekil kullanıcı sayısı için kullanıcı kimliğinin günlük değişen tuzla hash'i yeterlidir.
- Ham olaylar 90 gün saklanır, süreli temizlik işi bunları günlük özet tablolara toplayıp siler.
  Panel özet tablolardan okur.
- Audit'ten farkı: değiştirilemez olması gerekmez, silinebilir; güvenlik kaydı değil, ürün istatistiğidir.
- KVKK: kişi bazında veri sunulmadığı için sahip paneli kişisel veri işlemez; gizlilik metnine kullanım istatistiği
  toplandığı eklenir.
- Hız sınırı ve boyut sınırı: olay endpoint'i yalnızca giriş yapmış kullanıcıdan, istek başına sınırlı sayıda olay kabul eder.

### 4.12 Sahip (OWNER) paneli

- Yalnızca **toplu** metrikler; kullanıcı listesi, isim, e-posta veya kişi bazında kayıt gösterilmez.
- Örnek sorular ve kaynakları:
  - Kaç kayıtlı / aktif kullanıcı var, zamanla nasıl değişiyor? → `users` (sayım), özet tablolar.
  - Günlük / haftalık / aylık aktif kullanıcı? → §4.11 özetleri.
  - En çok hangi ekran ve hangi özellik kullanılıyor, neye ne kadar tıklanmış? → §4.11 özetleri.
  - Kullanım hangi gün ve saatlerde yoğun? → §4.11 özetleri.
- Panel salt okunurdur; dışa aktarma (CSV/PDF) istenirse o da yalnızca toplu veriyi içerir.
- Sahip hesabı: kişi önce normal kayıt formuyla kendi hesabını açar, sonra süperadmin rolünü `OWNER` yapar (§4.7).

## 5. Bilerek alınmayanlar

| PetStockPro'daki | Neden alınmıyor |
|---|---|
| DB Inspector (panelden SQL) | Maksimum güvenlikle çelişir; tek hesap ele geçirilirse bütün veritabanı açılır |
| Impersonation (kullanıcının yerine girme) | PetStockPro'da çok kiracı yapı içindi; burada ihtiyaç yok, saldırı yüzeyini büyütür |
| Kalan deneme hakkını gösterme | Kullanıcıya yardımcı ama saldırgana da bilgi verir |
| Süperadminin kalıcı (hard) silmesi | Audit ve soft delete ile çelişir; yerine geri getirme ve geri alma |
| Cloudflare Turnstile, KV, Telegram | Bu projenin altyapısında yok; alarm istenirse ayrıca ele alınır |

## 6. Kararlar

### 6.1 Verilen kararlar (2026-11-04)

1. **Admin başka adminleri yönetmez.** Admin yalnızca `USER`'ları yönetir; adminleri ve sahibi süperadmin yönetir.
2. **TOTP yalnızca süperadmin için zorunlu.** Süperadmin `ADMIN`, `OWNER` ve `USER` rolleri için zorunluluğu açıp
   kapatabilir; zorunlu değilse sahip ve diğerleri kendisi açıp kapatır (§4.3).
3. **`OWNER` rolü eklenir.** Proje sahibi için, salt okunur, yalnızca toplu metrikler görür (§4.12). Hiyerarşide
   `ADMIN`'in üstünde değil, yanında durur (§4.1).
4. **Sahip hesabı** normal kayıtla açılır, süperadmin rolünü değiştirir.

5. **Audit için kendi tablomuz**, Hibernate Envers değil. Envers `reason`, `ip`, `trace_id`, hash zinciri gibi alanları
   doğal taşımaz; auth olayları entity değişikliği olmadığı için yine ayrı tablo gerekirdi (iki audit sistemi);
   `@SoftDelete` uyumu belirsiz; geri alma servis üzerinden yapılacağı için `before_state` JSON'u yeterli.
6. **E-posta Faz 4'e ertelenir.** O zamana kadar hesap kilidini yalnızca süperadmin açar.
7. **Birden fazla sahip olabilir**; sınır yok (rol salt okunur).
8. **Ham kullanım olayları 90 gün** saklanır; günlük özetler süresiz.
9. **Oturum süreleri** §4.5'teki tablodaki gibidir.

### 6.2 Açık kararlar

Yok.

## 7. Uygulama sırası

| Faz | Kapsam | Bölüm |
|---|---|---|
| 1 — Temel | `SUPERADMIN` ve `OWNER` rolleri, hiyerarşi, menü rol kümeleri, audit log, güvenlik başlıkları, hesap bazlı kilit, kullanım olaylarının toplanması | §4.1, 4.2, 4.6, 4.8, 4.11 |
| 2 — Kimlik | TOTP ve rol bazlı TOTP politikası, step-up, rol bazlı oturum süreleri, yetkili isteklerde oturum kontrolü | §4.3, 4.4, 4.5 |
| 3 — Ekranlar | Kullanıcı/admin yönetimi ve rol değiştirme, audit görüntüleme ve geri alma, oturumlar, süperadmin metrik paneli, sahip paneli | §4.7, 4.9, 4.12 |
| 4 — E-posta | Şifremi unuttum, uyarılar, IP izin listesi, sızmış şifre kontrolü | §4.10 |

Kullanım olaylarının toplanması Faz 1'e alındı: sahip paneli Faz 3'te geldiğinde birikmiş veri olsun diye.

Her fazda: yeni SQL hem H2'de hem PostgreSQL'de çalışmalı (§10.6), PostgreSQL davranışı Testcontainers testleriyle,
H2 davranışı `H2IntegrationTest` ile doğrulanır.
