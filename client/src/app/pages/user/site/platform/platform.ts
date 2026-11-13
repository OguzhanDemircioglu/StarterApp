import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TrDatePipe } from '../../../../shared/format/tr-pipes';
import { ANNOUNCEMENTS } from '../../../../shared/program/announcements.mock';
import { INSTITUTIONS, OUTCOMES, RIGHT_GROUPS, ROADMAP } from '../../../../shared/program/program.mock';
import { PROGRAM_ABOUT, PROGRAM_INTRO, QUICK_LINKS } from './platform.mock';

/** /user/site/platform: Dijital Platform. Mezun Kart programını tanıtır, kurumsal sayfalara ve portala (/user/home) yönlendirir. */
@Component({
  imports: [RouterLink, NzIconModule, TrDatePipe],
  templateUrl: './platform.html',
  host: { class: 'mk-page' },
  styleUrl: './platform.css',
})
export default class Platform {
  protected readonly intro = PROGRAM_INTRO;
  protected readonly about = PROGRAM_ABOUT;
  protected readonly quickLinks = QUICK_LINKS;
  protected readonly outcomes = OUTCOMES;
  protected readonly roadmap = ROADMAP;
  protected readonly latest = ANNOUNCEMENTS.slice(0, 4);

  protected readonly stats = [
    { value: String(INSTITUTIONS.length), label: 'paydaş kurum' },
    { value: String(RIGHT_GROUPS.length), label: 'hak grubu' },
    { value: '2 yıl', label: 'mezuniyet sonrası ikamet' },
    { value: '5 yıl', label: 'çok girişli vize' },
  ];
}
