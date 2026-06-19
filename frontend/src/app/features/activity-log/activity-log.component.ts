import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { Activity, ActivityType } from '../../core/models/activity.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-activity-log',
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.scss'],
})
export class ActivityLogComponent implements OnInit, OnDestroy {
  activities: Activity[] = [];
  total = 0;
  loading = true;
  showForm = false;
  activeFilter: ActivityType | 'all' = 'all';
  private destroy$ = new Subject<void>();

  readonly filters: Array<{ label: string; value: ActivityType | 'all'; icon: string }> = [
    { label: 'All', value: 'all', icon: 'list' },
    { label: 'Transport', value: 'transport', icon: 'directions_car' },
    { label: 'Electricity', value: 'electricity', icon: 'bolt' },
    { label: 'Food', value: 'food', icon: 'restaurant' },
    { label: 'Waste', value: 'waste', icon: 'delete' },
  ];

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void { this.loadActivities(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadActivities(): void {
    this.loading = true;
    const params = this.activeFilter !== 'all' ? { type: this.activeFilter } : {};
    this.api.getActivities(params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.activities = res.data.data;
        this.total = res.data.total;
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open(err.userMessage || 'Failed to load activities', 'Dismiss', { duration: 4000, panelClass: 'snack-error' });
        this.loading = false;
      },
    });
  }

  setFilter(filter: ActivityType | 'all'): void {
    this.activeFilter = filter;
    this.loadActivities();
  }

  onActivityCreated(): void {
    this.showForm = false;
    this.loadActivities();
    this.snackBar.open('✅ Activity logged!', '', { duration: 3000, panelClass: 'snack-success' });
  }

  deleteActivity(id: number): void {
    if (!confirm('Delete this activity?')) return;
    this.api.deleteActivity(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.snackBar.open('Activity deleted', '', { duration: 2000 });
        this.loadActivities();
      },
      error: (err) => this.snackBar.open(err.userMessage || 'Delete failed', 'Dismiss', { duration: 4000, panelClass: 'snack-error' }),
    });
  }

  getCategoryClass(type: string): string { return `cat-${type}`; }
  getCategoryBg(type: string): string { return `cat-bg-${type}`; }
  getCategoryIcon(type: string): string {
    const icons: Record<string, string> = { transport: '🚗', electricity: '⚡', food: '🍽️', waste: '🗑️' };
    return icons[type] || '📊';
  }

  formatSubType(subType: string): string {
    if (!subType) return '';
    const spaced = subType.replace(/_/g, ' ');
    return spaced.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }
}
