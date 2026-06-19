export interface KpiCard {
  label: string;
  value: number;
  unit: string;
  trend: number;
  trendDirection: 'up' | 'down' | 'neutral';
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface CategoryBreakdown {
  type: string;
  co2e: number;
  percentage: number;
}

export interface DashboardData {
  kpis: {
    today: KpiCard;
    thisWeek: KpiCard;
    thisMonth: KpiCard;
    vsGlobalAvg: KpiCard;
  };
  trendChart: ChartDataPoint[];
  categoryBreakdown: CategoryBreakdown[];
  score: number;
  scoreLabel: string;
  scoreColor: string;
  goalProgress: { target: number; current: number; percentage: number } | null;
  equivalents: Record<string, string>;
  recentActivities: number;
}
