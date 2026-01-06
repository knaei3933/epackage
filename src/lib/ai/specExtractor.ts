/**
 * AI Specification Extractor
 *
 * AI仕様書抽出エンジン
 * Specification extraction from Adobe Illustrator files
 */

import type { AiFileData, Layer, TextElement } from '@/types/aiFile';
import type {
  PouchType,
  Dimensions,
  MaterialLayer,
  ProcessingFeatures,
  NotchInfo,
  HangingHoleInfo,
  ConfidenceScore,
  ProductSpecifications,
  ValidationResult,
  ExtractionResult,
} from './types';
import {
  PouchType as PouchTypeEnum,
  CONFIDENCE_LEVELS,
  getConfidenceLevel,
  COMMON_MATERIAL_COMBINATIONS,
  COMMON_TOLERANCES,
} from './types';

// ============================================================
// Type Detection Patterns
// ============================================================

/**
 * パウチタイプ検出パターン
 * Pouch type detection patterns
 */
const POUCH_TYPE_PATTERNS = {
  STAND_POUCH: [
    'stand', 'スタンド', '立ち', '底マチ', 'bottom_gusset', 'gusset',
  ],
  FLAT_POUCH: [
    'flat', 'フラット', 'ピロー', 'pillow',
  ],
  ZIPPER_POUCH: [
    'zipper', 'ジッパー', 'チャック', 'zip', 'resellable', '再封',
  ],
  GUSSET_POUCH: [
    'gusset', 'マチ', 'side_gusset',
  ],
  THREE_SIDE_SEAL: [
    '3side', '三方', 'three_side', '三方的',
  ],
} as const;

/**
 * 材質パターン
 * Material detection patterns
 */
const MATERIAL_PATTERNS = {
  OUTER: ['外', 'outer', '表', '表側', 'face'],
  MIDDLE: ['中', 'middle', '中間', 'core'],
  INNER: ['内', 'inner', '裏', '裏側', 'seal'],
  EXTRA: ['extra', '追加', 'コート', 'coat'],
} as const;

/**
 * 材質略語パターン
 * Material abbreviation patterns
 */
const MATERIAL_ABBREVS = {
  PET: /PET|ペット|ポリエステル/i,
  AL: /AL|アルミ|aluminium/i,
  PE: /PE|ポリエチレン/i,
  CPP: /CPP|未延伸/i,
  OPP: /OPP|二軸延伸/i,
  PA: /PA|ナイロン|nylon/i,
  EVOH: /EVOH|エバノール/i,
  MET: /MET|蒸着/i,
} as const;

/**
 * 加工パターン
 * Processing feature patterns
 */
const PROCESSING_PATTERNS = {
  NOTCH: ['ノッチ', 'notch', '切り欠き'],
  HANGING_HOLE: ['吊り穴', 'ハンギングホール', 'hanging', 'hole', '穴'],
  ZIPPER: ['ジッパー', 'zipper', 'チャック', 'zip'],
  SLIT: ['スリット', 'slit', '排気'],
  PUNCH: ['パンチ', 'punch', '穴あけ'],
  EMBOSS: ['エンボス', 'emboss', '浮き出し'],
  HOT_STAMPING: ['箔押', 'ホットスタンプ', 'stamping', '箔'],
} as const;

// ============================================================
// Pouch Type Detection
// ============================================================

/**
 * パウチタイプを検出
 * Detect pouch type from AI data
 */
export function detectPouchType(aiData: AiFileData): PouchType {
  const layerNames = aiData.layers
    .map(l => l.name.toLowerCase())
    .join(' ');
  const artboardName = aiData.artboards?.[0]?.name?.toLowerCase() || '';
  const textContent = aiData.textElements
    .map(t => t.content.toLowerCase())
    .join(' ');

  const combinedText = `${layerNames} ${artboardName} ${textContent}`;

  // Check each pouch type pattern
  for (const [type, patterns] of Object.entries(POUCH_TYPE_PATTERNS)) {
    for (const pattern of patterns) {
      if (combinedText.includes(pattern.toLowerCase())) {
        return type as PouchType;
      }
    }
  }

  return PouchTypeEnum.UNKNOWN;
}

// ============================================================
// Dimension Extraction
// ============================================================

/**
 * 寸法を抽出（mm単位）
 * Extract dimensions in millimeters
 */
