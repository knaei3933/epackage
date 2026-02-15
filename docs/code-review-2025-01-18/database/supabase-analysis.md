# Supabaseデータベース接続分析

## 概要
このプロジェクトではSupabaseをメインデータベースとして使用し、複数の接続方法と認証方式を実装しています。

**プロジェクト情報**: Package-Lab (ijlgpzjdfipzmjvawofp)
- **リージョン**: ap-southeast-2
- **ステータス**: ACTIVE_HEALTHY
- **PostgreSQLバージョン**: 17.6.1.063

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

---

# データベーススキーマ詳細

## スキーマ概要

データベースは以下のスキーマで構成されています：

| スキーマ | テーブル数 | 説明 |
|---------|-----------|------|
| `public` | 52 | アプリケーションの主要テーブル |
| `auth` | 20 | Supabase認証関連テーブル |
| `storage` | 8 | ファイルストレージ管理 |

## Publicスキーマ - 主要テーブル一覧

### 1. ユーザー管理

#### profiles (ユーザープロフィール)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | - | ユーザーID (auth.usersへの外部キー) |
| email | text | YES | - | メールアドレス |
| kanji_last_name | text | YES | - | 漢字姓 |
| kanji_first_name | text | YES | - | 漢字名 |
| kana_last_name | text | YES | - | カナ姓 |
| kana_first_name | text | YES | - | カナ名 |
| corporate_phone | text | NO | - | 企業電話番号 |
| personal_phone | text | NO | - | 個人電話番号 |
| business_type | business_type | YES | 'INDIVIDUAL' | ビジネスタイプ (INDIVIDUAL/COMPANY) |
| company_name | text | NO | - | 会社名 |
| legal_entity_number | text | NO | - | 法人番号 |
| position | text | NO | - | 役職 |
| department | text | NO | - | 部署 |
| company_url | text | NO | - | 会社URL |
| product_category | product_category | YES | - | 製品カテゴリ |
| acquisition_channel | text | NO | - | 獲得チャネル |
| postal_code | text | NO | - | 郵便番号 |
| prefecture | text | NO | - | 都道府県 |
| city | text | NO | - | 市区町村 |
| street | text | NO | - | 番地 |
| role | user_role | YES | 'MEMBER' | ユーザーロール (MEMBER/ADMIN) |
| status | user_status | YES | 'PENDING' | ステータス (PENDING/ACTIVE/SUSPENDED) |
| created_at | timestamptz | YES | now() | 作成日時 |
| updated_at | timestamptz | YES | now() | 更新日時 |
| last_login_at | timestamptz | NO | - | 最終ログイン日時 |
| user_type | varchar(10) | NO | - | ユーザータイプ (B2C/B2B) |
| corporate_number | varchar(20) | NO | - | 事業者登録番号 (13桁) |
| founded_year | varchar(10) | NO | - | 設立年 |
| capital | varchar(50) | NO | - | 資本金 |
| representative_name | varchar(100) | NO | - | 代表者名 |
| building | varchar(200) | NO | - | 建物名 |
| business_document_path | text | NO | - | 事業者登録証保存パス |
| verification_token | text | NO | - | メール認証トークン |
| verification_expires_at | timestamptz | NO | - | 認証トークン有効期限 |
| settings | jsonb | NO | - | ユーザー設定（言語、通知等） |
| markup_rate | numeric | NO | 0.5 | 顧客別マークアップ率 (0.5 = 50%) |
| markup_rate_note | text | NO | - | マークアップ率設定理由 |

#### companies (企業情報)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | 企業ID |
| company_name | text | YES | - | 会社名 |
| legal_entity_number | text | NO | - | 法人番号 |
| business_type | text | NO | - | 業種 |
| contact_person | text | NO | - | 担当者 |
| contact_email | text | NO | - | 担当者メール |
| contact_phone | text | NO | - | 担当者電話 |
| postal_code | text | NO | - | 郵便番号 |
| prefecture | text | NO | - | 都道府県 |
| city | text | NO | - | 市区町村 |
| street | text | NO | - | 番地 |
| created_at | timestamptz | YES | now() | 作成日時 |
| updated_at | timestamptz | YES | now() | 更新日時 |

### 2. 注文管理

