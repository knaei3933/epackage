/**
 * Validation Error Class
 *
 * データ検証エラーを表現するクラス
 * @module lib/errors/ValidationError
 */

import { AppError, ErrorCode, ErrorSeverity } from './AppError';

/**
 * 検証エラー詳細
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  code?: string;
  value?: unknown;
}

/**
 * 検証エラークラス
 */
export class ValidationError extends AppError {
  public readonly details: ValidationErrorDetail[];

  constructor(
    message: string = '入力内容に誤りがあります。',
    details: ValidationErrorDetail[] = [],
    context?: Record<string, unknown>
  ) {
    super(
      message,
      ErrorCode.VALIDATION_ERROR,
      422,
      ErrorSeverity.LOW,
      true,
      context
    );
    this.details = details;
    this.name = 'ValidationError';
  }

  /**
   * 単一フィールドの検証エラーを作成
   */
  static forField(
    field: string,
    message: string,
    value?: unknown,
    code?: string
  ): ValidationError {
    return new ValidationError('入力内容に誤りがあります。', [
      { field, message, code, value }
    ]);
  }

  /**
   * 複数フィールドの検証エラーを作成
   */
  static forFields(details: ValidationErrorDetail[]): ValidationError {
    return new ValidationError(
      `${details.length}個の入力エラーがあります。`,
      details
    );
  }

  /**
   * Zodエラーから変換
   */
  static fromZodError(zodError: { errors: Array<{ path: (string | number)[]; message: string }> }): ValidationError {
    const details: ValidationErrorDetail[] = zodError.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: 'ZOD_VALIDATION',
    }));

    return ValidationError.forFields(details);
  }

  /**
   * エラー詳細をJSON形式で取得
   */
  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      details: this.details,
    };
  }

  /**
   * ユーザー向けのエラーメッセージ（詳細付き）
   */
  getUserMessage(): string {
    if (this.details.length === 0) {
      return super.getUserMessage();
    }

    const fieldErrors = this.details
      .map((detail) => `${detail.field}: ${detail.message}`)
      .join('\n');

    return `以下の項目を確認してください：\n${fieldErrors}`;
  }
}

/**
 * 必須フィールドエラー
 */
export class RequiredFieldError extends ValidationError {
  constructor(field: string) {
    super(
      `${field}は必須項目です。`,
      [{ field, message: 'この項目は必須です。', code: 'REQUIRED' }]
    );
    this.name = 'RequiredFieldError';
  }
}

/**
 * フォーマットエラー
 */
export class FormatError extends ValidationError {
  constructor(field: string, format: string, value?: unknown) {
    super(
      `${field}の形式が正しくありません。`,
      [{ field, message: `${format}形式で入力してください。`, code: 'INVALID_FORMAT', value }]
    );
    this.name = 'FormatError';
  }
}

/**
 * 範囲エラー
 */
export class RangeError extends ValidationError {
  constructor(field: string, min: number, max: number, value?: unknown) {
    super(
      `${field}は${min}から${max}の間で入力してください。`,
      [{ field, message: `${min}以上${max}以下で入力してください。`, code: 'OUT_OF_RANGE', value }]
    );
    this.name = 'RangeError';
  }
}

/**
 * 長さエラー
 */
export class LengthError extends ValidationError {
  constructor(field: string, minLength: number, maxLength: number, actualLength: number) {
    super(
      `${field}は${minLength}文字以上${maxLength}文字以下で入力してください。`,
      [{
        field,
        message: `${minLength}文字以上${maxLength}文字以下で入力してください。（現在：${actualLength}文字）`,
        code: 'INVALID_LENGTH',
        value: actualLength
      }]
    );
    this.name = 'LengthError';
  }
}
