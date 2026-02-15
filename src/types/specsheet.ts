/**
 * Specification Sheet Types
 *
 * 仕様書関連型定義
 * Type definitions for specification sheet (B2B作業標準書) management and PDF generation
 */

// ============================================================
// Spec Sheet Metadata Types
// ============================================================

/**
 * 仕様書番号タイプ
 * Spec sheet number type
 */
export type SpecSheetNumberType =
  | 'B2B-SPEC'    // B2B標準仕様書
  | 'CUSTOM-SPEC' // カスタム仕様書
  | 'TECH-SPEC';  // 技術仕様書

/**
 * 仕様書カテゴリー
 * Spec sheet category
 */
export type SpecSheetCategory =
  | 'packaging'    // 包装資材
  | 'bag'          // 袋製品
  | 'film'         // フィルム
  | 'container'    // 容器
  | 'label'        // ラベル
  | 'sealing'      // 封筒
  | 'custom';      // カスタム

/**
 * 仕様書ステータス
 * Spec sheet status
 */
export type SpecSheetStatus =
  | 'draft'        // 下書き
  | 'pending'      // 承認待ち
  | 'approved'     // 承認済み
  | 'active'       // 有効
  | 'superseded'   // 改定版あり
  | 'archived';    // アーカイブ

// ============================================================
// Product Specification Types
// ============================================================

/**
 * 製品仕様情報
 * Product specification information
 */
export interface ProductSpec {
  /** 製品ID / Product ID */
  id: string;
  /** 製品名 / Product name */
  name: string;
  /** 製品名（カナ）/ Product name (Katakana) */
  nameKana?: string;
  /** 製品コード / Product code */
  productCode: string;
  /** カテゴリー / Category */
  category: SpecSheetCategory;

  /** 寸法 / Dimensions */
  dimensions: {
    /** 長さ (mm) */
    length?: number;
    /** 幅 (mm) */
    width?: number;
    /** 高さ/奥行き (mm) */
    height?: number;
    /** 厚み (μm) / Thickness */
    thickness?: number;
    /** 口径 (mm) */
    opening?: number;
    /** 許容差 / Tolerance */
    tolerance?: string;
  };

  /** 材質構成 / Material composition */
  materials: MaterialLayer[];

  /** 仕様・特徴 / Specifications and features */
  specifications: {
    /** 用途 / Application */
    application?: string;
    /** 耐熱温度 / Heat resistance */
    heatResistance?: string;
    /** 耐冷温度 / Cold resistance */
    coldResistance?: string;
    /** 透明度 / Transparency */
    transparency?: 'transparent' | 'translucent' | 'opaque';
    /** 耐水性 / Water resistance */
    waterResistance?: boolean;
    /** 気密性 / Air tightness */
    airTightness?: boolean;
    /** 防湿性 / Moisture resistance */
    moistureResistance?: boolean;
    /** 帯電防止 / Antistatic */
    antistatic?: boolean;
    /** 紫外線カット / UV protection */
    uvProtection?: boolean;
    /** その他の特徴 / Other features */
    features?: string[];
  };

  /** 性能基準 / Performance standards */
  performance?: {
    /** 引張強度 / Tensile strength */
    tensileStrength?: string;
    /** 破裂強度 / Tear strength */
    tearStrength?: string;
    /** 密封強度 / Seal strength */
    sealStrength?: string;
    /** 透湿度 / Water vapor transmission rate */
    wvtr?: string;
    /** 酸素透過度 / Oxygen transmission rate */
    otr?: string;
  };

  /** 規格準拠 / Compliance standards */
  compliance?: {
    /** 食品衛生法 / Food Sanitation Act */
    foodSanitationAct?: boolean;
    /** JIS規格 / JIS standards */
    jisStandards?: string[];
    /** ISO規格 / ISO standards */
    isoStandards?: string[];
    /** その他の規格 / Other standards */
    otherStandards?: string[];
  };
}

/**
 * 材質層情報
 * Material layer information (for multilayer products)
 */
