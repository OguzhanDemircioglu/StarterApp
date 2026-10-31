/**
 * Örnek hikaye: "Üç Zeytin" hayali bir lokanta zinciri (Kadıköy, Beşiktaş, Alsancak). Bütün rakamlar uydurmadır.
 * Tutarlar bin ₺, dönem 1 Ocak - 31 Ekim 2026. Rakamlar birbirini tutsun diye toplamlar elle yazılmaz, buradan hesaplanır.
 * Şube, ürün, kanal ve gider adları gerçek uygulamada backend'den geleceği için çevrilmez; veri olarak durur.
 * Gerçek rapor endpoint'leri yazılınca bu dosya silinir, grafikler aynı biçimde beslenir.
 */

export interface TreeNode {
  name: string;
  value?: number;
  children?: TreeNode[];
}

export interface ExpenseGroup {
  name: string;
  children: { name: string; value: number; budget: number }[];
}

const TAX_RATE = 0.25;
const RANDOM_SEED = 2026;

/** Aynı seed aynı diziyi üretir: sayfa her açıldığında rakamlar değişmez. */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'].map((month) => `2026-${month}`);

export const CHANNELS = [
  { name: 'Salon', monthly: [1180, 1130, 1270, 1340, 1490, 1560, 1680, 1650, 1460, 1440] },
  { name: 'Paket', monthly: [330, 320, 350, 350, 370, 380, 390, 370, 360, 380] },
  { name: 'Online', monthly: [420, 400, 440, 450, 490, 510, 540, 520, 490, 540] },
  { name: 'Catering', monthly: [70, 30, 80, 140, 170, 170, 210, 260, 150, 120] },
];

export const MONTHLY_REVENUE = MONTHS.map((_, month) => sum(CHANNELS.map((channel) => channel.monthly[month])));
export const LAST_YEAR_REVENUE = [1810, 1740, 1960, 2090, 2280, 2410, 2600, 2580, 2290, 2230];
export const MONTHLY_TARGET = 2400;
export const TOTAL_REVENUE = sum(MONTHLY_REVENUE);
export const REVENUE_GROWTH = (TOTAL_REVENUE / sum(LAST_YEAR_REVENUE) - 1) * 100;

export const AVERAGE_TICKET = { current: 486, lastYear: 431 };
export const OCCUPANCY = 72;

export const PAYMENT_METHODS = [
  { name: 'Kredi kartı', value: 58 },
  { name: 'Yemek kartı', value: 17 },
  { name: 'Nakit', value: 14 },
  { name: 'Online ödeme', value: 11 },
];

export const BRANCHES = [
  { name: 'Kadıköy', share: 0.46, scores: [92, 88, 74, 90, 81] },
  { name: 'Beşiktaş', share: 0.33, scores: [85, 91, 83, 78, 72] },
  { name: 'Alsancak', share: 0.21, scores: [88, 79, 91, 84, 93] },
];

export const QUARTERS = [
  { name: 'Ç1', months: [0, 1, 2] },
  { name: 'Ç2', months: [3, 4, 5] },
  { name: 'Ç3', months: [6, 7, 8] },
].map((quarter) => ({ name: quarter.name, revenue: sum(quarter.months.map((month) => MONTHLY_REVENUE[month])) }));

/** Günlük ciro: ay toplamları yukarıdaki aylık ciroyla birebir aynıdır, hafta sonları daha yoğundur. */
export const DAILY_REVENUE: { day: string; value: number }[] = (() => {
  const random = seededRandom(RANDOM_SEED);
  return MONTHS.flatMap((month, index) => {
    const dayCount = new Date(2026, index + 1, 0).getDate();
    const weights = Array.from({ length: dayCount }, (_, day) => {
      const weekday = new Date(2026, index, day + 1).getDay();
      return (weekday === 5 || weekday === 6 ? 1.5 : weekday === 0 ? 1.2 : 0.9) + random() * 0.3;
    });
    const scale = MONTHLY_REVENUE[index] / sum(weights);
    return weights.map((weight, day) => ({
      day: `${month}-${String(day + 1).padStart(2, '0')}`,
      value: Math.round(weight * scale * 10) / 10,
    }));
  });
})();

export const CURRENT_MONTH_SHARES = CHANNELS.map((channel) => ({
  name: channel.name,
  share: channel.monthly[MONTHS.length - 1] / MONTHLY_REVENUE[MONTHS.length - 1],
}));