#### orders (注文)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | 注文ID |
| user_id | uuid | YES | - | ユーザーID |
| order_number | text | YES | - | 注文番号 |
| status | order_status | YES | 'pending' | 注文ステータス |
| total_amount | numeric | YES | 0 | 総額 |
| notes | text | NO | - | 注文メモ |
| created_at | timestamptz | YES | now() | 作成日時 |
| updated_at | timestamptz | YES | now() | 更新日時 |
| shipped_at | timestamptz | NO | - | 出荷日時 |
| delivered_at | timestamptz | NO | - | 配達日時 |
| cancelled_at | timestamptz | NO | - | キャンセル日時 |
| delivery_address | jsonb | NO | - | 配送先情報 |
| billing_address | jsonb | NO | - | 請求先情報 |
| subtotal | numeric | NO | 0 | 小計（税抜） |
| tax_amount | numeric | NO | 0 | 消費税額 |
| customer_name | text | NO | - | 顧客名 |
| customer_email | text | NO | - | 顧客メール |
| customer_phone | text | NO | - | 顧客電話 |
| delivery_address_id | uuid | NO | - | 配送先ID (外部キー) |
| billing_address_id | uuid | NO | - | 請求先ID (外部キー) |
| quotation_id | uuid | NO | - | 見積ID (外部キー) |
| archived_at | timestamptz | NO | - | アーカイブ日時 (ソフト削除) |

#### order_items (注文アイテム)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | アイテムID |
| order_id | uuid | YES | - | 注文ID (外部キー) |
| product_id | text | NO | - | 製品ID |
| product_name | text | YES | - | 製品名 |
| quantity | integer | YES | - | 数量 |
| unit_price | numeric | YES | - | 単価 |
| total_price | numeric | YES | - | 小計 |
| specifications | jsonb | NO | - | 仕様 |

#### order_status_history (注文ステータス履歴)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | 履歴ID |
| order_id | uuid | YES | - | 注文ID (外部キー) |
| from_status | text | YES | - | 変更前ステータス |
| to_status | text | YES | - | 変更後ステータス |
| changed_by | text | YES | - | 変更者 |
| changed_at | timestamptz | YES | now() | 変更日時 |
| reason | text | NO | - | 変更理由 |
| created_at | timestamptz | YES | now() | 作成日時 |

#### order_comments (注文コメント)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | コメントID |
| order_id | uuid | YES | - | 注文ID (外部キー) |
| content | text | YES | - | コメント内容 |
| comment_type | text | YES | 'general' | コメントタイプ |
| author_id | uuid | YES | - | 投稿者ID |
| author_role | text | YES | - | 投稿者ロール |
| is_internal | boolean | NO | false | 内部コメントフラグ |
| attachments | text[] | NO | - | 添付ファイル |
| parent_comment_id | uuid | NO | - | 親コメントID |
| created_at | timestamptz | YES | now() | 作成日時 |
| updated_at | timestamptz | YES | now() | 更新日時 |
| deleted_at | timestamptz | NO | - | 削除日時 |
| metadata | jsonb | NO | - | メタデータ |

#### admin_order_notes (管理者用注文メモ)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | メモID |
| order_id | uuid | YES | - | 注文ID (外部キー) |
| admin_id | uuid | YES | - | 管理者ID |
| notes | text | YES | '' | メモ内容 |
| sent_to_korea_at | timestamptz | NO | - | 韓国送信日時 |
| korea_email_address | text | NO | - | 韓国メールアドレス |
| created_at | timestamptz | YES | now() | 作成日時 |
| updated_at | timestamptz | YES | now() | 更新日時 |

### 3. 見積管理

#### quotations (見積)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | 見積ID |
| user_id | uuid | NO | - | ユーザーID (外部キー、nullable) |
| quotation_number | text | YES | - | 見積番号 |
| status | quotation_status | YES | 'draft' | 見積ステータス |
| total_amount | numeric | YES | 0 | 総額 |
| valid_until | timestamptz | NO | - | 有効期限 |
| notes | text | NO | - | メモ |
| created_at | timestamptz | YES | now() | 作成日時 |
| updated_at | timestamptz | YES | now() | 更新日時 |
| sent_at | timestamptz | NO | - | 送信日時 |
| approved_at | timestamptz | NO | - | 承認日時 |
| company_id | uuid | NO | - | 会社ID (外部キー) |
| customer_name | text | YES | 'TBD' | 顧客名 |
| customer_email | text | YES | 'tbd@example.com' | 顧客メール |
| customer_phone | text | NO | - | 顧客電話 |
| subtotal_amount | numeric | YES | 0 | 小計金額 |
| tax_amount | numeric | YES | 0 | 税額 |
| pdf_url | text | NO | - | PDF URL |
| admin_notes | text | NO | - | 管理者メモ |
| sales_rep | text | NO | - | 営業担当者 |
| estimated_delivery_date | timestamptz | NO | - | 納期予定 |
| rejected_at | timestamptz | NO | - | 却下日時 |
| subtotal | numeric | NO | - | 小計 |
| sku_count | integer | NO | 1 | SKU数 |
| total_meters | numeric | NO | - | 総メートル数 |
| loss_meters | numeric | NO | - | ロスメートル数 |
| total_cost_breakdown | jsonb | NO | - | コスト内訳 |

