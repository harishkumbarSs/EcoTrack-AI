import { getDatabase } from '../../config/database';
import { carbonCalculator } from '../carbon/carbon.calculator';
import { activityRepository } from '../activities/activity.repository';
import { Badge, Achievement, SustainabilityScore, GamificationSummary } from './gamification.types';
import { GLOBAL_AVERAGES } from '../../config/emission-factors';

const BADGES: Badge[] = [
  { id: 'first_step', name: 'First Step', description: 'Logged your first activity', icon: '🌱', category: 'milestone', condition: 'Log 1 activity' },
  { id: 'eco_logger', name: 'Eco Logger', description: 'Logged 10 activities', icon: '📊', category: 'milestone', condition: 'Log 10 activities' },
  { id: 'data_champion', name: 'Data Champion', description: 'Logged 50 activities', icon: '🏆', category: 'milestone', condition: 'Log 50 activities' },
  { id: 'green_week', name: 'Green Week', description: 'Stayed below 7 kg CO₂e/day for 7 consecutive days', icon: '🌿', category: 'streak', condition: '7-day green streak' },
  { id: 'carbon_saver_500', name: 'Carbon Saver', description: 'Saved 500 kg CO₂e compared to average', icon: '💚', category: 'achievement', condition: 'Save 500 kg CO₂e' },
  { id: 'carbon_hero', name: 'Carbon Hero', description: 'Saved 1,000 kg CO₂e compared to average', icon: '🦸', category: 'achievement', condition: 'Save 1,000 kg CO₂e' },
  { id: 'transport_switch', name: 'Transit Switcher', description: 'Logged public transport or cycling 5 times', icon: '🚌', category: 'challenge', condition: 'Log transit/cycling 5 times' },
  { id: 'plant_powered', name: 'Plant Powered', description: 'Logged plant-based food 10 times', icon: '🥗', category: 'challenge', condition: 'Log plant food 10 times' },
  { id: 'recycler', name: 'Recycler', description: 'Logged recycled waste 5 times', icon: '♻️', category: 'challenge', condition: 'Log recycled waste 5 times' },
  { id: 'net_zero_day', name: 'Net Zero Day', description: 'Achieved less than 1 kg CO₂e in a single day', icon: '🌍', category: 'achievement', condition: 'Log < 1 kg CO₂e in one day' },
];

const BADGE_MAP = new Map(BADGES.map((b) => [b.id, b]));

export class GamificationService {
  async evaluateAchievements(sessionId: string): Promise<string[]> {
    const db = getDatabase();
    const earned = await this.getEarnedBadgeIds(sessionId);
    const newlyEarned: string[] = [];

    const totalActivities = await activityRepository.countBySession(sessionId);

    if (totalActivities >= 1 && !earned.has('first_step')) { await this.awardBadge(sessionId, 'first_step'); newlyEarned.push('first_step'); }
    if (totalActivities >= 10 && !earned.has('eco_logger')) { await this.awardBadge(sessionId, 'eco_logger'); newlyEarned.push('eco_logger'); }
    if (totalActivities >= 50 && !earned.has('data_champion')) { await this.awardBadge(sessionId, 'data_champion'); newlyEarned.push('data_champion'); }

    const dailyTotals = await activityRepository.getDailyTotals(sessionId, 90);

    if (dailyTotals.some((d) => d.total_co2e > 0 && d.total_co2e < 1) && !earned.has('net_zero_day')) {
      await this.awardBadge(sessionId, 'net_zero_day'); newlyEarned.push('net_zero_day');
    }
    if (this.checkGreenWeekStreak(dailyTotals) && !earned.has('green_week')) {
      await this.awardBadge(sessionId, 'green_week'); newlyEarned.push('green_week');
    }

    const [{ count: transitCount }] = await db('activities')
      .where({ session_id: sessionId, type: 'transport' })
      .whereIn('sub_type', ['bus', 'train', 'subway', 'bicycle', 'walking'])
      .count('id as count');
    if (Number(transitCount) >= 5 && !earned.has('transport_switch')) {
      await this.awardBadge(sessionId, 'transport_switch'); newlyEarned.push('transport_switch');
    }

    const [{ count: plantCount }] = await db('activities')
      .where({ session_id: sessionId, type: 'food' })
      .whereIn('sub_type', ['vegetables', 'plant_protein'])
      .count('id as count');
    if (Number(plantCount) >= 10 && !earned.has('plant_powered')) {
      await this.awardBadge(sessionId, 'plant_powered'); newlyEarned.push('plant_powered');
    }

    const [{ count: recycleCount }] = await db('achievements')
      .where({ session_id: sessionId })
      .count('id as count');
    // Recycle badge check via activities
    const [{ count: recycleCnt }] = await db('activities')
      .where({ session_id: sessionId, type: 'waste', sub_type: 'recycled' })
      .count('id as count');
    if (Number(recycleCnt) >= 5 && !earned.has('recycler')) {
      await this.awardBadge(sessionId, 'recycler'); newlyEarned.push('recycler');
    }

    return newlyEarned;
  }

