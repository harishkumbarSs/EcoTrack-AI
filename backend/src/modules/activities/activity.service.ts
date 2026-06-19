import { carbonCalculator } from '../carbon/carbon.calculator';
import { activityRepository } from './activity.repository';
import { gamificationService } from '../gamification/gamification.service';
import { Activity, CreateActivityDto, ActivityFilters, ActivityListResponse, ActivityType } from './activity.types';
import { EMISSION_FACTORS } from '../../config/emission-factors';
import { createError } from '../../middleware/error.middleware';

export class ActivityService {
  /**
   * Create a new activity, computing its CO₂e automatically.
   */
  public async createActivity(sessionId: string, dto: CreateActivityDto): Promise<Activity> {
    // Validate sub_type exists for the given type
    const categoryFactors = EMISSION_FACTORS[dto.type] as Record<string, { unit: string }> | undefined;
    if (!categoryFactors || !(dto.sub_type in categoryFactors)) {
      throw createError(`Invalid sub_type '${dto.sub_type}' for type '${dto.type}'`, 400);
    }

    // Calculate CO₂e
    const co2e = carbonCalculator.calculate(dto.type, dto.sub_type, dto.value);

    // Persist
    const activity = activityRepository.create(sessionId, { ...dto, co2e });

    // Award any newly earned achievements (fire-and-forget)
    await gamificationService.evaluateAchievements(sessionId).catch(() => {});

    return activity;
  }

  /**
   * Get paginated activities with optional filters.
   */
  public getActivities(sessionId: string, filters: ActivityFilters): ActivityListResponse {
    return activityRepository.findAll(sessionId, filters);
  }

  /**
   * Delete an activity (must belong to session).
   */
  public deleteActivity(id: number, sessionId: string): void {
    const deleted = activityRepository.delete(id, sessionId);
    if (!deleted) {
      throw createError(`Activity ${id} not found`, 404);
    }
  }

  /**
   * Get all valid sub-types for a category with their emission factors.
   */
  public getSubTypes(type: ActivityType): Array<{
    key: string;
    label: string;
    factor: number;
    unit: string;
    icon: string;
  }> {
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
