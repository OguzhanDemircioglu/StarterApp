import tr from '../../../../public/i18n/tr.json';

describe('translations', () => {
  it('every key uses the snake_case message key format', () => {
    const invalid = Object.keys(tr).filter((key) => !/^[a-z0-9]+(_[a-z0-9]+)*$/.test(key));
    expect(invalid).toEqual([]);
  });
});
