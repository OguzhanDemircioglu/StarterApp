# deploy

StarterApp'i tek bir sunucuya Docker Compose ile kurar: PostgreSQL 18, server (Spring Boot, `prod` profili) ve client
(nginx: Angular dosyaları + `/api` yönlendirmesi). Log toplama (Loki + Grafana) isteğe bağlı bir eklentidir.

| Dosya | İçerik |
|---|---|
| `compose.yml` | Uygulama: postgres, server, client |
| `compose.observability.yml` | İsteğe bağlı: Loki, Alloy, Grafana |
| `observability/` | Loki, Alloy ve Grafana ayarları |
| `.env.example` | Ayarların listesi; sunucuda `.env` olarak kopyalanır |
| `keys/` | JWT anahtarları; sunucuda oluşturulur, git'e girmez |

Geliştirme ortamı burası değil, repo kökündeki `docker-compose.yml`'dir.

## Boyut

Küçük bir projede hiçbir ayar değiştirilmez. JVM belleğini container'ın limitine göre kendisi ayarlar
(`-XX:MaxRAMPercentage=75`, server/Dockerfile), bağlantı havuzu varsayılanı (10) orta ölçeğe kadar yeter. Büyük bir
projede gereken birkaç değer (container bellek limiti, havuz boyutu, PostgreSQL bellek ayarları) o projede değiştirilir.

## İlk kurulum

Sunucuda Docker Engine ve Compose eklentisi kurulu olmalıdır.

```bash
git clone <repo-adresi> app && cd app/deploy

# 1. JWT anahtarları. Klasör sadece root'a açık; dosyalar container'daki root olmayan kullanıcının okuyabilmesi için 644.
#    (Container dosyaları doğrudan bağladığı için klasörün izni container'ı etkilemez.)
mkdir -p keys && chmod 700 keys
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out keys/private.pem
openssl rsa -in keys/private.pem -pubout -out keys/public.pem
chmod 644 keys/*.pem

# 2. Ayarlar: .env'deki bütün change-me değerleri değiştirilir.
cp .env.example .env && chmod 600 .env

# 3. Başlat (imajlar sunucuda build edilir)
docker compose up -d --build
docker compose ps        # server "healthy" olana kadar bekleyin (ilk açılış ~1 dakika)
```

Uygulama `http://127.0.0.1:8080` adresinde açılır; dışarıya HTTPS ile önündeki reverse proxy üzerinden yayınlanır.

## HTTPS

`COOKIE_SECURE=true` olduğu için uygulama sadece HTTPS üzerinden çalışır: refresh cookie HTTP'de gönderilmez ve
giriş yapılamaz. HTTPS bu compose'un içinde değil, sunucudaki reverse proxy'de sonlanır (sunucuda birden fazla
proje olabileceği için). Örneğin sunucuya kurulu Caddy ile (sertifikayı Let's Encrypt'ten kendisi alır):

```
app.firma.com {
    reverse_proxy 127.0.0.1:8080
}
```

Reverse proxy `X-Forwarded-For` ve `X-Forwarded-Proto` başlıklarını göndermelidir (Caddy ve nginx'in olağan
ayarlarıyla gönderilir). Client'taki nginx bunları server'a iletir; brute-force koruması gerçek istemci IP'sini buradan
okur (Backend_Architecture §13).

`HTTP_BIND=0.0.0.0` yapılırsa uygulama portu dışarı da açılır. Bu durumda port güvenlik duvarıyla sadece reverse
proxy'ye açık tutulmalıdır: doğrudan gelen biri `X-Forwarded-For` başlığını uydurarak brute-force sayacını atlatabilir.

## Güncelleme

```bash
cd app && git pull
cd deploy && docker compose up -d --build
```

İmajlar eski sürüm çalışırken build edilir; ardından container'lar yenilenir. Tek instance olduğu için server yeniden
açılırken (~30-60 saniye) API cevap vermez. Kesintisiz güncelleme gerekirse birden fazla replica gerekir
(Backend_Architecture §16, Swarm notları).

## Yedekleme

Veri sadece `pgdata` volume'ündedir. Günlük yedek için (ör. cron ile):

```bash
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB"' > yedek-$(date +%F).dump
```

Geri yükleme: `docker compose exec -T postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean' < yedek.dump`

Yedekler aynı sunucuda değil, başka bir yerde de tutulmalıdır. `keys/` klasörü ve `.env` de yedeklenir.

## Loglar

Server prod'da logları stdout'a JSON olarak yazar; her satırda `traceId` vardır (Backend_Architecture §14). Docker
logları container başına en fazla 5 x 10 MB tutar.

**Eklentisiz:** `docker compose logs -f server`, belirli bir isteğin logları için `docker compose logs server | grep <traceId>`.

**Eklentiyle (Loki + Grafana):** Loglar 30 gün (`LOG_RETENTION`) saklanır, Grafana'dan aranır.

1. `.env`'de `COMPOSE_FILE=compose.yml:compose.observability.yml` satırını açın ve `GRAFANA_ADMIN_PASSWORD` verin.
2. `docker compose up -d`
3. Grafana sadece sunucunun kendisinden açıktır. Kendi bilgisayarınızdan SSH tüneliyle:
   `ssh -L 3000:127.0.0.1:3000 kullanici@sunucu` → `http://localhost:3000` (kullanıcı `admin`).
4. Explore → Loki. Örnek sorgular:
   - `{service="server", level="ERROR"}`: server'ın hataları
   - `{service="server"} | json | traceId="<id>"`: bir hata cevabındaki traceId'nin bütün logları
   - `{service="client"} |= " 502 "`: nginx'te 502 dönen istekler

Alloy, container loglarını Docker API'sinden okur (`/var/run/docker.sock`, salt okunur) ve sadece `logs.collect=true`
etiketli container'lara bakar; sunucudaki başka projelerin logları toplanmaz. Uygulama bu eklentiden habersizdir:
eklenti kapatılınca ya da başka bir log sistemine (ör. Graylog) geçilince server'da değişiklik gerekmez.

**İmaj sürümleri:** `compose.observability.yml`'deki Loki, Alloy ve Grafana sürümleri sabitlenmiştir. Yeni bir projede
kullanmadan önce güncel kararlı sürümlere yükseltilmesi önerilir.
