/**
 * Confidence Scorer
 * 抽出されたデータの信頼度を計算するモジュール
 */

import type {
  ExtractedSpecs,
  ConfidenceScore,
  ConfidenceBreakdown,
  ValidationFlag,
  PDFStructure,
} from './types';

export class ConfidenceScorer {
  /**
   * 総合信頼度計算
   */
  calculate(
    extracted: ExtractedSpecs,
    sourcePDF: PDFStructure
  ): ConfidenceScore {
    const breakdown = this.calculateBreakdown(extracted, sourcePDF);
    const overall = this.calculateOverall(breakdown);
    const flags = this.generateFlags(breakdown, extracted);

    return {
      overall: Math.round(overall),
      dimensions: Math.round(this.average([
        breakdown.envelopeType,
        breakdown.size,
        breakdown.gusset,
      ])),
      material: Math.round(this.average([
        breakdown.materialStructure,
        breakdown.thickness,
      ])),
      printing: Math.round(this.average([
        breakdown.colors,
        breakdown.logo,
      ])),
      processing: Math.round(this.average([
        breakdown.zipper,
        breakdown.notch,
      ])),
      breakdown,
      flags,
    };
  }

  /**
   * 個別項目信頼度計算
   */
  private calculateBreakdown(
    extracted: ExtractedSpecs,
    source: PDFStructure
  ): ConfidenceBreakdown {
    return {
      envelopeType: this.scoreEnvelopeType(extracted.dimensions, source),
      size: this.scoreSize(extracted.dimensions, source),
      gusset: this.scoreGusset(extracted.dimensions.gusset),
      zipper: this.scoreZipper(extracted.processing.zipper),
      notch: this.scoreNotch(extracted.processing.notch),
      materialStructure: this.scoreMaterialStructure(extracted.material),
      thickness: this.scoreThickness(extracted.material.totalThickness),
      colors: this.scoreColors(extracted.printing.colors),
      logo: this.scoreLogo(extracted.printing.logos),
    };
  }

  /**
   * 封筒タイプ信頼度
   */
  private scoreEnvelopeType(
    dimensions: ExtractedSpecs['dimensions'],
    source: PDFStructure
  ): number {
    let score = 0;

    // 1. テキストラベル確認 (40点)
    const hasLabel = source.pages[0].texts.some(t =>
      /pouch|bag|stand|box|gusset|パウチ|袋|パック/i.test(t.content)
    );
    if (hasLabel) score += 40;

    // 2. 形状パターンマッチング (30点)
    const patternMatch = this.matchPattern(
      dimensions.envelopeType,
      dimensions
    );
    score += patternMatch * 30;

    // 3. 構成要素一致 (30点)
    const componentConsistency = this.checkComponentConsistency(dimensions);
    score += componentConsistency * 30;

    return Math.min(100, score);
  }

  /**
   * 寸法信頼度
   */
  private scoreSize(
    dimensions: ExtractedSpecs['dimensions'],
    source: PDFStructure
  ): number {
    let score = 0;

    // 1. パス存在 (30点)
    if (dimensions.width > 0 && dimensions.height > 0) {
      score += 30;
    }

    // 2. ダイライン色 (25点)
    if (dimensions.hasDieLine) {
      score += 25;
    }

    // 3. テキストラベル (25点)
    const hasSizeLabel = source.pages[0].texts.some(t =>
      /W?\d+\s*[×x]\s*H?\d+/i.test(t.content)
    );
    if (hasSizeLabel) score += 25;

    // 4. 標準規格一致 (20点)
    const isStandard = this.isStandardSize(dimensions);
    if (isStandard) score += 20;

    return Math.min(100, score);
  }

  /**
   * ギャセット信頼度
   */
  private scoreGusset(gusset?: number): number {
    if (!gusset) return 0;

    // 明示的に存在すれば高い信頼度
    return gusset > 0 ? 90 : 0;
  }

  /**
   * ジッパー信頼度
   */
  private scoreZipper(zipper?: ExtractedSpecs['processing']['zipper']): number {
    if (!zipper) return 100; // ないことが明確なら高い信頼度

    // ジッパーオブジェクトのconfidence使用
    return zipper.confidence || 70;
  }

  /**
   * ノッチ信頼度
   */
  private scoreNotch(notch?: ExtractedSpecs['processing']['notch']): number {
    if (!notch) return 100;

    return notch.confidence || 75;
  }

  /**
   * 素材構造信頼度
   */
  private scoreMaterialStructure(
    material: ExtractedSpecs['material']
  ): number {
    let score = 0;

    // 1. ソースベース
    switch (material.source) {
      case 'text_label':
        score += 60;
        break;
      case 'layer_name':
        score += 40;
        break;
      case 'inferred':
        score += 20;
        break;
      case 'manual':
        score += 90;
        break;
    }

    // 2. レイヤー数 (最低2層構造)
    if (material.layers.length >= 2) {
      score += 20;
    }

    // 3. 形式検証
    const formatValid = material.layers.every(
      layer => layer.material && layer.material.length >= 2
    );
    if (formatValid) score += 20;

    return Math.min(100, score);
  }

  /**
   * 厚さ信頼度
   */
  private scoreThickness(thickness?: number): number {
    if (!thickness) return 0;

    // 標準範囲 (50-200μm)
    if (thickness >= 50 && thickness <= 200) {
      return 85;
    }

    return 70;
  }

