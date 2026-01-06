/**
 * Dimensions Extractor
 * Adobe Illustrator 파일에서 제품 치수를 추출하는 모듈
 */

import type {
  PDFPage,
  PathElement,
  TextElement,
  LegacyEnvelopeType,
  Dimensions,
  NotchInfo,
  ZipperInfo,
  HangingHoleInfo,
  BoundingBox,
} from './types';

// Use LegacyEnvelopeType as EnvelopeType for backwards compatibility
type EnvelopeType = LegacyEnvelopeType;

export class DimensionsExtractor {
  private readonly POINTS_TO_MM = 0.352778;
  private readonly STANDARD_COLORS = {
    dieLine: '#FF0000', // 빨간색 (다이 라인)
    foldLine: '#0000FF', // 파란색 (접힘선)
    cutLine: '#00FF00', // 초록색 (컷팅 라인)
  };

  /**
   * 봉투 타입 식별
   */
  identifyEnvelopeType(paths: PathElement[], texts: TextElement[]): EnvelopeType {
    // 1. 텍스트 라벨 기반 (우선순위 1)
    const labelType = this.identifyFromLabels(texts);
    if (labelType) return labelType;

    // 2. 형상 패턴 기반 (우선순위 2)
    const outline = this.findOutlinePath(paths);
    if (!outline) return 'flat_pouch';

    const aspectRatio = this.calculateAspectRatio(outline);
    const hasZipper = this.detectZipperFromPaths(paths);
    const hasGusset = this.detectGussetFromPaths(paths);

    return this.classifyByShape(aspectRatio, hasZipper, hasGusset);
  }

  /**
   * 치수 계산 (mm 단위)
   */
  calculateDimensions(paths: PathElement[]): {
    width: number;
    height: number;
    gusset?: number;
    unit: 'mm';
  } {
    const outline = this.findOutlinePath(paths);
    if (!outline) {
      throw new Error('외곽선을 찾을 수 없습니다');
    }

    const bbox = outline.boundingBox;
    const width = bbox.width * this.POINTS_TO_MM;
    const height = bbox.height * this.POINTS_TO_MM;
    const gusset = this.calculateGusset(paths) * this.POINTS_TO_MM;

    return {
      width: Math.round(width * 10) / 10,
      height: Math.round(height * 10) / 10,
      gusset: gusset > 0 ? Math.round(gusset * 10) / 10 : undefined,
      unit: 'mm',
    };
  }

  /**
   * 다이 라인 존재 확인
   */
  hasDieLine(paths: PathElement[]): boolean {
    return paths.some(path => {
      const stroke = path.stroke?.toLowerCase();
      return (
        stroke === '#ff0000' ||
        stroke === '#f00' ||
        stroke === 'rgb(255,0,0)' ||
        stroke === 'red'
      );
    });
  }

  /**
   * 노치 정보 추출
   */
  detectNotch(paths: PathElement[]): NotchInfo | null {
    const notchPattern = paths.filter(p => {
      const bbox = p.boundingBox;
      const isSmall = bbox.width < 20 && bbox.height < 20; // < 20mm
      const isNearTop = bbox.y < 50; // 상단 50mm 내

      return isSmall && isNearTop;
    });

    if (notchPattern.length === 0) return null;

    const notch = notchPattern[0];
    const type = this.isCircularPath(notch.d) ? 'circle' : 'rectangle';

    return {
      type,
      position: {
        x: notch.boundingBox.x,
        y: notch.boundingBox.y,
      },
      size: {
        width: notch.boundingBox.width,
        height: notch.boundingBox.height,
      },
      confidence: 0.85,
    };
  }

