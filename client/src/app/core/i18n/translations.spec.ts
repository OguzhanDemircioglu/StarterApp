import en from '../../../../public/i18n/en.json';
import tr from '../../../../public/i18n/tr.json';

/** Bir dile eklenen anahtar diğerine eklenmeyi unutulmasın: iki dosya aynı anahtarları içermeli. */
describe('translations', () => {
  it('tr.json and en.json have the same keys', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(tr).sort());
  });

  it('every key uses the snake_case message key format', () => {
    const invalid = Object.keys(tr).filter((key) => !/^[a-z0-9]+(_[a-z0-9]+)*$/.test(key));
    expect(invalid).toEqual([]);
  });
});
