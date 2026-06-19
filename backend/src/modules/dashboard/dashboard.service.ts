import { getDatabase } from '../../config/database';
import { carbonCalculator } from '../carbon/carbon.calculator';
import { activityRepository } from '../activities/activity.repository';
import { gamificationService } from '../gamification/gamification.service';
import { GLOBAL_AVERAGES } from '../../config/emission-factors';

export interface KpiCard {
  label: string;
  value: number;
  unit: string;
  trend: number;
  trendDirection: 'up' | 'down' | 'neutral';
}

export interface ChartDataPoint { date: string; value: number; }

export interface DashboardData {
  kpis: { today: KpiCard; thisWeek: KpiCard; thisMonth: KpiCard; vsGlobalAvg: KpiCard };
  trendChart: ChartDataPoint[];
  categoryBreakdown: Array<{ type: string; co2e: number; percentage: number }>;
  score: number;
  scoreLabel: string;
  scoreColor: string;
  goalProgress: { target: number; current: number; percentage: number } | null;
  equivalents: Record<string, string>;
  recentActivities: number;
}

export class DashboardService {
  async getDashboard(sessionId: string): Promise<DashboardData> {
    const today = new Date().toISOString().split('T')[0];
    const dates = this.getDateRanges(today);

    const [todayTotal, yesterdayTotal, thisWeekTotal, lastWeekTotal,
      thisMonthTotal, lastMonthTotal] = await Promise.all([
      activityRepository.getTotalForRange(sessionId, today, today),
      activityRepository.getTotalForRange(sessionId, dates.yesterday, dates.yesterday),
      activityRepository.getTotalForRange(sessionId, dates.weekStart, today),
      activityRepository.getTotalForRange(sessionId, dates.lastWeekStart, dates.lastWeekEnd),
      activityRepository.getTotalForRange(sessionId, dates.monthStart, today),
      activityRepository.getTotalForRange(sessionId, dates.lastMonthStart, dates.lastMonthEnd),
    ]);

    const weekDaysSoFar = this.daysDiff(dates.weekStart, today) + 1;
    const globalAvgWeek = GLOBAL_AVERAGES.daily_kg_co2e * weekDaysSoFar;
    const vsAvgDiff = thisWeekTotal - globalAvgWeek;

    const raw30Days = await activityRepository.getDailyTotals(sessionId, 30);
    const trendChart = this.fillDateGaps(raw30Days, 30);

    const breakdown = await activityRepository.getCategoryBreakdown(sessionId, dates.monthStart, today);
    const breakdownTotal = breakdown.reduce((s, b) => s + b.total_co2e, 0);
    const categoryBreakdown = breakdown.map((b) => ({
      type: b.type,
      co2e: parseFloat(b.total_co2e.toFixed(2)),
      percentage: breakdownTotal > 0 ? Math.round((b.total_co2e / breakdownTotal) * 100) : 0,
    }));

    const avgDailyKg = raw30Days.length > 0
      ? raw30Days.reduce((s, d) => s + d.total_co2e, 0) / raw30Days.length
      : 0;
    const gamification = await gamificationService.getSummary(sessionId);
    const goal = await this.getGoal(sessionId);
    const equivalents = carbonCalculator.getEquivalents(thisMonthTotal);
    const totalActivities = await activityRepository.countBySession(sessionId);

    return {
      kpis: {
        today: this.makeKpi('Today', todayTotal, yesterdayTotal),
        thisWeek: this.makeKpi('This Week', thisWeekTotal, lastWeekTotal),
        thisMonth: this.makeKpi('This Month', thisMonthTotal, lastMonthTotal),
        vsGlobalAvg: {
          label: 'vs Global Average',
          value: parseFloat(vsAvgDiff.toFixed(2)),
          unit: 'kg CO₂e',
          trend: globalAvgWeek > 0 ? parseFloat(((vsAvgDiff / globalAvgWeek) * 100).toFixed(1)) : 0,
          trendDirection: vsAvgDiff <= 0 ? 'down' : 'up',
        },
      },
      trendChart,
      categoryBreakdown,
      score: gamification.score.score,
      scoreLabel: gamification.score.label,
      scoreColor: gamification.score.color,
      goalProgress: goal ? {
        target: goal.target_kg_per_day,
        current: parseFloat(todayTotal.toFixed(2)),
        percentage: Math.min(100, Math.round((todayTotal / goal.target_kg_per_day) * 100)),
      } : null,
      equivalents,
      recentActivities: totalActivities,
    };
  }

  private makeKpi(label: string, current: number, previous: number): KpiCard {
    const trend = previous > 0 ? parseFloat((((current - previous) / previous) * 100).toFixed(1)) : 0;
    return {
      label, value: parseFloat(current.toFixed(2)), unit: 'kg CO₂e',
      trend, trendDirection: trend < 0 ? 'down' : trend > 0 ? 'up' : 'neutral',
    };
  }

  private fillDateGaps(data: Array<{ date: string; total_co2e: number }>, days: number): ChartDataPoint[] {
    const map = new Map(data.map((d) => [d.date, d.total_co2e]));
    const result: ChartDataPoint[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      result.push({ date: dateStr, value: parseFloat((map.get(dateStr) || 0).toFixed(2)) });
    }
    return result;
  }

  private getDateRanges(today: string): Record<string, string> {
    const d = new Date(today);
    const dow = d.getDay();
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
    const lastWeekEnd = new Date(weekStart);
    lastWeekEnd.setDate(weekStart.getDate() - 1);
    const lastWeekStart = new Date(lastWeekEnd);
    lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const lastMonthEnd = new Date(monthStart);
    lastMonthEnd.setDate(0);
    const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1);
    const yesterday = new Date(d);
    yesterday.setDate(d.getDate() - 1);
    const fmt = (dt: Date) => dt.toISOString().split('T')[0];
    return {
      yesterday: fmt(yesterday), weekStart: fmt(weekStart),
      lastWeekStart: fmt(lastWeekStart), lastWeekEnd: fmt(lastWeekEnd),
      monthStart: fmt(monthStart), lastMonthStart: fmt(lastMonthStart), lastMonthEnd: fmt(lastMonthEnd),
    };
  }

  private daysDiff(start: string, end: string): number {
    return Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
  }

  private async getGoal(sessionId: string): Promise<{ target_kg_per_day: number } | null> {
    const db = getDatabase();
    return db('goals').where({ session_id: sessionId }).orderBy('created_at', 'desc').first() as Promise<{ target_kg_per_day: number } | null>;
  }
}

export const dashboardService = new DashboardService();
