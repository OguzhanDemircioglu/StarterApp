/**
 * Giriş yapan mezunun profil ve kart verisi (geçici). Portalın birkaç sayfası kullanır; programın ortak verisi
 * (haklar, kurumlar, duyurular, etkinlikler) shared/program altındadır. Backend uçları yazıldığında bu dosya bir API
 * servisi ve model dosyasıyla değişecek; ekranlar sadece buradaki tiplere bağlıdır.
 */

import { GraduateCard } from '../../shared/program/program.mock';

export interface ContactInfo {
  icon: string;
  label: string;
  value: string;
}

export interface Experience {
  icon: string;
  title: string;
  organization: string;
  period: string;
}

export interface Education {
  school: string;
  schoolShort: string;
  department: string;
  period: string;
  degree: string;
}

export interface GraduateProfile {
  fullName: string;
  initials: string;
  department: string;
  university: string;
  graduation: string;
  city: string;
  summary: string;
  expertise: string;
  interests: string;
  languages: string;
  contacts: ContactInfo[];
  experiences: Experience[];
  educations: Education[];
}

export const MOCK_PROFILE: GraduateProfile = {
  fullName: 'Jennet Hojamova',
  initials: 'JH',
  department: 'Uluslararası İlişkiler',
  university: 'Gazi Üniversitesi',
  graduation: '2024 Mezunu',
  city: 'Ankara, Türkiye',
  summary:
    'Uluslararası ilişkiler alanında edindiğim akademik bilgi ve proje deneyimlerimi insan hareketliliği, ' +
    'göç yönetimi ve uluslararası iş birliği konularında katkı sağlamak için kullanmak istiyorum.',
  expertise: 'Göç Yönetimi, Uluslararası İlişkiler, Proje Yönetimi',
  interests: 'İnsan Hakları, Sürdürülebilir Kalkınma, Veri Analizi, Politika Araştırmaları',
  languages: 'İngilizce (İleri), Rusça (Orta)',
  contacts: [
    { icon: 'read', label: 'Mezuniyet Yılı', value: '2024' },
    { icon: 'solution', label: 'Çalışma Durumu', value: 'Çalışmıyorum' },
    { icon: 'mail', label: 'E-posta', value: 'jennet.hojamova@mail.com' },
    { icon: 'phone', label: 'Telefon', value: '+90 555 123 45 67' },
    { icon: 'environment', label: 'Konum', value: 'Ankara, Türkiye' },
    { icon: 'link', label: 'LinkedIn', value: 'linkedin.com/in/jennet-hojamova' },
  ],
  experiences: [
    {
      icon: 'bank',
      title: 'Stajyer',
      organization: 'Birleşmiş Milletler Mülteciler Yüksek Komiserliği (UNHCR)',
      period: 'Haziran 2023 – Ağustos 2023',
    },
    {
      icon: 'file-text',
      title: 'Proje Asistanı',
      organization: 'Uluslararası Göç Politikaları Araştırma Merkezi',
      period: 'Ocak 2022 – Mayıs 2022',
    },
    { icon: 'team', title: 'Gönüllü', organization: 'Kızılay Uluslararası İşler', period: 'Temmuz 2021 – Eylül 2021' },
  ],
  educations: [
    {
      school: 'Gazi Üniversitesi',
      schoolShort: 'GÜ',
      department: 'Uluslararası İlişkiler Bölümü',
      period: '2020 – 2024',
      degree: 'Lisans',
    },
  ],
};

export const MOCK_CARD: GraduateCard = {
  cardNo: 'MK-2024-000184',
  holder: 'Jennet Hojamova',
  nationality: 'Türkmenistan',
  degree: 'Lisans – Gazi Üniversitesi',
  group: 2,
  issuedAt: '15.09.2024',
  validUntil: '15.09.2026',
  status: 'Aktif',
};
