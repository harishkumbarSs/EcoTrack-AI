import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { createError } from './error.middleware';

/**
 * Middleware to check express-validator results and return 422 on failure.
 * Place this after your validation chain in route definitions.
 */
export function validateRequest(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg).join(', ');
    return next(createError(`Validation failed: ${messages}`, 422));
  }
  next();
}

/**
 * Middleware to extract and validate session ID from header.
 * Falls back to a default session for backward compatibility.
 */
export function extractSessionId(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const sessionId = req.headers['x-session-id'] as string;
  if (!sessionId || sessionId.trim() === '') {
    return next(createError('X-Session-Id header is required', 400));
  }
  // Sanitize: only allow alphanumeric, hyphens, underscores
  if (!/^[a-zA-Z0-9\-_]{1,64}$/.test(sessionId)) {
    return next(createError('Invalid session ID format', 400));
  }
  req.sessionId = sessionId;
  next();
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      sessionId: string;
    }
  }
}
