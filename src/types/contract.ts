/**
 * Contract Types
 *
 * 契約関連型定義
 * Type definitions for contract management, PDF generation, and Japanese legal compliance
 */

import { SignatureType, SignatureData } from './signature';

// ============================================================
// Contract Signatory Types
// ============================================================

/**
 * 契約署名者情報
 * Contract signatory information
 */
export interface ContractSignatory {
  /** 署名者名 / Signatory name */
  name: string;
  /** 役職 / Title */
  title: string;
  /** 部署 / Department (optional) */
  department?: string;

  /** はんこ情報 / Stamp information */
  stamp?: {
    /** Base64エンコードされた印鑑画像 */
    imageUrl: string;
    /** 印鑑の配置位置 */
    position: { x: number; y: number };
    /** 印鑑のサイズ */
    size: number;
    /** 印鑑の種類 */
    type: 'company' | 'representative' | 'personal';
  };

  /** 署名情報 / Signature information */
  signature?: {
    /** Base64エンコードされた署名画像 */
    imageUrl: string;
    /** 署名の配置位置 */
    position: { x: number; y: number };
    /** 署名のサイズ */
    size: number;
  };

  /** 署名日時 / Signing date */
  date?: string;
  /** 署名者ID / Signatory ID */
  userId?: string;
}

// ============================================================
// Contract Item Types
// ============================================================

/**
 * 契約品目情報
 * Contract item information
 */
export interface ContractItem {
  /** 品目ID / Item ID */
  id: string;
  /** 品名 / Product name */
  name: string;
  /** 型式・仕様 / Specifications */
  specification: string;
  /** 数量 / Quantity */
  quantity: number;
  /** 単位 / Unit */
  unit: string;
  /** 単価（円）/ Unit price (JPY) */
  unitPrice: number;
  /** 金額（円）/ Amount (JPY) */
  amount: number;
  /** 備考 / Remarks (optional) */
  remarks?: string;
}

// ============================================================
// Contract Party Types
// ============================================================

/**
 * 契約当事者情報
 * Contract party information
 */
export interface ContractParty {
  /** 会社名 / Company name */
  name: string;
  /** 会社名（カナ）/ Company name (Katakana) */
  nameKana?: string;
  /** 住所 / Address */
  address: string;
  /** 郵便番号 / Postal code */
  postalCode: string;
  /** 代表者名 / Representative name */
  representative: string;
  /** 代表者役職 / Representative title */
  representativeTitle: string;
  /** 連絡先情報 / Contact information */
  contact?: {
    phone?: string;
    email?: string;
    fax?: string;
  };

  /** 銀行口座情報（販売者用）/ Bank information (for seller) */
  bankInfo?: {
    bankName: string;
    branchName: string;
    accountType: '普通' | '当座';
    accountNumber: string;
    accountHolder: string;
  };
}

// ============================================================
// Contract Terms Types
// ============================================================

/**
 * 契約条件
 * Contract terms
 */
export interface ContractTerms {
  /** 支払条件 / Payment terms */
  payment: {
    method: string;  // 支払方法
    deadline: string;  // 支払期限
    depositPercentage?: number;  // 前金率
    depositAmount?: number;  // 前金額
  };

  /** 納品条件 / Delivery terms */
  delivery: {
    period: string;  // 納期
    location: string;  // 納品場所
    conditions: string;  // 納品条件
    partialDelivery?: boolean;  // 分割納品の可否
  };

  /** 契約期間 / Contract period */
  period?: {
    startDate: string;  // 開始日
    endDate?: string;  // 終了日
    validity?: string;  // 有効期間
  };

  /** 特別条項 / Special terms */
  specialTerms?: string[];
}

// ============================================================
// Main Contract Data Type
// ============================================================

/**
 * 契約データ全体
 * Complete contract data
 */