export interface MaterialLayer {
  /** 層の位置 / Layer position */
  layer: number;
  /** 材質名 / Material name */
  material: string;
  /** 厚み (μm) / Thickness */
  thickness?: number;
  /** 機能 / Function */
  function?: string;
}

// ============================================================
// Production Specification Types
// ============================================================

/**
 * 生産仕様情報
 * Production specification information
 */
export interface ProductionSpec {
  /** 生産方法 / Production method */
  method: string;
  /** 生産工程 / Production process */
  process: string[];
  /** 使用機器 / Equipment used */
  equipment?: string[];

  /** 品質管理 / Quality control */
  qualityControl: {
    /** 検査基準 / Inspection standards */
    inspectionStandards: string[];
    /** 試験方法 / Test methods */
    testMethods?: string[];
    /** AQL基準 / AQL standards */
    aqlStandards?: string;
  };

  /** 包装条件 / Packaging conditions */
  packaging: {
    /** 包装単位 / Packaging unit */
    unit: string;
    /** 包装数量 / Quantity per package */
    quantity: number;
    /** 梱包仕様 / Packing specifications */
    packingSpec: string;
  };

  /** 納期・リードタイム / Delivery and lead time */
  delivery: {
    /** 標準リードタイム / Standard lead time */
    leadTime: string;
    /** 最小ロット / Minimum lot size */
    minLotSize: number;
    /** ロット単位 / Lot unit */
    lotUnit: string;
  };
}

// ============================================================
// Design Specification Types
// ============================================================

/**
 * デザイン仕様情報
 * Design specification information
 */
export interface DesignSpec {
  /** 印刷仕様 / Printing specifications */
  printing?: {
    /** 印刷方法 / Printing method */
    method: 'gravure' | 'flexo' | 'offset' | 'digital' | 'none';
    /** 色数 / Number of colors */
    colors: number;
    /** 印刷面 / Printing sides */
    sides: 'front' | 'back' | 'both';
    /** 特殊加工 / Special finishing */
    finishing?: string[];
  };

  /** カラーガイド / Color guide */
  colorGuide?: {
    /** 基本色 / Base colors */
    baseColors?: string[];
    /** 特色 / Special colors */
    spotColors?: string[];
    /** カラーコード / Color codes (PANTONE/DIC) */
    colorCodes?: Record<string, string>;
  };

  /** デザインデータ / Design data */
  designData?: {
    /** ファイル形式 / File format */
    format: string;
    /** 解像度 / Resolution */
    resolution: string;
    /** カラーモード / Color mode */
    colorMode: 'CMYK' | 'PMS' | 'RGB';
    /** ファイルURL / File URL */
    fileUrl?: string;
  };
}

// ============================================================
// Pricing Specification Types
// ============================================================

/**
 * 価格仕様情報
 * Pricing specification information
 */
export interface PricingSpec {
  /** 基本価格 / Base price */
  basePrice: {
    /** 単価（円）/ Unit price (JPY) */
    unitPrice: number;
    /** 最低発注量 / Minimum order quantity */
    moq: number;
    /** 通貨 / Currency */
    currency: 'JPY' | 'USD';
  };

  /** 数量割引 / Volume discount */
  volumeDiscount?: {
    /** 数量 / Quantity */
    quantity: number;
    /** 割引率 / Discount rate */
    discountRate: number;
  }[];

  /** オプション価格 / Option pricing */
  options?: {
    /** オプション名 / Option name */
    name: string;
    /** 価格 / Price */
    price: number;
    /** 単位 / Unit */
    unit: string;
  }[];

  /** 見積もり有効期限 / Quote validity period */
  validityPeriod: string;
}

// ============================================================
// Main Spec Sheet Data Type
// ============================================================

/**
 * 仕様書データ全体
 * Complete spec sheet data
 */
export interface SpecSheetData {
  // ============================================================
  // メタデータ / Metadata
  // ============================================================
  /** 仕様書番号 / Spec sheet number */
  specNumber: string;
  /** 版数 / Revision number */
  revision: string;
  /** 発行日 / Issue date */
  issueDate: string;
  /** 有効期限 / Expiration date */
  validUntil?: string;
  /** ステータス / Status */
  status: SpecSheetStatus;
  /** カテゴリー / Category */
  category: SpecSheetCategory;
  /** タイトル / Title */
  title: string;
  /** 説明 / Description */
  description?: string;

