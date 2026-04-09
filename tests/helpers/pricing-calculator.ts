/**
 * テスト用価格計算ユーティリティ
 *
 * 重要: 本番コードのPriceCalculationEngineを直接使用します
 * カスタム計算ロジックは実装せず、本番エンジンと完全に同じ結果を保証します
 */

import { PriceCalculationEngine } from '../../src/lib/pricing/PriceCalculationEngine';
import type {
  PriceCalculationInput,
  QuotePatternSpecification,
  QuotePatternCalculationResult,
} from '../../src/lib/pricing/types';

/**
 * テスト用簡易入力インターフェース
 */
export interface TestPricingInput {
  bagType: string;
  width: number;
  height: number;
  depth?: number;
  materialId: string;
  quantity: number;
  printColors?: {
    front: number;
    back: number;
    sides?: { left: number; right: number };
  };
  features?: {
    zipper?: boolean;
    notch?: boolean;
    hangHole?: boolean;
    cornerRound?: boolean;
  };
  userTier?: 'basic' | 'premium' | 'enterprise';
}

/**
 * 本番エンジンを使用した価格計算
 *
 * @param input - テスト入力データ
 * @returns 価格計算結果
 *
 * @example
 * ```typescript
 * const result = await calculatePricing({
 *   bagType: 'flat_3_side',
 *   width: 150,
 *   height: 200,
 *   depth: 30,
 *   materialId: 'transparent_pet_ny',
 *   quantity: 10000,
 *   printColors: { front: 2, back: 1 }
 * });
 * console.log(`Unit Price: ${result.priceBreakdown.unitPrice} JPY`);
 * ```
 */
export async function calculatePricing(
  input: TestPricingInput
): Promise<QuotePatternCalculationResult> {
  const engine = new PriceCalculationEngine();

  // テスト入力を本番エンジンの入力形式に変換
  const pattern: QuotePatternSpecification = {
    id: `test_${Date.now()}`,
    patternName: `Test Pattern ${input.bagType}`,
    skuCount: 1,
    quantity: input.quantity,
    bag: {
      bagTypeId: input.bagType,
      materialCompositionId: input.materialId,
      width: input.width,
      height: input.height,
      depth: input.depth,
      capacity: 0, // テスト用なので0でOK
    },
    printing: {
      printCoverage: 'partial',
      printQuality: 'standard',
      printPosition: 'center',
      printColors: {
        front: input.printColors?.front || 0,
        back: input.printColors?.back || 0,
        sides: input.printColors?.sides || { left: 0, right: 0 },
      },
    },
    features: {
      window: undefined,
      resealability: input.features?.zipper
        ? { type: 'zipper', position: 'top' }
        : undefined,
      customShape: input.features?.notch
        ? { dieLine: '', complexity: 'simple' }
        : undefined,
      barrier: undefined,
    },
  };

  // 本番エンジンで計算実行
  const calcInput: PriceCalculationInput = {
    pattern,
    userTier: input.userTier || 'basic',
    isRepeatOrder: false,
  };

  return await engine.calculatePrice(calcInput);
}

/**
 * 価格比較検証（許容範囲付き）
 *
 * @param actual - 実際の価格
 * @param expected - 期待値を計算するための入力
 * @param tolerance - 許容誤差（デフォルト: 1円）
 *
 * @example
 * ```typescript
 * await assertPricingMatch(
 *   { unitPrice: 150, totalPrice: 150000 },
 *   { bagType: 'flat_3_side', width: 150, height: 200, materialId: 'xxx', quantity: 1000 }
 * );
 * ```
 */
export async function assertPricingMatch(
  actual: {
    unitPrice: number;
    totalPrice: number;
  },
  expected: TestPricingInput,
  tolerance: number = 1
): Promise<void> {
  const calculated = await calculatePricing(expected);
  const expectedUnitPrice = calculated.priceBreakdown.unitPrice;
  const expectedTotalPrice = calculated.priceBreakdown.totalPrice;

  const errors: string[] = [];

  if (Math.abs(actual.unitPrice - expectedUnitPrice) > tolerance) {
    errors.push(
      `単価不一致: 期待=${expectedUnitPrice}, 実際=${actual.unitPrice}, 差=${
        Math.abs(actual.unitPrice - expectedUnitPrice)
      }`
    );
  }

  if (Math.abs(actual.totalPrice - expectedTotalPrice) > tolerance) {
    errors.push(
      `総額不一致: 期待=${expectedTotalPrice}, 実際=${actual.totalPrice}, 差=${
        Math.abs(actual.totalPrice - expectedTotalPrice)
      }`
    );
  }

  if (errors.length > 0) {
    throw new Error(`価格検証失敗:\n${errors.join('\n')}`);
  }
}

/**
 * 数量ブレイクポイント価格を計算
 *
 * @param input - 基本仕様
 * @param quantities - 計算する数量の配列
 * @returns 各数量の単価配列
 *
 * @example
 * ```typescript
 * const quantities = [500, 1000, 5000, 10000];
 * const unitPrices = await calculateBreakpointPricing(
 *   { bagType: 'flat_3_side', width: 150, height: 200, materialId: 'xxx' },
 *   quantities
 * );
 * console.log(unitPrices); // [180, 165, 150, 140] など
 * ```
 */
export async function calculateBreakpointPricing(
  input: Omit<TestPricingInput, 'quantity'>,
  quantities: number[]
): Promise<number[]> {
  const unitPrices: number[] = [];

  for (const qty of quantities) {
    const result = await calculatePricing({ ...input, quantity: qty });
    unitPrices.push(result.priceBreakdown.unitPrice);
  }

  return unitPrices;
}

/**
 * 単価が数量に応じて適切に減少しているか検証
 *
 * @param unitPrices - 単価配列（小さい数量から大きい数量の順）
 *
 * @example
 * ```typescript
 * const prices = [180, 165, 150, 140];
 * assertVolumeDiscountApplied(prices); // 通過: 単価が減少
 *
 * const badPrices = [180, 170, 175, 140];
 * assertVolumeDiscountApplied(badPrices); // エラー: 3番目が増加
 * ```
 */
export function assertVolumeDiscountApplied(unitPrices: number[]): void {
  for (let i = 1; i < unitPrices.length; i++) {
    if (unitPrices[i] > unitPrices[i - 1]) {
      throw new Error(
        `単価が数量${i}から${i + 1}で増加しています: ` +
        `${unitPrices[i - 1]} -> ${unitPrices[i]}`
      );
    }
  }
}

/**
 * KRW価格を計算（為替レート: 9.5）
 *
 * @param jpyPrice - JPY価格
 * @param exchangeRate - 為替レート（デフォルト: 9.5）
 * @returns KRW価格
 */
export function calculateKRWPrice(jpyPrice: number, exchangeRate: number = 9.5): number {
  return Math.round(jpyPrice * exchangeRate);
}

/**
 * 為替レートを検証
 *
 * @param jpyPrice - JPY価格
 * @param krwPrice - KRW価格
 * @param expectedRate - 期待為替レート（デフォルト: 9.5）
 * @param tolerance - 許容誤差（デフォルト: ±0.1）
 */
export function assertExchangeRate(
  jpyPrice: number,
  krwPrice: number,
  expectedRate: number = 9.5,
  tolerance: number = 0.1
): void {
  const actualRate = krwPrice / jpyPrice;
  const diff = Math.abs(actualRate - expectedRate);

  if (diff > tolerance) {
    throw new Error(
      `為替レート不一致: 期待=${expectedRate}±${tolerance}, 実際=${actualRate.toFixed(2)}`
    );
  }
}
