import { getDatabase } from '../../config/database';
import { Activity, CreateActivityDto, ActivityFilters, ActivityListResponse } from './activity.types';

export class ActivityRepository {
  async create(sessionId: string, dto: CreateActivityDto & { co2e: number }): Promise<Activity> {
    const db = getDatabase();
    const [id] = await db('activities').insert({
      session_id: sessionId,
      type: dto.type,
      sub_type: dto.sub_type,
      value: dto.value,
      unit: dto.unit,
      co2e: dto.co2e,
      date: dto.date,
      notes: dto.notes || '',
    });
    return this.findById(id) as Promise<Activity>;
  }

  async findById(id: number, sessionId?: string): Promise<Activity | undefined> {
    const db = getDatabase();
    const query = db('activities').where({ id });
    if (sessionId) query.andWhere({ session_id: sessionId });
    return query.first() as Promise<Activity | undefined>;
  }

  async findAll(sessionId: string, filters: ActivityFilters = {}): Promise<ActivityListResponse> {
    const db = getDatabase();
    const { type, startDate, endDate, limit = 50, offset = 0 } = filters;

    const baseQuery = () => {
      const q = db('activities').where({ session_id: sessionId });
      if (type) q.andWhere({ type });
      if (startDate) q.andWhere('date', '>=', startDate);
      if (endDate) q.andWhere('date', '<=', endDate);
      return q;
    };

    const [{ count }] = await baseQuery().count('id as count');
    const data = await baseQuery()
      .orderBy('date', 'desc')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset) as Activity[];

    return { data, total: Number(count), limit, offset };
  }

  async delete(id: number, sessionId: string): Promise<boolean> {
    const db = getDatabase();
    const count = await db('activities').where({ id, session_id: sessionId }).delete();
    return count > 0;
  }

  async getDailyTotals(sessionId: string, days: number): Promise<Array<{ date: string; total_co2e: number }>> {
    const db = getDatabase();
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().split('T')[0];

    return db('activities')
      .where({ session_id: sessionId })
      .andWhere('date', '>=', sinceStr)
      .groupBy('date')
      .select(db.raw('date, SUM(co2e) as total_co2e'))
      .orderBy('date', 'asc') as Promise<Array<{ date: string; total_co2e: number }>>;
  }

  async getCategoryBreakdown(
    sessionId: string, startDate: string, endDate: string
  ): Promise<Array<{ type: string; total_co2e: number }>> {
    const db = getDatabase();
    return db('activities')
      .where({ session_id: sessionId })
      .andWhereBetween('date', [startDate, endDate])
      .groupBy('type')
      .select(db.raw('type, SUM(co2e) as total_co2e'))
      .orderBy('total_co2e', 'desc') as Promise<Array<{ type: string; total_co2e: number }>>;
  }

  async getTotalForRange(sessionId: string, startDate: string, endDate: string): Promise<number> {
    const db = getDatabase();
    const [{ total }] = await db('activities')
      .where({ session_id: sessionId })
      .andWhereBetween('date', [startDate, endDate])
      .sum('co2e as total');
    return Number(total) || 0;
  }

  async countBySession(sessionId: string): Promise<number> {
    const db = getDatabase();
    const [{ count }] = await db('activities').where({ session_id: sessionId }).count('id as count');
    return Number(count);
  }
}

export const activityRepository = new ActivityRepository();
