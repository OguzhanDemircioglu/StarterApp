import { Component, ElementRef, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { INSTITUTIONS } from '../../../shared/program/program.mock';
import { GraduateCard } from '../../../shared/theme/graduate-card';
import { InstitutionEmblem } from '../../../shared/theme/institution-emblem';
import { MOCK_CARD, MOCK_PROFILE } from '../portal.mock';
import { PROFILE_STATS } from './profile.mock';

/** /user/profile: mezunun profil sayfası (şimdilik geçici verilerle): kimlik, istatistikler, dijital kart, özgeçmiş. */
@Component({
  selector: 'app-profile',
  imports: [RouterLink, NzIconModule, NzProgressModule, GraduateCard, InstitutionEmblem],
  templateUrl: './profile.html',
  host: { class: 'mk-page' },
  styleUrl: './profile.css',
})
export default class Profile {
  protected readonly profile = MOCK_PROFILE;
  protected readonly card = MOCK_CARD;
  protected readonly stats = PROFILE_STATS;
  protected readonly institutions = INSTITUTIONS;

  private readonly strip = viewChild.required<ElementRef<HTMLElement>>('strip');

  /** Kurumlar şeridini bir ekran genişliği kaydırır. */
  protected scrollInstitutions(direction: 1 | -1): void {
    const el = this.strip().nativeElement;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  }
}
