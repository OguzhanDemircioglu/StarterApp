import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { TrDatePipe } from '../portal-pipes';
import { Announcement, ANNOUNCEMENT_CATEGORIES, AnnouncementCategory, ANNOUNCEMENTS } from './announcements.mock';

/** /portal/announcements: kurum duyuruları; solda liste, sağda seçili duyuru. */
@Component({
  selector: 'app-portal-announcements',
  imports: [FormsModule, NzIconModule, NzInputModule, TrDatePipe],
  templateUrl: './announcements.html',
  styleUrls: ['../portal.css', './announcements.css'],
})
export default class Announcements {
  protected readonly categories: (AnnouncementCategory | 'Tümü')[] = ['Tümü', ...ANNOUNCEMENT_CATEGORIES];
  protected readonly category = signal<AnnouncementCategory | 'Tümü'>('Tümü');
  protected readonly query = signal('');

  protected readonly items = signal<Announcement[]>(ANNOUNCEMENTS);
  protected readonly selectedId = signal(ANNOUNCEMENTS[0].id);

  protected readonly unreadCount = computed(() => this.items().filter((a) => a.unread).length);
  protected readonly selected = computed(() => this.items().find((a) => a.id === this.selectedId()) ?? null);

  protected readonly visible = computed(() => {
    const q = this.query().trim().toLocaleLowerCase('tr');
    const c = this.category();
    return this.items()
      .filter((a) => (c === 'Tümü' || a.category === c) && (!q || `${a.title} ${a.excerpt}`.toLocaleLowerCase('tr').includes(q)))
      .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
  });

  constructor() {
    this.select(this.selectedId());
  }

  protected select(id: number): void {
    this.selectedId.set(id);
    this.items.update((list) => list.map((a) => (a.id === id ? { ...a, unread: false } : a)));
  }

  protected markAllRead(): void {
    this.items.update((list) => list.map((a) => ({ ...a, unread: false })));
  }
}
