# server

StarterApp'in Spring Boot backend'i. Bağlayıcı kurallar ve tasarım kararları:
[docs/Backend_Architecture.md](../docs/Backend_Architecture.md).

| | |
|---|---|
| Java | 25 |
| Spring Boot | 4.1.x |
| Veritabanı | PostgreSQL 18 |
| Build | Maven (`./mvnw`, Windows PowerShell'de `.\mvnw.cmd`) |

## İlk kurulum

### 1. JWT anahtarları

Uygulama anahtar üretmez; anahtarlar repoya konmaz (`keys/` klasörü `.gitignore`'dadır). `server/` klasöründe:

```bash
mkdir -p keys
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out keys/private.pem
openssl rsa -in keys/private.pem -pubout -out keys/public.pem
```

Windows'ta `openssl` Git Bash ile birlikte gelir. Docker'da `keys/` klasörü container'a bağlandığı için Linux'ta
dosyaların okunabilir olması gerekir: `chmod 644 keys/*.pem`.

### 2. Veritabanı

Seçeneklerden biri:

- **Docker ile:** `docker compose up -d` → PostgreSQL 18, `localhost:5433` portunda. Sonra şu değişkenleri verin:
  `DB_URL=jdbc:postgresql://localhost:5433/starterapp`, `DB_USERNAME=starterapp`, `DB_PASSWORD=starterapp`.
- **Yerel PostgreSQL ile:** `starterapp` adında bir veritabanı açın. dev profili varsayılan olarak
  `localhost:5432/starterapp` adresine `postgres/postgres` ile bağlanır; farklıysa `DB_URL`, `DB_USERNAME`,
  `DB_PASSWORD` ile değiştirin.

Tablolar ilk açılışta Hibernate tarafından (`ddl-auto=update`), başlangıç verileri migration class'larıyla oluşturulur.

### 3. Çalıştırma

Profil bilerek varsayılan verilmez; `dev` ya da `prod` açıkça seçilmelidir.

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

IDE'den çalıştırırken environment variable olarak `SPRING_PROFILES_ACTIVE=dev` verin.

| | dev profili |
|---|---|
| API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| İlk admin | `admin@starterapp.local` / `Admin12345` |
| CORS | `http://localhost:4200` |

## Testler

```bash
./mvnw test
```

- Unit ve kontrat testleri her yerde çalışır.
- `AuthFlowIntegrationTest` gerçek bir PostgreSQL 18'i Testcontainers ile açar; **Docker yoksa otomatik atlanır**.

## Docker

```bash
docker build -t starterapp-server .
docker compose --profile app up -d
```

Prod'da gereken değişkenlerin listesi [.env.example](.env.example) dosyasındadır.

## Yeni modül ekleme

Referans modül `modules/category`'dir. Örnek olarak `Product` modülü:

1. **Klasör:** `modules/category` klasörünü `modules/product` olarak kopyalayın, sınıf ve paket adlarını değiştirin.
2. **Entity:** `Product extends BaseEntity`, sınıfa `@Entity`, `@SoftDelete`, `@Table(name = "products")` ekleyin.
   - `@Data` değil `@Getter`/`@Setter` kullanın.
   - Her `@ManyToOne` için `fetch = FetchType.LAZY`.
   - Kolon adlarını `@Column(name = "...")` ile açıkça yazın (migration SQL'leri bu adları kullanır).
   - Benzersiz alanlara `@Column(unique = true)` **koymayın** (bkz. 8. adım).
3. **DTO'lar (`dto/`):** `ProductCreateRequest`, `ProductUpdateRequest`, `ProductResponse` record olarak.
   - Update request `VersionedRequest`'i uygular ve `@NotNull(message = GlobalMessages.VERSION_REQUIRED) Long version` taşır.
   - Response `version` alanını döner (frontend güncellemede geri gönderir).
   - Her validation anotasyonuna `message = ProductMessages.XXX` verin; mesajı olmayan validation hataları `invalid_request` döner.
4. **Mesajlar:** `ProductMessages` sınıfı; anahtarlar `product_` ile başlar, snake_case'tir.
5. **Mapper:** `@Mapper(config = MapperSettings.class) interface ProductMapper extends BaseMapper<...>` — gövdesi yok.
   Eşlenmemiş bir alan kalırsa proje derlenmez.
6. **Servis:** `ProductService extends BaseService<...>` ve `ProductServiceImpl extends BaseServiceImpl<...>`.
   İş kurallarını kancalarda yazın: `validateCreate`, `prepareCreate`, `validateUpdate`, `validateDelete`.
   İş kuralı ihlalinde `throw new BusinessException(ProductMessages.XXX)` (422).
7. **Controller:** `CategoryController` kalıbı; dönüş tipi her zaman `ApiResponse<T>`.
   Sadece admin'e açıksa sınıfa `@PreAuthorize("hasRole('ADMIN')")`; herkes okuyup sadece admin yazıyorsa
   create/update/delete metotlarına.
8. **Migration:** `migration/versions` altına bir sonraki numarayla `V005_ProductModule` yazın
   (`V004_CategoryModule` örnek alınır):
   - Benzersiz alanlar için silinmemiş kayıtlara özel index:
     `CREATE UNIQUE INDEX IF NOT EXISTS ux_products_code ON products (code) WHERE deleted = false`
   - Menü kaydı: `id` yazmadan, üst menüye alt sorguyla referans vererek;
     `version = 0, deleted = false, created_at = now()` açıkça verilir.
9. **Test:** `CategoryServiceImplTest` örnek alınarak iş kurallarının testleri.

### Kurallar (özet)

- Uygulanmış bir migration class'ı **değiştirilmez**; yeni sürüm yazılır.
- Var olan kolonu değiştirmek (ad, tip, uzunluk) `ddl-auto` ile olmaz → migration class'ında `ALTER`.
- Enum'a yeni değer eklendiğinde Hibernate'in oluşturduğu `check` constraint güncellenmez → migration class'ında `ALTER`.
- Yeni kolonlar nullable ya da default değerli olmalıdır (Swarm'da rolling update sırasında eski sürüm de çalışır).
- Tablo boşaltılırken `TRUNCATE tablo RESTART IDENTITY` kullanılır.
- Response formatı `{ success, message, data, traceId }` **değişmez**.
