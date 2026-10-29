import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';

/**
 * Kullanıcıya kısa bildirim gösterir. Her zaman bir mesaj ANAHTARI alır ve çevirir;
 * çevirisi olmayan anahtar için genel hata metni gösterilir (ekrana ham anahtar çıkmaz).
 */
@Injectable({ providedIn: 'root' })
export class Notifier {
  private readonly message = inject(NzMessageService);
  private readonly translate = inject(TranslateService);

  success(messageKey: string): void {
    this.message.success(this.text(messageKey));
  }

  error(messageKey: string): void {
    this.message.error(this.text(messageKey));
  }

  private text(messageKey: string): string {
    const translated = this.translate.instant(messageKey);
    return translated !== messageKey ? translated : this.translate.instant('unexpected_error');
  }
}