  // ============================================================
  // 顧客情報 / Customer Information
  // ============================================================
  /** 顧客 / Customer */
  customer: {
    /** 会社名 / Company name */
    name: string;
    /** 部署名 / Department name */
    department?: string;
    /** 担当者名 / Contact person name */
    contactPerson: string;
    /** 連絡先 / Contact */
    contact?: {
      phone?: string;
      email?: string;
    };
  };

  // ============================================================
  // 製品仕様 / Product Specifications
  // ============================================================
  /** 製品仕様 / Product specifications */
  product: ProductSpec;

  // ============================================================
  // 生産仕様 / Production Specifications
  // ============================================================
  /** 生産仕様 / Production specifications */
  production: ProductionSpec;

  // ============================================================
  // デザイン仕様 / Design Specifications
  // ============================================================
  /** デザイン仕様 / Design specifications */
  design?: DesignSpec;

  // ============================================================
  // 価格仕様 / Pricing Specifications
  // ============================================================
  /** 価格仕様 / Pricing specifications */
  pricing?: PricingSpec;

  // ============================================================
  // 付帯情報 / Additional Information
  // ============================================================
  /** 備考 / Remarks */
  remarks?: string;
  /** 添付ファイル / Attachments */
  attachments?: SpecSheetAttachment[];
  /** 承認情報 / Approval information */
  approvals?: SpecSheetApproval[];
}

/**
 * 仕様書添付ファイル
 * Spec sheet attachment
 */
export interface SpecSheetAttachment {
  /** ファイルID / File ID */
  id: string;
  /** ファイル名 / File name */
  name: string;
  /** ファイルタイプ / File type */
  type: string;
  /** ファイルサイズ / File size */
  size: number;
  /** ファイルURL / File URL */
  url: string;
  /** アップロード日時 / Upload date */
  uploadedAt: string;
}

/**
 * 仕様書承認情報
 * Spec sheet approval information
 */
export interface SpecSheetApproval {
  /** 承認者名 / Approver name */
  name: string;
  /** 役職 / Title */
  title: string;
  /** 承認日 / Approval date */
  date?: string;
  /** 承認ステータス / Approval status */
  status: 'pending' | 'approved' | 'rejected';
  /** コメント / Comments */
  comments?: string;
}

// ============================================================
// PDF Generation Types
// ============================================================

/**
 * 仕様書PDF生成オプション
 * Spec sheet PDF generation options
 */
export interface SpecSheetPdfOptions {
  /** 出力ファイルパス / Output file path */
  outputPath?: string;
  /** 用紙サイズ / Paper format */
  format?: 'A4' | 'A3' | 'Letter';
  /** 向き / Orientation */
  orientation?: 'portrait' | 'landscape';
  /** テンプレート / Template */
  template?: 'standard' | 'detailed' | 'simple';
  /** 言語 / Language */
  language?: 'ja' | 'en' | 'both';
  /** 図面を含める / Include diagrams */
  includeDiagrams?: boolean;
  /** 価格を含める / Include pricing */
  includePricing?: boolean;
  /** 承認欄を含める / Include approval section */
  includeApproval?: boolean;
}

/**
 * 仕様書PDF生成結果
 * Spec sheet PDF generation result
 */
export interface SpecSheetPdfResult {
  /** 成功フラグ / Success flag */
  success: boolean;
  /** ファイルパス / File path */
  filePath?: string;
  /** PDFバッファ / PDF buffer */
  buffer?: Buffer;
  /** Base64エンコードされたPDF / Base64 encoded PDF */
  base64?: string;
  /** エラーメッセージ / Error message */
  error?: string;
  /** 生成メタデータ / Generation metadata */
  metadata?: {
    generatedAt: string;
    fileSize: number;
    pageCount?: number;
    specNumber: string;
    revision: string;
  };
}

// ============================================================
// Spec Sheet Templates Types
// ============================================================

/**
 * 仕様書テンプレートデータ
 * Spec sheet template data
 */
