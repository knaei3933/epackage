/**
 * Pouch Geometry Calculations
 *
 * Pure functions for film width, column count, and meter calculations.
 * Extracted from PouchCostCalculator for testability.
 */

import type { PouchDimensions } from './types';
import { determineMaterialWidth, type MaterialWidthType } from '../material-width-selector';

export function calculateOptimalColumnCount(
    pouchType: string,
    dimensions: PouchDimensions,
    totalQuantity: number,
    materialWidth: number
  ): number {
    // ========================================
    // ロールフィルムの場合: 1~7列まで対応
    // ========================================
    if (pouchType === 'roll_film') {
      const rollFilmWidth = dimensions.width; // ロール幅（mm）
      const MAX_PRINTABLE_WIDTH = 740; // 760mm原反の印刷可能幅

      // 最大列数計算
      const maxColumns = Math.floor(MAX_PRINTABLE_WIDTH / rollFilmWidth);

      // 数量による条件（ユーザー指示 2026-06-29: 500mから製品幅に合わせて最大分割）
      // ロールフィルムの totalQuantity はメートル数そのもの
      if (totalQuantity < 500) {
        return 1; // 500m未満は1列
      }

      // 可能な最大列数を使用（効率極大化）
      return Math.min(maxColumns, 7); // 最大7列
    }

    // ========================================
    // パウチの場合: 物理可能な最大列数を常に使用（フィルム消費最小化）
    // 【수정 2026-07-05】2列固定・1000m閾値を廃止。
    // 常に「1列フィルム幅 ≤ 印刷可能幅」を満たす最大N列を選択する。
    // 2列割引(0.85/0.70)ルールは廃止し、列数はフィルム使用量削減目的のみ。
    // ※ 呼出元 calculateSKUCost で既に bestColumnCount を算出済みの場合は
    //    ここは参照用。materialWidth から印刷可能幅を再計算して最大列数を返す。
    const singleColumnWidth = calculateFilmWidth(pouchType, dimensions, 1);
    const pw = materialWidth === 590 ? 570 : materialWidth === 760 ? 740 : materialWidth === 780 ? 760 : 1170;
    return Math.max(1, Math.floor(pw / singleColumnWidth));
  }

  /**
   * SKU別原価計算メインメソッド
   */


export function calculateFilmWidth(
    pouchType: string,
    dimensions: PouchDimensions,
    columnCount: number = 1,
    hasZipper: boolean = false
  ): number {
    const { height: H, width: W, depth: G = 0 } = dimensions;
    const N = Math.max(1, Math.floor(columnCount));
    // 가이드 02-필름폭: 지퍼 유무에 따라 열간 간격이 다름
    // - 지퍼 없음: 2열=(H×4)+41 (간격 0)
    // - 지퍼 있음: 2열=(H×4)+71 (간격 30)
    const interColGap = hasZipper ? 30 : 0;

    switch (pouchType) {
      case 'roll_film':
        // 롤 필름: columnCount × 롤 폭
        return W * N;

      case 'flat_3_side':
      case 'three_side':
      case 'zipper':
        // 1列=(H×2)+41, 2열 지퍼없음=(H×4)+41, 2열 지퍼있음=(H×4)+71
        // N列=(H×2)×N + 41 + (N-1)×interColGap
        return (H * 2) * N + 41 + (N - 1) * interColGap;

      case 'stand_up':
      case 'zipper_stand':
        // 1列=(H×2)+(G×2)+35, 2列=(H×4)+(G×2)+40 → N列=(H×2)×N + (G×2) + 35 + (N-1)×5
        return (H * 2) * N + (G * 2) + 35 + (N - 1) * 5;

      case 'spout':
      case 'spout_pouch':
        // スパウトパウチ: スタンドパウチと同じN列公式
        return (H * 2) * N + (G * 2) + 35 + (N - 1) * 5;

      case 't_shape':
        // 1列=(W×2)+22, 2列=(W×4)+64 → N列=(W×2)×N + 22 + (N-1)×42
        return (W * 2) * N + 22 + (N - 1) * 42;

      case 'box':
        // 1列=(G+W)×2+32, 2列=(G+W)×4+84 → N列=((G+W)×2)×N + 32 + (N-1)×52
        return ((G + W) * 2) * N + 32 + (N - 1) * 52;

      default:
        return (H * 2) * N + 41 + (N - 1) * 30;
    }
  }

  /**
   * 理論メートル数計算
   * @param quantity 数量
   * @param dimensions 寸法
   * @param pouchType パウチタイプ (ピッチ決定用)
   * @param columnCount 列数
   */


