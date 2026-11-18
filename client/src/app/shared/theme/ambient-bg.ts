import { Component } from '@angular/core';

/**
 * Cam yüzeylerin arkasındaki yavaş süzülen, bulanık renk lekeleri (Reel_50 referansı).
 * Sayfanın arkasında sabit durur; üst elemanların arka planı saydam olmalıdır.
 */
@Component({
  selector: 'app-ambient-bg',
  host: { 'aria-hidden': 'true' },
  template: `<i class="b1"></i><i class="b2"></i><i class="b3"></i>`,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: -1;
      overflow: hidden;
      pointer-events: none;
      background: #f3f3f6;
    }
    i {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
      animation: float 24s infinite alternate cubic-bezier(0.45, 0.05, 0.55, 0.95);
      will-change: transform;
    }
    .b1 {
      top: -12%;
      left: -10%;
      width: 50vw;
      height: 50vw;
      background: #ff5a62;
      opacity: 0.32;
    }
    .b2 {
      right: -12%;
      bottom: -14%;
      width: 46vw;
      height: 46vw;
      background: #2f6fd6;
      opacity: 0.26;
      animation-delay: -6s;
    }
    .b3 {
      top: 32%;
      left: 38%;
      width: 34vw;
      height: 34vw;
      background: #ffb24a;
      opacity: 0.28;
      animation-delay: -12s;
    }
    @keyframes float {
      0% {
        transform: translate(0, 0) scale(1) rotate(0deg);
      }
      33% {
        transform: translate(5%, 10%) scale(1.05) rotate(5deg);
      }
      66% {
        transform: translate(-5%, 5%) scale(0.95) rotate(-5deg);
      }
      100% {
        transform: translate(0, -10%) scale(1.1) rotate(0deg);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      i {
        animation: none;
      }
    }
  `,
})
export class AmbientBg {}
