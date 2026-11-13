import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { RIGHT_GROUPS } from '../../../../shared/program/program.mock';
import { SERVICES } from '../../../../shared/program/services.mock';
import { APPLICATION_STEPS, REQUIRED_DOCUMENTS } from './site-services.mock';

type GroupFilter = 1 | 2 | 3 | 'Tümü';

/**
 * /user/site/services: kurumsal Hizmetler sayfası. Kart gruplarını, hizmet kataloğunu ve başvuru sürecini anlatır;
 * kişisel kart ve başvurular Dijital Platform'daki Hizmetler sayfasındadır (/user/services).
 */
@Component({
  imports: [RouterLink, NzIconModule],
  templateUrl: './site-services.html',
  host: { class: 'mk-page' },
  styleUrl: './site-services.css',
})
export default class SiteServices {
  protected readonly groups = RIGHT_GROUPS;
  protected readonly steps = APPLICATION_STEPS;
  protected readonly documents = REQUIRED_DOCUMENTS;

  protected readonly filters: GroupFilter[] = ['Tümü', 1, 2, 3];
  protected readonly filter = signal<GroupFilter>('Tümü');

  protected readonly services = computed(() => {
    const f = this.filter();
    return f === 'Tümü' ? SERVICES : SERVICES.filter((s) => s.groups.includes(f));
  });
}
