# 機能ギャップと推奨事項

## 概要
このドキュメントは、EPackage Labホームページの機能実装状況を分析し、ギャップと推奨事項をまとめたものです。

## 🔴 機能ギャップ（未実装または不完全）

### 1. Supabase MCP統合が不完全
**現状**:
- `src/lib/supabase-mcp.ts` でMCPツールのラッパーを実装
- サーバーサイドでは「MCP tool is available directly」とコメントにあるが、実際のMCPツール呼び出しは実装されていない
- クライアントサイドからは `/api/supabase-mcp/execute` を経由してSQLを実行

**問題点**:
```typescript
// src/lib/supabase-mcp.ts (現在の実装)
if (typeof window === 'undefined') {
  // Server-side: MCP tool is available directly
  // We'll use the mcp__supabase-epackage__execute_sql tool
  // For now, fall through to the client implementation
}
```

サーバーサイドで実際のMCPツールを使用していません。

**推奨事項**:
```typescript
if (typeof window === 'undefined') {
  // サーバーサイドで実際にMCPツールを使用
  try {
    // mcp__supabase__execute_sql ツールを呼び出す
    const result = await executeSqlTool(query, params)
    return {
      data: result.data,
      rowsAffected: result.rowsAffected,
    }
  } catch (error) {
    console.error('[MCP] Server-side SQL execution error:', error)
    return {
      error: {
        message: error instanceof Error ? error.message : 'MCP execution failed',
        code: 'MCP_ERROR',
      },
    }
  }
}
```

### 2. APIルートの認証・認可が不十分
**現状**:
- 多くのAPIルートで認証チェックが不完全
- 管理者権限の確認が一貫していない

**例**: `src/app/api/admin/quotations/route.ts`

**推奨事項**:
```typescript
// 認証ミドルウェアを作成
export async function requireAuth(request: NextRequest) {
  const session = await getSession(request)
  if (!session) {
    throw new AuthError('Unauthorized')
  }
  return session
}

export async function requireAdmin(request: NextRequest) {
  const session = await requireAuth(request)
  const profile = await auth.getProfile(session.user.id)
  if (!profile || profile.role !== 'ADMIN' || profile.status !== 'ACTIVE') {
    throw new AuthError('Forbidden: Admin access required')
  }
  return session
}

// APIルートで使用
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request) // 管理者権限を確認
    // ... 通常の処理
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { message: error.message, code: 'AUTH_ERROR' } },
        { status: error.message.includes('Admin') ? 403 : 401 }
      )
    }
    throw error
  }
}
```

### 3. エラーハンドリングが不統一
**現状**:
- エラーレスポンスの形式がAPIルートによって異なる
- 適切なHTTPステータスコードが使用されていない場合がある

**推奨事項**:
```typescript
// 統一エラーレスポンス関数
export function apiError(error: unknown, status: number = 500) {
  console.error('[API Error]', error)

  const message = error instanceof Error ? error.message : 'An unexpected error occurred'

  return NextResponse.json(
    {
      error: {
        message,
        code: status === 500 ? 'INTERNAL_ERROR' : 'API_ERROR',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error instanceof Error ? error.stack : undefined,
        }),
      },
    },
    { status }
  )
}

// 使用例
export async function POST(request: NextRequest) {
  try {
    // ... 処理
  } catch (error) {
    return apiError(error, error instanceof ValidationError ? 400 : 500)
  }
}
```

### 4. バリデーションが不十分
**現状**:
- リクエストボディのバリデーションが一貫していない
- Zodスキーマが定義されているが使用されていないAPIがある

**推奨事項**:
```typescript
// 共通バリデーションスキーマ
import { z } from 'zod'

export const quotationSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required'),
  customer_email: z.string().email('Invalid email address'),
  customer_phone: z.string().optional(),
  items: z.array(z.object({
    product_name: z.string().min(1),
    quantity: z.number().int().positive(),
    unit_price: z.number().nonnegative(),
  })).min(1, 'At least one item is required'),
})

// APIルートで使用
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = quotationSchema.parse(body)
    // ... 処理
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.errors,
          },
        },
        { status: 400 }
      )
    }
    throw error
  }
}
```

## 🟡 改善推奨事項

### 1. ページネーションの標準化
**現状**:
- ページネーション実装がAPIルートごとに異なる
- カーソルベースのページネーションとオフセットベースが混在

**推奨事項**:
```typescript
// 統一ページネーションインターフェース
export interface PaginationParams {
  page?: number
  limit?: number
  cursor?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    hasMore: boolean
    nextCursor?: string
  }
}

// 共通ページネーションヘルパー
export async function paginateQuery<T>(
  query: any,
  params: PaginationParams
): Promise<PaginatedResponse<T>> {
  const page = params.page || 1
  const limit = Math.min(params.limit || 10, 100)
  const offset = (page - 1) * limit

  const { data, error, count } = await query
    .range(offset, offset + limit - 1)
    .select('*', { count: 'exact' })

  if (error) throw error

  return {
    data: data || [],
    pagination: {
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit,
    },
  }
}
```

