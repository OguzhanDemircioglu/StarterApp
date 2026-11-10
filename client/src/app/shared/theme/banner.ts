import { Component } from '@angular/core';

/**
 * Sayfa üstündeki kırmızı yaylar ve kırlangıç. Bulunduğu alanın sağ üstüne yerleşir; üst eleman position: relative olmalıdır.
 * Mezun Portalı ve yönetim panelinin içerik alanında kullanılır.
 */
@Component({
  selector: 'app-banner',
  host: { 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 640 120" preserveAspectRatio="xMaxYMin slice">
      <path d="M150 120C210 60 300 10 420 0h40C350 18 270 62 215 120z" fill="#d71920" />
      <path d="M330 120c40-40 110-70 190-72l-6 22c-60 4-112 22-150 50z" fill="#d71920" />
      <path
        d="M500 30c30 4 52 10 70 18 14-14 34-26 62-36-18 16-30 30-38 44 10 6 22 16 34 30-16-8-30-12-44-12-10 10-26 16-44 16 10-6 16-14 18-22-20-14-38-26-58-38z"
        fill="#d71920"
      />
    </svg>
  `,
  styles: `
    :host {
      position: absolute;
      inset: 0 0 auto 0;
      height: var(--banner-height, 116px);
      overflow: hidden;
      pointer-events: none;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
})
export class Banner {}
