import { Component, inject, input, output, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ChangePassword } from '../../auth/change-password/change-password';
import { SessionActions } from '../../auth/session.actions';
import { sessionFeature } from '../../auth/session.state';
import { Language, LanguageService } from '../../i18n/language';

@Component({
  selector: 'app-topbar',
  imports: [TranslatePipe, NzButtonModule, NzDropdownModule, NzIconModule, NzMenuModule, NzTagModule, ChangePassword],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  private readonly store = inject(Store);
  private readonly languageService = inject(LanguageService);

  readonly collapsed = input(false);
  readonly toggleSidebar = output<void>();

  protected readonly user = this.store.selectSignal(sessionFeature.selectUser);
  protected readonly language = this.languageService.current;
  protected readonly changePasswordOpen = signal(false);

  protected useLanguage(language: Language): void {
    this.languageService.use(language);
  }

  protected logout(): void {
    this.store.dispatch(SessionActions.logout());
  }
}
