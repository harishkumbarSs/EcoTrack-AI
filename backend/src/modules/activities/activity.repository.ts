import { getDatabase } from '../../config/database';
import { Activity, CreateActivityDto, ActivityFilters, ActivityListResponse } from './activity.types';

/**
 * Repository layer: all direct SQLite operations for activities.
 * Uses parameterized queries to prevent SQL injection.
 */
export class ActivityRepository {
  /**
   * Create a new activity entry.
   */
  public create(sessionId: string, dto: CreateActivityDto & { co2e: number }): Activity {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO activities (session_id, type, sub_type, value, unit, co2e, date, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      sessionId,
      dto.type,
      dto.sub_type,
      dto.value,
      dto.unit,
      dto.co2e,
      dto.date,
      dto.notes || ''
    );

    return this.findById(result.lastInsertRowid as number)!;
  }

  /**
   * Find a single activity by ID, scoped to session.
   */
  public findById(id: number, sessionId?: string): Activity | undefined {
    const db = getDatabase();
    if (sessionId) {
      return db.prepare(
        'SELECT * FROM activities WHERE id = ? AND session_id = ?'
      ).get(id, sessionId) as Activity | undefined;
    }
    return db.prepare('SELECT * FROM activities WHERE id = ?').get(id) as Activity | undefined;
  }

  /**
   * List activities for a session with optional filters.
   */
  public findAll(sessionId: string, filters: ActivityFilters = {}): ActivityListResponse {
    const db = getDatabase();
    const { type, startDate, endDate, limit = 50, offset = 0 } = filters;

    const conditions: string[] = ['session_id = ?'];
    const params: (string | number)[] = [sessionId];

    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }
    if (startDate) {
      conditions.push('date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('date <= ?');
      params.push(endDate);
    }

    const whereClause = conditions.join(' AND ');

    const total = (db.prepare(
      `SELECT COUNT(*) as count FROM activities WHERE ${whereClause}`
    ).get(...params) as { count: number }).count;

    const data = db.prepare(
      `SELECT * FROM activities WHERE ${whereClause} ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?`
    ).all(...params, limit, offset) as Activity[];

    return { data, total, limit, offset };
  }

  /**
   * Delete an activity by ID, scoped to session for security.
   */
  public delete(id: number, sessionId: string): boolean {
    const db = getDatabase();
    const result = db.prepare(
      'DELETE FROM activities WHERE id = ? AND session_id = ?'
    ).run(id, sessionId);
    return result.changes > 0;
  }

  /**
   * Get aggregated daily totals for chart data.
   */
  public getDailyTotals(sessionId: string, days: number): Array<{ date: string; total_co2e: number }> {
    const db = getDatabase();
    return db.prepare(`
      SELECT date, SUM(co2e) as total_co2e
      FROM activities
      WHERE session_id = ?
        AND date >= date('now', ?)
      GROUP BY date
      ORDER BY date ASC
    `).all(sessionId, `-${days} days`) as Array<{ date: string; total_co2e: number }>;
  }

  /**
   * Get category breakdown for a date range.
   */
  public getCategoryBreakdown(
    sessionId: string,
    startDate: string,
    endDate: string
  ): Array<{ type: string; total_co2e: number }> {
    const db = getDatabase();
    return db.prepare(`
      SELECT type, SUM(co2e) as total_co2e
      FROM activities
      WHERE session_id = ? AND date BETWEEN ? AND ?
      GROUP BY type
      ORDER BY total_co2e DESC
    `).all(sessionId, startDate, endDate) as Array<{ type: string; total_co2e: number }>;
  }

  /**
   * Get total CO₂e for a specific date range.
   */
  public getTotalForRange(sessionId: string, startDate: string, endDate: string): number {
    const db = getDatabase();
    const result = db.prepare(`
      SELECT COALESCE(SUM(co2e), 0) as total
      FROM activities
      WHERE session_id = ? AND date BETWEEN ? AND ?
    `).get(sessionId, startDate, endDate) as { total: number };
    return result.total;
  }

  /**
   * Count total activities for a session.
   */
  public countBySession(sessionId: string): number {
    const db = getDatabase();
    const result = db.prepare(
      'SELECT COUNT(*) as count FROM activities WHERE session_id = ?'
    ).get(sessionId) as { count: number };
    return result.count;
  }
}

export const activityRepository = new ActivityRepository();
