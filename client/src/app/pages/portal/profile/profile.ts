import { Component, ElementRef, viewChild } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { INSTITUTIONS, MOCK_PROFILE } from '../portal.mock';

/** /portal/profile: mezunun profil sayfası (şimdilik geçici verilerle). */
@Component({
  selector: 'app-profile',
  imports: [NzIconModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export default class Profile {
  protected readonly profile = MOCK_PROFILE;
  protected readonly institutions = INSTITUTIONS;

  private readonly strip = viewChild.required<ElementRef<HTMLElement>>('strip');

  /** Kurumlar şeridini bir ekran genişliği kaydırır. */
  protected scrollInstitutions(direction: 1 | -1): void {
    const el = this.strip().nativeElement;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  }
}
