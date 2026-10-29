import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Gönderilmek istenen geçersiz formun bütün alanlarını "dokunulmuş" sayar; NG-ZORRO hata metinlerini gösterir.
 * Geçerliyse true döner.
 */
export function validateForm(form: FormGroup): boolean {
  if (form.valid) {
    return true;
  }
  Object.values(form.controls).forEach((control) => {
    control.markAsDirty();
    control.updateValueAndValidity({ onlySelf: true });
  });
  return false;
}

/**
 * Metnin UTF-8 byte uzunluğu sınırı. Backend'deki @MaxBytes'ın karşılığı:
 * bcrypt 72 byte'tan uzun şifreyi işlemez ve Türkçe harfler 2 byte'tır.
 */
export function maxBytes(limit: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (typeof value !== 'string' || new TextEncoder().encode(value).length <= limit) {
      return null;
    }
    return { maxBytes: { limit } };
  };
}

/** İki alanın aynı olmasını ister (ör. yeni şifre ve tekrarı). Hata, ikinci alana yazılır. */
export function sameAs(otherControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const other = control.parent?.get(otherControlName);
    return other && other.value !== control.value ? { sameAs: true } : null;
  };
}
