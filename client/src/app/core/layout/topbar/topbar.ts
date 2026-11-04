import { Component, inject, input, output, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { ChangePassword } from '../../auth/change-password/change-password';
import { RoleTag } from '../../auth/role-tag';
import { SessionActions } from '../../auth/session.actions';
import { sessionFeature } from '../../auth/session.state';

@Component({
  selector: 'app-topbar',
  imports: [TranslatePipe, NzButtonModule, NzDropdownModule, NzIconModule, NzMenuModule, ChangePassword, RoleTag],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  private readonly store = inject(Store);

  readonly collapsed = input(false);
  readonly toggleSidebar = output<void>();

  protected readonly user = this.store.selectSignal(sessionFeature.selectUser);
  protected readonly changePasswordOpen = signal(false);

  protected logout(): void {
    this.store.dispatch(SessionActions.logout());
  }
}
