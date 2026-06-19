import { Router } from 'express';
import { extractSessionId } from '../middleware/validation.middleware';
import { activityController } from '../modules/activities/activity.controller';
import { dashboardController } from '../modules/dashboard/dashboard.controller';
import { insightsController } from '../modules/insights/insights.controller';
import { analyticsController } from '../modules/analytics/analytics.controller';

export const router = Router();

// All routes below this middleware require a valid session ID
router.use(extractSessionId);

// ─── Activities ───────────────────────────────────────────────────────────────
router.post('/activities', ...activityController.create);
router.get('/activities', ...activityController.list);
router.delete('/activities/:id', ...activityController.delete);
router.get('/activities/sub-types/:type', activityController.getSubTypes);

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard', dashboardController.get);

// ─── Insights (AI Recommendations) ───────────────────────────────────────────
router.get('/insights', insightsController.get);

// ─── Analytics ────────────────────────────────────────────────────────────────
router.get('/analytics', analyticsController.get);

// ─── Achievements & Gamification ─────────────────────────────────────────────
router.get('/achievements', analyticsController.getAchievements);

// ─── Goals ───────────────────────────────────────────────────────────────────
router.get('/goals', analyticsController.getGoal);
router.post('/goals', ...analyticsController.createGoal);
