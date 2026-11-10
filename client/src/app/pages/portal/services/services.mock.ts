/** Hizmetler sayfasının geçici verileri: hizmet kataloğu ve mezunun başvuruları. */

export interface PortalService {
  id: number;
  icon: string;
  title: string;
  institution: string;
  description: string;
  /** Hangi gruplar yararlanabilir */
  groups: (1 | 2 | 3)[];
}

export interface ServiceApplication {
  id: string;
  title: string;
  institution: string;
  appliedAt: string;
  steps: string[];
  /** Etkin adımın sırası (0’dan başlar); status o adımın durumudur. */
  current: number;
  status: 'process' | 'wait' | 'error' | 'finish';
  note: string;
}

export const SERVICES: PortalService[] = [
  {
    id: 1,
    icon: 'home',
    title: 'Mezuniyet Sonrası İkamet İzni',
    institution: 'T.C. Göç İdaresi Başkanlığı',
    description: 'Mezuniyet tarihinden itibaren 2 yıl geçerli ikamet izni başvurusu.',
    groups: [1, 2, 3],
  },
  {
    id: 2,
    icon: 'global',
    title: 'Çok Girişli Vize',
    institution: 'T.C. Dışişleri Bakanlığı',
    description: 'Grup 1 için 2 yıl, Grup 2 ve 3 için 5 yıl geçerli çok girişli vize.',
    groups: [1, 2, 3],
  },
  {
    id: 3,
    icon: 'laptop',
    title: 'e-Vize Hızlı Başvuru',
    institution: 'T.C. Dışişleri Bakanlığı',
    description: 'Kart numarasıyla bilgileri otomatik doldurulan e-vize başvurusu.',
    groups: [1],
  },
  {
    id: 4,
    icon: 'audit',
    title: 'Çalışma İzni İstisnası',
    institution: 'T.C. Çalışma ve Sosyal Güvenlik Bakanlığı',
    description: 'Çalışma izni değerlendirme kriterlerinde Mezun Kart istisnası.',
    groups: [2, 3],
  },
  {
    id: 5,
    icon: 'usergroup-add',
    title: 'Aile Üyesi Vize / İkamet Kolaylığı',
    institution: 'T.C. Göç İdaresi Başkanlığı',
    description: 'Eş ve çocuklar için vize ve ikamet başvurularında kolaylık.',
    groups: [1, 2, 3],
  },
  {
    id: 6,
    icon: 'safety-certificate',
    title: 'Uzun Dönem İkamet Kolaylığı',
    institution: 'T.C. Göç İdaresi Başkanlığı',
    description: 'Uzun dönem ikamet izni başvurularında süre ve belge kolaylığı.',
    groups: [3],
  },
  {
    id: 7,
    icon: 'solution',
    title: 'Kamu Kurumlarında Staj',
    institution: 'Paydaş kurumlar',
    description: 'Paydaş kurumlarda Mezun Kart sahiplerine ayrılan staj kontenjanları.',
    groups: [1, 2, 3],
  },
  {
    id: 8,
    icon: 'file-done',
    title: 'Diploma ve Belge Doğrulama',
    institution: 'Yükseköğretim Kurulu (YÖK)',
    description: 'İşverenler ve kurumlar için karekodlu mezuniyet belgesi.',
    groups: [1, 2, 3],
  },
];

export const SERVICE_APPLICATIONS: ServiceApplication[] = [
  {
    id: 'IK-2026-118204',
    title: 'Mezuniyet Sonrası İkamet İzni',
    institution: 'T.C. Göç İdaresi Başkanlığı',
    appliedAt: '28.10.2026',
    steps: ['Başvuru', 'Belge kontrolü', 'Değerlendirme', 'Sonuç'],
    current: 2,
    status: 'process',
    note: 'Başvurunuz il göç idaresi müdürlüğünde değerlendiriliyor.',
  },
  {
    id: 'AV-2026-004512',
    title: 'Aile Üyesi Vize Kolaylığı',
    institution: 'T.C. Göç İdaresi Başkanlığı',
    appliedAt: '04.11.2026',
    steps: ['Başvuru', 'Belge kontrolü', 'Değerlendirme', 'Sonuç'],
    current: 1,
    status: 'error',
    note: 'Eksik belge: evlilik cüzdanının apostilli tercümesi yüklenmelidir.',
  },
  {
    id: 'VZ-2026-090311',
    title: 'Çok Girişli Vize (5 yıl)',
    institution: 'T.C. Dışişleri Bakanlığı',
    appliedAt: '12.09.2026',
    steps: ['Başvuru', 'Belge kontrolü', 'Değerlendirme', 'Sonuç'],
    current: 3,
    status: 'finish',
    note: 'Vizeniz onaylandı. Geçerlilik: 12.09.2031',
  },
];
