import { Component, computed, signal } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TrDatePipe } from '../../../../shared/format/tr-pipes';
import { ANNOUNCEMENT_CATEGORIES, AnnouncementCategory, ANNOUNCEMENTS } from '../../../../shared/program/announcements.mock';

/**
 * /user/site/announcements: kurumsal duyuru arşivi. Sabitlenmiş duyuru üstte öne çıkar, diğerleri kategoriye göre
 * süzülen kartlardır; "Devamını oku" metnin tamamını açar. Okundu takibi Dijital Platform'daki Duyurular sayfasındadır.
 */
@Component({
  imports: [NzIconModule, TrDatePipe],
  templateUrl: './site-announcements.html',
  host: { class: 'mk-page' },
  styleUrl: './site-announcements.css',
})
export default class SiteAnnouncements {
  protected readonly featured = ANNOUNCEMENTS.find((a) => a.pinned) ?? ANNOUNCEMENTS[0];

  protected readonly categories: (AnnouncementCategory | 'Tümü')[] = ['Tümü', ...ANNOUNCEMENT_CATEGORIES];
  protected readonly category = signal<AnnouncementCategory | 'Tümü'>('Tümü');

  protected readonly items = computed(() => {
    const c = this.category();
    return ANNOUNCEMENTS.filter((a) => a.id !== this.featured.id && (c === 'Tümü' || a.category === c));
  });

  /** Metni açık olan duyurular. */
  protected readonly expanded = signal<ReadonlySet<number>>(new Set());

  protected toggle(id: number): void {
    this.expanded.update((set) => {
      const next = new Set(set);
      if (!next.delete(id)) {
        next.add(id);
      }
      return next;
    });
  }
}
