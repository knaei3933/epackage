# EPackage Lab セキュリティ改善 LLD

> 作成日: 2026-01-18
> バージョン: 1.0

## 📐 設計概要

本ドキュメントはセキュリティ改善の詳細設計を記述します。

---

## 1. SQLインジェクション防止設計

### 1.1 現状問題

```typescript
// src/lib/supabase-sql.ts:259-305 (危険)
export async function insertQuotationItems(items: QuotationItemInput[]): Promise<SqlResult> {
  const valuesClauses = items.map((item) => {
    return `(
      '${item.quotation_id}',
      '${item.product_name.replace(/'/g, "''")}',  // 不十分
      ${item.category ? `'${item.category.replace(/'/g, "''")}'` : 'NULL'},
      ...
    )`;
  }).join(',\n');

  return executeSql(`INSERT INTO quotation_items (...) VALUES ${valuesClauses}`, []);
}
```

**問題点**:
1. 文字列補間でSQL構成
2. `replace(/'/g, "''")`のみでエスケープ（不十分）
3. 数値やNULLのエスケープ不備
4. Unicode/マルチバイト文字の考慮不足

### 1.2 解決設計

#### 新関数: `insertQuotationItemsSafe`

```typescript
/**
 * パラメータ化クエリを使用した安全な見積アイテム挿入
 *
 * @param items - 挿入する見積アイテム配列
 * @returns SqlResult
 */
export async function insertQuotationItemsSafe(
  items: Array<{
    quotation_id: string;
    display_order: number;
    product_name: string;
    category: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
    specifications: string | null;
    notes: string | null;
  }>
): Promise<SqlResult> {
  // 既存のexecuteTransaction関数を活用
  const queries = items.map((item) => ({
    query: `
      INSERT INTO quotation_items (
        quotation_id, display_order, product_name, category,
        quantity, unit_price, total_price, specifications, notes, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    `,
    params: [
      item.quotation_id,
      item.display_order,
      item.product_name,
      item.category,
      item.quantity,
      item.unit_price,
      item.total_price,
      item.specifications,
      item.notes,
    ] as (string | number | boolean | null)[],
  }));

  return executeTransaction(queries);
}
```

#### 既存関数: `executeTransaction`

```typescript
// src/lib/supabase-sql.ts:123-147
export async function executeTransaction<T = unknown>(
  queries: Array<{ query: string; params?: (string | number | boolean | null)[] }>
): Promise<SqlResult<T>> {
  try {
    const supabase = createServiceClient();

    // トランザクションクエリ構築
    const transactionQuery = queries
      .map((q, i) => `-- Query ${i + 1}\n${q.query}`)
      .join(';\n');

    const allParams = queries.flatMap((q) => q.params ?? []);

    return executeSql<T>(transactionQuery, allParams);
  } catch (error) {
    console.error('[executeTransaction] Error:', error);

    return {
      error: {
        message: error instanceof Error ? error.message : 'Transaction failed',
        code: 'TRANSACTION_ERROR',
      },
    };
  }
}
```

### 1.3 移行計画

```typescript
// 従来の関数を安全な実装に置き換え
export const insertQuotationItems = insertQuotationItemsSafe;

// @deprecated アトミクスイッチ用
export async function insertQuotationItemsLegacy(...): Promise<SqlResult> {
  // 元の危険な実装（削除予定）
}
```

---

## 2. MCP APIセキュリティ設計

### 2.1 現状問題

```typescript
// src/app/api/supabase-mcp/execute/route.ts (危険)
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { query, params } = body

  // 認証なし！誰でもSQL実行可能
  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('execute_sql', {
    sql_query: query,
    sql_params: params,
  })

  return NextResponse.json({ data })
}
```

### 2.2 解決設計

#### 認証レイヤー

```typescript
import { verifyAdminAuth } from '@/lib/auth-helpers'
import { isProductionEnvironment } from '@/lib/env-validation'

export async function POST(request: NextRequest) {
  // ==================== レイヤー1: 認証 ====================
  const authResult = await verifyAdminAuth(request)
  if (!authResult) {
    return NextResponse.json(
      { error: 'Admin authentication required' },
      { status: 401 }
    )
  }

  // ==================== レイヤー2: SQL安全検証 ====================
  const body: ExecuteRequest = await request.json()
  const { query, params = [] } = body

  // 2.1 クエリ長制限
  if (query.length > 10000) {
    return NextResponse.json(
      { error: { message: 'Query too long', code: 'QUERY_TOO_LONG' } },
      { status: 400 }
    )
  }

  // 2.2 危険なSQLキーワード検出
  const dangerousKeywords = [
    'DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'GRANT', 'REVOKE',
    'CREATE', 'INSERT', 'UPDATE', 'EXECUTE', 'SCRIPT'
  ]

  const upperQuery = query.toUpperCase()
  for (const keyword of dangerousKeywords) {
    if (upperQuery.includes(keyword)) {
      // ログ記録
      console.warn('[MCP] Dangerous SQL keyword detected:', {
        userId: authResult.userId,
        keyword,
        query: query.substring(0, 100),
      })

      return NextResponse.json(
        { error: { message: `Dangerous SQL keyword: ${keyword}`, code: 'DANGEROUS_SQL' } },
        { status: 403 }
      )
    }
  }

  // 2.3 SQLインジェクションパターン検出
  const injectionPatterns = [
    /--/,           // SQLコメント
    /\/\*/,         // 複数行コメント開始
    /\*\/,         // 複数行コメント終了
    /;\s*DROP/,    // コメント後のDROP
    /'/,            // クオート（パラメータ化のみ許可）
  ]

  for (const pattern of injectionPatterns) {
    if (pattern.test(query)) {
      console.warn('[MCP] SQL injection pattern detected:', {
        userId: authResult.userId,
        pattern: pattern.source,
      })

      return NextResponse.json(
        { error: { message: 'Invalid SQL pattern detected', code: 'INVALID_SQL' } },
        { status: 403 }
      )
    }
  }

  // ==================== レイヤー3: SQL実行（安全） ====================
  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('execute_sql', {
    sql_query: query,
    sql_params: params,
  })

  // ==================== レイヤー4: 監査ログ ====================
  console.log('[MCP] SQL execution:', {
    userId: authResult.userId,
    role: authResult.role,
    isDevMode: authResult.isDevMode,
    queryLength: query.length,
    paramCount: params.length,
    success: !error,
    timestamp: new Date().toISOString(),
  })

  if (error) {
    return NextResponse.json(
      { error: { message: error.message, code: error.code || 'SQL_ERROR' } },
      { status: 400 }
    )
  }

  return NextResponse.json({
    data: Array.isArray(data) ? data : [data],
    rowsAffected: data?.length ?? 0,
  })
}
```

### 2.3 環境変数検証

```typescript
// src/lib/env-validation.ts (新規)
/**
 * 本番環境検証
 *
 * @returns {boolean} 本番環境の場合true
 */
export function isProductionEnvironment(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_APP_URL?.includes('prod') ||
    process.env.NEXT_PUBLIC_APP_URL?.includes('example.com') ||
    !process.env.NEXT_PUBLIC_APP_URL?.includes('localhost')
  )
}

/**
 * 開発モード安全検証
 *
 * 本番環境で開発モードが有効になっている場合、エラーを投げる
 */
export function validateDevModeSafety(): void {
  const isProd = isProductionEnvironment()
  const devModeEnabled = process.env.ENABLE_DEV_MOCK_AUTH === 'true'

  if (isProd && devModeEnabled) {
    throw new Error(
      'CRITICAL: Dev mode (ENABLE_DEV_MOCK_AUTH) is enabled in production environment.\n' +
      'This is a security risk. Please disable ENABLE_DEV_MOCK_AUTH in production.'
    )
  }
}

// サーバー起動時に検証実行
if (typeof window === 'undefined') {
  validateDevModeSafety()
}
```

---

## 3. 開発モードセキュリティ強化

### 3.1 多重環境検証レイヤー

```typescript
// src/lib/dev-mode.ts (拡張)
import { validateDevModeSafety, isProductionEnvironment } from './env-validation'

/**
 * SECURE: 開発モード検証（強化版）
 *
 * 検証レイヤー:
 * 1. NODE_ENV === 'development'
 * 2. ENABLE_DEV_MOCK_AUTH === 'true'
 * 3. プロダクション環境でないこと
 * 4. localhost接続であること
 */
export function isDevMode(): boolean {
  // サーバーサイドのみ
  if (typeof window !== 'undefined') {
    return false
  }

  // レイヤー1: 基本検証
  if (process.env.NODE_ENV !== 'development') {
    return false
  }

  // レイヤー2: 環境変数検証
  if (process.env.ENABLE_DEV_MOCK_AUTH !== 'true') {
    return false
  }

  // レイヤー3: プロダクション検証
  if (isProductionEnvironment()) {
    console.error('[SECURITY] Dev mode blocked in production environment')
    return false
  }

  return true
}
```

---

## 4. 認証ミドルウェア統合設計

### 4.1 共通認証ミドルウェア

```typescript
// src/lib/api-auth.ts (新規)
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth, type AdminAuthResult } from './auth-helpers'

/**
 * 認証ミドルウェアタイプ
 */
export type AuthMiddlewareOptions = {
  requireAdmin?: boolean
  requireMember?: boolean
  requireActive?: boolean
}

/**
 * APIルート用認証ミドルウェア作成
 */
export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  return async (request: NextRequest): Promise<AdminAuthResult | NextResponse> => {
    const authResult = await verifyAdminAuth(request)

    if (!authResult) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 管理者ロール確認
    if (options.requireAdmin && authResult.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin role required' },
        { status: 403 }
      )
    }

    // アクティブ状態確認
    if (options.requireActive && authResult.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Account not active' },
        { status: 403 }
      )
    }

    return authResult
  }
}

/**
 * APIハンドラー認証ラッパー
 */
export function withAuth<T = any>(
  handler: (request: NextRequest, auth: AdminAuthResult) => Promise<NextResponse<T>>,
  options: AuthMiddlewareOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const middleware = createAuthMiddleware(options)
    const result = await middleware(request)

    // 認証失敗の場合、エラー応答を返す
    if (result instanceof NextResponse) {
      return result
    }

    // 認証成功の場合、ハンドラーを実行
    return handler(request, result as AdminAuthResult)
  }
}
```

### 4.2 使用例

```typescript
// 既存APIルートの移行
import { withAuth } from '@/lib/api-auth'

// 移行前
export async function POST(request: NextRequest) {
  const authResult = await verifyAdminAuth(request)
  if (!authResult) return unauthorizedResponse()
  // ...
}

// 移行後
export const POST = withAuth(async (request, auth) => {
  // auth.userId, auth.role, auth.status が利用可能
  return NextResponse.json({ userId: auth.userId })
}, { requireAdmin: true, requireActive: true })
```

---

## 5. タイプガード設計

### 5.1 タイプガードユーティリティ

```typescript
// src/lib/type-guards.ts (新規)

/**
 * データベース行タイプガード
 */
export function isDbRow<T>(value: unknown, validator: (v: any) => v is T): value is T {
  return typeof value === 'object' && value !== null && validator(value)
}

/**
 * タイプアサーション（安全）
 */
export function assertType<T>(
  value: unknown,
  validator: (v: any) => v is T,
  message = 'Type assertion failed'
): asserts value is T {
  if (!validator(value)) {
    throw new TypeError(message)
  }
}

/**
 * 配列タイプガード
 */
export function isArray<T>(value: unknown, validator?: (v: any) => v is T): value is T[] {
  if (!Array.isArray(value)) return false

  if (validator) {
    return value.every(item => validator(item))
  }

  return true
}

/**
 * UUID検証
 */
export function isUUID(value: unknown): value is string {
  if (typeof value !== 'string') return false

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  return uuidRegex.test(value)
}

/**
 * Supabase行タイプガード
 */
export function isSupabaseRow<T>(
  value: unknown
): value is { id: string } & T {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    isUUID((value as any).id)
  )
}
```

---

## 6. エラーハンドリング設計

### 6.1 標準エラークラス

```typescript
// src/lib/api-error-handler.ts (新規)

/**
 * APIエラークラス
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * エラーハンドラー
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      },
      { status: error.statusCode }
    )
  }

  // 予期しないエラー
  console.error('[API] Unexpected error:', error)

  return NextResponse.json(
    {
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    },
    { status: 500 }
  )
}

/**
 * APIハンドラーラッパー（自動エラー処理）
 */
export function withApiHandler<T = any>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    try {
      return await handler(request)
    } catch (error) {
      return handleApiError(error)
    }
  }
}
```

---

## 7. 検証スキーマ設計

### 7.1 Zod共通スキーマ

```typescript
// src/lib/validation-schemas.ts (新規)
import { z } from 'zod'

/**
 * UUIDスキーマ
 */
export const uuidSchema = z.string().uuid()

/**
 * メールアドレススキーマ
 */
export const emailSchema = z.string().email()

/**
 * 電話番号スキーマ（日本）
 */
export const phoneSchema = z.string().regex(
  /^(0\d{1,4}-\d{1,4}-\d{4}|0\d{9,10})$/,
  'Invalid phone number format'
)

/**
 * ページネーションスキーマ
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

/**
 * SQLクエリ安全スキーマ
 */
export const sqlQuerySchema = z.object({
  query: z.string().max(10000).refine(
    (q) => !['DROP', 'DELETE', 'TRUNCATE'].some(kw => q.toUpperCase().includes(kw)),
    'Dangerous SQL keyword detected'
  ),
  params: z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])).default([]),
})

/**
 * 型エクスポート
 */
export type PaginationParams = z.infer<typeof paginationSchema>
export type SqlQueryParams = z.infer<typeof sqlQuerySchema>
```

---

## 8. ロールバック戦略

### 8.1 フィーチャーフラグ

```bash
# .env
USE_PARAMETERIZED_QUERIES=true
MCP_AUTH_REQUIRED=true
STRICT_ENV_VALIDATION=true
UNIFIED_AUTH_MIDDLEWARE=true
```

### 8.2 条件付きインポート

```typescript
// 安全な実装（デフォルト）
export const insertQuotationItems = insertQuotationItemsSafe

// レガシー実装（ロールバック用）
if (process.env.USE_PARAMETERIZED_QUERIES !== 'true') {
  console.warn('[SECURITY] Using legacy (unsafe) SQL implementation')
  // export const insertQuotationItems = insertQuotationItemsLegacy
}
```

---

## 9. テスト設計

### 9.1 SQLインジェクションテスト

```typescript
describe('insertQuotationItems', () => {
  it('should prevent SQL injection', async () => {
    const maliciousItems = [{
      quotation_id: "'; DROP TABLE quotations; --",
      product_name: "'; DELETE FROM users; --",
      // ...
    }]

    const result = await insertQuotationItems(maliciousItems)

    // データが正しくエスケープされ、SQLとして実行されない
    expect(result.error).toBeUndefined()
    expect(result.data).toBeDefined()
  })
})
```

### 9.2 MCP APIセキュリティテスト

```typescript
describe('/api/supabase-mcp/execute', () => {
  it('should reject unauthenticated requests', async () => {
    const response = await fetch('/api/supabase-mcp/execute', {
      method: 'POST',
      body: JSON.stringify({ query: 'SELECT * FROM users' }),
    })

    expect(response.status).toBe(401)
  })

  it('should reject dangerous SQL keywords', async () => {
    const authenticatedRequest = // 認証済みリクエスト

    const response = await authenticatedRequest.fetch('/api/supabase-mcp/execute', {
      method: 'POST',
      body: JSON.stringify({ query: 'DROP TABLE users' }),
    })

    expect(response.status).toBe(403)
  })
})
```

---

## 10. 移行ロードマップ

### フェーズ1 (Week 1): 致命的脆弱性修正
1. `insertQuotationItemsSafe`実装
2. MCP API認証追加
3. 環境検証強化

### フェーズ2 (Week 2): 認証標準化
1. `api-auth.ts`作成
2. 優先度の高いAPIルート（10個）に適用
3. テストと検証

### フェーズ3 (Week 3): タイプ安全性
1. `type-guards.ts`作成
2. `@ts-ignore`を50%削除
3. Zod検証導入

### フェーズ4 (Week 4): 完了と検証
1. 残り50%の`@ts-ignore`削除
2. 全APIルート認証統合
3. E2Eテスト実行
4. TypeScript strictモード有効化

---

以上
