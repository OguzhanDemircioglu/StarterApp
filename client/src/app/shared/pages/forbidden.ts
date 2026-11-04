import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzResultModule } from 'ng-zorro-antd/result';

/** Rolün yetkisi olmayan sayfaya girilmeye çalışıldığında (roleGuard). */
@Component({
  imports: [RouterLink, TranslatePipe, NzResultModule, NzButtonModule],
  template: `
    <nz-result nzStatus="403" [nzTitle]="'page_forbidden_title' | translate" [nzSubTitle]="'page_forbidden_text' | translate">
      <div nz-result-extra>
        <a nz-button nzType="primary" routerLink="/">{{ 'common_back_home' | translate }}</a>
      </div>
    </nz-result>
  `,
})
export default class Forbidden {}
