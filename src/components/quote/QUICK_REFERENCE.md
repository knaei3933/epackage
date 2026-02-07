# UI/UX改善コンポーネント クイックリファレンス

## 新規コンポーネント一覧

| コンポーネント | ファイルパス | 用途 |
|--------------|------------|------|
| **StatusIndicator** | `src/components/quote/StatusIndicator.tsx` | 現在のSKU数量設定の状態をコンパクトに表示 |
| **CurrentStateSummary** | `src/components/quote/CurrentStateSummary.tsx` | 仕様情報、総数量、SKU数、見積価格を一箇所にまとめて表示 |
| **RecommendationPanel** | `src/components/quote/RecommendationPanel.tsx` | 2列生産オプションとSKU分割オプションの表示（既存の置き換え） |
| **ErrorToast（拡張）** | `src/components/quote/ErrorToast.tsx` | 「元に戻す」アクションと詳細情報をサポート |

## クイック統合ガイド

### ステップ1: インポート

```tsx
import { StatusIndicator } from './StatusIndicator';
import { CurrentStateSummary } from './CurrentStateSummary';
import { RecommendationPanel } from './RecommendationPanel';
```

### ステップ2: UnifiedSKUQuantityStep.tsxに追加

**ヘッダーの直後に追加:**

```tsx
<div className="space-y-6">
  {/* 既存のヘッダー */}
  {/* ... */}

  {/* 追加: ステータスインジケーター */}
  <StatusIndicator
    skuCount={quoteState.skuCount}
    totalQuantity={totalQuantity}
    estimatedPrice={quoteState.unitPrice * totalQuantity}
    recommendations={{
      hasTwoColumnOptions: twoColumnOptions !== null,
      hasSKUSplitOptions: skuSplitOptions.length > 0,
      hasCostSavings: twoColumnOptions?.sameQuantity.savingsRate > 10,
      savingsRate: twoColumnOptions?.sameQuantity.savingsRate
    }}
    isRollFilm={isRollFilm}
  />

  {/* 既存のSKU Count Selection */}
  {/* ... */}
</div>
```

**最後に追加:**

```tsx
<div className="space-y-6">
  {/* 既存のSKU入力欄 */}
  {/* ... */}

  {/* 置き換え: 推奨パネル */}
  <RecommendationPanel
    twoColumnOptions={twoColumnOptions}
    skuSplitOptions={skuSplitOptions}
    onApplyTwoColumn={handleApplyTwoColumnOption}
    onApplySKUSplit={handleApplySKUSplit}
    totalQuantity={totalQuantity}
    currentUnitPrice={quoteState.unitPrice}
  />

  {/* 追加: 現在の状態サマリー */}
  <CurrentStateSummary
    specs={{
      bagTypeId: quoteState.bagTypeId,
      materialId: quoteState.materialId,
      width: quoteState.width,
      height: quoteState.height,
      depth: quoteState.depth,
      thicknessSelection: quoteState.thicknessSelection
    }}
    totalQuantity={totalQuantity}
    skuCount={quoteState.skuCount}
    estimatedPrice={quoteState.unitPrice * totalQuantity}
    isRollFilm={isRollFilm}
    isComplete={validateQuantities()}
  />
</div>
```

### ステップ3: 既存の2列生産オプション表示を削除（オプション）

既存の2列生産オプション表示（行926-1039）は、新しい`RecommendationPanel`で置き換え可能です。

既存のコードを削除する場合は、以下の範囲を削除してください：

```tsx
{/* 削除: 2列生産オプションとSKU分割オプションの推奨 */}
{(twoColumnOptions || (skuSplitOptions && skuSplitOptions.length > 0)) && !isRollFilm && totalQuantity >= 1000 && (
  <div className="space-y-4">
    {/* 既存の2列生産オプション表示 */}
    {/* ... */}
  </div>
)}
```

## Propsリファレンス

### StatusIndicator

```typescript
<StatusIndicator
  skuCount={number}              // 必須: SKU数
  totalQuantity={number}         // 必須: 総数量
  estimatedPrice={number}        // オプション: 見積価格
  recommendations={{             // オプション: 推奨情報
    hasTwoColumnOptions: boolean
    hasSKUSplitOptions: boolean
    hasCostSavings: boolean
    savingsRate?: number
  }}
  isRollFilm={boolean}           // オプション: ロールフィルムかどうか
/>
```

