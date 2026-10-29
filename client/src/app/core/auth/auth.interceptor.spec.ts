import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideStore, Store } from '@ngrx/store';
import { ApiResponse } from '../api/api-response';
import { authInterceptor } from './auth.interceptor';
import { SessionActions } from './session.actions';
import { SessionInfo } from './session.model';
import { sessionFeature } from './session.state';

function sessionInfo(accessToken: string): SessionInfo {
  return { accessToken, expiresIn: 900, user: { id: 1, email: 'a@b.c', fullName: 'A', role: 'USER' }, menus: [] };
}

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, message: 'success', data, traceId: 't' };
}

describe('authInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideStore({ [sessionFeature.name]: sessionFeature.reducer }),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    TestBed.inject(Store).dispatch(SessionActions.refreshed({ info: sessionInfo('old-token') }));
  });

  afterEach(() => backend.verify());

  it('adds the access token to API requests', () => {
    http.get('/api/categories').subscribe();

    const request = backend.expectOne('/api/categories');
    expect(request.request.headers.get('Authorization')).toBe('Bearer old-token');
    request.flush(ok([]));
  });

  it('does not add the token to cookie based auth endpoints', () => {
    http.post('/api/auth/refresh', null).subscribe();

    const request = backend.expectOne('/api/auth/refresh');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush(ok(sessionInfo('x')));
  });

  it('refreshes only once when several requests get 401 at the same time, then retries all of them', () => {
    const results: unknown[] = [];
    http.get('/api/categories').subscribe((response) => results.push(response));
    http.get('/api/users').subscribe((response) => results.push(response));

    backend.expectOne('/api/categories').flush(null, { status: 401, statusText: 'Unauthorized' });
    backend.expectOne('/api/users').flush(null, { status: 401, statusText: 'Unauthorized' });

    // Tek uçuş: iki 401 için yalnızca BİR refresh isteği.
    backend.expectOne('/api/auth/refresh').flush(ok(sessionInfo('new-token')));

    const retriedCategories = backend.expectOne('/api/categories');
    const retriedUsers = backend.expectOne('/api/users');
    expect(retriedCategories.request.headers.get('Authorization')).toBe('Bearer new-token');
    expect(retriedUsers.request.headers.get('Authorization')).toBe('Bearer new-token');
    retriedCategories.flush(ok('categories'));
    retriedUsers.flush(ok('users'));

    expect(results).toHaveLength(2);
  });

  it('clears the session and fails the request when the refresh also fails', () => {
    let failedStatus = 0;
    http.get('/api/categories').subscribe({ error: (error) => (failedStatus = error.status) });

    backend.expectOne('/api/categories').flush(null, { status: 401, statusText: 'Unauthorized' });
    backend.expectOne('/api/auth/refresh').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(failedStatus).toBe(401);
    const store = TestBed.inject(Store);
    expect(store.selectSignal(sessionFeature.selectStatus)()).toBe('anonymous');
    expect(store.selectSignal(sessionFeature.selectAccessToken)()).toBeNull();
  });
});
