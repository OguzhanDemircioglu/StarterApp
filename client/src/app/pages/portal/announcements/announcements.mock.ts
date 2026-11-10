/** Duyurular sayfasının geçici verileri. Ana Sayfa da "son duyurular" için buradan okur. */

export type AnnouncementCategory = 'Mevzuat' | 'Kariyer' | 'Etkinlik' | 'Burs' | 'Sistem';

export interface Announcement {
  id: number;
  title: string;
  institution: string;
  category: AnnouncementCategory;
  /** YYYY-MM-DD */
  date: string;
  excerpt: string;
  body: string[];
  pinned?: boolean;
  unread?: boolean;
}

export const ANNOUNCEMENT_CATEGORIES: AnnouncementCategory[] = ['Mevzuat', 'Kariyer', 'Etkinlik', 'Burs', 'Sistem'];

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    title: 'Mezun Kart başvuruları başladı',
    institution: 'T.C. Göç İdaresi Başkanlığı',
    category: 'Sistem',
    date: '2026-11-03',
    excerpt: 'Türkiye’deki eğitim kurumlarından mezun olan uluslararası öğrenciler Mezun Kart için portal üzerinden başvurabilir.',
    body: [
      'Mezun Kart projesi, ülkemizde eğitim gören uluslararası öğrencilerin mezuniyet sonrasında ülkemizle sürdürülebilir bağlar kurmasını ve bu bağların güçlendirilmesini amaçlamaktadır.',
      'Başvurular Mezun Portalı’ndaki Hizmetler sayfasından yapılır. Mezuniyet durumu YÖK kayıtlarından otomatik olarak doğrulanır; ek belge gerekirse portal üzerinden bildirim gönderilir.',
      'Kart sahipleri, mezuniyet düzeylerine göre belirlenen gruptaki ikamet, vize, staj ve çalışma izni kolaylıklarından yararlanır.',
    ],
    pinned: true,
    unread: true,
  },
  {
    id: 2,
    title: 'Mezuniyet sonrası ikamet izni 2 yıl olarak uygulanacak',
    institution: 'T.C. Göç İdaresi Başkanlığı',
    category: 'Mevzuat',
    date: '2026-10-29',
    excerpt: 'Mezun Kart sahipleri, mezuniyet tarihinden itibaren 2 yıl süreyle ikamet izni alabilecek.',
    body: [
      'Tüm gruplardaki Mezun Kart sahipleri için mezuniyet sonrası ikamet izni süresi 2 yıl olarak belirlenmiştir.',
      'Mevcut öğrenci ikamet izni devam eden mezunlar, izin bitiminden en az 60 gün önce portal üzerinden başvuru yapmalıdır.',
    ],
    unread: true,
  },
  {
    id: 3,
    title: 'Çalışma izni başvurularında Mezun Kart istisnası',
    institution: 'T.C. Çalışma ve Sosyal Güvenlik Bakanlığı',
    category: 'Mevzuat',
    date: '2026-10-22',
    excerpt: 'Grup 2 ve Grup 3 kart sahipleri için çalışma izni değerlendirme kriterlerinde istisna uygulanacak.',
    body: [
      'Lisans, yüksek lisans ve doktora mezunları ile derece ile mezun olanlar, çalışma izni başvurularında yerli istihdam ve asgari ücret kriterlerinden muaf tutulacaktır.',
      'İşverenler başvuru sırasında adayın Mezun Kart numarasını belirtmelidir.',
    ],
  },
  {
    id: 4,
    title: 'Kamu kurumlarında 2027 dönemi staj kontenjanları açıklandı',
    institution: 'T.C. Cumhurbaşkanlığı',
    category: 'Kariyer',
    date: '2026-10-18',
    excerpt: 'Paydaş kurumlarda Mezun Kart sahiplerine ayrılan 450 staj kontenjanı Staj / Kariyer sayfasında yayında.',
    body: [
      'Dışişleri, İçişleri, Kültür ve Turizm, Sanayi ve Teknoloji bakanlıkları başta olmak üzere 12 kurumda toplam 450 staj kontenjanı açılmıştır.',
      'Başvurular 15 Aralık 2026 tarihine kadar Staj / Kariyer sayfasından yapılabilir.',
    ],
  },
  {
    id: 5,
    title: 'Mezun Buluşması 2026 kayıtları açıldı',
    institution: 'T.C. Göç İdaresi Başkanlığı',
    category: 'Etkinlik',
    date: '2026-10-12',
    excerpt: '21 Kasım’da Ankara’da yapılacak buluşmaya kayıtlar Etkinlikler sayfasından alınıyor.',
    body: ['Kontenjan 600 kişiyle sınırlıdır. Kayıt olan mezunlara etkinlikten bir hafta önce giriş kodu gönderilecektir.'],
  },
  {
    id: 6,
    title: 'Lisansüstü burs başvuruları',
    institution: 'Yurtdışı Türkler ve Akraba Topluluklar Başkanlığı (YTB)',
    category: 'Burs',
    date: '2026-10-05',
    excerpt: 'Türkiye’de lisansüstü eğitime devam etmek isteyen mezunlar için burs başvuruları 30 Kasım’a kadar açık.',
    body: ['Burslu olarak kabul edilen mezunlar Grup 3 kapsamına alınır ve uzun dönem ikamet kolaylığından yararlanır.'],
  },
  {
    id: 7,
    title: 'e-Vize başvurularında Mezun Kart ile hızlı işlem',
    institution: 'T.C. Dışişleri Bakanlığı',
    category: 'Mevzuat',
    date: '2026-09-28',
    excerpt: 'Grup 1 kart sahipleri e-vize başvurularında kart numaralarıyla hızlı işlemden yararlanabilecek.',
    body: ['e-Vize sisteminde “Mezun Kart Sahibi” seçeneği işaretlendiğinde kişisel bilgiler portal üzerinden otomatik doldurulur.'],
  },
  {
    id: 8,
    title: 'Planlı bakım çalışması',
    institution: 'Mezun Portalı',
    category: 'Sistem',
    date: '2026-09-20',
    excerpt: '22 Eylül 02:00–04:00 arasında portala erişim sağlanamayacaktır.',
    body: ['Bakım süresince başvuru ve mesajlaşma hizmetleri kullanılamayacaktır. Anlayışınız için teşekkür ederiz.'],
  },
];
