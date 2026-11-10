import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { ChangePassword } from '../../../core/auth/change-password/change-password';
import { MOCK_PROFILE } from '../portal.mock';

type Section = 'account' | 'security' | 'notifications' | 'privacy';

interface NotificationRow {
  label: string;
  hint: string;
  email: boolean;
  sms: boolean;
  app: boolean;
}

/**
 * /user/settings: hesap ayarları. Şifre değiştirme gerçektir (mevcut dialog, backend'e gider);
 * diğer bölümler şimdilik sadece görünüm, Kaydet bir bilgi mesajı gösterir.
 */
@Component({
  selector: 'app-portal-settings',
  imports: [
    FormsModule,
    NzIconModule,
    NzInputModule,
    NzRadioModule,
    NzSelectModule,
    NzSwitchModule,
    ChangePassword,
  ],
  templateUrl: './settings.html',
  host: { class: 'mk-page' },
  styleUrl: './settings.css',
})
export default class Settings {
  private readonly message = inject(NzMessageService);

  protected readonly sections: { key: Section; label: string; icon: string }[] = [
    { key: 'account', label: 'Hesap Bilgileri', icon: 'user' },
    { key: 'security', label: 'Güvenlik', icon: 'lock' },
    { key: 'notifications', label: 'Bildirimler', icon: 'bell' },
    { key: 'privacy', label: 'Gizlilik', icon: 'eye' },
  ];
  protected readonly section = signal<Section>('account');

  protected readonly account = {
    fullName: MOCK_PROFILE.fullName,
    email: 'jennet.hojamova@mail.com',
    phone: '+90 555 123 45 67',
    nationality: 'Türkmenistan',
    city: 'Ankara',
    bio: MOCK_PROFILE.summary,
  };
  protected readonly nationalities = ['Türkmenistan', 'Azerbaycan', 'Kazakistan', 'Kırgızistan', 'Özbekistan', 'Diğer'];

  protected readonly changePasswordOpen = signal(false);
  protected twoFactor = true;
  protected readonly sessions = [
    { icon: 'laptop', device: 'Windows · Chrome', place: 'Ankara, Türkiye', time: 'Şu anki oturum', current: true },
    { icon: 'mobile', device: 'Android · Mezun Portalı', place: 'Ankara, Türkiye', time: '2 saat önce', current: false },
  ];

  protected readonly notifications: NotificationRow[] = [
    { label: 'Başvuru durumu', hint: 'İkamet, vize ve iş başvurularındaki değişiklikler', email: true, sms: true, app: true },
    { label: 'Duyurular', hint: 'Kurumların yayımladığı yeni duyurular', email: true, sms: false, app: true },
    { label: 'Mesajlar', hint: 'Mezunlardan ve kurumlardan gelen mesajlar', email: false, sms: false, app: true },
    { label: 'Etkinlik hatırlatmaları', hint: 'Katılacağınız etkinliklerden bir gün önce', email: true, sms: true, app: true },
    { label: 'İş ilanı eşleşmeleri', hint: 'Profilinize uygun yeni staj ve iş ilanları', email: true, sms: false, app: false },
  ];

  protected visibility: 'public' | 'graduates' | 'institutions' = 'graduates';
  protected showEmail = true;
  protected showPhone = false;
  protected openToWork = true;

  protected save(): void {
    this.message.success('Değişiklikler kaydedildi (örnek, henüz sunucuya gönderilmiyor).');
  }
}
