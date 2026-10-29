import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { Observable } from 'rxjs';
import { Notifier } from '../../../../core/notify/notifier';
import { validateForm } from '../../../../shared/forms/form-utils';
import { CategoryApi } from '../category-api';
import { CategoryResponse } from '../category.model';

/**
 * Ekleme ve düzenleme için TEK form. category null ise ekleme, değilse düzenleme.
 * Doğrulama kuralları backend'deki @NotBlank/@Size kurallarıyla aynıdır; hata metinleri aynı anahtarları kullanır.
 */
@Component({
  selector: 'app-category-form',
  imports: [ReactiveFormsModule, TranslatePipe, NzModalModule, NzFormModule, NzInputModule],
  templateUrl: './category-form.html',
})
export class CategoryForm {
  private readonly api = inject(CategoryApi);
  private readonly notifier = inject(Notifier);

  readonly open = model(false);
  readonly category = input<CategoryResponse | null>(null);
  readonly saved = output<void>();

  protected readonly isEdit = computed(() => this.category() !== null);
  protected readonly saving = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
  });

  constructor() {
    // Dialog her açıldığında form seçilen kayıtla (ya da boş) doldurulur.
    effect(() => {
      if (this.open()) {
        const category = this.category();
        this.form.reset({ name: category?.name ?? '', description: category?.description ?? '' });
      }
    });
  }

  protected save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    const value = this.form.getRawValue();
    const request = { name: value.name.trim(), description: value.description.trim() || null };
    const category = this.category();

    const call: Observable<unknown> = category
      ? this.api.update(category.id, { ...request, version: category.version })
      : this.api.create(request);

    this.saving.set(true);
    call.subscribe({
      next: () => {
        this.saving.set(false);
        this.notifier.success(category ? 'record_updated' : 'record_created');
        this.open.set(false);
        this.saved.emit();
      },
      // Hata mesajını errorInterceptor gösterir; form açık kalır.
      error: () => this.saving.set(false),
    });
  }
}
