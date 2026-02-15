/**
 * Electronic Signature Types (Japan e-Signature Law Compliant)
 *
 * 日本の電子署名法に準拠した電子署名システムの型定義
 * Japan Electronic Signature Law Compliance Types
 */

import { Database } from './database'

// ============================================================
// Webhook Types
// ============================================================

/**
 * DocuSign webhook payload
 */
export interface DocuSignWebhookPayload {
  envelopeId: string
  status: string
  event: string
  declinedBy?: {
    name: string
    email: string
  }
  declinedReason?: string
  [key: string]: unknown
}

/**
 * HelloSign webhook payload
 */
export interface HelloSignWebhookPayload {
  signature_request?: {
    signature_request_id: string
    declined_by?: {
      name: string
      email: string
    }
  }
  event?: {
    event_type: string
  }
  decline_reason?: string
  [key: string]: unknown
}

/**
 * Generic webhook payload (union type)
 */
export type SignatureWebhookPayload = DocuSignWebhookPayload | HelloSignWebhookPayload

/**
 * Signature signer information
 */
export interface SignatureSigner {
  name: string
  email: string
  signedAt?: string
  status?: string
}

// ============================================================
// Type Guards
// ============================================================

/**
 * Check if payload is from DocuSign
 */
export function isDocuSignPayload(payload: SignatureWebhookPayload): payload is DocuSignWebhookPayload {
  return 'envelopeId' in payload && 'status' in payload
}

/**
 * Check if payload is from HelloSign
 */
export function isHelloSignPayload(payload: SignatureWebhookPayload): payload is HelloSignWebhookPayload {
  return 'signature_request' in payload
}

/**
 * Check if value is a valid signer
 */
export function isSignatureSigner(value: unknown): value is SignatureSigner {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'email' in value &&
    typeof value.name === 'string' &&
    typeof value.email === 'string'
  )
}

// ============================================================
// Database Type Helpers
// ============================================================

/**
 * Get signatures table row type
 */
export type SignaturesRow = Database['public']['Tables']['signatures']['Row']

/**
 * Get signatures table insert type
 */
export type SignaturesInsert = Database['public']['Tables']['signatures']['Insert']

/**
 * Get signatures table update type
 */
export type SignaturesUpdate = Database['public']['Tables']['signatures']['Update']

/**
 * Get signature_events table row type
 */
export type SignatureEventsRow = Database['public']['Tables']['signature_events']['Row']

/**
 * Get signature_events table insert type
 */
export type SignatureEventsInsert = Database['public']['Tables']['signature_events']['Insert']

// ============================================================
// Signature Types
// ============================================================

/**
 *署名タイプ
 * - handwritten: 手書き署名 (Canvas-based signature)
 * - hanko: はんこ・印鑑 (Traditional Japanese seal)
 * - mixed: 混合 (Both handwritten and hanko)
 */
export type SignatureType = 'handwritten' | 'hanko' | 'mixed';

/**
 * 署名データ構造
 */
export interface SignatureData {
  type: SignatureType;
  // 手書き署名データ
  handwritten?: {
    signatureImageUrl: string;  // Base64 encoded signature image
    canvasWidth: number;
    canvasHeight: number;
    strokeCount: number;
    signingDuration: number;  // milliseconds
  };
  // はんこデータ
  hanko?: {
    hankoImageUrl: string;  // Uploaded hanko image URL
    hankoName: string;  // はんこの名称 (e.g., "代表者印")
    originalFileName: string;
    fileSize: number;
  };
  // 署名メタデータ
  metadata: {
    signedAt: string;  // ISO 8601 timestamp
    ipAddress: string;
    userAgent: string;
    location?: {
      country: string;
      region: string;
      city: string;
      latitude: number;
      longitude: number;
    };
    deviceInfo?: {
      type: 'desktop' | 'tablet' | 'mobile';
      os: string;
      browser: string;
    };
  };
}

/**
 * タイムスタンプデータ
 */
export interface TimestampData {
  token: string;  // TSAから発行されたトークン
  timestamp: string;  // ISO 8601 timestamp
  tsaUrl: string;  // タイムスタンプ発行機関URL
  verified: boolean;  // 検証済みフラグ
  verifiedAt?: string;  // 検証日時
  certificateHash: string;  // 証明書のハッシュ値
}

/**
 * 署名証明書データ
 */
export interface SignatureCertificate {
  certificateId: string;  // 証明書ID
  contractId: string;  // 契約書ID
  orderId: string;  // 注文ID
  signerName: string;  // 署名者名
  signerRole: 'customer' | 'admin';  // 署名者役割
  signatureType: SignatureType;
  signedAt: string;  // 署名日時
  timestampData: TimestampData;
  legalValidity: {
    compliant: boolean;  // 法的に準拠
    lawReference: string;  // 法律参照 (e.g., "電子署名法 第3条")
    expiryDate: string;  // 有効期限
  };
  certificateUrl: string;  // 証明書PDF URL
  generatedAt: string;  // 生成日時
}

/**
 * 署名検証結果
 */
