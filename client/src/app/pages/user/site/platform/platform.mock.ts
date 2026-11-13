/** Dijital Platform sayfasının metinleri. Program bilgileri sunumdan ("mezun Kart Sunumu v1") alınmıştır; geçici veridir. */

export const PROGRAM_INTRO = {
  eyebrow: 'GÖÇ İDARESİ BAŞKANLIĞI KOORDİNASYONUNDA',
  title: 'Mezun Kart Programı',
  text:
    'Türkiye’deki eğitim kurumlarından mezun olan uluslararası öğrencilerin ülkemizle bilimsel, ekonomik, kültürel, ' +
    'mesleki ve diplomatik bağlarını mezuniyetten sonra da sürdürmesi için hazırlanan kurumlar arası programdır.',
};

/** Sunum: "Program Amacı" ve "Program Gerekçesi" */
export const PROGRAM_ABOUT = {
  purpose: [
    'Türkiye’de eğitim fırsatlarından yararlanan mezunlarla bağın korunması',
    'Her seviyedeki eğitim kurumlarından mezun olanlarla bilimsel, ekonomik, kültürel, mesleki ve diplomatik bağların kurulması ve sürdürülmesi',
    'Mezunların ikamet, vize, staj ve çalışma izni işlemlerinin tek kart ve tek platformla kolaylaştırılması',
  ],
  rationale:
    'Küresel rekabette nitelikli insan kaynağının önemi artarken, mezunlarla uzun vadeli bağ kurulması ihtiyacı bulunmaktadır. ' +
    'Program, mezunları kalıcı bir ağın parçası yaparak kamu diplomasisi hedeflerine katkı sunar.',
};

/** Üst menüdeki diğer kurumsal sayfalara kısa yollar (adresler bu sayfaya görelidir). */
export const QUICK_LINKS = [
  { icon: 'bank', title: 'Kurumlar', text: 'Paydaş kurumlar ve programdaki görevleri', route: '../institutions' },
  { icon: 'safety-certificate', title: 'Hizmetler', text: 'Kart gruplarına göre hak ve hizmetler', route: '../services' },
  { icon: 'notification', title: 'Duyurular', text: 'Mevzuat, kariyer ve etkinlik duyuruları', route: '../announcements' },
  { icon: 'phone', title: 'İletişim', text: 'YİMER 157, adres ve destek kanalları', route: '../contact' },
];
