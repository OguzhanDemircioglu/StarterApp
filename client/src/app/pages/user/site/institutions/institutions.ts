import { Component, computed, signal } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { INSTITUTIONS } from '../../../../shared/program/program.mock';
import { InstitutionEmblem } from '../../../../shared/theme/institution-emblem';
import { INSTITUTION_AREAS, INSTITUTION_ROLES, InstitutionArea } from './institutions.mock';

/** /user/site/institutions: paydaş kurumlar ve programdaki görevleri, alana göre süzülebilir. */
@Component({
  imports: [NzIconModule, InstitutionEmblem],
  templateUrl: './institutions.html',
  host: { class: 'mk-page' },
  styleUrl: './institutions.css',
})
export default class Institutions {
  protected readonly areas: (InstitutionArea | 'Tümü')[] = ['Tümü', ...INSTITUTION_AREAS];
  protected readonly area = signal<InstitutionArea | 'Tümü'>('Tümü');

  private readonly all = INSTITUTIONS.map((inst) => ({ ...inst, ...INSTITUTION_ROLES[inst.name] }));
  protected readonly total = this.all.length;

  protected readonly visible = computed(() => {
    const a = this.area();
    return a === 'Tümü' ? this.all : this.all.filter((inst) => inst.area === a);
  });
}
