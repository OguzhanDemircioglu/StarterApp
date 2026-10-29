import { Component, inject, input } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { SessionActions } from '../../core/auth/session.actions';
import { sessionFeature } from '../../core/auth/session.state';
import { Language, LanguageService } from '../../core/i18n/language';
import { validateForm } from '../../shared/forms/form-utils';

/** /login — shell'in dışındadır. Hata mesajlarını (yanlış şifre, engellendi) errorInterceptor gösterir. */
@Component({
  imports: [ReactiveFormsModule, TranslatePipe, NzCardModule, NzFormModule, NzInputModule, NzButtonModule, NzIconModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export default class Login {
  private readonly store = inject(Store);
  private readonly languageService = inject(LanguageService);

  /** Giriş gerektiren bir sayfadan gelindiyse, girişten sonra oraya dönülür (authGuard ekler). */
  readonly returnUrl = input<string>();

  protected readonly pending = this.store.selectSignal(sessionFeature.selectLoginPending);
  protected readonly language = this.languageService.current;

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected submit(): void {
    if (!validateForm(this.form)) {
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.store.dispatch(SessionActions.login({ email, password, returnUrl: this.returnUrl() ?? '/' }));
  }

  protected useLanguage(language: Language): void {
    this.languageService.use(language);
  }
}
