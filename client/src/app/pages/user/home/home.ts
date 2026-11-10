import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { TrDatePipe, TrNumberPipe } from '../../../shared/format/tr-pipes';
import { ANNOUNCEMENTS } from '../../../shared/program/announcements.mock';
import { EVENTS } from '../../../shared/program/events.mock';
import { GraduateCard } from '../../../shared/theme/graduate-card';
import { MOCK_CARD, MOCK_PROFILE } from '../portal.mock';
import { FEED, FeedPost, PROFILE_STATS, SUGGESTIONS } from './home.mock';

/** /user/home: mezunun akışı (LinkedIn tarzı). Paylaşım ve beğeni şimdilik sadece tarayıcıda tutulur. */
@Component({
  selector: 'app-portal-home',
  imports: [TrDatePipe, TrNumberPipe, FormsModule, RouterLink, NzIconModule, NzProgressModule, GraduateCard],
  templateUrl: './home.html',
  host: { class: 'mk-page' },
  styleUrl: './home.css',
})
export default class Home {
  protected readonly profile = MOCK_PROFILE;
  protected readonly card = MOCK_CARD;
  protected readonly stats = PROFILE_STATS;
  protected readonly suggestions = SUGGESTIONS;
  protected readonly upcoming = EVENTS.slice(0, 3);
  protected readonly announcements = ANNOUNCEMENTS.slice(0, 3);

  protected readonly posts = signal<FeedPost[]>(FEED);
  protected readonly draft = signal('');
  protected readonly requested = signal<Set<string>>(new Set());

  protected share(): void {
    const text = this.draft().trim();
    if (!text) {
      return;
    }
    const post: FeedPost = {
      id: Date.now(),
      author: this.profile.fullName,
      initials: this.profile.initials,
      color: '#d71920',
      institution: false,
      subtitle: `${this.profile.department} · ${this.profile.university}`,
      time: 'Şimdi',
      text,
      likes: 0,
      comments: 0,
      liked: false,
    };
    this.posts.update((list) => [post, ...list]);
    this.draft.set('');
  }

  protected toggleLike(id: number): void {
    this.posts.update((list) =>
      list.map((p) => (p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p)),
    );
  }

  protected connect(name: string): void {
    this.requested.update((set) => new Set(set).add(name));
  }
}
