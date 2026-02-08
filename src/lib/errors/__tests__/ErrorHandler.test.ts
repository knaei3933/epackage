/**
 * ErrorHandler Unit Tests
 *
 * エラーハンドラーの単体テスト
 * @module lib/errors/__tests__/ErrorHandler.test
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ErrorHandler, ErrorResponse, handleServerAction, withErrorHandler } from '../handler';
import { ApiError } from '../ApiError';
import { ValidationError } from '../ValidationError';
import { AppError, ErrorCode } from '../AppError';

// モックロガー
const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// モック監視サービス
const mockMonitoring = {
  captureException: jest.fn(),
  captureMessage: jest.fn(),
};

describe('ErrorHandler', () => {
  let handler: ErrorHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new ErrorHandler({
      logger: mockLogger as any,
      monitoring: mockMonitoring as any,
      environment: 'development',
      includeStackTrace: true,
    });
  });

  describe('handle', () => {
    it('AppErrorを正しく処理する', () => {
      const error = new AppError('Test error', ErrorCode.INVALID_INPUT, 400);
      const result = handler.handle(error);

      expect(result.appError).toBe(error);
      expect(result.response.success).toBe(false);
      expect(result.response.statusCode).toBe(400);
      expect(result.response.error.code).toBe(ErrorCode.INVALID_INPUT);
    });

    it('ErrorをAppErrorに変換して処理する', () => {
      const error = new Error('Standard error');
      const result = handler.handle(error);

      expect(result.appError).toBeInstanceOf(AppError);
      expect(result.response.success).toBe(false);
    });

    it('運用上のエラーは監視サービスに送信しない', () => {
      const error = new AppError('Operational error', ErrorCode.INVALID_INPUT, 400, undefined as any, true);
      handler.handle(error);

      expect(mockMonitoring.captureException).not.toHaveBeenCalled();
    });

    it('重大なエラーは監視サービスに送信する', () => {
      const error = new AppError('Critical error', ErrorCode.DATABASE_ERROR, 500, 'critical' as any, false);
      handler.handle(error);

      expect(mockMonitoring.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          code: ErrorCode.DATABASE_ERROR,
          severity: 'critical',
        })
      );
    });

    it('HIGH以上の严重度はerrorログに出力する', () => {
      const error = new AppError('High severity error', ErrorCode.DATABASE_ERROR, 500, 'high' as any);
      handler.handle(error);

      expect(mockLogger.error).toHaveBeenCalled();
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('MEDIUM严重度はwarnログに出力する', () => {
      const error = new AppError('Medium severity error', ErrorCode.INVALID_INPUT, 400, 'medium' as any);
      handler.handle(error);

      expect(mockLogger.warn).toHaveBeenCalled();
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });

  describe('handleApiRoute', () => {
    it('Next.js API Route用のレスポンスを生成する', () => {
      const error = ApiError.notFound('Resource not found');
      const result = handler.handleApiRoute(error);

      expect(result.status).toBe(404);
      expect(result.body.success).toBe(false);
      expect(result.body.statusCode).toBe(404);
    });
  });

  describe('handleAsync', () => {
    it('非同期関数のエラーをキャッチして処理する', async () => {
      const fn = async () => {
        throw new Error('Async error');
      };

      await expect(handler.handleAsync(fn)).rejects.toThrow('Async error');
    });

    it('成功した場合は結果を返す', async () => {
      const fn = async () => 'success';

      const result = await handler.handleAsync(fn);

      expect(result).toBe('success');
    });
  });
});

describe('handleServerAction', () => {
  it('成功した場合はdataを含むレスポンスを返す', async () => {
    const fn = async () => 'test data';

    const result = await handleServerAction(fn);

    expect(result).toEqual({ success: true, data: 'test data' });
  });

  it('エラーが発生した場合はエラーメッセージを返す', async () => {
    const fn = async () => {
      throw new Error('Action error');
    };

    const result = await handleServerAction(fn);

    expect(result.success).toBe(false);
    expect(typeof result.error).toBe('string');
  });
});

describe('withErrorHandler', () => {
  it('成功した場合はハンドラーの結果を返す', async () => {
    const handlerFn = jest.fn().mockResolvedValue('success');
    const wrapped = withErrorHandler(handlerFn);

    const result = await wrapped();

    expect(result).toBe('success');
  });

  it('エラーが発生した場合はエラーレスポンスを返す', async () => {
    const handlerFn = jest.fn().mockRejectedValue(new Error('Handler error'));
    const wrapped = withErrorHandler(handlerFn);

    const result = await wrapped();

    expect(result).toBeInstanceOf(Response);
  });
});

describe('ErrorResponse型', () => {
  it('エラーレスポンスの型チェック', () => {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: ErrorCode.INVALID_INPUT,
        message: 'Invalid input',
      },
      statusCode: 400,
    };

    expect(response.success).toBe(false);
    expect(response.error.code).toBe(ErrorCode.INVALID_INPUT);
    expect(response.statusCode).toBe(400);
  });
});