### 2. キャッシュ戦略の実装
**現状**:
- APIレスポンスのキャッシュが不十分
- 静的データのキャッシュが利用されていない

**推奨事項**:
```typescript
// APIルートでキャッシュを使用
export async function GET(request: NextRequest) {
  // 公開データはキャッシュ
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/products?category=${category}`,
    {
      next: {
        revalidate: 3600, // 1時間キャッシュ
        tags: ['products', category ? `category-${category}` : 'all'],
      },
    }
  )

  return response
}
```

### 3. 型定義の整理
**現状**:
- 型定義が複数のファイルに分散
- `@ts-ignore` が複数箇所で使用されている

**推奨事項**:
```typescript
// 共通型定義ファイルの作成
// src/types/api.ts
export interface ApiResponse<T> {
  data?: T
  error?: {
    message: string
    code: string
    details?: unknown
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
}

export interface PaginationInfo {
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// src/types/entities.ts
export interface User {
  id: string
  email: string
  profile: Profile
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
}
```

### 4. ロギングの実装
**現状**:
- エラーログが `console.error` に依存
- 構造化されたログが実装されていない

**推奨事項**:
```typescript
// src/lib/logger.ts
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  timestamp: string
  userId?: string
  requestId?: string
}

export function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  }

  // 開発環境ではコンソールに出力
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${level.toUpperCase()}]`, message, context)
  }

  // 本番環境ではログサービスに送信
  if (process.env.NODE_ENV === 'production') {
    // 外部ログサービス（Sentry、DataDogなど）に送信
    sendToLogService(entry)
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => log(LogLevel.DEBUG, message, context),
  info: (message: string, context?: Record<string, unknown>) => log(LogLevel.INFO, message, context),
  warn: (message: string, context?: Record<string, unknown>) => log(LogLevel.WARN, message, context),
  error: (message: string, context?: Record<string, unknown>) => log(LogLevel.ERROR, message, context),
}
```

## 🟢 パフォーマンス最適化

### 1. データベースクエリの最適化
**現状**:
- N+1クエリの問題がある可能性
- 過剰なデータ取得

**推奨事項**:
```typescript
// 悪い例
const orders = await supabase.from('orders').select('*')
for (const order of orders.data || []) {
  const items = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)
}

// 良い例
const orders = await supabase
  .from('orders')
  .select(`
    id,
    order_number,
    status,
    total_amount,
    order_items (
      id,
      product_name,
      quantity,
      unit_price,
      total_price
    )
  `)
```

### 2. 画像最適化
**現状**:
- Next.js Imageコンポーネントの使用が不十分

**推奨事項**:
```typescript
import Image from 'next/image'

// 悪い例
<img src="/products/image.jpg" alt="Product" width={500} height={500} />

// 良い例
<Image
  src="/products/image.jpg"
  alt="Product"
  width={500}
  height={500}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### 3. コード分割
**現状**:
- 大きなコンポーネントが分割されていない

**推奨事項**:
```typescript
// 動的インポートを使用
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false,
})

export default function Page() {
  return <HeavyComponent />
}
```

### 4. バンドルサイズの最適化
**現状**:
- 依存関係が多岐にわたる

**推奨事項**:
```json
{
  "sideEffects": false,
  "modules": {
    "lodash-es": false
  }
}
```

## 🔧 テストカバレッジ

### 現状
- テストファイルが存在するが、カバレッジが不明
- E2Eテストが実装されている

### 推奨事項
1. **ユニットテスト**: ビジネスロジックのテストカバレッジを80%以上に
2. **統合テスト**: APIルートのテストを追加
3. **E2Eテスト**: 主要なユーザーフローをカバー

## 📊 モニタリング

### 現状
- Web Vitalsの記録は実装されている
- エラートラッキングは不十分

### 推奨事項
1. **パフォーマンスモニタリング**: Web Vitalsをダッシュボードで可視化
2. **エラートラッキング**: Sentryまたは類似のサービスを導入
3. **ユーザー行動分析**: Google Analyticsまたはプライベート分析

## 🎯 優先事項

### 緊急（1週間以内）
1. SQLインジェクション対策
2. APIルートの認証・認可の強化
3. エラーハンドリングの統一

### 重要（1ヶ月以内）
1. Supabase MCP統合の完了
2. バリデーションの標準化
3. レート制限の実装
4. ロギングの実装

### 通常（3ヶ月以内）
1. ページネーションの標準化
2. キャッシュ戦略の実装
3. 型定義の整理
4. パフォーマンス最適化
5. テストカバレッジの向上
6. モニタリングの強化

## まとめ

このプロジェクトは、包括的なB2B Eコマースプラットフォームとしての機能を持っていますが、以下の点で改善が必要です：

1. **セキュリティ**: SQLインジェクション対策、認証・認可の強化
2. **Supabase MCP統合**: サーバーサイドでのMCPツール使用の実装
3. **コード品質**: エラーハンドリング、バリデーション、型安全性の向上
4. **パフォーマンス**: クエリ最適化、キャッシュ、コード分割
5. **運用**: ロギング、モニタリング、テストカバレッジ

これらの改善を実装することで、より堅牢でセキュアなアプリケーションになります。
