import { Component, computed, signal } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { TrDatePipe } from '../portal-pipes';
import { EVENT_CATEGORIES, EventCategory, EVENTS, PortalEvent } from './events.mock';

type Filter = EventCategory | 'Tümü' | 'Çevrimiçi';

/** Mock verinin "bugün"ü; gerçek veride new Date() olacak. */
const TODAY = new Date(2026, 10, 10);

function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** /portal/events: etkinlik takvimi. Katılım şimdilik tarayıcıda tutulur. */
@Component({
  selector: 'app-portal-events',
  imports: [NzIconModule, NzProgressModule, TrDatePipe],
  templateUrl: './events.html',
  styleUrls: ['../portal.css', './events.css'],
})
export default class Events {
  protected readonly filters: Filter[] = ['Tümü', ...EVENT_CATEGORIES, 'Çevrimiçi'];
  protected readonly filter = signal<Filter>('Tümü');

  protected readonly events = signal<PortalEvent[]>(EVENTS);
  protected readonly featured = computed(() => this.events().find((e) => e.featured)!);
  protected readonly going = computed(() => this.events().filter((e) => e.going));

  protected readonly visible = computed(() => {
    const f = this.filter();
    return this.events().filter(
      (e) => !e.featured && (f === 'Tümü' || (f === 'Çevrimiçi' ? e.online : e.category === f)),
    );
  });

  /** Yan sütundaki aylık takvim; etkinlik olan günler işaretlenir (Pazartesi ile başlar). */
  private readonly eventDays = computed(() => new Set(this.events().map((e) => e.date)));
  protected readonly weekdays = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];
  protected readonly today = toKey(TODAY);
  protected readonly month = signal(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  protected readonly monthLabel = computed(() =>
    new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(this.month()),
  );
  protected readonly days = computed(() => {
    const first = this.month();
    const start = new Date(first);
    start.setDate(1 - ((first.getDay() + 6) % 7));
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const key = toKey(date);
      return { key, day: date.getDate(), inMonth: date.getMonth() === first.getMonth(), hasEvent: this.eventDays().has(key) };
    });
  });

  protected shiftMonth(delta: number): void {
    const m = this.month();
    this.month.set(new Date(m.getFullYear(), m.getMonth() + delta, 1));
  }

  protected fill(e: PortalEvent): number {
    return Math.round((e.attendees / e.capacity) * 100);
  }

  protected toggleGoing(id: number): void {
    this.events.update((list) =>
      list.map((e) => (e.id === id ? { ...e, going: !e.going, attendees: e.attendees + (e.going ? -1 : 1) } : e)),
    );
  }
}
