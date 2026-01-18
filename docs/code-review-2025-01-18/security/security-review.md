# セキュリティレビュー

## 概要
このドキュメントは、EPackage Labホームページのセキュリティ状況を分析したものです。

## 🔴 クリティカルな問題（必須修正）

### 1. 開発モード認証が本番環境に漏れる可能性
**ファイル**: `src/lib/supabase.ts`

```typescript
if (process.env.NODE_ENV === 'development' && process.env.ENABLE_DEV_MOCK_AUTH === 'true') {
  // モック認証処理
}
```

**問題点**:
- `NODE_ENV` のチェックだけでは不十分（本番環境でも開発モードになる可能性）
- 環境変数の不適切な設定により、本番環境でモック認証が有効になる可能性

**推奨事項**:
```typescript
const isDevMode = (
  process.env.NODE_ENV === 'development' &&
  process.env.ENABLE_DEV_MOCK_AUTH === 'true' &&
  process.env.NEXT_PUBLIC_APP_ENV !== 'production'
)

if (isDevMode) {
  // モック認証処理
}
```

### 2. サービスロールキーの不適切な使用
**ファイル**: `src/lib/supabase.ts`

```typescript
export const createServiceClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase service credentials not configured')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
```

**問題点**:
- サービスロールキーがクライアントサイドに漏れる可能性
- エラーメッセージにキー情報が含まれる可能性

**推奨事項**:
- サービスロールキーを環境変数からのみ読み込む
- エラーメッセージから機密情報を除外
- APIルートでのみ使用することを明示

### 3. SQLインジェクションのリスク
**ファイル**: `src/app/api/supabase-mcp/execute/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const { query, params = [] } = body

  const { data, error, count } = await supabase.rpc('execute_sql', {
    sql_query: query,
    sql_params: params,
  })
}
```

**問題点**:
- 任意のSQLを実行できるAPIエンドポイント
- 認証・認可のチェックがない
- 管理者権限でのSQL実行が可能

**推奨事項**:
```typescript
export async function POST(request: NextRequest) {
  // 認証チェック
  const session = await getSession(request)
  if (!session || !isAdmin(session.user.id)) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    )
  }

  // SQLクエリのバリデーション
  const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE']
  const upperQuery = query.toUpperCase()
  if (dangerousKeywords.some(keyword => upperQuery.includes(keyword))) {
    return NextResponse.json(
      { error: { message: 'Dangerous SQL query detected', code: 'DANGEROUS_QUERY' } },
      { status: 403 }
    )
  }

  // クエリ実行
}
```

### 4. クロスサイトスクリプティング（XSS）のリスク
**ファイル**: `src/lib/b2b-db.ts`

```typescript
const shippingAddress: Address | null = data.shipping_address
  ? data.shipping_address as unknown as Address
  : null;
```

**問題点**:
- 型アサーションを使用してデータベースのJSONを直接キャスト
- バリデーションなしでユーザーデータを信頼

**推奨事項**:
```typescript
function validateAddress(data: unknown): Address | null {
  if (!data || typeof data !== 'object') return null

  const addr = data as Record<string, unknown>
  // 必須フィールドのバリデーション
  if (
    typeof addr.postalCode !== 'string' ||
    typeof addr.prefecture !== 'string' ||
    typeof addr.city !== 'string' ||
    typeof addr.addressLine1 !== 'string' ||
    typeof addr.company !== 'string' ||
    typeof addr.contactName !== 'string' ||
    typeof addr.phone !== 'string'
  ) {
    return null
  }

  // サニタイズ
  return {
    postalCode: addr.postalCode.trim(),
    prefecture: addr.prefecture.trim(),
    city: addr.city.trim(),
    addressLine1: addr.addressLine1.trim(),
    addressLine2: addr.addressLine2?.trim() || '',
    company: addr.company.trim(),
    contactName: addr.contactName.trim(),
    phone: addr.phone.trim(),
  }
}

const shippingAddress = validateAddress(data.shipping_address)
```

## 🟡 警告（修正推奨）

### 1. エラーメッセージからの情報漏洩
**ファイル**: `src/lib/supabase-mcp.ts`

```typescript
return {
  error: {
    message: error instanceof Error ? error.message : 'Unknown error',
    code: 'EXECUTE_ERROR',
  },
}
```

**問題点**:
- エラーメッセージにデータベース構造情報が含まれる可能性
- ユーザーに内部エラーを公開している

**推奨事項**:
```typescript
// 開発環境のみ詳細なエラーを表示
const errorMessage = process.env.NODE_ENV === 'development'
  ? error instanceof Error ? error.message : 'Unknown error'
  : 'An error occurred while processing your request'

return {
  error: {
    message: errorMessage,
    code: 'EXECUTE_ERROR',
  },
}
```

