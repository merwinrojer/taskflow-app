import type { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  let statusCode = 500;
  let message = 'Internal server error';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Invalid data';
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'Invalid identifier';
  } else if (
    error instanceof mongoose.mongo.MongoServerError &&
    error.code === 11000
  ) {
    statusCode = 409;
    message = 'An account with this email already exists';
  } else if (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    error.type === 'entity.too.large'
  ) {
    statusCode = 413;
    message = 'Request body is too large';
  } else if (
    error instanceof SyntaxError &&
    'status' in error &&
    error.status === 400
  ) {
    statusCode = 400;
    message = 'Invalid JSON payload';
  } else if (error instanceof Error) {
    console.error(error);
  }

  response.status(statusCode).json({
    error: message,
    ...(env.nodeEnv !== 'production' && statusCode === 500 && error instanceof Error
      ? { detail: error.message }
      : {}),
  });
};
