import { Component, computed, input } from '@angular/core';
import { GraduateCard as Card } from '../program/program.mock';

const QR_SIZE = 21;

/**
 * Dijital Mezun Kartı (sunum: "Dijital Kimlik"). Ana Sayfa ve Hizmetler'de kullanılır.
 * Karekod şimdilik süstür: kart numarasından türetilen sabit bir desen; gerçek doğrulama kodu backend'den gelecek.
 */
@Component({
  selector: 'app-graduate-card',
  template: `
    <div class="card-face" [class.compact]="compact()">
      <div class="top">
        <div>
          <span class="org">T.C. GÖÇ İDARESİ BAŞKANLIĞI</span>
          <strong class="title">MEZUN KART</strong>
        </div>
        <span class="group">GRUP {{ card().group }}</span>
      </div>

      <div class="middle">
        <div class="holder">
          <span class="label">Kart Sahibi</span>
          <strong>{{ card().holder }}</strong>
          <span class="label">{{ card().degree }}</span>
        </div>
        <svg class="qr" [attr.viewBox]="'0 0 ' + size + ' ' + size" aria-label="Doğrulama karekodu">
          <rect [attr.width]="size" [attr.height]="size" fill="#fff" />
          @for (cell of cells(); track $index) {
            <rect [attr.x]="cell[0]" [attr.y]="cell[1]" width="1" height="1" fill="#1b222b" />
          }
        </svg>
      </div>

      <div class="bottom">
        <div><span class="label">Kart No</span>{{ card().cardNo }}</div>
        <div><span class="label">Uyruk</span>{{ card().nationality }}</div>
        <div><span class="label">Geçerlilik</span>{{ card().validUntil }}</div>
      </div>
    </div>
  `,
  styles: `
    .card-face {
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 18px 20px;
      color: #fff;
      background:
        radial-gradient(circle at 110% -10%, rgba(255, 255, 255, 0.18) 0 38%, transparent 39%),
        linear-gradient(135deg, #d71920 0%, #a3121a 55%, #1b222b 140%);
      border-radius: 14px;
      box-shadow: 0 8px 20px rgba(163, 18, 26, 0.25);
    }
    .top,
    .middle,
    .bottom {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    .org {
      display: block;
      font-size: 10px;
      letter-spacing: 1px;
      opacity: 0.85;
    }
    .title {
      font-size: 20px;
      letter-spacing: 2px;
    }
    .group {
      align-self: flex-start;
      padding: 2px 10px;
      font-size: 11px;
      font-weight: 600;
      color: #a3121a;
      background: #fff;
      border-radius: 10px;
    }
    .holder {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .holder strong {
      font-size: 17px;
    }
    .label {
      display: block;
      font-size: 10px;
      opacity: 0.75;
    }
    .qr {
      flex: 0 0 72px;
      width: 72px;
      height: 72px;
      padding: 4px;
      background: #fff;
      border-radius: 6px;
      shape-rendering: crispEdges;
    }
    .bottom {
      font-size: 12px;
    }
    .compact .qr {
      flex-basis: 56px;
      width: 56px;
      height: 56px;
    }
    .compact .title {
      font-size: 17px;
    }
  `,
})
export class GraduateCard {
  readonly card = input.required<Card>();
  /** Dar sütunlar için küçük görünüm. */
  readonly compact = input(false);

  protected readonly size = QR_SIZE;
  protected readonly cells = computed(() => qrPattern(this.card().cardNo));
}

/** Kart numarasından sabit, karekoda benzeyen bir desen üretir (üç köşede konum kareleri). */
function qrPattern(seed: string): [number, number][] {
  let state = [...seed].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const random = () => (state = (state * 1103515245 + 12345) >>> 0) / 2 ** 32;
  const finder = (x: number, y: number) => {
    const dx = x - (x < 10 ? 0 : QR_SIZE - 7);
    const dy = y - (y < 10 ? 0 : QR_SIZE - 7);
    const ring = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
    return ring !== 2;
  };
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= QR_SIZE - 8 && y < 8) || (x < 8 && y >= QR_SIZE - 8);

  const cells: [number, number][] = [];
  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      const filled = inFinder(x, y)
        ? x !== 7 && y !== 7 && x !== QR_SIZE - 8 && y !== QR_SIZE - 8 && finder(x, y)
        : random() < 0.48;
      if (filled) {
        cells.push([x, y]);
      }
    }
  }
  return cells;
}