export const OPENING_HOURS = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

/** [saat sırası, gün sırası (0 = Pazartesi), kuver]: öğle ve akşam olmak üzere iki tepe, hafta sonu akşamı en yoğun. */
export const COVERS_BY_HOUR: [number, number, number][] = (() => {
  const random = seededRandom(RANDOM_SEED + 1);
  return OPENING_HOURS.flatMap((hour, hourIndex) =>
    [0, 1, 2, 3, 4, 5, 6].map((day): [number, number, number] => {
      const lunch = 60 * Math.exp(-((hour - 13) ** 2) / 2);
      const dinner = (day >= 4 ? 130 : 90) * Math.exp(-((hour - 20) ** 2) / 4);
      return [hourIndex, day, Math.round(lunch + dinner + 6 + random() * 10)];
    }),
  );
})();

/** Günün 24 saatine göre online sipariş adedi. */
export const ONLINE_ORDERS_BY_HOUR = [
  2, 0, 0, 0, 0, 0, 0, 0, 1, 3, 8, 22, 38, 31, 14, 9, 11, 19, 34, 52, 47, 29, 15, 6,
];

/** Bu yılın haftalarına göre kategori satışı: çorba kışın, içecek yazın yükselir. */
export const WEEKLY_CATEGORY_SALES: [string, number, string][] = (() => {
  const random = seededRandom(RANDOM_SEED + 2);
  const profiles = [
    { name: 'Ana yemek', base: 240, season: 30 },
    { name: 'Meze', base: 72, season: 14 },
    { name: 'Çorba', base: 64, season: -52 },
    { name: 'Tatlı', base: 58, season: 6 },
    { name: 'İçecek', base: 90, season: 110 },
  ];
  return Array.from({ length: 43 }, (_, week) => {
    const date = new Date(Date.UTC(2026, 0, 5 + week * 7)).toISOString().slice(0, 10);
    const summer = Math.sin((week / 43) * Math.PI);
    return profiles.map((profile): [string, number, string] => [
      date,
      Math.round(profile.base + profile.season * summer + random() * 14),
      profile.name,
    ]);
  }).flat();
})();

export const MENU: TreeNode[] = [
  {
    name: 'Ana yemek',
    children: [
      { name: 'Kuzu Tandır', value: 3200 },
      { name: 'Adana Kebap', value: 2600 },
      { name: 'Hünkar Beğendi', value: 2100 },
      { name: 'Zeytinyağlı Levrek', value: 1900 },
      { name: 'Mantı', value: 1600 },
    ],
  },
  {
    name: 'İçecek',
    children: [
      { name: 'Ayran', value: 1400 },
      { name: 'Limonata', value: 1300 },
      { name: 'Türk Kahvesi', value: 1300 },
      { name: 'Çay', value: 900 },
      { name: 'Şalgam', value: 500 },
    ],
  },
  {
    name: 'Meze',
    children: [
      { name: 'Humus', value: 900 },
      { name: 'Haydari', value: 800 },
      { name: 'Zeytin Ezmesi', value: 750 },
      { name: 'Atom', value: 650 },
    ],
  },
  {
    name: 'Tatlı',
    children: [
      { name: 'Künefe', value: 1200 },
      { name: 'Fırın Sütlaç', value: 800 },
      { name: 'Baklava', value: 600 },
    ],
  },
  {
    name: 'Çorba',
    children: [
      { name: 'Mercimek', value: 900 },
      { name: 'Ezogelin', value: 600 },
    ],
  },
];

/** Popülerlik (aylık adet) ve kâr marjı (%). star: ikisi de yüksek olan "yıldız" ürünler. */
export const DISH_PERFORMANCE = [
  { name: 'Kuzu Tandır', sold: 3400, margin: 62, star: true },
  { name: 'Adana Kebap', sold: 4100, margin: 58, star: true },
  { name: 'Künefe', sold: 2400, margin: 71, star: true },
  { name: 'Hünkar Beğendi', sold: 2200, margin: 54, star: false },
  { name: 'Zeytinyağlı Levrek', sold: 1300, margin: 44, star: false },
  { name: 'Mantı', sold: 2600, margin: 49, star: false },
  { name: 'Humus', sold: 1900, margin: 74, star: false },
  { name: 'Haydari', sold: 1700, margin: 76, star: false },
  { name: 'Atom', sold: 900, margin: 68, star: false },
  { name: 'Fırın Sütlaç', sold: 1500, margin: 66, star: false },
  { name: 'Baklava', sold: 800, margin: 41, star: false },
  { name: 'Mercimek', sold: 3100, margin: 78, star: true },
  { name: 'Ezogelin', sold: 1100, margin: 64, star: false },
];

