/** Grafiklerde kullanılan dil duyarlı biçimlendirme. */

/** Rapor endpoint'lerindeki "2026-10-29" biçimli günü kısa gösterir: "29 Eki" / "29 Oct". */
export function formatDay(period: string, language: string): string {
  return new Intl.DateTimeFormat(language, { day: '2-digit', month: 'short' }).format(new Date(`${period}T00:00:00`));
}

/** "2026-10" biçimli ayı kısa gösterir: "Eki" / "Oct". */
export function formatMonth(period: string, language: string): string {
  return new Intl.DateTimeFormat(language, { month: 'short' }).format(new Date(`${period}-01T00:00:00`));
}

/** Haftanın gününü kısa gösterir: 0 = Pazartesi. */
export function formatWeekday(index: number, language: string): string {
  return new Intl.DateTimeFormat(language, { weekday: 'short' }).format(new Date(2024, 0, 1 + index));
}

export function formatNumber(value: number, language: string): string {
  return new Intl.NumberFormat(language).format(value);
}
