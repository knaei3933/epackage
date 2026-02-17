# 見積システム価格計算式詳細

## 📊 目次

1. [価格計算の概要](#価格計算の概要)
2. [基本定数](#基本定数)
3. [素材価格設定](#素材価格設定)
4. [フィルム原価計算](#フィルム原価計算)
5. [パウチ加工費計算](#パウチ加工費計算)
6. [配送料計算](#配送料計算)
7. [価格計算の詳細フロー](#価格計算の詳細フロー)
8. [SKU別価格計算](#SKU別価格計算)
9. [顧客別割引率適用](#顧客別割引率適用)
10. [計算例](#計算例)

---

## 価格計算の概要

### 価格計算の全体フロー

```
┌─────────────────────────────────────────────────────────────────┐
│                     価格計算の全体フロー                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. フィルム原価計算 (KRW)                                      │
│     ├─ 素材費                                                   │
│     ├─ 印刷費                                                   │
│     ├─ ラミネート費                                             │
│     ├─ スリッター費                                             │
│     └─ 表面処理費                                               │
│                                                                 │
│  2. パウチ加工費計算 (KRW)                                     │
│     ├─ 基本加工費                                               │
│     └─ ジッパー追加料金                                         │
│                                                                 │
│  3. 基礎原価 (KRW) = フィルム原価 + パウチ加工費                  │
│                                                                 │
│  4. 製造者価格 (KRW) = 基礎原価 × 1.4 (40%マージン)              │
│                                                                 │
│  5. 円貨製造者価格 (JPY) = 製造者価格 × 0.12                    │
│                                                                 │
│  6. 関税 (JPY) = 円貨製造者価格 × 0.05 (5%)                      │
│                                                                 │
│  7. 配送料 (JPY) = 総重量から計算                                 │
│                                                                 │
│  8. 小計 (JPY) = 円貨製造者価格 + 関税 + 配送料                    │
│                                                                 │
│  9. 販売マージン適用 (20%)                                       │
│     販売マージン適用後価格 = 小計 × 1.2                           │
│                                                                 │
│ 10. 顧客別割引率適用                                            │
│     最終価格 = 販売マージン適用後価格 × (1 + markupRate)            │
│     - markupRate=0.0: 割引なし                                  │
│     - markupRate=-0.1: 10%割引                                  │
│                                                                 │
│ 11. SKU追加料金 = (SKU数 - 1) × ¥10,000                         │
│                                                                 │
│ 12. 後加工乗数適用                                              │
│                                                                 │
│ 13. 100円単位の切り上げ                                         │
│     切り上げ後価格 = Math.ceil(価格 / 100) × 100                 │
│                                                                 │
│ 14. 単価 = 切り上げ後価格 / 総数量                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 基本定数

### 価格計算基本定数 (`src/lib/pricing/core/constants.ts`)

```typescript
// ========================================
// 基本定数
// ========================================
export const PRICING_CONSTANTS = {
  /** 最小注文数量（パウチ） */
  MIN_ORDER_QUANTITY: 100,

  /** 最大注文数量 */
  MAX_ORDER_QUANTITY: 100000,

  /** 小ロット閾値 */
  SMALL_LOT_THRESHOLD: 3000,

  /** 最小価格（無効化） */
  MINIMUM_PRICE: 0,

  /** ロールフィルム最小注文数量（m） */
  ROLL_FILM_MIN_QUANTITY: 500,

  /** ロールフィルム固定ロス（m） */
  ROLL_FILM_LOSS_METERS: 400,

  /** 製造者マージン率 */
  MANUFACTURER_MARGIN: 0.4,  // 40%

  /** 販売マージン率 */
  SALES_MARGIN: 0.2,  // 20%

  /** 関税率 */
  DUTY_RATE: 0.05,  // 5%

  /** 為替レート（KRW→JPY） */
  EXCHANGE_RATE_KRW_TO_JPY: 0.12,

  /** デフォルトロス率 */
  DEFAULT_LOSS_RATE: 0.4,  // 40%

  /** デフォルト原反幅（mm） */
  DEFAULT_MATERIAL_WIDTH: 760,

  /** 後加工デフォルト乗数 */
  DEFAULT_POST_PROCESSING_MULTIPLIER: 1.0,
} as const
```

### パウチ配送設定

```typescript
export const POUCH_DELIVERY_CONSTANTS = {
  /** 箱容量（kg） */
  BOX_CAPACITY_KG: 29,

  /** 1箱あたり配送料（ウォン） */
  DELIVERY_COST_PER_BOX_KRW: 127980,
} as const
```

---

## 素材価格設定

### 韓国素材価格 (KRW/kg)

| 素材 | 単価 (ウォン/kg) | 密度 (kg/m³) |
|------|------------------|--------------|
| **PET** | 2,800 | 1.40 |
| **AL** (アルミニウム) | 7,800 | 2.71 |
| **LLDPE** | 2,800 | 0.92 |
| **NY** (ナイロン) | 5,400 | 1.16 |
| **VMPET** | 3,600 | 1.40 |
| **CPP** | 2,700 | 0.91 |

### パウチ加工費設定 (KRW)

| パウチタイプ | 係数 | 最小価格 (ウォン) |
|------------|------|-------------------|
| **flat_3_side** (三方シール) | 0.4 | 200,000 |
| **stand_up** (スタンドアップ) | 1.2 | 250,000 |
| **t_shape** (T方) | 1.2 | 440,000 |
| **m_shape** (M方) | 1.2 | 440,000 |
| **box** (ボックス型) | 1.2 | 440,000 |
| **other** (その他) | 1.0 | 200,000 |

### ジッパー追加料金 (KRW)

| パウチタイプ | ジッパー追加料金 |
|------------|------------------|
| **flat_3_side** | 50,000 |
| **stand_up** | 30,000 |
| **t_shape** | 0 (対応していない) |
| **m_shape** | 0 (対応していない) |
| **box** | 0 (対応していない) |

### 印刷コスト設定

| 印刷方式 | セットアップ費 (ウォン) | 1色あたり (ウォン/m) | 最小料金 (ウォン) |
|----------|------------------------|----------------------|-------------------|
| **digital** (デジタル印刷) | 10,000 | 475 | 5,000 |
| **gravure** (グラビア印刷) | 50,000 | 200 | 20,000 |

### 厚さオプション乗数

| 厚さタイプ |乗数| 説明 |
|-----------|------|------|
| **light** | 0.9 | 軽量タイプ (~100g) |
| **light_medium** | 0.95 | 中軽量タイプ (~300g) |
| **medium** | 1.0 | 標準タイプ (~500g) |
| **heavy** | 1.1 | 高耐久タイプ (~800g) |
| **ultra** | 1.2 | 超耐久タイプ (800g~) |

### 後加工乗数

| オプション | 乗数 |
|----------|------|
| **zipper-yes** | 1.25 |
| **matte** | 1.0 (追加費で処理) |
| **glossy** | 1.0 |
| **hologram** | 1.15 |
| **embossing** | 1.1 |

---

## フィルム原価計算

### フィルム原価計算式

```
フィルム原価 (KRW) = 素材費 + 印刷費 + ラミネート費 + スリッター費 + 表面処理費
```

### 素材費計算

```
素材費 (KRW) = {
  総厚 (mm) × {
    PET厚 × 単価(PET) +
    AL厚 × 単価(AL) +
    LLDPE厚 × 単価(LLDPE) +
    ...
  }
} × 総メートル数
```

### 印刷費計算

```
印刷費 (KRW) = {
  原反幅 × 色数 × 単価(ウォン/m/色)
}
```

### ラミネート費計算

```
ラミネート費 (KRW) = {
  原反幅 × 単価(ウォン/m) × 総メートル数
}

// LAMINATION_COST_PER_M = 75 ウォン/m
```

### スリッター費計算

```
スリッター費 (KRW) = {
  MIN(
    SLITTER_MIN_COST,
    原反幅 × SLITTER_COST_PER_M × 総メートル数
  )
}

// SLITTER_MIN_COST = 30,000 ウォン
// SLITTER_COST_PER_M = 10 ウォン/m
```

---

## パウチ加工費計算

### パウチ加工費計算式

```typescript
// src/lib/pouch-cost-calculator.ts Line 912-927

// パウチ横幅をcmに変換
const widthCM = widthMM / 10;

// 基本加工費を計算（数量比例）
const baseProcessingCostKRW = widthCM * costConfig.pricePerCm * quantity;

// 最小価格との比較
let finalCostKRW = Math.max(baseProcessingCostKRW, costConfig.minimumPrice);

// ジッパー追加の場合の価格調整
if (hasZipper) {
  const surcharge = ZIPPER_SURCHARGE[pouchType] || 0;
  finalCostKRW += surcharge;
}
```

### パウチ加工費単価 (ウォン/cm)

| パウチタイプ | 単価 (ウォン/cm) | 最小価格 (ウォン) |
|------------|-------------------|-------------------|
| **flat_3_side** | coefficient × 1000 | 200,000 |
| **stand_up** | coefficient × 1000 | 250,000 |
| **t_shape** | coefficient × 1000 | 440,000 |
| **m_shape** | coefficient × 1000 | 440,000 |
| **box** | coefficient × 1000 | 440,000 |

---

## 配送料計算

### 配送重量計算式

```typescript
// src/lib/pouch-cost-calculator.ts Line 1076-1099

// パウチ1個の面積 (mm²)
const areaMM2 = (dimensions.width + 15) * dimensions.height;

// 面積 (m²)
const areaM2 = areaMM2 / 1000000;

// レイヤー総厚 (mm)
const totalThicknessMM = layers.reduce((sum, layer) => {
  return sum + (layer.thickness / 1000); // μm → mm
}, 0);

// 体積 (m²·mm)
const volume = areaM2 * totalThicknessMM;

// 重量 (kg) = 体積 × 平均比重 / 1,000,000
const AVERAGE_DENSITY = 1.0; // kg/m³（簡略計算用）
const weightKG = volume * AVERAGE_DENSITY / 1000000 * quantity;
```

### 配送料計算式

```typescript
// src/lib/pouch-cost-calculator.ts Line 481-488

// 必要な箱数の計算（29kg/箱）
const BOX_CAPACITY_KG = 29;
const deliveryBoxes = Math.ceil(totalDeliveryWeight / BOX_CAPACITY_KG);

// 総配送料の計算（箱数 × 1箱あたりの配送料）
const DELIVERY_COST_PER_BOX_KRW = 127980;
const EXCHANGE_RATE = 0.12;
const totalDeliveryJPY = deliveryBoxes * DELIVERY_COST_PER_BOX_KRW * EXCHANGE_RATE;
```

### 配送料計算例

| 総重量 (kg) | 必要箱数 | 配送料 (ウォン) | 配送料 (円) |
|-------------|----------|-----------------|-------------|
| 0 ~ 29 | 1箱 | 127,980 | 15,358 |
| 29.1 ~ 58 | 2箱 | 255,960 | 30,715 |
| 58.1 ~ 87 | 3箱 | 383,940 | 46,073 |

---

## 価格計算の詳細フロー

### 完全な価格計算フロー

```typescript
// src/lib/pouch-cost-calculator.ts Line 959-1003

private calculateCostBreakdown(
  filmCostResult: FilmCostResult,
  pouchProcessingCostKRW: number,
  quantity: number,
  deliveryJPY: number,
  markupRate: number
): SKUCostBreakdown {

  const EXCHANGE_RATE = 0.12;

  // ========================================
  // 1. 基礎原価 (KRW)
  // ========================================
  const baseCostKRW = filmCostResult.totalCostKRW + pouchProcessingCostKRW;

  // ========================================
  // 2. 製造者価格 (KRW) - Margin 40%
  // ========================================
  const manufacturerPriceKRW = baseCostKRW * 1.4;
  const manufacturingMarginKRW = manufacturerPriceKRW - baseCostKRW;

  // ========================================
  // 3. 円貨製造者価格 (JPY) - 為替換算
  // ========================================
  const manufacturerPriceJPY = manufacturerPriceKRW * EXCHANGE_RATE;

  // ========================================
  // 4. 関税 (JPY) - 円貨で計算
  // ========================================
  const dutyJPY = manufacturerPriceJPY * 0.05;

  // ========================================
  // 5. 配送料 (JPY)
  // ========================================
  // deliveryJPYは引数で渡される（総重量から計算済み）

  // ========================================
  // 6. 小計 (JPY) - 円貨製造者価格 + 関税 + 配送料
  // ========================================
  const subtotalJPY = manufacturerPriceJPY + dutyJPY + deliveryJPY;

  // ========================================
  // 7. 販売マージン適用（20%）- 全製品で統一
  // ========================================
  const SALES_MARGIN = 0.2; // 20%販売マージン
  const priceAfterSalesMargin = subtotalJPY * (1 + SALES_MARGIN);
  const salesMarginJPY = priceAfterSalesMargin - subtotalJPY;

  // ========================================
  // 8. 最終販売価格 (JPY) - 顧客別割引率を適用
  // ========================================
  // markupRate=0.0: 割引なし、markupRate=-0.1: 10%割引
  const finalPriceJPY = priceAfterSalesMargin * (1 + markupRate);
  const customerDiscountJPY = finalPriceJPY - priceAfterSalesMargin;

  return {
    materialCost: roundedMaterialCost,
    printingCost: roundedPrintingCost,
    laminationCost: roundedLaminationCost,
    slitterCost: roundedSlitterCost,
    pouchProcessingCost: roundedPouchProcessingCost,
    manufacturingMargin: roundedManufacturingMargin,
    duty: roundedDutyJPY,
    delivery: roundedDeliveryJPY,
    salesMargin: roundedSalesMarginJPY,
    totalCost: consistentTotalCost
  };
}
```

### 価格計算の数式

```
基礎原価 (KRW) = フィルム原価 + パウチ加工費

製造者価格 (KRW) = 基礎原価 × 1.4
                   (製造者マージン40%込)

円貨製造者価格 (JPY) = 製造者価格 × 0.12

関税 (JPY) = 円貨製造者価格 × 0.05

小計 (JPY) = 円貨製造者価格 + 関税 + 配送料

販売マージン適用後価格 (JPY) = 小計 × 1.2
                            (販売マージン20%込)

最終価格 (JPY) = 販売マージン適用後価格 × (1 + markupRate)

  - markupRate=0.0: 割引なし
  - markupRate=-0.1: 10%割引
  - markupRate=-0.2: 20%割引
```

---

## SKU別価格計算

### SKU別価格計算の基本概念

SKU（Stock Keeping Unit）別に数量が異なる場合、**数量比で按分**して計算します。

```typescript
// src/lib/pouch-cost-calculator.ts Line 410-476

// 各SKUの配分を計算（数量比で按分）
const costPerSKU = skuQuantities.map((quantity, index) => {
  const quantityRatio = quantity / totalQuantity;

  // フィルム原価を数量比で按分
  const allocatedFilmCost: FilmCostResult = {
    ...totalFilmCostResult,
    totalCostKRW: totalFilmCostResult.totalCostKRW * quantityRatio,
    materialCost: totalFilmCostResult.materialCost * quantityRatio,
    printingCost: totalFilmCostResult.printingCost * quantityRatio,
    laminationCost: totalFilmCostResult.laminationCost * quantityRatio,
    slitterCost: totalFilmCostResult.slitterCost * quantityRatio,
    surfaceTreatmentCost: totalFilmCostResult.surfaceTreatmentCost * quantityRatio,
    deliveryCostJPY: 0 // 後で計算
  };

  // パウチ加工費を数量比で按分
  const allocatedPouchProcessingCostKRW = totalPouchProcessingCostKRW * quantityRatio;

  // 配送料は仮計算（後で上書き）
  const costBreakdown = this.calculateCostBreakdown(
    allocatedFilmCost,
    allocatedPouchProcessingCostKRW,
    quantity,
    15358,  // デフォルト配送料（後で上書き）
    markupRate
  );

  return {
    skuIndex: index,
    quantity,
    theoreticalMeters,
    securedMeters,
    costJPY,
    costBreakdown,
    deliveryWeight
  };
});
```

### 配送料のSKU別按分

```typescript
// src/lib/pouch-cost-calculator.ts Line 497-520

// 総配送重量の計算（全SKUの合計）
const totalDeliveryWeight = costPerSKU.reduce((sum, sku) => sum + (sku.deliveryWeight || 0), 0);

// 必要な箱数の計算（29kg/箱）
const deliveryBoxes = Math.ceil(totalDeliveryWeight / 29);

// 総配送料の計算（箱数 × 1箱あたりの配送料）
const totalDeliveryJPY = deliveryBoxes * 127980 * 0.12;

// 各SKUの配送料を再計算（数量比で按分）
const updatedCostPerSKU = costPerSKU.map(sku => {
  const deliveryJPY = totalDeliveryJPY * (sku.quantity / totalQuantity);

  const newCostBreakdown = {
    ...sku.costBreakdown,
    delivery: Math.round(deliveryJPY),
    totalCost: (sku.costBreakdown.totalCost - sku.costBreakdown.delivery) + deliveryJPY
  };

  return { ...sku, costBreakdown: newCostBreakdown };
});
```

### SKU追加料金

```typescript
// src/lib/unified-pricing-engine.ts Line 1426-1438

// SKU数量に基づく追加料金計算
const skuCount = skuQuantities.length;
const skuSurcharge = Math.max(0, (skuCount - 1) * 10000);

// 計算式: (skuCount - 1) × ¥10,000
// 1 SKU: ¥0
// 2 SKUs: ¥10,000
// 3 SKUs: ¥20,000
// ...
```

---

## 顧客別割引率適用

### 顧客別割引率の仕組み

顧客別割引率は**データベースの `profiles.markup_rate` カラム**に保存されています。

```typescript
// src/components/quote/wizards/ImprovedQuotingWizard.tsx Line 3919-3937

// Get customer-specific markup rate (if logged in)
let markupRate = 0.0; // デフォルトは割引なし

if (user?.id) {
  try {
    const response = await fetch('/api/user/markup-rate', { cache: 'no-store' });
    if (response.ok) {
      const result = await response.json();
      markupRate = result.data?.markupRate ?? 0.0;
    }
  } catch (error) {
    console.warn('Failed to fetch markup rate, using default 0.0');
  }
}
```

### 顧客別割引率の例

| ユーザー | markup_rate | 説明 |
|---------|------------|------|
| **kim@kanei-trade.co.jp** | 0.0 | 割引なし |
| **arwg22@gmail.com** | -0.1 | 10%割引 |
| **一般顧客** | 0.0 | 割引なし（デフォルト） |

### 顧客別割引率の適用計算

```
最終価格 (JPY) = 販売マージン適用後価格 × (1 + markupRate)

例1: kim@kanei-trade.co.jp (markupRate=0.0)
  最終価格 = 販売マージン適用後価格 × 1.0
  = 販売マージン適用後価格（割引なし）

例2: arwg22@gmail.com (markupRate=-0.1)
  最終価格 = 販売マージン適用後価格 × 0.9
  = 販売マージン適用後価格 × 90%（10%割引）
```

---

## 計算例

### 計算例: 1SKU, 500個

**条件:**
- 製品: 三方シール平袋
- サイズ: 200 × 300 mm
- 素材: PET/AL (pet_al)
- 厚さ: medium (標準)
- 数量: 500個
- 印刷: デジタル印刷, フルカラー
- 顧客: kim@kanei-trade.co.jp (markupRate=0.0)

**計算ステップ:**

1. **フィルム原価計算 (KRW)**:
   ```
   素材費 = 各レイヤーの厚さ × 単価 × メートル数
   印刷費 = 原反幅 × 色数 × 475 ウォン/m/色
   ラミネート費 = 原反幅 × 75 ウォン/m × メートル数
   スリッター費 = MIN(30000, 原反幅 × 10 ウォン/m × メートル数)
   ```

2. **パウチ加工費 (KRW)**:
   ```
   基本加工費 = 20 cm × 0.4 × 1000 × 500 = 4,000,000 ウォン
   最小価格 = 200,000 ウォン
   最終加工費 = MAX(4,000,000, 200,000) = 4,000,000 ウォン
   ```

3. **基礎原価 (KRW)**:
   ```
   基礎原価 = フィルム原価 + パウチ加工費
   ```

4. **製造者価格 (KRW)**:
   ```
   製造者価格 = 基礎原価 × 1.4
   ```

5. **円貨製造者価格 (JPY)**:
   ```
   円貨製造者価格 = 製造者価格 × 0.12
   ```

6. **関税 (JPY)**:
   ```
   関税 = 円貨製造者価格 × 0.05
   ```

7. **配送料 (JPY)**:
   ```
   配送重量 = パウチ面積 × レイヤー総厚 × 数量
   箱数 = CEILING(配送重量 / 29)
   配送料 = 箱数 × 127980 × 0.12
   ```

8. **小計 (JPY)**:
   ```
   小計 = 円貨製造者価格 + 関税 + 配送料
   ```

9. **販売マージン適用 (20%)**:
   ```
   販売マージン適用後価格 = 小計 × 1.2
   ```

10. **顧客別割引適用**:
    ```
    最終価格 = 販売マージン適用後価格 × (1 + 0.0)
            = 販売マージン適用後価格
    ```

11. **100円単位の切り上げ**:
    ```
    切り上げ後価格 = Math.ceil(最終価格 / 100) × 100
    ```

12. **単価計算**:
    ```
    単価 = 切り上げ後価格 / 500
    ```

### 計算例: 2SKU, 500個ずつ

**条件:**
- SKU1: 500個
- SKU2: 500個
- 総数量: 1000個
- その他条件は上記と同じ

**追加料金:**
```
SKU追加料金 = (2 - 1) × ¥10,000 = ¥10,000
最終価格 = 上記計算結果 × 2 + ¥10,000
```

---

## まとめ

### 価格計算の要点

1. **韓国原価計算ベース**: すべての原価は韓国ウォンで計算されます
2. **製造者マージン40%**: 基礎原価に40%を加算して製造者価格を計算
3. **為替換算**: 韓国ウォンから日本円へは0.12のレートで換算
4. **関税5%**: 円貨製造者価格に対して5%の関税を適用
5. **販売マージン20%**: 小計に対して一律20%の販売マージンを適用
6. **顧客別割引**: 販売マージン適用後に顧客別割引率を適用
7. **SKU追加料金**: SKU数に応じて¥10,000単位で追加
8. **100円単位切り上げ**: 最終価格を100円単位で切り上げ

### 価格計算式の全体像

```
最終価格 = [
  (
    (
      (
        (
          (フィルム原価 + パウチ加工費) × 1.4  // 製造者マージン
        ) × 0.12  // 為替レート
      ) × 1.05  // 関税込み
    ) + 配送料  // 小計
  ) × 1.2  // 販売マージン
] × (1 + markupRate)  // 顧客別割引
+ SKU追加料金
] × 後加工乗数
→ 100円単位で切り上げ
```

---

*ドキュメント作成日: 2026-02-17*
*最終更新日: 2026-02-17 (販売マージン20%適用の修正を反映)*