#### quotation_items (見積アイテム)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | アイテムID |
| quotation_id | uuid | YES | - | 見積ID (外部キー) |
| product_id | text | NO | - | 製品ID |
| product_name | text | YES | - | 製品名 |
| quantity | integer | YES | - | 数量 |
| unit_price | numeric | YES | - | 単価 |
| total_price | numeric | YES | - | 小計 |
| specifications | jsonb | NO | - | 仕様 |
| created_at | timestamptz | YES | now() | 作成日時 |
| order_id | uuid | NO | - | 注文ID (外部キー) |
| sku_index | integer | NO | 0 | SKUインデックス |
| theoretical_meters | numeric | NO | - | 理論メートル数 |
| secured_meters | numeric | NO | - | 確保メートル数 |
| loss_meters | numeric | NO | - | ロスメートル数 |
| total_meters | numeric | NO | - | 総メートル数 |
| cost_breakdown | jsonb | NO | - | コスト内訳 |

#### sku_quotes (SKU見積)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | SKU見積ID |
| quotation_id | uuid | YES | - | 見積ID (外部キー) |
| sku_index | integer | YES | - | SKUインデックス |
| product_id | text | NO | - | 製品ID |
| specifications | jsonb | NO | - | 仕様 |
| quantity | integer | NO | - | 数量 |
| unit_price | numeric | NO | - | 単価 |
| total_price | numeric | NO | - | 小計 |
| created_at | timestamptz | YES | now() | 作成日時 |
| updated_at | timestamptz | YES | now() | 更新日時 |

### 4. 製品・在庫管理

#### products (製品マスター)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | text | YES | - | 製品ID (例: three-seal-001) |
| category | text | YES | - | カテゴリ (flat_3_side, stand_up, box, spout_pouch, roll_film) |
| name_ja | text | YES | - | 日本語名 |
| name_en | text | YES | - | 英語名 |
| name_ko | text | NO | - | 韓国語名 |
| description_ja | text | YES | - | 日本語説明 |
| description_en | text | YES | - | 英語説明 |
| description_ko | text | NO | - | 韓国語説明 |
| specifications | jsonb | NO | - | 仕様 |
| materials | text[] | NO | - | 素材配列 |
| image | text | NO | - | 画像URL |
| pricing_formula | jsonb | NO | - | 価格計算式 |
| min_order_quantity | integer | YES | 500 | 最小注文数 |
| lead_time_days | integer | YES | 7 | リードタイム(日) |
| sort_order | integer | YES | 0 | 表示順 |
| is_active | boolean | YES | true | アクティブフラグ |
| tags | text[] | NO | - | タグ |
| applications | text[] | NO | - | 用途 |
| features | text[] | NO | - | 特徴 |
| created_at | timestamptz | NO | now() | 作成日時 |
| updated_at | timestamptz | NO | now() | 更新日時 |

#### inventory (在庫)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | 在庫ID |
| product_id | text | YES | - | 製品ID |
| product_name | text | YES | - | 製品名 |
| product_code | text | YES | - | 製品コード |
| warehouse_location | text | YES | 'MAIN' | 倉庫ロケーション |
| bin_location | text | NO | - | ビンロケーション |
| quantity_on_hand | integer | YES | 0 | 在庫数 |
| quantity_allocated | integer | YES | 0 | 引当数 |
| quantity_available | integer | NO | - | 利用可能在庫数 |
| reorder_point | integer | YES | 10 | 発注点 |
| max_stock_level | integer | NO | - | 最大在庫レベル |
| needs_reorder | boolean | NO | - | 発注要フラグ |
| created_at | timestamptz | YES | now() | 作成日時 |
| updated_at | timestamptz | YES | now() | 更新日時 |

