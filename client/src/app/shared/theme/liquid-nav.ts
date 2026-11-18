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
