# B2B ワークフロー レビュー レポート

**日付**: 2025-01-30
**バージョン**: 1.0
**目的**: B2B 12段階ワークフローの現状確認と改善点の特定

---

## 1. 実装完了サマリー

### P0: セッション安定化（30分非アクティブ維持）✅ 完了

| ファイル | 変更内容 | 状態 |
|---------|----------|------|
| `src/lib/supabase-browser.ts` | `autoRefreshToken: true` に変更 | ✅ |
| `src/lib/supabase-ssr.ts` | クッキーオプション明示化（maxAge: 1800） | ✅ |
| `src/middleware.ts` | response クッキー設定（maxAge: 1800） | ✅ |
| `src/app/api/auth/signin/route.ts` | モックモードクッキー更新（maxAge: 1800） | ✅ |

### P1: 見積保存修正 ✅ 完了

| ファイル | 変更内容 | 状態 |
|---------|----------|------|
| `src/app/api/quotations/save/route.ts` | quotation_items テーブルへのレコード作成を追加 | ✅ |
| `src/components/quote/sections/ResultStep.tsx` | エラーハンドリング改善、認証チェック追加 | ✅ |

### P1: セッションリフレッシュロジック ✅ 完了

| ファイル | 変更内容 | 状態 |
|---------|----------|------|
| `src/contexts/AuthContext.tsx` | 1分ごとのセッション確認、5分前に自動リフレッシュ | ✅ |

---

## 2. ワークフロー現状分析

### 12段階ワークフローの実装状況

| ステージ | 名称 | ステータス | 備考 |
|---------|------|-----------|------|
| 1 | QUOTE（見積作成） | ✅ 完了 | PDF生成、DB保存実装済み |
| 2 | SAMPLE（サンプル請求） | ✅ 完了 | `/samples` ページ実装済み |
| 3 | APPROVAL（見積承認・発注） | ✅ 完了 | `/member/quotations/[id]` 実装済み |
| 4 | INVOICE（請求書発行） | ✅ 完了 | 請求書PDF生成実装済み |
| 5 | DATA_UPLOAD（データ入稿） | ⚠️ 部分実装 | AI抽出機能はあるが完全連携未実装 |
| 6 | DATA_TO_KR（韓国送信） | ❌ 未実装 | `POST /api/member/korea/send-data` はあるが本実装が必要 |
| 7 | DATA_CORRECT（韓国→教正データ） | ❌ 未実装 | 管理者アップロード画面未実装 |
| 8 | SPEC_SEND（仕様書送付・承認） | ⚠️ 部分実装 | 仕様書生成APIはあるがワークフロー未完結 |
| 9 | CONTRACT（電子契約） | ⚠️ 部分実装 | DocuSign統合の一部実装済み |
| 10 | PRODUCTION（製作） | ⚠️ 部分実装 | 基本的な製作ステータス管理は実装済み |
| 11 | SHIPPING_KR（韓国→倉庫） | ⚠️ 部分実装 | EMS追跡機能はあるが本実装が必要 |
| 12 | DELIVERY（倉庫→顧客配送） | ⚠️ 部分実装 | 日本国内配送API統合未実装 |

---

## 3. API ルート接続状況

### 見积 → 注文フロー

```
[見積作成]
   ↓
POST /api/quotations/save
   ↓
quotations テーブル + quotation_items テーブル
   ↓
GET /api/member/quotations (一覧表示)
   ↓
GET /api/member/quotations/[id] (詳細)
   ↓
[見積承認・発注]
   ↓
POST /api/quotations/[id]/convert-to-order
   ↓
orders テーブル作成
```

**ステータス**: ✅ 完了（quotation_items 作成追加により完成）

### 注文 → データ入稿フロー

```
[注文作成]
   ↓
POST /api/orders/create
   ↓
orders テーブル
   ↓
[顧客データ入稿]
   ↓
POST /api/member/files/upload
   ↓
Supabase Storage にファイル保存
   ↓
POST /api/member/ai-extraction/upload
   ↓
AI によるデザインデータ抽出
   ↓
POST /api/member/ai-extraction/approve
   ↓
抽出データ承認
```

**ステータス**: ⚠️ 部分実装（各APIは存在するがワークフロー連携未完結）

### データ入稿 → 韓国送信フロー

```
[AI抽出データ承認]
   ↓
POST /api/member/korea/send-data
   ↓
韓国パートナーへメール送信（SendGrid）
   ↓
orders.current_stage = 'DATA_TO_KR'
```