  async getSummary(sessionId: string): Promise<GamificationSummary> {
    const totalActivities = await activityRepository.countBySession(sessionId);
    const earnedBadgeIds = await this.getEarnedBadgeIds(sessionId);
    const achievements = await this.getAchievements(sessionId);
    const dailyTotals = await activityRepository.getDailyTotals(sessionId, 30);
    const streak = this.calculateStreak(dailyTotals);

    const avgDailyKg = dailyTotals.length > 0
      ? dailyTotals.reduce((sum, d) => sum + d.total_co2e, 0) / dailyTotals.length
      : 0;
    const score = this.buildScore(avgDailyKg);

    const totalLogged = dailyTotals.reduce((sum, d) => sum + d.total_co2e, 0);
    const globalEquivalent = dailyTotals.length * GLOBAL_AVERAGES.daily_kg_co2e;
    const totalCo2eSaved = Math.max(0, globalEquivalent - totalLogged);
    const nextBadge = BADGES.find((b) => !earnedBadgeIds.has(b.id)) || null;

    return { score, streak, totalActivities, achievements, nextBadge, totalCo2eSaved };
  }

  getAllBadges(): Badge[] { return BADGES; }

  private async awardBadge(sessionId: string, badgeId: string): Promise<void> {
    const db = getDatabase();
    await db('achievements').insert({ session_id: sessionId, badge_id: badgeId }).onConflict(['session_id', 'badge_id']).ignore();
  }

  private async getEarnedBadgeIds(sessionId: string): Promise<Set<string>> {
    const db = getDatabase();
    const rows = await db('achievements').where({ session_id: sessionId }).select('badge_id') as Array<{ badge_id: string }>;
    return new Set(rows.map((r) => r.badge_id));
  }

  private async getAchievements(sessionId: string): Promise<Achievement[]> {
    const db = getDatabase();
    const rows = await db('achievements').where({ session_id: sessionId }).orderBy('earned_at', 'desc') as Array<{ id: number; session_id: string; badge_id: string; earned_at: string }>;
    return rows.map((row) => ({
      ...row,
      badge: BADGE_MAP.get(row.badge_id) || { id: row.badge_id, name: row.badge_id, description: '', icon: '🏅', category: 'milestone' as const, condition: '' },
    }));
  }

  private calculateStreak(dailyTotals: Array<{ date: string; total_co2e: number }>): number {
    if (dailyTotals.length === 0) return 0;
    const dates = new Set(dailyTotals.map((d) => d.date));
    let streak = 0;
    const current = new Date();
    while (dates.has(current.toISOString().split('T')[0])) {
      streak++;
      current.setDate(current.getDate() - 1);
    }
    return streak;
  }

  private checkGreenWeekStreak(dailyTotals: Array<{ date: string; total_co2e: number }>): boolean {
    let consecutive = 0;
    for (const day of dailyTotals) {
      if (day.total_co2e < 7) { consecutive++; if (consecutive >= 7) return true; }
      else consecutive = 0;
    }
    return false;
  }

  private buildScore(dailyKg: number): SustainabilityScore {
    const score = carbonCalculator.calculateScore(dailyKg);
    if (score >= 90) return { score, label: 'Excellent', color: '#00c853', message: 'You\'re a sustainability champion! 🌍', percentile: 95 };
    if (score >= 70) return { score, label: 'Good', color: '#64dd17', message: 'Great progress — keep it up! 🌿', percentile: 75 };
    if (score >= 50) return { score, label: 'Average', color: '#ffd600', message: 'Room to grow — small changes matter 💡', percentile: 50 };
    if (score >= 30) return { score, label: 'Below Average', color: '#ff6d00', message: 'Time to make some eco-friendly swaps 🔄', percentile: 30 };
    return { score, label: 'Critical', color: '#dd2c00', message: 'Your footprint needs immediate attention ⚠️', percentile: 10 };
  }
}

export const gamificationService = new GamificationService();
