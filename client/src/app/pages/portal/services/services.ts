import { Component, inject } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { GraduateCard } from '../graduate-card/graduate-card';
import { MOCK_CARD, RIGHT_GROUPS } from '../portal.mock';
import { PortalService, SERVICE_APPLICATIONS, SERVICES } from './services.mock';

/** /portal/services: Mezun Kartı, haklar, başvurular ve hizmet kataloğu. */
@Component({
  selector: 'app-portal-services',
  imports: [NzIconModule, NzStepsModule, GraduateCard],
  templateUrl: './services.html',
  styleUrls: ['../portal.css', './services.css'],
})
export default class Services {
  private readonly message = inject(NzMessageService);

  protected readonly card = MOCK_CARD;
  protected readonly groups = RIGHT_GROUPS;
  protected readonly myRights = RIGHT_GROUPS.find((g) => g.group === MOCK_CARD.group)!.rights;
  protected readonly services = SERVICES;
  protected readonly applications = SERVICE_APPLICATIONS;

  protected eligible(service: PortalService): boolean {
    return service.groups.includes(this.card.group);
  }

  protected apply(service: PortalService): void {
    this.message.info(`“${service.title}” başvuru formu yakında eklenecek.`);
  }
}