export interface ContractData {
  // ============================================================
  // メタデータ / Metadata
  // ============================================================
  /** 契約番号 / Contract number */
  contractNumber: string;
  /** 発行日 / Issue date */
  issueDate: string;
  /** 契約日 / Effective date */
  effectiveDate: string;
  /** 有効期限 / Expiration date (optional) */
  validUntil?: string;
  /** 注文番号 / Order number (optional) */
  orderNumber?: string;
  /** 契約ステータス / Contract status */
  status: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled' | 'expired';

  // ============================================================
  // 契約当事者 / Contract Parties
  // ============================================================
  /** 販売者（甲）/ Seller information */
  seller: ContractParty;
  /** 購入者（乙）/ Buyer information */
  buyer: ContractParty;

  // ============================================================
  // 契約品目 / Contract Items
  // ============================================================
  /** 品目リスト / List of items */
  items: ContractItem[];

  // ============================================================
  // 契約条件 / Contract Terms
  // ============================================================
  /** 契約条件 / Contract terms */
  terms: ContractTerms;

  // ============================================================
  // 署名者情報 / Signatories
  // ============================================================
  /** 販売者署名者 / Seller signatory */
  sellerSignatory?: ContractSignatory;
  /** 購入者署名者 / Buyer signatory */
  buyerSignatory?: ContractSignatory;

  // ============================================================
  // 付帯情報 / Additional Information
  // ============================================================
  /** 備考 / Remarks (optional) */
  remarks?: string;
  /** 添付ファイル / Attachments (optional) */
  attachments?: ContractAttachment[];
}

/**
 * 契約添付ファイル
 * Contract attachment
 */
export interface ContractAttachment {
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

// ============================================================
// PDF Generation Types
// ============================================================

/**
 * PDF生成オプション
 * PDF generation options
 */
export interface PdfGenerationOptions {
  /** 出力ファイルパス / Output file path */
  outputPath?: string;
  /** 用紙サイズ / Paper format */
  format?: 'A4' | 'A3' | 'Letter' | 'Legal';
  /** 向き / Orientation */
  orientation?: 'portrait' | 'landscape';
  /** ヘッダー・フッター表示 / Display header/footer */
  displayHeaderFooter?: boolean;
  /** 背景印刷 / Print background */
  printBackground?: boolean;
  /** 余白 / Margins */
  margin?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
}

/**
 * PDF生成結果
 * PDF generation result
 */
export interface PdfGenerationResult {
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
  };
}

// ============================================================
// Contract Validation Types
// ============================================================

/**
 * 契約データ検証結果
 * Contract data validation result
 */
export interface ContractValidationResult {
  /** 有効フラグ / Valid flag */
  isValid: boolean;
  /** エラーリスト / Error list */
  errors: ValidationError[];
  /** 警告リスト / Warning list */
  warnings: ValidationWarning[];
}

/**
 * 検証エラー
 * Validation error
 */
export interface ValidationError {
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
 * 検証警告
 * Validation warning
 */
export interface ValidationWarning {
  /** 警告コード / Warning code */
  code: string;
  /** フィールド名 / Field name */
  field?: string;
  /** 警告メッセージ / Warning message */
  message: string;
}

// ============================================================
// Contract Status Types
// ============================================================

/**
 * 契約ステータス履歴
 * Contract status history
 */
export interface ContractStatusHistory {
  /** ID / ID */
  id: string;
  /** 契約ID / Contract ID */
  contractId: string;
  /** 変更前ステータス / Previous status */
  fromStatus: string;
  /** 変更後ステータス / New status */
  toStatus: string;
  /** 変更日時 / Changed at */
  changedAt: string;
  /** 変更者ID / Changed by user ID */
  changedBy: string;
  /** 変更理由 / Reason */
  reason?: string;
}

// ============================================================
// Japanese Legal Contract Types
// ============================================================

/**
 * 日本の契約種類
 * Japanese contract types
 */
export type JapaneseContractType =
  | '売買契約'  // Sales contract
  | '請負契約'  // Service contract
  | '賃貸借契約'  // Lease agreement
  | '委任契約'  // Agency agreement
  | '業務委託契約'  // Outsourcing agreement
  | '秘密保持契約'  // NDA
  | '共同開発契約'  // Joint development agreement
  | 'ライセンス契約'  // License agreement
  | '前金契約';  // Deposit agreement (current template)

/**
 * 日本の法令参照
 * Japanese law references
 */
export interface JapaneseLawReference {
  /** 法令名 / Law name */
  name: string;
  /** 条文 / Article */
  article?: string;
  /** URL / URL */
  url: string;
  /** 関連する条文 / Related provisions */
  provisions?: string[];
}

/**
 * 契約の法的要件
 * Legal requirements for contract
 */
export interface ContractLegalRequirements {
  /** 準拠法 / Governing law */
  governingLaw: JapaneseLawReference;
  /** 管轄裁判所 / Jurisdiction */
  jurisdiction: {
    court: string;
    location: string;
  };
  /** 電子署名法準拠 / Electronic signature act compliance */
  electronicSignatureCompliance: boolean;
  /** 電子契約法準拠 / Electronic contract act compliance */
  electronicContractCompliance: boolean;
  /** 必要条項 / Required clauses */
  requiredClauses: string[];
}

// ============================================================
// Type Guards
// ============================================================

/**
 * 契約データかどうかチェック
 * Check if data is valid ContractData
 */
export function isContractData(data: unknown): data is ContractData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const contract = data as Partial<ContractData>;

