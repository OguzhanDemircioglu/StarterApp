import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { en_US, NzI18nService, tr_TR } from 'ng-zorro-antd/i18n';

export type Language = 'tr' | 'en';

const STORAGE_KEY = 'language';
const ZORRO_LOCALES = { tr: tr_TR, en: en_US };

/**
 * Arayüz dilini değiştirir: ngx-translate metinleri ve NG-ZORRO bileşenlerinin kendi metinleri birlikte.
 * Seçim tarayıcıda hatırlanır (sadece tercih; oturum bilgisi değil).
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly zorroI18n = inject(NzI18nService);

  readonly current = this.translate.currentLang;

  init(): void {
    this.use(this.readStoredLanguage());
  }

  use(language: Language): void {
    this.translate.use(language);
    this.zorroI18n.setLocale(ZORRO_LOCALES[language]);
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Tarayıcı depolamaya izin vermiyorsa tercih sadece bu oturumda geçerli olur.
    }
  }

  private readStoredLanguage(): Language {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'tr';
    } catch {
      return 'tr';
    }
  }
}
