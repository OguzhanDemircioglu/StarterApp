/**
 * Grafik renkleri tek yerdedir. Sıra rastgele değildir: yan yana gelen renkler renk körlüğünde de ayrılır.
 * Kimlik (seri) için CHART_COLORS sırayla kullanılır; 8'den fazla seri yeni renk üretmez, "Diğer"de toplanır.
 */
export const CHART_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'];

/** Büyüklük (ısı haritası, harita): tek renk, açıktan koyuya. */
export const SEQUENTIAL_COLORS = ['#cde2fb', '#86b6ef', '#3987e5', '#1c5cab', '#0d366b'];

/** Sıralı aşamalar (huni): en açığı bile beyaz zeminde seçilir. */
export const ORDINAL_COLORS = ['#86b6ef', '#5598e7', '#2a78d6', '#1c5cab', '#0d366b'];

/** Zıt yönlü değerler: artı / eksi. */
export const POSITIVE_COLOR = '#2a78d6';
export const NEGATIVE_COLOR = '#e34948';
export const NEUTRAL_COLOR = '#c3c2b7';
