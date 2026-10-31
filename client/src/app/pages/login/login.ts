import { Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { SessionActions } from '../../core/auth/session.actions';
import { sessionFeature } from '../../core/auth/session.state';
import { maxBytes, validateForm } from '../../shared/forms/form-utils';

/** /login — shell'in dışındadır. Hata mesajlarını (yanlış şifre, engellendi) errorInterceptor gösterir. */
@Component({
  imports: [ReactiveFormsModule, TranslatePipe, NzFormModule, NzButtonModule, NzIconModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export default class Login {
  private readonly store = inject(Store);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  /** Giriş gerektiren bir sayfadan gelindiyse, girişten sonra oraya dönülür (authGuard ekler). */
  readonly returnUrl = input<string>();

  protected readonly pending = this.store.selectSignal(sessionFeature.selectLoginPending);

  /** true iken kayıt formu görünür; geçiş animasyonunun tamamı CSS'tedir (.wrapper.active). */
  protected readonly registerMode = signal(false);

  protected readonly form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected readonly registerForm = this.formBuilder.group({
    fullName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.minLength(8), maxBytes(72)]],
  });

  protected submit(): void {
    if (!validateForm(this.form)) {
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.store.dispatch(SessionActions.login({ email, password, returnUrl: this.returnUrl() ?? '/' }));
  }

  protected submitRegister(): void {
    if (!validateForm(this.registerForm)) {
      return;
    }
    const request = this.registerForm.getRawValue();
    this.store.dispatch(SessionActions.register({ request, returnUrl: this.returnUrl() ?? '/' }));
  }

  protected showRegister(show: boolean): void {
    this.registerMode.set(show);
    this.form.reset();
    this.registerForm.reset();
  }
}
