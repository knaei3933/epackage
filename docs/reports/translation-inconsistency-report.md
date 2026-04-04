# 後加工オプション日本語翻訳不整合報告書

**作成日**: 2026-04-04
**検証範囲**: 全ページ・全コンポーネントの後加工オプション日本語翻訳
**標準定義ファイル**: `src/constants/enToJa.ts`

---

## 1. 要約

### 問題概要
- **13ファイル**で翻訳不整合を確認
- **5つの主要な後加工オプション**で表記揺れ
- 標準定義（`enToJa.ts`）と実際のページ表示が一致していない

### 影響を受けるページ
| カテゴリ | ページ/コンポーネント |
|---------|---------------------|
| **メンバーページ** | `/member/quotations`, `/member/quotations/[id]` |
| **管理ページ** | `/admin/quotations`, `/admin/orders/[id]` |
| **共通コンポーネント** | `SpecApprovalModal.tsx` |
| **見積ウィザード** | `ImprovedQuotingWizard.tsx`, `ResultStep.tsx` |
| **シミュレーター** | `PostProcessingPreview.tsx` |
| **API** | `admin/quotations/[id]/route.ts` |

---

## 2. 主要な翻訳不整合詳細

### 2.1 zipper-yes / zipper-no

**標準定義** (`enToJa.ts`):
```typescript
'zipper-yes': 'ジッパー付き',
'zipper-no': 'ジッパーなし',
```

| ファイル | zipper-yes | zipper-no | ステータス |
|---------|-----------|-----------|----------|
| `enToJa.ts` | ジッパー付き | ジッパーなし | ✅ 標準 |
| `QuotationDetailClient.tsx` | ジッパー付き | ジッパーなし | ✅ 一致 |
| `ImprovedQuotingWizard.tsx` | ジッパー付き | ジッパーなし | ✅ 一致 |
| `ResultStep.tsx` | ジッパー付き | ジッパーなし | ✅ 一致 |
| `OrderSummarySection.tsx` | ジッパー付き | ジッパーなし | ✅ 一致 |
| `QuotationsClient.tsx` | **チャック付き** | **チャックなし** | ❌ 不一致 |
| `AdminQuotationsClient.tsx` | **チャック付き** | **チャックなし** | ❌ 不一致 |
| `AdminOrderDetailClient.tsx` | **チャック付き** | **チャックなし** | ❌ 不一致 |
| `SpecApprovalModal.tsx` | **チャック付き** | - | ❌ 不一致 |
| `PostProcessingPreview.tsx` | **ジッパーあり** | ジッパーなし | ❌ 不一致 |
| `api/quotations/[id]/route.ts` | **ジッパー** | ジッパーなし | ❌ 不一致 |

### 2.2 top-open

**標準定義** (`enToJa.ts`):
```typescript
'top-open': '上端開封',
```

| ファイル | top-open | ステータス |
|---------|----------|----------|
| `enToJa.ts` | **上端開封** | ✅ 標準 |
| `ImprovedQuotingWizard.tsx` | 上端開封 | ✅ 一致 |
| `ResultStep.tsx` | 上端開封 | ✅ 一致 |
| `OrderSummarySection.tsx` | 上端開封 | ✅ 一致 |
| `QuotationsClient.tsx` | **上部開放** | ❌ 不一致 |
| `AdminQuotationsClient.tsx` | **上部開放** | ❌ 不一致 |
| `AdminOrderDetailClient.tsx` | **上部開放** | ❌ 不一致 |
| `QuotationDetailClient.tsx` | **上部解放** | ❌ 不一致 |
| `SpecApprovalModal.tsx` | **上部開放** | ❌ 不一致 |

### 2.3 bottom-open

**標準定義** (`enToJa.ts`):
```typescript
'bottom-open': '下端開封',
```

