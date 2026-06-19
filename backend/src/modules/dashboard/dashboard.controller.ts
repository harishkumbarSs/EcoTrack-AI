import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';

export class DashboardController {
  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await dashboardService.getDashboard(req.sessionId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };
}

export const dashboardController = new DashboardController();
