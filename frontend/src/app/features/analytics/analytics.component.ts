import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';

interface AnalyticsData {
  weeklyBreakdown: Array<{ type: string; total_co2e: number }>;
  monthlyBreakdown: Array<{ type: string; total_co2e: number }>;
  dailyTrend: Array<{ date: string; total_co2e: number }>;
  subTypeBreakdown: Array<{ type: string; sub_type: string; total_co2e: number; count: number }>;
  weeklyTrend: Array<{ week: string; total: number }>;
  period: { start: string; end: string };
}

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  data: AnalyticsData | null = null;
  loading = true;
  error = '';
  activeBreakdownPeriod: 'week' | 'month' = 'month';
  goal: { target_kg_per_day: number; start_date: string } | null = null;
  updatingGoal = false;
  goalInput: number | null = null;
  goalSuccess = false;

  private destroy$ = new Subject<void>();

  // Doughnut Chart Configuration
  doughnutChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 12 },
          boxWidth: 12,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${Number(ctx.raw).toFixed(1)} kg CO₂e`,
        },
      },
    },
    cutout: '70%',
  };

  // Bar Chart Configuration
  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => ` Week total: ${Number(ctx.raw).toFixed(1)} kg CO₂e`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#64748b', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#64748b', font: { size: 11 }, callback: (val) => `${val}kg` },
        beginAtZero: true,
      },
    },
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadData();
    this.loadGoal();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading = true;
    this.api.getAnalytics()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (res) => {
          this.data = res.data;
          this.updateCharts();
        },
        error: (err) => {
          this.error = err.userMessage || 'Failed to load analytics data';
        },
      });
  }

  loadGoal(): void {
    this.api.getGoal().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.goal = res.data;
        if (this.goal) {
          this.goalInput = this.goal.target_kg_per_day;
        }
      },
    });
  }

  saveGoal(): void {
    if (this.goalInput === null || this.goalInput <= 0) return;
    this.updatingGoal = true;
    this.api.setGoal(this.goalInput)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.updatingGoal = false))
      )
      .subscribe({
        next: (res) => {
          this.goal = res.data;
          this.goalSuccess = true;
          setTimeout(() => (this.goalSuccess = false), 3000);
        },
      });
  }

  setBreakdownPeriod(period: 'week' | 'month'): void {
    this.activeBreakdownPeriod = period;
    this.updateDoughnutChart();
  }

  updateCharts(): void {
    this.updateDoughnutChart();
    this.updateBarChart();
  }

  getCategoryColor(type: string): string {
    const colors: Record<string, string> = {
      transport: '#40c4ff',
      electricity: '#ffd740',
      food: '#69f0ae',
      waste: '#ff8a65',
    };
    return colors[type.toLowerCase()] || '#64748b';
  }

  private updateDoughnutChart(): void {
    if (!this.data) return;
    const rawData = this.activeBreakdownPeriod === 'week'
      ? this.data.weeklyBreakdown
      : this.data.monthlyBreakdown;

    const labels = rawData.map((d) => this.capitalize(d.type));
    const data = rawData.map((d) => d.total_co2e);
    const backgroundColors = rawData.map((d) => this.getCategoryColor(d.type));

    this.doughnutChartData = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    };
  }

  private updateBarChart(): void {
    if (!this.data || !this.data.weeklyTrend) return;
    const labels = this.data.weeklyTrend.map((d) => {
      // e.g. "2026-W24" -> "W24"
      const parts = d.week.split('-W');
      return parts.length > 1 ? `Week ${parts[1]}` : d.week;
    });
    const data = this.data.weeklyTrend.map((d) => d.total);

    this.barChartData = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: '#00e676',
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 32,
        },
      ],
    };
  }

  private capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  get totalCo2e(): number {
    if (!this.data) return 0;
    const breakdown = this.activeBreakdownPeriod === 'week'
      ? this.data.weeklyBreakdown
      : this.data.monthlyBreakdown;
    return breakdown.reduce((acc, curr) => acc + curr.total_co2e, 0);
  }
}
