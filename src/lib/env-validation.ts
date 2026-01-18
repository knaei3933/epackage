/**
 * Environment Validation Utilities
 *
 * セキュアな環境変数検証と開発モード安全チェック
 * Security: サーバーサイドのみで実行される検証関数
 *
 * @module lib/env-validation
 */

// =====================================================
// Environment Detection
// =====================================================

/**
 * プロダクション環境検出
 *
 * 多重検証レイヤーでプロダクション環境を判定
 *
 * @returns {boolean} プロダクション環境の場合true
 *
 * @example
 * ```typescript
 * if (isProductionEnvironment()) {
 *   console.log('Running in production');
 * }
 * ```
 */
export function isProductionEnvironment(): boolean {
  // レイヤー1: NODE_ENVチェック
  if (process.env.NODE_ENV === 'production') {
    return true;
  }

  // レイヤー2: APP_URLチェック
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    // プロダクションとみなされるパターン
    const productionPatterns = [
      'prod',
      'production',
      'example.com', // デフォルトドメイン（プロダクションで使用される）
    ];

    const lowerUrl = appUrl.toLowerCase();
    if (productionPatterns.some(pattern => lowerUrl.includes(pattern))) {
      return true;
    }

    // localhostでない場合、プロダクションとみなす
    if (!lowerUrl.includes('localhost') && !lowerUrl.includes('127.0.0.1')) {
      return true;
    }
  }

  // レイヤー3: VERCEL_ENVチェック
  if (process.env.VERCEL_ENV === 'production') {
    return true;
  }

  return false;
}

/**
 * 開発環境検出
 *
 * @returns {boolean} 開発環境の場合true
 */
export function isDevelopmentEnvironment(): boolean {
  return process.env.NODE_ENV === 'development';
}

// =====================================================
// Dev Mode Safety Validation
// =====================================================

/**
 * 開発モード安全検証
 *
 * プロダクション環境で開発モードが有効になっている場合、エラーを投げる
 * この関数はサーバー起動時に呼び出すことを推奨
 *
 * @throws {Error} プロダクション環境で開発モードが有効な場合
 *
 * @example
 * ```typescript
 * // サーバー起動時
 * import { validateDevModeSafety } from '@/lib/env-validation';
 * validateDevModeSafety();
 * ```
 */
export function validateDevModeSafety(): void {
  const isProd = isProductionEnvironment();
  const devModeEnabled = process.env.ENABLE_DEV_MOCK_AUTH === 'true';

  if (isProd && devModeEnabled) {
    throw new Error(
      'CRITICAL: Dev mode (ENABLE_DEV_MOCK_AUTH) is enabled in production environment.\n' +
      'This is a security risk. Please disable ENABLE_DEV_MOCK_AUTH in production.\n' +
      '\n' +
      'Current settings:\n' +
      `  - NODE_ENV: ${process.env.NODE_ENV}\n` +
      `  - NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL}\n` +
      `  - ENABLE_DEV_MOCK_AUTH: ${process.env.ENABLE_DEV_MOCK_AUTH}\n` +
      `  - VERCEL_ENV: ${process.env.VERCEL_ENV}\n` +
      '\n' +
      'Action required: Set ENABLE_DEV_MOCK_AUTH to "false" or remove it from production environment.'
    );
  }
}

/**
 * 開発モード安全チェック（エラーを投げないバージョン）
 *
 * @returns {boolean} 安全な場合true、危険な場合false
 */
export function isDevModeSafe(): boolean {
  try {
    validateDevModeSafety();
    return true;
  } catch {
    return false;
  }
}

// =====================================================
// Environment Variable Validation
// =====================================================

/**
 * 必須環境変数の検証
 *
 * @param {string[]} requiredVars - 必須環境変数名の配列
 * @returns {{ valid: boolean; missing: string[] }}
 *
 * @example
 * ```typescript
 * const result = validateRequiredEnvVars([
 *   'NEXT_PUBLIC_SUPABASE_URL',
 *   'NEXT_PUBLIC_SUPABASE_ANON_KEY',
 *   'SUPABASE_SERVICE_ROLE_KEY'
 * ]);
 *
 * if (!result.valid) {
 *   console.error('Missing required environment variables:', result.missing);
 * }
 * ```
 */
export function validateRequiredEnvVars(requiredVars: string[]): {
  valid: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Supabase環境変数検証
 *
 * @returns {{ valid: boolean; missing: string[]; invalid: string[] }}
 */
export function validateSupabaseEnv(): {
  valid: boolean;
  missing: string[];
  invalid: string[];
} {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const optional = [
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const result = validateRequiredEnvVars(required);
  const invalid: string[] = [];

  // URL形式検証
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      new URL(supabaseUrl);
    } catch {
      invalid.push('NEXT_PUBLIC_SUPABASE_URL (invalid URL format)');
    }
  }

  return {
    valid: result.valid && invalid.length === 0,
    missing: result.missing,
    invalid,
  };
}

