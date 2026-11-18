# Premium "Liquid Glass" Arayüz Rehberi

Bu rehber, StarterApp (`mezun-portal` dalı) projesinde tanıtım sayfasına ve Mezun Portalı'na uygulanan premium cam görünümü başka bir projeye taşımak içindir. Hedef okuyucu, bu görünümü yeni projeye uygulayacak geliştirici ya da Claude'dur. Rehber tek başına yeterlidir; gereken bütün kod aşağıda tam olarak yer alır.

- **Referans tasarımlar:**
  - `Reel_50-main`: Apple tarzı "liquid glass" navigasyon çubuğu (`index53.html`, `style53.css`, `script53.js`).
  - `airpod animation web`: yazıların yukarıdan, bulanık ve saydam başlayıp sırayla yerine oturduğu yumuşak giriş (`style.css` içindeki `showContent` anahtar karesi).
- **Kaynak proje:** Angular 22 + NG-ZORRO. Kod Angular bileşenleridir; başka framework'e taşıma notları [7. bölümdedir](#7-başka-frameworke-taşıma).
- **Örnek dosyalar (StarterApp):** `client/src/app/shared/theme/liquid-nav.ts`, `client/src/app/shared/theme/ambient-bg.ts`, `client/src/app/shared/theme/reveal.ts`, `client/src/app/pages/public/public.ts`, `client/src/theme.css` (`mk-premium` bölümü), `client/src/app/pages/user/portal-layout/portal-layout.css`, `client/src/app/pages/public/public-header/public-header.ts`.

---

## 1. Görünümün özü

| Öğe | Kural |
|---|---|
| Yazı tipi | `Verdana, Geneva, Tahoma, sans-serif`; gövde 16px, satır yüksekliği 1.6 |
| Başlıklar | Hero 52px (mobil 34px), bölüm başlığı 36px (mobil 28px), sayfa başlığı 34px; negatif harf aralığı (-0.5px … -1.5px) |
| Düğmeler | Hap biçimi (`border-radius: 999px`), en az 48px yükseklik, 16px yazı; büyük düğme 58px / 17px, küçük düğme 40px / 14px |
| Birincil düğme | Kırmızı dikey degrade + renkli yumuşak gölge + üstte ince beyaz iç ışık |
| Kartlar | Yarı saydam beyaz (`rgba(255,255,255,.78)`), 22px köşe, katmanlı yumuşak gölge |
| Üst bar | Buzlu cam (`backdrop-filter: blur(24px) saturate(180%)`), yapışkan |
| Menü | Cam kapsül; etkin bağlantının arkasında yaylı geçişle kayan beyaz hap; fareyi izleyen parlama |
| Arka plan | Sabit, yavaşça süzülen 3 bulanık renk lekesi (kırmızı, mavi, amber) |
| Yan menü | Yüzen, yuvarlatılmış lacivert panel; etkin öğe kırmızı degrade hap |
| Hareket | 150–500ms; yaylı eğri `cubic-bezier(0.34, 1.2, 0.64, 1)`; basınca `scale(0.94–0.97)` |
| Yumuşak giriş | Öğe 30px yukarıdan, 10px bulanık ve saydam başlayıp 0.6s'de yerine oturur; aynı anda ekrana girenler 120ms arayla sırayla gelir. Tanıtım sayfasında kaydırdıkça, portalda her sayfa açılışında oynar |
| Erişilebilirlik | Tıklama alanı ≥ 44px, görünür odak halkası, `prefers-reduced-motion` desteği |

Renkler kurum kimliğinden gelir. StarterApp'te `--mk-red: #d71920`, `--mk-navy: #1b222b`. Yeni projede bu iki rengi kurumun ana ve koyu rengiyle değiştirmek yeterlidir; degradelerdeki `#ec3a42` (açık ton) ve `#b9141a` (koyu ton) da ana rengin açık/koyu tonlarıyla değiştirilmelidir.

---

## 2. Mimari: kapsam sınıfı

Görünüm global bir **kapsam sınıfı** (`mk-premium`) altında tanımlanır. Bu sınıf yalnızca premium görünecek bölümlerin kök bileşenine verilir. Böylece yönetim paneli gibi diğer alanlar etkilenmez.

```ts
@Component({
  selector: 'app-public',
  host: { class: 'mk-premium' },
  imports: [AmbientBg, /* ... */],
  // ...
})
```

Uygulama adımları:

