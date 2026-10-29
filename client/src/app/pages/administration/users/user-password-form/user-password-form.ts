import { Component, effect, inject, input, model, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { Notifier } from '../../../../core/notify/notifier';
import { maxBytes, validateForm } from '../../../../shared/forms/form-utils';
import { UserApi } from '../user-api';
import { UserResponse } from '../user.model';

/** Admin'in bir kullanıcının şifresini sıfırlaması; kullanıcının bütün oturumları kapanır (backend). */
@Component({
  selector: 'app-user-password-form',
  imports: [ReactiveFormsModule, TranslatePipe, NzModalModule, NzFormModule, NzInputModule],
  templateUrl: './user-password-form.html',
})
export class UserPasswordForm {
  private readonly api = inject(UserApi);
  private readonly notifier = inject(Notifier);

  readonly open = model(false);
  readonly user = input<UserResponse | null>(null);
  protected readonly saving = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    newPassword: ['', [Validators.required, Validators.minLength(8), maxBytes(72)]],
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        this.form.reset();
      }
    });
  }

  protected save(): void {
    const user = this.user();
    if (!user || !validateForm(this.form)) {
      return;
    }
    this.saving.set(true);
    this.api.resetPassword(user.id, this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.notifier.success('record_updated');
        this.open.set(false);
      },
      error: () => this.saving.set(false),
    });
  }
}