  /**
   * 色信頼度
   */
  private scoreColors(colors: ExtractedSpecs['printing']['colors']): number {
    let score = 0;

    // 1. タイプ別基本スコア
    switch (colors.type) {
      case 'spot':
        score += 50; // Pantoneコードは明確
        break;
      case 'cmyk':
        score += 70; // CMYKは標準
        break;
      case 'hybrid':
        score += 60;
        break;
    }

    // 2. 個数検証
    if (colors.type === 'cmyk' && colors.count <= 4) {
      score += 30;
    } else if (colors.type === 'spot' && colors.pantoneCodes) {
      score += colors.pantoneCodes.length * 10;
    }

    return Math.min(100, score);
  }

  /**
   * ロゴ信頼度
   */
  private scoreLogo(logos: ExtractedSpecs['printing']['logos']): number {
    if (logos.length === 0) return 100;

    const avgConfidence =
      logos.reduce((sum, logo) => sum + logo.confidence, 0) / logos.length;

    return avgConfidence;
  }

  /**
   * 総合信頼度 (加重平均)
   */
  private calculateOverall(breakdown: ConfidenceBreakdown): number {
    const weights: Record<keyof ConfidenceBreakdown, number> = {
      envelopeType: 0.15,
      size: 0.25,
      gusset: 0.10,
      zipper: 0.10,
      notch: 0.05,
      materialStructure: 0.15,
      thickness: 0.05,
      colors: 0.10,
      logo: 0.05,
    };

    return Object.entries(weights).reduce((sum, [key, weight]) => {
      return sum + (breakdown[key as keyof ConfidenceBreakdown] || 0) * weight;
    }, 0);
  }

  /**
   * 検証フラグ生成
   */
  private generateFlags(
    breakdown: ConfidenceBreakdown,
    extracted: ExtractedSpecs
  ): ValidationFlag[] {
    const flags: ValidationFlag[] = [];

    // 低い信頼度項目
    Object.entries(breakdown).forEach(([key, score]) => {
      if (score < 50) {
        flags.push({
          type: 'error',
          field: key,
          message: `${key} 抽出信頼度が非常に低いです (${score}%)`,
          suggestion: '手動入力を推奨します',
        });
      } else if (score < 70) {
        flags.push({
          type: 'warning',
          field: key,
          message: `${key} 抽出結果を確認してください (${score}%)`,
          suggestion: '検証後修正必要',
        });
      }
    });

    // 矛盾情報検査
    if (breakdown.zipper > 70 && breakdown.notch > 70) {
      const hasConflict = this.checkZipperNotchConflict(extracted);
      if (hasConflict) {
        flags.push({
          type: 'warning',
          field: 'processing',
          message: 'ジッパーとノッチ位置が重なる可能性があります',
          suggestion: '位置を再確認してください',
        });
      }
    }

    // 費用最適化提案
    if (breakdown.colors > 70 && extracted.printing.colors.type === 'spot') {
      flags.push({
        type: 'info',
        field: 'printing',
        message: `Pantone色が${extracted.printing.colors.count}個見つかりました`,
        suggestion: 'CMYK 4色印刷に変更すると費用削減可能です',
        autoCorrect: true,
      });
    }

    return flags;
  }

  // ============= ヘルパーメソッド =============

  private average(values: number[]): number {
    const valid = values.filter(v => v >= 0);
    if (valid.length === 0) return 0;
    return valid.reduce((sum, v) => sum + v, 0) / valid.length;
  }

  private matchPattern(
    type: string,
    dimensions: ExtractedSpecs['dimensions']
  ): number {
    // 封筒タイプ別特徴マッチング
    const patterns: Record<string, { features: string[]; score: number }> = {
      stand_pouch: {
        features: ['zipper', 'aspectRatio>1.2'],
        score: 0.8,
      },
      box_pouch: {
        features: ['zipper', 'aspectRatio<1.2'],
        score: 0.8,
      },
      gusset: {
        features: ['gusset>0'],
        score: 0.85,
      },
    };

    const pattern = patterns[type];
    if (!pattern) return 0.5;

    let matched = 0;
    if (pattern.features.includes('zipper') && dimensions.zipper) matched++;
    if (pattern.features.includes('gusset>0') && dimensions.gusset) matched++;

    return (matched / pattern.features.length) * pattern.score;
  }

  private checkComponentConsistency(
    dimensions: ExtractedSpecs['dimensions']
  ): number {
    // スタンドパウチにはジッパーが必要
    if (dimensions.envelopeType === 'stand_pouch') {
      return dimensions.zipper ? 1 : 0.5;
    }

    return 1;
  }

  private isStandardSize(
    dimensions: ExtractedSpecs['dimensions']
  ): boolean {
    // 一般的な標準規格 (簡素化)
    const standardSizes = [
      { width: 100, height: 150 },
      { width: 120, height: 180 },
      { width: 150, height: 220 },
      { width: 180, height: 250 },
      { width: 200, height: 300 },
    ];

    return standardSizes.some(
      size =>
        Math.abs(dimensions.width - size.width) < 10 &&
        Math.abs(dimensions.height - size.height) < 10
    );
  }

  private checkZipperNotchConflict(extracted: ExtractedSpecs): boolean {
    if (!extracted.processing.zipper || !extracted.processing.notch) {
      return false;
    }

    // Y座標差確認 (簡素化)
    const yDiff = Math.abs(
      extracted.processing.zipper.y - extracted.processing.notch.position.y
    );

    return yDiff < 20; // 20mm以内なら重複可能性
  }
}

/**
 * 信頼度計算関数 (ユーティリティ)
 */
export function calculateConfidence(
  extracted: ExtractedSpecs,
  sourcePDF: PDFStructure
): ConfidenceScore {
  const scorer = new ConfidenceScorer();
  return scorer.calculate(extracted, sourcePDF);
}
