import { Component, input } from '@angular/core';

/**
 * Göç İdaresi logosu (hilal + yıldız + kırlangıç) ve yazısı. Public, Mezun Portalı ve yönetim paneli üst barlarında kullanılır.
 * light: koyu zemin için beyaz yazı. compact: sadece işaret (dar alanlar).
 */
@Component({
  selector: 'app-brand-logo',
  host: { '[class.light]': 'light()' },
  template: `
    <svg class="mark" viewBox="0 0 48 40" aria-hidden="true">
      <circle cx="18" cy="23" r="15" fill="#d71920" />
      <circle cx="23" cy="21" r="12" [attr.fill]="light() ? '#1b222b' : '#fff'" />
      <path d="M22 30c8-2 16-8 24-16-4 9-10 15-17 18z" fill="#d71920" />
      <polygon
        points="9,4 10.6,8.2 15,8.2 11.5,10.8 12.8,15 9,12.4 5.2,15 6.5,10.8 3,8.2 7.4,8.2"
        fill="#d71920"
      />
    </svg>
    @if (!compact()) {
      <span class="text">
        <small>T.C.</small>
        <strong>GÖÇ İDARESİ</strong>
        <small class="spaced">BAŞKANLIĞI</small>
      </span>
      <span class="bar"></span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--mk-text);
    }
    :host(.light) {
      color: #fff;
    }
    .mark {
      width: 46px;
      height: 40px;
    }
    .text {
      display: flex;
      flex-direction: column;
      line-height: 1.05;
    }
    small {
      font-size: 10px;
    }
    strong {
      font-size: 15px;
      letter-spacing: 0.3px;
    }
    .spaced {
      letter-spacing: 2.6px;
    }
    .bar {
      width: 4px;
      height: 40px;
      margin-left: 6px;
      background: var(--mk-red);
      border-radius: 2px;
    }
  `,
})
export class BrandLogo {
  readonly light = input(false);
  readonly compact = input(false);
}
