# Güvenlik ve Süperadmin Yol Haritası

> **Durum (2026-11-04):** Taslak. Hiçbir madde uygulanmadı. Başlamadan önce §6'daki üç karar netleşmelidir.
> Kararlar verildikçe bu dosya güncellenir; uygulanan maddeler `Backend_Architecture.md` ve `Frontend_Architecture.md`'ye taşınır.

## 1. Amaç

- Üç rol: `USER` (normal kullanıcı), `ADMIN` (yönetim ekranları), `SUPERADMIN` (tam yetki).
- İki tür ekran: normal kullanıcı ekranları ve yönetim ekranları. Süperadmin, yönetim ekranlarına ek olarak kendi menülerini görür.
- Süperadmin, adminlerin yaptığı işleri görebilir, değiştirebilir, geri alabilir ve silebilir.
- Süperadmin proje metriklerini izleyebilir.
- Hedef: maksimum güvenlik.

## 2. Kaynak

Fikirler PetStockPro projesinin dokümanlarından alındı (yerelde `D:\Projeler\PetStockPro\docs`):
`SUPERADMIN-YETKILERI.md`, `EKRAN-SUPERADMIN.md`, `EKRAN-AUTH.md`, `EKRAN-AYARLAR.md` §2.5,
`DEPLOYMENT.md` §8, `DATABASE-SCHEMA.md` (audit_logs). PetStockPro Next.js + Supabase olduğu için kod değil, **tasarım**
taşınır. Bu dosya, o projeye erişim olmadan da devam edilebilecek kadar ayrıntıyı içerir.

## 3. StarterApp'te zaten olanlar (yeniden yazılmayacak)

- RS256 imzalı 15 dakikalık access token; refresh token rotation ve çalınma tespiti (§8 Backend_Architecture).
- Refresh cookie `HttpOnly`, `SameSite=Strict`, `Path=/api/auth`.
- Kullanıcı taraması koruması: kayıtlı olmayan e-postada da sahte hash ile şifre kontrolü, aynı hata mesajı.
- `IP_email` anahtarlı brute-force engeli (5 deneme → 1 saat) ve kayıt hız sınırı.
- Son aktif admin silinemez/pasife alınamaz; admin şifre sıfırlarsa/pasife alırsa kullanıcının oturumları iptal edilir.
- `@PreAuthorize` ile endpoint koruması; "menü gizlemek güvenlik değildir" kuralı.

## 4. Eklenecekler

### 4.1 Roller ve yetki hiyerarşisi

