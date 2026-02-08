/**
 * Error Handler
 *
 * エラー処理の統一インターフェース
 * ロギング、ユーザー通知、監視などの統合
 * @module lib/errors/handler
 */

import { AppError, toAppError } from './AppError';
import { ApiError } from './ApiError';
import { ValidationError } from './ValidationError';
import { DatabaseError } from './DatabaseError';

/**
 * エラーハンドラー設定
 */
export interface ErrorHandlerConfig {
  // ロギング関数
  logger?: {
    error: (message: string, meta?: Record<string, unknown>) => void;
    warn: (message: string, meta?: Record<string, unknown>) => void;
    info: (message: string, meta?: Record<string, unknown>) => void;
  };

  // エラー監視サービス
  monitoring?: {
    captureException: (error: Error, context?: Record<string, unknown>) => void;
    captureMessage: (message: string, level?: string) => void;
  };

  // 環境
  environment?: 'development' | 'production' | 'test';

  // 詳細なエラー情報をクライアントに返すかどうか
  includeStackTrace?: boolean;
}

/**
 * デフォルトのエラーハンドラー設定
 */
const defaultConfig: ErrorHandlerConfig = {
  environment: process.env.NODE_ENV as ErrorHandlerConfig['environment'] || 'development',
  includeStackTrace: false,
  logger: {
    error: console.error,
    warn: console.warn,
    info: console.info,
  },
};

/**
 * 統一エラーハンドラー
 */
export class ErrorHandler {
  private config: ErrorHandlerConfig;

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * エラーを処理
   */
  handle(error: unknown, context?: Record<string, unknown>): {
    appError: AppError;
    response: ErrorResponse;
    shouldLog: boolean;
    shouldMonitor: boolean;
  } {
    // AppErrorに変換
    const appError = toAppError(error);

    // ログ出力
    this.logError(appError, context);

    // 監視サービスに送信
    if (this.shouldMonitor(appError)) {
      this.monitorError(appError, context);
    }

    // クライアントレスポンス生成
    const response = this.buildErrorResponse(appError);

    return {
      appError,
      response,
      shouldLog: true,
      shouldMonitor: this.shouldMonitor(appError),
    };
  }

  /**
   * Next.js API Route用エラーハンドラー
   */
  handleApiRoute(error: unknown): {
    status: number;
    body: ErrorResponse;
  } {
    const { response } = this.handle(error);

    return {
      status: response.statusCode,
      body: response,
    };
  }

  /**
   * エラーをログ出力
   */
  private logError(error: AppError, context?: Record<string, unknown>): void {
    const logData = {
      ...error.toJSON(),
      ...context,
    };

    if (error.severity === 'critical' || error.severity === 'high') {
      this.config.logger?.error(`[${error.code}] ${error.message}`, logData);
    } else if (error.severity === 'medium') {
      this.config.logger?.warn(`[${error.code}] ${error.message}`, logData);
    } else {
      this.config.logger?.info(`[${error.code}] ${error.message}`, logData);
    }
  }

  /**
   * エラーを監視サービスに送信
   */
  private monitorError(error: AppError, context?: Record<string, unknown>): void {
    if (!this.config.monitoring) return;

    // 運用上のエラーは監視しない
    if (error.isOperationalError()) {
      return;
    }

    this.config.monitoring.captureException(error, {
      ...context,
      severity: error.severity,
      code: error.code,
    });
  }

  /**
   * エラーを監視すべきかどうか
   */
  private shouldMonitor(error: AppError): boolean {
    return !error.isOperational || error.severity === 'critical';
  }

  /**
   * エラーレスポンスを構築
   */
  private buildErrorResponse(error: AppError): ErrorResponse {
    const isDevelopment = this.config.environment === 'development';

    return {
      success: false,
      error: {
        code: error.code,
        message: error.getUserMessage(),
        ...(isDevelopment && this.config.includeStackTrace && {
          stack: error.stack,
          originalError: error.originalError?.message,
        }),
        ...(error.context && { context: error.context }),
      },
      statusCode: error.statusCode,
    };
  }

  /**
   * 非同期エラーハンドラー（Promise.catch用）
   */
  async handleAsync<T>(
    fn: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.handle(error, context);
      throw error;
    }
  }
}

/**
 * エラーレスポンス型
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    stack?: string;
    originalError?: string;
    context?: Record<string, unknown>;
  };
  statusCode: number;
}

/**
 * デフォルトエラーハンドラーインスタンス
 */
export const errorHandler = new ErrorHandler();

/**
 * エラー処理ヘルパー関数
 */
export function handleError(error: unknown, context?: Record<string, unknown>): ErrorResponse {
  const { response } = errorHandler.handle(error, context);
  return response;
}

/**
 * Next.js APIルート用エラーハンドラー
 */
export function withErrorHandler<T extends (...args: unknown[]) => Promise<unknown>>(
  handler: T
): T {
  return (async (...args: unknown[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      const { status, body } = errorHandler.handleApiRoute(error);
      return Response.json(body, { status });
    }
  }) as T;
}

/**
 * サーバーアクション用エラーハンドラー
 */
export async function handleServerAction<T>(
  fn: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const appError = toAppError(error);
    return {
      success: false,
      error: appError.getUserMessage(),
    };
  }
}

// エクスポート
export * from './AppError';
export * from './ApiError';
export * from './ValidationError';
export * from './DatabaseError';
