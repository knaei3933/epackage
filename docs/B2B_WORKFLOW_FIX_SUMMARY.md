# B2B ワークフロー修正完了サマリー

**実施日**: 2025-01-30
**ステータス**: ✅ 完了

---

## 実装完了内容

### P0: セッション安定化（30分非アクティブ維持）

| ファイル | 変更内容 | コミット |
|---------|----------|----------|
| `src/lib/supabase-browser.ts` | `autoRefreshToken: true` に変更 | M |
| `src/lib/supabase-ssr.ts` | クッキーオプション明示化（maxAge: 1800） | M |
| `src/middleware.ts` | response クッキー設定（maxAge: 1800） | M |
| `src/app/api/auth/signin/route.ts` | モックモードクッキー更新（maxAge: 1800） | M |

### P1: 見積保存修正

| ファイル | 変更内容 | コミット |
|---------|----------|----------|
| `src/app/api/quotations/save/route.ts` | quotation_items テーブルへのレコード作成を追加 | M |
| `src/components/quote/sections/ResultStep.tsx` | エラーハンドリング改善、認証チェック追加 | M |

### P1: セッションリフレッシュロジック

| ファイル | 変更内容 | コミット |
|---------|----------|----------|
| `src/contexts/AuthContext.tsx` | 1分ごとのセッション確認、5分前に自動リフレッシュ | M |

---

## 変更詳細

### 1. supabase-browser.ts

```diff
- autoRefreshToken: false,
+ autoRefreshToken: true,   // ✅ 自動リフレッシュ有効化（30分セッション維持）
- persistSession: false,
+ persistSession: true,     // ✅ セッション持続有効化
- detectSessionInUrl: false,
+ detectSessionInUrl: true, // ✅ URLからのセッション検出有効化
```

### 2. supabase-ssr.ts

```diff
export function createSupabaseSSRClient(request: NextRequest): SupabaseSSRClientResult {
+   const response = NextResponse.next();
    const client = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        set(name: string, value: string, options: Record<string, unknown>) {
          response.cookies.set({
            name,
            value,
+           httpOnly: true,   // ✅ httpOnly設定（JavaScriptアクセス禁止）
+           secure: process.env.NODE_ENV === 'production',  // ✅ HTTPS時のみ
+           sameSite: 'lax',   // ✅ CSRF対策（lax: 同一サイトGET許可）
+           path: '/',         // ✅ 全パスで有効
+           domain: process.env.NODE_ENV === 'production' ? '.epackage-lab.com' : undefined,
+           maxAge: 1800,      // ✅ 30分セッション維持 (1800秒 = 30分)
            ...options,
          });
        },
        ...
```

### 3. middleware.ts

```diff
function createMiddlewareClient(request: NextRequest) {
+   const response = NextResponse.next();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        set(name: string, value: string, options: any) {
+         // ✅ requestとresponseの両方にクッキーを設定
          request.cookies.set({
            name,
            value,
+           httpOnly: true,   // ✅ httpOnly設定
+           secure: process.env.NODE_ENV === 'production',  // ✅ HTTPS時のみ
+           sameSite: 'lax',   // ✅ CSRF対策
+           path: '/',         // ✅ 全パスで有効
+           maxAge: 1800,      // ✅ 30分セッション維持
            ...options,
          });
+
+         // ✅ responseにも設定（重要：クライアントに送信されるため）
+         response.cookies.set({
+           name,
+           value,
+           httpOnly: true,
+           secure: process.env.NODE_ENV === 'production',
+           sameSite: 'lax',
+           path: '/',
+           maxAge: 1800,  // ✅ 30分セッション維持
+           ...options,
+         });
        },
```

### 4. AuthContext.tsx

```diff
+   // =====================================================
+   // ✅ Session Refresh Logic (30分セッション維持)
+   // =====================================================
+   // 1分ごとにセッションを確認し、期限切れ5分前に自動リフレッシュ
+
+   const refreshInterval = setInterval(async () => {
+     if (!mounted || !session) return;
+
+     try {
+       // セッション有効期限をチェック
+       const expiresAt = new Date(session.expires).getTime();
+       const now = Date.now();
+       const timeUntilExpiry = expiresAt - now;
+
+       // 期限切れ5分前（300,000ms）または既に期限切れの場合にリフレッシュ
+       if (timeUntilExpiry <= 5 * 60 * 1000) {
+         console.log('[AuthContext] Session expiring soon, refreshing...');
+
+         const response = await fetch('/api/auth/session', {
+           credentials: 'include',
+         });
+
+         if (response.ok) {
+           const sessionData = await response.json();
+
+           if (sessionData.session?.user && sessionData.profile) {
+             setSession({
+               token: 'server-managed',
+               expires: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // ✅ 30分延長
+             });
+             setProfile(sessionData.profile);
+             setUser(convertSupabaseUser(sessionData.session.user, sessionData.profile));
+             console.log('[AuthContext] Session refreshed successfully');
+           }
+         }
+       }
+     } catch (error) {
+       console.error('[AuthContext] Session refresh error:', error);
+     }
+   }, 60 * 1000); // ✅ 1分ごとにチェック
+
+   return () => {
+     mounted = false
+     clearInterval(refreshInterval) // ✅ インターバルをクリア
+   }
```

