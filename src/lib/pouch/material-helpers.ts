/**
 * Pouch Material Helpers
 *
 * Material info and thickness adjustment logic.
 */

import type { FilmStructureLayer } from '../film-cost-calculator';
import type { PouchDimensions } from './types';

export function getMaterialInfo(materialId: string): { density: number } | null {
    const materialData: Record<string, { density: number }> = {
      'PET': { density: 1.40 },    // film-cost-calculator.tsと統一
      'AL': { density: 2.71 },     // film-cost-calculator.tsと統一
      'LLDPE': { density: 0.92 },  // 変更なし
      'NY': { density: 1.16 },     // film-cost-calculator.tsと統一
      'VMPET': { density: 1.40 },  // film-cost-calculator.tsと統一
      // KP_PE 재질용 추가
      'KP': { density: 0.91 },
      'PE': { density: 0.92 }
    };
    return materialData[materialId] || null;
  }

  /**
   * 厚さ選択に応じたフィルムレイヤー調整
   */


export function adjustLayersForThickness(
    baseLayers: FilmStructureLayer[],
    thicknessSelection: string
  ): FilmStructureLayer[] {
    if (!thicknessSelection) return baseLayers;

    const thicknessMultipliers: Record<string, number> = {
      'light': 0.9,
      'medium': 1.0,
      'heavy': 1.1,
      'ultra': 1.2
    };

    const multiplier = thicknessMultipliers[thicknessSelection];
    if (!multiplier || multiplier === 1.0) return baseLayers;

    return baseLayers.map(layer => {
      if (layer.materialId === 'LLDPE' || layer.materialId === 'PE') {
        return {
          ...layer,
          thickness: Math.round(layer.thickness * multiplier)
        };
      }
      return layer;
    });
  }

  /**
   * 経済的生産数量提案を計算
   *
   * パウチのピッチ（幅）に基づいて、フィルムの無駄を最小化する数量を提案
   *
   * @param orderQuantity 注文数量
   * @param dimensions パウチ寸法
   * @param pouchType パウチタイプ
   * @param currentFilmUsage 現在のフィルム使用量（m）
   * @param currentUnitPrice 現在の単価（円/個）
   * @param accurateCalculationParams 正確な原価計算用パラメータ（オプション）
   * @returns 経済的生産数量提案
   */


export function calculateDeliveryWeight(
    layers: FilmStructureLayer[],
    materialWidth: number,
    quantity: number,
    dimensions: PouchDimensions,
    pouchType: string = ''
  ): number {
    // パウチ1個の面積 (mm²): 앞면+뒷면 (W × H × 2) + 여유분 15mm
    const areaMM2 = (dimensions.width + 15) * dimensions.height * 2;

    // 面積 (m²)
    const areaM2 = areaMM2 / 1000000;

    // レイヤー総厚 (mm)
    const totalThicknessMM = layers.reduce((sum, layer) => {
      return sum + (layer.thickness / 1000); // μm → mm
    }, 0);

    // 体積 (m²·mm)
    const volume = areaM2 * totalThicknessMM;

    // 重量計算
    let totalWeight = 0;
    for (const layer of layers) {
      const materialInfo = getMaterialInfo(layer.materialId);
      if (materialInfo) {
        // 各レイヤーの体積比率計算
        const layerThicknessRatio = layer.thickness / 1000 / totalThicknessMM;
        const layerWeight = volume * layerThicknessRatio * materialInfo.density;
        totalWeight += layerWeight;
      }
    }

    // 全体重量 = 1個の重量 × 数量
    let netWeight = totalWeight * quantity;

    // 【중량 가산률 (2026-07-05)】
    // - 삼방파우치(flat_3_side): +10%
    // - 기타 파우치(stand_up, spout, box, t_shape 등): +15%
    const isFlatPouch = pouchType.includes('flat_3_side') || pouchType.includes('three_side');
    const weightSurcharge = isFlatPouch ? 0.10 : 0.15;
    netWeight = netWeight * (1 + weightSurcharge);

    return netWeight;
  }

  /**
   * 材料情報取得 (比重データ)
   * film-cost-calculator.tsのFILM_MATERIALSと同じ値を使用
   */