| ファイル | bottom-open | ステータス |
|---------|-------------|----------|
| `enToJa.ts` | **下端開封** | ✅ 標準 |
| `QuotationsClient.tsx` | 下端開封 | ✅ 一致 |
| `AdminQuotationsClient.tsx` | 下端開封 | ✅ 一致 |
| `ImprovedQuotingWizard.tsx` | 下端開封 | ✅ 一致 |
| `ResultStep.tsx` | 下端開封 | ✅ 一致 |
| `OrderSummarySection.tsx` | 下端開封 | ✅ 一致 |
| `QuotationDetailClient.tsx` | **下端解放** | ❌ 不一致 |
| `AdminOrderDetailClient.tsx` | **下部開放** | ❌ 不一致 |

### 2.4 valve-yes

**標準定義** (`enToJa.ts`):
```typescript
'valve-yes': 'バルブ付き',
```

| ファイル | valve-yes | ステータス |
|---------|-----------|----------|
| `enToJa.ts` | **バルブ付き** | ✅ 標準 |
| `QuotationDetailClient.tsx` | バルブ付き | ✅ 一致 |
| `QuotationsClient.tsx` | バルブ付き | ✅ 一致 |
| `AdminQuotationsClient.tsx` | バルブ付き | ✅ 一致 |
| `ImprovedQuotingWizard.tsx` | バルブ付き | ✅ 一致 |
| `ResultStep.tsx` | バルブ付き | ✅ 一致 |
| `AdminOrderDetailClient.tsx` | **バルブあり** | ❌ 不一致 |
| `SpecApprovalModal.tsx` | **バルブ** | ❌ 不一致 |
| `PostProcessingPreview.tsx` | **バルブあり** | ❌ 不一致 |
| `api/quotations/[id]/route.ts` | **バルブ** | ❌ 不一致 |

### 2.5 hang-hole-6mm

**標準定義** (`enToJa.ts`):
```typescript
'hang-hole-6mm': '吊り下げ穴 (6mm)',
```

| ファイル | hang-hole-6mm | ステータス |
|---------|---------------|----------|
| `enToJa.ts` | **吊り下げ穴 (6mm)** | ✅ 標準 |
| `ImprovedQuotingWizard.tsx` | 吊り下げ穴 (6mm) | ✅ 一致 |
| `ResultStep.tsx` | 吊り下げ穴 (6mm) | ✅ 一致 |
| `OrderSummarySection.tsx` | 吊り下げ穴 (6mm) | ✅ 一致 |
| `QuotationsClient.tsx` | **吊り穴(6mm)** | ❌ 不一致 |
| `AdminQuotationsClient.tsx` | **吊り穴(6mm)** | ❌ 不一致 |
| `QuotationDetailClient.tsx` | **吊り穴(6mm)** | ❌ 不一致 |
| `SpecApprovalModal.tsx` | **吊り穴(6mm)** | ❌ 不一致 |
| `AdminOrderDetailClient.tsx` | **吊り穴(6mm)** | ❌ 不一致 |

### 2.6 notch-yes

**標準定義** (`enToJa.ts`):
```typescript
'notch-yes': 'ノッチ付き',
```

| ファイル | notch-yes | ステータス |
|---------|-----------|----------|
| `enToJa.ts` | **ノッチ付き** | ✅ 標準 |
| `ImprovedQuotingWizard.tsx` | ノッチ付き | ✅ 一致 |
| `ResultStep.tsx` | ノッチ付き | ✅ 一致 |
| `OrderSummarySection.tsx` | ノッチ付き | ✅ 一致 |
| `PostProcessingPreview.tsx` | **ノッチあり** | ❌ 不一致 |
| `SpecApprovalModal.tsx` | **ノッチあり** | ❌ 不一致 |
| `AdminOrderDetailClient.tsx` | **ノッチあり** | ❌ 不一致 |
| `api/quotations/[id]/route.ts` | **ノッチ** | ❌ 不一致 |

---

## 3. 不整合サマリーテーブル

### 3.1 全後加工オプションの翻訳一覧