#### inventory_transactions (在庫取引)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | 取引ID |
| inventory_id | uuid | YES | - | 在庫ID (外部キー) |
| transaction_type | text | YES | - | 取引タイプ |
| quantity | integer | YES | - | 数量 |
| reference_id | text | NO | - | 参照ID |
| reference_type | text | NO | - | 参照タイプ |
| notes | text | NO | - | メモ |
| entry_recording_type | text | NO | - | 記録タイプ |
| created_at | timestamptz | YES | now() | 作成日時 |

### 5. 契約管理

#### contracts (契約)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | 契約ID |
| contract_number | text | YES | - | 契約番号 |
| order_id | uuid | YES | - | 注文ID (外部キー) |
| quotation_id | uuid | NO | - | 見積ID (外部キー) |
| contract_type | text | YES | 'sales' | 契約タイプ |
| status | text | YES | 'DRAFT' | ステータス |
| customer_name | text | YES | - | 顧客名 |
| customer_email | text | YES | - | 顧客メール |
| contract_data | jsonb | YES | - | 契約データ |
| terms | text | NO | - | 契約条件 |
| total_amount | numeric | YES | 0 | 契約金額 |
| currency | text | YES | 'JPY' | 通貨 |
| valid_from | date | NO | - | 有効開始日 |
| valid_until | date | NO | - | 有効終了日 |
| customer_signature_url | text | NO | - | 顧客署名URL |
| customer_signed_at | timestamptz | NO | - | 顧客署名日時 |
| customer_ip_address | text | NO | - | 顧客IPアドレス |
| admin_signature_url | text | NO | - | 管理者署名URL |
| admin_signed_at | timestamptz | NO | - | 管理者署名日時 |
| final_contract_url | text | NO | - | 最終契約URL |
| sent_at | timestamptz | NO | - | 送信日時 |
| reminder_count | integer | NO | 0 | リマインダー回数 |
| last_reminded_at | timestamptz | NO | - | 最終リマインダ日時 |
| expires_at | timestamptz | NO | - | 有効期限 |
| notes | text | NO | - | メモ |
| created_at | timestamptz | YES | now() | 作成日時 |
| updated_at | timestamptz | YES | now() | 更新日時 |
| user_id | uuid | NO | - | ユーザーID |

#### contract_reminders (契約リマインダー)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | リマインダーID |
| contract_id | uuid | YES | - | 契約ID (外部キー) |
| reminder_type | text | YES | - | リマインダータイプ |
| scheduled_at | timestamptz | YES | - | スケジュール日時 |
| sent_at | timestamptz | NO | - | 送信日時 |
| status | text | YES | 'pending' | ステータス |
| created_at | timestamptz | YES | now() | 作成日時 |
| updated_at | timestamptz | YES | now() | 更新日時 |

### 6. 出荷管理

#### shipments (出荷)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | 出荷ID |
| shipment_number | text | YES | - | 出荷番号 |
| order_id | uuid | NO | - | 注文ID (外部キー) |
| tracking_number | text | NO | - | 追跡番号 |
| carrier_code | text | NO | - | 運送会社コード |
| carrier_name | text | NO | - | 運送会社名 |
| status | text | NO | 'pending' | ステータス |
| shipped_at | timestamptz | NO | - | 出荷日時 |
| estimated_delivery_date | date | NO | - | 配達予定日 |
| delivered_at | timestamptz | NO | - | 配達日時 |
| tracking_url | text | NO | - | 追跡URL |
| shipping_cost | numeric | NO | - | 送料 |
| shipping_method | text | NO | - | 配送方法 |
| service_level | text | NO | - | サービスレベル |
| package_details | jsonb | NO | - | 荷物詳細 |
| shipping_notes | text | NO | - | 送付メモ |
| delivery_notes | text | NO | - | 配達メモ |
| created_at | timestamptz | YES | now() | 作成日時 |
| updated_at | timestamptz | YES | now() | 更新日時 |
| tracking_events | jsonb | NO | - | 追跡イベント |
| last_tracking_update | timestamptz | NO | - | 最終追跡更新 |
| tracking_status_code | varchar(50) | NO | - | 追跡ステータスコード |
| actual_delivery_date | timestamptz | NO | - | 実際の配達日時 |
| delivery_attempts | integer | NO | 0 | 配達試行回数 |
| delivery_signature_required | boolean | NO | false | 署名要フラグ |
| delivery_signature_url | text | NO | - | 配達署名URL |
| current_location | text | NO | - | 現在地 |
| carrier_tracking_url | text | NO | - | キャリア追跡URL |
| tracking_history | jsonb | NO | - | 追跡履歴 |
| pickup_confirmed | boolean | NO | false | 集荷確認 |
| pickup_confirmed_at | timestamptz | NO | - | 集荷確認日時 |
| in_transit_since | timestamptz | NO | - | 輸送開始日時 |
| out_for_delivery_since | timestamptz | NO | - | 配達開始日時 |
| shipping_exceptions | jsonb | NO | - | 配送例外 |