### CurrentStateSummary

```typescript
<CurrentStateSummary
  specs={{                       // 必須: 仕様情報
    bagTypeId: string
    materialId: string
    width: number
    height?: number
    depth?: number
    thicknessSelection?: string
  }}
  totalQuantity={number}         // 必須: 総数量
  skuCount={number}              // 必須: SKU数
  estimatedPrice={number}        // オプション: 見積価格
  isRollFilm={boolean}           // オプション: ロールフィルムかどうか
  isComplete={boolean}           // オプション: 設定完了かどうか
/>
```

### RecommendationPanel

```typescript
<RecommendationPanel
  twoColumnOptions={TwoColumnProductionOptions | null}  // オプション
  skuSplitOptions={SKUSplitOption[]}                     // オプション
  onApplyTwoColumn={(optionType: 'same' | 'double') => void}  // オプション
  onApplySKUSplit={(option: SKUSplitOption) => void}    // オプション
  totalQuantity={number}         // オプション: 現在の総数量
  currentUnitPrice={number}      // オプション: 現在の単価
/>
```

### 拡張ErrorToast

```typescript
const { showSuccess } = useToast();

showSuccess(
  'メッセージ',
  0,  // duration: 0 = 自動的に閉じない
  {
    undoAction: {
      label: '元に戻す',
      onClick: () => handleUndo()
    },
    details: [
      '詳細1',
      '詳細2',
      '詳細3'
    ],
    persistent: true
  }
);
```

## 既存ハンドラー関数

新しいコンポーネントは既存のハンドラー関数をそのまま使用します：

```typescript
// 既存のハンドラー（変更なし）
const handleApplyTwoColumnOption = (optionType: 'same' | 'double') => {
  if (!twoColumnOptions) return;
  const option = optionType === 'same'
    ? twoColumnOptions.sameQuantity
    : twoColumnOptions.doubleQuantity;
  setSKUCount(1);
  setSKUQuantities([option.quantity]);
  setQuantityMode('sku');
};

const handleApplySKUSplit = (splitOption: SKUSplitOption) => {
  setSKUCount(splitOption.skuCount);
  const quantities = Array(splitOption.skuCount).fill(splitOption.quantityPerSKU);
  setSKUQuantities(quantities);
  setQuantityMode('sku');
};
```

## よくある質問

**Q: 既存のロジックを変更する必要がありますか？**

A: いいえ。新しいコンポーネントは既存のロジックを完全に維持しています。既存のハンドラー関数とデータフローをそのまま使用します。

**Q: 既存の2列生産オプション表示を削除する必要がありますか？**

A: 必須ではありませんが、新しい`RecommendationPanel`は既存の機能を完全に置き換えることができます。両方を表示することも可能ですが、重複を避けるためどちらか一方をお勧めします。

**Q: アニメーションを無効にできますか？**

A: はい。各コンポーネントのFramer Motionの`motion.`を削除し、通常の`div`タグに変更してください。

**Q: スタイルをカスタマイズできますか？**

A: はい。Tailwind CSSクラスを変更することで、カラーやレイアウトをカスタマイズできます。

## トラブルシューティング

| 問題 | 解決策 |
|------|--------|
| **TypeScriptエラーが発生** | 型定義が正しくインポートされているか確認してください |
| **コンポーネントが表示されない** | 必要なpropsがすべて渡されているか確認してください |
| **アニメーションが遅い** | `transition={{ duration: 0.2 }}`の値を調整してください |
| **推奨オプションが表示されない** | `totalQuantity >= 1000`の条件を満たしているか確認してください |

## 関連ファイル

- **統合ガイド**: `src/components/quote/UI_ENHANCEMENTS_INTEGRATION.md`
- **完了レポート**: `UI_IMPROVEMENTS_SUMMARY.md`
- **既存コンポーネント**: `src/components/quote/UnifiedSKUQuantityStep.tsx`
- **型定義**: `src/components/quote/EconomicQuantityProposal.tsx`
- **コンテキスト**: `src/contexts/QuoteContext.tsx`

---

**バージョン:** 1.0
**最終更新:** 2026-01-28