export function extractDimensions(aiData: AiFileData): Dimensions {
  const artboard = aiData.artboards?.[0];
  if (!artboard) {
    // Default dimensions if no artboard found
    return {
      width: 0,
      height: 0,
      gusset: 0,
      tolerance: 5,
    };
  }

  // AI points to mm conversion (1 point = 0.3528 mm)
  const POINT_TO_MM = 0.3528;

  const width = Math.round(artboard.dimensions.width * POINT_TO_MM);
  const height = Math.round(artboard.dimensions.height * POINT_TO_MM);

  // Try to detect gusset from dimensions or text
  let gusset = 0;
  const textContent = aiData.textElements
    .map(t => t.content)
    .join(' ');

  // Look for gusset patterns in text (e.g., "マチ50" or "Gusset: 50mm")
  const gussetMatch = textContent.match(/マチ\s*[:：]?\s*(\d+)|gusset\s*[:：]?\s*(\d+)/i);
  if (gussetMatch) {
    gusset = parseInt(gussetMatch[1] || gussetMatch[2] || '0', 10);
  }

  // Default tolerance based on dimensions
  const tolerance = Math.max(width, height) > 200 ? 3 : 2;

  return {
    width,
    height,
    gusset,
    tolerance,
  };
}

// ============================================================
// Material Extraction
// ============================================================

/**
 * 材質レイヤーを抽出
 * Extract material layer information
 */
export function extractMaterialLayers(aiData: AiFileData): MaterialLayer[] {
  const materials: MaterialLayer[] = [];
  const textContent = aiData.textElements
    .map(t => t.content)
    .join('\n');

  // Try to parse material composition from text
  // Common format: "PET12/AL7/PE80" or "PET 12 / AL 7 / PE 80"
  const materialPatterns = [
    /([A-Z]+)\s*(\d+)\s*[\/／]\s*([A-Z]+)\s*(\d+)\s*[\/／]\s*([A-Z]+)\s*(\d+)/,
    /([A-Z]+)\s*(\d+)\s*\/\s*([A-Z]+)\s*(\d+)\s*\/\s*([A-Z]+)\s*(\d+)/,
  ];

  for (const pattern of materialPatterns) {
    const match = textContent.match(pattern);
    if (match) {
      // Found 3-layer structure
      const layers = [
        { material: match[1], thickness: parseInt(match[2], 10) },
        { material: match[3], thickness: parseInt(match[4], 10) },
        { material: match[5], thickness: parseInt(match[6], 10) },
      ];

      const positions: Array<'outer' | 'middle' | 'inner'> = ['outer', 'middle', 'inner'];

      for (let i = 0; i < layers.length; i++) {
        materials.push({
          layer: positions[i],
          material: layers[i].material.toUpperCase(),
          thickness: layers[i].thickness,
          description: getMaterialDescription(layers[i].material),
        });
      }

      break;
    }
  }

  // If no materials found in text, try to detect from layer names
  if (materials.length === 0) {
    for (const layer of aiData.layers) {
      const layerName = layer.name.toLowerCase();

      // Check for layer position
      let position: 'outer' | 'middle' | 'inner' | null = null;
      if (MATERIAL_PATTERNS.OUTER.some(p => layerName.includes(p))) {
        position = 'outer';
      } else if (MATERIAL_PATTERNS.MIDDLE.some(p => layerName.includes(p))) {
        position = 'middle';
      } else if (MATERIAL_PATTERNS.INNER.some(p => layerName.includes(p))) {
        position = 'inner';
      }

      if (position) {
        // Try to find material info in layer text
        const layerTextElements = aiData.textElements;

        for (const text of layerTextElements) {
          for (const [abbr, regex] of Object.entries(MATERIAL_ABBREVS)) {
            const match = text.content.match(regex);
            if (match) {
              const thicknessMatch = text.content.match(/(\d+)\s*μ?/);
              const thickness = thicknessMatch
                ? parseInt(thicknessMatch[1], 10)
                : getDefaultThickness(abbr);

              materials.push({
                layer: position,
                material: abbr,
                thickness,
                description: getMaterialDescription(abbr),
              });
              break;
            }
          }
        }
      }
    }
  }

  // Return detected materials or default to standard stand pouch
  return materials.length > 0
    ? materials
    : [...COMMON_MATERIAL_COMBINATIONS.STANDARD_STAND];
}