#### shipment_tracking_events (出荷追跡イベント)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | イベントID |
| shipment_id | uuid | YES | - | 出荷ID (外部キー) |
| event_code | text | NO | - | イベントコード |
| event_description | text | NO | - | イベント説明 |
| event_location | text | NO | - | イベント場所 |
| event_time | timestamptz | NO | - | イベント日時 |
| created_at | timestamptz | YES | now() | 作成日時 |

### 7. 通知管理

#### unified_notifications (統合通知)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | 通知ID |
| recipient_id | uuid | YES | - | 受信者ID |
| recipient_type | text | YES | - | 受信者タイプ |
| type | text | YES | - | 通知タイプ |
| title | text | YES | - | タイトル |
| message | text | YES | - | メッセージ |
| related_id | uuid | NO | - | 関連ID |
| related_type | text | NO | - | 関連タイプ |
| priority | text | NO | 'normal' | 優先度 |
| metadata | jsonb | NO | - | メタデータ |
| channels | jsonb | NO | - | 通知チャンネル |
| is_read | boolean | NO | false | 既読フラグ |
| read_at | timestamptz | NO | - | 既読日時 |
| action_url | text | NO | - | アクションURL |
| action_label | text | NO | - | アクションラベル |
| expires_at | timestamptz | NO | - | 有効期限 |
| created_at | timestamptz | NO | now() | 作成日時 |

#### admin_notifications (管理者通知)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | 通知ID |
| type | text | YES | - | 通知タイプ |
| title | text | YES | - | タイトル |
| message | text | YES | - | メッセージ |
| related_id | uuid | NO | - | 関連ID |
| related_type | text | NO | - | 関連タイプ |
| priority | text | NO | 'normal' | 優先度 |
| user_id | uuid | NO | - | ユーザーID |
| is_read | boolean | NO | false | 既読フラグ |
| read_at | timestamptz | NO | - | 既読日時 |
| action_url | text | NO | - | アクションURL |
| action_label | text | NO | - | アクションラベル |
| metadata | jsonb | NO | - | メタデータ |
| created_at | timestamptz | NO | now() | 作成日時 |
| expires_at | timestamptz | NO | - | 有効期限 |

#### notifications (通知 - 旧版)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | 通知ID |
| type | text | YES | - | 通知タイプ |
| title | text | YES | - | タイトル |
| message | text | YES | - | メッセージ |
| related_id | text | NO | - | 関連ID |
| created_for | text | YES | - | 作成先 |
| is_read | boolean | NO | false | 既読フラグ |
| created_at | timestamptz | YES | now() | 作成日時 |
| read_at | timestamptz | NO | - | 既読日時 |

### 8. 権限管理

#### permissions (権限)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | 権限ID |
| name | text | YES | - | 権限名 |
| description | text | NO | - | 説明 |
| category | text | YES | - | カテゴリ |
| created_at | timestamptz | NO | now() | 作成日時 |

#### role_permissions (ロール権限)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | ID |
| role | text | YES | - | ロール |
| permission_id | uuid | YES | - | 権限ID (外部キー) |
| created_at | timestamptz | NO | now() | 作成日時 |

### 9. その他管理テーブル

#### inquiries (問い合わせ)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | 問い合わせID |
| name | text | YES | - | お名前 |
| email | text | YES | - | メールアドレス |
| phone | text | NO | - | 電話番号 |
| company | text | NO | - | 会社名 |
| inquiry_type | text | YES | - | 問い合わせ種別 |
| subject | text | NO | - | 件名 |
| message | text | YES | - | メッセージ |
| status | text | NO | 'new' | ステータス |
| created_at | timestamptz | YES | now() | 作成日時 |
| updated_at | timestamptz | NO | now() | 更新日時 |