### 2. レート制限の欠如
**ファイル**: 複数のAPIルート

**問題点**:
- APIルートにレート制限がない
- DoS攻撃に対して脆弱

**推奨事項**:
```typescript
// src/lib/rate-limiter.tsの実装を使用
import { rateLimiter } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  // IPベースのレート制限
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { success } = await rateLimiter.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: { message: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' } },
      { status: 429 }
    )
  }

  // 通常の処理
}
```

### 3. 不適切な型アサーション
**ファイル**: `src/lib/supabase.ts`

```typescript
// @ts-ignore - Supabase update type inference issue
.update({ last_login_at: new Date().toISOString() })
```

**問題点**:
- `@ts-ignore` を使用して型チェックを無効化
- 型安全性が低下

**推奨事項**:
```typescript
// 型定義を修正して @ts-ignore を削除
interface ProfileUpdate {
  last_login_at?: string
}

.update({ last_login_at: new Date().toISOString() } as ProfileUpdate)
```

### 4. 非推奨の関数がまだ存在
**ファイル**: `src/lib/supabase.ts`

```typescript
export const db = {
  async createQuote(quoteData: ...) {
    console.warn('[db.createQuote] DEPRECATED: Use /api/quotations/save instead')
    throw new Error('Client-side database writes are disabled. Use API routes instead.')
  },
  // ... 他の非推奨関数
}
```

**問題点**:
- 非推奨の関数がまだエクスポートされている
- 将来の削除予定が明確ではない

**推奨事項**:
- 関数を完全に削除するか、JSDocで削除予定を明示
- `@deprecated` タグを使用

## 🟢 推奨事項

### 1. 環境変数のバリデーション
**ファイル**: `src/lib/supabase.ts`

```typescript
// スタートアップ時に環境変数をバリデーション
if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
  console.error('[Supabase] Invalid NEXT_PUBLIC_SUPABASE_URL')
  // 適切なエラーハンドリング
}

if (!supabaseAnonKey) {
  console.error('[Supabase] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  // 適切なエラーハンドリング
}

if (!supabaseServiceKey && typeof window === 'undefined') {
  console.warn('[Supabase] Missing SUPABASE_SERVICE_ROLE_KEY (required for server-side)')
}
```

### 2. セッションハイジャック防止

```typescript
// セッションベースのCSRFトークンを実装
export async function createCSRFToken(userId: string): Promise<string> {
  const token = crypto.randomUUID()
  // Redisまたはデータベースに保存
  return token
}

export async function validateCSRFToken(userId: string, token: string): Promise<boolean> {
  // トークンを検証
  return true
}
```

### 3. セキュアなヘッダーの設定

```typescript
// next.config.js でセキュリティヘッダーを設定
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ')
  }
]
```

### 4. ログの記録

```typescript
// セキュリティイベントをログ
export async function logSecurityEvent(event: {
  type: 'auth' | 'authz' | 'sql_injection' | 'xss' | 'csrf'
  userId?: string
  ip: string
  userAgent: string
  details: Record<string, unknown>
}) {
  // ログを記録（データベース、ファイル、または外部サービス）
  console.error('[Security Event]', event)

  // 重大なイベントについては通知を送信
  if (event.type === 'sql_injection' || event.type === 'xss') {
    // 管理者に通知
  }
}
```

## パフォーマンスに関するセキュリティ

### 1. N+1クエリの問題

```typescript
// 悪い例
const quotations = await supabase
  .from('quotations')
  .select('*')

for (const quotation of quotations.data || []) {
  const items = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quotation.id)
  // N+1クエリ
}

// 良い例
const quotations = await supabase
  .from('quotations')
  .select('*, quotation_items (*)')
  // 1回のクエリで全データを取得
```

### 2. 過剰なデータ取得

```typescript
// 悪い例 - 全フィールドを取得
const { data } = await supabase
  .from('quotations')
  .select('*')

// 良い例 - 必要なフィールドのみ取得
const { data } = await supabase
  .from('quotations')
  .select('id, quotation_number, status, total_amount')
```

## まとめ

### 緊急度: 高
1. SQLインジェクション対策の実装
2. 開発モード認証の本番環境への漏出防止
3. サービスロールキーの適切な管理

### 緊急度: 中
1. エラーメッセージのサニタイズ
2. レート制限の実装
3. 型アサーションの見直し

### 緊急度: 低
1. 環境変数のバリデーション強化
2. CSRF対策の実装
3. セキュリティヘッダーの設定
4. ログの記録

このレビューは、コードベースの包括的な分析に基づいています。全ての推奨事項を実装することで、アプリケーションのセキュリティを大幅に向上させることができます。
