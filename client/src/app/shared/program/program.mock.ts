/**
 * Mezun Kart programının ortak verileri (sunum: "mezun Kart Sunumu v1"). Public tanıtım sayfası, Mezun Portalı ve
 * yönetim paneli birlikte kullanır. Backend'e taşınana kadar geçici veridir.
 */

export interface Institution {
  name: string;
  /** Göç İdaresi kendi amblemiyle, diğerleri genel bakanlık amblemiyle çizilir. */
  emblem: 'goc' | 'ministry';
}

/** Üst menü: kurumsal sitenin bağlantıları. Şimdilik bir yere gitmez; "Dijital Platform" bu portaldır. */
export const SITE_LINKS = ['Ana Sayfa', 'Kurumlar', 'Hizmetler', 'Duyurular', 'Dijital Platform', 'İletişim'];

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

/** Sunum: "Mezun Kart Projesinin Öngörülen Çıktıları" */
export const OUTCOMES: { title: string; icon: string; items: string[] }[] = [
  {
    title: 'İstihdam ve Ekonomi',
    icon: 'rise',
    items: ['Nitelikli işgücünün teşviki', 'Girişim ve yatırımın artırılması', 'Ticari bağlantı kurma'],
  },
  {
    title: 'Bilim ve Teknoloji',
    icon: 'experiment',
    items: ['Bilimsel çalışmalara katkı', 'İleri düzey teknoloji için insan kaynağı'],
  },
  {
    title: 'Yükseköğretim',
    icon: 'read',
    items: ['Üniversitelerin uluslararası marka değerinin artırılması', 'Küresel rekabet gücüne katkı'],
  },
  {
    title: 'Kamu Diplomasisi',
    icon: 'flag',
    items: ['Kalıcı ve sürdürülebilir ülke bağları', 'Küresel etkileşim ağlarının güçlenmesi', 'Tanıtım'],
  },
];

/** Sunum: "Mezun Kart Projesinin Yol Haritası" */
export const ROADMAP: { title: string; done: boolean }[] = [
  { title: 'İlgili kurumlarla toplantılar ve arz süreci', done: true },
  { title: 'Göç İdaresi Başkanlığı tarafından kurumlarla protokol yapılması', done: true },
  { title: 'Kurumlar arası görev paylaşımı', done: true },
  { title: 'Mezun dijital platformunun ve Mezun Kartın tasarlanması', done: false },
  { title: 'Projenin tanıtımı', done: false },
  { title: 'Sürecin izlenmesi ve etki analizi', done: false },
];