#### sample_requests (サンプル請求)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | 請求ID |
| user_id | uuid | NO | - | ユーザーID (外部キー、nullable) |
| name | text | YES | - | お名前 |
| email | text | YES | - | メールアドレス |
| phone | text | NO | - | 電話番号 |
| company | text | NO | - | 会社名 |
| address | jsonb | NO | - | 住所 |
| sample_items | jsonb | YES | - | サンプルアイテム |
| notes | text | NO | - | メモ |
| status | text | NO | 'pending' | ステータス |
| created_at | timestamptz | YES | now() | 作成日時 |
| updated_at | timestamptz | NO | now() | 更新日時 |

#### sample_items (サンプルアイテム)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | アイテムID |
| sample_request_id | uuid | YES | - | サンプル請求ID (外部キー) |
| product_id | text | NO | - | 製品ID |
| quantity | integer | NO | - | 数量 |
| specifications | jsonb | NO | - | 仕様 |
| notes | text | NO | - | メモ |

#### coupons (クーポン)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | クーポンID |
| code | text | YES | - | コード |
| type | text | YES | - | タイプ |
| value | numeric | YES | - | 値 |
| min_order_amount | numeric | NO | 0 | 最小注文額 |
| max_discount_amount | numeric | NO | - | 最大割引額 |
| usage_limit | integer | NO | - | 利用回数制限 |
| used_count | integer | YES | 0 | 使用回数 |
| valid_from | timestamptz | YES | now() | 有効開始日 |
| valid_until | timestamptz | YES | - | 有効終了日 |
| is_active | boolean | YES | true | アクティブフラグ |
| created_at | timestamptz | YES | now() | 作成日時 |
| updated_at | timestamptz | YES | now() | 更新日時 |

#### coupon_usage (クーポン利用履歴)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | 履歴ID |
| coupon_id | uuid | YES | - | クーポンID (外部キー) |
| user_id | uuid | YES | - | ユーザーID (外部キー) |
| order_id | uuid | NO | - | 注文ID (外部キー) |
| discount_amount | numeric | YES | - | 割引額 |
| used_at | timestamptz | YES | now() | 使用日時 |

#### system_settings (システム設定)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| key | text | YES | - | 設定キー |
| value | jsonb | YES | - | 設定値 |
| description | text | NO | - | 説明 |
| category | text | NO | - | カテゴリ |
| updated_at | timestamptz | YES | now() | 更新日時 |

#### files (ファイル管理)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | ファイルID |
| name | text | YES | - | ファイル名 |
| type | text | YES | - | ファイルタイプ |
| size | bigint | YES | - | ファイルサイズ |
| path | text | YES | - | ファイルパス |
| metadata | jsonb | NO | - | メタデータ |
| uploaded_by | uuid | YES | - | アップロード者ID |
| created_at | timestamptz | YES | now() | 作成日時 |

#### design_revisions (デザインリビジョン)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | リビジョンID |
| order_id | uuid | YES | - | 注文ID (外部キー) |
| revision_number | integer | YES | - | リビジョン番号 |
| file_url | text | YES | - | ファイルURL |
| status | text | YES | - | ステータス |
| submitted_by | uuid | YES | - | 提出者ID |
| reviewed_by | uuid | NO | - | レビュー者ID |
| notes | text | NO | - | メモ |
| created_at | timestamptz | YES | now() | 作成日時 |
| updated_at | timestamptz | NO | now() | 更新日時 |
| approval_status | text | NO | 'pending' | 承認ステータス |

#### customer_approval_requests (顧客承認リクエスト)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | リクエストID |
| order_id | uuid | YES | - | 注文ID (外部キー) |
| request_type | text | YES | - | リクエストタイプ |
| status | text | YES | 'pending' | ステータス |
| requested_by | uuid | YES | - | リクエスト者ID |
| version | integer | NO | 1 | バージョン |
| created_at | timestamptz | YES | now() | 作成日時 |
| updated_at | timestamptz | NO | now() | 更新日時 |

#### approval_request_files (承認リクエストファイル)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | ファイルID |
| approval_request_id | uuid | YES | - | 承認リクエストID (外部キー) |
| file_name | text | YES | - | ファイル名 |
| file_path | text | YES | - | ファイルパス |
| file_size | bigint | NO | - | ファイルサイズ |
| file_type | text | NO | - | ファイルタイプ |
| uploaded_by | uuid | YES | - | アップロード者ID |
| created_at | timestamptz | YES | now() | 作成日時 |