/**
 * 材質の説明を取得
 * Get material description
 */
function getMaterialDescription(abbr: string): string {
  const descriptions: Record<string, string> = {
    'PET': '印刷基材・透明性',
    'AL': 'バリア性・遮光性',
    'PE': 'ヒートシール性',
    'CPP': '耐熱ヒートシール',
    'OPP': '透明性・強度',
    'PA': 'ガスバリア・強度',
    'EVOH': '高バリア性',
    'MET': '蒸着バリア',
  };
  return descriptions[abbr.toUpperCase()] || '';
}

/**
 * 既定の厚みを取得
 * Get default thickness for material
 */
function getDefaultThickness(material: string): number {
  const defaults: Record<string, number> = {
    'PET': 12,
    'AL': 7,
    'PE': 80,
    'CPP': 50,
    'OPP': 20,
    'PA': 15,
    'EVOH': 5,
    'MET': 0,
  };
  return defaults[material.toUpperCase()] || 0;
}

// ============================================================
// Processing Features Detection
// ============================================================

/**
 * 加工仕様を抽出
 * Extract processing features
 */
export function extractProcessingFeatures(aiData: AiFileData): ProcessingFeatures {
  const features: ProcessingFeatures = {};
  const textContent = aiData.textElements
    .map(t => t.content)
    .join(' ');
  const layerNames = aiData.layers
    .map(l => l.name)
    .join(' ');

  const combinedText = `${textContent} ${layerNames}`;

  // Detect seal width
  const sealWidthMatch = combinedText.match(/シール\s*[:：]?\s*(\d+)\s*mm?|seal\s*[:：]?\s*(\d+)/i);
  if (sealWidthMatch) {
    features.sealWidth = parseInt(sealWidthMatch[1] || sealWidthMatch[2] || '0', 10);
  }

  // Detect notch
  if (PROCESSING_PATTERNS.NOTCH.some(p => combinedText.includes(p))) {
    features.notch = detectNotchInfo(combinedText);
  }

  // Detect hanging hole
  if (PROCESSING_PATTERNS.HANGING_HOLE.some(p => combinedText.includes(p))) {
    features.hangingHole = detectHangingHoleInfo(combinedText);
  }

  // Detect zipper
  if (PROCESSING_PATTERNS.ZIPPER.some(p => combinedText.includes(p))) {
    features.zipperPosition = 'top';
    features.zipperType = 'standard';
  }

  // Detect corner radius
  const cornerMatch = combinedText.match(/角\s*R?\s*(\d+)|corner\s*R?\s*(\d+)/i);
  if (cornerMatch) {
    features.cornerRadius = parseInt(cornerMatch[1] || cornerMatch[2] || '0', 10);
  }

  // Detect other boolean features
  features.hasSlit = PROCESSING_PATTERNS.SLIT.some(p => combinedText.includes(p));
  features.hasDieCut = combinedText.includes('ダイカット') || combinedText.includes('die cut');
  features.hasPunchHole = PROCESSING_PATTERNS.PUNCH.some(p => combinedText.includes(p));
  features.hasEmbossing = PROCESSING_PATTERNS.EMBOSS.some(p => combinedText.includes(p));
  features.hasHotStamping = PROCESSING_PATTERNS.HOT_STAMPING.some(p => combinedText.includes(p));

  return features;
}

/**
 * ノッチ情報を検出
 * Detect notch information
 */
function detectNotchInfo(text: string): NotchInfo {
  // Detect notch type
  let type: NotchInfo['type'] = 'none';
  if (text.includes('丸') || text.includes('丸ノッチ') || text.includes('round')) {
    type = 'round';
  } else if (text.includes('三角') || text.includes('triangle')) {
    type = 'triangle';
  } else if (text.includes('角') || text.includes('square')) {
    type = 'square';
  }

  // Detect notch position
  let position: NotchInfo['position'] = 'top_center';
  if (text.includes('左') || text.includes('left')) {
    position = text.includes('上') ? 'top_left' : 'bottom_left';
  } else if (text.includes('右') || text.includes('right')) {
    position = text.includes('上') ? 'top_right' : 'bottom_right';
  }

  // Detect notch size
  const sizeMatch = text.match(/ノッチ\s*[:：]?\s*(\d+)\s*mm?|notch\s*[:：]?\s*(\d+)/i);
  const size = sizeMatch ? parseInt(sizeMatch[1] || sizeMatch[2] || '0', 10) : undefined;

  return { type, position, size };
}

