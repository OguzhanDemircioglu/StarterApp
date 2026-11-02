# StarterApp

Yeni projelere başlangıç noktası olan şablon repo: Spring Boot backend ve Angular frontend tek repoda.
Yeni bir projeye bu repo kopyalanarak başlanır.

| Klasör / dosya | İçerik |
|---|---|
| [server/](server/README.md) | Spring Boot 4.1, Java 25, PostgreSQL (yerelde H2). Kurulum ve çalıştırma: [server/README.md](server/README.md) |
| [client/](client/README.md) | Angular 22, NG-ZORRO, ECharts, NgRx. Kurulum ve çalıştırma: [client/README.md](client/README.md) |
| [docs/Backend_Architecture.md](docs/Backend_Architecture.md) | Backend'in bağlayıcı kuralları ve tasarım kararları |
| [docs/Frontend_Architecture.md](docs/Frontend_Architecture.md) | Frontend'in bağlayıcı kuralları ve tasarım kararları |
| [docker-compose.yml](docker-compose.yml) | Geliştirme ortamı: server ve client (varsayılan veritabanı H2; `server/.env`'de `DB_URL` verilirse oraya bağlanır); isteğe bağlı yerel PostgreSQL 18 |

## Hızlı başlangıç

1. **Server'ı hazırla:** JWT anahtarlarını üret ve `server/.env` dosyasını oluştur
   (server/README.md → "İlk kurulum"). Yerel geliştirme için veritabanı kurmak gerekmez: dev profili H2 kullanır.
2. **Çalıştır:**
   - Geliştirirken: server'ı `server/` klasöründe dev profiliyle, client'ı `client/` klasöründe `npm start` ile başlat.
     Uygulama `http://localhost:4200` adresinden açılır.
   - Docker ile, repo kökünde:

     ```bash
     docker compose --profile app up -d   # server + client → http://localhost:4200
     docker compose --profile db up -d    # isteğe bağlı: sadece yerel PostgreSQL 18 (localhost:5433)
     ```

     `--profile app` için `server/.env` ve `server/keys/` hazır olmalıdır. Server, admin bilgilerini ve varsa `DB_URL`'i
     `server/.env`'den alır. `DB_URL` yoksa H2'yi `h2data` volume'ünde tutar; bu veri IDE'den çalıştırmanın
     `server/data/` klasöründen ayrıdır.

## Gereksinimler

- JDK 25
- Node.js 26 LTS (en az 22.22.3)
- Docker Desktop (compose ve entegrasyon testleri için; Docker yoksa backend entegrasyon testleri otomatik atlanır)