**ステータス**: ❌ 未実装（APIはあるが実際のメール送信ロジックが必要）

---

## 4. データベース関連確認

### quotations → quotation_items 関連

```sql
-- quotations テーブル
CREATE TABLE quotations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  quotation_number TEXT NOT NULL UNIQUE,
  status quotation_status NOT NULL DEFAULT 'draft',
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  ...
);

-- quotation_items テーブル
CREATE TABLE quotation_items (
  id UUID PRIMARY KEY,
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10, 2) NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED,
  specifications JSONB,
  ...
);
```

**確認事項**:
- ✅ `quotations.user_id` は NOT NULL 制約（認証必須）
- ✅ `quotation_items.quotation_id` は外部キー制約
- ✅ ON DELETE CASCADE で引用レコード自動削除

---

## 5. 今後の実装タスク

### Phase 2 残タスク（TASK.md より）

| タスク | 優先度 | 依存関係 | ステータス |
|--------|--------|----------|-----------|
| Task 1: Stage 6 - 韓国メールデータ送付 | 高 | なし | ❌ 未実装 |
| Task 2: AI抽出データメール本文フォーマット | 高 | Task 1 | ❌ 未実装 |
| Task 3: Stage 7 - 教正データ管理者アップロード画面 | 高 | なし | ❌ 未実装 |
| Task 4: JPG プレビュー要件検証 | 中 | Task 3 | ❌ 未実装 |
| Task 5: Stage 7 - 教正データ DB保存・顧客通知 | 高 | Task 3, 4 | ❌ 未実装 |
| Task 6: Stage 8 - 仕様書生成・承認ワークフロー | 高 | Task 5 | ❌ 未実装 |
| Task 7: Stage 9 - DocuSign 電子契約統合 | 高 | Task 6 | ⚠️ 部分実装 |
| Task 8: Stage 10 - 製作追跡改善 | 中 | Task 7 | ⚠️ 部分実装 |
| Task 9: Stage 11 - EMS 配送追跡メール受信 | 中 | Task 8 | ❌ 未実装 |
| Task 10: Stage 12 - 日本国内配送 API 統合 | 中 | Task 9 | ❌ 未実装 |
| Task 11: 納品書 PDF 生成・自動送信 | 中 | Task 10 | ❌ 未実装 |
| Task 12: 通知システム改善 | 低 | なし | ⚠️ 部分実装 |

---

## 6. セッション安定化に関する検証項目

### 検証方法

1. **ログイン → 30分待機 → ページ遷移**
   - 期待結果: セッション維持、再ログイン不要
   - 検証方法: `curl -v --cookie-jar cookies.txt --cookie cookies.txt http://localhost:3000/api/auth/session`

2. **クッキー確認**
   - 期待値: `sb-access-token` の `max-age` = 1800
   - 検証方法: ブラウザ開発者ツール → Application → Cookies

3. **自動リフレッシュ確認**
   - 期待結果: 5分前に自動リフレッシュ
   - 検証方法: コンソールログで `[AuthContext] Session expiring soon, refreshing...` を確認

---

## 7. 結論と推奨事項

### 完了項目

1. ✅ **セッション安定化**: 30分非アクティブセッション維持が実装完了
2. ✅ **見積保存**: quotation_items テーブルへのレコード作成が実装完了
3. ✅ **エラーハンドリング**: 見積保存時のエラー表示が改善完了

### 次期実装推奨（優先順位順）

1. **Stage 6-8 の実装**（韓国データ連携）
   - Task 1-6 を実装し、データ入稿→仕様書承認までのフローを完結

2. **DocuSign 統合の完了**（Stage 9）
   - Task 7 を完了し、電子契約フローを実装

3. **配送追跡の強化**（Stage 11-12）
   - Task 8-11 を実装し、製作→配送の可視化を完成

### 技術的負債

1. **ゲストユーザー対応**: DB `user_id NOT NULL` 制約のため、現在は認証必須
   - 将来の要件により、ゲストユーザー対応のために DB マイグレーションが必要

2. **Supabase MCP 未使用**: 計画では Supabase MCP execute_sql を使用する予定だったが、
   - 現状は `createClient` で直接実装
   - 将来の移行時に MCP への移行を検討

---

**作成者**: Claude Code
**レビュー日**: 2025-01-30
