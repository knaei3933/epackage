/**
 * Confidence Scorer
 * 추출된 데이터의 신뢰도를 계산하는 모듈
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
   * 종합 신뢰도 계산
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
   * 개별 항목 신뢰도 계산
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
   * 봉투 타입 신뢰도
   */
  private scoreEnvelopeType(
    dimensions: ExtractedSpecs['dimensions'],
    source: PDFStructure
  ): number {
    let score = 0;

    // 1. 텍스트 라벨 확인 (40점)
    const hasLabel = source.pages[0].texts.some(t =>
      /pouch|bag|stand|box|gusset|パウチ|袋|パック/i.test(t.content)
    );
    if (hasLabel) score += 40;

    // 2. 형상 패턴 매칭 (30점)
    const patternMatch = this.matchPattern(
      dimensions.envelopeType,
      dimensions
    );
    score += patternMatch * 30;

    // 3. 구성요소 일치 (30점)
    const componentConsistency = this.checkComponentConsistency(dimensions);
    score += componentConsistency * 30;

    return Math.min(100, score);
  }

  /**
   * 치수 신뢰도
   */
  private scoreSize(
    dimensions: ExtractedSpecs['dimensions'],
    source: PDFStructure
  ): number {
    let score = 0;

    // 1. 경로 존재 (30점)
    if (dimensions.width > 0 && dimensions.height > 0) {
      score += 30;
    }

    // 2. 다이 라인 색상 (25점)
    if (dimensions.hasDieLine) {
      score += 25;
    }

    // 3. 텍스트 라벨 (25점)
    const hasSizeLabel = source.pages[0].texts.some(t =>
      /W?\d+\s*[×x]\s*H?\d+/i.test(t.content)
    );
    if (hasSizeLabel) score += 25;

    // 4. 표준 규격 일치 (20점)
    const isStandard = this.isStandardSize(dimensions);
    if (isStandard) score += 20;

    return Math.min(100, score);
  }

  /**
   * 갓셋 신뢰도
   */
  private scoreGusset(gusset?: number): number {
    if (!gusset) return 0;

    // 명시적으로 존재하면 높은 신뢰도
    return gusset > 0 ? 90 : 0;
  }

  /**
   * 지퍼 신뢰도
   */
  private scoreZipper(zipper?: ExtractedSpecs['processing']['zipper']): number {
    if (!zipper) return 100; // 없는 것이 명확하면 높은 신뢰도

    // 지퍼 객체의 confidence 사용
    return zipper.confidence || 70;
  }

  /**
   * 노치 신뢰도
   */
  private scoreNotch(notch?: ExtractedSpecs['processing']['notch']): number {
    if (!notch) return 100;

    return notch.confidence || 75;
  }

  /**
   * 소재 구조 신뢰도
   */
  private scoreMaterialStructure(
    material: ExtractedSpecs['material']
  ): number {
    let score = 0;

    // 1. 소스 기반
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

    // 2. 레이어 개수 (최소 2층 구조)
    if (material.layers.length >= 2) {
      score += 20;
    }

    // 3. 형식 검증
    const formatValid = material.layers.every(
      layer => layer.material && layer.material.length >= 2
    );
    if (formatValid) score += 20;

    return Math.min(100, score);
  }

  /**
   * 두께 신뢰도
   */
  private scoreThickness(thickness?: number): number {
    if (!thickness) return 0;

    // 표준 범위 (50-200μm)
    if (thickness >= 50 && thickness <= 200) {
      return 85;
    }

    return 70;
  }

  /**
   * 색상 신뢰도
   */
  private scoreColors(colors: ExtractedSpecs['printing']['colors']): number {
    let score = 0;

    // 1. 타입별 기본 점수
    switch (colors.type) {
      case 'spot':
        score += 50; // Pantone 코드는 명확함
        break;
      case 'cmyk':
        score += 70; // CMYK는 표준
        break;
      case 'hybrid':
        score += 60;
        break;
    }

    // 2. 개수 검증
    if (colors.type === 'cmyk' && colors.count <= 4) {
      score += 30;
    } else if (colors.type === 'spot' && colors.pantoneCodes) {
      score += colors.pantoneCodes.length * 10;
    }

    return Math.min(100, score);
  }

  /**
   * 로고 신뢰도
   */
  private scoreLogo(logos: ExtractedSpecs['printing']['logos']): number {
    if (logos.length === 0) return 100;

    const avgConfidence =
      logos.reduce((sum, logo) => sum + logo.confidence, 0) / logos.length;

    return avgConfidence;
  }

  /**
   * 종합 신뢰도 (가중평균)
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
   * 검증 플래그 생성
   */
  private generateFlags(
    breakdown: ConfidenceBreakdown,
    extracted: ExtractedSpecs
  ): ValidationFlag[] {
    const flags: ValidationFlag[] = [];

    // 낮은 신뢰도 항목
    Object.entries(breakdown).forEach(([key, score]) => {
      if (score < 50) {
        flags.push({
          type: 'error',
          field: key,
          message: `${key} 추출 신뢰도가 매우 낮습니다 (${score}%)`,
          suggestion: '수동 입력을 권장합니다',
        });
      } else if (score < 70) {
        flags.push({
          type: 'warning',
          field: key,
          message: `${key} 추출 결과를 확인해주세요 (${score}%)`,
          suggestion: '검증 후 수정 필요',
        });
      }
    });

    // 상충 정보 검사
    if (breakdown.zipper > 70 && breakdown.notch > 70) {
      const hasConflict = this.checkZipperNotchConflict(extracted);
      if (hasConflict) {
        flags.push({
          type: 'warning',
          field: 'processing',
          message: '지퍼와 노치 위치가 겹칠 수 있습니다',
          suggestion: '위치를 재확인해주세요',
        });
      }
    }

    // 비용 최적화 제안
    if (breakdown.colors > 70 && extracted.printing.colors.type === 'spot') {
      flags.push({
        type: 'info',
        field: 'printing',
        message: `Pantone 색상이 ${extracted.printing.colors.count}개 발견되었습니다`,
        suggestion: 'CMYK 4도 인쇄로 변경하면 비용 절감 가능합니다',
        autoCorrect: true,
      });
    }

    return flags;
  }

  // ============= 헬퍼 메서드 =============

  private average(values: number[]): number {
    const valid = values.filter(v => v >= 0);
    if (valid.length === 0) return 0;
    return valid.reduce((sum, v) => sum + v, 0) / valid.length;
  }

  private matchPattern(
    type: string,
    dimensions: ExtractedSpecs['dimensions']
  ): number {
    // 봉투 타입별 특징 매칭
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
    // 스탠드 파우치엔 지퍼가 있어야 함
    if (dimensions.envelopeType === 'stand_pouch') {
      return dimensions.zipper ? 1 : 0.5;
    }

    return 1;
  }

  private isStandardSize(
    dimensions: ExtractedSpecs['dimensions']
  ): boolean {
    // 일반적인 표준 규격 (간소화)
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

    // Y좌표 차이 확인 (간소화)
    const yDiff = Math.abs(
      extracted.processing.zipper.y - extracted.processing.notch.position.y
    );

    return yDiff < 20; // 20mm 이내면 겹침 가능성
  }
}

/**
 * 신뢰도 계산 함수 (유틸리티)
 */
export function calculateConfidence(
  extracted: ExtractedSpecs,
  sourcePDF: PDFStructure
): ConfidenceScore {
  const scorer = new ConfidenceScorer();
  return scorer.calculate(extracted, sourcePDF);
}
