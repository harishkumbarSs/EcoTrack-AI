import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { GamificationData, Badge, Achievement } from '../../core/models/gamification.model';

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.scss'],
})
export class AchievementsComponent implements OnInit, OnDestroy {
  data: GamificationData | null = null;
  loading = true;
  error = '';
  private destroy$ = new Subject<void>();

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loading = true;
    this.api.getAchievements()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (res) => {
          this.data = res.data;
        },
        error: (err) => {
          this.error = err.userMessage || 'Failed to load achievements';
        },
      });
  }

  isBadgeEarned(badgeId: string): boolean {
    if (!this.data?.earned) return false;
    return this.data.earned.some((a) => a.badge_id === badgeId);
  }

  getEarnedDate(badgeId: string): string | null {
    if (!this.data?.earned) return null;
    const ach = this.data.earned.find((a) => a.badge_id === badgeId);
    return ach ? ach.earned_at : null;
  }

  getBadgeIcon(badge: Badge): string {
    // Return standard emojis if custom SVG handles aren't mapped
    return badge.icon || '🏆';
  }
}
