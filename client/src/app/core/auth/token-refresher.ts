import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { finalize, firstValueFrom, Observable, shareReplay, tap } from 'rxjs';
import { AuthApi } from './auth-api';
import { SessionActions } from './session.actions';
import { SessionInfo } from './session.model';

/**
 * Token yenileme tek bir yerden yapılır.
 * Tek uçuş (single-flight): aynı anda birden fazla istek 401 alırsa sadece BİR refresh çağrısı yapılır,
 * diğerleri aynı sonucu bekler.
 */
@Injectable({ providedIn: 'root' })
export class TokenRefresher {
  private readonly authApi = inject(AuthApi);
  private readonly store = inject(Store);
  private inFlight: Observable<SessionInfo> | null = null;

  /** 401 sonrası ve süre dolmadan önce çağrılır. Başarısız olursa oturum temizlenir ve login'e gidilir. */
  refresh(): Observable<SessionInfo> {
    this.inFlight ??= this.authApi.refresh().pipe(
      tap({
        next: (info) => this.store.dispatch(SessionActions.refreshed({ info })),
        error: () => this.store.dispatch(SessionActions.cleared()),
      }),
      finalize(() => (this.inFlight = null)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.inFlight;
  }

  /**
   * Uygulama açılışında (F5 dahil) sessiz giriş: refresh cookie geçerliyse kullanıcı login ekranını görmez.
   * Uygulama bu bitene kadar başlamaz (provideAppInitializer).
   */
  async restore(): Promise<void> {
    try {
      const info = await firstValueFrom(this.authApi.refresh());
      this.store.dispatch(SessionActions.refreshed({ info }));
    } catch {
      this.store.dispatch(SessionActions.restoreFailed());
    }
  }
}
