import { Response } from 'express';
import { ApiResponse } from '@/types';

export const createSuccessResponse = <T>(
  data?: T,
  message: string = 'Success'
): ApiResponse<T> => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString()
});

export const createErrorResponse = (
  message: string = 'Internal server error'
): ApiResponse => ({
  success: false,
  message,
  error: message,
  timestamp: new Date().toISOString()
});

export const sendSuccessResponse = <T>(
  res: Response,
  statusCode: number = 200,
  data?: T,
  message?: string
) => {
  const response = createSuccessResponse(data, message);
  return res.status(statusCode).json(response);
};

export const sendErrorResponse = (
  res: Response,
  statusCode: number = 500,
  message?: string
) => {
  const response = createErrorResponse(message);
  return res.status(statusCode).json(response);
};

export const sendValidationError = (
  res: Response,
  errors: any[]
) => {
  const response = createErrorResponse('Validation failed');
  response.error = errors;
  return res.status(400).json(response);
};