# Quote Simulator Page Component Refactoring Summary

## 実施日
2026-03-21

## 対象範囲
- `src/app/quote-simulator/page.tsx`
- `src/components/quote/wizards/ImprovedQuotingWizard.tsx` (4863行)
- `src/components/quote/sections/` 以下の関連コンポーネント

## 実施したリファクタリング

### 1. データ分離と定数ファイルの作成

#### 新規ファイル作成:

**`src/constants/materialData.ts`** (650行)
- `ImprovedQuotingWizard.tsx` から素材データを抽出
- 7種類の素材データ（pet_ldpe, pet_al, pet_vmpet, pet_ny_al, ny_lldpe, kraft_vmpet_lldpe, kraft_pet_lldpe）
- 各素材5つの厚さオプション
- ヘルパー関数: `getMaterialById()`, `getMaterialsByCategory()`, `getPopularMaterials()`, `getEcoFriendlyMaterials()`
- 型定義: `MaterialThicknessOption`, `MaterialData`

**`src/constants/contentsData.ts`** (100行)
- コンテンツ選択ドロップダウンのデータを抽出
- 製品カテゴリー、内容物の形態、主成分、流通環境の選択肢
- 型定義とヘルパー関数
- TypeScript 型安全な選択肢

**`src/constants/index.ts`**
- 定数ファイルの一元管理

### 2. 新規コンポーネントの作成

**`src/components/quote/sections/ContentsSelector.tsx`** (120行)
- `ImprovedQuotingWizard.tsx` の SpecsStep からコンテンツ選択UIを抽出
- 4つのドロップダウン（製品タイプ、内容物の形態、主成分、流通環境）
- 選択中の内容をリアルタイム表示
- Props型定義: `ContentsSelectorProps`

### 3. 既存コンポーネントの更新

**`src/components/quote/sections/MaterialSelection.tsx`**
- 新しい `@/constants/materialData` を使用するように更新
- ハードコードされた素材データを削除
- コード量を約400行削減

**`src/components/quote/sections/BasicInfoSection.tsx`**
- `@/types/quote-wizard` の `BAG_TYPE_OPTIONS` を使用するように更新
- ローカル定義を削除

**`src/components/quote/sections/index.ts`**
- `ContentsSelector` をエクスポートに追加
- 型定義のエクスポートを整理

### 4. カスタムフックの作成

**`src/hooks/quote/useSpecsValidation.ts`** (120行)
- 仕様ステップのバリデーションロジックを抽出
- 幅、高さ、深さ、素材、厚さの各バリデーション関数
- `useMemo` と `useCallback` でパフォーマンス最適化
- 型定義: `SpecsValidationResult`, `SizeValidation`

**`src/hooks/quote/index.ts`**
- `useSpecsValidation` をエクスポートに追加

### 5. 型定義の整理

**`src/types/quote-components.ts`** (新規、150行)
- コンポーネント間で共有される型定義を一元管理
- カテゴリー:
  - Trust Indicators
  - Material Types
  - Bag Types
  - Wizard Steps
  - Validation
  - Size Constraints
  - Post Processing
  - Quote Result
  - Multi-Quantity
  - Component Props

## メリット

### メンテナンス性向上
- 素材データの変更が1箇所で完結
- コンポーネントとデータが分離され、責任が明確
- 型定義が一元管理され、型安全性が向上

### コード削減
- `ImprovedQuotingWizard.tsx` の将来の削減予定: 約800行
- 重複する素材データ定義を削除

### 再利用性向上
- `ContentsSelector` は他の見積もり画面でも使用可能
- `useSpecsValidation` はバリデーションが必要な箇所で再利用可能
- 素材データは他の画面（商品詳細、カタログ等）で再利用可能

### パフォーマンス最適化
- `useMemo`、`useCallback` の適切な使用
- 定数データはメモリ効率が良い

## 今後の改善予定

### 短期的改善
1. `ImprovedQuotingWizard.tsx` から残りの素材データを削除（約800行）
2. SpecsStep コンポーネントを小さなサブコンポーネントに分割
3. PostProcessingStep コンポーネントの整理
4. ResultStep コンポーネントの分割

### 中長期的改善
1. `ImprovedQuotingWizard.tsx` のステップごとのファイル分割
2. ステート管理の最適化（Contextの分割検討）
3. ユニットテストの追加
4. ストーリーブックの作成

## ファイル構成の変更

```
src/
├── constants/
│   ├── index.ts (新規)
│   ├── materialData.ts (新規 650行)
│   └── contentsData.ts (新規 100行)
├── components/
│   └── quote/
│       ├── sections/
│       │   ├── index.ts (更新)
│       │   ├── ContentsSelector.tsx (新規 120行)
│       │   ├── MaterialSelection.tsx (更新 -400行)
│       │   └── BasicInfoSection.tsx (更新 -70行)
│       └── wizards/
│           └── ImprovedQuotingWizard.tsx (将来 -800行予定)
├── hooks/
│   └── quote/
│       ├── index.ts (更新)
│       └── useSpecsValidation.ts (新規 120行)
└── types/
    ├── quote-components.ts (新規 150行)
    └── quote-wizard.ts (既存)
```

## 技術的負債の解消

### 解決した問題
1. **巨大なモノリシックコンポーネント**: `ImprovedQuotingWizard.tsx` (4863行) の分割を開始
2. **データとUIの混在**: 素材データがコンポーネント内にハードコードされていた
3. **重複する型定義**: 複数のファイルで似たような型が定義されていた
4. **バリデーションロジックの分散**: バリデーションがコンポーネント内に散在していた

### 残る課題
1. `ImprovedQuotingWizard.tsx` がまだ大きい（4000行以上）
2. 一部のロジックがコンポーネント内に残っている
3. テストカバレッジの不足

## 次のステップ

1. `ImprovedQuotingWizard.tsx` の実際の削減作業を実行
2. 各ステップコンポーネントの独立ファイル化
3. パフォーマンスモニタリングと最適化
4. エラーハンドリングの強化
