/**
 * Hanko (はんこ/印鑑) Image Validator
 *
 * Traditional Japanese seal/stamp image validation service
 * 日本の伝統的なはんこ・印鑑画像検証サービス
 */

import {
  HankoValidation,
  ALLOWED_HANKO_FORMATS,
  MAX_HANKO_SIZE,
  RECOMMENDED_HANKO_SIZE,
} from '@/types/signature';
import sharp from 'sharp';

// ============================================================
// Main Validation Function
// ============================================================

/**
 * Validate uploaded hanko image
 * アップロードされたはんこ画像を検証
 */
export async function validateHankoImage(
  file: File
): Promise<HankoValidation> {
  const checks = {
    imageFormat: false,
    imageSize: false,
    imageQuality: false,
    transparency: false,
    circularShape: false,
  };
  const errors: string[] = [];
  const warnings: string[] = [];
  let valid = true;
  let confidence = 0;

  // 1. Check image format
  if (!ALLOWED_HANKO_FORMATS.includes(file.type)) {
    errors.push(
      `許可されていない画像形式です: ${file.type}. 許可形式: ${ALLOWED_HANKO_FORMATS.join(', ')}`
    );
    valid = false;
  } else {
    checks.imageFormat = true;
    confidence += 0.25;
  }

  // 2. Check file size
  if (file.size > MAX_HANKO_SIZE) {
    errors.push(
      `ファイルサイズが大きすぎます: ${Math.round(file.size / 1024 / 1024)}MB. 最大サイズ: ${Math.round(MAX_HANKO_SIZE / 1024 / 1024)}MB`
    );
    valid = false;
  } else if (file.size < 10 * 1024) {
    warnings.push('ファイルサイズが小さすぎる可能性があります (10KB未満)');
    checks.imageSize = true;
    confidence += 0.2;
  } else {
    checks.imageSize = true;
    confidence += 0.25;
  }

  // 3. Load and analyze image
  try {
    const imageInfo = await loadImageInfo(file);

    // Check dimensions
    if (
      imageInfo.width < RECOMMENDED_HANKO_SIZE.min ||
      imageInfo.height < RECOMMENDED_HANKO_SIZE.min
    ) {
      warnings.push(
        `画像サイズが小さいです: ${imageInfo.width}x${imageInfo.height}px. 推奨: ${RECOMMENDED_HANKO_SIZE.optimal}x${RECOMMENDED_HANKO_SIZE.optimal}px以上`
      );
      checks.imageQuality = true;
      confidence += 0.15;
    } else if (
      imageInfo.width > RECOMMENDED_HANKO_SIZE.max ||
      imageInfo.height > RECOMMENDED_HANKO_SIZE.max
    ) {
      warnings.push(
        `画像サイズが大きいです: ${imageInfo.width}x${imageInfo.height}px. 最適: ${RECOMMENDED_HANKO_SIZE.optimal}x${RECOMMENDED_HANKO_SIZE.optimal}px`
      );
      checks.imageQuality = true;
      confidence += 0.15;
    } else {
      checks.imageQuality = true;
      confidence += 0.25;
    }

    // Check for transparency (PNG)
    if (file.type === 'image/png' && imageInfo.hasTransparency) {
      checks.transparency = true;
      confidence += 0.15;
    } else if (file.type === 'image/png') {
      warnings.push('透明背景がないため、背景が白く表示される可能性があります');
      checks.transparency = true;
      confidence += 0.1;
    } else {
      // JPEG/WebP don't support transparency
      warnings.push(
        '選択された画像形式は透明背景をサポートしないため、背景が表示されます'
      );
      checks.transparency = true;
      confidence += 0.1;
    }

    // Check circular shape (optional, for round hanko)
    // 円形検出は既存デッドロジック（img.src 未設定で常に resolve(0.5)）を定数化。
    // confidence 計算上、常に else 側に落ちるため 0.5 定数と等価（差分ゼロ）。
    checks.circularShape = true; // Not required, just informational
    confidence += 0.05;
  } catch (error) {
    errors.push(`画像の解析に失敗しました: ${error}`);
    valid = false;
  }

  return {
    valid: valid && confidence >= 0.6,
    confidence: Math.min(confidence, 1),
    checks,
    errors,
    warnings,
  };
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Load basic image information (server-side via sharp)
 *
 * 旧ブラウザ実装（Image/canvas 経由の pixel 取得）を sharp で置換。既存の判定基準を維持:
 * - hasTransparency: alpha < 255 のピクセルが1つでもあれば true
 * - colorCount: sampleRate=10（10ピクセルに1個）で a > 128 の RGB を Set 化
 */
async function loadImageInfo(file: File): Promise<{
  width: number;
  height: number;
  hasTransparency: boolean;
  colorCount: number;
}> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const metadata = await sharp(buffer).metadata();

  // ensureAlpha で 4ch RGBA を保証し raw pixel を取得（旧 canvas 実装と等価な RGBA 配列）
  const { data } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    hasTransparency: checkTransparency(data),
    colorCount: countUniqueColors(data),
  };
}

/**
 * Check if image has transparent pixels
 * alpha < 255 のピクセルが1つでもあれば true（既存の判定基準を維持）
 */
function checkTransparency(data: Uint8Array): boolean {
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) {
      return true;
    }
  }
  return false;
}

/**
 * Count unique colors in image
 * sampleRate=10（10ピクセルに1個）で a > 128 の RGB を Set 化（既存の判定基準を維持）
 */
function countUniqueColors(data: Uint8Array): number {
  const colors = new Set<string>();
  const sampleRate = 10; // Sample every 10th pixel for performance

  for (let i = 0; i < data.length; i += 4 * sampleRate) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a > 128) {
      // Only count non-transparent pixels
      colors.add(`${r},${g},${b}`);
    }
  }

  return colors.size;
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Convert file to base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Generate preview URL
 */
export function generatePreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}
