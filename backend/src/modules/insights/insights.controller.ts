import { Request, Response, NextFunction } from 'express';
import { insightsService } from './insights.service';

export class InsightsController {
  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await insightsService.getInsights(req.sessionId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };
}

export const insightsController = new InsightsController();
