import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NzCardModule } from 'ng-zorro-antd/card';

/**
 * Sayfa içindeki kart. Başlık bir çeviri anahtarıdır; sağ üstteki düğmeler sectionActions ile verilir.
 *
 *   <app-section title="category_list_title">
 *     <button sectionActions nz-button>...</button>
 *     ...içerik...
 *   </app-section>
 */
@Component({
  selector: 'app-section',
  imports: [TranslatePipe, NzCardModule],
  template: `
    <nz-card [nzTitle]="title() | translate" [nzExtra]="actions">
      <ng-content />
    </nz-card>
    <ng-template #actions><ng-content select="[sectionActions]" /></ng-template>
  `,
  styles: `
    :host {
      display: block;
      margin-bottom: 16px;
    }
  `,
})
export class Section {
  readonly title = input.required<string>();
}
