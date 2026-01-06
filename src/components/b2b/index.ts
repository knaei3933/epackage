/**
 * B2B Components Index
 *
 * B2B関連コンポーネントのエクスポート
 * - Contract components: 契約書関連
 * - SpecSheet components: 仕様書関連
 * - Admin components: 管理機能関連
 * - Client components: クライアント機能関連
 */

// ============================================================
// Contract Components
// ============================================================

export {
  default as ContractPreview,
  ContractPreviewModal,
  ContractPreviewPanel,
} from './ContractPreview';

export {
  default as HankoUpload,
  HankoPositioner,
} from './HankoUpload';

export {
  default as TimestampAuth,
  TimestampBadge,
  TimestampValidationStatus,
} from './TimestampAuth';

export {
  default as ContractApproval,
  WorkflowStatusBadge,
} from './ContractApproval';

export {
  default as ContractNotification,
} from './ContractNotification';

export type {
  HankoImageData,
} from './HankoUpload';

export type {
  TimestampData,
} from './TimestampAuth';

export type {
  ContractWorkflowStatus,
  WorkflowAction,
} from './ContractApproval';

export type {
  ContractData,
  ContractParty,
  ContractItem,
  ContractTerms,
  ContractSignatory,
  ContractAttachment,
  PdfGenerationOptions,
  PdfGenerationResult,
  JapaneseContractType,
  JapaneseLawReference,
  ContractLegalRequirements,
  ContractValidationResult,
  ValidationError,
  ValidationWarning,
  ContractStatusHistory,
} from '@/types/contract';

// ============================================================
// SpecSheet Components
// ============================================================

export {
  default as SpecSheetEditForm,
} from './specsheet/SpecSheetEditForm';

export {
  default as SpecSheetPreview,
  SpecSheetPreviewModal,
  SpecSheetPreviewPanel,
} from './specsheet/SpecSheetPreview';

export {
  default as ApprovalRequestForm,
  ApproverSelector,
} from './specsheet/ApprovalRequestForm';

export {
  default as ApprovalStatusTracker,
  ApprovalStatusBadge,
  ApprovalHistoryList,
} from './specsheet/ApprovalStatusTracker';

export {
  default as VersionManager,
  VersionComparison,
  VersionHistoryList,
} from './specsheet/VersionManager';

// ============================================================
// Admin Components
// ============================================================

export { default as AdminQuotationEditor } from './AdminQuotationEditor';
export { default as WorkOrderGenerator } from './WorkOrderGenerator';
export { default as ProductionStatusManager } from './ProductionStatusManager';
export { default as B2BApprovalDashboard } from './B2BApprovalDashboard';

// ============================================================
// Client Components
// ============================================================

export { default as B2BRegistrationForm } from './B2BRegistrationForm';
export { default as B2BQuotationRequestForm } from './B2BQuotationRequestForm';
export { QuotationConfirmClient } from './QuotationConfirmClient';
export { OrderConfirmSuccessClient } from './OrderConfirmSuccessClient';
export { DataReceiptClient } from './DataReceiptClient';
export { EnhancedFileUpload } from './EnhancedFileUpload';
export { default as CustomerDashboard } from './CustomerDashboard';

// ============================================================
// Workflow Components
// ============================================================

export { default as OrderTimeline } from './OrderTimeline';
export { default as StockIn } from './StockIn';
export { default as Shipment } from './Shipment';

// ============================================================
// Utility Components
// ============================================================

export { default as ElectronicSignature } from './ElectronicSignature';
export { default as DocumentDownload } from './DocumentDownload';
export { SKUSelector } from './SKUSelector';
export { CSVBulkImport } from './CSVBulkImport';
