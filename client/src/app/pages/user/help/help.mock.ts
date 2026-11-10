/** Yardım sayfasının geçici verileri. Program çıktıları ve yol haritası shared/program/program.mock.ts içindedir. */

export type FaqTopic = 'Mezun Kart' | 'İkamet ve Vize' | 'Staj ve Kariyer' | 'Hesap';

export interface Faq {
  topic: FaqTopic;
  question: string;
  answer: string;
}

export const FAQ_TOPICS: { topic: FaqTopic; icon: string; description: string }[] = [
  { topic: 'Mezun Kart', icon: 'idcard', description: 'Kart, gruplar ve haklar' },
  { topic: 'İkamet ve Vize', icon: 'global', description: 'İkamet izni, vize, aile' },
  { topic: 'Staj ve Kariyer', icon: 'solution', description: 'İlanlar ve çalışma izni' },
  { topic: 'Hesap', icon: 'user', description: 'Giriş, şifre, gizlilik' },
];

export const FAQS: Faq[] = [
  {
    topic: 'Mezun Kart',
    question: 'Mezun Kart nedir?',
    answer:
      'Mezun Kart, ülkemizde eğitim gören uluslararası öğrencilerin mezuniyet sonrasında Türkiye ile sürdürülebilir bağlar ' +
      'kurmasını ve bu bağların güçlendirilmesini amaçlayan programın dijital kimliğidir.',
  },
  {
    topic: 'Mezun Kart',
    question: 'Kimler Mezun Kart alabilir?',
    answer:
      'Türkiye’deki her seviyedeki eğitim kurumundan mezun olan uluslararası öğrenciler başvurabilir. Mezuniyet düzeyine göre ' +
      'üç gruba ayrılır: Grup 1 ön lisans; Grup 2 lisans, yüksek lisans ve UA lise mezunları; Grup 3 YTB/YÖK bursluları, ' +
      'doktora mezunları ve lisans ya da yüksek lisans düzeyinde derece ile mezun olanlar.',
  },
  {
    topic: 'Mezun Kart',
    question: 'Hangi grupta olduğumu nereden görebilirim?',
    answer: 'Grubunuz Hizmetler sayfasındaki Mezun Kartım bölümünde ve dijital kartınızın sağ üst köşesinde yazar.',
  },
  {
    topic: 'İkamet ve Vize',
    question: 'Mezuniyet sonrası ne kadar süre ikamet edebilirim?',
    answer: 'Tüm gruplardaki kart sahipleri mezuniyet sonrasında 2 yıl ikamet hakkından yararlanır.',
  },
  {
    topic: 'İkamet ve Vize',
    question: 'Çok girişli vize süresi ne kadar?',
    answer: 'Grup 1 için 2 yıl (ayrıca e-vize imkânı), Grup 2 ve Grup 3 için 5 yıl geçerli çok girişli vize verilir.',
  },
  {
    topic: 'İkamet ve Vize',
    question: 'Ailem bu haklardan yararlanabilir mi?',
    answer: 'Evet. Tüm gruplarda aile üyelerine vize ve ikamet başvurularında kolaylık sağlanır.',
  },
  {
    topic: 'Staj ve Kariyer',
    question: 'Çalışma izni istisnası nedir?',
    answer:
      'Grup 2 ve Grup 3 kart sahipleri için çalışma izni değerlendirme kriterlerinde istisna uygulanır. ' +
      'İşverenin başvuruda kart numaranızı belirtmesi yeterlidir.',
  },
  {
    topic: 'Staj ve Kariyer',
    question: 'Kamu kurumlarındaki staj ilanlarına nasıl başvururum?',
    answer: 'Staj / Kariyer sayfasında “Kamu” etiketli ilanları açıp Başvur düğmesine basabilirsiniz. Başvurularınızı aynı sayfadan izlersiniz.',
  },
  {
    topic: 'Hesap',
    question: 'Şifremi nasıl değiştiririm?',
    answer: 'Ayarlar > Güvenlik bölümündeki “Şifre değiştir” düğmesini kullanabilirsiniz.',
  },
  {
    topic: 'Hesap',
    question: 'Profilimi kimler görebilir?',
    answer: 'Ayarlar > Gizlilik bölümünden profilinizin herkese, bağlantılarınıza ve kurumlara ya da sadece kurumlara açık olmasını seçebilirsiniz.',
  },
];