/**
 * 吊り穴情報を検出
 * Detect hanging hole information
 */
function detectHangingHoleInfo(text: string): HangingHoleInfo {
  // Detect hole type
  let type: HangingHoleInfo['type'] = 'none';
  if (text.includes('丸') || text.includes('round')) {
    type = 'round';
  } else if (text.includes('三角') || text.includes('triangle')) {
    type = 'triangle';
  } else if (text.includes('スロット') || text.includes('slot')) {
    type = 'slot';
  }

  // Detect hole diameter
  const diameterMatch = text.match(/穴\s*[:：]?\s*(\d+)\s*(?:mm|φ)?|hole\s*[:：]?\s*(\d+)/i);
  const diameter = diameterMatch
    ? parseInt(diameterMatch[1] || diameterMatch[2] || '0', 10)
    : 5; // Default 5mm

  // Detect hole position
  let position: HangingHoleInfo['position'] = 'center';
  if (text.includes('オフセット') || text.includes('offset')) {
    position = 'offset';
  } else if (text.includes('上') || text.includes('top')) {
    position = 'top';
  } else if (text.includes('下') || text.includes('bottom')) {
    position = 'bottom';
  }

  return { type, diameter, position };
}

// ============================================================
// Confidence Calculation
// ============================================================

/**
 * 信頼度スコアを計算
 * Calculate confidence score for extracted specifications
 */
export function calculateConfidence(
  specs: ProductSpecifications,
  aiData: AiFileData
): ConfidenceScore {
  const flags: string[] = [];

  // Pouch type confidence
  let pouchTypeScore = 0.5;
  if (specs.pouchType !== PouchTypeEnum.UNKNOWN) {
    pouchTypeScore = 0.9;
  } else {
    flags.push('パウチタイプを自動検出できませんでした');
  }

  // Dimensions confidence
  let dimensionsScore = 0.7;
  if (specs.dimensions.width > 0 && specs.dimensions.height > 0) {
    dimensionsScore = 0.9;
  } else {
    flags.push('寸法を正確に検出できませんでした');
  }

  // Materials confidence
  let materialsScore = 0.6;
  if (specs.materials.length >= 3) {
    materialsScore = 0.9;
  } else if (specs.materials.length > 0) {
    materialsScore = 0.7;
    flags.push('材質構成が不完全です');
  } else {
    flags.push('材質情報を検出できませんでした。既定値を使用します');
  }

  // Processing features confidence
  let processingScore = 0.5;
  const processingCount = Object.keys(specs.processing).length;
  if (processingCount >= 3) {
    processingScore = 0.8;
  } else if (processingCount > 0) {
    processingScore = 0.6;
  }

  // Calculate overall confidence
  const overall = (
    pouchTypeScore * 0.25 +
    dimensionsScore * 0.25 +
    materialsScore * 0.3 +
    processingScore * 0.2
  );

  return {
    overall: Math.round(overall * 100) / 100,
    breakdown: {
      pouchType: Math.round(pouchTypeScore * 100) / 100,
      dimensions: Math.round(dimensionsScore * 100) / 100,
      materials: Math.round(materialsScore * 100) / 100,
      processing: Math.round(processingScore * 100) / 100,
    },
    flags,
    level: getConfidenceLevel(overall),
  };
}

// ============================================================
// Main Extraction Function
// ============================================================

/**
 * AIファイルから製品仕様書を抽出
 * Extract product specifications from AI file data
 */
export function extractSpecifications(
  aiData: AiFileData,
  sourceFile: string
): ProductSpecifications {
  const pouchType = detectPouchType(aiData);
  const dimensions = extractDimensions(aiData);
  const materials = extractMaterialLayers(aiData);
  const processing = extractProcessingFeatures(aiData);

  const specs: ProductSpecifications = {
    pouchType,
    dimensions,
    materials,
    processing,
    confidence: {
      overall: 0,
      breakdown: {
        pouchType: 0,
        dimensions: 0,
        materials: 0,
        processing: 0,
      },
      flags: [],
      level: 'low',
    },
    extractedAt: new Date(),
    sourceFile,
    metadata: {
      aiVersion: aiData.version,
      method: 'automated',
    },
  };

  // Calculate confidence after extraction
  specs.confidence = calculateConfidence(specs, aiData);

  return specs;
}

