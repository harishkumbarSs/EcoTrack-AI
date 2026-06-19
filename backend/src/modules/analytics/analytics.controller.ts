import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { getDatabase } from '../../config/database';
import { gamificationService } from '../gamification/gamification.service';
import { validateRequest } from '../../middleware/validation.middleware';
import { activityRepository } from '../activities/activity.repository';

export class AnalyticsController {
  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sessionId = req.sessionId;
      const today = new Date().toISOString().split('T')[0];
      const monthAgo = this.daysAgo(30);
      const weekAgo = this.daysAgo(7);

      const [weeklyBreakdown, monthlyBreakdown, dailyTotals30] = await Promise.all([
        activityRepository.getCategoryBreakdown(sessionId, weekAgo, today),
        activityRepository.getCategoryBreakdown(sessionId, monthAgo, today),
        activityRepository.getDailyTotals(sessionId, 30),
      ]);

      const db = getDatabase();
      const subTypeBreakdown = await db('activities')
        .where({ session_id: sessionId })
        .andWhere('date', '>=', monthAgo)
        .groupBy(['type', 'sub_type'])
        .select(db.raw('type, sub_type, SUM(co2e) as total_co2e, COUNT(*) as count'))
        .orderBy('total_co2e', 'desc')
        .limit(10);

      const weeklyTrend = await this.getWeeklyTrend(sessionId);

      res.json({
        success: true,
        data: { weeklyBreakdown, monthlyBreakdown, dailyTrend: dailyTotals30, subTypeBreakdown, weeklyTrend, period: { start: monthAgo, end: today } },
      });
    } catch (err) { next(err); }
  };

  getAchievements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await gamificationService.getSummary(req.sessionId);
      const allBadges = gamificationService.getAllBadges();
      res.json({
        success: true,
        data: { earned: summary.achievements, allBadges, score: summary.score, streak: summary.streak, nextBadge: summary.nextBadge, totalCo2eSaved: parseFloat(summary.totalCo2eSaved.toFixed(2)), totalActivities: summary.totalActivities },
      });
    } catch (err) { next(err); }
  };

  createGoal = [
    body('target_kg_per_day').isFloat({ min: 0.1, max: 50 }).withMessage('target must be 0.1–50'),
    validateRequest,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const db = getDatabase();
        const today = new Date().toISOString().split('T')[0];
        await db('goals').insert({ session_id: req.sessionId, target_kg_per_day: req.body.target_kg_per_day, start_date: today });
        res.status(201).json({ success: true, data: { target_kg_per_day: req.body.target_kg_per_day, start_date: today } });
      } catch (err) { next(err); }
    },
  ];

  getGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = getDatabase();
      const goal = await db('goals').where({ session_id: req.sessionId }).orderBy('created_at', 'desc').first();
      res.json({ success: true, data: goal || null });
    } catch (err) { next(err); }
  };

  private async getWeeklyTrend(sessionId: string): Promise<Array<{ week: string; total: number }>> {
    const db = getDatabase();
    return db('activities')
      .where({ session_id: sessionId })
      .andWhere(db.raw(`date >= date('now', '-28 days')`))
      .groupBy(db.raw(`strftime('%Y-W%W', date)`))
      .select(db.raw(`strftime('%Y-W%W', date) as week, SUM(co2e) as total`))
      .orderBy('week', 'asc') as Promise<Array<{ week: string; total: number }>>;
  }

  private daysAgo(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  }
}

export const analyticsController = new AnalyticsController();