// =====================================================
// Feature Flags
// =====================================================

/**
 * フィーチャーフラグ検証
 *
 * @param {string} flagName - フラグ名
 * @returns {boolean} フラグが有効な場合true
 */
export function isFeatureEnabled(flagName: string): boolean {
  const flagValue = process.env[flagName];
  return flagValue === 'true' || flagValue === '1';
}

/**
 * セキュリティフィーチャーフラグ
 */
export const SECURITY_FLAGS = {
  /** パラメータ化クエリを使用 */
  USE_PARAMETERIZED_QUERIES: isFeatureEnabled('USE_PARAMETERIZED_QUERIES'),

  /** MCP API認証必須 */
  MCP_AUTH_REQUIRED: isFeatureEnabled('MCP_AUTH_REQUIRED'),

  /** 厳密な環境変数検証 */
  STRICT_ENV_VALIDATION: isFeatureEnabled('STRICT_ENV_VALIDATION'),

  /** 統合認証ミドルウェア */
  UNIFIED_AUTH_MIDDLEWARE: isFeatureEnabled('UNIFIED_AUTH_MIDDLEWARE'),
} as const;

// =====================================================
// Startup Validation
// =====================================================

/**
 * サーバー起動時検証
 *
 * 開発モードの安全チェックと必須環境変数の検証を実行
 * この関数はアプリケーションのエントリーポイントで呼び出す
 *
 * @throws {Error} 検証失敗時
 *
 * @example
 * ```typescript
 * // src/app/layout.tsx または server.ts
 * import { validateOnStartup } from '@/lib/env-validation';
 * validateOnStartup();
 * ```
 */
export function validateOnStartup(): void {
  // クライアントサイドでは実行しない
  if (typeof window !== 'undefined') {
    return;
  }

  console.log('[ENV] Validating environment configuration...');

  // 1. 開発モード安全検証
  try {
    validateDevModeSafety();
    console.log('[ENV] ✓ Dev mode safety check passed');
  } catch (error) {
    console.error('[ENV] ✗ Dev mode safety check failed:', error);
    throw error;
  }

  // 2. 必須環境変数検証
  const supabaseEnv = validateSupabaseEnv();
  if (!supabaseEnv.valid) {
    const errors = [
      ...supabaseEnv.missing.map(v => `Missing: ${v}`),
      ...supabaseEnv.invalid.map(v => v),
    ];
    console.error('[ENV] ✗ Supabase environment validation failed:', errors);
    throw new Error(`Invalid environment configuration:\n${errors.join('\n')}`);
  }
  console.log('[ENV] ✓ Supabase environment validation passed');

  // 3. セキュリティフィーチャーフラグログ
  console.log('[ENV] Security feature flags:', {
    USE_PARAMETERIZED_QUERIES: SECURITY_FLAGS.USE_PARAMETERIZED_QUERIES,
    MCP_AUTH_REQUIRED: SECURITY_FLAGS.MCP_AUTH_REQUIRED,
    STRICT_ENV_VALIDATION: SECURITY_FLAGS.STRICT_ENV_VALIDATION,
    UNIFIED_AUTH_MIDDLEWARE: SECURITY_FLAGS.UNIFIED_AUTH_MIDDLEWARE,
  });

  // 4. 環境情報ログ（機密情報なし）
  console.log('[ENV] Environment info:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    isProduction: isProductionEnvironment(),
    isDevelopment: isDevelopmentEnvironment(),
  });

  console.log('[ENV] ✓ All validations passed');
}

// =====================================================
// Export for Testing
// =====================================================

/**
 * テスト用: 環境変数を一時的に設定
 *
 * @internal テスト用のみ使用
 */
export function _setTestEnv(vars: Record<string, string>): void {
  if (process.env.NODE_ENV !== 'test') {
    console.warn('[ENV] _setTestEnv should only be used in test environment');
  }

  for (const [key, value] of Object.entries(vars)) {
    process.env[key] = value;
  }
}

/**
 * テスト用: 環境変数をクリア
 *
 * @internal テスト用のみ使用
 */
export function _clearTestEnv(...vars: string[]): void {
  if (process.env.NODE_ENV !== 'test') {
    console.warn('[ENV] _clearTestEnv should only be used in test environment');
  }

  for (const varName of vars) {
    delete process.env[varName];
  }
}