export interface SignatureVerification {
  valid: boolean;
  signatureId: string;
  checks: {
    signatureIntegrity: boolean;  // 署名の整合性
    timestampValid: boolean;  // タイムスタンプの有効性
    notExpired: boolean;  // 有効期限内
    signerAuthorized: boolean;  // 署名権限あり
  };
  failures: string[];  // 失敗理由
  verifiedAt: string;
  verifiedBy: string;  // 検証者ID
}

/**
 * はんこ画像検証結果
 */
export interface HankoValidation {
  valid: boolean;
  confidence: number;  // 0-1 (信頼度)
  checks: {
    imageFormat: boolean;  // 許可された画像形式
    imageSize: boolean;  // 適切なサイズ
    imageQuality: boolean;  // 画質チェック
    transparency: boolean;  // 透明背景
    circularShape: boolean;  // 円形チェック (オプション)
  };
  errors: string[];
  warnings: string[];
}

/**
 * タイムスタンプ発行リクエスト
 */
export interface TimestampRequest {
  documentHash: string;  // ドキュメントのハッシュ値
  signerId: string;  // 署名者ID
  contractId: string;  // 契約書ID
}

/**
 * タイムスタンプ発行レスポンス
 */
export interface TimestampResponse {
  success: boolean;
  timestampToken?: string;
  timestamp: string;
  tsaUrl: string;
  error?: string;
}

/**
 * 署名証明書生成リクエスト
 */
export interface CertificateRequest {
  contractId: string;
  signerId: string;
  signerName: string;
  signerRole: 'customer' | 'admin';
  signatureData: SignatureData;
  timestampData: TimestampData;
  contractDetails: {
    contractNumber: string;
    contractTitle: string;
    totalAmount: number;
    currency: string;
  };
}

// ============================================================
// API Request/Response Types
// ============================================================

/**
 * 署名リクエスト (Contract Signing API)
 */
export interface SignContractRequest {
  contractId: string;
  signatureType: SignatureType;
  // 手書き署名の場合
  handwrittenSignature?: string;  // Base64 encoded image
  // はんこの場合
  hankoImageId?: string;  // Uploaded file ID
  // 共通
  ipAddress: string;
  userAgent: string;
  legalAgreement: boolean;  // 利用規約同意
}

/**
 * 署名レスポンス
 */
export interface SignContractResponse {
  success: boolean;
  message: string;
  contractId?: string;
  signatureId?: string;
  timestampData?: TimestampData;
  certificateUrl?: string;
  error?: string;
}

/**
 * はんこ画像アップロードリクエスト
 */
export interface UploadHankoRequest {
  file: File;
  hankoName: string;
  userId: string;
}

/**
 * はんこ画像アップロードレスポンス
 */
export interface UploadHankoResponse {
  success: boolean;
  hankoImageUrl?: string;
  hankoImageId?: string;
  validation?: HankoValidation;
  error?: string;
}

/**
 * タイムスタンプ検証リクエスト
 */
export interface VerifyTimestampRequest {
  timestampToken: string;
  documentHash: string;
}

/**
 * タイムスタンプ検証レスポンス
 */
export interface VerifyTimestampResponse {
  valid: boolean;
  timestamp: string;
  verifiedAt: string;
  error?: string;
}

// ============================================================
// Constants
// ============================================================

/**
 * 許可されるはんこ画像形式
 */
export const ALLOWED_HANKO_FORMATS = ['image/png', 'image/jpeg', 'image/webp'];

/**
 * はんこ画像の最大サイズ (5MB)
 */
export const MAX_HANKO_SIZE = 5 * 1024 * 1024;

/**
 * 推奨はんこ画像サイズ
 */
export const RECOMMENDED_HANKO_SIZE = {
  min: 200,  // 200x200px
  max: 2000,  // 2000x2000px
  optimal: 500,  // 500x500px
};

/**
 * 署名有効期限 (デフォルト: 10年)
 */
export const SIGNATURE_VALIDITY_YEARS = 10;

/**
 * TSA URLs (タイムスタンプ発行機関)
 * 日本のTSAサービスプロバイダー
 */
export const TSA_PROVIDERS = {
  // 日本タイムスタンプ公社 (JTS)
  JTS: 'https://tsa.jts.gr.jp',
  // GMOインターネット株式会社
  GMO: 'https://tsg.gmo.jp',
  // サイバートラスト株式会社
  CYBERTRUST: 'https://tsg.cybertrust.co.jp',
  // デモ用 (開発環境)
  DEMO: 'https://demo-tsa.example.com',
} as const;

/**
 * 法律参照情報
 */
export const LEGAL_REFERENCES = {
  // 電子署名法
  ELECTRONIC_SIGNATURE_ACT: {
    title: '電子署名及び認証業務に関する法律',
    article: '第3条',
    url: 'https://elaws.e-gov.go.jp/document?lawid=426AC0000000102_20220401_503AC0000000037',
  },
  // 電子契約法
  ELECTRONIC_CONTRACT_ACT: {
    title: '電子契約法',
    article: '第4条',
    url: 'https://elaws.e-gov.go.jp/document?lawid=411AC0000000107',
  },
  // e-文書法
  E_DOCUMENT_ACT: {
    title: '電子文書法',
    article: '第3条',
    url: 'https://elaws.e-gov.go.jp/document?lawid=416AC0000000454',
  },
} as const;