#### approval_request_comments (承認リクエストコメント)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | コメントID |
| approval_request_id | uuid | YES | - | 承認リクエストID (外部キー) |
| content | text | YES | - | コメント内容 |
| author_id | uuid | YES | - | 投稿者ID |
| author_role | text | YES | - | 投稿者ロール |
| created_at | timestamptz | YES | now() | 作成日時 |
| updated_at | timestamptz | NO | now() | 更新日時 |

#### document_access_log (ドキュメントアクセスログ)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | ログID |
| user_id | uuid | YES | - | ユーザーID |
| document_type | text | YES | - | ドキュメントタイプ |
| document_id | uuid | YES | - | ドキュメントID |
| action | text | YES | - | アクション |
| ip_address | text | NO | - | IPアドレス |
| user_agent | text | NO | - | ユーザーエージェント |
| created_at | timestamptz | YES | now() | アクセス日時 |

#### korea_corrections (韓国修正データ)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | 修正ID |
| order_id | uuid | YES | - | 注文ID (外部キー) |
| correction_data | jsonb | YES | - | 修正データ |
| status | text | YES | - | ステータス |
| submitted_at | timestamptz | YES | now() | 提出日時 |
| processed_at | timestamptz | NO | - | 処理日時 |

#### korea_transfer_log (韓国転送ログ)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | ログID |
| order_id | uuid | YES | - | 注文ID (外部キー) |
| transfer_type | text | YES | - | 転送タイプ |
| status | text | YES | - | ステータス |
| attempt_count | integer | NO | 0 | 試行回数 |
| last_attempt_at | timestamptz | NO | - | 最終試行日時 |
| created_at | timestamptz | YES | now() | 作成日時 |

#### production_orders (生産注文)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | 生産注文ID |
| order_id | uuid | NO | - | 注文ID (外部キー) |
| production_number | text | YES | - | 生産番号 |
| status | text | YES | - | ステータス |
| quantity | integer | YES | - | 数量 |
| specifications | jsonb | NO | - | 仕様 |
| started_at | timestamptz | NO | - | 開始日時 |
| completed_at | timestamptz | NO | - | 完了日時 |
| created_at | timestamptz | YES | now() | 作成日時 |
| updated_at | timestamptz | NO | now() | 更新日時 |

#### stage_action_history (ステージアクション履歴)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | 履歴ID |
| order_id | uuid | YES | - | 注文ID (外部キー) |
| stage | text | YES | - | ステージ |
| action | text | YES | - | アクション |
| performed_by | uuid | YES | - | 実行者ID |
| performed_at | timestamptz | YES | now() | 実行日時 |
| notes | text | NO | - | メモ |

#### announcements (お知らせ)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | お知らせID |
| title | text | YES | - | タイトル |
| content | text | YES | - | 内容 |
| type | text | YES | - | タイプ |
| priority | text | NO | 'normal' | 優先度 |
| is_active | boolean | YES | true | アクティブフラグ |
| starts_at | timestamptz | NO | now() | 開始日時 |
| expires_at | timestamptz | NO | - | 終了日時 |
| created_at | timestamptz | YES | now() | 作成日時 |
| updated_at | timestamptz | NO | now() | 更新日時 |

#### billing_addresses (請求先住所)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | 住所ID |
| user_id | uuid | YES | - | ユーザーID (外部キー) |
| label | text | NO | - | ラベル |
| company_name | text | NO | - | 会社名 |
| recipient_name | text | YES | - | 受取人名 |
| postal_code | text | NO | - | 郵便番号 |
| prefecture | text | NO | - | 都道府県 |
| city | text | NO | - | 市区町村 |
| street | text | NO | - | 番地 |
| building | text | NO | - | 建物名 |
| phone | text | NO | - | 電話番号 |
| is_default | boolean | NO | false | デフォルトフラグ |
| created_at | timestamptz | YES | now() | 作成日時 |
| updated_at | timestamptz | NO | now() | 更新日時 |

