import { Component } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { OUTCOMES, ROADMAP } from '../../shared/program/program.mock';
import { AmbientBg } from '../../shared/theme/ambient-bg';
import { PublicFooter } from './public-footer/public-footer';
import { PublicHeader } from './public-header/public-header';
import { PublicHero } from './public-hero/public-hero';
import { PublicNews } from './public-news/public-news';
import { PublicRights } from './public-rights/public-rights';
import { ABOUT, FEATURES, PUBLIC_NAV, STEPS } from './public.mock';

/**
 * /: public tanıtım sayfası (giriş gerektirmez). Mezun Kart programını sunumdaki bilgilerle anlatır ve portala yönlendirir.
 * Büyük bölümler kendi component'lerindedir (component stil bütçesi dosya başına 4 kB).
 */
@Component({
  selector: 'app-public',
  host: { class: 'mk-premium' },
  imports: [NzIconModule, AmbientBg, PublicHeader, PublicHero, PublicRights, PublicNews, PublicFooter],
  templateUrl: './public.html',
  styleUrl: './public.css',
})
export default class Public {
  protected readonly nav = PUBLIC_NAV;
  protected readonly about = ABOUT;
  protected readonly features = FEATURES;
  protected readonly steps = STEPS;
  protected readonly outcomes = OUTCOMES;
  protected readonly roadmap = ROADMAP;
}
