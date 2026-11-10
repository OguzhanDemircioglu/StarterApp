/** Staj / Kariyer sayfasının geçici verileri. Özel sektör firmaları kurgusaldır. */

export type JobType = 'Staj' | 'Tam zamanlı' | 'Yarı zamanlı' | 'Proje';

export interface Job {
  id: number;
  title: string;
  organization: string;
  city: string;
  type: JobType;
  field: string;
  /** Kamu kurumu ilanı mı (paydaş kurumlar) */
  publicSector: boolean;
  /** Mezun Kart çalışma izni istisnasıyla uyumlu mu */
  workPermitExempt: boolean;
  postedDaysAgo: number;
  deadline: string;
  applicants: number;
  summary: string;
  saved: boolean;
}

export type ApplicationStatus = 'Gönderildi' | 'İnceleniyor' | 'Mülakat' | 'Olumsuz';

export interface JobApplication {
  jobId: number;
  appliedAt: string;
  status: ApplicationStatus;
  note: string;
}

export const JOB_TYPES: JobType[] = ['Staj', 'Tam zamanlı', 'Yarı zamanlı', 'Proje'];

export const JOBS: Job[] = [
  {
    id: 1,
    title: 'Uluslararası İlişkiler Stajyeri',
    organization: 'T.C. Dışişleri Bakanlığı',
    city: 'Ankara',
    type: 'Staj',
    field: 'Uluslararası İlişkiler',
    publicSector: true,
    workPermitExempt: true,
    postedDaysAgo: 2,
    deadline: '15.12.2026',
    applicants: 184,
    summary: 'Orta Asya ve Kafkasya Genel Müdürlüğünde 3 aylık staj. Rusça bilgisi tercih sebebidir.',
    saved: true,
  },
  {
    id: 2,
    title: 'Göç Politikaları Uzman Yardımcısı',
    organization: 'T.C. Göç İdaresi Başkanlığı',
    city: 'Ankara',
    type: 'Tam zamanlı',
    field: 'Kamu Yönetimi',
    publicSector: true,
    workPermitExempt: true,
    postedDaysAgo: 4,
    deadline: '30.11.2026',
    applicants: 96,
    summary: 'Uluslararası koruma ve düzensiz göç alanlarında politika raporları hazırlanmasına destek.',
    saved: false,
  },
  {
    id: 3,
    title: 'Veri Analisti (Rusça bilen)',
    organization: 'Anadolu Lojistik A.Ş.',
    city: 'İstanbul',
    type: 'Tam zamanlı',
    field: 'Veri Analizi',
    publicSector: false,
    workPermitExempt: true,
    postedDaysAgo: 1,
    deadline: '05.12.2026',
    applicants: 57,
    summary: 'Orta Asya hatlarındaki sevkiyat verilerinin analizi ve raporlanması. SQL ve Excel bilgisi beklenir.',
    saved: false,
  },
  {
    id: 4,
    title: 'İhracat Sorumlusu – Orta Asya',
    organization: 'Kervan Tekstil',
    city: 'Bursa',
    type: 'Tam zamanlı',
    field: 'Dış Ticaret',
    publicSector: false,
    workPermitExempt: true,
    postedDaysAgo: 6,
    deadline: '20.12.2026',
    applicants: 41,
    summary: 'Türkmenistan, Özbekistan ve Kazakistan pazarlarında müşteri ilişkileri ve ihracat operasyonları.',
    saved: true,
  },
  {
    id: 5,
    title: 'Proje Asistanı',
    organization: 'Türkiye Maarif Vakfı',
    city: 'Ankara',
    type: 'Proje',
    field: 'Proje Yönetimi',
    publicSector: true,
    workPermitExempt: true,
    postedDaysAgo: 9,
    deadline: '10.12.2026',
    applicants: 73,
    summary: '6 aylık uluslararası eğitim iş birliği projesinde koordinasyon ve raporlama desteği.',
    saved: false,
  },
  {
    id: 6,
    title: 'Kültür Turizmi Rehber Asistanı',
    organization: 'T.C. Kültür ve Turizm Bakanlığı',
    city: 'Nevşehir',
    type: 'Yarı zamanlı',
    field: 'Turizm',
    publicSector: true,
    workPermitExempt: false,
    postedDaysAgo: 12,
    deadline: '01.12.2026',
    applicants: 22,
    summary: 'Yabancı ziyaretçi gruplarına eşlik ve çok dilli tanıtım materyallerinin hazırlanması.',
    saved: false,
  },
  {
    id: 7,
    title: 'Ar-Ge Stajyeri (Yazılım)',
    organization: 'Bilge Yazılım Teknoloji',
    city: 'Ankara',
    type: 'Staj',
    field: 'Yazılım',
    publicSector: false,
    workPermitExempt: true,
    postedDaysAgo: 3,
    deadline: '18.12.2026',
    applicants: 139,
    summary: 'Teknokent’te yapay zekâ destekli belge işleme projesinde 6 aylık uzun dönem staj.',
    saved: false,
  },
  {
    id: 8,
    title: 'Tercüman (Türkmence – Türkçe)',
    organization: 'Türk Kızılay',
    city: 'İstanbul',
    type: 'Proje',
    field: 'Çeviri',
    publicSector: false,
    workPermitExempt: false,
    postedDaysAgo: 15,
    deadline: '25.11.2026',
    applicants: 18,
    summary: 'İnsani yardım programlarında saha çevirmenliği ve belge çevirisi.',
    saved: false,
  },
];

export const MY_APPLICATIONS: JobApplication[] = [
  { jobId: 2, appliedAt: '06.11.2026', status: 'İnceleniyor', note: 'Başvurunuz kurum tarafından değerlendiriliyor.' },
  { jobId: 5, appliedAt: '02.11.2026', status: 'Mülakat', note: 'Çevrimiçi mülakat: 14 Kasım 2026, 10:30' },
  { jobId: 8, appliedAt: '27.10.2026', status: 'Olumsuz', note: 'Pozisyon için başka bir adayla devam edildi.' },
  { jobId: 1, appliedAt: '09.11.2026', status: 'Gönderildi', note: 'Başvurunuz kuruma iletildi.' },
];

export const CITIES = ['Ankara', 'İstanbul', 'Bursa', 'Nevşehir'];
