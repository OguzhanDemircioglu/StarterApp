/** Hizmetler sayfasının geçici verileri: mezunun başvuruları. Hizmet kataloğu shared/program/services.mock.ts içindedir. */

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
