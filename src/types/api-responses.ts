/**
 * API Response Type Definitions
 *
 * 표준화된 API 응답 타입
 * - 일관된 응답 구조
 * - 타입 안전성 보장
 * - any 타입 사용 감소
 */

// =====================================================
// Base Response Types
// =====================================================

/**
 * 기본 API 응답 구조
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

/**
 * 에러 상세 정보
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string; // Development only
}

/**
 * 에러 응답
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
 * 페이지네이션 파라미터
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 페이지네이션된 응답
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
 * 범위 기반 페이지네이션 응답 (cursor-based)
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
 * 관리자 대시보드 메트릭
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
 * 관리자 작업 결과
 */
export interface AdminActionResponse {
  success: boolean;
  action: string;
  resourceId: string;
  message: string;
  auditLogId?: string;
}

/**
 * 벌크 작업 결과
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
 * 주문 생성 응답
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
 * 견적 생성 응답
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
 * 견적 승인 응답
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
 * 생산 작업 생성 응답
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
 * 생산 상태 업데이트 응답
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
 * 배송 추적 정보
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
 * 배송 생성 응답
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
 * 재고 조정 응답
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
 * 재고 품목
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
 * 계약 다운로드 응답
 */
export interface ContractDownloadResponse {
  contractId: string;
  downloadUrl: string;
  expiresAt: string;
  documentType: 'pdf' | 'docx';
}

/**
 * 서명 요청 응답
 */
export interface SignatureRequestResponse {
  signatureRequestId: string;
  contractId: string;
  signUrl: string;
  expiresAt: string;
  status: 'pending' | 'signed' | 'expired';
}

/**
 * 서명 상태
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
 * 프로필 업데이트 응답
 */
export interface ProfileUpdateResponse {
  userId: string;
  updatedFields: string[];
  updatedAt: string;
  previousValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
}

/**
 * 회원 등록 응답
 */
export interface MemberRegistrationResponse {
  userId: string;
  email: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
  message: string;
  approvalRequired?: boolean;
}

/**
 * 회원 상태 변경 응답
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
 * 알림 생성 응답
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
 * 알림 배치 발송 결과
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
 * 파일 업로드 응답
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
 * 파일 검증 결과
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
 * 성능 메트릭
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
 * 검색 파라미터
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
 * 검색 결과
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
 * 시스템 헬스 체크 응답
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
 * 성공/실패 결과 타입
 */
export type Result<T, E = Error> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: E };

/**
 * ID 타입 (문자열 ID)
 */
export type Id = string;

/**
 * 타임스탬프 타입 (ISO 8601)
 */
export type Timestamp = string;

/**
 * 선택적 필드 (모든 필드가 선택적)
 */
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

/**
 * 필수 ID와 선택적 나머지
 */
export type WithRequired<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};
