import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Banner } from '../../../shared/theme/banner';
import { GraduateCard } from '../../../shared/theme/graduate-card';
import { HERO_STATS, SAMPLE_CARD } from '../public.mock';

/** Public sayfanın girişi: program mesajı, giriş düğmeleri, örnek dijital kart ve öne çıkan rakamlar. */
@Component({
  selector: 'app-public-hero',
  imports: [RouterLink, NzIconModule, Banner, GraduateCard],
  template: `
    <app-banner />
    <div class="inner">
      <div class="text">
        <span class="tag tag-red">MEZUN KART · Mezun Ağı Programı</span>
        <h1>Türkiye’den mezun oldunuz.<br />Türkiye ile bağınız sürsün.</h1>
        <p>
          Mezun Kart, ülkemizde eğitim gören uluslararası öğrencilerin mezuniyet sonrasında Türkiye
          ile sürdürülebilir bağlar kurmasını ve bu bağların güçlendirilmesini amaçlar.
        </p>
        <div class="actions">
          <a class="btn btn-primary btn-lg" routerLink="/login"
            >Mezun Portalı’na Giriş <nz-icon nzType="right"
          /></a>
          <a class="btn btn-lg" href="#haklar">Haklarınızı inceleyin</a>
        </div>
      </div>
      <div class="visual">
        <app-graduate-card [card]="card" />
      </div>
    </div>
    <ul class="stats">
      @for (s of stats; track s.label) {
        <li>
          <strong>{{ s.value }}</strong>
          <span>{{ s.label }}</span>
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      position: relative;
      display: block;
      padding: 72px 24px 0;
      overflow: hidden;
      background: linear-gradient(180deg, #fff 0%, var(--mk-bg) 100%);
    }
    app-banner {
      left: auto;
      width: 48%;
      --banner-height: 150px;
    }
    .inner,
    .stats {
      position: relative;
      display: grid;
      max-width: 1192px;
      margin: 0 auto;
    }
    .inner {
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
      gap: 48px;
      align-items: center;
    }
    h1 {
      margin: 18px 0 16px;
      font-size: 42px;
      line-height: 1.15;
      color: var(--mk-navy);
    }
    p {
      max-width: 560px;
      font-size: 17px;
      line-height: 28px;
      color: #444;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 28px;
    }
    .btn-lg {
      padding: 11px 22px;
      font-size: 15px;
    }
    .visual {
      max-width: 420px;
      justify-self: center;
      width: 100%;
      transform: rotate(-4deg);
    }
    .stats {
      grid-template-columns: repeat(4, 1fr);
      margin-top: 56px;
      padding: 22px 0;
      list-style: none;
      background: #fff;
      border: 1px solid var(--mk-border);
      border-radius: 14px;
    }
    .stats li {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .stats li + li {
      border-left: 1px solid var(--mk-border);
    }
    .stats strong {
      font-size: 26px;
      color: var(--mk-red);
    }
    .stats span {
      font-size: 13px;
      color: var(--mk-muted);
    }
    @media (max-width: 900px) {
      app-banner {
        display: none;
      }
      :host {
        padding: 40px 16px 0;
      }
      .inner {
        grid-template-columns: 1fr;
      }
      h1 {
        font-size: 30px;
      }
      .stats {
        grid-template-columns: 1fr 1fr;
        row-gap: 16px;
      }
      .stats li:nth-child(3) {
        border-left: 0;
      }
    }
  `,
})
export class PublicHero {
  protected readonly card = SAMPLE_CARD;
  protected readonly stats = HERO_STATS;
}
