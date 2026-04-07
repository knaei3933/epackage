# スタンドパウチ2列生産有効化修正

## 日付
2026-04-07

## 修正内容

### 問題
計算ドキュメント（`05-스탠드파우치_시나리오.md`）にはスタンドパウチの2列生産例が記載されているが、実装コードでは除外されていた。

### 修正ファイル
`src/lib/pouch-cost-calculator.ts`

### 修正箇所

#### 1. `calculateOptimalColumnCount`メソッド（行406-412）
**修正前:**
```typescript
if (pouchType.includes('spout') || pouchType.includes('stand')) {
  return 1; // スパウト・スタンドパウチ: 常に1列
}
```

**修正後:**
```typescript
if (pouchType.includes('spout')) {
  return 1; // スパウトパウチ: 常に1列
}
// 【修正】スタンドパウチは2列生産を許可（計算ドキュメント05-스탠드파우치_시나리오.md基準）
// フィルム幅700mm ≤ 740mm（760mm原反の印刷可能幅）で2列生産可能
```

#### 2. `canUseTwoColumnProduction`メソッド（行2002-2010）
**修正前:**
```typescript
if (pouchType === 'roll_film' ||
    pouchType === 'spout_pouch' ||
    pouchType.includes('stand') ||  // スタンドパウチは常に1列生産
    pouchType.includes('t_shape') ||
    pouchType.includes('m_shape') ||
    pouchType.includes('box')) {
  return false;
}
```

**修正後:**
```typescript
if (pouchType === 'roll_film' ||
    pouchType === 'spout_pouch' ||
    pouchType.includes('t_shape') ||
    pouchType.includes('m_shape') ||
    pouchType.includes('box')) {
  return false;
}
// スタンドパウチの除外を削除
```

## 計算式

### スタンドパウチのフィルム幅計算
```
1列: (H × 2) + G + 35
2列: (H × 4) + (G × 2) + 40
```

### 例: 130×130×30mm
```
1列: (130 × 2) + 30 + 35 = 325mm → 590mm原反
2列: (130 × 4) + (30 × 2) + 40 = 600mm → 760mm原反 ✅ OK
```

### 2列生産条件
- 理論メートル >= 1,000m
- 2列フィルム幅 <= 740mm（760mm原反の印刷可能幅）

## 割引効果
| 項目 | 1列生産 | 2列生産 |
|------|---------|---------|
| 原価削減率 | - | **30%削減** |
| 顧客割引 | - | **15% OFF** |
| 販売者マージン | 20% | **35%** (+15%) |

## 動作確認
1. quote-simulatorでスタンドパウチを選択
2. 数量を10,000個以上に設定
3. 「2列生産お得オプション」が表示されることを確認