export interface SpecSheetTemplateData {
  /** ヘッダー情報 / Header information */
  header: {
    /** 会社名 / Company name */
    companyName: string;
    /** 会社名（カナ）/ Company name (Katakana) */
    companyNameKana?: string;
    /** ロゴURL / Logo URL */
    logoUrl?: string;
    /** 住所 / Address */
    address: string;
    /** 電話番号 / Phone number */
    phone?: string;
    /** メールアドレス / Email address */
    email?: string;
    /** ウェブサイト / Website */
    website?: string;
  };

  /** 仕様書情報 / Spec sheet information */
  specSheet: {
    /** 仕様書番号 / Spec sheet number */
    specNumber: string;
    /** 版数 / Revision */
    revision: string;
    /** 発行日 / Issue date */
    issueDate: string;
    /** タイトル / Title */
    title: string;
    /** カテゴリー名 / Category name */
    categoryName: string;
  };

  /** 顧客情報 / Customer information */
  customer: {
    /** 会社名 / Company name */
    name: string;
    /** 部署名 / Department name */
    department?: string;
    /** 担当者名 / Contact person name */
    contactPerson: string;
  };

  /** 製品情報 / Product information */
  product: {
    /** 製品名 / Product name */
    name: string;
    /** 製品コード / Product code */
    productCode: string;
    /** 寸法表 / Dimensions table */
    dimensionsTable: DimensionRow[];
    /** 材質構成 / Material composition */
    materials: MaterialLayer[];
    /** 仕様・特徴 / Specifications and features */
    specifications: SpecFeature[];
    /** 性能基準 / Performance standards */
    performance?: PerformanceRow[];
    /** 規格準拠 / Compliance standards */
    compliance?: string[];
  };

  /** 生産情報 / Production information */
  production: {
    /** 生産方法 / Production method */
    method: string;
    /** 生産工程 / Production process */
    process: string[];
    /** 品質管理 / Quality control */
    qualityControl: {
      inspectionStandards: string[];
      aqlStandards?: string;
    };
    /** 包装条件 / Packaging conditions */
    packaging: {
      unit: string;
      quantity: number;
      packingSpec: string;
    };
    /** 納期・リードタイム / Delivery and lead time */
    delivery: {
      leadTime: string;
      minLotSize: number;
      lotUnit: string;
    };
  };

  /** デザイン情報（オプション）/ Design information (optional) */
  design?: {
    /** 印刷仕様 / Printing specifications */
    printing?: string;
    /** カラーガイド / Color guide */
    colorGuide?: string[];
    /** デザインデータ / Design data */
    designData?: string;
  };

  /** 価格情報（オプション）/ Pricing information (optional) */
  pricing?: {
    /** 基本価格 / Base price */
    basePrice: string;
    /** 最低発注量 / Minimum order quantity */
    moq: string;
    /** 数量割引 / Volume discount */
    volumeDiscount?: string[];
  };

  /** 備考 / Remarks */
  remarks?: string;

  /** 承認欄（オプション）/ Approval section (optional) */
  approvals?: {
    /** 作成者 / Prepared by */
    preparedBy?: string;
    /** 作成日 / Date prepared */
    preparedDate?: string;
    /** 承認者1 / Approver 1 */
    approver1?: {
      name: string;
      title: string;
      date?: string;
    };
    /** 承認者2 / Approver 2 */
    approver2?: {
      name: string;
      title: string;
      date?: string;
    };
  };
}

/**
 * 寸法テーブル行
 * Dimension table row
 */
export interface DimensionRow {
  /** 項目名 / Item name */
  item: string;
  /** 数値 / Value */
  value: string;
  /** 単位 / Unit */
  unit: string;
  /** 備考 / Remarks */
  remarks?: string;
}

/**
 * 仕様・特徴
 * Specification feature
 */
export interface SpecFeature {
  /** 項目名 / Item name */
  item: string;
  /** 内容 / Description */
  description: string;
}

/**
 * 性能基準行
 * Performance standard row
 */