- `Role` enum'una `SUPERADMIN` eklenir; Spring Security `RoleHierarchy`: `SUPERADMIN > ADMIN > USER`.
- Süperadmin yalnızca migration ile oluşur (ilk admin gibi, `V002_InitialAdmin` örneği; env'den `SUPERADMIN_EMAIL`).
  Kayıt formundan ya da ekrandan oluşturulamaz, kimse rolünü `SUPERADMIN`'e yükseltemez.
- Son süperadmin silinemez, pasife alınamaz, rolü düşürülemez (bugünkü `user_last_admin` kuralının benzeri).
- Menüler DB'den geldiği için `menus.admin_only` yerine en düşük rolü tutan `min_role` kolonu (yeni migration ile).
- Süperadmin sayfaları ayrı uygulama/subdomain değil, aynı uygulamada ayrı menü grubu: frontend'de klasör = URL kuralıyla
  örneğin `/system/...`. Backend'de `/api/system/**` için `SecurityConfig`'te yol kuralı **ve** `@PreAuthorize` (çift katman).

### 4.2 Audit log (süperadminin "adminin yaptığını görme ve geri alma" temeli)

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

### 4.3 İki faktörlü doğrulama (TOTP)

- `ADMIN` ve `SUPERADMIN` için **zorunlu**: kurulmadan yönetim ekranlarına girilemez. `USER` için isteğe bağlı.
- RFC 6238, 30 saniye, 6 hane, ±1 pencere tolerans.
- 8 adet tek kullanımlık yedek kod; sadece bir kez gösterilir, hash'li saklanır, kullanılınca işaretlenir.
- TOTP gizli anahtarı DB'de şifreli (AES-GCM); şifreleme anahtarı JWT anahtarları gibi dosyadan/Docker secret'tan gelir.
- Yanlış TOTP kodu şifre sayacına eklenmez ama ayrıca sınırlanır.

### 4.4 Yetki yükseltme (step-up)

- Riskli işlemlerden önce (silme, rol değiştirme, geri alma, 2FA/şifre sıfırlama) şifre + TOTP tekrar sorulur.
- Başarılıysa oturuma 5 dakikalık "yükseltilmiş" işaret konur; işlemler bu süre içinde tekrar sormaz.
- Süperadmin işlemlerinde **sebep zorunludur** ve audit'e yazılır.
- Süperadmin işlemlerine hız sınırı (PetStockPro: 5/dakika, 20/saat).

### 4.5 Oturum sertleştirme

- Rol başına süre: `USER` bugünkü gibi 90 gün; `ADMIN` ve `SUPERADMIN` için kısa (PetStockPro: süperadmin 8 saat,
  30 dakika boşta kalınca biter). Kesin değerler karar verilirken yazılır.
- Yetkili isteklerde her istekte oturumun iptal edilip edilmediği kontrol edilir (`sid` → `user_sessions`).
  Bugün kabul edilen "rolü değişen kullanıcının token'ı 15 dakika daha geçerli" sınırı adminler için kapanır.
- "Aktif oturumlarım" ve "tüm cihazlardan çıkış" ekranları (veri `user_sessions`'ta hazır).

### 4.6 Hesap bazlı kilit

- **Bugünkü açık:** sayaç `IP_email` üzerinde; farklı IP'lerden tek hesaba yapılan dağıtık saldırıyı durdurmaz.
- Mevcut IP_email engeline ek olarak hesap bazlı sayaç: 5 yanlış → 1 saat; 24 saat içinde art arda 3 kilit → 24 saat.
- Kilidi süperadmin açabilir (sebep zorunlu, audit). E-posta altyapısı gelince "şifremi unuttum" da kilidi açar.

### 4.7 Süperadmin kullanıcı araçları

Her biri sebep ister, step-up ister ve audit'e yazılır:
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

### 4.10 E-posta gerektirenler

- Şifremi unuttum (30 dakikalık tek kullanımlık link, kilidi de açar), e-posta doğrulama.
- Kilit ve yeni cihazdan giriş uyarıları.
- Süperadmin girişi için IP izin listesi (liste dışı IP'den girişte uyarı).
- Sızmış şifre kontrolü (HaveIBeenPwned k-anonymity API; dışarıya sadece hash'in ilk 5 karakteri gider).

## 5. Bilerek alınmayanlar

| PetStockPro'daki | Neden alınmıyor |
|---|---|
| DB Inspector (panelden SQL) | Maksimum güvenlikle çelişir; tek hesap ele geçirilirse bütün veritabanı açılır |
| Impersonation (kullanıcının yerine girme) | PetStockPro'da çok kiracı yapı içindi; burada ihtiyaç yok, saldırı yüzeyini büyütür |
| Kalan deneme hakkını gösterme | Kullanıcıya yardımcı ama saldırgana da bilgi verir |
| Süperadminin kalıcı (hard) silmesi | Audit ve soft delete ile çelişir; yerine geri getirme ve geri alma |
| Cloudflare Turnstile, KV, Telegram | Bu projenin altyapısında yok; alarm istenirse ayrıca ele alınır |

## 6. Açık kararlar

1. **Admin başka adminleri yönetebilsin mi?** Öneri: admin sadece `USER`'ları yönetir; adminleri süperadmin yönetir.
2. **Audit nasıl tutulsun?** Hibernate Envers (her kaydın bütün sürümleri otomatik, geri alma kolay) ya da kendi tablomuz
   (daha sade, kontrol bizde). Envers'in `@SoftDelete` ile uyumu önce denenmeli.
3. **E-posta gönderimi kurulsun mu?** §4.10 buna bağlı.

## 7. Uygulama sırası

| Faz | Kapsam | Bölüm |
|---|---|---|
| 1 — Temel | `SUPERADMIN` rolü ve hiyerarşi, `min_role` menüleri, audit log, güvenlik başlıkları, hesap bazlı kilit | §4.1, 4.2, 4.6, 4.8 |
| 2 — Kimlik | Zorunlu TOTP, step-up, rol bazlı oturum süreleri, yetkili isteklerde oturum kontrolü | §4.3, 4.4, 4.5 |
| 3 — Ekranlar | Kullanıcı/admin yönetimi, audit görüntüleme ve geri alma, oturumlar, metrik paneli | §4.7, 4.9 |
| 4 — E-posta | Şifremi unuttum, uyarılar, IP izin listesi, sızmış şifre kontrolü | §4.10 |

Her fazda: yeni SQL hem H2'de hem PostgreSQL'de çalışmalı (§10.6), PostgreSQL davranışı Testcontainers testleriyle,
H2 davranışı `H2IntegrationTest` ile doğrulanır.
