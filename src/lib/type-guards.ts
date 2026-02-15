/**
 * Type Guard Utilities
 *
 * TypeScriptタイプ安全性を向上させるためのタイプガード関数群
 *
 * @module lib/type-guards
 */

import type { Database } from '@/types/database';

// =====================================================
// Primitive Type Guards
// =====================================================

/**
 * 値が文字列か確認
 *
 * @param value - 確認する値
 * @returns 文字列の場合true
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * 値が数値か確認（NaNを除外）
 *
 * @param value - 確認する値
 * @returns 数値の場合true
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * 値が真偽値か確認
 *
 * @param value - 確認する値
 * @returns 真偽値の場合true
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * 値がnullか確認
 *
 * @param value - 確認する値
 * @returns nullの場合true
 */
export function isNull(value: unknown): value is null {
  return value === null;
}

/**
 * 値がundefinedか確認
 *
 * @param value - 確認する値
 * @returns undefinedの場合true
 */
export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

/**
 * 値がnullまたはundefinedか確認
 *
 * @param value - 確認する値
 * @returns nullまたはundefinedの場合true
 */
export function isNullable(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * 値がnullまたはundefinedでないか確認
 *
 * @param value - 確認する値
 * @returns nullまたはundefinedでない場合true
 */
export function isNonNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// =====================================================
// Object Type Guards
// =====================================================

/**
 * 値がオブジェクトか確認（nullを除外）
 *
 * @param value - 確認する値
 * @returns オブジェクトの場合true
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 値が配列か確認
 *
 * @param value - 確認する値
 * @param itemValidator - 配列要素のバリデータ（オプション）
 * @returns 配列の場合true
 */
export function isArray<T = unknown>(
  value: unknown,
  itemValidator?: (item: unknown) => item is T
): value is T[] {
  if (!Array.isArray(value)) return false;

  if (itemValidator) {
    return value.every(item => itemValidator(item));
  }

  return true;
}

/**
 * 空のオブジェクトか確認
 *
 * @param value - 確認する値
 * @returns 空のオブジェクトの場合true
 */
export function isEmptyObject(value: unknown): boolean {
  return isObject(value) && Object.keys(value).length === 0;
}

// =====================================================
// Database Type Guards
// =====================================================

/**
 * Supabase行タイプガード
 *
 * Supabaseテーブル行に必須のidプロパティが存在するか確認
 *
 * @param value - 確認する値
 * @returns Supabase行の場合true
 */
export function isSupabaseRow<T = unknown>(
  value: unknown
): value is { id: string } & T {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    isUUID((value as any).id)
  );
}

/**
 * データベース行タイプガード（汎用）
 *
 * @param value - 確認する値
 * @param validator - カスタムバリデータ
 * @returns 検証された型の場合true
 */
export function isDbRow<T>(
  value: unknown,
  validator: (v: any) => v is T
): value is T {
  return typeof value === 'object' && value !== null && validator(value);
}

/**
 * Supabase配列レスポンスか確認
 *
 * @param value - 確認する値
 * @returns Supabase配列レスポンスの場合true
 */
export function isSupabaseArrayResponse<T = unknown>(
  value: unknown
): value is { data: T[] | null; error: null } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'error' in value &&
    (value as any).error === null
  );
}

/**
 * Supabaseエラーレスポンスか確認
 *
 * @param value - 確認する値
 * @returns Supabaseエラーレスポンスの場合true
 */
export function isSupabaseErrorResponse(
  value: unknown
): value is { data: null; error: { message: string; code?: string } } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'error' in value &&
    (value as any).data === null &&
    typeof (value as any).error === 'object'
  );
}

// =====================================================
// String Format Type Guards
// =====================================================

/**
 * UUID v4形式か確認
 *
 * @param value - 確認する値
 * @returns UUID v4形式の場合true
 */
export function isUUID(value: unknown): value is string {
  if (!isString(value)) return false;

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return uuidRegex.test(value);
}

/**
 * メールアドレス形式か確認
 *
 * @param value - 確認する値
 * @returns メールアドレス形式の場合true
 */
