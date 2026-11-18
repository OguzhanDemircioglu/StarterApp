import { AfterViewInit, Component, DestroyRef, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandLogo } from '../../../shared/theme/brand-logo';
import { LiquidNav } from '../../../shared/theme/liquid-nav';

/** Public sayfanın üst barı: logo, sayfa içi bağlantılar (cam kapsül menü) ve giriş düğmesi. */
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
