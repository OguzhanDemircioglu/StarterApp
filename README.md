# StarterApp

Yeni projelere başlangıç noktası olan şablon repo: Spring Boot backend ve Angular frontend tek repoda.
Yeni bir projeye bu repo kopyalanarak başlanır.

| Klasör / dosya | İçerik |
|---|---|
| [server/](server/README.md) | Spring Boot 4.1, Java 25, PostgreSQL (yerelde H2). Kurulum ve çalıştırma: [server/README.md](server/README.md) |
| [client/](client/README.md) | Angular 22, NG-ZORRO, NgRx. Kurulum ve çalıştırma: [client/README.md](client/README.md) |
| [deploy/](deploy/README.md) | Kurulum: dışarıya açık sunucu (public + Mezun Portalı) ve kapalı ağ sunucusu (yönetim paneli) |
| [docs/Backend_Architecture.md](docs/Backend_Architecture.md) | Backend'in bağlayıcı kuralları ve tasarım kararları |
| [docs/Frontend_Architecture.md](docs/Frontend_Architecture.md) | Frontend'in bağlayıcı kuralları ve tasarım kararları |
| [docs/Security_Roadmap.md](docs/Security_Roadmap.md) | Taslak: audit, 2FA ve güvenlik sertleştirme yol haritası. Bu dalda SUPERADMIN rolü ve yüzey ayrımı uygulandı (Backend_Architecture.md §9) |
| [docker-compose.yml](docker-compose.yml) | Geliştirme ortamı: iki yüzey yan yana (PostgreSQL + dışarıya açık ve kapalı ağ server/client'ları); isteğe bağlı sadece yerel PostgreSQL 18 |

## Hızlı başlangıç

1. **Server'ı hazırla:** JWT anahtarlarını üret ve `server/.env` dosyasını oluştur
   (server/README.md → "İlk kurulum"). Yerel geliştirme için veritabanı kurmak gerekmez: dev profili H2 kullanır.
2. **Çalıştır:**
   - Geliştirirken: server'ı `server/` klasöründe dev profiliyle, client'ı `client/` klasöründe `npm start` ile başlat.
     Uygulama `http://localhost:4200` adresinden açılır (iki yüzey birlikte: `/`, `/user`, `/admin`).
   - Docker ile, repo kökünde:

     ```bash
     docker compose --profile app up -d   # dışarıya açık yüzey → :4200, kapalı ağ yüzeyi → :4300
     docker compose --profile db up -d    # isteğe bağlı: sadece yerel PostgreSQL 18 (localhost:5433)
     ```

     `--profile app` için `server/.env` ve `server/keys/` hazır olmalıdır. Server'lar admin bilgilerini `server/.env`'den
     alır; veritabanı compose'daki PostgreSQL'dir (iki server aynı veritabanını paylaşır).
   - Gerçek kurulum (dışarıya açık sunucu + kapalı ağ sunucusu): [deploy/README.md](deploy/README.md).

## Gereksinimler

- JDK 25
- Node.js 26 LTS (en az 22.22.3)
- Docker Desktop (compose ve entegrasyon testleri için; Docker yoksa backend entegrasyon testleri otomatik atlanır)
