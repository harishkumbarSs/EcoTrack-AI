import request from 'supertest';
import { createApp } from '../src/app';
import { initializeTestDatabase, closeDatabase } from '../src/config/database';
import { Application } from 'express';

describe('Activities API', () => {
  let app: Application;
  const sessionId = 'test-session-api-001';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DB_PATH = ':memory:';
    await initializeTestDatabase();
    app = createApp();
  }, 30000);

  afterAll(async () => {
    await closeDatabase();
  });

  // ─── POST /api/activities ─────────────────────────────────────────────────

  describe('POST /api/activities', () => {
    it('should create a transport activity and return 201', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('X-Session-Id', sessionId)
        .send({
          type: 'transport',
          sub_type: 'car_petrol',
          value: 50,
          unit: 'km',
          date: '2024-01-15',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        type: 'transport',
        sub_type: 'car_petrol',
        value: 50,
        unit: 'km',
      });
      expect(res.body.data.co2e).toBeCloseTo(9.6, 1); // 50 * 0.192
    });

    it('should create a food activity with correct co2e', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('X-Session-Id', sessionId)
        .send({
          type: 'food',
          sub_type: 'beef',
          value: 0.2,
          unit: 'kg',
          date: '2024-01-15',
          notes: 'Dinner',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.co2e).toBeCloseTo(5.4, 1); // 0.2 * 27
    });

    it('should return 400 for invalid activity type', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('X-Session-Id', sessionId)
        .send({ type: 'invalid', sub_type: 'car', value: 10, unit: 'km', date: '2024-01-15' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for missing session ID', async () => {
      const res = await request(app)
        .post('/api/activities')
        .send({ type: 'transport', sub_type: 'car_petrol', value: 10, unit: 'km', date: '2024-01-15' });

      expect(res.status).toBe(400);
    });

    it('should return 422 for negative value', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('X-Session-Id', sessionId)
        .send({ type: 'transport', sub_type: 'car_petrol', value: -5, unit: 'km', date: '2024-01-15' });

      expect(res.status).toBe(422);
    });

    it('should return 422 for invalid date format', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('X-Session-Id', sessionId)
        .send({ type: 'transport', sub_type: 'car_petrol', value: 10, unit: 'km', date: '15/01/2024' });

      expect(res.status).toBe(422);
    });

    it('should return 400 for invalid sub_type', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('X-Session-Id', sessionId)
        .send({ type: 'transport', sub_type: 'teleporter', value: 10, unit: 'km', date: '2024-01-15' });

      expect(res.status).toBe(400);
    });
  });

  // ─── GET /api/activities ──────────────────────────────────────────────────

  describe('GET /api/activities', () => {
    it('should return list of activities', async () => {
      const res = await request(app)
        .get('/api/activities')
        .set('X-Session-Id', sessionId);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.total).toBeGreaterThan(0);
    });

    it('should filter by type', async () => {
      const res = await request(app)
        .get('/api/activities?type=transport')
        .set('X-Session-Id', sessionId);

      expect(res.status).toBe(200);
      expect(res.body.data.every((a: { type: string }) => a.type === 'transport')).toBe(true);
    });

    it('should not return activities from other sessions', async () => {
      const res = await request(app)
        .get('/api/activities')
        .set('X-Session-Id', 'completely-different-session');

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(0);
    });
  });

  // ─── DELETE /api/activities/:id ───────────────────────────────────────────

  describe('DELETE /api/activities/:id', () => {
    it('should delete an activity belonging to the session', async () => {
      // Create one first
      const create = await request(app)
        .post('/api/activities')
        .set('X-Session-Id', sessionId)
        .send({ type: 'waste', sub_type: 'landfill', value: 1, unit: 'kg', date: '2024-01-16' });

      const id = create.body.data.id;

      const del = await request(app)
        .delete(`/api/activities/${id}`)
        .set('X-Session-Id', sessionId);

      expect(del.status).toBe(200);
      expect(del.body.success).toBe(true);
    });

    it('should return 404 when deleting non-existent activity', async () => {
      const res = await request(app)
        .delete('/api/activities/999999')
        .set('X-Session-Id', sessionId);

      expect(res.status).toBe(404);
    });
  });

  // ─── GET /api/dashboard ───────────────────────────────────────────────────

  describe('GET /api/dashboard', () => {
    it('should return dashboard data with correct structure', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('X-Session-Id', sessionId);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('kpis');
      expect(res.body.data).toHaveProperty('trendChart');
      expect(res.body.data).toHaveProperty('categoryBreakdown');
      expect(res.body.data).toHaveProperty('score');
    });
  });

  // ─── GET /api/insights ────────────────────────────────────────────────────

  describe('GET /api/insights', () => {
    it('should return insights with recommendations array', async () => {
      const res = await request(app)
        .get('/api/insights')
        .set('X-Session-Id', sessionId);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('recommendations');
      expect(Array.isArray(res.body.data.recommendations)).toBe(true);
    });
  });

  // ─── GET /health ──────────────────────────────────────────────────────────

  describe('GET /health', () => {
    it('should return health check with 200', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});
