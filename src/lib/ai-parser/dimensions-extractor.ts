/**
 * Dimensions Extractor
 * Adobe Illustratorファイルから製品寸法を抽出するモジュール
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
    dieLine: '#FF0000', // 赤色 (ダイライン)
    foldLine: '#0000FF', // 青色 (折り目線)
    cutLine: '#00FF00', // 緑色 (カットライン)
  };

  /**
   * 封筒タイプ識別
   */
  identifyEnvelopeType(paths: PathElement[], texts: TextElement[]): EnvelopeType {
    // 1. テキストラベルベース (優先順位1)
    const labelType = this.identifyFromLabels(texts);
    if (labelType) return labelType;

    // 2. 形状パターンベース (優先順位2)
    const outline = this.findOutlinePath(paths);
    if (!outline) return 'flat_pouch';

    const aspectRatio = this.calculateAspectRatio(outline);
    const hasZipper = this.detectZipperFromPaths(paths);
    const hasGusset = this.detectGussetFromPaths(paths);

    return this.classifyByShape(aspectRatio, hasZipper, hasGusset);
  }

  /**
   * 寸法計算 (mm単位)
   */
  calculateDimensions(paths: PathElement[]): {
    width: number;
    height: number;
    gusset?: number;
    unit: 'mm';
  } {
    const outline = this.findOutlinePath(paths);
    if (!outline) {
      throw new Error('外郭線を見つけることができません');
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
   * ダイライン存在確認
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
   * ノッチ情報抽出
   */
  detectNotch(paths: PathElement[]): NotchInfo | null {
    const notchPattern = paths.filter(p => {
      const bbox = p.boundingBox;
      const isSmall = bbox.width < 20 && bbox.height < 20; // < 20mm
      const isNearTop = bbox.y < 50; // 上端50mm以内

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
   * ジッパー情報抽出
   */
  detectZipper(paths: PathElement[], texts: TextElement[]): ZipperInfo | null {
    // 1. テキストベース
    const zipperTexts = texts.filter(t =>
      /zipper|zip|ジッパー|チャック|ファスナー/i.test(t.content)
    );

    // 2. パスベース (平行二重線)
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
   * つり穴情報抽出
   */
  detectHangingHole(paths: PathElement[]): HangingHoleInfo | null {
    // 1. 円形穴
    const roundHoles = paths.filter(p => {
      const bbox = p.boundingBox;
      const isCircular = this.isCircularPath(p.d);
      const isSmall = bbox.width < 20 && bbox.height < 20;
      const isNearTop = bbox.y < 50;

      return isCircular && isSmall && isNearTop;
    });

    // 2. ユーロスロット (T字形状)
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

  // ============= ヘルパーメソッド =============

  /**
   * テキストラベルからタイプ識別
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
   * 縦横比計算
   */
  private calculateAspectRatio(path: PathElement): number {
    const { width, height } = path.boundingBox;
    return width / height;
  }

  /**
   * 形状ベース分類
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
   * 外郭線パス検索
   */
  private findOutlinePath(paths: PathElement[]): PathElement | null {
    // 最も大きいbounding boxを持つパスが外郭線
    const sorted = [...paths].sort((a, b) => {
      const areaA = a.boundingBox.width * a.boundingBox.height;
      const areaB = b.boundingBox.width * b.boundingBox.height;
      return areaB - areaA;
    });

    return sorted[0] || null;
  }

  /**
   * 円形パスか確認
   */
  private isCircularPath(pathData: string): boolean {
    // SVGパスコマンドでA(arc)確認
    return pathData.includes('A') && !pathData.includes('L');
  }

  /**
   * ギャセット検知
   */
  private detectGussetFromPaths(paths: PathElement[]): boolean {
    // 折り目線 (青色) が側面にあるか確認
    const foldLines = paths.filter(p => {
      const stroke = p.stroke?.toLowerCase();
      return (
        stroke === '#0000ff' ||
        stroke === '#00f' ||
        stroke === 'rgb(0,0,255)' ||
        stroke === 'blue'
      );
    });

    // 側面に位置するか確認 (簡素化)
    return foldLines.length > 0;
  }

  /**
   * ジッパー検知 (パスベース)
   */
  private detectZipperFromPaths(paths: PathElement[]): boolean {
    // 平行な二重線パターン確認
    const pairs = this.findParallelLinePairs(paths);
    return pairs.length > 0;
  }

  /**
   * 平行線ペア検索
   */
  private findParallelLinePairs(paths: PathElement[]): PathElement[][] {
    const pairs: PathElement[][] = [];
    const horizontal = paths.filter(p => this.isHorizontalLine(p));

    for (let i = 0; i < horizontal.length - 1; i++) {
      const line1 = horizontal[i];
      const line2 = horizontal[i + 1];

      // Y座標差が小さければ平行
      const yDiff = Math.abs(line1.boundingBox.y - line2.boundingBox.y);
      if (yDiff < 5) {
        pairs.push([line1, line2]);
      }
    }

    return pairs;
  }

  /**
   * 水平線か確認
   */
  private isHorizontalLine(path: PathElement): boolean {
    const { width, height } = path.boundingBox;
    return width > height * 10;
  }

  /**
   * ギャセット深さ計算
   */
  private calculateGusset(paths: PathElement[]): number {
    // 折り目線をベースに計算
    const foldLines = paths.filter(p => {
      const stroke = p.stroke?.toLowerCase();
      return stroke === '#0000ff' || stroke === 'blue';
    });

    if (foldLines.length === 0) return 0;

    // 簡素化: 折り目線位置で推定
    // 実際はより複雑な幾何学的計算が必要
    return 0;
  }

  /**
   * ジッパー位置決定
   */
  private determineZipperPosition(
    texts: TextElement[],
    lines: PathElement[][]
  ): 'top' | 'side' | 'bottom' {
    if (texts.length > 0) {
      const y = texts[0].y;
      const centerY = 300; // A4基準 (簡素化)
      if (y < centerY / 2) return 'top';
      if (y > centerY * 1.5) return 'bottom';
      return 'side';
    }

    return 'top'; // デフォルト値
  }

  /**
   * ジッパー長さ計算
   */
  private calculateZipperLength(paths: PathElement[], y: number): number {
    // Y座標付近の水平線長さ
    const nearbyLines = paths.filter(p => {
      const yDiff = Math.abs(p.boundingBox.y - y);
      return yDiff < 10 && this.isHorizontalLine(p);
    });

    if (nearbyLines.length === 0) return 0;

    return Math.max(...nearbyLines.map(p => p.boundingBox.width));
  }
}

/**
 * 全寸法抽出関数
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
