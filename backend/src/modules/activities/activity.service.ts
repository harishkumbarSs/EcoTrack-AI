import { carbonCalculator } from '../carbon/carbon.calculator';
import { activityRepository } from './activity.repository';
import { gamificationService } from '../gamification/gamification.service';
import { Activity, CreateActivityDto, ActivityFilters, ActivityListResponse, ActivityType } from './activity.types';
import { EMISSION_FACTORS } from '../../config/emission-factors';
import { createError } from '../../middleware/error.middleware';

export class ActivityService {
  async createActivity(sessionId: string, dto: CreateActivityDto): Promise<Activity> {
    const categoryFactors = EMISSION_FACTORS[dto.type] as Record<string, { unit: string }> | undefined;
    if (!categoryFactors || !(dto.sub_type in categoryFactors)) {
      throw createError(`Invalid sub_type '${dto.sub_type}' for type '${dto.type}'`, 400);
    }

    const co2e = carbonCalculator.calculate(dto.type, dto.sub_type, dto.value);
    const activity = await activityRepository.create(sessionId, { ...dto, co2e });

    // Fire-and-forget achievement evaluation
    gamificationService.evaluateAchievements(sessionId).catch(() => {});

    return activity;
  }

  async getActivities(sessionId: string, filters: ActivityFilters): Promise<ActivityListResponse> {
    return activityRepository.findAll(sessionId, filters);
  }

  async deleteActivity(id: number, sessionId: string): Promise<void> {
    const deleted = await activityRepository.delete(id, sessionId);
    if (!deleted) throw createError(`Activity ${id} not found`, 404);
  }

  getSubTypes(type: ActivityType): Array<{ key: string; label: string; factor: number; unit: string; icon: string }> {
    const categoryFactors = EMISSION_FACTORS[type] as Record<
      string,
      { factor: number; unit: string; label: string; icon: string }
    >;
    return Object.entries(categoryFactors).map(([key, value]) => ({
      key,
      label: value.label,
      factor: value.factor,
      unit: value.unit,
      icon: value.icon,
    }));
  }
}

export const activityService = new ActivityService();
