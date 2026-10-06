import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from './AppError';

export function validateRequest(
  _request: Request,
  _response: Response,
  next: NextFunction,
): void {
  const result = validationResult(_request);
  if (!result.isEmpty()) {
    next(new AppError(result.array({ onlyFirstError: true })[0].msg, 400));
    return;
  }
  next();
}
