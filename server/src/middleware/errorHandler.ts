import { Request, Response, NextFunction } from 'express';
import { sendErrorResponse } from '@/utils/response';
import logger from '@/utils/logger';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  if (error instanceof AppError) {
    return sendErrorResponse(res, error.statusCode, error.message);
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return sendErrorResponse(res, 400, 'Validation failed');
  }

  if (error.name === 'UnauthorizedError') {
    return sendErrorResponse(res, 401, 'Unauthorized');
  }

  // Handle database errors
  if (error.message.includes('duplicate key')) {
    return sendErrorResponse(res, 409, 'Resource already exists');
  }

  if (error.message.includes('foreign key constraint')) {
    return sendErrorResponse(res, 400, 'Invalid reference');
  }

  // Default error
  return sendErrorResponse(res, 500, 'Internal server error');
};

export const notFoundHandler = (req: Request, res: Response) => {
  sendErrorResponse(res, 404, `Route ${req.method} ${req.url} not found`);
};