1. Ortak temaya `.mk-premium` bloğunu ekle ([4. bölüm](#4-ortak-tema-css)).
2. `LiquidNav` ve `AmbientBg` bileşenlerini ekle ([3. bölüm](#3-paylaşılan-bileşenler)).
3. Premium alanın kök bileşenine `host: { class: 'mk-premium' }` ver ve şablonun en başına `<app-ambient-bg />` koy.
4. Kök bileşenin ve bölümlerin **arka planlarını saydam yap** (`background: var(--bg)` / `#fff` / degrade satırlarını kaldır). Aksi halde arka plan lekeleri görünmez.
5. Header/üst barı cam yap, düz bağlantı menüsünü `<app-liquid-nav>` ile sar ([5. bölüm](#5-yerleşim-parçaları)).
6. Bölüm bazında yazı boyutlarını büyüt (hero, bölüm başlıkları, kart içi metinler).
7. Yumuşak girişi bağla: `revealOnScroll` yardımcı fonksiyonunu ekle ([3.3](#33-revealonscroll--yumuşak-giriş)) ve tanıtım sayfasından bir kez, uygulama iskeletinden her sayfa geçişinde çağır ([5.4](#54-yumuşak-girişin-bağlanması)).
8. [Doğrulama listesini](#8-doğrulama-listesi) uygula.

---

## 3. Paylaşılan bileşenler

### 3.1 `LiquidNav` — cam kapsül menü

Bağlantılar içerik olarak (`<ng-content>`) verilir. Hangi bağlantının etkin olduğunu **çağıran** belirler: `active` sınıfını koymak yeterlidir (`routerLinkActive="active"` ya da `[class.active]`). Bileşen, `MutationObserver` ile `active` sınıfının değişmesini izler ve hapı kaydırır; `ResizeObserver` ile font yüklenmesi ve pencere boyu değişimlerinde hapı animasyonsuz yerine oturtur.

`ViewEncapsulation.None` bilerek seçildi: projekte edilen `<a>` öğelerini stillemek için. Bütün seçiciler `app-liquid-nav` ya da `ln-` önekli sınıflarla sınırlıdır.

```ts
import { AfterViewInit, Component, DestroyRef, ElementRef, ViewEncapsulation, inject, viewChild } from '@angular/core';

/**
 * Buzlu cam kapsül menü (Reel_50 referansı). Bağlantılar içerik olarak verilir; 'active' sınıfı olan bağlantının
 * arkasına hap kayar, fare cam üzerinde gezerken parlama onu izler. Etkin bağlantıyı çağıran belirler (routerLinkActive vb.).
 */
@Component({
  selector: 'app-liquid-nav',
  encapsulation: ViewEncapsulation.None,
  host: { '(pointermove)': 'followPointer($event)' },
  template: `
    <div class="ln-glare" aria-hidden="true"><div></div></div>
    <div class="ln-items" #items>
      <span class="ln-pill" #pill aria-hidden="true"></span>
      <ng-content />
    </div>
  `,
  styles: `
    app-liquid-nav {
      position: relative;
      display: inline-flex;
      padding: 6px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.45);
      backdrop-filter: blur(30px) saturate(180%);
      -webkit-backdrop-filter: blur(30px) saturate(180%);
      box-shadow:
        0 24px 48px -24px rgba(27, 34, 43, 0.35),
        0 8px 20px -12px rgba(27, 34, 43, 0.2),
        inset 0 2px 3px -1px rgba(255, 255, 255, 0.95),
        inset 0 -2px 4px -1px rgba(255, 255, 255, 0.45),
        inset 0 0 0 1px rgba(255, 255, 255, 0.7);
    }
    /* Üst yarıdaki ıslak cam yansıması */
    app-liquid-nav::before {
      content: '';
      position: absolute;
      inset: 1px 1px auto;
      z-index: 2;
      height: 46%;
      border-radius: 999px 999px 24px 24px / 999px 999px 12px 12px;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0));
      pointer-events: none;
    }
    .ln-glare {
      position: absolute;
      inset: 0;
      z-index: 1;
      overflow: hidden;
      border-radius: inherit;
      pointer-events: none;
    }
    .ln-glare > div {
      position: absolute;
      inset: 0;
      opacity: 0;
      background: radial-gradient(circle 90px at var(--x, 50%) var(--y, 50%), rgba(255, 255, 255, 0.75), transparent);
      mix-blend-mode: overlay;
      transition: opacity 0.3s ease;
    }
    app-liquid-nav:hover .ln-glare > div {
      opacity: 1;
    }
    .ln-items {
      position: relative;
      z-index: 3;
      display: flex;
      gap: 4px;
    }
    .ln-pill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      opacity: 0;
      background: rgba(255, 255, 255, 0.92);
      border-radius: 999px;
      box-shadow:
        0 6px 16px rgba(27, 34, 43, 0.12),
        0 1px 2px rgba(27, 34, 43, 0.08),
        inset 0 1px 1px #fff;
      transition:
        transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1),
        width 0.5s cubic-bezier(0.34, 1.2, 0.64, 1),
        opacity 0.25s ease;
    }
    .ln-items > a {
      position: relative;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 48px;
      padding: 0 22px;
      font-size: 16px;
      color: rgba(27, 34, 43, 0.68);
      white-space: nowrap;
      text-decoration: none;
      border-radius: 999px;
      transition:
        color 0.25s ease,
        transform 0.2s cubic-bezier(0.32, 0.72, 0, 1);
    }
    .ln-items > a:hover {
      color: var(--mk-navy);
    }
    .ln-items > a.active {
      color: var(--mk-red);
    }
    .ln-items > a:active {
      transform: scale(0.94);
    }
    .ln-items > a:focus-visible {
      outline: 2px solid var(--mk-red);
      outline-offset: 2px;
    }
    @media (prefers-reduced-motion: reduce) {
      .ln-pill {
        transition: none;
      }
    }
  `,
})
export class LiquidNav implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly items = viewChild.required<ElementRef<HTMLElement>>('items');
  private readonly pill = viewChild.required<ElementRef<HTMLElement>>('pill');

  ngAfterViewInit(): void {
    const items = this.items().nativeElement;
    this.place(false);
    // Etkin bağlantı değişince hap kayar; boyut değişince (font yüklenmesi, pencere) anında yerine oturur.
    const classes = new MutationObserver(() => this.place(true));
    classes.observe(items, { subtree: true, attributeFilter: ['class'] });
    const sizes = new ResizeObserver(() => this.place(false));
    sizes.observe(items);
    this.destroyRef.onDestroy(() => {
      classes.disconnect();
      sizes.disconnect();
    });
  }

  protected followPointer(e: PointerEvent): void {
    const rect = this.host.nativeElement.getBoundingClientRect();
    this.host.nativeElement.style.setProperty('--x', `${e.clientX - rect.left}px`);
    this.host.nativeElement.style.setProperty('--y', `${e.clientY - rect.top}px`);
  }

  private place(animate: boolean): void {
    const pill = this.pill().nativeElement;
    const active = this.items().nativeElement.querySelector<HTMLElement>(':scope > .active');
    if (!active) {
      pill.style.opacity = '0';
      return;
    }
    // İlk görünüşte hap kaymadan yerinde belirir.
    const firstShow = pill.style.opacity !== '1';
    pill.style.transition = animate && !firstShow ? '' : 'opacity 0.25s ease';
    pill.style.width = `${active.offsetWidth}px`;
    pill.style.transform = `translateX(${active.offsetLeft}px)`;
    pill.style.opacity = '1';
  }
}
```

Kullanım (router bağlantıları):

```html
<app-liquid-nav class="site-links">
  @for (link of siteLinks; track link.route) {
    <a [routerLink]="link.route" routerLinkActive="active">{{ link.label }}</a>
  }
</app-liquid-nav>
```

### 3.2 `AmbientBg` — süzülen arka plan

Sayfanın arkasında `position: fixed; z-index: -1` ile durur. **Üstündeki bütün kapsayıcıların arka planı saydam olmalıdır**; ayrıca hiçbir üst eleman stacking context oluşturmamalıdır (`transform`, `z-index` + `position`, `filter` vb.). Aksi halde lekeler görünmez.

```ts
import { Component } from '@angular/core';

/**
 * Cam yüzeylerin arkasındaki yavaş süzülen, bulanık renk lekeleri (Reel_50 referansı).
 * Sayfanın arkasında sabit durur; üst elemanların arka planı saydam olmalıdır.
 */
@Component({
  selector: 'app-ambient-bg',
  host: { 'aria-hidden': 'true' },
  template: `<i class="b1"></i><i class="b2"></i><i class="b3"></i>`,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: -1;
      overflow: hidden;
      pointer-events: none;
      background: #f3f3f6;
    }
    i {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
      animation: float 24s infinite alternate cubic-bezier(0.45, 0.05, 0.55, 0.95);
      will-change: transform;
    }
    .b1 {
      top: -12%;
      left: -10%;
      width: 50vw;
      height: 50vw;
      background: #ff5a62;
      opacity: 0.32;
    }
    .b2 {
      right: -12%;
      bottom: -14%;
      width: 46vw;
      height: 46vw;
      background: #2f6fd6;
      opacity: 0.26;
      animation-delay: -6s;
    }
    .b3 {
      top: 32%;
      left: 38%;
      width: 34vw;
      height: 34vw;
      background: #ffb24a;
      opacity: 0.28;
      animation-delay: -12s;
    }
    @keyframes float {
      0% {
        transform: translate(0, 0) scale(1) rotate(0deg);
      }
      33% {
        transform: translate(5%, 10%) scale(1.05) rotate(5deg);
      }
      66% {
        transform: translate(-5%, 5%) scale(0.95) rotate(-5deg);
      }
      100% {
        transform: translate(0, -10%) scale(1.1) rotate(0deg);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      i {
        animation: none;
      }
    }
  `,
})
export class AmbientBg {}
```

Leke renkleri serbesttir; kurum renginin açık tonu + bir soğuk + bir sıcak ton iyi sonuç verir. Opaklığı 0.35'in üzerine çıkarmayın; metin kontrastı düşer.

### 3.3 `revealOnScroll` — yumuşak giriş

Framework'ten bağımsız, saf TypeScript bir fonksiyondur (StarterApp'te `shared/theme/reveal.ts`). Şablonlara tek tek dokunmadan, verilen **seçicilere** uyan öğeleri yumuşak girişle gösterir:

- Öğeler önce `mk-reveal` sınıfıyla gizlenir (`opacity: 0`).
- Bir `IntersectionObserver` öğe ekrana girdiğinde `mk-in` sınıfını ekler ve animasyon başlar.
- Aynı anda ekrana giren öğeler (aynı gözlemci çağrısında gelenler) sırayla `0, 120, 240 … 720ms` gecikme alır; böylece hem açılışta hem kaydırırken çağlayan etkisi oluşur.
- İç içe eşleşmede yalnız dıştaki öğe canlanır (bulanıklığın iki kez uygulanmaması için).
- Aynı öğe yeniden izlenirse (`mk-in` kaldırılıp yeniden eklenir) animasyon baştan oynar; sayfa geçişinde kalıcı başlık gibi öğeler için gereklidir.
- Dönen fonksiyon gözlemciyi kapatır; bileşen yok edilirken ya da yeni sayfaya geçerken çağrılmalıdır.

```ts
/**
 * Yumuşak giriş animasyonu (airpod animation web referansı): öğe yukarıdan, bulanık ve saydam başlayıp yerine oturur.
 * Seçiciye uyan öğeler ekrana girdikleri anda görünür; aynı anda girenler sırayla (120 ms arayla) gelir.
 * Stiller theme.css'tedir (.mk-reveal / .mk-in). Dönen fonksiyon izlemeyi bırakır.
 */
export function revealOnScroll(root: ParentNode, selector: string): () => void {
  const all = Array.from(root.querySelectorAll<HTMLElement>(selector));
  // İç içe eşleşmede yalnız dıştaki canlanır; aksi halde bulanıklık iki kez uygulanır.
  const targets = all.filter((el) => !all.some((other) => other !== el && other.contains(el)));
  if (!targets.length) {
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries
        .filter((e) => e.isIntersecting)
        .forEach((e, i) => {
          const el = e.target as HTMLElement;
          el.style.setProperty('--mk-delay', `${Math.min(i, 6) * 120}ms`);
          el.classList.add('mk-in');
          observer.unobserve(el);
        });
    },
    { rootMargin: '0px 0px -8% 0px' },
  );

  for (const el of targets) {
    // Aynı öğe yeniden izlenirse (sayfa geçişi) animasyon baştan oynar.
    el.classList.remove('mk-in');
    el.classList.add('mk-reveal');
    observer.observe(el);
  }
  return () => observer.disconnect();
}
```

**Gereksinimler:**

- Tarayıcıda `IntersectionObserver` (bütün güncel tarayıcılarda var). Ek kütüphane gerekmez.
- [4. bölümdeki](#4-ortak-tema-css) `.mk-reveal`, `.mk-in`, `@keyframes mk-show` ve `mk-fade` stilleri global CSS'te olmalıdır.
- Fonksiyon, hedef öğeler DOM'a çizildikten **sonra** çağrılmalıdır (Angular'da `ngAfterViewInit` ya da `afterNextRender`, React'te `useEffect`, Vue'da `onMounted` / `nextTick`).
- Seçiciler, kendi `transform` değeri olan öğeler yerine onların içindeki ya da dışındaki bir kapsayıcıyı hedeflemelidir ([tuzak 9](#6-karşılaşılan-tuzaklar)).

---

## 4. Ortak tema CSS

Global stil dosyasına (StarterApp'te `src/theme.css`) eklenir. Projede `.btn`, `.card`, `.tag`, `.chip`, `.bubble` gibi ortak sınıflar yoksa, karşılıkları neyse (ör. NG-ZORRO `.ant-btn`, Tailwind bileşen sınıfları) seçiciler ona göre uyarlanır.

```css
:root {
  --mk-red: #d71920;      /* kurumun ana rengi */
  --mk-red-dark: #b9141a;
  --mk-red-soft: #fdecec;
  --mk-navy: #1b222b;     /* kurumun koyu rengi */
  --mk-text: #1f1f1f;
  --mk-muted: #5c5c5c;
  --mk-border: #ececec;
  --mk-bg: #f7f7f8;
}

.mk-premium {
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--mk-text);
  -webkit-font-smoothing: antialiased;
}

