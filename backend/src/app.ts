import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { rateLimiter } from './middleware/rate-limit.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { router } from './routes';
import { logger } from './utils/logger';

export function createApp(): Application {
  const app = express();

  // ─── Security Middleware ──────────────────────────────────────────────────
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  }));

  // ─── CORS ─────────────────────────────────────────────────────────────────
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:4200',
    'https://ecotrack-ai.netlify.app',
  ];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id'],
  }));

  // ─── Request Parsing ──────────────────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(compression());

  // ─── Logging ─────────────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined', {
      stream: { write: (msg) => logger.http(msg.trim()) },
    }));
  }

  // ─── Rate Limiting ────────────────────────────────────────────────────────
  app.use('/api', rateLimiter);

  // ─── Health Check ─────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'EcoTrack AI API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // ─── API Routes ───────────────────────────────────────────────────────────
  app.use('/api', router);

  // ─── Error Handling ───────────────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
