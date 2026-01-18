# Supabaseデータベース接続分析

## 概要
このプロジェクトではSupabaseをメインデータベースとして使用し、複数の接続方法と認証方式を実装しています。

## データベース接続方式

### 1. ブラウザクライアント (Client-Side)
**ファイル**: `src/lib/supabase.ts`

```typescript
export const getBrowserClient = () => {
  if (browserClient) return browserClient

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false, // クライアント側では自動更新しない
      persistSession: false, // クライアント側ではセッションを保存しない
      detectSessionInUrl: false, // URLからセッションを検出しない
      storage: {
        // NO-OP storage - クッキー/ローカルストレージアクセスを防止
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      },
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    global: {
      headers: {
        'x-application-name': 'epackage-lab-web'
      }
    }
  })

  return browserClient
}
```

**特徴**:
- クライアントサイドでのクッキー/ローカルストレージアクセスを完全に無効化
- サーバーサイドクッキー管理に依存
- 読み取り専用クエリ（商品データなど）に使用

### 2. サービスクライアント (Server-Side Admin)
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

**特徴**:
- 管理者権限でのデータベースアクセス
- サーバーサイドのみで使用
- RLS（Row Level Security）をバイパス可能

### 3. クッキーストレージ付きクライアント (API Routes用)
**ファイル**: `src/lib/supabase.ts`

```typescript
export const createSupabaseWithCookies = async (cookieStore: {
  get: (key: string) => { value?: string } | undefined;
  set: (key: string, value: string, options?: {...}) => void;
  delete: (key: string) => void;
}) => {
  // DEV_MODE: モッククライアント作成
  if (process.env.NODE_ENV === 'development' && process.env.ENABLE_DEV_MOCK_AUTH === 'true') {
    // 開発用モック認証実装
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not configured')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: {
        getItem: (key: string) => {
          const cookie = cookieStore.get(key);
          return cookie?.value ?? null;
        },
        setItem: (key: string, value: string) => {
          cookieStore.set(key, value, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
          });
        },
        removeItem: (key: string) => {
          cookieStore.delete(key);
        },
      },
    },
  });
};
```

**特徴**:
- APIルートで使用
- サーバーサイドクッキー管理
- 開発モードでのモック認証対応

