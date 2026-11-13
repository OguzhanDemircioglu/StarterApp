import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { validateForm } from '../../../../shared/forms/form-utils';
import { MOCK_PROFILE } from '../../portal.mock';
import { CONTACT_CHANNELS, CONTACT_TOPICS, HEAD_OFFICE, YIMER_LANGUAGES } from './contact.mock';

/** /user/site/contact: iletişim kanalları, merkez adresi ve iletişim formu (form şimdilik bir yere gönderilmez). */
@Component({
  imports: [ReactiveFormsModule, RouterLink, NzFormModule, NzIconModule, NzInputModule, NzSelectModule],
  templateUrl: './contact.html',
  host: { class: 'mk-page' },
  styleUrl: './contact.css',
})
export default class Contact {
  private readonly message = inject(NzMessageService);

  protected readonly channels = CONTACT_CHANNELS;
  protected readonly languages = YIMER_LANGUAGES;
  protected readonly office = HEAD_OFFICE;
  protected readonly topics = CONTACT_TOPICS;

  protected readonly form = inject(FormBuilder).nonNullable.group({
    fullName: [MOCK_PROFILE.fullName, [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    topic: [CONTACT_TOPICS[0], Validators.required],
    text: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
  });

  protected submit(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.message.success('Mesajınız alındı. Yanıt e-posta adresinize gönderilecek.');
    this.form.controls.text.reset();
  }
}
