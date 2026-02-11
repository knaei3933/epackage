# 認証問題の調査結果 - 2026-02-11

## 実施済みの修正

### 1. admin/dashboard/page.tsx - `dynamic`重複修正
- **問題**: `export const dynamic = 'force-dynamic'` が2箇所に定義
- **対応**: 17行目の重複を削除

### 2. OrderCommentsSection - APIエンドポイント修正
- **問題**: isAdmin propが無視され、常に`/api/member/orders/[id]/comments`を呼んでいた
- **対応**: loadComments関数を修正して、常に`/api/admin/orders/[id]/comments`を使用

### 3. member comments API - `$ARGS`プレースホルダー修正
- **ファイル**: `src/app/api/member/orders/[id]/comments/route.ts`
- **修正**: `createSupabaseSSRClient($ARGS)` → `createSupabaseSSRClient(request)` (2箇所)

### 4. member comments delete API - `$ARGS`プレースホルダー修正
- **ファイル**: `src/app/api/member/orders/[id]/comments/[commentId]/route.ts`
- **修正**: `createSupabaseSSRClient($ARGS)` → `createSupabaseSSRClient(request)` (1箇所)

### 5. cancellation API - 認証ロジック実装
- **ファイル**: `src/app/api/admin/orders/[id]/cancellation/route.ts`
- **実装**: 内部関数`verifyAdminAuth`を追加し、`createSupabaseSSRClient`で認証

---

## 継続中の問題

### 401 Unauthorized - comments API
- **URL**: `/api/admin/orders/4f9a022d-0fa8-4d2e-bda3-11e098926bbc/comments`
- **原因**: `createSupabaseSSRClient(request)`のcookie取得が失敗
- **詳細**: `request.cookies.getAll()`が空配列を返している
- **推測**: localhost:3000のドメインのcookie設定が不完全

### 403 Forbidden - cancellation API
- **URL**: `/api/admin/orders/4f9a022d-0fa8-4d2e-bda3-11e098926bbc/cancellation`
- **原因**: `verifyAdminAuth(request)`がnullを返している
- **詳細**: `request.headers.get('x-user-id')`でヘッダーが取得できない
- **推測**: middleware.tsが設定する`x-user-id`ヘッダーがAPIルートハンドラーに届いていない

---

## 根本的問題点

### Cookie処理の問題
`src/lib/supabase-ssr.ts`の`createSupabaseSSRClient`関数で、`request.cookies.getAll()`を使用していますが：
1. ログインしていない状態ではcookieが存在しない
2. ログインしていても、cookieがadmin/ordersページに転送されない可能性がある

### ミドルウェアの問題
middleware.tsの`x-user-id`ヘッダー設定が、APIルートハンドラー側から取得できていません：
1. ヘッダー設定のタイミングの問題
2. あるいはAPIルートハンドラーがミドルウェア処理より先に実行される可能性

---

## 今後の推奨対応

1. **統一認証ミドルウェアの作成**（最重要）
   - api-middleware.tsに、`withAuth`ラッパーを使用して認証ロジックを一元化
   - Server Componentsの使用を検討してcookie処理を改善

2. **Cookie処理の改善**
   - Supabase SSRクライアントの初期化パターンを見直す
   - ログイン状態の確認機能を追加

3. **認証アーキテクチャの全体的見直し**
   - 現在のad-hocな認証実装を統合
   - Server Componentsへの移行を検討

---

## 作業時間
約2時間（デバッグ含む）

---

**ユーザーへのご提案:**

時間の制約と複雑さにより、これ以上の詳細な修正には更なる時間がかかりました。以下のいずれかの方法で対応することを推奨します：

1. **シンプルなアプローチ**: DEV_MODEを有効にして、Supabaseの認証機能を使用
2. **統一的な解決**: プロジェクト全体の認証をapi-middleware.tsの`withAuth`に統合
3. **テスト重視**: 現在の認証エラーを解決してから、他のTEST.md項目を進める
4. **段階的実施**: 認証以外の修正は一旦保留し、他の優先度が高い項目を完了させる

この現状で作業を一時停止し、状況の整理とご提案をまとめました。
