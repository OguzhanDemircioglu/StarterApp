/** Yönetim paneli anasayfasının geçici verileri. Kişiler kurgusaldır; backend rapor uçları gelince değişir. */

export interface Kpi {
  icon: string;
  label: string;
  value: string;
  note: string;
  trend: 'up' | 'down' | 'flat';
}

export type ApplicationStatus = 'Yeni' | 'Belge bekliyor' | 'Değerlendirmede';

export interface PendingApplication {
  id: string;
  name: string;
  initials: string;
  color: string;
  nationality: string;
  service: string;
  group: 1 | 2 | 3;
  date: string;
  status: ApplicationStatus;
}

export interface Share {
  label: string;
  value: number;
}

export interface AuditEntry {
  icon: string;
  who: string;
  what: string;
  when: string;
}

export const KPIS: Kpi[] = [
  { icon: 'team', label: 'Kayıtlı mezun', value: '12.480', note: 'Bu ay +518', trend: 'up' },
  {
    icon: 'idcard',
    label: 'Aktif Mezun Kart',
    value: '9.812',
    note: '%78,6 kart oranı',
    trend: 'up',
  },
  {
    icon: 'clock-circle',
    label: 'Bekleyen başvuru',
    value: '342',
    note: 'Bugün 24 yeni',
    trend: 'flat',
  },
  { icon: 'solution', label: 'Açık ilan', value: '186', note: '12 kurum, 64 işveren', trend: 'up' },
];

export const PENDING: PendingApplication[] = [
  {
    id: 'IK-2026-118204',
    name: 'Jennet Hojamova',
    initials: 'JH',
    color: '#d71920',
    nationality: 'Türkmenistan',
    service: 'İkamet İzni',
    group: 2,
    date: '28.10.2026',
    status: 'Değerlendirmede',
  },
  {
    id: 'AV-2026-004512',
    name: 'Jennet Hojamova',
    initials: 'JH',
    color: '#d71920',
    nationality: 'Türkmenistan',
    service: 'Aile Üyesi Vize',
    group: 2,
    date: '04.11.2026',
    status: 'Belge bekliyor',
  },
  {
    id: 'CI-2026-002871',
    name: 'Aynur Mammadova',
    initials: 'AM',
    color: '#2b7a78',
    nationality: 'Azerbaycan',
    service: 'Çalışma İzni İstisnası',
    group: 2,
    date: '08.11.2026',
    status: 'Yeni',
  },
  {
    id: 'UD-2026-000417',
    name: 'Daniyar Seitkali',
    initials: 'DS',
    color: '#8a5a44',
    nationality: 'Kazakistan',
    service: 'Uzun Dönem İkamet',
    group: 3,
    date: '08.11.2026',
    status: 'Değerlendirmede',
  },
  {
    id: 'VZ-2026-090955',
    name: 'Farrukh Tashkentov',
    initials: 'FT',
    color: '#b5651d',
    nationality: 'Özbekistan',
    service: 'Çok Girişli Vize',
    group: 2,
    date: '09.11.2026',
    status: 'Yeni',
  },
  {
    id: 'EV-2026-011320',
    name: 'Amina Kurbanova',
    initials: 'AK',
    color: '#6d4c9f',
    nationality: 'Kırgızistan',
    service: 'e-Vize Hızlı Başvuru',
    group: 1,
    date: '10.11.2026',
    status: 'Yeni',
  },
];

/** Kart sahiplerinin gruplara dağılımı (yüzde). */
export const GROUP_SHARES: Share[] = [
  { label: 'Grup 1 · Ön lisans', value: 14 },
  { label: 'Grup 2 · Lisans, yüksek lisans', value: 68 },
  { label: 'Grup 3 · Burslu, doktora, derece', value: 18 },
];

/** Uyruğa göre kayıtlı mezun sayısı (ilk 6). */
export const NATIONALITIES: Share[] = [
  { label: 'Azerbaycan', value: 2140 },
  { label: 'Türkmenistan', value: 1985 },
  { label: 'Kazakistan', value: 1320 },
  { label: 'Özbekistan', value: 1104 },
  { label: 'Kırgızistan', value: 896 },
  { label: 'Somali', value: 702 },
];

/** Kuruma göre bu ayki hizmet talebi. */
export const INSTITUTION_REQUESTS: Share[] = [
  { label: 'T.C. Göç İdaresi Başkanlığı', value: 1240 },
  { label: 'T.C. Dışişleri Bakanlığı', value: 812 },
  { label: 'T.C. Çalışma ve Sosyal Güvenlik Bakanlığı', value: 486 },
  { label: 'Yükseköğretim Kurulu (YÖK)', value: 322 },
  { label: 'T.C. Kültür ve Turizm Bakanlığı', value: 141 },
];

export const AUDIT: AuditEntry[] = [
  {
    icon: 'check-circle',
    who: 'Sistem Yöneticisi',
    what: 'VZ-2026-090311 vize başvurusunu onayladı',
    when: '10 dk önce',
  },
  {
    icon: 'file-done',
    who: 'YÖK entegrasyonu',
    what: '128 mezunun mezuniyet bilgisini doğruladı',
    when: '1 saat önce',
  },
  {
    icon: 'notification',
    who: 'Sistem Yöneticisi',
    what: '“Mezun Kart başvuruları başladı” duyurusunu yayımladı',
    when: 'Dün',
  },
  {
    icon: 'solution',
    who: 'Bilge Yazılım Teknoloji',
    what: '“Ar-Ge Stajyeri” ilanını onaya gönderdi',
    when: 'Dün',
  },
  {
    icon: 'calendar',
    who: 'Sistem Yöneticisi',
    what: '“Mezun Buluşması 2026” etkinliğini oluşturdu',
    when: '12 Eki',
  },
];
