import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

interface TokenPayload extends jwt.JwtPayload {
  sub: string;
}

export function requireAuth(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  const authorization = request.header('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    next(new AppError('Authentication required', 401));
    return;
  }

  try {
    const token = authorization.slice(7);
    const payload = jwt.verify(token, env.jwtSecret);
    if (typeof payload === 'string' || typeof payload.sub !== 'string') {
      throw new Error('Invalid token payload');
    }
    request.userId = payload.sub;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}
