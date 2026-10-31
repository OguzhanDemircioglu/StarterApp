import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideNzI18n, tr_TR } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { SessionEffects } from './core/auth/session.effects';
import { sessionFeature } from './core/auth/session.state';
import { TokenRefresher } from './core/auth/token-refresher';
import { APP_ICONS } from './core/icons';
import { errorInterceptor } from './core/notify/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),

    // Sıra önemli: errorInterceptor en dışta, authInterceptor (token + 401'de refresh) içte.
    provideHttpClient(withInterceptors([errorInterceptor, authInterceptor])),

    // NgRx sadece oturum için (Frontend_Architecture.md §8).
    provideStore({ [sessionFeature.name]: sessionFeature.reducer }),
    provideEffects(SessionEffects),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),

    provideTranslateService({
      // useHttpBackend: çeviri dosyaları interceptor'lardan geçmez (token gerekmez; ayrıca errorInterceptor
      // TranslateService'i kullandığı için aksi halde döngüsel bağımlılık oluşur).
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json', useHttpBackend: true }),
      fallbackLang: 'tr',
    }),
    provideNzI18n(tr_TR),
    provideNzIcons(APP_ICONS),

    // Uygulama açılmadan önce: metinler yüklenir, sessiz giriş yapılır (refresh cookie geçerliyse login ekranı görülmez).
    provideAppInitializer(() => {
      const texts = firstValueFrom(inject(TranslateService).use('tr'));
      return Promise.all([texts, inject(TokenRefresher).restore()]);
    }),
  ],
};
