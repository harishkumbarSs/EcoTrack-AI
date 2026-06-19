import { activityRepository } from '../activities/activity.repository';
import { GLOBAL_AVERAGES } from '../../config/emission-factors';

export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  potentialSaving: string;
  icon: string;
  actionType: 'quick_win' | 'long_term';
}

export interface InsightsData {
  recommendations: Recommendation[];
  topEmissionSource: string;
  weeklyReport: {
    totalCo2e: number;
    dailyAverage: number;
    vsGlobalAverage: number;
    vsLastWeek: number;
    breakdown: Array<{ type: string; co2e: number }>;
  };
  improvementActions: string[];
}

export class InsightsService {
  async getInsights(sessionId: string): Promise<InsightsData> {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = this.daysAgo(7);
    const lastWeekStart = this.daysAgo(14);
    const lastWeekEnd = this.daysAgo(8);
    const monthAgo = this.daysAgo(30);

    const breakdown = await activityRepository.getCategoryBreakdown(sessionId, monthAgo, today);
    const totalMonthly = breakdown.reduce((s, b) => s + b.total_co2e, 0);
    const thisWeekTotal = await activityRepository.getTotalForRange(sessionId, weekAgo, today);
    const lastWeekTotal = await activityRepository.getTotalForRange(sessionId, lastWeekStart, lastWeekEnd);

    const dailyAvg = totalMonthly / 30;
    const globalAvgWeek = GLOBAL_AVERAGES.daily_kg_co2e * 7;
    const vsGlobal = thisWeekTotal - globalAvgWeek;
    const vsLastWeek = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 : 0;
    const topSource = breakdown[0]?.type || 'none';
    const recommendations = this.generateRecommendations(breakdown, totalMonthly, dailyAvg);

    return {
      recommendations,
      topEmissionSource: topSource,
      weeklyReport: {
        totalCo2e: parseFloat(thisWeekTotal.toFixed(2)),
        dailyAverage: parseFloat(dailyAvg.toFixed(2)),
        vsGlobalAverage: parseFloat(vsGlobal.toFixed(2)),
        vsLastWeek: parseFloat(vsLastWeek.toFixed(1)),
        breakdown: breakdown.map((b) => ({ type: b.type, co2e: parseFloat(b.total_co2e.toFixed(2)) })),
      },
      improvementActions: this.getImprovementActions(topSource, dailyAvg),
    };
  }

