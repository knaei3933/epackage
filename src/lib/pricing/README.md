# Pricing Engine Refactoring

## 概要

価格計算エンジンを統一・リファクタリングし、戦略パターンを使用して製品タイプ別の計算ロジックを分離しました。

## 新しい構造

```
src/lib/pricing/
├── core/
│   ├── types.ts              # 核心型定義
│   ├── constants.ts          # 定数定義
│   └── engine.ts             # PricingEngineメインクラス
├── strategies/
│   ├── base-strategy.ts      # 戦略基底クラス
│   ├── pouch-strategy.ts     # パウチ製品戦略
│   └── roll-film-strategy.ts # ロールフィルム戦略
├── __tests__/
│   └── pricing-engine.test.ts # 単体テスト
├── adapter.ts                # 既存エンジン互換アダプター
└── index.ts                  # モジュールエクスポート
```

## 戦略パターン設計

### PricingStrategy インターフェース
- `strategyId`: 戦略識別子
- `supportedProductTypes`: 対応製品タイプ配列
- `calculate(params)`: 価格計算実行
- `validate(params)`: パラメータ検証

### BasePricingStrategy
共通ロジックを提供する抽象基底クラス：
- 素材費計算（抽象メソッド）
- 加工費計算（抽象メソッド）
- 印刷費計算（デフォルト実装）
- 配送料計算（デフォルト実装）
- マージン適用（共通ロジック）
- 結果構築（共通ロジック）

### 具体戦略クラス
- **PouchStrategy**: 三辺シール、スタンドアップ、T/M方、ボックス等
- **RollFilmStrategy**: ロールフィルム製品

## 移行方法

### 新しいエンジンを使用

```typescript
import { pricingEngine } from '@/lib/pricing'

const result = await pricingEngine.calculatePrice({
  bagTypeId: 'flat_3_side',
  materialId: 'pet_al',
  width: 200,
  height: 300,
  quantity: 1000,
  thicknessSelection: 'medium',
})
```

### 既存コードとの互換性

```typescript
import { pricingEngineAdapter } from '@/lib/pricing/adapter'

// 既存のunified-pricing-engine.tsと同じインターフェース
const result = await pricingEngineAdapter.calculateQuote(params)
```

## テスト結果

```
Test Suites: 1 passed, 1 total
Tests:       17 passed, 17 total
```

全テストが通過しており、以下の機能が検証されています：
- 戦略登録と取得
- パウチ製品価格計算（三辺シール、スタンドアップ）
- 後加工オプション反映（ジッパー、マット仕上げ）
- ロールフィルム価格計算
- パラメータ検証
- キャッシュ機能
- 厚さ選択による価格変動
- 緊急度によるリードタイム変動

## 次のステップ

1. 既存コードをアダプター経由で新エンジンに移行
2. unified-pricing-engine.ts (2,425行) を段階的に廃止
3. pricing-engine.ts (372行) を新エンジンに統合
4. SKU計算の高度化（現在は基本実装のみ）
