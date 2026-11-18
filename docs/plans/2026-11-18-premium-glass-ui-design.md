# Premium "liquid glass" arayüz — tasarım

Referans: masaüstündeki `Reel_50-main` (buzlu cam kapsül menü, arkasında kayan aktif hap, fareyi takip eden parlama, renkli bulanık arka plan).

## Kapsam

- Tanıtım sayfası (`/`) ve Mezun Portalı (`/user`). Yönetim paneli (`/admin`) ve giriş ekranı (`/login`) değişmez.
- Yalnız açık tema; gündüz/gece düğmesi yok.

## Kararlar

- **Kapsam sınıfı:** `mk-premium` sınıfı tanıtım ve portal iskeletinin host'una verilir. Verdana, büyük yazı ve büyük düğmeler yalnız bu sınıfın altında geçerlidir; admin etkilenmez.
- **Tipografi:** Verdana (yedek: Geneva, Tahoma, sans-serif). Gövde 16px, satır yüksekliği 1.6; başlıklar büyür (hero 56px, bölüm başlığı 36px).
- **Düğmeler:** hap biçimi, en az 48px yükseklik, 16px yazı; birincil düğme kırmızı degrade ve yumuşak kırmızı gölge. Odak halkası görünür.
- **Kartlar:** yarı saydam beyaz cam (blur), 20px köşe, katmanlı yumuşak gölge.
- **Arka plan:** sabit, yavaş süzülen bulanık blob'lar (kırmızı, lacivert-teal, sıcak amber). `prefers-reduced-motion` açıkken hareket durur.
- **Liquid nav:** paylaşılan `app-liquid-nav` bileşeni. Bağlantılar içerik olarak projekte edilir; `.active` olan bağlantının arkasına yaylı geçişli hap kayar, cam yüzeyde fare parlaması vardır. Tanıtımda sayfa içi bağlantılar, portalda router bağlantıları ile kullanılır.
- **Portal iskeleti:** üst bar cam; sol menü yuvarlatılmış, yüzen lacivert panel; aktif öğe kırmızı hap.

## Doğrulama

Tarayıcıda 1440px ve 375px genişlikte tanıtım ve portal sayfaları; konsol hatası yok; yatay kaydırma yok; derleme stil bütçesi uyarısı yok.
