import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { DashboardData } from '../../core/models/dashboard.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  data: DashboardData | null = null;
  loading = true;
  error = '';
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = '';

    this.apiService.getDashboard()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (res) => (this.data = res.data),
        error: (err) => {
          this.error = err.userMessage || 'Failed to load dashboard';
          this.snackBar.open(this.error, 'Dismiss', { duration: 4000, panelClass: 'snack-error' });
        },
      });
  }

  get categoryIcons(): Record<string, string> {
    return { transport: '🚗', electricity: '⚡', food: '🍽️', waste: '🗑️' };
  }
}