  return (
    typeof contract.contractNumber === 'string' &&
    typeof contract.issueDate === 'string' &&
    typeof contract.effectiveDate === 'string' &&
    typeof contract.seller === 'object' &&
    typeof contract.buyer === 'object' &&
    Array.isArray(contract.items) &&
    contract.items.length > 0
  );
}

/**
 * 契約品目かどうかチェック
 * Check if data is valid ContractItem
 */
export function isContractItem(data: unknown): data is ContractItem {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const item = data as Partial<ContractItem>;

  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.specification === 'string' &&
    typeof item.quantity === 'number' &&
    typeof item.unitPrice === 'number' &&
    typeof item.amount === 'number'
  );
}

/**
 * 契約当事者かどうかチェック
 * Check if data is valid ContractParty
 */
export function isContractParty(data: unknown): data is ContractParty {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const party = data as Partial<ContractParty>;

  return (
    typeof party.name === 'string' &&
    typeof party.address === 'string' &&
    typeof party.postalCode === 'string' &&
    typeof party.representative === 'string' &&
    typeof party.representativeTitle === 'string'
  );
}

// ============================================================
// Constants
// ============================================================

/**
 * 日本の契約テンプレート定数
 */
export const JAPANESE_CONTRACT_CONSTANTS = {
  /** 契約番号フォーマット / Contract number format */
  CONTRACT_NUMBER_FORMAT: 'CTR-YYYY-####',

  /** 消費税率 / Consumption tax rate */
  CONSUMPTION_TAX_RATE: 0.10,

  /** 契約書の有効期間（デフォルト）/ Default validity period */
  DEFAULT_VALIDITY_PERIOD: '1年',

  /** 前金の最大率 / Maximum deposit percentage */
  MAX_DEPOSIT_PERCENTAGE: 0.5,

  /** 遅延損害金率 / Default late payment penalty rate */
  DEFAULT_LATE_PENALTY_RATE: 0.145,  // 14.5% per year

  /** 署名有効期間 / Signature validity period */
  SIGNATURE_VALIDITY_YEARS: 10,
} as const;

/**
 * 日本の時代定数（日付フォーマット用）
 * Japanese era constants for date formatting
 */
export const JAPANESE_ERAS = [
  { name: '明治', start: new Date(1868, 8, 8), end: new Date(1912, 6, 29) },
  { name: '大正', start: new Date(1912, 7, 29), end: new Date(1926, 11, 24) },
  { name: '昭和', start: new Date(1926, 11, 24), end: new Date(1989, 0, 7) },
  { name: '平成', start: new Date(1989, 0, 8), end: new Date(2019, 3, 30) },
  { name: '令和', start: new Date(2019, 4, 1), end: new Date(2030, 11, 31) },
] as const;
