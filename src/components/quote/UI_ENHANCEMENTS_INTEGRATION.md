# UI/UX改善コンポーネント統合ガイド

## 概要

このドキュメントでは、新しく作成したUI/UX改善コンポーネントの統合方法と使用例を説明します。

## 新規コンポーネント

### 1. StatusIndicator

現在のSKU数量設定の状態をコンパクトに表示します。

**ファイル:** `src/components/quote/StatusIndicator.tsx`

**使用例:**

```tsx
import { StatusIndicator } from '@/components/quote/StatusIndicator';

<StatusIndicator
  skuCount={quoteState.skuCount}
  totalQuantity={totalQuantity}
  estimatedPrice={quoteState.unitPrice * totalQuantity}
  recommendations={{
    hasTwoColumnOptions: twoColumnOptions !== null,
    hasSKUSplitOptions: skuSplitOptions.length > 0,
    hasCostSavings: true,
    savingsRate: 15
  }}
  isRollFilm={quoteState.bagTypeId === 'roll_film'}
/>
```

**配置場所:** UnifiedSKUQuantityStepのヘッダー直後

### 2. CurrentStateSummary

仕様情報、総数量、SKU数、見積価格を1箇所にまとめて表示します。

**ファイル:** `src/components/quote/CurrentStateSummary.tsx`

**使用例:**

```tsx
import { CurrentStateSummary } from '@/components/quote/CurrentStateSummary';

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
  isRollFilm={quoteState.bagTypeId === 'roll_film'}
  isComplete={validateQuantities()}
/>
```

**配置場所:** UnifiedSKUQuantityStepの最後

### 3. RecommendationPanel

2列生産オプションとSKU分割オプションを表示し、詳細なフィードバックを提供します。

**ファイル:** `src/components/quote/RecommendationPanel.tsx`

**使用例:**

```tsx
import { RecommendationPanel } from '@/components/quote/RecommendationPanel';

<RecommendationPanel
  twoColumnOptions={twoColumnOptions}
  skuSplitOptions={skuSplitOptions}
  onApplyTwoColumn={handleApplyTwoColumnOption}
  onApplySKUSplit={handleApplySKUSplit}
  totalQuantity={totalQuantity}
  currentUnitPrice={quoteState.unitPrice}
/>
```

**配置場所:** UnifiedSKUQuantityStepの最後（既存の2列生産オプション表示の置き換え）

### 4. 拡張されたErrorToast

「元に戻す」アクションと詳細情報をサポートするように拡張されました。

**新規プロパティ:**

```tsx
{
  // メッセージ内容
  message: 'オプションを適用しました',

  // 元に戻すアクション
  undoAction: {
    label: '元に戻す',
    onClick: () => {
      // 元の状態に戻す処理
      handleUndo();
    }
  },

  // 詳細情報（オプション）
  details: [
    'SKU数: 1種類',
    '数量: 1,000個',
    '割引: 15% OFF'
  ],

  // 自動的に閉じない（persistent）
  persistent: true
}
```

## UnifiedSKUQuantityStepへの統合例

以下は、既存の`UnifiedSKUQuantityStep.tsx`に新しいコンポーネントを統合する例です：

```tsx
// 追加のインポート
import { StatusIndicator } from './StatusIndicator';
import { CurrentStateSummary } from './CurrentStateSummary';
import { RecommendationPanel } from './RecommendationPanel';

// UnifiedSKUQuantityStepコンポーネント内
return (
  <div className="space-y-6">
    {/* 既存のヘッダー */}
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Layers className="w-5 h-5" />
          SKU・数量設定
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          複数のデザイン（SKU）の数量を設定してください
        </p>
      </div>
    </div>

    {/* 新規: ステータスインジケーター */}
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

    {/* 既存のSKU Quantities Input */}
    {/* ... */}

    {/* 新規: 推奨パネル（既存の2列生産オプション表示を置き換え） */}
    <RecommendationPanel
      twoColumnOptions={twoColumnOptions}
      skuSplitOptions={skuSplitOptions}
      onApplyTwoColumn={handleApplyTwoColumnOption}
      onApplySKUSplit={handleApplySKUSplit}
      totalQuantity={totalQuantity}
      currentUnitPrice={quoteState.unitPrice}
    />

    {/* 新規: 現在の状態サマリー */}
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
);
```

## 拡張ErrorToastの使用例

```tsx
import { useToast } from './ErrorToast';

const { showSuccess } = useToast();

// オプション適用時の通知
showSuccess(
  '2列生産オプションを適用しました',
  0, // duration=0で自動的に閉じない
  {
    undoAction: {
      label: '元に戻す',
      onClick: () => {
        // 元の状態に戻す処理
        setSKUCount(previousSkuCount);
        setSKUQuantities(previousQuantities);
      }
    },
    details: [
      `SKU数: 1種類`,
      `数量: ${newQuantity.toLocaleString()}個`,
      `割引: 15% OFF`,
      `節減額: ¥${savings.toLocaleString()}`
    ],
    persistent: true
  }
);
```

## 既存ロジックの維持

すべての新しいコンポーネントは以下の点を維持しています：

1. **データフローの維持**: 既存の`quoteState`からデータを読み取り、既存のハンドラー関数を呼び出す
2. **型定義の使用**: 既存の型定義（`TwoColumnProductionOptions`, `SKUSplitOption`など）を再利用
3. **計算ロジックの維持**: 既存の計算ロジック（`pouchCostCalculator`など）をそのまま使用

## 注意事項

1. **条件付きレンダリング**: これらのコンポーネントは、適切なデータがある場合のみ表示されます
2. **既存コードとの互換性**: 既存の2列生産オプション表示は、新しい`RecommendationPanel`で置き換え可能です
3. **アニメーション**: Framer Motionを使用して、スムーズなトランジションを実現しています

## テスト

新しいコンポーネントを統合した後、以下をテストしてください：

1. SKU数量の変更がステータスインジケーターに正しく反映されること
2. 推奨パネルの「適用」ボタンが既存のハンドラー関数を正しく呼び出すこと
3. 現在の状態サマリーが正しい情報を表示すること
4. 拡張トーストが「元に戻す」アクションと詳細情報を正しく表示すること
