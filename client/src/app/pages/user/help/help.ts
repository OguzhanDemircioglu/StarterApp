import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { OUTCOMES, ROADMAP } from '../../../shared/program/program.mock';
import { FAQ_TOPICS, FaqTopic, FAQS } from './help.mock';

/** /user/help: sık sorulan sorular, destek kanalları ve program hakkında bilgi. */
@Component({
  selector: 'app-portal-help',
  imports: [FormsModule, NzCollapseModule, NzIconModule, NzInputModule, NzSelectModule],
  templateUrl: './help.html',
  host: { class: 'mk-page' },
  styleUrl: './help.css',
})
export default class Help {
  private readonly message = inject(NzMessageService);

  protected readonly topics = FAQ_TOPICS;
  protected readonly outcomes = OUTCOMES;
  protected readonly roadmap = ROADMAP;

  protected readonly query = signal('');
  protected readonly topic = signal<FaqTopic | null>(null);

  protected readonly faqs = computed(() => {
    const q = this.query().trim().toLocaleLowerCase('tr');
    return FAQS.filter(
      (f) =>
        (!this.topic() || f.topic === this.topic()) &&
        (!q || `${f.question} ${f.answer}`.toLocaleLowerCase('tr').includes(q)),
    );
  });

  protected countOf(topic: FaqTopic): number {
    return FAQS.filter((f) => f.topic === topic).length;
  }

  protected pickTopic(topic: FaqTopic): void {
    this.topic.set(this.topic() === topic ? null : topic);
  }

  protected ticket = { subject: null as string | null, text: '' };

  protected sendTicket(): void {
    if (!this.ticket.subject || !this.ticket.text.trim()) {
      this.message.warning('Lütfen konu seçip mesajınızı yazın.');
      return;
    }
    this.message.success('Destek talebiniz alındı (örnek). Yanıt Mesajlar sayfasına gelecek.');
    this.ticket = { subject: null, text: '' };
  }
}
