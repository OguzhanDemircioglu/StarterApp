import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { Notifier } from '../../../../core/notify/notifier';
import { Page } from '../../../../shared/page/page';
import { Section } from '../../../../shared/page/section';
import { UserApi } from '../user-api';
import { UserForm } from '../user-form/user-form';
import { UserPasswordForm } from '../user-password-form/user-password-form';
import { UserResponse } from '../user.model';

/** /administration/users — liste, arama, ekle/düzenle, şifre sıfırlama ve sil. "Son admin" kuralı backend'dedir. */
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
    NzTagModule,
    NzTooltipModule,
    Page,
    Section,
    UserForm,
    UserPasswordForm,
  ],
  templateUrl: './user-list.html',
})
export default class UserList {
  private readonly api = inject(UserApi);
  private readonly notifier = inject(Notifier);

  protected readonly users = signal<UserResponse[]>([]);
  protected readonly loading = signal(false);
  protected readonly search = signal('');

  protected readonly formOpen = signal(false);
  protected readonly editing = signal<UserResponse | null>(null);
  protected readonly passwordFormOpen = signal(false);
  protected readonly passwordUser = signal<UserResponse | null>(null);

  protected readonly filtered = computed(() => {
    const query = this.search().trim().toLocaleLowerCase();
    if (!query) {
      return this.users();
    }
    return this.users().filter(
      (user) => user.email.includes(query) || user.fullName.toLocaleLowerCase().includes(query),
    );
  });

  protected readonly sortByEmail = (a: UserResponse, b: UserResponse) => a.email.localeCompare(b.email);
  protected readonly sortByFullName = (a: UserResponse, b: UserResponse) => a.fullName.localeCompare(b.fullName);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.api.getAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected openCreate(): void {
    this.editing.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(user: UserResponse): void {
    this.editing.set(user);
    this.formOpen.set(true);
  }

  protected openPasswordReset(user: UserResponse): void {
    this.passwordUser.set(user);
    this.passwordFormOpen.set(true);
  }

  protected remove(user: UserResponse): void {
    this.api.delete(user.id).subscribe(() => {
      this.notifier.success('record_deleted');
      this.load();
    });
  }
}