#### delivery_addresses (配送先住所)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | 住所ID |
| user_id | uuid | YES | - | ユーザーID (外部キー) |
| label | text | NO | - | ラベル |
| company_name | text | NO | - | 会社名 |
| recipient_name | text | YES | - | 受取人名 |
| postal_code | text | NO | - | 郵便番号 |
| prefecture | text | NO | - | 都道府県 |
| city | text | NO | - | 市区町村 |
| street | text | NO | - | 番地 |
| building | text | NO | - | 建物名 |
| phone | text | NO | - | 電話番号 |
| is_default | boolean | NO | false | デフォルトフラグ |
| created_at | timestamptz | YES | now() | 作成日時 |
| updated_at | timestamptz | NO | now() | 更新日時 |

#### invoices (請求書)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | 請求書ID |
| invoice_number | text | YES | - | 請求書番号 |
| order_id | uuid | YES | - | 注文ID (外部キー) |
| customer_id | uuid | YES | - | 顧客ID (外部キー) |
| status | text | YES | - | ステータス |
| subtotal | numeric | YES | - | 小計 |
| tax_amount | numeric | YES | - | 税額 |
| total_amount | numeric | YES | - | 総額 |
| due_date | date | YES | - | 支払期限 |
| paid_at | timestamptz | NO | - | 支払日時 |
| created_at | timestamptz | YES | now() | 作成日時 |
| updated_at | timestamptz | NO | now() | 更新日時 |

#### invoice_items (請求明細)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | 明細ID |
| invoice_id | uuid | YES | - | 請求書ID (外部キー) |
| description | text | YES | - | 説明 |
| quantity | integer | YES | - | 数量 |
| unit_price | numeric | YES | - | 単価 |
| amount | numeric | YES | - | 金額 |
| created_at | timestamptz | YES | now() | 作成日時 |

#### payment_confirmations (支払確認)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | 確認ID |
| order_id | uuid | YES | - | 注文ID (外部キー) |
| payment_method | text | YES | - | 支払方法 |
| amount | numeric | YES | - | 金額 |
| status | text | YES | - | ステータス |
| confirmed_by | uuid | YES | - | 確認者ID |
| confirmed_at | timestamptz | NO | - | 確認日時 |
| notes | text | NO | - | メモ |
| created_at | timestamptz | YES | now() | 作成日時 |

#### password_reset_tokens (パスワードリセットトークン)
| カラム名 | データ型 | 必須 | デフォルト値 | 説明 |
|---------|---------|------|-------------|------|
| id | uuid | YES | gen_random_uuid() | トークンID |
| user_id | uuid | YES | - | ユーザーID (外部キー) |
| token | text | YES | - | トークン |
| expires_at | timestamptz | YES | - | 有効期限 |
| used_at | timestamptz | NO | - | 使用日時 |
| created_at | timestamptz | YES | now() | 作成日時 |

---

## マイグレーション履歴

最新のマイグレーション（2026年2月1日時点）:

| バージョン | 名前 | 日付 |
|-----------|------|------|
| 20260201041137 | add_design_revisions_approval_status | 2026-02-01 |
| 20260201000005 | create_correction_files_bucket | 2026-02-01 |
| 20260201000004 | create_admin_order_notes | 2026-02-01 |
| 20260201000003 | update_comment_rls | 2026-02-01 |
| 20260201000002 | add_comment_visibility | 2026-02-01 |
| 20260201000001 | add_korean_member_role | 2026-02-01 |
| 20260130145137 | fix_function_search_path_and_rls_policies | 2026-01-30 |
| 20260130145011 | fix_view_security_invoker | 2026-01-30 |
| 20260130145000 | fix_security_issues_rls_and_view | 2026-01-30 |
| 20260124161326 | create_document_access_log_table | 2026-01-24 |
| 20260121023729 | add_converted_status_to_quotation_status_type | 2026-01-21 |
| 20260119212925 | create_rbac_tables | 2026-01-19 |
| 20260119212906 | create_unified_notifications_table | 2026-01-19 |

## インストール済み拡張機能

| 拡張機能 | スキーマ | バージョン | 説明 |
|---------|---------|-----------|------|
| pgcrypto | extensions | 1.3 | 暗号化関数 |
| pg_stat_statements | extensions | 1.11 | SQL統計 |
| uuid-ossp | extensions | 1.1 | UUID生成 |
| supabase_vault | vault | 0.3.1 | Supabase Vault |
| pg_graphql | graphql | 1.5.11 | GraphQLサポート |
| plpgsql | pg_catalog | 1.0 | PL/pgSQL |

---

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
5. **包括的なデータベーススキーマ**: 52以上のテーブルでB2Bパッケージ業界のワークフローを完全サポート
