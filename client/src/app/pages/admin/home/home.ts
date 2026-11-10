import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { sessionFeature } from '../../../core/auth/session.state';
import { TrDatePipe, TrNumberPipe } from '../../../shared/format/tr-pipes';
import { Page } from '../../../shared/page/page';
import { ANNOUNCEMENTS } from '../../../shared/program/announcements.mock';
import { EVENTS } from '../../../shared/program/events.mock';
import { HomeInsights } from './home-insights/home-insights';
import { ApplicationStatus, AUDIT, KPIS, PENDING, PendingApplication } from './home.mock';

const STATUS_TAG: Record<ApplicationStatus, string> = {
  Yeni: 'tag-blue',
  'Belge bekliyor': 'tag-red',
  Değerlendirmede: 'tag-amber',
};

/** /admin: yönetim panelinin anasayfası (şimdilik sabit verilerle). Grafik kütüphanesi kullanılmaz; çubuklar CSS'tir. */
@Component({
  imports: [NzIconModule, TrDatePipe, TrNumberPipe, Page, HomeInsights],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export default class Home {
  private readonly message = inject(NzMessageService);

  protected readonly user = inject(Store).selectSignal(sessionFeature.selectUser);
  protected readonly kpis = KPIS;
  protected readonly pending = PENDING;
  protected readonly audit = AUDIT;
  protected readonly announcements = ANNOUNCEMENTS.slice(0, 4);
  protected readonly events = EVENTS.slice(0, 4);

  protected statusTag(status: ApplicationStatus): string {
    return STATUS_TAG[status];
  }

  protected fill(attendees: number, capacity: number): number {
    return Math.round((attendees / capacity) * 100);
  }

  protected act(app: PendingApplication, action: string): void {
    this.message.info(`${app.id}: “${action}” işlemi örnektir, henüz sunucuya gitmiyor.`);
  }
}
