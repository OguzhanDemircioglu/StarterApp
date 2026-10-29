import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { Observable } from 'rxjs';
import { Role } from '../../../../core/auth/session.model';
import { Notifier } from '../../../../core/notify/notifier';
import { maxBytes, validateForm } from '../../../../shared/forms/form-utils';
import { UserApi } from '../user-api';
import { UserResponse } from '../user.model';

/**
 * Kullanıcı ekleme ve düzenleme. Şifre sadece eklemede sorulur (düzenlemede ayrı "şifre sıfırla" var);
 * aktif/pasif sadece düzenlemede değiştirilir. Kurallar backend'deki UserCreateRequest/UserUpdateRequest ile aynıdır.
 */
@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, TranslatePipe, NzModalModule, NzFormModule, NzInputModule, NzSelectModule, NzSwitchModule],
  templateUrl: './user-form.html',
})
export class UserForm {
  private readonly api = inject(UserApi);
  private readonly notifier = inject(Notifier);

  readonly open = model(false);
  readonly user = input<UserResponse | null>(null);
  readonly saved = output<void>();

  protected readonly isEdit = computed(() => this.user() !== null);
  protected readonly saving = signal(false);
  protected readonly roles: Role[] = ['USER', 'ADMIN'];

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    fullName: ['', [Validators.required, Validators.maxLength(100)]],
    password: ['', [Validators.required, Validators.minLength(8), maxBytes(72)]],
    role: ['USER' as Role, Validators.required],
    active: [true],
  });

  constructor() {
    effect(() => {
      if (!this.open()) {
        return;
      }
      const user = this.user();
      this.form.reset({
        email: user?.email ?? '',
        fullName: user?.fullName ?? '',
        password: '',
        role: user?.role ?? 'USER',
        active: user?.active ?? true,
      });
      // Şifre alanı sadece eklemede vardır.
      const password = this.form.controls.password;
      if (user) {
        password.disable();
      } else {
        password.enable();
      }
    });
  }

  protected save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    const value = this.form.getRawValue();
    const user = this.user();

    const call: Observable<unknown> = user
      ? this.api.update(user.id, {
          email: value.email.trim(),
          fullName: value.fullName.trim(),
          role: value.role,
          active: value.active,
          version: user.version,
        })
      : this.api.create({
          email: value.email.trim(),
          fullName: value.fullName.trim(),
          password: value.password,
          role: value.role,
        });

    this.saving.set(true);
    call.subscribe({
      next: () => {
        this.saving.set(false);
        this.notifier.success(user ? 'record_updated' : 'record_created');
        this.open.set(false);
        this.saved.emit();
      },
      error: () => this.saving.set(false),
    });
  }
}