/** Paralel eksenler: fiyat (₺), maliyet (₺), hazırlama (dk), puan, aylık adet. */
export const DISH_PROFILES = [
  { name: 'Kuzu Tandır', values: [780, 296, 35, 4.8, 3400] },
  { name: 'Adana Kebap', values: [560, 235, 18, 4.6, 4100] },
  { name: 'Levrek', values: [720, 403, 28, 4.2, 1300] },
  { name: 'Mantı', values: [380, 194, 22, 4.4, 2600] },
  { name: 'Künefe', values: [290, 84, 15, 4.9, 2400] },
];

/** Aynı adisyonda birlikte görülen kategori çiftleri. */
export const BASKET_LINKS = [
  { source: 'Ana yemek', target: 'İçecek', value: 62 },
  { source: 'Ana yemek', target: 'Meze', value: 41 },
  { source: 'Ana yemek', target: 'Tatlı', value: 34 },
  { source: 'Ana yemek', target: 'Çorba', value: 29 },
  { source: 'Meze', target: 'İçecek', value: 24 },
  { source: 'Tatlı', target: 'İçecek', value: 27 },
  { source: 'Çorba', target: 'Meze', value: 9 },
];

/** Haftanın günlerine göre satılan çay (0 = Pazartesi). */
export const TEA_SALES = [410, 390, 420, 455, 610, 780, 720];

export const FLOOR_ZONES = [
  { name: 'Salon', x: [0, 60], y: [0, 45], revenue: 7800 },
  { name: 'Teras', x: [60, 100], y: [0, 45], revenue: 3900 },
  { name: 'Bahçe', x: [0, 40], y: [45, 80], revenue: 2500 },
  { name: 'Mutfak', x: [40, 75], y: [45, 80], revenue: 0 },
  { name: 'Paket', x: [75, 100], y: [45, 80], revenue: 0 },
];

/** Mutfaktan çıkan servis yolları (kat planı koordinatları) ve günlük tabak sayısı. */
export const SERVICE_ROUTES = [
  { from: [57, 62], to: [30, 22], plates: 420 },
  { from: [57, 62], to: [80, 22], plates: 210 },
  { from: [57, 62], to: [20, 62], plates: 140 },
  { from: [57, 62], to: [87, 62], plates: 180 },
];

/** Sipariş hazırlama süresi (dk): [en kısa, Ç1, ortanca, Ç3, en uzun]. */
export const PREP_TIMES = [
  { name: 'Kadıköy', box: [7, 12, 16, 21, 34] },
  { name: 'Beşiktaş', box: [8, 14, 19, 25, 41] },
  { name: 'Alsancak', box: [6, 10, 13, 17, 27] },
  { name: 'Paket', box: [9, 15, 21, 28, 46] },
];

export const SHIFT_TEAMS = ['Temizlik', 'Kasa', 'Bar', 'Servis', 'Mutfak'];

/** Bugünkü vardiyalar: takım, başlangıç saati, bitiş saati, vardiya adı. */
export const SHIFTS: { team: string; start: number; end: number; shift: string }[] = [
  { team: 'Mutfak', start: 8, end: 16, shift: 'Sabah' },
  { team: 'Mutfak', start: 16, end: 24, shift: 'Akşam' },
  { team: 'Servis', start: 10.5, end: 17, shift: 'Sabah' },
  { team: 'Servis', start: 17, end: 24, shift: 'Akşam' },
  { team: 'Bar', start: 12, end: 18, shift: 'Sabah' },
  { team: 'Bar', start: 18, end: 24, shift: 'Akşam' },
  { team: 'Kasa', start: 10.5, end: 16, shift: 'Sabah' },
  { team: 'Kasa', start: 16, end: 24, shift: 'Akşam' },
  { team: 'Temizlik', start: 8, end: 11, shift: 'Sabah' },
  { team: 'Temizlik', start: 15, end: 16.5, shift: 'Sabah' },
  { team: 'Temizlik', start: 22, end: 24, shift: 'Akşam' },
];