  private generateRecommendations(
    breakdown: Array<{ type: string; total_co2e: number }>,
    totalMonthly: number,
    dailyAvg: number
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const categoryMap = new Map(breakdown.map((b) => [b.type, b.total_co2e]));
    const transport = categoryMap.get('transport') || 0;
    const electricity = categoryMap.get('electricity') || 0;
    const food = categoryMap.get('food') || 0;
    const waste = categoryMap.get('waste') || 0;

    if (transport > 0) {
      if (totalMonthly > 0 && transport / totalMonthly > 0.35) {
        recommendations.push({ id: 'switch_to_transit', priority: 'high', category: 'transport', title: 'Switch to Public Transport', description: 'Your transport emissions are above 35% of total. Replacing 3 car trips/week with public transit cuts transport emissions by 50%.', potentialSaving: `~${Math.round(transport * 0.5 / 30)} kg CO₂e/day`, icon: '🚌', actionType: 'quick_win' });
      }
      recommendations.push({ id: 'cycle_short_trips', priority: transport > electricity ? 'high' : 'medium', category: 'transport', title: 'Cycle Short Distances', description: 'For journeys under 5 km, cycling produces zero emissions. Even 2 cycling trips/week makes a measurable impact.', potentialSaving: '~0.5–1.5 kg CO₂e per trip replaced', icon: '🚲', actionType: 'quick_win' });
    }

    if (electricity > 0) {
      if (totalMonthly > 0 && electricity / totalMonthly > 0.25) {
        recommendations.push({ id: 'switch_to_led', priority: 'high', category: 'electricity', title: 'Switch to LED Lighting', description: 'LED bulbs use 75% less energy than incandescent. Replacing 10 bulbs saves ~300 kg CO₂e/year.', potentialSaving: '~0.8 kg CO₂e/day', icon: '💡', actionType: 'quick_win' });
      }
      recommendations.push({ id: 'solar_panels', priority: 'low', category: 'electricity', title: 'Consider Solar Panels', description: 'Rooftop solar can cut electricity emissions by 70–90%. Payback period is typically 6–10 years.', potentialSaving: `~${Math.round(electricity * 0.8 / 30 * 10) / 10} kg CO₂e/day`, icon: '☀️', actionType: 'long_term' });
    }

    if (food > 0) {
      if (totalMonthly > 0 && food / totalMonthly > 0.3) {
        recommendations.push({ id: 'reduce_red_meat', priority: 'high', category: 'food', title: 'Reduce Red Meat Consumption', description: 'Beef produces 27 kg CO₂e per kg. Replacing it with chicken twice a week saves ~2 kg CO₂e per meal.', potentialSaving: '~1.5–3 kg CO₂e/day', icon: '🥗', actionType: 'quick_win' });
      }
      recommendations.push({ id: 'meatless_monday', priority: food > electricity ? 'high' : 'medium', category: 'food', title: 'Try Meatless Mondays', description: 'Going fully plant-based one day/week reduces annual food footprint by ~14%.', potentialSaving: '~1.2 kg CO₂e per meatless day', icon: '🌱', actionType: 'quick_win' });
    }

    if (waste > 0) {
      recommendations.push({ id: 'compost_food_waste', priority: waste > electricity ? 'high' : 'medium', category: 'waste', title: 'Compost Food Waste', description: 'Composting diverts organic waste from landfill, reducing methane. A home composter can divert ~200 kg/year.', potentialSaving: '~0.2 kg CO₂e/day', icon: '🌍', actionType: 'quick_win' });
    }

    if (dailyAvg > GLOBAL_AVERAGES.daily_kg_co2e) {
      recommendations.push({ id: 'carbon_offset', priority: 'low', category: 'general', title: 'Offset Unavoidable Emissions', description: 'Carbon offset programs (Gold Standard certified) can neutralize remaining footprint while you work on reduction.', potentialSaving: 'Full offset of remaining emissions', icon: '🌳', actionType: 'long_term' });
    }

    return recommendations.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      if (order[a.priority] !== order[b.priority]) return order[a.priority] - order[b.priority];
      return a.actionType === 'quick_win' ? -1 : 1;
    });
  }

  private getImprovementActions(topSource: string, _dailyAvg: number): string[] {
    const actions: Record<string, string[]> = {
      transport: ['Walk or cycle for journeys under 3 km', 'Use public transport at least 3x/week', 'Consider an EV for your next purchase', 'Combine errands to reduce total trips', 'Work from home 1–2 days/week if possible'],
      electricity: ['Unplug devices when not in use', 'Set thermostat 2°C lower in winter', 'Use a clothes line instead of a tumble dryer', 'Run dishwasher on eco mode', 'Switch to a green energy tariff'],
      food: ['Plan meals to reduce food waste', 'Replace one meat meal/day with plant-based', 'Buy in bulk to reduce packaging', 'Grow herbs at home', 'Choose sustainably sourced seafood'],
      waste: ['Set up a home recycling system', 'Compost fruit and vegetable scraps', 'Refuse unnecessary packaging', 'Repair items instead of replacing', 'Donate or sell items rather than discarding'],
    };
    return actions[topSource] || ['Track your footprint daily for better insights', 'Set a daily carbon goal below 10 kg CO₂e', 'Share your progress to inspire others'];
  }

  private daysAgo(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  }
}

export const insightsService = new InsightsService();
