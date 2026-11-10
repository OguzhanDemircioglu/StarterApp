import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '@ngx-translate/core';
import { sessionFeature } from '../../core/auth/session.state';
import { Page } from '../../shared/page/page';
import { Section } from '../../shared/page/section';

/** / — yönetim arayüzünün anasayfası: karşılama. */
@Component({
  imports: [TranslatePipe, Page, Section],
  templateUrl: './home.html',
})
export default class Home {
  protected readonly user = inject(Store).selectSignal(sessionFeature.selectUser);
}
