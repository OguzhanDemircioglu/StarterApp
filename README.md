# StarterApp

Yeni projelere başlangıç noktası olan şablon repo: Spring Boot backend ve Angular frontend tek repoda.
Yeni bir projeye bu repo kopyalanarak başlanır.

| Klasör / dosya | İçerik |
|---|---|
| [server/](server/README.md) | Spring Boot 4.1, Java 25, PostgreSQL. Kurulum ve çalıştırma: [server/README.md](server/README.md) |
| client/ | Angular (henüz eklenmedi) |
| [docs/Backend_Architecture.md](docs/Backend_Architecture.md) | Backend'in bağlayıcı kuralları ve tasarım kararları |
| [docker-compose.yml](docker-compose.yml) | Geliştirme ortamı: PostgreSQL 18 ve uygulamalar |

## Hızlı başlangıç

1. **Server'ı hazırla:** JWT anahtarlarını üret ve `server/.env` dosyasını oluştur
   (server/README.md → "İlk kurulum").
2. **Çalıştır:**
   - IDE'den: `server/` klasöründe dev profiliyle başlat (bkz. server/README.md → "Çalıştırma").
   - Docker ile, repo kökünde:

     ```bash
     docker compose up -d                 # sadece PostgreSQL 18 (localhost:5433)
     docker compose --profile app up -d   # PostgreSQL 18 + server (localhost:8080)
     ```

     `--profile app` için JWT anahtarlarının `server/keys/` altında olması gerekir; compose onları container'a bağlar.

## Gereksinimler

- JDK 25
- Docker Desktop (compose ve entegrasyon testleri için; Docker yoksa entegrasyon testleri otomatik atlanır)