export function calculateTheoreticalMeters(
    quantity: number,
    dimensions: PouchDimensions,
    pouchType: string,
    columnCount: number = 1
  ): number {
    // ガイド 04-미터수_및_원가_계산.md 基準ピッチ決定（2026-03-07訂正版）
    // 横向き印刷（平袋/スタンド/スパウト）: ピッチ = W(幅)
    // 展開図基準（合掌袋T封/ガゼットM封）: ピッチ = H(高さ)
    let pitch: number;

    if (pouchType.includes('m_shape') || pouchType.includes('box')) {
      // ガゼットパウチ（M封）: ピッチ = H（高さ）
      // 展開図基準で生産するため、縦方向が進行方向
      pitch = dimensions.height;
    } else if (pouchType.includes('t_shape') || pouchType.includes('center_seal')) {
      // 合掌袋（T封）: ピッチ = H（高さ）
      // 展開図基準で生産するため、縦方向が進行方向
      pitch = dimensions.height;
    } else {
      // 平袋、スタンドパウチ、スパウトパウチ: ピッチ = W（幅）
      // 横向き印刷、横方向が進行方向
      pitch = dimensions.width;
    }

    // DEBUG: ピッチ計算ログ
    console.log('[calculateTheoreticalMeters]', {
      pouchType,
      dimensions,
      pitch,
      columnCount,
      quantity
    });

    // 1mあたり生産可能数 = (1000 / ピッチ) * 列数
    const pouchesPerMeter = (1000 / pitch) * columnCount;

    // 理論メートル数 = 数量 / 1mあたり生産可能数
    const result = quantity / pouchesPerMeter;
    console.log('[calculateTheoreticalMeters] result:', { pouchesPerMeter, result });
    return result;
  }

  /**
   * 確保量計算（商品タイプ別ルール）
   *
   * docs/reports/calcultae/00-README.md 基準
   *
   * 【パウチ商品】
   * - 最小確保量: なし（1m単位でOK）
   * - 切り上げ単位: 1m単位
   *
   * 【ロールフィルム商品】
   * - 1SKU: 500m
   * - 2+SKU: 各300m
   * - 切り上げ単位: 50m単位
   */


export function calculateSecuredMeters(
    theoreticalMeters: number,
    skuCount: number,
    pouchType: string
  ): number {
    // ロールフィルムの場合
    if (pouchType === 'roll_film') {
      const minMetersPerSku = skuCount === 1 ? 500 : 300;
      if (theoreticalMeters <= minMetersPerSku) {
        return minMetersPerSku;
      }
      return Math.ceil(theoreticalMeters / 50) * 50;
    }

    // パウチ商品の場合: 最小確保量なし、1m単位
    // docs/reports/calcultae/시나리오_상세/02-소량생산_시나리오.md 参照
    // 例: 500個パウチ、理論メートル60m → 確保量60m（切り上げなし）
    return Math.ceil(theoreticalMeters);
  }

  /**
   * 원단 폭 자동 결정 (인쇄폭/패우치 폭 기준)
   * 클라트 재료는 780/1190mm, 일반 재료는 590/760mm를 사용
   */


export function selectMaterialWidth(printingWidth: number, materialId?: string): MaterialWidthType {
    return determineMaterialWidth(printingWidth, materialId);
  }

  // --------------------------------------------------------------------------
  // Core Calculation Methods
  // --------------------------------------------------------------------------

  /**
   * フィルム原価計算
   */


export function roundDownToHundreds(quantity: number): number {
    return Math.floor(quantity / 100) * 100;
  }

  /**
   * SKU分割オプション計算
   *
   * docs/reports/calcultae/07-SKU_및_병렬생산.md 参照
   *
   * @param economicQuantity 経済的数量
   * @param minSKUParts 最小SKU数（デフォルト: 2）
   * @param maxSKUParts 最大SKU数（デフォルト: 10）
   * @param minQuantityPerSKU 1 SKUあたりの最小数量（デフォルト: 500）
   * @returns SKU分割オプション配列
   */

