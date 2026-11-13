/** Mezun Kart hizmet kataloğu: geçici veri. Portalın Hizmetler sayfası ve kurumsal Hizmetler sayfası birlikte kullanır. */

export interface PortalService {
  id: number;
  icon: string;
  title: string;
  institution: string;
  description: string;
  /** Hangi gruplar yararlanabilir */
  groups: (1 | 2 | 3)[];
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

