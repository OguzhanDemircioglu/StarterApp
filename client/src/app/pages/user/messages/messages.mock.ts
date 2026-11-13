/** Mesajlar sayfasının geçici verileri. Kişiler kurgusaldır. */

export interface ChatMessage {
  mine: boolean;
  text: string;
  time: string;
}

export interface Conversation {
  id: number;
  name: string;
  initials: string;
  color: string;
  subtitle: string;
  institution: boolean;
  online: boolean;
  unread: number;
  /** Listede gösterilen son mesaj zamanı */
  lastTime: string;
  messages: ChatMessage[];
}

export const CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    name: 'Aynur Mammadova',
    initials: 'AM',
    color: '#2b7a78',
    subtitle: 'Veri Analisti · Anadolu Lojistik',
    institution: false,
    online: true,
    unread: 2,
    lastTime: '10:42',
    messages: [
      { mine: false, text: 'Merhaba Oğuzhan! Kariyer fuarında konuştuğumuz pozisyon hâlâ açık.', time: '10:38' },
      { mine: true, text: 'Merhaba Aynur, haber verdiğin için çok teşekkürler 🙏', time: '10:40' },
      { mine: false, text: 'Rusça bilen birini arıyorlar, sana çok uygun.', time: '10:41' },
      { mine: false, text: 'İlan Staj / Kariyer sayfasında, “Veri Analisti” diye aratabilirsin.', time: '10:42' },
    ],
  },
  {
    id: 2,
    name: 'Göç İdaresi Destek',
    initials: 'Gİ',
    color: '#d71920',
    subtitle: 'T.C. Göç İdaresi Başkanlığı',
    institution: true,
    online: true,
    unread: 1,
    lastTime: 'Dün',
    messages: [
      { mine: true, text: 'Aile üyesi vize başvurumda eksik belge uyarısı aldım. Hangi belge gerekiyor?', time: 'Dün 14:05' },
      {
        mine: false,
        text: 'Merhaba, başvurunuz için evlilik cüzdanınızın apostilli ve noter onaylı Türkçe tercümesi gerekmektedir. Belgeyi Hizmetler > Başvurularım bölümünden yükleyebilirsiniz.',
        time: 'Dün 15:20',
      },
    ],
  },
  {
    id: 3,
    name: 'Türkiye Maarif Vakfı',
    initials: 'TM',
    color: '#1f5aa6',
    subtitle: 'Proje Asistanı başvurusu',
    institution: true,
    online: false,
    unread: 0,
    lastTime: '7 Kas',
    messages: [
      {
        mine: false,
        text: 'Sayın Demircioğlu, Proje Asistanı başvurunuz ön değerlendirmeyi geçmiştir. 14 Kasım 10:30’da çevrimiçi mülakata davetlisiniz.',
        time: '7 Kas 09:12',
      },
      { mine: true, text: 'Davetiniz için teşekkür ederim, mülakatta olacağım.', time: '7 Kas 09:30' },
    ],
  },
  {
    id: 4,
    name: 'Daniyar Seitkali',
    initials: 'DS',
    color: '#8a5a44',
    subtitle: 'Araştırma Görevlisi · Hacettepe',
    institution: false,
    online: false,
    unread: 0,
    lastTime: '3 Kas',
    messages: [
      { mine: false, text: 'Sempozyum için ortak bir oturum önermeyi düşünüyorum, ilgilenir misin?', time: '3 Kas 18:01' },
      { mine: true, text: 'Kesinlikle! Göç politikaları tarafını ben hazırlayabilirim.', time: '3 Kas 18:15' },
    ],
  },
  {
    id: 5,
    name: 'Farrukh Tashkentov',
    initials: 'FT',
    color: '#b5651d',
    subtitle: 'Gazi Üniversitesi 2024 Mezunu',
    institution: false,
    online: true,
    unread: 0,
    lastTime: '28 Eki',
    messages: [{ mine: false, text: 'Mezun Buluşması’na gidiyor musun? Birlikte gidelim.', time: '28 Eki 20:44' }],
  },
];
