/**
 * Kurumlar sayfasının geçici verileri: paydaş kurumların programdaki görevleri. Kurum listesi ve amblemleri
 * shared/program/program.mock.ts'teki INSTITUTIONS'tadır; burada kurum adıyla eşlenir. Görev paylaşımı sunumdaki
 * "Kurumlar arası görev paylaşımı" başlığına göre örneklenmiştir.
 */

export type InstitutionArea = 'Koordinasyon' | 'İkamet ve Vize' | 'İstihdam' | 'Eğitim' | 'Kültür ve Sosyal';

export interface InstitutionRole {
  area: InstitutionArea;
  summary: string;
  duties: string[];
  website: string;
}

export const INSTITUTION_AREAS: InstitutionArea[] = ['Koordinasyon', 'İkamet ve Vize', 'İstihdam', 'Eğitim', 'Kültür ve Sosyal'];

export const INSTITUTION_ROLES: Record<string, InstitutionRole> = {
  'T.C. Göç İdaresi Başkanlığı': {
    area: 'Koordinasyon',
    summary: 'Programın koordinatör kurumu; Mezun Kartı düzenler ve Mezun Dijital Platformu’nu yönetir.',
    duties: ['Mezun Kart başvuru ve düzenleme', 'Mezuniyet sonrası ve aile üyesi ikamet izinleri', 'Kurumlar arası protokollerin takibi'],
    website: 'https://www.goc.gov.tr',
  },
  'T.C. İçişleri Bakanlığı': {
    area: 'Koordinasyon',
    summary: 'Programın il düzeyinde valilikler aracılığıyla uygulanmasını ve mevzuat uyumunu sağlar.',
    duties: ['İl düzeyinde uygulama ve izleme', 'Mevzuat düzenlemelerine katkı'],
    website: 'https://www.icisleri.gov.tr',
  },
  'T.C. Dışişleri Bakanlığı': {
    area: 'İkamet ve Vize',
    summary: 'Çok girişli vize ve e-vize kolaylıklarını yürütür; yurt dışındaki mezunlarla bağı temsilcilikler üzerinden sürdürür.',
    duties: ['Çok girişli vize (2 ve 5 yıl)', 'e-Vize hızlı başvuru', 'Kamu diplomasisi ve dış temsilcilik ağı'],
    website: 'https://www.mfa.gov.tr',
  },
  'T.C. Aile ve Sosyal Hizmetler Bakanlığı': {
    area: 'Kültür ve Sosyal',
    summary: 'Mezunların ve aile üyelerinin sosyal uyumuna yönelik destek programlarını yürütür.',
    duties: ['Aile üyelerine yönelik uyum programları', 'Sosyal destek hizmetlerine yönlendirme'],
    website: 'https://www.aile.gov.tr',
  },
  'T.C. Çalışma ve Sosyal Güvenlik Bakanlığı': {
    area: 'İstihdam',
    summary: 'Çalışma izni değerlendirmesinde Mezun Kart istisnasını uygular, staj ve istihdam olanaklarını duyurur.',
    duties: ['Çalışma izni kriterlerinde istisna', 'Staj ve iş ilanlarının duyurulması'],
    website: 'https://www.csgb.gov.tr',
  },
  'T.C. Kültür ve Turizm Bakanlığı': {
    area: 'Kültür ve Sosyal',
    summary: 'Mezun buluşmaları, kültür programları ve programın uluslararası tanıtımına destek verir.',
    duties: ['Kültür ve sanat etkinlikleri', 'Programın tanıtımı'],
    website: 'https://www.ktb.gov.tr',
  },
  'T.C. Sanayi ve Teknoloji Bakanlığı': {
    area: 'İstihdam',
    summary: 'Teknoloji ve girişimcilik ekosisteminde mezunlara yönelik staj, Ar-Ge ve yatırım fırsatlarını paylaşır.',
    duties: ['Teknopark ve Ar-Ge staj olanakları', 'Girişimcilik ve yatırım desteklerine yönlendirme'],
    website: 'https://www.sanayi.gov.tr',
  },
  'Diyanet İşleri Başkanlığı': {
    area: 'Eğitim',
    summary: 'Uluslararası ilahiyat programlarından mezun olanlarla akademik ve kültürel bağların sürdürülmesine katkı sağlar.',
    duties: ['Uluslararası ilahiyat mezunlarıyla iletişim', 'Akademik ve kültürel programlar'],
    website: 'https://www.diyanet.gov.tr',
  },
  'Yükseköğretim Kurulu (YÖK)': {
    area: 'Eğitim',
    summary: 'Mezuniyet bilgilerini doğrular; Mezun Kart başvurularında mezuniyet düzeyi YÖK kayıtlarından alınır.',
    duties: ['Mezuniyet ve derece doğrulama', 'Karekodlu diploma ve belge doğrulama'],
    website: 'https://www.yok.gov.tr',
  },
  'Türkiye Maarif Vakfı': {
    area: 'Eğitim',
    summary: 'Yurt dışındaki Maarif okullarından gelen öğrencilerle ve uluslararası lise mezunlarıyla bağı güçlendirir.',
    duties: ['Uluslararası lise mezunlarıyla iletişim', 'Yurt dışı mezun ağına katkı'],
    website: 'https://turkiyemaarif.org',
  },
};
