/** Grafiklerde kullanılan dil duyarlı biçimlendirme. */

/** Rapor endpoint'lerindeki "2026-10-29" biçimli günü kısa gösterir: "29 Eki" / "29 Oct". */
export function formatDay(period: string, language: string): string {
  return new Intl.DateTimeFormat(language, { day: '2-digit', month: 'short' }).format(new Date(`${period}T00:00:00`));
}

export function formatNumber(value: number, language: string): string {
  return new Intl.NumberFormat(language).format(value);
}
