import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandLogo } from '../../../shared/theme/brand-logo';

/** Public sayfanın alt bilgisi. */
@Component({
  selector: 'app-public-footer',
  imports: [RouterLink, BrandLogo],
  template: `
    <div class="inner">
      <div class="about">
        <app-brand-logo [light]="true" />
        <p>Mezun Kart · Mezun Ağı Programı<br />www.mezunkart.goc.gov.tr</p>
      </div>
      <div>
        <h4>Program</h4>
        <a href="#program">Program hakkında</a>
        <a href="#haklar">Haklar</a>
        <a href="#kurumlar">Paydaş kurumlar</a>
      </div>
      <div>
        <h4>Mezun Portalı</h4>
        <a routerLink="/login">Giriş yap</a>
        <a routerLink="/login">Kayıt ol</a>
        <a href="#duyurular">Duyurular</a>
      </div>
      <div>
        <h4>İletişim</h4>
        <span>YİMER 157 (7/24)</span>
        <span>destek&#64;mezunkart.goc.gov.tr</span>
      </div>
    </div>
    <p class="copy">
      © 2026 T.C. Göç İdaresi Başkanlığı · Bu sayfa geliştirme aşamasındadır, içerik örnektir.
    </p>
  `,
  styles: `
    :host {
      display: block;
      padding: 64px 24px 32px;
      color: rgba(255, 255, 255, 0.75);
      background: var(--mk-navy);
    }
    .inner {
      display: grid;
      grid-template-columns: 2fr repeat(3, 1fr);
      gap: 32px;
      max-width: 1192px;
      margin: 0 auto;
    }
    .about p {
      margin: 16px 0 0;
      font-size: 15px;
      line-height: 1.7;
    }
    h4 {
      margin: 0 0 16px;
      font-size: 16px;
      color: #fff;
    }
    a,
    span {
      display: block;
      margin-bottom: 10px;
      font-size: 15px;
      color: rgba(255, 255, 255, 0.75);
    }
    a:hover {
      color: #fff;
    }
    .copy {
      max-width: 1192px;
      margin: 32px auto 0;
      padding-top: 18px;
      font-size: 13px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }
    @media (max-width: 900px) {
      .inner {
        grid-template-columns: 1fr 1fr;
      }
      .about {
        grid-column: 1 / -1;
      }
    }
  `,
})
export class PublicFooter {}