.mk-premium .btn {
  min-height: 48px;
  padding: 12px 26px;
  font-size: 16px;
  line-height: 22px;
  background: rgba(255, 255, 255, 0.75);
  border-color: rgba(27, 34, 43, 0.12);
  border-radius: 999px;
  box-shadow:
    0 1px 2px rgba(27, 34, 43, 0.06),
    inset 0 1px 0 #fff;
  transition:
    transform 0.2s cubic-bezier(0.32, 0.72, 0, 1),
    box-shadow 0.25s ease,
    background 0.25s ease,
    border-color 0.25s ease,
    color 0.25s ease;
}

.mk-premium .btn:hover {
  color: var(--mk-red);
  border-color: rgba(215, 25, 32, 0.35);
  box-shadow: 0 10px 24px -12px rgba(27, 34, 43, 0.35);
}

.mk-premium .btn:active {
  transform: scale(0.97);
}

.mk-premium .btn:focus-visible {
  outline: 3px solid rgba(215, 25, 32, 0.35);
  outline-offset: 2px;
}

.mk-premium .btn-primary {
  color: #fff;
  background: linear-gradient(180deg, #ec3a42 0%, var(--mk-red) 55%, #b9141a 100%);
  border-color: transparent;
  box-shadow:
    0 14px 30px -12px rgba(215, 25, 32, 0.65),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.mk-premium .btn-primary:hover {
  color: #fff;
  border-color: transparent;
  background: linear-gradient(180deg, #e0262e 0%, #c3161d 55%, #a51117 100%);
  box-shadow:
    0 18px 36px -12px rgba(215, 25, 32, 0.75),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.mk-premium .btn-ghost {
  background: transparent;
  border-color: transparent;
  box-shadow: none;
}

.mk-premium .btn-sm {
  min-height: 40px;
  padding: 8px 18px;
  font-size: 14px;
}

.mk-premium .btn-lg {
  min-height: 58px;
  padding: 16px 34px;
  font-size: 17px;
}

.mk-premium .btn:disabled {
  color: #999;
  background: #eee;
  border-color: #e3e3e3;
  box-shadow: none;
  transform: none;
}

.mk-premium .card {
  padding: 28px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 22px;
  box-shadow:
    0 1px 2px rgba(27, 34, 43, 0.04),
    0 20px 44px -26px rgba(27, 34, 43, 0.3);
}

.mk-premium .card-head h2 {
  font-size: 20px;
}

.mk-premium .card-head p,
.mk-premium .muted {
  font-size: 14px;
}

.mk-premium .see-all {
  font-size: 15px;
}

.mk-premium .tag {
  padding: 4px 14px;
  font-size: 13px;
  line-height: 20px;
  border-radius: 999px;
}

.mk-premium .chip {
  min-height: 44px;
  padding: 10px 20px;
  font-size: 15px;
  background: rgba(255, 255, 255, 0.75);
  border-radius: 999px;
}

/* Etkin çip: üstteki .chip kuralı .chip.active'in kırmızı zeminini ezmesin diye ayrıca yazılır. */
.mk-premium .chip.active {
  background: linear-gradient(180deg, #ec3a42, #b9141a);
  border-color: transparent;
  box-shadow: 0 10px 22px -12px rgba(215, 25, 32, 0.7);
}

.mk-premium .bubble {
  flex-basis: 56px;
  width: 56px;
  height: 56px;
  font-size: 24px;
  background: linear-gradient(140deg, #fff 0%, var(--mk-red-soft) 100%);
  box-shadow:
    0 8px 18px -10px rgba(215, 25, 32, 0.45),
    inset 0 1px 0 #fff;
}

.mk-premium .empty {
  font-size: 15px;
}

/* Tanıtım sayfası bölümleri */
.mk-premium .mk-section {
  padding-top: 96px;
  scroll-margin-top: 96px; /* yapışkan header'ın altında kalmasın */
}

.mk-premium .mk-section > h2 {
  margin-bottom: 12px;
  font-size: 36px;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.mk-premium .mk-section > .lead {
  margin-bottom: 36px;
  font-size: 18px;
}

@media (max-width: 900px) {
  .mk-premium .mk-section {
    padding-top: 56px;
  }

  .mk-premium .mk-section > h2 {
    font-size: 28px;
  }
}

/* Verdana geniş bir yazı; ana içerik + sağ sütun düzeninde sağ sütun başlıkları tek satıra sığsın. */
@media (min-width: 1201px) {
  .mk-premium .with-side {
    grid-template-columns: minmax(0, 1fr) 360px;
  }
}

/*
 * Yumuşak giriş (revealOnScroll): yukarıdan, bulanık ve saydam başlayıp yerine oturur.
 * 'backwards' dolgu yalnız gecikme ve oynatma süresince geçerlidir; bitince öğenin kendi transform'u (hover, döndürme) geri gelir.
 */
.mk-reveal:not(.mk-in) {
  opacity: 0;
}

.mk-reveal.mk-in {
  animation: mk-show 0.6s ease-in-out var(--mk-delay, 0ms) backwards;
}

@keyframes mk-show {
  from {
    opacity: 0;
    transform: translateY(-30px);
    filter: blur(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

/* Hareketi azalt tercihinde kayma ve bulanıklık olmaz; öğe yalnızca yumuşakça belirir. */
@media (prefers-reduced-motion: reduce) {
  .mk-reveal.mk-in {
    animation-name: mk-fade;
  }
}

@keyframes mk-fade {
  from {
    opacity: 0;
  }
}
```

Referanstaki değerlerle karşılaştırma: referans `0.5s`, `translateY(-30px)`, `blur(10px)`, `ease-in-out` ve 0.2s aralık kullanır. Burada süre 0.6s'e, aralık 120ms'ye çekildi; kart ızgaralarında 0.2s aralık son kartı fazla geciktiriyordu. Referanstaki 1s başlangıç gecikmesi kaldırıldı (orada atlıkarınca geçişini beklemek içindi).

---

## 5. Yerleşim parçaları

### 5.1 Cam header (tanıtım sayfası)

Logo solda, kapsül menü ortada, birincil düğme sağda. Sayfa içi bağlantılarda etkin bölüm **kaydırmayla** izlenir (`IntersectionObserver`); böylece kullanıcı elle kaydırınca hap eski bağlantıda takılı kalmaz.

```ts
@Component({
  selector: 'app-public-header',
  imports: [RouterLink, BrandLogo, LiquidNav],
  template: `
    <header class="bar">
      <a routerLink="/" class="logo"><app-brand-logo /></a>
      <app-liquid-nav>
        @for (item of nav(); track item.anchor) {
          <a [href]="'#' + item.anchor" [class.active]="active() === item.anchor" (click)="active.set(item.anchor)">{{
            item.label
          }}</a>
        }
      </app-liquid-nav>
      <a class="btn btn-primary" routerLink="/login"><span class="long">Mezun Portalı’na </span>Giriş</a>
    </header>
  `,
  styles: `
    :host {
      position: sticky;
      top: 0;
      z-index: 20;
      display: block;
      background: rgba(255, 255, 255, 0.55);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.7);
      box-shadow: 0 12px 32px -24px rgba(27, 34, 43, 0.35);
    }
    .bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      max-width: 1320px;
      height: 88px;
      margin: 0 auto;
      padding: 0 24px;
    }
    .logo {
      color: inherit;
    }
    @media (max-width: 1180px) {
      app-liquid-nav {
        display: none;
      }
    }
    @media (max-width: 900px) {
      .bar {
        height: 72px;
        padding: 0 16px;
      }
      .btn {
        min-height: 44px;
        padding: 10px 18px;
        font-size: 14px;
      }
    }
    @media (max-width: 520px) {
      .long {
        display: none;
      }
    }
  `,
})
export class PublicHeader implements AfterViewInit {
  readonly nav = input.required<{ label: string; anchor: string }[]>();

  /** Ekranda okunan bölüm; menüdeki hap onun bağlantısına kayar. */
  protected readonly active = signal<string | null>(null);

  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    // Ekranın üst-orta bandına giren bölüm etkin sayılır.
    const spy = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            this.active.set(e.target.id);
          }
        }
      },
      { rootMargin: '-35% 0px -60% 0px' },
    );
    for (const item of this.nav()) {
      const section = document.getElementById(item.anchor);
      if (section) {
        spy.observe(section);
      }
    }
    this.destroyRef.onDestroy(() => spy.disconnect());
  }
}
```

### 5.2 Portal/uygulama iskeleti

Üst bar header ile aynı cam stilini kullanır (yükseklik 88px). Sol menü yüzen lacivert paneldir:

```css
.sider {
  position: sticky;
  top: 104px;                 /* üst bar 88px + 16px boşluk */
  flex: 0 0 272px;
  width: 272px;
  height: calc(100vh - 120px);
  margin: 16px 0 16px 16px;
  overflow-y: auto;
  padding: 32px 12px 24px;
  color: #fff;
  background: linear-gradient(180deg, #243040 0%, #161c24 100%);
  border-radius: 28px;
  box-shadow:
    0 30px 60px -30px rgba(27, 34, 43, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 52px;
  margin-bottom: 6px;
  padding: 12px 18px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.82);
  border-radius: 16px;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;
}

.nav-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.nav-item.active {
  color: #fff;
  background: linear-gradient(180deg, #ec3a42, #b9141a);
  box-shadow:
    0 12px 24px -12px rgba(215, 25, 32, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}
```

Diğer iskelet kuralları:

- Üst bardaki ikon düğmeleri (ara, dil, kullanıcı) 48px yükseklikte, hap biçimli; hover'da `rgba(255,255,255,.75)` zemin.
- Avatar 40px, kırmızı degrade + renkli gölge.
- Sayfa başlığı 34px, breadcrumb 14px.
- Mobilde (≤ 900px) sol menü `position: fixed` olur ve `transform: translateX(calc(-100% - 24px))` ile gizlenir; açılınca `transform: none`. Geçiş: `0.3s cubic-bezier(0.32, 0.72, 0, 1)`.
- Kapsül menü ve kullanıcı adı 1360px altında gizlenir (Verdana geniş olduğu için 5 bağlantı + sağ aksiyonlar sığmaz).

### 5.3 Hero ve vurgulu bloklar

- Hero arka planı saydam; başlık 52px, `letter-spacing: -1.5px`; paragraf 19px.
- İstatistik şeridi cam: `background: rgba(255,255,255,.6)`, `backdrop-filter: blur(24px)`, `border-radius: 28px`; rakamlar 36px.
- Kayıt çağrısı (CTA) bloğu: kırmızı degrade + sağ üstte beyaz radyal parlama, `border-radius: 32px`, 48px iç boşluk, renkli büyük gölge; içindeki düğme `btn btn-lg`.
- Grup kartları: başlık şeridi degrade (`linear-gradient(135deg, açık ton, ana renk)`).
- Özellik kartları hover'da `translateY(-4px)` ve gölge büyür (yalnız transform/gölge; layout kaymaz).

### 5.4 Yumuşak girişin bağlanması

**Tanıtım sayfası (tek seferlik, kaydırmayla):** Sayfa bileşeni çizildikten sonra bir kez çağrılır. Hero parçaları belge sırasında seçildiği için açılışta etiket → başlık → paragraf → düğmeler → kart sırasıyla gelir; aşağıdaki bölümler kaydırdıkça belirir.

```ts
/** Sırayla, yumuşakça beliren parçalar: hero metni ve kartı, bölüm başlıkları, kartlar. */
const REVEAL = [
  'app-public-hero .tag',
  'app-public-hero h1',
  'app-public-hero .text > p',
  'app-public-hero .actions',
  'app-graduate-card > *',     // kart host'u inline; transform onun çocuğuna uygulanır
  'app-public-hero .stats > li',
  '.mk-section > h2',
  '.mk-section > .lead',
  '.mk-section .card',
  '.steps > li',
  '.group',
  '.institution',
  '.roadmap > li',
  '.cta > *',
].join(', ');

export default class Public implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    this.destroyRef.onDestroy(revealOnScroll(this.host.nativeElement, REVEAL));
  }
}
```

**Uygulama/portal iskeleti (her sayfa geçişinde):** İskelet bileşeni kalıcıdır, içerik router ile değişir. Her `NavigationEnd` sonrasında yeni sayfa çizilince önceki gözlemci kapatılır, yenisi başlatılır. Sayfa başlığı ve açılan sayfanın kartları hedeflenir; yeni eklenen sayfalar şablon değişikliği gerekmeden otomatik canlanır.

```ts
/** Her sayfa açılışında sırayla, yumuşakça beliren parçalar: sayfa başlığı ve açılan sayfanın kartları. */
const REVEAL = '.page-title > *, .content > :not(app-banner, .page-title, router-outlet) :is(.card, .chips)';

export class PortalLayout {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  /** Önceki sayfanın giriş animasyonu izlemesini bırakır. */
  private stopReveal = (): void => {};

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopReveal());
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => {
        // ... başlık, menü vb. güncellemeleri
        this.revealPage();
      });
  }

  /** Yeni sayfa çizildikten sonra başlığı ve kartları sırayla getirir. */
  private revealPage(): void {
    afterNextRender(
      () => {
        this.stopReveal();
        this.stopReveal = revealOnScroll(this.host.nativeElement, REVEAL);
      },
      { injector: this.injector },
    );
  }
}
```

İskelet, ilk sayfanın `NavigationEnd` olayından önce oluşturulduğu için ilk açılış da bu abonelikle yakalanır; ayrıca ilk çizim için çağrı gerekmez.

Yeni projede seçiciler o projenin sınıflarına göre yazılır. Kural: başlıklar, açıklama paragrafları, kartlar ve kart ızgarası öğeleri hedeflenir; satır içi küçük öğeler (ikon, etiket) tek tek hedeflenmez.

---

## 6. Karşılaşılan tuzaklar

1. **Bileşen stili global kuralı ezer.** Bir bileşenin kendi stilinde `.btn-lg` gibi bir kural varsa (Angular'da `[_ngcontent]` özniteliği eklenir), aynı özgüllükteki `.mk-premium .btn-lg`'yi ezer. Premium boyutları bileşen stillerinden kaldırıp temaya taşıyın.
2. **Durum sınıfları ezilir.** `.mk-premium .chip { background: ... }`, `.chip.active`'in kırmızı zeminini ezdi ve etkin çipin yazısı görünmez oldu. Her durum sınıfı (`.active`, `:disabled`, `.selected`) premium kapsamda ayrıca yazılmalıdır.
3. **Arka plan lekeleri görünmüyor.** Bir üst kapsayıcının arka plan rengi var demektir. `:host { background: ... }` satırlarını kaldırın.
4. **Verdana geniş.** Aynı metin diğer fontlara göre ~%15 daha geniş yer kaplar. Menülerin gizlenme kırılımlarını yeniden ayarlayın, dar sütunları genişletin, mobilde uzun düğme metinlerini kısaltın (`<span class="long">`).
5. **Mobilde header taşması.** Logo + uzun birincil düğme 375px'e sığmadı. Dar ekranda düğme metni "Giriş"e kısaltıldı.
6. **Performans.** `backdrop-filter` pahalıdır. Yalnızca üst bar, kapsül menü ve birkaç vurgu bloğunda kullanın; listelerdeki onlarca kartta kullanmayın (kartlar `rgba(255,255,255,.78)` ile yeterince "cam" görünür).
7. **Hap ilk yüklemede kayıyor.** İlk konumlandırma animasyonsuz yapılmalıdır (`place(false)`); aksi halde sayfa açılışında hap soldan kayarak gelir.
8. **Satır sonları.** Windows'ta CRLF dosyalarda betikle metin değiştirmek sessizce başarısız olabilir; düzenleyici aracı ya da CRLF'e duyarlı değiştirme kullanın.
9. **Giriş animasyonu öğenin kendi transform'unu ezer.** Animasyon süresince `transform` anahtar kareden gelir. Kendi `transform`'u olan öğeleri (ör. `rotate(-4deg)` ile döndürülmüş kart) doğrudan hedeflemeyin; içindeki öğeyi hedefleyin. `backwards` dolgu sayesinde animasyon bitince hover gibi kendi dönüşümleri geri gelir; `forwards` ya da `both` kullanmayın, yoksa hover efektleri kalıcı olarak ezilir.
10. **Inline öğelerde transform çalışmaz.** Angular bileşen host'ları varsayılan olarak `display: inline`'dır; `app-graduate-card` yerine `app-graduate-card > *` hedeflendi.
11. **"Hareketi azalt" tercihi.** Windows'ta *Ayarlar → Erişilebilirlik → Görsel efektler → Animasyon efektleri* kapalıysa tarayıcı `prefers-reduced-motion: reduce` bildirir. İlk sürüm bu durumda animasyonu tamamen atlıyordu ve kullanıcı hiçbir şey görmüyordu. Şimdiki çözüm: animasyon her zaman çalışır, bu tercihte yalnızca kayma ve bulanıklık kalkar, öğe solarak gelir. Tam efekti görmek için Windows'ta animasyon efektlerinin açık olması gerekir.
12. **Gizli sekmede içerik görünmez kalır.** Arka plandaki ya da gizli bir sekmede tarayıcı çizim yapmaz; `IntersectionObserver` tetiklenmez ve animasyonlar ilerlemez, içerik `opacity: 0` kalır. Sekme öne gelince düzelir. Test ederken sayfanın görünür olduğundan emin olun; otomatik testlerde ekran görüntüsünden önce sayfayı ön plana alın.
13. **İç içe hedefler.** Hem kart hem kartın içindeki başlık seçiciye uyarsa ikisi de bulanıklaşır ve çift efekt oluşur. Fonksiyon iç içe eşleşmelerde yalnız dıştakini canlandırır; yine de seçicileri aynı seviyede tutmak en temizidir.

---

## 7. Başka framework'e taşıma

- **React/Vue/Svelte:** `LiquidNav` mantığı framework'ten bağımsızdır: bir kapsayıcıda `.active` öğeyi bul, hapın `width` ve `translateX` değerini `offsetWidth`/`offsetLeft` ile ver; `MutationObserver` (sınıf değişimi) + `ResizeObserver` (boyut) ile güncelle; `pointermove` ile `--x`/`--y` CSS değişkenlerini ayarla. Bağlantılar `children`/slot olarak verilir.
- **Yumuşak giriş:** `revealOnScroll` saf TypeScript'tir, olduğu gibi kopyalanır. React'te `useEffect(() => revealOnScroll(ref.current!, REVEAL), [location.pathname])` (dönen fonksiyon temizleyicidir); Vue'da `onMounted` + `watch(route)` içinde `nextTick` sonrası çağrılır. CSS kısmı framework'ten bağımsızdır.
- **Tailwind:** `.mk-premium` kapsamı yerine `@layer components` içinde aynı kuralları yazın ya da kök elemana `font-[Verdana]` ve özel bileşen sınıfları verin. `backdrop-blur-xl`, `rounded-full`, `shadow-[...]` karşılıkları doğrudan kullanılabilir.
- **NG-ZORRO/Ant Design kullanan alanlar:** `.ant-btn` için aynı ölçüleri `.mk-premium .ant-btn` altında verin; `.ant-btn-primary` için degrade ve gölgeyi ekleyin.
- **Saf HTML:** Referans `Reel_50-main` dosyaları zaten saf HTML/CSS/JS'tir; 3. ve 4. bölümdeki değerler onların kurumsal ve büyütülmüş sürümüdür.

---

## 8. Doğrulama listesi

- [ ] Kök bileşende `mk-premium` sınıfı var; font `Verdana` olarak hesaplanıyor (`getComputedStyle(h1).fontFamily`).
- [ ] Arka plan lekeleri görünüyor ve süzülüyor; hareket azaltma seçiliyken duruyor.
- [ ] Kapsül menüde hap etkin bağlantının arkasında; tıklayınca/kaydırınca yaylı kayıyor; ilk açılışta kaymadan beliriyor.
- [ ] Bütün düğmeler en az 44–48px yüksek; klavyeyle gezince odak halkası görünüyor.
- [ ] Etkin çip, seçili sekme gibi durumların renkleri doğru (tuzak 2).
- [ ] 1440px, 1024px, 768px ve 375px'te yatay kaydırma yok (`document.documentElement.scrollWidth > innerWidth` → `false`).
- [ ] Mobilde header'daki öğeler taşmıyor; yan menü açılıp kapanıyor.
- [ ] Tanıtım sayfası açılışta boş başlıyor, hero parçaları sırayla (etiket → başlık → paragraf → düğmeler → görsel) beliriyor.
- [ ] Aşağı kaydırınca bölüm başlıkları ve kartlar ekrana girdikçe sırayla beliriyor (`--mk-delay` değerleri `0ms, 120ms, 240ms…`).
- [ ] Portalda her menü geçişinde sayfa başlığı ve kartlar yeniden oynuyor; sayfa altındaki kartlar kaydırınca geliyor.
- [ ] Animasyon bittikten sonra hover efektleri (kart kalkması vb.) çalışıyor; döndürülmüş öğeler yerinde.
- [ ] "Hareketi azalt" açıkken öğeler kaymadan yalnızca solarak geliyor ve **hiçbir içerik görünmez kalmıyor**.
- [ ] Premium kapsamı dışındaki alanlar (ör. yönetim paneli) değişmedi.
- [ ] Production derlemesi bileşen stil bütçesi uyarısı vermiyor.
- [ ] Konsolda yeni hata yok.
