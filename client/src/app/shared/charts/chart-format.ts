/** Grafiklerde kullanılan Türkçe biçimlendirme. */

const LOCALE = 'tr';

/** Rapor endpoint'lerindeki "2026-10-29" biçimli günü kısa gösterir: "29 Eki". */
export function formatDay(period: string): string {
  return new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: 'short' }).format(new Date(`${period}T00:00:00`));
}

/** "2026-10" biçimli ayı kısa gösterir: "Eki". */
export function formatMonth(period: string): string {
  return new Intl.DateTimeFormat(LOCALE, { month: 'short' }).format(new Date(`${period}-01T00:00:00`));
}

/** Haftanın gününü kısa gösterir: 0 = Pazartesi. */
export function formatWeekday(index: number): string {
  return new Intl.DateTimeFormat(LOCALE, { weekday: 'short' }).format(new Date(2024, 0, 1 + index));
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(LOCALE).format(value);
}
