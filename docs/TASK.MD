# EPackage Lab セキュリティ改善タスク

> 作成日: 2026-01-18
> 状態: 進行中

## 📋 タスク概要

コードレビューで発見された**致命的なセキュリティ脆弱性**を解決するための4週間の改善計画。

---

## 🔴 Week 1: 致命的セキュリティ修正（緊急）

### Task 1.1: SQLインジェクション防止
**ファイル**: `src/lib/supabase-sql.ts` (lines 259-305)
**優先度**: 🔴 致命的

- [x] `insertQuotationItems`関数をパラメータ化クエリに書き換え
- [ ] SQLインジェクションテスト追加
- [ ] 検証

**問題**: 文字列補間でSQLを構成し、`replace(/'/g, "''")`のみでエスケープ

**解決策**:
```typescript
// パラメータ化クエリを使用した安全な実装
export async function insertQuotationItemsSafe(
  items: QuotationItemInput[]
): Promise<SqlResult> {
  const queries = items.map(item => ({
    query: `INSERT INTO quotation_items (...) VALUES ($1, $2, $3, ...)`,
    params: [item.quotation_id, item.product_name, ...]
  }));

  return executeTransaction(queries);
}
```

### Task 1.2: MCP APIセキュリティ強化
**ファイル**: `src/app/api/supabase-mcp/execute/route.ts`
**優先度**: 🔴 致命的

- [x] `verifyAdminAuth()`で認証追加
- [x] 危険なSQLキーワードフィルタリング
- [ ] 管理者用SQL実行ログ記録
- [ ] 検証

**問題**: 認証なしで任意のSQL実行可能

**解決策**:
```typescript
import { verifyAdminAuth } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  // 1. 認証確認
  const authResult = await verifyAdminAuth(request)
  if (!authResult) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. SQL安全検証
  const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'GRANT', 'REVOKE']
  // ...検証ロジック
}
```

### Task 1.3: 開発モードセキュリティ強化
**ファイル**: `src/lib/dev-mode.ts`, `src/lib/env-validation.ts` (新規)
**優先度**: 🔴 致命的

- [x] 多重環境検証レイヤー実装
- [x] プロダクションで開発モード有効化時に起動をブロック
- [x] 環境変数検証関数追加
- [ ] 検証

---

## 🟡 Week 2-3: 認証標準化 & タイプ安全性

### Task 2.1: 認証ミドルウェア統合
**新規ファイル**: `src/lib/api-auth.ts`

- [ ] `createAuthMiddleware()` - 再利用可能な認証ミドルウェア
- [ ] `withAuth()` - APIルートハンドララッパー
- [ ] 管理者/会員ロール確認標準化
- [ ] 50+ APIルートに段階的適用

### Task 2.2: タイプガードユーティリティ
**新規ファイル**: `src/lib/type-guards.ts`

- [ ] `isDbRow()` - DB行タイプ検証
- [ ] `assertType()` - 安全なタイプアサーション
- [ ] `isArray()` - 配列タイプ検証
- [ ] 22個ファイルから`@ts-ignore`削除

---

## 🟢 Week 3-4: エラーハンドリング & 検証改善

### Task 3.1: 中京化エラーハンドラー
**新規ファイル**: `src/lib/api-error-handler.ts`

- [ ] `ApiError`クラス - 標準化エラータイプ
- [ ] `handleApiError()` - 一貫したエラー応答
- [ ] `withApiHandler()` - 自動エラー処理ラッパー

### Task 3.2: Zod検証スキーマ拡張
**新規ファイル**: `src/lib/validation-schemas.ts`

- [ ] 共通検証スキーマ（UUID、メール、電話番号）
- [ ] `paginationSchema` - ページネーション標準化
- [ ] `sqlQuerySchema` - SQLクエリ安全検証

---

## ✅ 検証計画

### 単体テスト
- [ ] SQLインジェクション防止（悪意ある入力）
- [ ] 認証バイパス試行
- [ ] 環境変数検証
- [ ] タイプガード検証

### 統合テスト
- [ ] 認証フローE2E
- [ ] MCP APIセキュリティ
- [ ] 見積作成フロー
- [ ] 開発モード活性化

### 回帰テスト
- [ ] 既存E2Eテストスイート通過
- [ ] 性能ベンチマーク（<100msオーバーヘッド）
- [ ] 公開API互換性維持

---

## 🎯 成功基準

### Week 1完了時
- ✅ 全SQLインジェクション脆弱性パッチ
- ✅ MCP API管理者認証必須
- ✅ プロダクションで開発モード非活性化
- ✅ セキュリティテスト0失敗

### Week 2-3完了時
- ✅ 50% APIルート統合認証使用
- ✅ 50% `@ts-ignore`削除
- ✅ 全エラー中京化ハンドラー使用

### Week 3-4完了時
- ✅ 100% APIルート統合認証
- ✅ 全`@ts-ignore`削除
- ✅ 全ルート検証スキーマ使用
- ✅ TypeScript strictモード活性化

---

## 📊 進捗状況

| タスク | 状態 | 完了日 |
|--------|------|--------|
| 1.1 SQLインジェクション修正 | 進行中 | - |
| 1.2 MCP APIセキュリティ | 進行中 | - |
| 1.3 開発モード強化 | 進行中 | - |
| 2.1 認証ミドルウェア | 未着手 | - |
| 2.2 タイプガード | 未着手 | - |
| 3.1 エラーハンドラー | 未着手 | - |
| 3.2 Zod検証 | 未着手 | - |

---

## 📝 ノート

- **ロールバック戦略**: フィーチャーフラグで各変更を制御可能
- **並列処理**: 専門家エージェントと協業して複数タスクを並列実行
- **ドキュメント更新**: 各完了タスクをPRD/LLDに反映
