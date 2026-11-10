/**
 * Mezun Portalı sayfalarının ORTAK geçici verileri (birden fazla sayfada kullanılanlar). Sayfaya özel veriler
 * o sayfanın klasöründeki *.mock.ts dosyasındadır. Backend uçları yazıldığında bunlar bir API servisi ve
 * model dosyasıyla değiştirilecek; ekranlar sadece buradaki tiplere bağlıdır.
 */

export interface ContactInfo {
  icon: string;
  label: string;
  value: string;
}

export interface Experience {
  icon: string;
  title: string;
  organization: string;
  period: string;
}

export interface Education {
  school: string;
  schoolShort: string;
  department: string;
  period: string;
  degree: string;
}

export interface Institution {
  name: string;
  /** Göç İdaresi kendi amblemiyle, diğerleri genel bakanlık amblemiyle çizilir. */
  emblem: 'goc' | 'ministry';
}

export interface GraduateProfile {
  fullName: string;
  initials: string;
  department: string;
  university: string;
  graduation: string;
  city: string;
  summary: string;
  expertise: string;
  interests: string;
  languages: string;
  contacts: ContactInfo[];
  experiences: Experience[];
  educations: Education[];
}

/** Üst menü: kurumsal sitenin bağlantıları. Şimdilik bir yere gitmez; "Dijital Platform" bu portaldır. */
export const SITE_LINKS = ['Ana Sayfa', 'Kurumlar', 'Hizmetler', 'Duyurular', 'Dijital Platform', 'İletişim'];

export const MOCK_PROFILE: GraduateProfile = {
  fullName: 'Jennet Hojamova',
  initials: 'JH',
  department: 'Uluslararası İlişkiler',
  university: 'Gazi Üniversitesi',
  graduation: '2024 Mezunu',
  city: 'Ankara, Türkiye',
  summary:
    'Uluslararası ilişkiler alanında edindiğim akademik bilgi ve proje deneyimlerimi insan hareketliliği, ' +
    'göç yönetimi ve uluslararası iş birliği konularında katkı sağlamak için kullanmak istiyorum.',
  expertise: 'Göç Yönetimi, Uluslararası İlişkiler, Proje Yönetimi',
  interests: 'İnsan Hakları, Sürdürülebilir Kalkınma, Veri Analizi, Politika Araştırmaları',
  languages: 'İngilizce (İleri), Rusça (Orta)',
  contacts: [
    { icon: 'read', label: 'Mezuniyet Yılı', value: '2024' },
    { icon: 'solution', label: 'Çalışma Durumu', value: 'Çalışmıyorum' },
    { icon: 'mail', label: 'E-posta', value: 'jennet.hojamova@mail.com' },
    { icon: 'phone', label: 'Telefon', value: '+90 555 123 45 67' },
    { icon: 'environment', label: 'Konum', value: 'Ankara, Türkiye' },
    { icon: 'link', label: 'LinkedIn', value: 'linkedin.com/in/jennet-hojamova' },
  ],
  experiences: [
    {
      icon: 'bank',
      title: 'Stajyer',
      organization: 'Birleşmiş Milletler Mülteciler Yüksek Komiserliği (UNHCR)',
      period: 'Haziran 2023 – Ağustos 2023',
    },
    {
      icon: 'file-text',
      title: 'Proje Asistanı',
      organization: 'Uluslararası Göç Politikaları Araştırma Merkezi',
      period: 'Ocak 2022 – Mayıs 2022',
    },
    { icon: 'team', title: 'Gönüllü', organization: 'Kızılay Uluslararası İşler', period: 'Temmuz 2021 – Eylül 2021' },
  ],
  educations: [
    {
      school: 'Gazi Üniversitesi',
      schoolShort: 'GÜ',
      department: 'Uluslararası İlişkiler Bölümü',
      period: '2020 – 2024',
      degree: 'Lisans',
    },
  ],
};

/** Sunumdaki paydaş kurum ve kuruluşlar. */
export const INSTITUTIONS: Institution[] = [
  { name: 'T.C. Göç İdaresi Başkanlığı', emblem: 'goc' },
  { name: 'T.C. İçişleri Bakanlığı', emblem: 'ministry' },
  { name: 'T.C. Dışişleri Bakanlığı', emblem: 'ministry' },
  { name: 'T.C. Aile ve Sosyal Hizmetler Bakanlığı', emblem: 'ministry' },
  { name: 'T.C. Çalışma ve Sosyal Güvenlik Bakanlığı', emblem: 'ministry' },
  { name: 'T.C. Kültür ve Turizm Bakanlığı', emblem: 'ministry' },
  { name: 'T.C. Sanayi ve Teknoloji Bakanlığı', emblem: 'ministry' },
  { name: 'Diyanet İşleri Başkanlığı', emblem: 'ministry' },
  { name: 'Yükseköğretim Kurulu (YÖK)', emblem: 'ministry' },
  { name: 'Türkiye Maarif Vakfı', emblem: 'ministry' },
];

/** Dijital kimlik: mezunun Mezun Kartı. */
export interface GraduateCard {
  cardNo: string;
  holder: string;
  nationality: string;
  degree: string;
  group: 1 | 2 | 3;
  issuedAt: string;
  validUntil: string;
  status: 'Aktif' | 'Askıda' | 'Süresi doldu';
}

export const MOCK_CARD: GraduateCard = {
  cardNo: 'MK-2024-000184',
  holder: 'Jennet Hojamova',
  nationality: 'Türkmenistan',
  degree: 'Lisans – Gazi Üniversitesi',
  group: 2,
  issuedAt: '15.09.2024',
  validUntil: '15.09.2026',
  status: 'Aktif',
};

/** Mezun Kartının sağlayacağı haklar (sunum: "Mezun Kartının Sağlayacağı Haklar"). */
export interface RightGroup {
  group: 1 | 2 | 3;
  who: string[];
  rights: string[];
}

export const RIGHT_GROUPS: RightGroup[] = [
  {
    group: 1,
    who: ['Ön Lisans'],
    rights: [
      'Mezuniyet sonrası 2 yıl ikamet',
      'Staj imkânı',
      'Çok girişli vize (2 yıl) ve e-vize imkânı',
      'Aile üyelerine de kolaylık sağlanması (vize/ikamet)',
    ],
  },
  {
    group: 2,
    who: ['Lisans', 'Yüksek Lisans', 'UA Lise Mezunları'],
    rights: [
      'Mezuniyet sonrası 2 yıl ikamet',
      'Staj imkânı',
      'Çok girişli vize (5 yıl)',
      'Çalışma izni kriterlerinde istisna sağlanması',
      'Aile üyelerine de kolaylık sağlanması (vize/ikamet)',
    ],
  },
  {
    group: 3,
    who: ['YTB, YÖK Bursluları', 'Doktora Mezunları', 'Lisans veya Yüksek Lisans düzeyinde derece ile mezunlar'],
    rights: [
      'Mezuniyet sonrası 2 yıl ikamet',
      'Staj imkânı',
      'Çok girişli vize (5 yıl)',
      'Çalışma izni kriterlerinde istisna sağlanması',
      'Aile üyelerine de kolaylık sağlanması (vize/ikamet)',
      'Uzun dönem ikamet izinlerinde kolaylık sağlanması',
    ],
  },
];
