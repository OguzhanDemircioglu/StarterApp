import { Component, computed, ElementRef, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { Conversation, CONVERSATIONS } from './messages.mock';

/** /user/messages: mezunlar ve kurumlarla mesajlaşma. Gönderilen mesajlar şimdilik tarayıcıda kalır. */
@Component({
  selector: 'app-portal-messages',
  imports: [FormsModule, NzIconModule, NzInputModule],
  templateUrl: './messages.html',
  host: { class: 'mk-page' },
  styleUrl: './messages.css',
})
export default class Messages {
  protected readonly conversations = signal<Conversation[]>(CONVERSATIONS);
  protected readonly activeId = signal<number | null>(CONVERSATIONS[0].id);
  protected readonly query = signal('');
  protected readonly draft = signal('');

  private readonly thread = viewChild<ElementRef<HTMLElement>>('thread');

  protected readonly visible = computed(() => {
    const q = this.query().trim().toLocaleLowerCase('tr');
    return this.conversations().filter((c) => !q || c.name.toLocaleLowerCase('tr').includes(q));
  });

  protected readonly active = computed(() => this.conversations().find((c) => c.id === this.activeId()) ?? null);

  constructor() {
    this.open(CONVERSATIONS[0].id);
  }

  protected open(id: number): void {
    this.activeId.set(id);
    this.conversations.update((list) => list.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
    this.scrollToEnd();
  }

  /** Dar ekranda listeye geri döner. */
  protected back(): void {
    this.activeId.set(null);
  }

  protected send(): void {
    const text = this.draft().trim();
    const id = this.activeId();
    if (!text || id === null) {
      return;
    }
    const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    this.conversations.update((list) =>
      list.map((c) => (c.id === id ? { ...c, lastTime: time, messages: [...c.messages, { mine: true, text, time }] } : c)),
    );
    this.draft.set('');
    this.scrollToEnd();
  }

  protected lastMessage(c: Conversation): string {
    const last = c.messages.at(-1);
    return last ? (last.mine ? 'Siz: ' : '') + last.text : '';
  }

  private scrollToEnd(): void {
    setTimeout(() => {
      const el = this.thread()?.nativeElement;
      el?.scrollTo({ top: el.scrollHeight });
    });
  }
}
