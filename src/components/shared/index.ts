/**
 * Shared Components Index
 * 共用コンポーネント統合エクスポート
 *
 * This module exports all shared components that can be used across
 * Portal, Member, and Admin pages to reduce code duplication.
 */

// Document Components
export {
  DocumentDownloadButton,
  DocumentDownloadCard,
  BatchDocumentDownload,
  DocumentDownload
} from './document';

export type {
  DownloadableDocument,
  DocumentDownloadVariant,
  DocumentDownloadSize
} from './document';

// Production Components
export {
  ProductionProgress
} from './production';

export type {
  ProductionStage,
  ProductionStageStatus,
  ProductionProgressProps
} from './production';

// Shipping Components
export {
  ShipmentTrackingCard,
  ShipmentTracking
} from './shipping';

export type {
  ShipmentInfo,
  ShipmentStatus,
  ShipmentAddress,
  TrackingEvent,
  ShipmentTrackingCardProps
} from './shipping';

// Order Components
export {
  OrderSummaryCard,
  OrderSummary
} from './order';

export type {
  OrderSummaryType,
  OrderStatus,
  OrderAddress,
  OrderItem,
  OrderSummaryCardProps
} from './order';

// Profile Components
export { ProfileCancelButton } from './ProfileCancelButton';
export type { ProfileCancelButtonProps } from './ProfileCancelButton';

