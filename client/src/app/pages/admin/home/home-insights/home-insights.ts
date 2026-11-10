import { Component } from '@angular/core';
import { TrNumberPipe } from '../../../../shared/format/tr-pipes';
import { GROUP_SHARES, INSTITUTION_REQUESTS, NATIONALITIES, Share } from '../home.mock';

/** Admin anasayfasının sağ sütunu: grup, uyruk ve kurum dağılımları (CSS çubukları, grafik kütüphanesi yok). */
@Component({
  selector: 'app-home-insights',
  imports: [TrNumberPipe],
  template: `
    <section class="card">
      <header class="card-head"><h2>Grup Dağılımı</h2></header>
      <div class="stack-bar">
        @for (g of groups; track g.label; let i = $index) {
          <span [style.width.%]="g.value" [class]="'seg seg-' + i"></span>
        }
      </div>
      <ul class="legend">
        @for (g of groups; track g.label; let i = $index) {
          <li>
            <span [class]="'dot seg-' + i"></span>{{ g.label }}<strong>%{{ g.value }}</strong>
          </li>
        }
      </ul>
    </section>

    <section class="card">
      <header class="card-head"><h2>Uyruğa Göre Mezunlar</h2></header>
      <ul class="bars">
        @for (n of nationalities; track n.label) {
          <li>
            <span class="label">{{ n.label }}</span>
            <span class="track"><span [style.width.%]="percent(n, nationalities)"></span></span>
            <strong>{{ n.value | trNumber }}</strong>
          </li>
        }
      </ul>
    </section>

    <section class="card">
      <header class="card-head"><h2>Kurumlara Göre Talepler</h2></header>
      <ul class="bars">
        @for (r of requests; track r.label) {
          <li class="wide">
            <span class="label">{{ r.label }}</span>
            <span class="track red"><span [style.width.%]="percent(r, requests)"></span></span>
            <strong>{{ r.value | trNumber }}</strong>
          </li>
        }
      </ul>
    </section>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .stack-bar {
      display: flex;
      height: 14px;
      overflow: hidden;
      border-radius: 7px;
    }
    .seg-0 {
      background: #6aa6b8;
    }
    .seg-1 {
      background: var(--mk-teal);
    }
    .seg-2 {
      background: var(--mk-red);
    }
    .legend {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 14px;
      font-size: 13px;
    }
    .legend li {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .legend strong {
      margin-left: auto;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .bars {
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-size: 13px;
    }
    .bars li {
      display: grid;
      grid-template-columns: 96px minmax(0, 1fr) 48px;
      align-items: center;
      gap: 10px;
    }
    .bars li.wide {
      grid-template-columns: minmax(0, 1fr) 48px;
      row-gap: 4px;
    }
    .bars li.wide .label {
      grid-column: 1 / -1;
    }
    .bars strong {
      text-align: right;
    }
    .track {
      height: 8px;
      background: #f0f0f0;
      border-radius: 4px;
    }
    .track span {
      display: block;
      height: 100%;
      background: var(--mk-teal);
      border-radius: 4px;
    }
    .track.red span {
      background: var(--mk-red);
    }
  `,
})
export class HomeInsights {
  protected readonly groups = GROUP_SHARES;
  protected readonly nationalities = NATIONALITIES;
  protected readonly requests = INSTITUTION_REQUESTS;

  /** En büyük değere göre çubuk uzunluğu. */
  protected percent(item: Share, list: Share[]): number {
    return Math.round((item.value / Math.max(...list.map((x) => x.value))) * 100);
  }
}
