import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { SessionActions } from './session.actions';
import { MenuNode, SessionUser } from './session.model';

/**
 * NgRx sadece oturum için kullanılır (Frontend_Architecture.md §8).
 * Token sadece bellekte durur; localStorage'a yazılmaz.
 */
export interface SessionState {
  /** Açılıştaki sessiz giriş bitene kadar 'unknown'. */
  status: 'unknown' | 'authenticated' | 'anonymous';
  accessToken: string | null;
  expiresIn: number;
  user: SessionUser | null;
  menus: MenuNode[];
  /** Login ya da kayıt isteği sürüyor mu (düğmede yükleniyor göstergesi). */
  loginPending: boolean;
}

export const initialSessionState: SessionState = {
  status: 'unknown',
  accessToken: null,
  expiresIn: 0,
  user: null,
  menus: [],
  loginPending: false,
};

export const sessionFeature = createFeature({
  name: 'session',
  reducer: createReducer(
    initialSessionState,
    on(SessionActions.login, SessionActions.register, (state) => ({ ...state, loginPending: true })),
    on(SessionActions.loginFailed, (state) => ({ ...state, loginPending: false })),
    on(SessionActions.loginSucceeded, SessionActions.refreshed, (state, { info }) => ({
      ...state,
      status: 'authenticated' as const,
      accessToken: info.accessToken,
      expiresIn: info.expiresIn,
      user: info.user,
      menus: info.menus,
      loginPending: false,
    })),
    on(SessionActions.restoreFailed, SessionActions.cleared, () => ({
      ...initialSessionState,
      status: 'anonymous' as const,
    })),
  ),
  extraSelectors: ({ selectStatus, selectUser }) => ({
    selectIsAuthenticated: createSelector(selectStatus, (status) => status === 'authenticated'),
    selectRole: createSelector(selectUser, (user) => user?.role ?? null),
  }),
});