  /**
   * 지퍼 정보 추출
   */
  detectZipper(paths: PathElement[], texts: TextElement[]): ZipperInfo | null {
    // 1. 텍스트 기반
    const zipperTexts = texts.filter(t =>
      /zipper|zip|ジッパー|チャック|ファスナー/i.test(t.content)
    );

    // 2. 경로 기반 (평행 이중선)
    const parallelLines = this.findParallelLinePairs(paths);

    if (zipperTexts.length === 0 && parallelLines.length === 0) {
      return null;
    }

    const position = this.determineZipperPosition(zipperTexts, parallelLines);
    const y = zipperTexts[0]?.y || parallelLines[0]?.[0]?.boundingBox?.y || 0;
    const length = this.calculateZipperLength(paths, y);

    return {
      type: 'standard',
      position,
      y,
      length,
      confidence: 0.90,
    };
  }

  /**
   * 걸이 구멍 정보 추출
   */
  detectHangingHole(paths: PathElement[]): HangingHoleInfo | null {
    // 1. 원형 구멍
    const roundHoles = paths.filter(p => {
      const bbox = p.boundingBox;
      const isCircular = this.isCircularPath(p.d);
      const isSmall = bbox.width < 20 && bbox.height < 20;
      const isNearTop = bbox.y < 50;

      return isCircular && isSmall && isNearTop;
    });

    // 2. 유로 슬롯 (T자 형태)
    const euroSlots = paths.filter(p => {
      const bbox = p.boundingBox;
      const aspectRatio = bbox.width / bbox.height;
      return aspectRatio > 3 && aspectRatio < 5 && bbox.width < 30;
    });

    if (roundHoles.length > 0) {
      const hole = roundHoles[0];
      return {
        type: 'round',
        diameter: hole.boundingBox.width,
        position: {
          x: hole.boundingBox.x,
          y: hole.boundingBox.y,
        },
        confidence: 0.95,
      };
    }

    if (euroSlots.length > 0) {
      const slot = euroSlots[0];
      return {
        type: 'euro_slot',
        position: {
          x: slot.boundingBox.x,
          y: slot.boundingBox.y,
        },
        confidence: 0.88,
      };
    }

    return null;
  }

  // ============= 헬퍼 메서드 =============

  /**
   * 텍스트 라벨에서 타입 식별
   */
  private identifyFromLabels(texts: TextElement[]): EnvelopeType | null {
    const content = texts.map(t => t.content.toLowerCase()).join(' ');

    const patterns: { pattern: RegExp; type: EnvelopeType }[] = [
      { pattern: /stand.*pouch|スタンド.*パウチ/i, type: 'stand_pouch' },
      { pattern: /box.*pouch|ボックス.*パウチ/i, type: 'box_pouch' },
      { pattern: /gusset|ギャセット/i, type: 'gusset' },
      { pattern: /three.*seal|三方シール/i, type: 'three_side_seal' },
      { pattern: /zipper.*bag|ジッパー.*袋/i, type: 'zipper_bag' },
    ];

    for (const { pattern, type } of patterns) {
      if (pattern.test(content)) {
        return type;
      }
    }

    return null;
  }

  /**
   * 종횡비 계산
   */
  private calculateAspectRatio(path: PathElement): number {
    const { width, height } = path.boundingBox;
    return width / height;
  }

  /**
   * 형상 기반 분류
   */
  private classifyByShape(
    aspectRatio: number,
    hasZipper: boolean,
    hasGusset: boolean
  ): EnvelopeType {
    if (aspectRatio > 1.5 && hasZipper) {
      return 'stand_pouch';
    } else if (aspectRatio < 1.2 && hasZipper) {
      return 'box_pouch';
    } else if (hasGusset) {
      return 'gusset';
    }
    return 'flat_pouch';
  }

  /**
   * 외곽선 경로 찾기
   */
  private findOutlinePath(paths: PathElement[]): PathElement | null {
    // 가장 큰 bounding box를 가진 경로가 외곽선
    const sorted = [...paths].sort((a, b) => {
      const areaA = a.boundingBox.width * a.boundingBox.height;
      const areaB = b.boundingBox.width * b.boundingBox.height;
      return areaB - areaA;
    });

    return sorted[0] || null;
  }

  /**
   * 원형 경로인지 확인
   */
  private isCircularPath(pathData: string): boolean {
    // SVG 경로 명령어에서 A(arc) 확인
    return pathData.includes('A') && !pathData.includes('L');
  }

