/** Etkinlikler: geçici veri. Portalın Etkinlikler sayfası ve Ana Sayfası, public tanıtım sayfası ve yönetim paneli birlikte kullanır. */

export type EventCategory = 'Kariyer' | 'Kültür' | 'Networking' | 'Akademik';

export interface PortalEvent {
  id: number;
  title: string;
  category: EventCategory;
  /** YYYY-MM-DD */
  date: string;
  time: string;
  place: string;
  online: boolean;
  organizer: string;
  attendees: number;
  capacity: number;
  description: string;
  going: boolean;
  featured?: boolean;
}

export const EVENT_CATEGORIES: EventCategory[] = ['Kariyer', 'Kültür', 'Networking', 'Akademik'];

export const EVENTS: PortalEvent[] = [
  {
    id: 1,
    title: 'Mezun Buluşması 2026',
    category: 'Networking',
    date: '2026-11-21',
    time: '14:00',
    place: 'ATO Congresium, Ankara',
    online: false,
    organizer: 'T.C. Göç İdaresi Başkanlığı',
    attendees: 412,
    capacity: 600,
    description:
      'Türkiye’den mezun olan uluslararası öğrencilerin, paydaş kurumların ve işverenlerin bir araya geldiği yıllık buluşma. ' +
      'Paneller, kurum stantları ve mezun hikâyeleri.',
    going: true,
    featured: true,
  },
  {
    id: 2,
    title: 'Uluslararası Mezunlar Kariyer Fuarı',
    category: 'Kariyer',
    date: '2026-11-26',
    time: '10:00',
    place: 'Lütfi Kırdar Kongre Merkezi, İstanbul',
    online: false,
    organizer: 'T.C. Çalışma ve Sosyal Güvenlik Bakanlığı',
    attendees: 860,
    capacity: 1500,
    description: 'Çalışma izni istisnasından yararlanabilecek mezunlar için 120’den fazla işverenle birebir görüşme imkânı.',
    going: false,
  },
  {
    id: 3,
    title: 'Türk Kahvesi ve Kültür Atölyesi',
    category: 'Kültür',
    date: '2026-11-28',
    time: '15:30',
    place: 'Ankara Kültür Merkezi',
    online: false,
    organizer: 'T.C. Kültür ve Turizm Bakanlığı',
    attendees: 38,
    capacity: 40,
    description: 'Türk kahvesi kültürü, geleneksel pişirme ve sunum atölyesi.',
    going: false,
  },
  {
    id: 4,
    title: 'Göç Politikaları ve Mezun Ağları Paneli',
    category: 'Akademik',
    date: '2026-12-03',
    time: '11:00',
    place: 'Çevrimiçi',
    online: true,
    organizer: 'Yükseköğretim Kurulu (YÖK)',
    attendees: 215,
    capacity: 500,
    description: 'Mezun ağlarının kamu diplomasisine katkısı üzerine akademisyenler ve kurum temsilcileriyle panel.',
    going: true,
  },
  {
    id: 5,
    title: 'CV ve Mülakat Hazırlığı Webinarı',
    category: 'Kariyer',
    date: '2026-12-08',
    time: '19:00',
    place: 'Çevrimiçi',
    online: true,
    organizer: 'Türkiye Maarif Vakfı',
    attendees: 128,
    capacity: 300,
    description: 'Türkiye’deki işverenlerin beklentileri, Türkçe CV hazırlama ve mülakat pratikleri.',
    going: false,
  },
  {
    id: 6,
    title: 'Kapadokya Kültür Gezisi',
    category: 'Kültür',
    date: '2026-12-13',
    time: '07:30',
    place: 'Nevşehir',
    online: false,
    organizer: 'T.C. Kültür ve Turizm Bakanlığı',
    attendees: 54,
    capacity: 60,
    description: 'Göreme Açık Hava Müzesi ve Derinkuyu Yeraltı Şehri ziyareti. Ulaşım kurum tarafından sağlanır.',
    going: false,
  },
  {
    id: 7,
    title: 'Girişimcilik ve Yatırım Zirvesi',
    category: 'Networking',
    date: '2026-12-17',
    time: '09:30',
    place: 'İstanbul Teknik Üniversitesi Arı Teknokent',
    online: false,
    organizer: 'T.C. Sanayi ve Teknoloji Bakanlığı',
    attendees: 290,
    capacity: 400,
    description: 'Mezun girişimcilerin yatırımcılarla buluştuğu, ülkeler arası ticari bağlantı odaklı zirve.',
    going: false,
  },
  {
    id: 8,
    title: 'Mezun Araştırmacılar Sempozyumu',
    category: 'Akademik',
    date: '2027-01-14',
    time: '10:00',
    place: 'Gazi Üniversitesi, Ankara',
    online: false,
    organizer: 'Yükseköğretim Kurulu (YÖK)',
    attendees: 76,
    capacity: 250,
    description: 'Türkiye’den mezun araştırmacıların çalışmalarını sunduğu iki günlük sempozyum.',
    going: false,
  },
];
