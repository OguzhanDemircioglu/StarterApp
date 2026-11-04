import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ROLE_COLORS, ROLE_LABEL_KEYS } from './roles';
import { Role } from './session.model';

/** Rolün renkli etiketi (üst bar ve kullanıcı listesi). */
@Component({
  selector: 'app-role-tag',
  imports: [TranslatePipe, NzTagModule],
  template: `<nz-tag [nzColor]="color()">{{ labelKey() | translate }}</nz-tag>`,
})
export class RoleTag {
  readonly role = input.required<Role>();

  protected readonly color = computed(() => ROLE_COLORS[this.role()]);
  protected readonly labelKey = computed(() => ROLE_LABEL_KEYS[this.role()]);
}
