import { SessionActions } from './session.actions';
import { SessionInfo } from './session.model';
import { initialSessionState, sessionFeature } from './session.state';
import { safeReturnUrl } from './session.effects';

const info: SessionInfo = {
  accessToken: 'token',
  expiresIn: 900,
  user: { id: 1, email: 'admin@firma.com', fullName: 'Admin', role: 'ADMIN' },
  menus: [{ id: 1, titleKey: 'menu_home', route: '/', icon: 'home', children: [] }],
};

describe('session state', () => {
  const reducer = sessionFeature.reducer;

  it('starts as unknown until the silent login on startup finishes', () => {
    expect(initialSessionState.status).toBe('unknown');
  });

  it('fills the session from SessionInfo after login', () => {
    const pending = reducer(initialSessionState, SessionActions.login({ email: 'a', password: 'b', returnUrl: '/' }));
    expect(pending.loginPending).toBe(true);

    const state = reducer(pending, SessionActions.loginSucceeded({ info, returnUrl: '/' }));
    expect(state.status).toBe('authenticated');
    expect(state.accessToken).toBe('token');
    expect(state.user?.role).toBe('ADMIN');
    expect(state.menus).toHaveLength(1);
    expect(state.loginPending).toBe(false);
  });

  it('clears everything when the session ends', () => {
    const loggedIn = reducer(initialSessionState, SessionActions.refreshed({ info }));
    const state = reducer(loggedIn, SessionActions.cleared());

    expect(state).toEqual({ ...initialSessionState, status: 'anonymous' });
  });

  it('becomes anonymous when the silent login fails', () => {
    expect(reducer(initialSessionState, SessionActions.restoreFailed()).status).toBe('anonymous');
  });
});

describe('safeReturnUrl', () => {
  it('allows only in-app addresses', () => {
    expect(safeReturnUrl('/definitions/categories')).toBe('/definitions/categories');
    expect(safeReturnUrl('//evil.example.com')).toBe('/');
    expect(safeReturnUrl('https://evil.example.com')).toBe('/');
    expect(safeReturnUrl(undefined)).toBe('/');
  });
});
