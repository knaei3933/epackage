/**
 * Application Error Base Class
 *
 * すべてのアプリケーションエラーの基底クラス
 * エラーの統一的な処理と追跡を可能にする
 * @module lib/errors/AppError
 */

/**
 * エラー严重度レベル
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * エラーコードの標準化
 */
export enum ErrorCode {
  // 一般エラー (1000-1999)
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  UNAUTHORIZED = 'UNAUTHORIZED',

  // APIエラー (2000-2999)
  API_REQUEST_FAILED = 'API_REQUEST_FAILED',
  API_RESPONSE_ERROR = 'API_RESPONSE_ERROR',
  API_TIMEOUT = 'API_TIMEOUT',
  API_RATE_LIMIT = 'API_RATE_LIMIT',

  // データベースエラー (3000-3999)
  DATABASE_ERROR = 'DATABASE_ERROR',
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
  DATABASE_QUERY_ERROR = 'DATABASE_QUERY_ERROR',
  DATABASE_CONSTRAINT_ERROR = 'DATABASE_CONSTRAINT_ERROR',

  // 検証エラー (4000-4999)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SCHEMA_VALIDATION_ERROR = 'SCHEMA_VALIDATION_ERROR',
  FORMAT_VALIDATION_ERROR = 'FORMAT_VALIDATION_ERROR',

  // ビジネスロジックエラー (5000-5999)
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',

  // 外部サービスエラー (6000-6999)
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  PAYMENT_ERROR = 'PAYMENT_ERROR',
  EMAIL_SEND_ERROR = 'EMAIL_SEND_ERROR',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
}

/**
 * アプリケーションエラー基底クラス
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: string;
  public readonly originalError?: Error;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    statusCode: number = 500,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    isOperational: boolean = true,
    context?: Record<string, unknown>,
    originalError?: Error
  ) {
    super(message);

    // エラー名をコードに設定
    this.name = this.constructor.name;
    this.code = code;
    this.severity = severity;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.originalError = originalError;

    // エラースタックトレースの維持
    Error.captureStackTrace?.(this, this.constructor);

    // プロトタイプチェーンの維持
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * エラー情報をJSON形式でシリアライズ
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      context: this.context,
      timestamp: this.timestamp,
      ...(this.originalError && {
        originalError: {
          name: this.originalError.name,
          message: this.originalError.message,
          stack: this.originalError.stack,
        },
      }),
    };
  }

  /**
   * ユーザー向けのエラーメッセージを生成
   */
  getUserMessage(): string {
    const userMessages: Record<ErrorCode, string> = {
      [ErrorCode.UNKNOWN_ERROR]: '予期しないエラーが発生しました。しばらくしてからもう一度お試しください。',
      [ErrorCode.INVALID_INPUT]: '入力内容に誤りがあります。確認して再度入力してください。',
      [ErrorCode.NOT_FOUND]: '要求されたリソースが見つかりませんでした。',
      [ErrorCode.ALREADY_EXISTS]: 'このデータは既に登録されています。',
      [ErrorCode.PERMISSION_DENIED]: 'この操作を実行する権限がありません。',
      [ErrorCode.UNAUTHORIZED]: 'ログインが必要です。',
      [ErrorCode.API_REQUEST_FAILED]: 'APIリクエストが失敗しました。しばらくしてからもう一度お試しください。',
      [ErrorCode.API_RESPONSE_ERROR]: 'APIレスポンスエラーが発生しました。',
      [ErrorCode.API_TIMEOUT]: 'リクエストがタイムアウトしました。ネットワーク接続を確認してください。',
      [ErrorCode.API_RATE_LIMIT]: 'リクエスト回数の制限を超えました。しばらくしてからもう一度お試しください。',
      [ErrorCode.DATABASE_ERROR]: 'データベースエラーが発生しました。',
      [ErrorCode.DATABASE_CONNECTION_ERROR]: 'データベース接続エラーが発生しました。',
      [ErrorCode.DATABASE_QUERY_ERROR]: 'データベースクエリエラーが発生しました。',
      [ErrorCode.DATABASE_CONSTRAINT_ERROR]: 'データ制約エラーが発生しました。',
      [ErrorCode.VALIDATION_ERROR]: '入力値の検証に失敗しました。',
      [ErrorCode.SCHEMA_VALIDATION_ERROR]: 'データ形式が正しくありません。',
      [ErrorCode.FORMAT_VALIDATION_ERROR]: 'フォーマットエラーが発生しました。',
      [ErrorCode.BUSINESS_LOGIC_ERROR]: '処理実行中にエラーが発生しました。',
      [ErrorCode.INVALID_STATE_TRANSITION]: '無効な状態遷移です。',
      [ErrorCode.OPERATION_NOT_ALLOWED]: 'この操作は許可されていません。',
      [ErrorCode.EXTERNAL_SERVICE_ERROR]: '外部サービスエラーが発生しました。',
      [ErrorCode.PAYMENT_ERROR]: '決済処理でエラーが発生しました。',
      [ErrorCode.EMAIL_SEND_ERROR]: 'メール送信に失敗しました。',
      [ErrorCode.FILE_UPLOAD_ERROR]: 'ファイルアップロードに失敗しました。',
    };

    return userMessages[this.code] || userMessages[ErrorCode.UNKNOWN_ERROR];
  }

  /**
   * エラーが運用上のエラー（予期される）かどうか
   */
  isOperationalError(): boolean {
    return this.isOperational;
  }
}

/**
 * エラーをAppErrorに変換するユーティリティ関数
 */
export function toAppError(
  error: unknown,
  defaultCode: ErrorCode = ErrorCode.UNKNOWN_ERROR,
  defaultMessage: string = '予期しないエラーが発生しました。'
): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(
      error.message || defaultMessage,
      defaultCode,
      500,
      ErrorSeverity.MEDIUM,
      true,
      undefined,
      error
    );
  }

  if (typeof error === 'string') {
    return new AppError(error, defaultCode, 500, ErrorSeverity.MEDIUM);
  }

  return new AppError(defaultMessage, defaultCode, 500, ErrorSeverity.MEDIUM);
}
