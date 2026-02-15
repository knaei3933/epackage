/**
 * Core API Types
 *
 * API関連のコア型定義
 * リクエスト/レスポンスの標準化
 * @module types/core/api
 */

import type { BaseResponse, PaginationParams } from './common';

// =====================================================
// API Request Types
// =====================================================

/**
 * 見積もりリクエスト
 */
export interface QuotationRequest {
  orderType: 'new' | 'repeat';
  contentsType: 'solid' | 'liquid' | 'powder';
  bagType: 'flat_3_side' | 'stand_up' | 'gusset';
  width: number;
  height: number;
  materialGenre: 'opp_al' | 'pet_al' | 'nylon_al';
  surfaceMaterial?: 'gloss_opp' | 'matte_opp';
  materialComposition?: 'comp_1' | 'comp_2';
  quantities: number[];
  deliveryDate?: string; // ISO date string
}

/**
 * PDF見積もりリクエスト
 */
export interface PDFQuotationRequest {
  requestId: string;
  companyInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

// =====================================================
// API Response Types
// =====================================================

/**
 * 見積もりレスポンス
 */
export interface QuotationResponse extends BaseResponse<{
  requestId: string;
  results: unknown[]; // QuotationResult[]
  calculation: {
    baseFee: number;
    materialCost: number;
    processingFee: number;
    totalBeforeDiscount: number;
  };
}> {
  success: true;
  data: {
    requestId: string;
    results: unknown[];
    calculation: {
      baseFee: number;
      materialCost: number;
      processingFee: number;
      totalBeforeDiscount: number;
    };
  };
}

/**
 * コンタクトレスポンス
 */
export interface ContactResponse extends BaseResponse<{
  contactId: string;
  message: string;
}> {
  success: true;
  data: {
    contactId: string;
    message: string;
  };
}

/**
 * PDF見積もりレスポンス
 */
export interface PDFQuotationResponse extends BaseResponse<{
  pdfUrl: string;
  downloadLink: string;
  validUntil: string;
}> {
  success: true;
  data: {
    pdfUrl: string;
    downloadLink: string;
    validUntil: string;
  };
}

// =====================================================
// Order & Quotation Response Types
// =====================================================

/**
 * 注文作成レスポンス
 */
export interface OrderCreateResponse {
  orderId: string;
  orderNumber: string;
  status: string;
  estimatedCompletion?: string;
  paymentInfo?: {
    method: string;
    amount: number;
    dueDate: string;
  };
}

/**
 * 見積作成レスポンス
 */
export interface QuotationCreateResponse {
  quotationId: string;
  quotationNumber: string;
  version: number;
  status: string;
  validUntil: string;
  pdfUrl?: string;
}

/**
 * 見積承認レスポンス
 */
export interface QuotationApprovalResponse {
  quotationId: string;
  approved: boolean;
  approvedBy: string;
  approvedAt: string;
  comments?: string;
  orderId?: string; // If converted to order
}

// =====================================================
// Production Response Types
// =====================================================

/**
 * 生産作業作成レスポンス
 */
export interface ProductionJobCreateResponse {
  jobId: string;
  jobNumber: string;
  orderId: string;
  status: string;
  estimatedStart?: string;
  estimatedCompletion?: string;
}

/**
 * 生産ステータス更新レスポンス
 */
export interface ProductionStatusUpdateResponse {
  jobId: string;
  previousStatus: string;
  newStatus: string;
  progressPercentage: number;
  updatedAt: string;
  notes?: string;
}

// =====================================================
// Shipment Response Types
// =====================================================

/**
 * 配送追跡情報
 */
export interface ShipmentTrackingInfo {
  shipmentId: string;
  carrier: string;
  trackingNumber: string;
  currentStatus: string;
  estimatedDelivery?: string;
  trackingHistory: Array<{
    status: string;
    location: string;
    timestamp: string;
  }>;
}

/**
 * 配送作成レスポンス
 */
export interface ShipmentCreateResponse {
  shipmentId: string;
  trackingNumber: string;
  carrier: string;
  labelUrl?: string;
  estimatedDelivery: string;
}

// =====================================================
// File Upload Response Types
// =====================================================

/**
 * ファイルアップロードレスポンス
 */
export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

/**
 * ファイル検証結果
 */
export interface FileValidationResult {
  valid: boolean;
  fileName: string;
  errors?: string[];
  warnings?: string[];
  fileType?: string;
  fileSize?: number;
}

// =====================================================
// Customer/Member Response Types
// =====================================================

/**
 * プロフィール更新レスポンス
 */
export interface ProfileUpdateResponse {
  userId: string;
  updatedFields: string[];
  updatedAt: string;
  previousValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
}

/**
 * 会員登録レスポンス
 */
export interface MemberRegistrationResponse {
  userId: string;
  email: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
  message: string;
  approvalRequired?: boolean;
}

/**
 * 会員ステータス変更レスポンス
 */
export interface MemberStatusChangeResponse {
  userId: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

// =====================================================
// Contract & Document Response Types
// =====================================================

/**
 * 契約書ダウンロードレスポンス
 */
export interface ContractDownloadResponse {
  contractId: string;
  downloadUrl: string;
  expiresAt: string;
  documentType: 'pdf' | 'docx';
}

/**
 * 署名リクエストレスポンス
 */
export interface SignatureRequestResponse {
  signatureRequestId: string;
  contractId: string;
  signUrl: string;
  expiresAt: string;
  status: 'pending' | 'signed' | 'expired';
}

/**
 * 署名ステータス
 */
export interface SignatureStatus {
  contractId: string;
  status: 'pending' | 'signed' | 'rejected' | 'expired';
  signedAt?: string;
  signedBy?: string;
  signatureUrl?: string;
}

// =====================================================
// Notification Response Types
// =====================================================

/**
 * 通知作成レスポンス
 */
export interface NotificationCreateResponse {
  notificationId: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  sentAt: string;
  deliveryMethod: 'email' | 'sms' | 'in-app' | 'push';
}

/**
 * 通知一括送信結果
 */
export interface NotificationBatchResponse {
  totalRecipients: number;
  sentSuccessfully: number;
  failed: number;
  errors: Array<{
    recipientId: string;
    error: string;
  }>;
}

// =====================================================
// Admin Response Types
// =====================================================

/**
 * 管理者ダッシュボードメトリクス
 */
export interface AdminDashboardMetrics {
  orders: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
  };
  quotations: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  production: {
    activeJobs: number;
    completedToday: number;
    delayedJobs: number;
  };
  shipments: {
    pendingShipment: number;
    inTransit: number;
    delivered: number;
  };
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

/**
 * 管理者作業結果
 */
export interface AdminActionResponse {
  success: boolean;
  action: string;
  resourceId: string;
  message: string;
  auditLogId?: string;
}

/**
 * 一括作業結果
 */
export interface BulkOperationResponse {
  success: boolean;
  processed: number;
  succeeded: number;
  failed: number;
  errors: Array<{
    id: string;
    error: string;
  }>;
}

// =====================================================
// Health Check Types
// =====================================================

/**
 * システムヘルスチェックレスポンス
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: {
      status: 'up' | 'down';
      latency?: number;
    };
    cache?: {
      status: 'up' | 'down';
      latency?: number;
    };
    email?: {
      status: 'up' | 'down';
      provider: string;
    };
    storage?: {
      status: 'up' | 'down';
      provider: string;
    };
  };
  version?: string;
}