| キー | 標準（enToJa.ts） | 使用されている翻訳（全パターン） |
|------|------------------|------------------------------|
| zipper-yes | ジッパー付き | ジッパー付き, **チャック付き**, ジッパーあり, ジッパー |
| zipper-no | ジッパーなし | ジッパーなし, **チャックなし** |
| top-open | 上端開封 | 上端開封, **上部開放**, **上部解放** |
| bottom-open | 下端開封 | 下端開封, **下端解放**, **下部開放** |
| valve-yes | バルブ付き | バルブ付き, **バルブあり**, バルブ |
| hang-hole-6mm | 吊り下げ穴 (6mm) | 吊り下げ穴 (6mm), **吊り穴(6mm)** |
| notch-yes | ノッチ付き | ノッチ付き, **ノッチあり**, ノッチ |

### 3.2 ファイル別不整合数

| ファイル | 不一致数 | 詳細 |
|---------|---------|------|
| `AdminQuotationsClient.tsx` | 3 | zipper, top-open, hang-hole |
| `AdminOrderDetailClient.tsx` | 5 | zipper, top-open, bottom-open, valve, hang-hole, notch |
| `QuotationsClient.tsx` | 3 | zipper, top-open, hang-hole |
| `QuotationDetailClient.tsx` | 3 | top-open, bottom-open, hang-hole |
| `SpecApprovalModal.tsx` | 4 | zipper, top-open, valve, hang-hole, notch |
| `PostProcessingPreview.tsx` | 3 | zipper, valve, notch |
| `api/quotations/[id]/route.ts` | 3 | zipper, valve, notch |

---

## 4. 推奨修正プラン

### 4.1 優先度：Critical（今週中に対応）

1. **`enToJa.ts` を唯一の標準として定義**
   - 全てのファイルで `POST_PROCESSING_JA` をインポートして使用
   - 各ファイル内のハードコードされた翻訳を削除

2. **主要な4ファイルを修正**
   - `QuotationsClient.tsx`
   - `AdminQuotationsClient.tsx`
   - `QuotationDetailClient.tsx`
   - `AdminOrderDetailClient.tsx`

### 4.2 具体的な修正手順

```typescript
// ❌ 修正前（各ファイルでハードコード）
const labelMap: Record<string, string> = {
  'zipper-yes': 'チャック付き',  // 不一致
  'zipper-no': 'チャックなし',
  'top-open': '上部開放',        // 不一致
  // ...
};

// ✅ 修正後（標準定義をインポート）
import { POST_PROCESSING_JA } from '@/constants/enToJa';

// 使用時
const label = POST_PROCESSING_JA['zipper-yes'] || 'zipper-yes';
```

### 4.3 統一後の標準翻訳

| キー | 統一後の日本語 |
|------|---------------|
| zipper-yes | ジッパー付き |
| zipper-no | ジッパーなし |
| top-open | 上端開封 |
| bottom-open | 下端開封 |
| valve-yes | バルブ付き |
| valve-no | バルブなし |
| hang-hole-6mm | 吊り下げ穴 (6mm) |
| hang-hole-8mm | 吊り下げ穴 (8mm) |
| hang-hole-no | 吊り穴なし |
| notch-yes | ノッチ付き |
| notch-no | ノッチなし |
| glossy | 光沢仕上げ |
| matte | マット仕上げ |
| corner-round | 角丸 |
| corner-square | 角直角 |

---

## 5. 影響評価

### 5.1 ユーザー体験への影響
- **視覚的不整合**: 同じオプションがページによって異なる日本語で表示される
- **混乱の可能性**: 例えば「ジッパー付き」と「チャック付き」が混在
- **信頼性低下**: 翻訳の一貫性の欠如は品質感を損なう

### 5.2 技術的負債
- 保守性低下: 翻訳変更時に複数のファイルを修正する必要がある
- バグリスク: 新しいページを追加する際に正しい翻訳を選ぶ必要がある
- テスト負荷: 各ページで翻訳を個別にテストする必要がある

---

## 6. 結論

**全てのページで統一された翻訳を使用するよう、以下の修正を推奨します：**

1. 全ファイルで `POST_PROCESSING_JA` をインポート
2. ハードコードされた翻訳を削除
3. `enToJa.ts` を唯一の標準として維持

これにより、ユーザー体験の一貫性が向上し、技術的負債が削減されます。

---

**報告者**: Translation Consistency Verification Team
**作成日時**: 2026-04-04
**検証方法**: Grepによるコード検索 + ファイル直接確認
