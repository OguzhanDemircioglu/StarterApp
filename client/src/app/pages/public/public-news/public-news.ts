import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TrDatePipe } from '../../../shared/format/tr-pipes';
import { ANNOUNCEMENTS } from '../../../shared/program/announcements.mock';
import { EVENTS } from '../../../shared/program/events.mock';

/** Public sayfada son duyurular, yaklaşan etkinlikler ve portala çağrı. */
@Component({
  selector: 'app-public-news',
  imports: [RouterLink, NzIconModule, TrDatePipe],
  template: `
    <section id="duyurular" class="mk-section">
      <h2>Duyurular ve Etkinlikler</h2>
      <p class="lead">Paydaş kurumlardan son duyurular ve önümüzdeki etkinlikler.</p>
      <div class="news">
        <div class="list">
          @for (a of announcements; track a.id) {
            <article class="card item">
              <div class="meta">
                <span class="tag">{{ a.category }}</span>
                <span class="muted">{{ a.date | trDate: 'long' }}</span>
              </div>
              <h3>{{ a.title }}</h3>
              <p>{{ a.excerpt }}</p>
              <span class="muted">{{ a.institution }}</span>
            </article>
          }
        </div>
        <aside class="card events">
          <h3>Yaklaşan Etkinlikler</h3>
          <ul>
            @for (e of events; track e.id) {
              <li>
                <span class="date"
                  ><strong>{{ e.date | trDate: 'day' }}</strong
                  >{{ e.date | trDate: 'month' }}</span
                >
                <div>
                  <strong>{{ e.title }}</strong>
                  <p class="muted">{{ e.place }}</p>
                </div>
              </li>
            }
          </ul>
        </aside>
      </div>
    </section>

    <section class="cta">
      <div>
        <h2>Mezun Portalı’na katılın</h2>
        <p>Dijital kartınızı alın, haklarınızı ve başvurularınızı tek yerden izleyin.</p>
      </div>
      <a class="btn btn-lg" routerLink="/login">Giriş yap veya kayıt ol <nz-icon nzType="right" /></a>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
    .news {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 380px;
      gap: 24px;
      align-items: start;
    }
    .list {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .meta {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    h3 {
      margin: 14px 0 8px;
      font-size: 19px;
      color: var(--mk-navy);
    }
    .item p {
      margin: 0 0 12px;
      font-size: 16px;
      line-height: 1.7;
      color: #444;
    }
    .events ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .events li {
      display: flex;
      gap: 14px;
      padding: 16px 0;
      border-top: 1px solid rgba(27, 34, 43, 0.08);
      font-size: 15px;
    }
    .events p {
      margin: 2px 0 0;
    }
    .date {
      display: flex;
      flex: 0 0 58px;
      flex-direction: column;
      align-items: center;
      padding: 8px 0;
      font-size: 12px;
      text-transform: uppercase;
      color: var(--mk-red);
      background: var(--mk-red-soft);
      border-radius: 16px;
    }
    .date strong {
      font-size: 22px;
    }
    .cta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      max-width: 1192px;
      margin: 96px auto;
      padding: 48px 56px;
      color: #fff;
      background:
        radial-gradient(circle at 85% 0%, rgba(255, 255, 255, 0.22), transparent 45%),
        linear-gradient(120deg, #a51117, var(--mk-red) 60%, #ec3a42);
      border-radius: 32px;
      box-shadow: 0 36px 70px -34px rgba(215, 25, 32, 0.7);
    }
    .cta h2 {
      margin: 0 0 10px;
      font-size: 32px;
      letter-spacing: -0.5px;
    }
    .cta p {
      margin: 0;
      font-size: 18px;
      opacity: 0.92;
    }
    @media (max-width: 900px) {
      .news {
        grid-template-columns: 1fr;
      }
      .cta {
        flex-direction: column;
        align-items: flex-start;
        margin: 56px 16px;
        padding: 32px 24px;
      }
    }
  `,
})
export class PublicNews {
  protected readonly announcements = ANNOUNCEMENTS.slice(0, 3);
  protected readonly events = EVENTS.slice(0, 4);
}
