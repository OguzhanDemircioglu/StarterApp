import { Pipe, PipeTransform } from '@angular/core';

/**
 * Portalın tarih ve sayı biçimleri. Angular'ın tr locale verisi uygulamada kayıtlı olmadığı için
 * tarayıcının Intl API'si kullanılır (ek paket yok).
 */

const FORMATS = {
  /** 21 */
  day: { day: 'numeric' },
  /** Kas */
  month: { month: 'short' },
  /** 21 Kasım */
  dayMonth: { day: 'numeric', month: 'long' },
  /** 21 Kasım 2026 */
  long: { day: 'numeric', month: 'long', year: 'numeric' },
  /** 21 Kasım Cumartesi */
  dayMonthWeekday: { day: 'numeric', month: 'long', weekday: 'long' },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

export type TrDateFormat = keyof typeof FORMATS;

@Pipe({ name: 'trDate' })
export class TrDatePipe implements PipeTransform {
  transform(value: string | Date, format: TrDateFormat = 'long'): string {
    const date = typeof value === 'string' ? new Date(`${value}T00:00:00`) : value;
    return new Intl.DateTimeFormat('tr-TR', FORMATS[format]).format(date);
  }
}

/** 1284 → 1.284 */
@Pipe({ name: 'trNumber' })
export class TrNumberPipe implements PipeTransform {
  transform(value: number): string {
    return new Intl.NumberFormat('tr-TR').format(value);
  }
}