export const ONLINE_FUNNEL = [
  { name: 'Menüyü gördü', value: 18400 },
  { name: 'Sepete ekledi', value: 7350 },
  { name: 'Ödemeye geçti', value: 4920 },
  { name: 'Sipariş verdi', value: 4310 },
  { name: 'Teslim edildi', value: 4190 },
];

export const ORGANIZATION: TreeNode = {
  name: 'Genel Müdür',
  children: [
    {
      name: 'Operasyon',
      children: [{ name: 'Kadıköy Müdürü' }, { name: 'Beşiktaş Müdürü' }, { name: 'Alsancak Müdürü' }],
    },
    { name: 'Mutfak', children: [{ name: 'Baş Aşçı' }, { name: 'Pastane Şefi' }] },
    { name: 'Finans', children: [{ name: 'Muhasebe' }, { name: 'Satın Alma' }] },
  ],
};

export const RECIPES = [
  { dish: 'Kuzu Tandır', ingredients: ['Kuzu', 'Tereyağı', 'Soğan'] },
  { dish: 'Hünkar Beğendi', ingredients: ['Kuzu', 'Patlıcan', 'Tereyağı', 'Soğan'] },
  { dish: 'Adana Kebap', ingredients: ['Kuzu', 'Biber', 'Soğan'] },
  { dish: 'Mantı', ingredients: ['Un', 'Kuzu', 'Yoğurt', 'Tereyağı'] },
  { dish: 'Haydari', ingredients: ['Yoğurt', 'Sarımsak'] },
  { dish: 'Künefe', ingredients: ['Tereyağı', 'Peynir', 'Un'] },
];

export const EXPENSES: ExpenseGroup[] = [
  {
    name: 'Malzeme',
    children: [
      { name: 'Gıda', value: 7920, budget: 7500 },
      { name: 'İçecek', value: 1080, budget: 1100 },
    ],
  },
  {
    name: 'Personel',
    children: [
      { name: 'Servis', value: 3100, budget: 3000 },
      { name: 'Mutfak', value: 3000, budget: 3150 },
      { name: 'Yönetim', value: 1100, budget: 1150 },
    ],
  },
  {
    name: 'İşletme',
    children: [
      { name: 'Kira', value: 1900, budget: 1900 },
      { name: 'Enerji', value: 860, budget: 780 },
      { name: 'Bakım', value: 340, budget: 400 },
    ],
  },
  {
    name: 'Satış',
    children: [
      { name: 'Komisyon', value: 720, budget: 640 },
      { name: 'Pazarlama', value: 480, budget: 550 },
    ],
  },
];

export function expenseTotal(group: ExpenseGroup): number {
  return sum(group.children.map((item) => item.value));
}

export const TOTAL_EXPENSES = sum(EXPENSES.map(expenseTotal));
export const PROFIT_BEFORE_TAX = TOTAL_REVENUE - TOTAL_EXPENSES;
export const TAX = Math.round(PROFIT_BEFORE_TAX * TAX_RATE);
export const NET_PROFIT = PROFIT_BEFORE_TAX - TAX;
export const FOOD_COST_RATIO = ((EXPENSES[0].children[0].value + EXPENSES[0].children[1].value) / TOTAL_REVENUE) * 100;

/** Kuzu eti haftalık alış fiyatı (₺/kg): [hafta, açılış, kapanış, en düşük, en yüksek]. */
export const LAMB_PRICES: [string, number, number, number, number][] = (() => {
  const random = seededRandom(RANDOM_SEED + 3);
  let close = 620;
  return Array.from({ length: 43 }, (_, week) => {
    const open = close;
    close = Math.round(open + (random() - 0.42) * 24);
    const high = Math.max(open, close) + Math.round(random() * 10);
    const low = Math.min(open, close) - Math.round(random() * 10);
    return [new Date(Date.UTC(2026, 0, 5 + week * 7)).toISOString().slice(0, 10), open, close, low, high];
  });
})();

/** Ay sonu kasa bakiyesi; son iki ay tahmindir. */
export const CASH_BALANCE = { actual: [640, 590, 710, 820, 980, 1120, 1340, 1520, 1460, 1610], forecast: [1610, 1540, 1720] };
export const CASH_MONTHS = [...MONTHS, '2026-11', '2026-12'];
