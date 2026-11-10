import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzResultModule } from 'ng-zorro-antd/result';

/** Henüz içeriği olmayan portal menüleri için geçici sayfa. */
@Component({
  selector: 'app-coming-soon',
  imports: [RouterLink, NzButtonModule, NzResultModule],
  template: `
    <div class="card">
      <nz-result nzStatus="info" nzTitle="Bu bölüm hazırlanıyor" nzSubTitle="İçerik yakında eklenecek.">
        <div nz-result-extra>
          <a nz-button nzType="primary" nzDanger routerLink="/portal/profile">Profilime dön</a>
        </div>
      </nz-result>
    </div>
  `,
  styles: `
    .card {
      background: #fff;
      border: 1px solid #ececec;
      border-radius: 12px;
    }
  `,
})
export default class ComingSoon {}
