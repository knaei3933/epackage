/**
 * API Response Type Definitions
 *
 * 標準化されたAPIレスポンスタイプ
 * - 一貫したレスポンス構造
 * - 型安全性の保証
 * - any型の使用削減
 */

// =====================================================
// Base Response Types
// =====================================================

/**
 * 基本APIレスポンス構造
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

/**
 * エラー詳細情報
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string; // Development only
}

/**
 * エラーレスポンス
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: string | Record<string, string[]>;
  code?: string;
}

// =====================================================
// Pagination Types
// =====================================================

/**
 * ページネーションパラメータ
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * ページネーションされたレスポンス
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    count: number;
    page: number;
    limit: number;
    offset: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * 範囲ベースページネーションレスポンス（カーソルベース）
 */
export interface RangeResponse<T> {
  data: T[];
  range: {
    offset: number;
    limit: number;
    total: number;
    remaining: number;
  };
}

// =====================================================
// Admin API Types
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
// Order & Quotation Types
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
// Production Job Types
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
// Shipment Types
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
// Inventory Types
// =====================================================

/**
 * 在庫調整レスポンス
 */
export interface InventoryAdjustResponse {
  itemId: string;
  previousQuantity: number;
  newQuantity: number;
  adjustment: number;
  reason: string;
  adjustedBy: string;
  adjustedAt: string;
}

/**
 * 在庫アイテム
 */
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderLevel: number;
  location: string;
  lastUpdated: string;
}

// =====================================================
// Contract & Document Types
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
// Customer/Member Types
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
// Notification Types
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
// File Upload Types
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
// Analytics & Metrics Types
// =====================================================

/**
 * パフォーマンスメトリクス
 */
export interface PerformanceMetrics {
  period: {
    start: string;
    end: string;
  };
  orders: {
    total: number;
    averageValue: number;
    completionRate: number;
    averageProcessingTime: number; // hours
  };
  production: {
    throughput: number; // units per day
    efficiency: number; // percentage
    downtime: number; // hours
  };
  quality: {
    defectRate: number; // percentage
    returns: number;
    customerComplaints: number;
  };
}

// =====================================================
// Search & Filter Types
// =====================================================

/**
 * 検索パラメータ
 */
export interface SearchParams {
  query?: string;
  filters?: Record<string, unknown>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  pagination?: PaginationParams;
}

/**
 * 検索結果
 */
export interface SearchResult<T> {
  items: T[];
  total: number;
  searchTime: number; // milliseconds
  facets?: Record<string, Array<{
    value: string;
    count: number;
  }>>;
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

// =====================================================
// Utility Types
// =====================================================

/**
 * 成功/失敗結果タイプ
 */
export type Result<T, E = Error> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: E };

/**
 * IDタイプ（文字列ID）
 */
export type Id = string;

/**
 * タイムスタンプタイプ（ISO 8601）
 */
export type Timestamp = string;

/**
 * オプションフィールド（すべてのフィールドがオプション）
 */
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

/**
 * 必須IDとオプションの残り
 */
export type WithRequired<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};