export interface PerformanceRow {
  /** 項目名 / Item name */
  item: string;
  /** 基準値 / Standard value */
  value: string;
  /** 測定方法 / Test method */
  method?: string;
}

// ============================================================
// Spec Sheet Validation Types
// ============================================================

/**
 * 仕様書検証結果
 * Spec sheet validation result
 */
export interface SpecSheetValidationResult {
  /** 有効フラグ / Valid flag */
  isValid: boolean;
  /** エラーリスト / Error list */
  errors: SpecSheetValidationError[];
  /** 警告リスト / Warning list */
  warnings: SpecSheetValidationWarning[];
}

/**
 * 仕様書検証エラー
 * Spec sheet validation error
 */
export interface SpecSheetValidationError {
  /** エラーコード / Error code */
  code: string;
  /** フィールド名 / Field name */
  field?: string;
  /** エラーメッセージ / Error message */
  message: string;
  /** 重大度 / Severity */
  severity: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * 仕様書検証警告
 * Spec sheet validation warning
 */
export interface SpecSheetValidationWarning {
  /** 警告コード / Warning code */
  code: string;
  /** フィールド名 / Field name */
  field?: string;
  /** 警告メッセージ / Warning message */
  message: string;
}

// ============================================================
// Type Guards
// ============================================================

/**
 * 仕様書データかどうかチェック
 * Check if data is valid SpecSheetData
 */
export function isSpecSheetData(data: unknown): data is SpecSheetData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const spec = data as Partial<SpecSheetData>;

  return (
    typeof spec.specNumber === 'string' &&
    typeof spec.revision === 'string' &&
    typeof spec.issueDate === 'string' &&
    typeof spec.status === 'string' &&
    typeof spec.customer === 'object' &&
    typeof spec.product === 'object' &&
    typeof spec.production === 'object'
  );
}

/**
 * 製品仕様かどうかチェック
 * Check if data is valid ProductSpec
 */
export function isProductSpec(data: unknown): data is ProductSpec {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const product = data as Partial<ProductSpec>;

  return (
    typeof product.id === 'string' &&
    typeof product.name === 'string' &&
    typeof product.productCode === 'string' &&
    typeof product.dimensions === 'object' &&
    Array.isArray(product.materials)
  );
}

// ============================================================
// Constants
// ============================================================

/**
 * 仕様書定数
 * Spec sheet constants
 */
export const SPEC_SHEET_CONSTANTS = {
  /** 仕様書番号フォーマット / Spec sheet number format */
  SPEC_NUMBER_FORMAT: 'B2B-SPEC-YYYY-####',

  /** デフォルト版数 / Default revision */
  DEFAULT_REVISION: '1.0',

  /** 見積もり有効期限（デフォルト）/ Default validity period */
  DEFAULT_VALIDITY_PERIOD: '90日間',

  /** 最小リードタイム / Minimum lead time */
  MIN_LEAD_TIME_DAYS: 14,

  /** 最大履歴表示数 / Maximum history entries */
  MAX_HISTORY_ENTRIES: 50,
} as const;

/**
 * 寸法項目日本語名マッピング
 * Dimension item Japanese name mapping
 */
export const DIMENSION_ITEM_NAMES: Record<string, string> = {
  length: '長さ',
  width: '幅',
  height: '高さ/奥行き',
  thickness: '厚み',
  opening: '口径',
  tolerance: '許容差',
} as const;

/**
 * 規格カテゴリー日本語名マッピング
 * Spec category Japanese name mapping
 */
export const SPEC_CATEGORY_NAMES: Record<SpecSheetCategory, string> = {
  packaging: '包装資材',
  bag: '袋製品',
  film: 'フィルム',
  container: '容器',
  label: 'ラベル',
  sealing: '封筒',
  custom: 'カスタム',
} as const;

/**
 * 仕様書ステータス日本語名マッピング
 * Spec sheet status Japanese name mapping
 */
export const SPEC_STATUS_NAMES: Record<SpecSheetStatus, string> = {
  draft: '下書き',
  pending: '承認待ち',
  approved: '承認済み',
  active: '有効',
  superseded: '改定版あり',
  archived: 'アーカイブ',
} as const;
