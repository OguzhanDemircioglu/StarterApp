import { Component, input } from '@angular/core';

/**
 * Göç İdaresi logosu (hilal + yıldız + güvercin, public/logo.png, saydam zeminli) ve yazısı. Public, Mezun Portalı ve
 * yönetim paneli üst barlarında kullanılır. light: koyu zemin için beyaz yazı. compact: sadece işaret (dar alanlar).
 */
@Component({
  selector: 'app-brand-logo',
  host: { '[class.light]': 'light()' },
  template: `
    <img class="mark" src="logo.png" alt="" />
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
      width: auto;
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
