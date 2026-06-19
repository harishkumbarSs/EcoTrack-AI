import { Component, Input, OnChanges } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ChartDataPoint } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-trend-chart',
  template: `
    <div class="chart-wrapper" role="img" [attr.aria-label]="chartAriaLabel">
      <canvas
        baseChart
        [data]="chartData"
        [options]="chartOptions"
        [type]="'line'"
      ></canvas>
    </div>
  `,
  styles: [`.chart-wrapper { height: 260px; position: relative; }`],
})
export class TrendChartComponent implements OnChanges {
  @Input() data: ChartDataPoint[] = [];

  chartData: ChartData<'line'> = { labels: [], datasets: [] };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
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
          label: (ctx) => ctx.parsed?.y !== undefined && ctx.parsed?.y !== null ? ` ${ctx.parsed.y.toFixed(2)} kg CO₂e` : '',
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false } as any,
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          maxTicksLimit: 7,
          callback: (_val, idx, ticks) => {
            const date = (this.chartData.labels as string[])[idx];
            if (!date) return '';
            const d = new Date(date);
            return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
          },
        },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false } as any,
        ticks: { color: '#64748b', font: { size: 11 }, callback: (val) => `${val}kg` },
        beginAtZero: true,
      },
    },
  };

  ngOnChanges(): void {
    if (!this.data?.length) return;

    const gradient = this.createGradient();

    this.chartData = {
      labels: this.data.map((d) => d.date),
      datasets: [{
        data: this.data.map((d) => d.value),
        borderColor: '#00e676',
        backgroundColor: gradient || 'rgba(0, 230, 118, 0.08)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#00e676',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        fill: true,
        tension: 0.4,
      }],
    };
  }

  get chartAriaLabel(): string {
    if (!this.data?.length) return 'No data available';
    const total = this.data.reduce((s, d) => s + d.value, 0);
    return `Line chart: 30-day carbon footprint trend. Total: ${total.toFixed(1)} kg CO₂e`;
  }

  private createGradient(): CanvasGradient | null {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      const gradient = ctx.createLinearGradient(0, 0, 0, 260);
      gradient.addColorStop(0, 'rgba(0, 230, 118, 0.18)');
      gradient.addColorStop(1, 'rgba(0, 230, 118, 0.0)');
      return gradient;
    } catch { return null; }
  }
}
