import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { Notifier } from '../../../../core/notify/notifier';
import { Page } from '../../../../shared/page/page';
import { Section } from '../../../../shared/page/section';
import { CategoryApi } from '../category-api';
import { CategoryForm } from '../category-form/category-form';
import { CategoryResponse } from '../category.model';

/** /definitions/categories — liste, arama, ekle/düzenle (dialog) ve sil (onaylı). */
@Component({
  imports: [
    DatePipe,
    FormsModule,
    TranslatePipe,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzPopconfirmModule,
    NzTableModule,
    NzTooltipModule,
    Page,
    Section,
    CategoryForm,
  ],
  templateUrl: './category-list.html',
})
export default class CategoryList {
  private readonly api = inject(CategoryApi);
  private readonly notifier = inject(Notifier);

  protected readonly categories = signal<CategoryResponse[]>([]);
  protected readonly loading = signal(false);
  protected readonly search = signal('');

  /** Form dialog'u: editing null ise ekleme, değilse düzenleme. */
  protected readonly formOpen = signal(false);
  protected readonly editing = signal<CategoryResponse | null>(null);

  protected readonly filtered = computed(() => {
    const query = this.search().trim().toLocaleLowerCase();
    if (!query) {
      return this.categories();
    }
    return this.categories().filter(
      (category) =>
        category.name.toLocaleLowerCase().includes(query) ||
        (category.description ?? '').toLocaleLowerCase().includes(query),
    );
  });

  protected readonly sortByName = (a: CategoryResponse, b: CategoryResponse) => a.name.localeCompare(b.name);
  protected readonly sortByCreatedAt = (a: CategoryResponse, b: CategoryResponse) => a.createdAt.localeCompare(b.createdAt);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.api.getAll().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected openCreate(): void {
    this.editing.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(category: CategoryResponse): void {
    this.editing.set(category);
    this.formOpen.set(true);
  }

  protected remove(category: CategoryResponse): void {
    this.api.delete(category.id).subscribe(() => {
      this.notifier.success('record_deleted');
      this.load();
    });
  }
}
