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
      padding: 88px 24px 0;
      overflow: hidden;
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
      margin: 24px 0 20px;
      font-size: 52px;
      line-height: 1.12;
      letter-spacing: -1.5px;
      color: var(--mk-navy);
    }
    p {
      max-width: 600px;
      font-size: 19px;
      line-height: 1.7;
      color: #444;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 36px;
    }
    .visual {
      max-width: 420px;
      justify-self: center;
      width: 100%;
      transform: rotate(-4deg);
    }
    .stats {
      grid-template-columns: repeat(4, 1fr);
      margin-top: 72px;
      padding: 30px 0;
      list-style: none;
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(24px) saturate(160%);
      -webkit-backdrop-filter: blur(24px) saturate(160%);
      border: 1px solid rgba(255, 255, 255, 0.85);
      border-radius: 28px;
      box-shadow: 0 24px 50px -28px rgba(27, 34, 43, 0.35);
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
      font-size: 36px;
      line-height: 1.2;
      color: var(--mk-red);
    }
    .stats span {
      font-size: 15px;
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
        font-size: 34px;
        letter-spacing: -0.5px;
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
