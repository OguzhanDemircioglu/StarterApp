import { Component } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { INSTITUTIONS, RIGHT_GROUPS } from '../../../shared/program/program.mock';
import { InstitutionEmblem } from '../../../shared/theme/institution-emblem';

/** Public sayfada Mezun Kart hakları (3 grup) ve paydaş kurumlar. */
@Component({
  selector: 'app-public-rights',
  imports: [NzIconModule, InstitutionEmblem],
  template: `
    <section id="haklar" class="mk-section">
      <h2>Mezun Kartın Sağlayacağı Haklar</h2>
      <p class="lead">Haklar mezuniyet düzeyine göre üç grupta tanımlanır.</p>
      <div class="groups">
        @for (g of groups; track g.group) {
          <article class="group" [class.featured]="g.group === 3">
            <header>GRUP {{ g.group }}</header>
            <ul class="who">
              @for (w of g.who; track w) {
                <li>{{ w }}</li>
              }
            </ul>
            <ul class="rights">
              @for (r of g.rights; track r) {
                <li><nz-icon nzType="check" /> {{ r }}</li>
              }
            </ul>
          </article>
        }
      </div>
    </section>

    <section id="kurumlar" class="mk-section">
      <h2>Paydaş Kurum ve Kuruluşlar</h2>
      <p class="lead">
        Program, Göç İdaresi Başkanlığı koordinasyonunda kurumlar arası iş birliğiyle yürütülür.
      </p>
      <div class="institutions">
        @for (inst of institutions; track inst.name) {
          <div class="institution">
            <app-institution-emblem [kind]="inst.emblem" />
            <span>{{ inst.name }}</span>
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
    .groups {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 24px;
    }
    .group {
      overflow: hidden;
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.9);
      border-radius: 22px;
      box-shadow: 0 20px 44px -26px rgba(27, 34, 43, 0.3);
    }
    .group header {
      padding: 16px 24px;
      font-size: 17px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #fff;
      background: linear-gradient(135deg, #12708a, var(--mk-teal));
    }
    .group.featured header {
      background: linear-gradient(135deg, #ec3a42, #b9141a);
    }
    .who {
      padding: 16px 24px;
      font-size: 15px;
      font-weight: 600;
      background: rgba(13, 92, 115, 0.06);
    }
    .who li::before {
      content: '◆ ';
      color: var(--mk-teal);
    }
    .rights {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 20px 24px 26px;
      font-size: 16px;
    }
    .rights li {
      display: flex;
      gap: 8px;
    }
    .rights nz-icon {
      margin-top: 4px;
      color: var(--mk-teal);
    }
    .institutions {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
      gap: 18px;
    }
    .institution {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 24px 14px;
      font-size: 14px;
      text-align: center;
      background: rgba(255, 255, 255, 0.78);
      border: 1px solid rgba(255, 255, 255, 0.9);
      border-radius: 20px;
      box-shadow: 0 16px 36px -26px rgba(27, 34, 43, 0.35);
    }
    @media (max-width: 900px) {
      .groups {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class PublicRights {
  protected readonly groups = RIGHT_GROUPS;
  protected readonly institutions = INSTITUTIONS;
}
