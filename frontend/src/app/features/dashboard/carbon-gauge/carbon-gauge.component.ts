import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-carbon-gauge',
  template: `
    <div class="gauge-wrapper" role="img" [attr.aria-label]="'Sustainability score: ' + score + ' out of 100, rated ' + label">
      <svg viewBox="0 0 200 130" class="gauge-svg" aria-hidden="true">
        <!-- Background arc -->
        <path
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          stroke-width="14"
          stroke-linecap="round"
        />
        <!-- Score arc -->
        <path
          [attr.d]="arcPath"
          fill="none"
          [attr.stroke]="color"
          stroke-width="14"
          stroke-linecap="round"
          class="gauge-arc"
          [style.filter]="'drop-shadow(0 0 8px ' + color + '66)'"
        />
        <!-- Score text -->
        <text x="100" y="90" text-anchor="middle" class="gauge-score" [attr.fill]="color">{{ score }}</text>
        <text x="100" y="112" text-anchor="middle" class="gauge-label" fill="#94a3b8">{{ label }}</text>
      </svg>

      <!-- Score bar indicators -->
      <div class="gauge-ticks" aria-hidden="true">
        <span class="tick-label">0</span>
        <span class="tick-label">100</span>
      </div>
    </div>
  `,
  styles: [`
    .gauge-wrapper { padding: 8px 0 0; }
    .gauge-svg { width: 100%; max-width: 200px; display: block; margin: 0 auto; }
    .gauge-arc { transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1); }
    .gauge-score {
      font-family: var(--font-display, Inter);
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -0.04em;
    }
    .gauge-label {
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .gauge-ticks {
      display: flex;
      justify-content: space-between;
      padding: 0 16px;
      font-size: 0.6875rem;
      color: #64748b;
      margin-top: -4px;
    }
  `],
})
export class CarbonGaugeComponent implements OnChanges {
  @Input() score = 0;
  @Input() label = 'Loading';
  @Input() color = '#00e676';

  arcPath = '';

  ngOnChanges(): void {
    this.arcPath = this.buildArc(this.score);
  }

  private buildArc(score: number): string {
    // Arc from M 20 110 to M 180 110 (180 degrees)
    const pct = Math.min(100, Math.max(0, score)) / 100;
    const startAngle = Math.PI;           // 180° (left)
    const endAngle = startAngle + pct * Math.PI; // up to 360° (right)

    const cx = 100, cy = 110, r = 80;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = pct > 0.5 ? 1 : 0;

    if (score === 0) return '';
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  }
}