### 4. B2Bデータベースヘルパー
**ファイル**: `src/lib/b2b-db.ts`

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function getQuotationById(id: string): Promise<Quotation | null> {
  const supabase = createRouteHandlerClient({ cookies })

  const { data, error } = await supabase
    .from('quotations')
    .select(`*, quotation_items (*)`)
    .eq('id', id)
    .single()

  // ... データ変換処理
}
```

**特徴**:
- Next.js App Routerとの統合
- 自動クッキー管理
- 型安全なクエリビルダー

### 5. Supabase MCPラッパー
**ファイル**: `src/lib/supabase-mcp.ts`

```typescript
export async function executeSql<T = unknown>(
  query: string,
  params: (string | number | boolean | null)[] = []
): Promise<SqlResult<T>> {
  try {
    // サーバーサイドの場合: MCP toolを直接使用
    if (typeof window === 'undefined') {
      // Server-side: MCP tool is available directly
    }

    // クライアントサイド: API経由で実行
    const response = await fetch('/api/supabase-mcp/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, params }),
    })

    // ... エラーハンドリング
  } catch (error) {
    // ... エラー処理
  }
}
```

**特徴**:
- MCP (Model Context Protocol) 経由でSQLを実行
- サーバーサイドとクライアントサイドの両方に対応
- 型安全なSQL実行

### 6. MCP Execute API
**ファイル**: `src/app/api/supabase-mcp/execute/route.ts`

```typescript
export async function POST(request: NextRequest) {
  try {
    const body: ExecuteRequest = await request.json()
    const { query, params = [] } = body

    // バリデーション
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: { message: 'Query is required', code: 'INVALID_QUERY' } },
        { status: 400 }
      )
    }

    // Supabaseサービスクライアントを作成
    const supabase = createServiceClient()

    // SQLを実行（Supabase RPCを使用）
    const { data, error, count } = await supabase.rpc('execute_sql', {
      sql_query: query,
      sql_params: params,
    })

    // ... 結果返却
  } catch (error) {
    // ... エラーハンドリング
  }
}
```

**特徴**:
- クライアントからMCP経由でSQLを実行するためのAPI
- パラメータ化されたクエリをサポート
- エラーハンドリングとバリデーション

## 認証システム

### 認証ユーティリティ
**ファイル**: `src/lib/supabase.ts`

```typescript
export const auth = {
  // ユーザープロフィール取得
  async getProfile(userId: string): Promise<Profile | null> {
    // DEV MODE: モックユーザー対応
    if (process.env.NODE_ENV === 'development' && process.env.ENABLE_DEV_MOCK_AUTH === 'true') {
      if (userId.startsWith('dev-user-') || userId.startsWith('dev-admin-')) {
        return null; // AuthContextがlocalStorageデータを使用
      }
    }

    const serviceClient = createServiceClient();
    const { data, error } = await serviceClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    return data as Profile;
  },

  // 管理者権限チェック
  async isAdmin(userId: string): Promise<boolean> {
    const profile = await this.getProfile(userId);
    return profile?.role === 'ADMIN' && profile?.status === 'ACTIVE';
  },

  // アカウント有効チェック
  async isActive(userId: string): Promise<boolean> {
    const profile = await this.getProfile(userId);
    return profile?.status === 'ACTIVE';
  },

  // 最終ログイン更新
  async updateLastLogin(userId: string): Promise<void> {
    const serviceClient = createServiceClient();
    await serviceClient
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);
  },

  // プロフィール更新
  async updateProfile(userId: string, updates: Partial<Omit<Profile, ...>>): Promise<Profile> {
    // ... 更新処理
  },

  // 全ユーザー取得（管理者のみ）
  async getAllUsers(filters?: {...}): Promise<Profile[]> {
    // ... 取得処理
  },

  // ステータス更新（管理者のみ）
  async updateUserStatus(userId: string, status: Profile['status']): Promise<Profile | null> {
    // ... 更新処理
  },

  // ロール更新（管理者のみ）
  async updateUserRole(userId: string, role: Profile['role']): Promise<Profile | null> {
    // ... 更新処理
  },
};
```

### 開発モード対応
- `ENABLE_DEV_MOCK_AUTH` 環境変数でモック認証を有効化
- モックユーザーID (`dev-user-*`, `dev-admin-*`) の検出
- localStorageを使用した開発用認証

## データベースヘルパー関数

### 非推奨関数（移行済み）
**ファイル**: `src/lib/supabase.ts`

```typescript
export const db = {
  // 商品取得（公開データ - クライアントサイドで安全）
  async getProducts(category?: string) {
    const client = getBrowserClient()
    if (!client) return []
    // ... 商品取得処理
  },

  // 見積作成 - 非推奨: APIルートを使用してください
  async createQuote(quoteData: Database['public']['Tables']['quotations']['Insert']) {
    console.warn('[db.createQuote] DEPRECATED: Use /api/quotations/save instead')
    throw new Error('Client-side database writes are disabled. Use API routes instead.')
  },

  // 問い合わせ作成 - 非推奨: APIルートを使用してください
  async createInquiry(inquiryData: Database['public']['Tables']['inquiries']['Insert']) {
    console.warn('[db.createInquiry] DEPRECATED: Use /api/contact instead')
    throw new Error('Client-side database writes are disabled. Use API routes instead.')
  },

  // サンプル請求作成 - 非推奨: APIルートを使用してください
  async createSampleRequest(sampleData: Database['public']['Tables']['sample_requests']['Insert']) {
    console.warn('[db.createSampleRequest] DEPRECATED: Use /api/samples/request instead')
    throw new Error('Client-side database writes are disabled. Use API routes instead.')
  }
}
```

**重要**: クライアントサイドからのデータベース書き込みは無効化されており、APIルートを使用する必要があります。

## タイプ定義

### Database型
**ファイル**: `src/types/database.ts`

Supabaseから自動生成された型定義を使用:
- `Database` 型 - 全テーブルの型定義
- `Profile` インターフェース - ユーザープロフィール
- `Order`, `Quotation` インターフェース - 注文・見積
- `Product` インターフェース - 製品マスター

## セキュリティ設定

### 1. クッキー設定
```typescript
cookieStore.set(key, value, {
  httpOnly: true, // JavaScriptからアクセス不可
  secure: process.env.NODE_ENV === 'production', // HTTPSのみ
  sameSite: 'lax', // CSRF対策
  path: '/',
});
```

### 2. 環境変数
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 匿名キー（公開可能）
- `SUPABASE_SERVICE_ROLE_KEY` - サービスロールキー（秘密）

### 3. 開発モード
- `ENABLE_DEV_MOCK_AUTH` - モック認証有効化
- `NODE_ENV === 'development'` - 開発環境検出

## 設定チェック

### Supabase設定確認
```typescript
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co'
}
```

## 認証ヘルパー

### SSR用Supabaseクライアント
**ファイル**: `src/lib/supabase-ssr.ts`

サーバーサイドレンダリング用のSupabaseクライアント実装。

### 認証済みクライアント
**ファイル**: `src/lib/supabase-authenticated.ts`

認証済みユーザー用のSupabaseクライアント実装。

## データベーススキーマ

### 主要テーブル
1. **profiles** - ユーザープロフィール
2. **orders** - 注文
3. **order_items** - 注文アイテム
4. **quotations** - 見積
5. **quotation_items** - 見積アイテム
6. **products** - 製品マスター
7. **inventory** - 在庫管理
8. **production_jobs** - 生産ジョブ
9. **contracts** - 契約書
10. **shipments** - 出荷

## 推奨事項

### 1. 接続方式の使い分け
- **クライアントサイド読み取り**: `getBrowserClient()` - 商品データなど
- **APIルート**: `createSupabaseWithCookies()` - 認証が必要な操作
- **管理者操作**: `createServiceClient()` - 管理者権限が必要な操作
- **複雑なクエリ**: `executeSql()` - MCP経由でSQLを実行

### 2. セキュリティ
- クライアントサイドからの書き込みを禁止
- サービスロールキーをサーバーサイドのみで使用
- 適切なRLS（Row Level Security）ポリシーを設定

### 3. エラーハンドリング
- 全てのデータベース操作で適切なエラーハンドリングを実装
- ユーザーフレンドリーなエラーメッセージを表示
- エラーログを記録

### 4. 開発モード
- 開発モードでのみモック認証を使用
- 本番環境では必ず本番Supabaseインスタンスを使用

## 結論

このプロジェクトのSupabase統合は以下の特徴があります:

1. **複数の接続方式**: クライアント、サーバー、APIルートに最適化された接続方法
2. **セキュリティ重視**: クライアントサイドからの書き込み禁止、適切な認証チェック
3. **開発者体験**: モック認証、型安全なクエリ、詳細なエラーハンドリング
4. **MCP統合**: Supabase MCP経由での柔軟なSQL実行
