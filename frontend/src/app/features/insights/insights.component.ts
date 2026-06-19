import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { InsightsData, Recommendation } from '../../core/models/gamification.model';

@Component({
  selector: 'app-insights',
  templateUrl: './insights.component.html',
  styleUrls: ['./insights.component.scss'],
})
export class InsightsComponent implements OnInit, OnDestroy {
  data: InsightsData | null = null;
  loading = true;
  error = '';
  activeTab: 'recommendations' | 'actions' = 'recommendations';
  private destroy$ = new Subject<void>();

  constructor(private api: ApiService) {}
  ngOnInit(): void { this.load(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  load(): void {
    this.loading = true;
    this.api.getInsights().pipe(takeUntil(this.destroy$), finalize(() => (this.loading = false))).subscribe({
      next: (res) => (this.data = res.data),
      error: (err) => (this.error = err.userMessage || 'Failed to load insights'),
    });
  }

  get quickWins(): Recommendation[] {
    return this.data?.recommendations.filter((r) => r.actionType === 'quick_win') || [];
  }

  get longTermActions(): Recommendation[] {
    return this.data?.recommendations.filter((r) => r.actionType === 'long_term') || [];
  }

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = { high: '#ff5252', medium: '#ffd740', low: '#64dd17' };
    return colors[priority] || '#64748b';
  }

  getPriorityBg(priority: string): string {
    const bgs: Record<string, string> = { high: 'rgba(255,82,82,0.08)', medium: 'rgba(255,215,64,0.08)', low: 'rgba(100,221,23,0.08)' };
    return bgs[priority] || '';
  }
}
