import { AfterViewInit, Component, DestroyRef, ElementRef, inject } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { OUTCOMES, ROADMAP } from '../../shared/program/program.mock';
import { AmbientBg } from '../../shared/theme/ambient-bg';
import { revealOnScroll } from '../../shared/theme/reveal';
import { PublicFooter } from './public-footer/public-footer';
import { PublicHeader } from './public-header/public-header';
import { PublicHero } from './public-hero/public-hero';
import { PublicNews } from './public-news/public-news';
import { PublicRights } from './public-rights/public-rights';
import { ABOUT, FEATURES, PUBLIC_NAV, STEPS } from './public.mock';

/** Sırayla, yumuşakça beliren parçalar: hero metni ve kartı, bölüm başlıkları, kartlar. */
const REVEAL = [
  'app-public-hero .tag',
  'app-public-hero h1',
  'app-public-hero .text > p',
  'app-public-hero .actions',
  'app-graduate-card > *',
  'app-public-hero .stats > li',
  '.mk-section > h2',
  '.mk-section > .lead',
  '.mk-section .card',
  '.steps > li',
  '.group',
  '.institution',
  '.roadmap > li',
  '.cta > *',
].join(', ');

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
export default class Public implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly nav = PUBLIC_NAV;
  protected readonly about = ABOUT;
  protected readonly features = FEATURES;
  protected readonly steps = STEPS;
  protected readonly outcomes = OUTCOMES;
  protected readonly roadmap = ROADMAP;

  ngAfterViewInit(): void {
    this.destroyRef.onDestroy(revealOnScroll(this.host.nativeElement, REVEAL));
  }
}
