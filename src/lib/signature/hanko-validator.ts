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
    const circularScore = await detectCircularShape(imageInfo);
    if (circularScore > 0.7) {
      checks.circularShape = true;
      confidence += circularScore * 0.1;
    } else {
      checks.circularShape = true; // Not required, just informational
      confidence += 0.05;
    }
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
 * Load basic image information
 */
async function loadImageInfo(file: File): Promise<{
  width: number;
  height: number;
  hasTransparency: boolean;
  colorCount: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      if (ctx) {
        ctx.drawImage(img, 0, 0);

        // Check for transparency
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const hasTransparency = checkTransparency(imageData.data);

        // Count unique colors (quality indicator)
        const colorCount = countUniqueColors(imageData.data);

        resolve({
          width: img.width,
          height: img.height,
          hasTransparency,
          colorCount,
        });
      } else {
        reject(new Error('Canvas context not available'));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Check if image has transparent pixels
 */
function checkTransparency(data: Uint8ClampedArray): boolean {
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) {
      return true;
    }
  }
  return false;
}

/**
 * Count unique colors in image
 */
function countUniqueColors(data: Uint8ClampedArray): number {
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

/**
 * Detect if image has circular shape (for round hanko)
 * Returns confidence score (0-1)
 */
async function detectCircularShape(imageInfo: {
  width: number;
  height: number;
  hasTransparency: boolean;
}): Promise<number> {
  // This is a simplified detection
  // In production, you might want to use OpenCV or similar

  const { width, height, hasTransparency } = imageInfo;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) / 2;

  // For images with transparency, check if transparent area forms a circle
  if (hasTransparency) {
    // Load image again for pixel analysis
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, width, height);

          // Sample points at different radii
          const samples = 20;
          let circularPoints = 0;

          for (let i = 0; i < samples; i++) {
            const angle = (i / samples) * Math.PI * 2;
            const x = Math.round(centerX + Math.cos(angle) * maxRadius * 0.8);
            const y = Math.round(centerY + Math.sin(angle) * maxRadius * 0.8);

            if (x >= 0 && x < width && y >= 0 && y < height) {
              const idx = (y * width + x) * 4;
              const alpha = imageData.data[idx + 3];

              // Check if point is on edge (transition from transparent to opaque)
              if (alpha > 128) {
                circularPoints++;
              }
            }
          }

          const score = circularPoints / samples;
          resolve(score);
        } else {
                          resolve(0);
        }
      };

      img.onerror = () => resolve(0);
      // This would need the actual image source
      // For now, return a default score
      resolve(0.5);
    });
  }

  // For images without transparency, check aspect ratio (should be ~1:1 for circle)
  const aspectRatio = Math.min(width, height) / Math.max(width, height);
  return aspectRatio > 0.8 ? 0.7 : 0.3;
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
 * Compress image if too large
 */
export async function compressImage(
  file: File,
  maxSize: number = RECOMMENDED_HANKO_SIZE.max
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;

      // Scale down if necessary
      if (width > maxSize || height > maxSize) {
        const scale = Math.min(maxSize / width, maxSize / height);
        width *= scale;
        height *= scale;
      }

      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/png',
          0.9
        );
      } else {
        reject(new Error('Canvas context not available'));
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Generate preview URL
 */
export function generatePreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}
