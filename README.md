# StarterApp

Yeni projelere başlangıç noktası olan şablon repo: Spring Boot backend ve Angular frontend tek repoda.
Yeni bir projeye bu repo kopyalanarak başlanır.

| Klasör / dosya | İçerik |
|---|---|
| [server/](server/README.md) | Spring Boot 4.1, Java 25, PostgreSQL. Kurulum ve çalıştırma: [server/README.md](server/README.md) |
| [client/](client/README.md) | Angular 22, NG-ZORRO, ECharts, NgRx. Kurulum ve çalıştırma: [client/README.md](client/README.md) |
| [docs/Backend_Architecture.md](docs/Backend_Architecture.md) | Backend'in bağlayıcı kuralları ve tasarım kararları |
| [docs/Frontend_Architecture.md](docs/Frontend_Architecture.md) | Frontend'in bağlayıcı kuralları ve tasarım kararları |
| [docker-compose.yml](docker-compose.yml) | Geliştirme ortamı: PostgreSQL 18, server ve client |

## Hızlı başlangıç

1. **Server'ı hazırla:** JWT anahtarlarını üret ve `server/.env` dosyasını oluştur
   (server/README.md → "İlk kurulum").
2. **Çalıştır:**
   - Geliştirirken: server'ı `server/` klasöründe dev profiliyle, client'ı `client/` klasöründe `npm start` ile başlat.
     Uygulama `http://localhost:4200` adresinden açılır.
   - Docker ile, repo kökünde:

     ```bash
     docker compose up -d                 # sadece PostgreSQL 18 (localhost:5433)
     docker compose --profile app up -d   # PostgreSQL 18 + server + client → http://localhost:4200
     ```

     `--profile app` için JWT anahtarlarının `server/keys/` altında olması gerekir; compose onları container'a bağlar.

## Gereksinimler

- JDK 25
- Node.js 26 LTS (en az 22.22.3)
- Docker Desktop (compose ve entegrasyon testleri için; Docker yoksa backend entegrasyon testleri otomatik atlanır)
