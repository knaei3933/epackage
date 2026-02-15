/**
 * ValidationError Unit Tests
 *
 * 検証エラークラスの単体テスト
 * @module lib/errors/__tests__/ValidationError.test
 */

import { describe, it, expect } from '@jest/globals';
import { ValidationError, RequiredFieldError, FormatError, RangeError, LengthError, ValidationErrorDetail } from '../ValidationError';
import { ErrorCode } from '../AppError';

describe('ValidationError', () => {
  describe('基本機能', () => {
    it('検証エラーを作成できる', () => {
      const details: ValidationErrorDetail[] = [
        { field: 'email', message: 'Invalid email format', code: 'INVALID_EMAIL' },
      ];
      const error = new ValidationError('Validation failed', details);

      expect(error.message).toBe('Validation failed');
      expect(error.details).toEqual(details);
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.statusCode).toBe(422);
    });

    it('空の詳細で作成できる', () => {
      const error = new ValidationError('Validation failed');

      expect(error.details).toEqual([]);
    });
  });

  describe('forField', () => {
    it('単一フィールドの検証エラーを作成する', () => {
      const error = ValidationError.forField('email', 'Email is required', undefined, 'REQUIRED');

      expect(error.details).toHaveLength(1);
      expect(error.details[0]).toEqual({
        field: 'email',
        message: 'Email is required',
        code: 'REQUIRED',
        value: undefined,
      });
    });
  });

  describe('forFields', () => {
    it('複数フィールドの検証エラーを作成する', () => {
      const details: ValidationErrorDetail[] = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Password too short' },
      ];
      const error = ValidationError.forFields(details);

      expect(error.details).toHaveLength(2);
      expect(error.message).toContain('2個の入力エラーがあります。');
    });
  });

  describe('fromZodError', () => {
    it('Zodエラーから変換する', () => {
      const zodError = {
        errors: [
          { path: ['email'], message: 'Invalid email' },
          { path: ['password'], message: 'Too short' },
        ],
      };
      const error = ValidationError.fromZodError(zodError);

      expect(error.details).toHaveLength(2);
      expect(error.details[0].field).toBe('email');
      expect(error.details[0].message).toBe('Invalid email');
      expect(error.details[0].code).toBe('ZOD_VALIDATION');
    });
  });

  describe('getUserMessage', () => {
    it('詳細がある場合はフィールドごとのメッセージを返す', () => {
      const details: ValidationErrorDetail[] = [
        { field: 'email', message: 'Invalid format' },
        { field: 'password', message: 'Too short' },
      ];
      const error = new ValidationError('Validation failed', details);
      const message = error.getUserMessage();

      expect(message).toContain('以下の項目を確認してください：');
      expect(message).toContain('email: Invalid format');
      expect(message).toContain('password: Too short');
    });

    it('詳細がない場合は基本メッセージを返す', () => {
      const error = new ValidationError('Validation failed');
      const message = error.getUserMessage();

      expect(message).toBe('入力内容に誤りがあります。');
    });
  });
});

describe('RequiredFieldError', () => {
  it('必須フィールドエラーを作成する', () => {
    const error = new RequiredFieldError('email');

    expect(error.message).toContain('emailは必須項目です。');
    expect(error.details).toHaveLength(1);
    expect(error.details[0].field).toBe('email');
    expect(error.details[0].code).toBe('REQUIRED');
  });
});

describe('FormatError', () => {
  it('フォーマットエラーを作成する', () => {
    const error = new FormatError('email', 'email@example.com', 'INVALID_FORMAT');

    expect(error.message).toContain('emailの形式が正しくありません。');
    expect(error.details[0].field).toBe('email');
    expect(error.details[0].value).toBe('email@example.com');
    expect(error.details[0].code).toBe('INVALID_FORMAT');
  });
});

describe('RangeError', () => {
  it('範囲エラーを作成する', () => {
    const error = new RangeError('quantity', 1, 100, 150);

    expect(error.message).toContain('quantityは1から100の間で入力してください。');
    expect(error.details[0].field).toBe('quantity');
    expect(error.details[0].value).toBe(150);
    expect(error.details[0].code).toBe('OUT_OF_RANGE');
  });
});

describe('LengthError', () => {
  it('長さエラーを作成する', () => {
    const error = new LengthError('password', 8, 32, 5);

    expect(error.message).toContain('passwordは8文字以上32文字以下で入力してください。');
    expect(error.details[0].field).toBe('password');
    expect(error.details[0].value).toBe(5);
    expect(error.details[0].code).toBe('INVALID_LENGTH');
  });
});
