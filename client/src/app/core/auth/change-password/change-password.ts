import { Component, effect, inject, model, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { maxBytes, sameAs, validateForm } from '../../../shared/forms/form-utils';
import { Notifier } from '../../notify/notifier';
import { AuthApi } from '../auth-api';

/** Kullanıcının kendi şifresini değiştirmesi (topbar). Başarılı olunca diğer cihazlardaki oturumları kapanır. */
@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule, TranslatePipe, NzModalModule, NzFormModule, NzInputModule, NzButtonModule],
  templateUrl: './change-password.html',
})
export class ChangePassword {
  private readonly authApi = inject(AuthApi);
  private readonly notifier = inject(Notifier);

  readonly open = model(false);
  protected readonly saving = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8), maxBytes(72)]],
    confirmPassword: ['', [Validators.required, sameAs('newPassword')]],
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        this.form.reset();
      }
    });
  }

  protected save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    const { currentPassword, newPassword } = this.form.getRawValue();
    this.saving.set(true);
    this.authApi.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.saving.set(false);
        this.notifier.success('record_updated');
        this.open.set(false);
      },
      error: () => this.saving.set(false),
    });
  }
}
