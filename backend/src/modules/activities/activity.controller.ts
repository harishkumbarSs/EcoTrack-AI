import { Request, Response, NextFunction } from 'express';
import { body, query, param } from 'express-validator';
import { activityService } from './activity.service';
import { validateRequest } from '../../middleware/validation.middleware';
import { ActivityType, ActivityFilters } from './activity.types';

export const createActivityValidators = [
  body('type').isIn(['transport', 'electricity', 'food', 'waste']).withMessage('Invalid type'),
  body('sub_type').isString().trim().notEmpty().isLength({ min: 1, max: 50 }),
  body('value').isFloat({ min: 0.001, max: 100000 }).withMessage('value must be a positive number'),
  body('unit').isString().trim().notEmpty().isLength({ max: 20 }),
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date must be YYYY-MM-DD'),
  body('notes').optional().isString().trim().isLength({ max: 500 }),
];

export const listActivitiesValidators = [
  query('type').optional().isIn(['transport', 'electricity', 'food', 'waste']),
  query('startDate').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
  query('endDate').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt(),
];

export const deleteActivityValidators = [
  param('id').isInt({ min: 1 }).toInt(),
];

export class ActivityController {
  create = [
    ...createActivityValidators,
    validateRequest,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const activity = await activityService.createActivity(req.sessionId, req.body);
        res.status(201).json({ success: true, data: activity });
      } catch (err) { next(err); }
    },
  ];

  list = [
    ...listActivitiesValidators,
    validateRequest,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const filters: ActivityFilters = {
          type: req.query.type as ActivityType | undefined,
          startDate: req.query.startDate as string | undefined,
          endDate: req.query.endDate as string | undefined,
          limit: req.query.limit ? Number(req.query.limit) : 50,
          offset: req.query.offset ? Number(req.query.offset) : 0,
        };
        const result = await activityService.getActivities(req.sessionId, filters);
        res.json({ success: true, ...result });
      } catch (err) { next(err); }
    },
  ];

  delete = [
    ...deleteActivityValidators,
    validateRequest,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await activityService.deleteActivity(Number(req.params.id), req.sessionId);
        res.json({ success: true, message: 'Activity deleted' });
      } catch (err) { next(err); }
    },
  ];

  getSubTypes = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const type = req.params.type as ActivityType;
      if (!['transport', 'electricity', 'food', 'waste'].includes(type)) {
        res.status(400).json({ success: false, error: 'Invalid activity type' });
        return;
      }
      res.json({ success: true, data: activityService.getSubTypes(type) });
    } catch (err) { next(err); }
  };
}

export const activityController = new ActivityController();
