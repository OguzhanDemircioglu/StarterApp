# Kurulum: iki sunucu, iki ağ

Mezun Kart iki ayrı yerde çalışır. Kod tabanı ve imajlar aynıdır; hangi yüzeyin çalışacağını `APP_SURFACE` (server) ve
`SURFACE` (client imajı) belirler.

| | Dışarıya açık sunucu (`deploy/public`) | Kapalı ağ sunucusu (`deploy/internal`) |
|---|---|---|
| Ağ | İnternet / DMZ | Kurum içi kapalı ağ, internete açılmaz |
| Arayüz | `/` public tanıtım sayfası, `/user` Mezun Portalı | `/admin` yönetim paneli |
| Kim girer | USER (mezunlar), kayıt açık | ADMIN ve SUPERADMIN, kayıt kapalı |
| Server | `APP_SURFACE=public` | `APP_SURFACE=internal` |
| Kapalı yollar | `/api/admin/**` (server + nginx) | `/api/auth/register`, `/api/portal/**` (server + nginx) |
| Client imajı | `SURFACE=public` (yönetim kodu imajda yok) | `SURFACE=internal` |
| Veritabanı | Yok; internal'daki PostgreSQL'e bağlanır | PostgreSQL 18 burada |

```
 İnternet ──TLS──► [reverse proxy] ──► client (public) ──► server (public) ──┐
                                                                           │ 5432, sadece bu IP'ye izin
 Kapalı ağ ──────► [iç proxy]      ──► client (internal) ─► server (internal)─► PostgreSQL
```

Neden böyle:

- **Yönetim paneli internetten hiç görünmez.** Dışarıdaki imajda yönetim ekranlarının kodu yoktur, nginx `/api/admin/`'i
  vermez, server da `APP_SURFACE=public` iken yönetim API'sini tamamen kapatır. Bir yönetici dışarıdaki adrese doğru
  şifreyle girmeye çalışsa bile yanlış şifreyle aynı cevabı alır; hesapların varlığı anlaşılmaz.
- **Yönetim kullanıcıları mezun gibi davranamaz.** ADMIN ve SUPERADMIN, USER yetkisi taşımaz: portal menüsü gelmez,
  `/api/portal/**` 403 döner. Kapalı ağ sunucusuna da USER giremez.
- **Her yüzeyin kendi JWT anahtarı vardır.** Bir yüzeyde alınan token diğerinde geçmez.

## Kurulum sırası

1. Kapalı ağ sunucusu (`deploy/internal`): veritabanı, şema ve migration'lar burada oluşur, ilk SUPERADMIN açılır.
2. Güvenlik duvarı: sadece public sunucunun IP'sinden kapalı ağ sunucusunun 5432 portuna izin.
3. Dışarıya açık sunucu (`deploy/public`).

Güncellemede de aynı sıra izlenir: önce internal (yeni migration'lar), sonra public.

## Her sunucuda

```bash
cd deploy/internal            # ya da deploy/public
cp .env.example .env          # değerleri doldurun
mkdir keys
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out keys/private.pem
openssl rsa -in keys/private.pem -pubout -out keys/public.pem
chmod 644 keys/*.pem
docker compose up -d --build
```

- İki sunucu için **ayrı** anahtar çifti üretin; anahtarlar ve `.env` git'e girmez (`.gitignore`).
- Kapalı ağ sunucusunda `DB_BIND_ADDRESS`, public sunucunun ulaşacağı iç IP'dir (varsayılan `127.0.0.1` = sadece
  o makine). Public sunucuda `DB_URL` bu adresi gösterir.
- Container'lar varsayılan olarak `127.0.0.1:8080`'de dinler. TLS'i önlerindeki reverse proxy yapar (dışarıda zorunlu;
  `COOKIE_SECURE=true` olduğu için HTTPS olmadan oturum çerezi gönderilmez). Kapalı ağda HTTPS yoksa internal
  `.env`'de `COOKIE_SECURE=false` verilir.

## Öneriler

- **Veritabanı kullanıcıları:** Public sunucu için şemayı değiştiremeyen, sadece veri okuyup yazabilen ayrı bir
  PostgreSQL kullanıcısı açılabilir; şema ve migration işleri internal'ın kullanıcısıyla yapılır. (Şu an iki taraf da
  aynı kullanıcıyla çalışabilir; uygulama açılışta Hibernate ile şemayı günceller.)
- **Yedekleme:** Veritabanı kapalı ağdadır; yedek de orada alınır (`docker compose exec postgres pg_dump ...`).
- **Loglar:** Container logları 5 × 10 MB ile sınırlıdır (`docker compose logs -f server`).

## Yerelde iki yüzeyi birlikte denemek

Repo kökündeki `docker-compose.yml` aynı ayrımı tek makinede kurar (PostgreSQL + iki server + iki client):

```bash
docker compose --profile app up -d --build
```

- `http://localhost:4200` dışarıya açık yüzey, `http://localhost:4300` kapalı ağ yüzeyi.
- Geliştirme sırasında Docker'sız çalışmak için: server IDE'den (`APP_SURFACE` verilmezse `all`), client
  `npm start` (iki yüzey birlikte), `npm run start:public` (4200) ya da `npm run start:internal` (4300).
