import { HttpErrorResponse } from '@angular/common/http';
import { messageKeyOf } from './error.interceptor';

describe('messageKeyOf', () => {
  it('uses the message key sent by the backend', () => {
    const error = new HttpErrorResponse({
      status: 422,
      error: { success: false, message: 'category_name_exists', data: null, traceId: 't' },
    });
    expect(messageKeyOf(error)).toBe('category_name_exists');
  });

  it('reports network errors separately', () => {
    expect(messageKeyOf(new HttpErrorResponse({ status: 0 }))).toBe('common_network_error');
  });

  it('never shows raw text that is not a message key', () => {
    const error = new HttpErrorResponse({ status: 502, error: '<html>Bad Gateway</html>' });
    expect(messageKeyOf(error)).toBe('unexpected_error');
  });
});
