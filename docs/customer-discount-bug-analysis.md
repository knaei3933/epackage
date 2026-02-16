# 顧客別割引率バグ分析レポート

作成日: 2026-02-17
状態: 🔴 **重大なバグ確認 - 修正が必要**

---

## 📋 問題概要

**ユーザー報告**: arwg22@gmail.com アカウントに -0.1（10%割引）を設定したが、見積もり価格が変わらない

---

## 🔍 根本原因

### 1. TypeScript型定義の問題
**ファイル**: `src/lib/supabase.ts` (186-217行目)

```typescript
export interface Profile {
    // ... 他のフィールド ...
    // ❌ markup_rate フィールドが存在しない
    // ❌ markup_rate_note フィールドが存在しない
}
```

**問題**: データベースには `markup_rate` と `markup_rate_note` カラムが存在するが、TypeScriptの型定義に含まれていない

---

### 2. 価格計算エンジンの問題 **（最重要）**

**ファイル**: `src/lib/unified-pricing-engine.ts`

#### 問題箇所1: `performSKUCalculation` メソッド（1296行目）

```typescript
markupRate = CONSTANTS.DEFAULT_MARKUP_RATE,  // パラメータを受け取る
```

✅ `markupRate` パラメータは受け取っている

#### 問題箇所2: 計算ロジック（1190-1204行目）

```typescript
// Step 3: 輸入原価 + 販売マージン = 最終販売価格
// ドキュメント基準: フィルムロール20%、パウチ加工品20%
// シナリオ確認済み: 全製品20%で統一
const salesMargin = 0.20;  // ❌ 固定値！markupRateが使われていない

// ...

// マークアップ適用情報を計算（全製品20%で統一）
const salesMarginRate = 0.20; // ❌ ここも固定値！
```

**❌ 問題**: `markupRate` パラメータが**完全に無視**され、固定の20%マージンが常に適用されている

---

## 🔄 現在のフロー分析

```
1. ImprovedQuotingWizard (3861行目)
   ↓ fetch('/api/user/markup-rate')
   ↓ markupRate = -0.1 (10%割引)

2. ImprovedQuotingWizard (3891行目)
   ↓ calculateQuote({ markupRate: -0.1, ... })
   ↓ ✅ パラメータは渡されている

3. UnifiedPricingEngine.calculateQuote (638行目)
   ↓ performSKUCalculation(params)

4. performSKUCalculation (1296行目)
   ↓ markupRate = CONSTANTS.DEFAULT_MARKUP_RATE (デフォルト値)
   ↓ ✅ パラメータは受け取っている

5. performSKUCalculation (1190行目)
   ↓ const salesMargin = 0.20
   ↓ ❌ ここで固定値に上書き！markupRateが無視される
```

---

## 📊 影響範囲

- ✅ **影響あり**: 全ての見積もり計算（SKUモード）
- ✅ **影響あり**: 顧客別割引機能（-0.5 ～ 0.0 の範囲）
- ✅ **影響あり**: `/api/admin/settings/customer-markup` で設定した値が反映されない

---

## ✅ 既に実装されている部分

1. **APIエンドポイント**: `/api/user/markup-rate` - 正常に動作
2. **フロントエンド呼び出し**: `ImprovedQuotingWizard` 3861行目 - 正常に実装
3. **パラメータ渡し**: `calculateQuote({ markupRate })` - 正しく渡されている

---

## 🔧 修正が必要な箇所

### 修正1: `src/lib/supabase.ts`

Profile型に `markup_rate` と `markup_rate_note` を追加：

```typescript
export interface Profile {
    // ... 既存のフィールド ...
    markup_rate?: number | null;        // 追加: 顧客別マークアップ率 (-0.5 ～ 0.0)
    markup_rate_note?: string | null;   // 追加: マークアップ率メモ
}
```

### 修正2: `src/lib/unified-pricing-engine.ts`

#### A. 1190行目付近

```typescript
// 修正前
const salesMargin = 0.20;  // 全製品20%で統一（ドキュメント準拠）

// 修正後
const salesMargin = markupRate;  // 顧客別マージン率を適用
```

#### B. 1203行目付近

```typescript
// 修正前
const salesMarginRate = 0.20; // 全製品20%で統一（ドキュメント準拠）

// 修正後
const salesMarginRate = markupRate; // 顧客別マージン率を適用
```

---

## 📝 管理者設定ページとの連携確認

### API: `/api/admin/settings/customer-markup`

✅ **動作確認済み**:
- GET: 顧客一覧と割引率を取得（ページネーション対応）
- PUT: 顧客別割引率を更新（バリデーション: -0.5 ～ 0.0）
- キャッシュ無効化: 更新後にキャッシュをクリア

### データベース

✅ **確認済み**:
- `profiles.markup_rate` カラム存在
- 制約: `-0.5 <= markup_rate <= 0`
- 25件の顧客データが存在

---

## 🧪 テスト計画

1. **通常価格（マージン20%）**: 未設定ユーザー
2. **10%割引（-0.1）**: arwg22@gmail.com
3. **20%割引（-0.2）**: テスト用アカウント
4. **50%割引（-0.5）**: VIP顧客

---

## 📝 まとめ

| 項目 | 状態 | 説明 |
|------|------|------|
| API実装 | ✅ 完了 | `/api/user/markup-rate` が動作 |
| フロントエンド呼出 | ✅ 完了 | `ImprovedQuotingWizard` が実装済み |
| パラメータ渡し | ✅ 完了 | `calculateQuote` に渡されている |
| **計算ロジック** | ❌ **未実装** | `markupRate` が使われていない |
| 型定義 | ⚠️ 不完全 | `Profile` 型に `markup_rate` がない |

---

## 🚀 次のステップ

1. `src/lib/supabase.ts` の `Profile` 型を修正
2. `src/lib/unified-pricing-engine.ts` の `performSKUCalculation` メソッドを修正
3. デプロイしてテスト
4. arwg22@gmail.com で10%割引が適用されることを確認
