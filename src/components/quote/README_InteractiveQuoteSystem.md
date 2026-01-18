# Interactive Quote System - 統合見積システム

## 概要

InteractiveQuoteSystemは、従来の分離されたStep 1見積プロセスを単一のインタラクティブインターフェースに統合した革新的なソリューションです。ユーザーは製品タイプ、サイズ、素材、厚さを1画面で選択し、リアルタイムで価格を確認できます。

## 主な機能

### 1. 統合されたインターフェース
- **単一画面**: 製品タイプ、サイズ、素材、厚さの選択を1画面で統合管理
- **直感的なフロー**: 論理的な順序で並べられた選択項目
- **リアルタイムフィードバック**: 選択時の即時バリデーションと視覚的状態表示

### 2. 製品タイプ選択
- 5種類の基本製品タイプ (三方シール平袋、スタンドパウチ、BOX型パウチ、スパウトパウチ、ロールフィルム)
- 視覚的アイコンと詳細説明の提供
- 人気製品バッジ表示
- ホバー効果および選択状態の視覚化

### 3. サイズ設定
- **手動入力**: 最小50mmからの自由なサイズ入力
- **プリセットオプション**: 小/中/大サイズのクイック選択
- **リアルタイムバリデーション**: 最小サイズ未満入力時の即時フィードバック
- **面積計算**: 選択されたサイズの面積(mm²)を即時表示

### 4. 素材選択
- 4種類の高級素材オプション (PET + アルミニウム箔、PET + アルミニウム蒸着、PET + LLDPE、PET + ナイロン + アルミニウム箔)
- **詳細情報**: 各素材の特性と倍率(multiplier)情報
- **人気素材表示**: ユーザー嗜好ベースの推奨
- **フィーチャーバッジ**: 主要機能を簡潔に表示

### 5. 厚さ選択 (動的)
- **素材従属**: 選択された素材に応じて動的に表示
- **4種類の等級**: 軽量/標準/高耐久/超耐久タイプ
- **詳細仕様**: 正確なフィルム構成表示 (例: PET12μ+AL７μ+PET12μ+LLDPE60μ)
- **コスト表示**: コストダウン/標準/高耐久等級表示

### 6. 数量設定
- **複数数量パターン**: 複数の数量を同時比較可能 (最小500個)
- **クイックプリセット**: 500、1k、2k、5k、10k、20kボタン
- **動的追加**: 必要に応じて新しい数量フィールドを追加
- **削除機能**: 不要な数量フィールドを削除

### 7. リアルタイム価格計算
- **即時計算**: すべての選択が完了するとリアルタイムで価格計算
- **数量別比較**: 最大3つの数量パターンの単価表示
- **割引率表示**: 数量に応じた割引率の自動計算
- **視覚的プレビュー**: カード形式の価格情報表示

## 技術的特徴

### 状態管理
```typescript
interface FormData {
  productType: string
  size: { width: number; height: number }
  material: string
  thickness?: string
  quantities: number[]
}
```

### リアルタイムバリデーション
```typescript
interface ValidationState {
  productType: boolean
  size: boolean
  material: boolean
  thickness: boolean
  quantity: boolean
  isValid: boolean
}
```

### 価格計算ロジック
- 基本価格 × サイズ倍率 × 素材倍率 × 厚さ倍率 × (1 - 割引率)
- 数量に応じた動的割引率の適用
- リアルタイム更新

### ユーザー体験改善
1. **プログレス追跡**: 現在の選択状態を視覚的に表示
2. **ホバー効果**: インタラクティブなUIフィードバック
3. **アニメーション**: スムーズな遷移効果
4. **レスポンシブデザイン**: モバイル/タブレット/デスクトップ対応
5. **アクセシビリティ**: キーボードナビゲーションおよびスクリーンリーダー対応

## 統合方式

### 従来のシステム
```
Step 1: 製品タイプ → Step 2: サイズ/数量 → Step 3: 素材/厚さ
```

### 新しいシステム
```
統合されたStep 1: すべての仕様を1画面で選択 → Step 2: 詳細設定 → Step 3: 結果
```

## ファイル構造

```
src/components/quote/
├── InteractiveQuoteSystem.tsx     # 新しい統合コンポーネント
├── UnifiedQuoteSystem.tsx         # 従来システム (更新済み)
└── README_InteractiveQuoteSystem.md  # このドキュメント
```

## 使用例

### コンポーネントインポート
```typescript
import { InteractiveQuoteSystem } from '@/components/quote/InteractiveQuoteSystem'

function QuotePage() {
  const handleStepComplete = (data) => {
    console.log('Step 1 completed:', data)
    // 次のステップへ移動
  }

  return (
    <InteractiveQuoteSystem
      onStepComplete={handleStepComplete}
      initialData={{
        productType: 'stand_up',
        size: { width: 120, height: 160 },
        material: 'pet_al',
        thickness: 'medium',
        quantities: [1000, 2000]
      }}
    />
  )
}
```

### UnifiedQuoteSystem統合
```typescript
// UnifiedQuoteSystem.tsxで
const handleStep1Complete = (data) => {
  setStep1Data(data)
  setFormData(prev => ({
    ...prev,
    ...data
  }))
  setCurrentStep(2)
}

// Step 1部分
{currentStep === 1 && (
  <InteractiveQuoteSystem
    onStepComplete={handleStep1Complete}
    initialData={step1Data || undefined}
  />
)}
```

## ブラウザ対応

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- モバイルブラウザ (iOS Safari, Android Chrome)

## 性能最適化

1. **メモイゼーション**: useMemoを使用した計算最適化
2. **デバウンシング**: 価格計算のデバウンシング (必要に応じて追加可能)
3. **画像最適化**: Next.js Imageコンポーネント使用
4. **バンドルサイズ**: コード分割による初期ロード最適化

## 今後の改善点

1. **保存機能**: ユーザー選択のローカル保存
2. **比較機能**: 複数の設定を同時比較
3. **見積書エクスポート**: PDF生成機能との連携
4. **在庫確認**: リアルタイム在庫連携
5. **AI推奨**: ユーザーパターンベースの推奨システム

## 結論

InteractiveQuoteSystemは、ユーザー体験を最大化しながら、開発者には保守が容易な構造を提供します。単一のインタラクティブ画面により、見積プロセスを革新的に改善し、リアルタイムフィードバックと直感的なUIでコンバージョン率向上に寄与します。
