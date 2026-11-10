import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandLogo } from '../../../shared/theme/brand-logo';

/** Public sayfanın üst barı: logo, sayfa içi bağlantılar ve giriş düğmesi. */
@Component({
  selector: 'app-public-header',
  imports: [RouterLink, BrandLogo],
  template: `
    <header class="bar">
      <a routerLink="/" class="logo"><app-brand-logo /></a>
      <nav>
        @for (item of nav(); track item.anchor) {
          <a [href]="'#' + item.anchor">{{ item.label }}</a>
        }
      </nav>
      <a class="btn btn-primary" routerLink="/login">Mezun Portalı’na Giriş</a>
    </header>
  `,
  styles: `
    :host {
      position: sticky;
      top: 0;
      z-index: 20;
      display: block;
      background: #fff;
      border-bottom: 1px solid var(--mk-border);
    }
    .bar {
      display: flex;
      align-items: center;
      gap: 32px;
      max-width: 1240px;
      height: 72px;
      margin: 0 auto;
      padding: 0 24px;
    }
    .logo {
      color: inherit;
    }
    nav {
      display: flex;
      gap: 28px;
      margin-right: auto;
    }
    nav a {
      font-size: 14px;
      color: var(--mk-text);
    }
    nav a:hover {
      color: var(--mk-red);
    }
    @media (max-width: 900px) {
      nav {
        display: none;
      }
      .bar {
        justify-content: space-between;
        padding: 0 16px;
      }
    }
  `,
})
export class PublicHeader {
  readonly nav = input.required<{ label: string; anchor: string }[]>();
}