// ============================================================
// Validation Functions
// ============================================================

/**
 * 仕様書を検証
 * Validate extracted specifications
 */
export function validateSpecifications(
  specs: ProductSpecifications
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check pouch type
  if (specs.pouchType === PouchTypeEnum.UNKNOWN) {
    warnings.push('パウチタイプが不明です');
  }

  // Check dimensions
  if (specs.dimensions.width <= 0 || specs.dimensions.height <= 0) {
    errors.push('寸法が無効です');
  }
  if (specs.dimensions.width > 1000 || specs.dimensions.height > 1000) {
    warnings.push('寸法が大きすぎます（1000mm以下推奨）');
  }

  // Check materials
  if (specs.materials.length === 0) {
    errors.push('材質情報がありません');
  }
  if (specs.materials.length < 3) {
    warnings.push('材質構成が不完全です（3層構造推奨）');
  }

  // Check material thicknesses
  for (const material of specs.materials) {
    if (material.thickness <= 0) {
      warnings.push(`${material.material}の厚みが無効です`);
    }
  }

  // Calculate total thickness
  const totalThickness = specs.materials.reduce((sum, m) => sum + m.thickness, 0);
  if (totalThickness > 200) {
    warnings.push('総厚みが厚すぎます（200μm以下推奨）');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 見積もりデータと照合
 * Cross-check specifications with quotation data
 */
export function crossCheckWithQuotation(
  specs: ProductSpecifications,
  quotationData: {
    pouchType?: string;
    dimensions?: { width: number; height: number; gusset: number };
    materials?: string[];
  }
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let agreementScore = 1.0;

  // Check pouch type agreement
  if (quotationData.pouchType) {
    const quotedType = quotationData.pouchType.toLowerCase();
    const extractedType = specs.pouchType.toLowerCase();
    if (!extractedType.includes(quotedType) && !quotedType.includes('unknown')) {
      warnings.push(`パウチタイプ不一致: 見積もり=${quotationData.pouchType}, 抽出=${specs.pouchType}`);
      agreementScore -= 0.2;
    }
  }

  // Check dimensions agreement
  if (quotationData.dimensions) {
    const tolerance = specs.dimensions.tolerance || 3;
    const widthDiff = Math.abs(specs.dimensions.width - quotationData.dimensions.width);
    const heightDiff = Math.abs(specs.dimensions.height - quotationData.dimensions.height);
    const gussetDiff = Math.abs(specs.dimensions.gusset - quotationData.dimensions.gusset);

    if (widthDiff > tolerance || heightDiff > tolerance || gussetDiff > tolerance) {
      warnings.push('寸法不一致: 見積もりとAIファイルで寸法が異なります');
      agreementScore -= 0.3;
    }
  }

  // Check materials agreement
  if (quotationData.materials && quotationData.materials.length > 0) {
    const extractedMaterials = specs.materials.map(m => m.material);
    const commonMaterials = quotationData.materials.filter(m =>
      extractedMaterials.some(em => em.includes(m) || m.includes(em))
    );

    if (commonMaterials.length < quotationData.materials.length) {
      warnings.push('材質不一致: 見積もりとAIファイルで材質が異なります');
      agreementScore -= 0.3;
    }
  }

  return {
    isValid: true, // Cross-check is informational, not a hard validation
    errors,
    warnings,
  };
}

// ============================================================
// Batch Processing
// ============================================================

/**
 * 複数のAIファイルから仕様書を抽出（バッチ処理）
 * Extract specifications from multiple AI files
 */
export async function batchExtractSpecifications(
  aiFiles: Array<{ aiData: AiFileData; fileName: string }>
): Promise<Array<{ fileName: string; result: ExtractionResult }>> {
  const results = await Promise.all(
    aiFiles.map(async ({ aiData, fileName }) => {
      try {
        const specs = extractSpecifications(aiData, fileName);
        const validation = validateSpecifications(specs);

        return {
          fileName,
          result: {
            success: true,
            specs,
            warnings: validation.warnings,
          } as ExtractionResult,
        };
      } catch (error) {
        return {
          fileName,
          result: {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          } as ExtractionResult,
        };
      }
    })
  );

  return results;
}
