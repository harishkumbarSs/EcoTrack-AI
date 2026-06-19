import { Component, Input } from '@angular/core';
import { KpiCard } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-kpi-card',
  template: `
    <div class="kpi-card card" [style.--accent]="accent">
      <div class="kpi-header">
        <mat-icon class="kpi-icon" [style.color]="accent" aria-hidden="true">{{ icon }}</mat-icon>
        <span class="kpi-trend" [class]="trendClass" [attr.aria-label]="'Trend: ' + trendLabel">
          <mat-icon aria-hidden="true">{{ trendIcon }}</mat-icon>
          {{ kpi.trend !== 0 ? (kpi.trend | number:'1.0-1') + '%' : 'Stable' }}
        </span>
      </div>
      <div class="kpi-value" [attr.aria-label]="kpi.value + ' ' + kpi.unit">
        {{ kpi.value | number:'1.1-1' }}
        <span class="kpi-unit">{{ kpi.unit }}</span>
      </div>
      <div class="kpi-label">{{ kpi.label }}</div>
      <div class="kpi-accent-bar" [style.background]="accent" aria-hidden="true"></div>
    </div>
  `,
  styles: [`
    .kpi-card {
      position: relative;
      overflow: hidden;
      cursor: default;
      transition: all 250ms cubic-bezier(0.4,0,0.2,1);

      &::before {
        content: '';
        position: absolute;
        top: 0; right: 0;
        width: 80px; height: 80px;
        background: radial-gradient(circle, var(--accent, #00e676) 0%, transparent 70%);
        opacity: 0.06;
        border-radius: 50%;
      }
    }

    .kpi-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .kpi-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
      opacity: 0.9;
    }

    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 20px;

      mat-icon { font-size: 0.875rem; width: 0.875rem; height: 0.875rem; }

      &.trend-down { background: rgba(105, 240, 174, 0.12); color: #69f0ae; }
      &.trend-up   { background: rgba(255, 82, 82, 0.12);  color: #ff5252; }
      &.trend-neutral { background: rgba(148, 163, 184, 0.12); color: #94a3b8; }
    }

    .kpi-value {
      font-family: var(--font-display);
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.04em;
      line-height: 1;
      margin-bottom: 4px;
    }

    .kpi-unit {
      font-size: 0.75rem;
      font-weight: 400;
      color: var(--text-muted);
      margin-left: 4px;
      vertical-align: baseline;
    }

    .kpi-label {
      font-size: 0.8125rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .kpi-accent-bar {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 2px;
      opacity: 0;
      transition: opacity 250ms;
    }

    .kpi-card:hover .kpi-accent-bar { opacity: 1; }
  `],
})
export class KpiCardComponent {
  @Input() kpi!: KpiCard;
  @Input() accent = '#00e676';
  @Input() icon = 'eco';
  @Input() invertTrend = false;

  get trendClass(): string {
    const { trendDirection } = this.kpi;
    if (trendDirection === 'neutral') return 'trend-neutral';
    if (this.invertTrend) {
      return trendDirection === 'down' ? 'trend-down' : 'trend-up';
    }
    return trendDirection === 'down' ? 'trend-down' : 'trend-up';
  }

  get trendIcon(): string {
    if (this.kpi.trendDirection === 'neutral') return 'remove';
    return this.kpi.trendDirection === 'down' ? 'trending_down' : 'trending_up';
  }

  get trendLabel(): string {
    if (this.kpi.trendDirection === 'neutral') return 'No change';
    return this.kpi.trendDirection === 'down' ? 'Decreased' : 'Increased';
  }
}
