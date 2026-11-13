/**
 * İletişim sayfasının verileri. YİMER 157, Göç İdaresi Başkanlığı adresi ve santral numarası kurumun yayımladığı
 * bilgilerdir (e-Devlet kurum sayfası, Stratejik Plan 2024-2028); Mezun Kart e-posta adresi programın geçici adresidir.
 */

export interface ContactChannel {
  icon: string;
  title: string;
  value: string;
  note: string;
  /** tel:, mailto: ya da portal içi adres */
  href?: string;
  route?: string;
}

export const CONTACT_CHANNELS: ContactChannel[] = [
  {
    icon: 'customer-service',
    title: 'YİMER 157',
    value: '157',
    note: 'Yabancılar İletişim Merkezi · Yurt içinden ücretsiz, 7/24 · 7 dilde hizmet',
    href: 'tel:157',
  },
  {
    icon: 'global',
    title: 'Yurt dışından YİMER',
    value: '+90 312 157 11 22',
    note: 'Türkiye dışından 7/24 ulaşım',
    href: 'tel:+903121571122',
  },
  {
    icon: 'mail',
    title: 'Mezun Kart Destek',
    value: 'destek@mezunkart.goc.gov.tr',
    note: 'Kart, başvuru ve hesap soruları · 2 iş günü içinde yanıt',
    href: 'mailto:destek@mezunkart.goc.gov.tr',
  },
  {
    icon: 'message',
    title: 'Portal Mesajları',
    value: 'Dijital Platform › Mesajlar',
    note: 'Başvurunuzla ilgili kurumlara doğrudan yazın',
    route: '/user/messages',
  },
];

/** YİMER'in hizmet verdiği diller. */
export const YIMER_LANGUAGES = ['Türkçe', 'İngilizce', 'Arapça', 'Rusça', 'Farsça', 'Almanca', 'Peştuca'];

export const HEAD_OFFICE = {
  name: 'T.C. Göç İdaresi Başkanlığı',
  address: 'Lalegül Çamlıca Mahallesi 122. Sokak No: 4, Yenimahalle / Ankara',
  phone: '+90 312 422 05 00',
  phoneHref: 'tel:+903124220500',
  web: 'https://www.goc.gov.tr',
  map: 'https://www.google.com/maps/search/?api=1&query=G%C3%B6%C3%A7+%C4%B0daresi+Ba%C5%9Fkanl%C4%B1%C4%9F%C4%B1+Ankara',
};

export const CONTACT_TOPICS = ['Mezun Kart', 'İkamet ve Vize', 'Staj ve Kariyer', 'Teknik Destek', 'Diğer'];
