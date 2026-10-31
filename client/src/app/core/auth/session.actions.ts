import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { RegisterRequest, SessionInfo } from './session.model';

export const SessionActions = createActionGroup({
  source: 'Session',
  events: {
    /** Login formu gönderildi. */
    Login: props<{ email: string; password: string; returnUrl: string }>(),
    'Login Succeeded': props<{ info: SessionInfo; returnUrl: string }>(),
    'Login Failed': emptyProps(),

    /** Kayıt formu gönderildi; başarılı olursa aynı bilgilerle Login akışına geçilir. */
    Register: props<{ request: RegisterRequest; returnUrl: string }>(),

    /** Açılışta (F5 dahil), 401 sonrası ya da süre dolmadan önce token yenilendi. */
    Refreshed: props<{ info: SessionInfo }>(),
    /** Açılıştaki sessiz giriş başarısız: kullanıcı anonim, login ekranına yönlendirme guard'ın işi. */
    'Restore Failed': emptyProps(),

    /** Kullanıcı çıkış yaptı. */
    Logout: emptyProps(),
    /** Oturum bitti (logout ya da yenilenemeyen token): store temizlenir, login'e gidilir. */
    Cleared: emptyProps(),
  },
});
