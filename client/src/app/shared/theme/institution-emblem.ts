import { Component, input } from '@angular/core';

/**
 * Kurum amblemi (yer tutucu). Göç İdaresi kendi işaretiyle, diğer kurumlar genel bir bakanlık amblemiyle çizilir.
 * Gerçek logolar eklendiğinde sadece bu bileşen değişir.
 */
@Component({
  selector: 'app-institution-emblem',
  template: `
    @if (kind() === 'goc') {
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="26" cy="36" r="20" fill="#d71920" />
        <circle cx="32" cy="33" r="16" fill="#fff" />
        <path d="M30 46c12-3 22-12 30-24-5 13-14 22-24 26z" fill="#d71920" />
        <polygon
          points="14,6 16,11.5 22,11.5 17.2,15 19,20.5 14,17 9,20.5 10.8,15 6,11.5 12,11.5"
          fill="#d71920"
        />
      </svg>
    } @else {
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle
          cx="32"
          cy="32"
          r="29"
          fill="none"
          stroke="#d71920"
          stroke-width="3"
          stroke-dasharray="3 2.5"
        />
        <circle cx="32" cy="32" r="22" fill="none" stroke="#d71920" stroke-width="1.5" />
        <circle cx="32" cy="32" r="15" fill="#d71920" />
        <circle cx="29" cy="32" r="8" fill="#fff" />
        <circle cx="31.5" cy="32" r="6.4" fill="#d71920" />
        <polygon
          points="39,29 39.9,31.4 42.4,31.4 40.4,32.9 41.2,35.3 39,33.8 36.8,35.3 37.6,32.9 35.6,31.4 38.1,31.4"
          fill="#fff"
        />
      </svg>
    }
  `,
  styles: `
    :host {
      display: inline-block;
      width: var(--emblem-size, 64px);
      height: var(--emblem-size, 64px);
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
})
export class InstitutionEmblem {
  readonly kind = input<'goc' | 'ministry'>('ministry');
}