  /**
   * 갓셋 감지
   */
  private detectGussetFromPaths(paths: PathElement[]): boolean {
    // 접힘선 (파란색)이 측면에 있는지 확인
    const foldLines = paths.filter(p => {
      const stroke = p.stroke?.toLowerCase();
      return (
        stroke === '#0000ff' ||
        stroke === '#00f' ||
        stroke === 'rgb(0,0,255)' ||
        stroke === 'blue'
      );
    });

    // 측면에 위치하는지 확인 (간소화)
    return foldLines.length > 0;
  }

  /**
   * 지퍼 감지 (경로 기반)
   */
  private detectZipperFromPaths(paths: PathElement[]): boolean {
    // 평행한 이중선 패턴 확인
    const pairs = this.findParallelLinePairs(paths);
    return pairs.length > 0;
  }

  /**
   * 평행선 쌍 찾기
   */
  private findParallelLinePairs(paths: PathElement[]): PathElement[][] {
    const pairs: PathElement[][] = [];
    const horizontal = paths.filter(p => this.isHorizontalLine(p));

    for (let i = 0; i < horizontal.length - 1; i++) {
      const line1 = horizontal[i];
      const line2 = horizontal[i + 1];

      // Y좌표 차이가 작으면 평행
      const yDiff = Math.abs(line1.boundingBox.y - line2.boundingBox.y);
      if (yDiff < 5) {
        pairs.push([line1, line2]);
      }
    }

    return pairs;
  }

  /**
   * 수평선인지 확인
   */
  private isHorizontalLine(path: PathElement): boolean {
    const { width, height } = path.boundingBox;
    return width > height * 10;
  }

  /**
   * 갓셋 깊이 계산
   */
  private calculateGusset(paths: PathElement[]): number {
    // 접힘선을 기반으로 계산
    const foldLines = paths.filter(p => {
      const stroke = p.stroke?.toLowerCase();
      return stroke === '#0000ff' || stroke === 'blue';
    });

    if (foldLines.length === 0) return 0;

    // 간소화: 접힘선 위치로 추정
    // 실제로는 더 복잡한 기하학적 계산 필요
    return 0;
  }

  /**
   * 지퍼 위치 결정
   */
  private determineZipperPosition(
    texts: TextElement[],
    lines: PathElement[][]
  ): 'top' | 'side' | 'bottom' {
    if (texts.length > 0) {
      const y = texts[0].y;
      const centerY = 300; // A4 기준 (간소화)
      if (y < centerY / 2) return 'top';
      if (y > centerY * 1.5) return 'bottom';
      return 'side';
    }

    return 'top'; // 기본값
  }

  /**
   * 지퍼 길이 계산
   */
  private calculateZipperLength(paths: PathElement[], y: number): number {
    // Y좌표 근처의 수평선 길이
    const nearbyLines = paths.filter(p => {
      const yDiff = Math.abs(p.boundingBox.y - y);
      return yDiff < 10 && this.isHorizontalLine(p);
    });

    if (nearbyLines.length === 0) return 0;

    return Math.max(...nearbyLines.map(p => p.boundingBox.width));
  }
}

/**
 * 전체 치수 추출 함수
 */
export async function extractDimensions(
  page: PDFPage
): Promise<Dimensions> {
  const extractor = new DimensionsExtractor();

  const envelopeType = extractor.identifyEnvelopeType(page.paths, page.texts);
  const sizeInfo = extractor.calculateDimensions(page.paths);
  const hasDieLine = extractor.hasDieLine(page.paths);
  const notch = extractor.detectNotch(page.paths);
  const zipper = extractor.detectZipper(page.paths, page.texts);
  const hangingHole = extractor.detectHangingHole(page.paths);

  return {
    envelopeType,
    ...sizeInfo,
    hasDieLine,
    notch: notch || undefined,
    zipper: zipper || undefined,
    hangingHole: hangingHole || undefined,
  };
}