export function isEmail(value: unknown): value is string {
  if (!isString(value)) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * 日本の電話番号形式か確認
 *
 * @param value - 確認する値
 * @returns 電話番号形式の場合true
 */
export function isJapanesePhoneNumber(value: unknown): value is string {
  if (!isString(value)) return false;

  // 携帯: 090-1234-5678, 固定: 03-1234-5678
  const phoneRegex = /^(0\d{1,4}-\d{1,4}-\d{4}|0\d{9,10})$/;
  return phoneRegex.test(value);
}

/**
 * URL形式か確認
 *
 * @param value - 確認する値
 * @returns URL形式の場合true
 */
export function isUrl(value: unknown): value is string {
  if (!isString(value)) return false;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * 日付文字列か確認（ISO 8601）
 *
 * @param value - 確認する値
 * @returns 日付文字列の場合true
 */
export function isISODateString(value: unknown): value is string {
  if (!isString(value)) return false;

  const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  return dateRegex.test(value);
}

// =====================================================
// Type Assertions
// =====================================================

/**
 * タイプアサーション（安全）
 *
 * 検証に失敗した場合TypeErrorを投げる
 *
 * @param value - 確認する値
 * @param validator - バリデータ関数
 * @param message - エラーメッセージ
 * @throws {TypeError} 検証失敗時
 *
 * @example
 * ```typescript
 * assertType(data, isObject, 'Data must be an object');
 * // data は以降、Record<string, unknown>として扱われる
 * ```
 */
export function assertType<T>(
  value: unknown,
  validator: (v: any) => v is T,
  message = 'Type assertion failed'
): asserts value is T {
  if (!validator(value)) {
    throw new TypeError(message);
  }
}

/**
 * 値が非nullであるとアサート
 *
 * @param value - 確認する値
 * @param message - エラーメッセージ
 * @throws {TypeError} nullまたはundefinedの場合
 */
export function assertNotNull<T>(
  value: T | null | undefined,
  message = 'Value cannot be null or undefined'
): asserts value is T {
  if (value === null || value === undefined) {
    throw new TypeError(message);
  }
}

/**
 * 値が文字列であるとアサート
 *
 * @param value - 確認する値
 * @param message - エラーメッセージ
 * @throws {TypeError} 文字列でない場合
 */
export function assertString(value: unknown, message = 'Value must be a string'): asserts value is string {
  if (!isString(value)) {
    throw new TypeError(message);
  }
}

/**
 * 値が配列であるとアサート
 *
 * @param value - 確認する値
 * @param message - エラーメッセージ
 * @throws {TypeError} 配列でない場合
 */
export function assertArray<T = unknown>(
  value: unknown,
  message = 'Value must be an array'
): asserts value is T[] {
  if (!Array.isArray(value)) {
    throw new TypeError(message);
  }
}

// =====================================================
// Utility Type Guards
// =====================================================

/**
 * 型ガードの論理積（AND）
 *
 * @param value - 確認する値
 * @param guards - タイプガード配列
 * @returns 全てのガードをパスする場合true
 */
export function and<T>(
  value: unknown,
  ...guards: Array<(v: unknown) => v is T>
): value is T {
  return guards.every(guard => guard(value));
}

/**
 * 型ガードの論理和（OR）
 *
 * @param value - 確認する値
 * @param guards - タイプガード配列
 * @returns いずれかのガードをパスする場合true
 */
export function or<T>(
  value: unknown,
  ...guards: Array<(v: unknown) => v is T>
): value is T {
  return guards.some(guard => guard(value));
}

/**
 * 型ガードの否定（NOT）
 *
 * @param value - 確認する値
 * @param guard - ネガティブにするタイプガード
 * @returns ガードをパスしない場合true
 */
export function not<T>(
  value: unknown,
  guard: (v: unknown) => v is T
): value is Exclude<T, unknown> {
  return !guard(value);
}

// =====================================================
// Common Type Guards for Supabase Tables
// =====================================================

/**
 * プロファイルタイプガード
 */
export function isProfile(value: unknown): value is Database['public']['Tables']['profiles']['Row'] {
  return (
    isSupabaseRow(value) &&
    'email' in value &&
    isString((value as any).email) &&
    'role' in value &&
    typeof (value as any).role === 'string'
  );
}

/**
 * 見積書タイプガード
 */
export function isQuotation(value: unknown): value is Database['public']['Tables']['quotations']['Row'] {
  return (
    isSupabaseRow(value) &&
    'quotation_number' in value &&
    isString((value as any).quotation_number) &&
    'status' in value &&
    typeof (value as any).status === 'string'
  );
}

/**
 * 注文タイプガード
 */
export function isOrder(value: unknown): value is Database['public']['Tables']['orders']['Row'] {
  return (
    isSupabaseRow(value) &&
    'order_number' in value &&
    isString((value as any).order_number) &&
    'status' in value &&
    typeof (value as any).status === 'string'
  );
}

// =====================================================
// Export for Testing
// =====================================================

/**
 * テスト用: カスタムタイプガード作成
 *
 * @internal テスト用のみ使用
 */
export function _createTypeGuard<T>(
  predicate: (value: unknown) => boolean
): (value: unknown) => value is T {
  return (value: unknown): value is T => predicate(value);
}

/**
 * テスト用: オブジェクト形状バリデータ作成
 *
 * @internal テスト用のみ使用
 */
export function _createShapeValidator<T extends Record<string, (v: unknown) => boolean>>(
  shape: T
): <S>(value: unknown) => value is { [K in keyof T]: T[K] extends (v: unknown) => v is infer U ? U : unknown } {
  return (value: unknown): value is any => {
    if (!isObject(value)) return false;

    for (const [key, validator] of Object.entries(shape)) {
      if (!(key in value) || !validator((value as any)[key])) {
        return false;
      }
    }

    return true;
  };
}
