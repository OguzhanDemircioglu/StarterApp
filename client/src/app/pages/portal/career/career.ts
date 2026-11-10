import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { EVENTS } from '../events/events.mock';
import { TrDatePipe } from '../portal-pipes';
import { ApplicationStatus, CITIES, Job, JOB_TYPES, JobApplication, JOBS, JobType, MY_APPLICATIONS } from './career.mock';

const STATUS_TAG: Record<ApplicationStatus, string> = {
  Gönderildi: 'tag-blue',
  İnceleniyor: 'tag-amber',
  Mülakat: 'tag-green',
  Olumsuz: 'tag-red',
};

/** /portal/career: staj ve iş ilanları. Filtreleme ve kaydetme şimdilik tarayıcıda çalışır. */
@Component({
  selector: 'app-portal-career',
  imports: [
    FormsModule,
    NzCheckboxModule,
    NzIconModule,
    NzInputModule,
    NzProgressModule,
    NzSelectModule,
    NzTabsModule,
    TrDatePipe,
  ],
  templateUrl: './career.html',
  styleUrls: ['../portal.css', './career.css'],
})
export default class Career {
  private readonly message = inject(NzMessageService);

  protected readonly types = JOB_TYPES;
  protected readonly cities = CITIES;
  protected readonly careerEvents = EVENTS.filter((e) => e.category === 'Kariyer');

  protected readonly jobs = signal<Job[]>(JOBS);
  protected readonly applications = signal<JobApplication[]>(MY_APPLICATIONS);

  protected readonly query = signal('');
  protected readonly type = signal<JobType | null>(null);
  protected readonly city = signal<string | null>(null);
  protected readonly exemptOnly = signal(false);

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLocaleLowerCase('tr');
    return this.jobs().filter(
      (j) =>
        (!q || `${j.title} ${j.organization} ${j.field}`.toLocaleLowerCase('tr').includes(q)) &&
        (!this.type() || j.type === this.type()) &&
        (!this.city() || j.city === this.city()) &&
        (!this.exemptOnly() || j.workPermitExempt),
    );
  });

  protected readonly saved = computed(() => this.jobs().filter((j) => j.saved));

  protected readonly applied = computed(() =>
    this.applications().map((a) => ({ ...a, job: this.jobs().find((j) => j.id === a.jobId)! })),
  );

  protected isApplied(job: Job): boolean {
    return this.applications().some((a) => a.jobId === job.id);
  }

  protected statusTag(status: ApplicationStatus): string {
    return STATUS_TAG[status];
  }

  protected toggleSave(job: Job): void {
    this.jobs.update((list) => list.map((j) => (j.id === job.id ? { ...j, saved: !j.saved } : j)));
  }

  protected apply(job: Job): void {
    this.applications.update((list) => [
      { jobId: job.id, appliedAt: new Date().toLocaleDateString('tr-TR'), status: 'Gönderildi', note: 'Başvurunuz kuruma iletildi.' },
      ...list,
    ]);
    this.message.success(`“${job.title}” ilanına başvurunuz alındı (örnek).`);
  }

  protected clearFilters(): void {
    this.query.set('');
    this.type.set(null);
    this.city.set(null);
    this.exemptOnly.set(false);
  }
}
