/** Ana Sayfa akışının geçici verileri. Kişiler kurgusaldır. */

export interface FeedPost {
  id: number;
  author: string;
  initials: string;
  /** Avatar arka planı */
  color: string;
  /** Kurum gönderisi mi (amblemle gösterilir) */
  institution: boolean;
  subtitle: string;
  time: string;
  text: string;
  tag?: string;
  likes: number;
  comments: number;
  liked: boolean;
}

export interface Suggestion {
  name: string;
  initials: string;
  color: string;
  title: string;
  mutual: number;
}

export const FEED: FeedPost[] = [
  {
    id: 1,
    author: 'T.C. Göç İdaresi Başkanlığı',
    initials: 'Gİ',
    color: '#d71920',
    institution: true,
    subtitle: 'Kurum · Resmî duyuru',
    time: '2 saat önce',
    text:
      'Mezun Kart başvuruları başladı! Türkiye’deki eğitim kurumlarından mezun olan uluslararası öğrenciler, ' +
      'Mezun Portalı’ndaki Hizmetler sayfasından başvurarak ikamet, vize, staj ve çalışma izni kolaylıklarından yararlanabilir.',
    tag: 'Duyuru',
    likes: 1284,
    comments: 96,
    liked: true,
  },
  {
    id: 2,
    author: 'Aynur Mammadova',
    initials: 'AM',
    color: '#2b7a78',
    institution: false,
    subtitle: 'Veri Analisti · Anadolu Lojistik · ODTÜ 2023',
    time: '5 saat önce',
    text:
      'Yeni bir işe başladığımı paylaşmaktan mutluluk duyuyorum! Mezun Kart’ın çalışma izni istisnası sayesinde ' +
      'tüm süreç iki haftada tamamlandı. Kariyer fuarında tanıştığım herkese teşekkürler.',
    tag: 'Yeni iş',
    likes: 342,
    comments: 41,
    liked: false,
  },
  {
    id: 3,
    author: 'Türkiye Maarif Vakfı',
    initials: 'TM',
    color: '#1f5aa6',
    institution: true,
    subtitle: 'Kurum · Etkinlik',
    time: 'Dün',
    text:
      'CV ve Mülakat Hazırlığı Webinarı 8 Aralık’ta! Türkiye’deki işverenlerin beklentilerini ve Türkçe CV hazırlamanın ' +
      'püf noktalarını konuşacağız. Kayıt için Etkinlikler sayfasını ziyaret edin.',
    tag: 'Etkinlik',
    likes: 187,
    comments: 12,
    liked: false,
  },
  {
    id: 4,
    author: 'Daniyar Seitkali',
    initials: 'DS',
    color: '#8a5a44',
    institution: false,
    subtitle: 'Araştırma Görevlisi · Hacettepe Üniversitesi',
    time: '2 gün önce',
    text:
      'Mezun Araştırmacılar Sempozyumu’na “Orta Asya’dan Türkiye’ye öğrenci hareketliliği” başlıklı bildirimle kabul aldım. ' +
      'Ocak’ta Gazi Üniversitesi’nde görüşmek üzere!',
    likes: 96,
    comments: 8,
    liked: false,
  },
];

export const SUGGESTIONS: Suggestion[] = [
  { name: 'Aigerim Nurlanovna', initials: 'AN', color: '#6d4c9f', title: 'Dış Ticaret Uzmanı · İstanbul', mutual: 12 },
  { name: 'Mehmet Yazıcı', initials: 'MY', color: '#2b7a78', title: 'İK Uzmanı · Bilge Yazılım', mutual: 4 },
  { name: 'Farrukh Tashkentov', initials: 'FT', color: '#b5651d', title: 'Gazi Üniversitesi 2024 Mezunu', mutual: 23 },
];
