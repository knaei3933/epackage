/**
 * AppError Unit Tests
 *
 * エラーハンドリングシステムの単体テスト
 * @module lib/errors/__tests__/AppError.test
 */

import { describe, it, expect } from '@jest/globals';
import {
  AppError,
  ErrorCode,
  ErrorSeverity,
  toAppError,
} from '../AppError';

describe('AppError', () => {
  describe('コンストラクタ', () => {
    it('基本プロパティが正しく設定される', () => {
      const error = new AppError('Test error', ErrorCode.INVALID_INPUT, 400, ErrorSeverity.LOW);

      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ErrorCode.INVALID_INPUT);
      expect(error.statusCode).toBe(400);
      expect(error.severity).toBe(ErrorSeverity.LOW);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('AppError');
    });

    it('コンテキスト情報を保持できる', () => {
      const context = { userId: '123', action: 'create' };
      const error = new AppError('Test error', ErrorCode.UNKNOWN_ERROR, 500, ErrorSeverity.MEDIUM, true, context);

      expect(error.context).toEqual(context);
    });

    it('元のエラーを保持できる', () => {
      const originalError = new Error('Original error');
      const error = new AppError('Wrapper error', ErrorCode.UNKNOWN_ERROR, 500, ErrorSeverity.MEDIUM, true, undefined, originalError);

      expect(error.originalError).toBe(originalError);
    });

    it('タイムスタンプが自動生成される', () => {
      const before = new Date().toISOString();
      const error = new AppError('Test error');
      const after = new Date().toISOString();

      expect(error.timestamp).toBeDefined();
      expect(error.timestamp >= before).toBe(true);
      expect(error.timestamp <= after).toBe(true);
    });
  });

  describe('toJSON', () => {
    it('エラー情報をJSON形式にシリアライズできる', () => {
      const context = { field: 'email', value: 'invalid' };
      const originalError = new Error('Original');
      const error = new AppError('Validation failed', ErrorCode.VALIDATION_ERROR, 422, ErrorSeverity.LOW, true, context, originalError);

      const json = error.toJSON() as Record<string, unknown>;

      expect(json.name).toBe('AppError');
      expect(json.message).toBe('Validation failed');
      expect(json.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(json.severity).toBe(ErrorSeverity.LOW);
      expect(json.statusCode).toBe(422);
      expect(json.context).toEqual(context);
      expect(json.originalError).toBeDefined();
    });
  });

  describe('getUserMessage', () => {
    it('エラーコードに対応する日本語メッセージを返す', () => {
      const error = new AppError('Error occurred', ErrorCode.INVALID_INPUT, 400);
      const message = error.getUserMessage();

      expect(message).toBe('入力内容に誤りがあります。確認して再度入力してください。');
    });

    it('未知のエラーコードの場合はデフォルトメッセージを返す', () => {
      // 型上は存在しないコードだが、テストのため文字列として渡す
      const error = new AppError('Unknown error', 'UNKNOWN_CODE' as ErrorCode, 500);
      const message = error.getUserMessage();

      expect(message).toBe('予期しないエラーが発生しました。しばらくしてからもう一度お試しください。');
    });
  });

  describe('isOperationalError', () => {
    it('運用上のエラーを正しく識別する', () => {
      const operationalError = new AppError('Operational', ErrorCode.INVALID_INPUT, 400, ErrorSeverity.LOW, true);
      const criticalError = new AppError('Critical', ErrorCode.DATABASE_ERROR, 500, ErrorSeverity.CRITICAL, false);

      expect(operationalError.isOperationalError()).toBe(true);
      expect(criticalError.isOperationalError()).toBe(false);
    });
  });
});

describe('toAppError', () => {
  it('AppErrorをそのまま返す', () => {
    const originalError = new AppError('Original', ErrorCode.INVALID_INPUT, 400);
    const converted = toAppError(originalError);

    expect(converted).toBe(originalError);
  });

  it('ErrorをAppErrorに変換する', () => {
    const originalError = new Error('Standard error');
    const converted = toAppError(originalError, ErrorCode.API_REQUEST_FAILED, 'Custom message');

    expect(converted).toBeInstanceOf(AppError);
    expect(converted.message).toBe('Standard error');
    expect(converted.code).toBe(ErrorCode.API_REQUEST_FAILED);
    expect(converted.originalError).toBe(originalError);
  });

  it('文字列をAppErrorに変換する', () => {
    const converted = toAppError('String error', ErrorCode.VALIDATION_ERROR);

    expect(converted).toBeInstanceOf(AppError);
    expect(converted.message).toBe('String error');
    expect(converted.code).toBe(ErrorCode.VALIDATION_ERROR);
  });

  it('unknown型をAppErrorに変換する', () => {
    const converted = toAppError(null, ErrorCode.UNKNOWN_ERROR, 'Default message');

    expect(converted).toBeInstanceOf(AppError);
    expect(converted.message).toBe('Default message');
    expect(converted.code).toBe(ErrorCode.UNKNOWN_ERROR);
  });
});

describe('ErrorCode', () => {
  it('すべてのエラーコードが定義されている', () => {
    expect(ErrorCode.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    expect(ErrorCode.INVALID_INPUT).toBe('INVALID_INPUT');
    expect(ErrorCode.NOT_FOUND).toBe('NOT_FOUND');
    expect(ErrorCode.PERMISSION_DENIED).toBe('PERMISSION_DENIED');
    expect(ErrorCode.UNAUTHORIZED).toBe('UNAUTHORIZED');
    expect(ErrorCode.API_REQUEST_FAILED).toBe('API_REQUEST_FAILED');
    expect(ErrorCode.DATABASE_ERROR).toBe('DATABASE_ERROR');
    expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
  });
});

describe('ErrorSeverity', () => {
  it('すべての严重度レベルが定義されている', () => {
    expect(ErrorSeverity.LOW).toBe('low');
    expect(ErrorSeverity.MEDIUM).toBe('medium');
    expect(ErrorSeverity.HIGH).toBe('high');
    expect(ErrorSeverity.CRITICAL).toBe('critical');
  });
});
