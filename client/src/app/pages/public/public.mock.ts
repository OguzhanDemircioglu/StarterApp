/** Public tanıtım sayfasının metinleri ve sabit verileri. Program bilgileri sunumdan alınmıştır. */

import { GraduateCard } from '../../shared/program/program.mock';

export const PUBLIC_NAV = [
  { label: 'Program', anchor: 'program' },
  { label: 'İmkânlar', anchor: 'imkanlar' },
  { label: 'Haklar', anchor: 'haklar' },
  { label: 'Kurumlar', anchor: 'kurumlar' },
  { label: 'Duyurular', anchor: 'duyurular' },
];

export const HERO_STATS = [
  { value: '13', label: 'paydaş kurum' },
  { value: '3', label: 'hak grubu' },
  { value: '2 yıl', label: 'mezuniyet sonrası ikamet' },
  { value: '5 yıl', label: 'çok girişli vize' },
];

/** Hero'daki örnek dijital kart. */
export const SAMPLE_CARD: GraduateCard = {
  cardNo: 'MK-2026-000001',
  holder: 'Ad Soyad',
  nationality: 'Uyruk',
  degree: 'Lisans – Türkiye’deki üniversiteniz',
  group: 2,
  issuedAt: '01.01.2026',
  validUntil: '01.01.2028',
  status: 'Aktif',
};

/** Sunum: "Program Amacı" ve "Program Gerekçesi" */
export const ABOUT = {
  purpose: [
    'Türkiye’de eğitim fırsatlarından yararlandırılması',
    'Her seviyedeki eğitim kurumlarından mezun olanlarla bilimsel, ekonomik, kültürel, mesleki ve diplomatik bağların kurulması ve sürdürülmesi',
  ],
  rationale:
    'Küresel rekabette nitelikli insan kaynağının önemi artarken, mezunlarla uzun vadeli bağ kurulması ihtiyacı bulunmaktadır.',
  quote:
    'Tasarlanan programla mezunlarla sürdürülebilir bağlar geliştirmek, kamu diplomasisi hedeflerine önemli katkı sunacaktır.',
};

/** Sunum: "Sağlanacak İmkânlar" ve Mezun Dijital Platformu */
export const FEATURES = [
  {
    icon: 'idcard',
    title: 'Dijital Kimlik',
    text: 'Karekodla doğrulanan Mezun Kart; kurumlarda ve işverenlerde tek kimlik.',
  },
  {
    icon: 'user',
    title: 'Profil Oluşturma',
    text: 'Eğitim, deneyim ve ilgi alanlarınızı paylaşan mezun profili.',
  },
  {
    icon: 'team',
    title: 'Mezun Ağı',
    text: 'Türkiye’den mezun olanlarla ve paydaş kurumlarla bağlantı kurun.',
  },
  {
    icon: 'solution',
    title: 'Staj ve Kariyer',
    text: 'Kamu kurumları ve işverenlerden staj ve iş ilanları.',
  },
  {
    icon: 'calendar',
    title: 'Etkinlikler',
    text: 'Mezun buluşmaları, kariyer fuarları ve kültür programları.',
  },
  {
    icon: 'safety-certificate',
    title: 'Kurum Hizmetleri',
    text: 'İkamet, vize ve çalışma izni başvurularını tek yerden izleyin.',
  },
];

export const STEPS = [
  { title: 'Hesap oluşturun', text: 'Mezun Portalı’na e-posta adresinizle kayıt olun.' },
  {
    title: 'Mezuniyetiniz doğrulansın',
    text: 'Mezuniyet bilginiz YÖK kayıtlarından otomatik doğrulanır.',
  },
  { title: 'Mezun Kartınızı alın', text: 'Grubunuza göre dijital kartınız oluşturulur.' },
  {
    title: 'Haklarınızdan yararlanın',
    text: 'İkamet, vize, staj ve kariyer hizmetlerine başvurun.',
  },
];