### 5. quotations/save/route.ts

```diff
+ // =====================================================
+ // Type Definitions
+ // =====================================================
+
+ interface QuotationItemData {
+   id?: string;
+   productId?: string;
+   productName: string;
+   quantity: number;
+   unitPrice: number;
+   specifications?: Record<string, unknown>;
+ }
+
+ // ✅ 認証必須（DBのuser_id NOT NULL制約のため）
+ if (!isAuthenticated || !user) {
+   console.error('[API /quotations/save] User not authenticated');
+   return NextResponse.json(
+     {
+       error: '見積を保存するにはログインが必要です。',
+       errorEn: 'Authentication required to save quotation',
+     },
+     { status: 401 }
+   );
+ }
+
+ // トランザクション処理: quotation + quotation_items
+ // 注: Supabaseはトランザクションを直接サポートしていないため、
+ // エラー時のロールバック処理を実装
+
+ try {
+   // 1. 見積を作成
+   const { data: quotationData, error: insertError } = await supabaseService
+     .from('quotations')
+     .insert({...})
+     .select()
+     .single();
+
+   // 2. 見積アイテムを作成
+   const itemsToInsert = itemsToSave.map((item, index) => ({
+     quotation_id: quotation.id,
+     product_id: item.productId || null,
+     product_name: item.productName,
+     quantity: item.quantity,
+     unit_price: item.unitPrice,
+     specifications: item.specifications || null,
+   }));
+
+   const { data: itemsData, error: itemsError } = await supabaseService
+     .from('quotation_items')
+     .insert(itemsToInsert)
+     .select();
+
+   if (itemsError) {
+     // ロールバック: 見積を削除
+     await supabaseService.from('quotations').delete().eq('id', quotation.id);
+     throw new Error(`見積アイテムの作成に失敗しました: ${itemsError.message}`);
+   }
+ }
```

### 6. ResultStep.tsx

```diff
+ // ✅ 認証チェック: ログインしていない場合は保存をスキップ
+ if (!user?.id) {
+   console.log('[saveQuotationToDatabase] User not authenticated, skipping auto-save');
+   return;
+ }
+
+ // ✅ /api/member/quotations を使用（認証必須）
+ const response = await fetch('/api/member/quotations', {
+   method: 'POST',
+   headers: {
+     'Content-Type': 'application/json',
+   },
+   credentials: 'include',
+   body: JSON.stringify({...}),
+ });
+
+ if (!response.ok) {
+   const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
+   console.error('[saveQuotationToDatabase] API error:', errorData);
+   throw new Error(errorData.error || errorData.errorEn || 'Failed to save quotation');
+ }
```

---

## 検証手順

### 1. セッション安定化（30分維持）

1. **ログイン**
2. **30分待機**（または `maxAge: 1800` を短く設定してテスト）
3. **「マイページ」クリック**
4. **セッション維持確認**

### 2. 見積保存→引用アイテム作成

1. **ログイン状態で見積作成**
2. **PDF ダウンロードクリック**
3. **自動保存確認**
4. **`/member/quotations` ページで見積確認**
5. **DB で `quotation_items` レコード確認**

```sql
-- 確認クエリ
SELECT * FROM quotations ORDER BY created_at DESC LIMIT 1;
SELECT * FROM quotation_items WHERE quotation_id = '<上記のID>';
```

### 3. セッション自動リフレッシュ

1. **ログイン**
2. **コンソールログで `[AuthContext] Session expiring soon, refreshing...` 確認**
3. **セッション延長確認**

---

## 成功基準

### セッション安定化（30分非アクティブ維持）

- [x] `autoRefreshToken: true` に変更
- [x] クッキーオプション明示化（httpOnly, secure, sameSite, maxAge: 1800）
- [x] response クッキー設定
- [x] 1分ごとのセッション確認
- [x] 5分前の自動リフレッシュ

### 見積保存

- [x] `quotation_items` テーブルにレコード作成
- [x] user_id null 処理（認証必須に変更）
- [x] エラーハンドリング改善
- [x] `/member/quotations` ページで見積表示

### ワークフロー有機的接続

- [x] 見积→注文変換フロー確認
- [x] API エンドポイント接続状態文書化
- [x] レビュードキュメント作成

---

## 関連ドキュメント

- `docs/reports/workflow-review-2025-01-30.md` - ワークフローレビュー詳細
- `docs/current/PRD.md` - 12段階 B2B ワークフロー仕様
- `docs/current/TASK.md` - Phase 2 実装タスク一覧

---

**実装完了日**: 2025-01-30
**実装者**: Claude Code
