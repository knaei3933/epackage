// =====================================================
// Customer Portal Types
// カスタマーポータル用型定義
// =====================================================

import { Order, OrderStatus, Quotation, Address } from './database';
import { Json } from './database';

// Re-export commonly used types
export type { Order, OrderStatus, Quotation, Address } from './database';

// =====================================================
// Customer Preferences Types
// =====================================================

export interface CustomerPreferences {
  id: string;
  user_id: string;

  // Notification preferences
  email_notifications: boolean;
  sms_notifications: boolean;
  production_updates: boolean;
  shipment_updates: boolean;
  quote_updates: boolean;
  contract_updates: boolean;

  // Display preferences
  language: 'ja' | 'en' | 'ko';
  timezone: string;
  date_format: string;
  currency: 'JPY' | 'USD' | 'EUR';

  // Dashboard preferences
  default_view: 'summary' | 'orders' | 'timeline';
  show_completed_orders: boolean;
  items_per_page: number;

  // Email digest settings
  email_digest_frequency: 'immediate' | 'daily' | 'weekly';
  email_digest_time: string;

  created_at: string;
  updated_at: string;
}

export type CustomerPreferencesUpdate = Partial<Omit<
  CustomerPreferences,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>>;

// =====================================================
// Document Access Types
// =====================================================

export type DocumentType = 'contract' | 'invoice' | 'design' | 'shipping_label' | 'quote' | 'spec_sheet' | 'delivery_note';

export interface DocumentAccessLog {
  id: string;
  user_id: string | null;
  document_type: DocumentType;
  document_id: string;
  order_id: string | null;
  quotation_id: string | null;
  action: 'viewed' | 'downloaded' | 'printed';
  accessed_at: string;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  session_id: string | null;
}

export interface DownloadableDocument {
  id: string;
  type: DocumentType;
  name: string;
  name_ja: string;
  file_url: string | null;
  file_size: number | null;
  created_at: string;
  order_id?: string;
  quotation_id?: string;
  is_available: boolean;
}

// =====================================================
// Order Note Types
// =====================================================

export type OrderNoteType = 'customer' | 'internal' | 'production_update' | 'shipping_update';

export interface OrderNote {
  id: string;
  order_id: string;
  user_id: string;
  note_type: OrderNoteType;
  subject: string | null;
  content: string;
  is_visible_to_customer: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderNoteRequest {
  order_id: string;
  subject?: string;
  content: string;
}

// =====================================================
// Customer Notification Types
// =====================================================

export type NotificationType =
  | 'order_update'
  | 'shipment_update'
  | 'contract_ready'
  | 'quote_ready'
  | 'production_update'
  | 'document_ready'
  | 'delivery_scheduled';

export interface CustomerNotification {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  title: string;
  title_ja: string;
  message: string;
  message_ja: string;
  order_id: string | null;
  quotation_id: string | null;
  shipment_id: string | null;
  action_url: string | null;
  action_label: string | null;
  action_label_ja: string | null;
  is_read: boolean;
  read_at: string | null;
  sent_via_email: boolean;
  sent_via_sms: boolean;
  expires_at: string | null;
  created_at: string;
}

// =====================================================
// Portal Dashboard Types
// =====================================================

export interface OrderSummary {
  status: OrderStatus;
  count: number;
  label: string;
  label_ja: string;
  color: string;
}

export interface DashboardStats {
  total_orders: number;
  pending_orders: number;
  in_production_orders: number;
  shipped_orders: number;
  unread_notifications: number;
}

export interface DashboardData {
  stats: DashboardStats;
  order_summary: OrderSummary[];
  recent_orders: PortalOrder[];
  upcoming_deliveries: UpcomingDelivery[];
  unread_notifications_count: number;
  recent_notifications: CustomerNotification[];
  preferences: CustomerPreferences;
}

export interface UpcomingDelivery {
  order_id: string;
  order_number: string;
  estimated_delivery_date: string;
  days_until_delivery: number;
  status: OrderStatus;
}

// =====================================================
// Portal Order Types
// =====================================================

export interface PortalOrder extends Omit<Order, 'notes'> {
  progress_percentage: number;
  current_stage: PortalProductionStage | null;
  production_stages: PortalProductionStage[];
  shipment_info: ShipmentInfo | null;
  can_request_changes: boolean;
  available_documents: DownloadableDocument[];
  notes: OrderNote[];
}

export interface PortalProductionStage {
  id: string;
  key: string;
  name: string;
  name_ja: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completed_at: string | null;
  notes: string | null;
  photo_url: string | null;
}

export interface ShipmentInfo {
  shipment_number: string;
  tracking_number: string | null;
  carrier_name: string;
  carrier_name_ja: string;
  tracking_url: string | null;
  estimated_delivery_date: string | null;
  actual_delivery_date: string | null;
  status: PortalShipmentStatus;
  delivery_address: Address;
}

export type PortalShipmentStatus =
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'returned'
  | 'cancelled';

// =====================================================
// API Request/Response Types
// =====================================================

export interface CustomerOrdersResponse {
  success: boolean;
  data: {
    orders: PortalOrder[];
    total: number;
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface CustomerOrderDetailResponse {
  success: boolean;
  data: PortalOrder;
}

export interface CustomerDocumentsResponse {
  success: boolean;
  data: {
    documents: DownloadableDocument[];
    total: number;
  };
}

export interface CustomerProfileResponse {
  success: boolean;
  data: ProfileData;
}

export interface ProfileData {
  user: {
    id: string;
    email: string;
    kanji_last_name: string;
    kanji_first_name: string;
    kana_last_name: string;
    kana_first_name: string;
    corporate_phone: string | null;
    personal_phone: string | null;
    business_type: 'INDIVIDUAL' | 'CORPORATION' | 'SOLE_PROPRIETOR';
    user_type: 'B2C' | 'B2B' | null;
    company_name: string | null;
    position: string | null;
    department: string | null;
    company_url: string | null;
    postal_code: string | null;
    prefecture: string | null;
    city: string | null;
    street: string | null;
    building: string | null;
  };
  company: {
    id: string;
    name: string;
    name_kana: string;
    corporate_number: string | null;
    industry: string | null;
    payment_terms: string | null;
  } | null;
  preferences: CustomerPreferences;
}

export interface UpdateProfileRequest {
  corporate_phone?: string;
  personal_phone?: string;
  position?: string;
  department?: string;
  company_url?: string;
  postal_code?: string;
  prefecture?: string;
  city?: string;
  street?: string;
  building?: string;
}

export interface UpdatePreferencesRequest extends CustomerPreferencesUpdate {}

// =====================================================
// Navigation Types
// =====================================================

export interface PortalNavItem {
  href: string;
  label: string;
  label_ja: string;
  icon: string;
  badge?: number | null;
  description?: string;
  description_ja?: string;
}

export const PORTAL_NAV_ITEMS: PortalNavItem[] = [
  {
    href: '/portal',
    label: 'Dashboard',
    label_ja: 'ダッシュボード',
    icon: 'home',
    description: 'Overview of your orders and activities',
    description_ja: '注文とアクティビティの概要',
  },
  {
    href: '/portal/orders',
    label: 'Orders',
    label_ja: '注文一覧',
    icon: 'document',
    description: 'View and manage your orders',
    description_ja: '注文の確認と管理',
  },
  {
    href: '/portal/documents',
    label: 'Documents',
    label_ja: 'ドキュメント',
    icon: 'file',
    description: 'Download quotes, invoices, and more',
    description_ja: '見積書、請求書などのダウンロード',
  },
  {
    href: '/portal/profile',
    label: 'Profile',
    label_ja: 'プロフィール設定',
    icon: 'settings',
    description: 'Manage your account settings',
    description_ja: 'アカウント設定の管理',
  },
  {
    href: '/portal/support',
    label: 'Support',
    label_ja: 'お問い合わせ',
    icon: 'message',
    description: 'Contact customer support',
    description_ja: 'カスタマーサポートへのお問い合わせ',
  },
];

// =====================================================
// UI Component Props Types
// =====================================================

export interface OrderSummaryCardProps {
  order: PortalOrder;
  onClick?: () => void;
}

export interface ProductionProgressWidgetProps {
  stages: PortalProductionStage[];
  currentStageIndex: number;
}

export interface DocumentDownloadCardProps {
  documents: DownloadableDocument[];
  onDownload?: (document: DownloadableDocument) => void;
}

export interface ShipmentTrackingCardProps {
  shipment: ShipmentInfo;
  orderNumber: string;
}

export interface ActivityTimelineProps {
  activities: ActivityItem[];
  showEmpty?: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'order_update' | 'shipment_update' | 'document_added' | 'note_added' | 'production_update';
  title: string;
  title_ja: string;
  description: string;
  description_ja: string;
  timestamp: string;
  icon: string;
  link?: string;
}

export interface NotificationPanelProps {
  notifications: CustomerNotification[];
  unreadCount: number;
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
}

// =====================================================
// Filter and Sort Types
// =====================================================

export type OrderStatusFilter = OrderStatus | 'all';

export type OrderSortField = 'created_at' | 'updated_at' | 'total_amount' | 'estimated_delivery_date';

export type SortOrder = 'asc' | 'desc';

export interface OrderFilters {
  status?: OrderStatusFilter;
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_field?: OrderSortField;
  sort_order?: SortOrder;
}

// =====================================================
// Error and Loading Types
// =====================================================

export interface PortalError {
  code: string;
  message: string;
  message_ja: string;
  details?: Record<string, unknown>;
}

export interface PortalLoadingState {
  isLoading: boolean;
  isRefreshing?: boolean;
  error?: PortalError | null;
}

// =====================================================
// Constants
// =====================================================

export const PORTAL_ORDER_STATUS_LABELS: Record<OrderStatus, { ja: string; color: string }> = {
  PENDING: { ja: '見積中', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  QUOTATION: { ja: '見積提出済', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  DATA_RECEIVED: { ja: 'データ入稿済', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  WORK_ORDER: { ja: '作業標準書作成中', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  CONTRACT_SENT: { ja: '契約書送付済', color: 'bg-pink-100 text-pink-800 border-pink-200' },
  CONTRACT_SIGNED: { ja: '契約済', color: 'bg-green-100 text-green-800 border-green-200' },
  PRODUCTION: { ja: '製作中', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  STOCK_IN: { ja: '検品済', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  SHIPPED: { ja: '発送済', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  DELIVERED: { ja: '納品済', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  CANCELLED: { ja: 'キャンセル', color: 'bg-red-100 text-red-800 border-red-200' },
};

export const PRODUCTION_STAGES: Omit<PortalProductionStage, 'id' | 'status' | 'completed_at' | 'notes' | 'photo_url'>[] = [
  { key: 'design_received', name: 'Design Received', name_ja: 'デザインデータ受領' },
  { key: 'work_order_created', name: 'Work Order Created', name_ja: '作業標準書作成' },
  { key: 'material_prepared', name: 'Material Prepared', name_ja: '材料準備' },
  { key: 'printing', name: 'Printing', name_ja: '印刷' },
  { key: 'lamination', name: 'Lamination', name_ja: 'ラミネート' },
  { key: 'slitting', name: 'Slitting', name_ja: 'スリッティング' },
  { key: 'pouch_making', name: 'Pouch Making', name_ja: '袋製造' },
  { key: 'qc_passed', name: 'Quality Check', name_ja: '品質検査' },
  { key: 'packaged', name: 'Packaging', name_ja: '梱包' },
];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, { ja: string; icon: string }> = {
  quote: { ja: '見積書', icon: 'file-text' },
  contract: { ja: '契約書', icon: 'file-signature' },
  invoice: { ja: '請求書', icon: 'receipt' },
  design: { ja: 'デザインデータ', icon: 'palette' },
  shipping_label: { ja: '送り状', icon: 'package' },
  spec_sheet: { ja: '仕様書', icon: 'clipboard-list' },
  delivery_note: { ja: '納品書', icon: 'check-circle' },
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, { ja: string; icon: string }> = {
  order_update: { ja: '注文更新', icon: 'shopping-cart' },
  shipment_update: { ja: '配送更新', icon: 'truck' },
  contract_ready: { ja: '契約書準備完了', icon: 'file-signature' },
  quote_ready: { ja: '見積書準備完了', icon: 'file-text' },
  production_update: { ja: '製造更新', icon: 'cog' },
  document_ready: { ja: 'ドキュメント準備完了', icon: 'file' },
  delivery_scheduled: { ja: '配達予定', icon: 'calendar' },
};

// =====================================================
// Helper Functions
// =====================================================

export const getOrderStatusLabel = (status: OrderStatus, locale: 'ja' | 'en' = 'ja'): string => {
  return PORTAL_ORDER_STATUS_LABELS[status]?.[locale === 'ja' ? 'ja' : 'color'] || status;
};

export const getOrderStatusColor = (status: OrderStatus): string => {
  return PORTAL_ORDER_STATUS_LABELS[status]?.color || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getDocumentTypeLabel = (type: DocumentType, locale: 'ja' | 'en' = 'ja'): string => {
  return DOCUMENT_TYPE_LABELS[type]?.[locale === 'ja' ? 'ja' : 'icon'] || type;
};

export const formatCurrency = (amount: number, currency: string = 'JPY'): string => {
  if (currency === 'JPY') {
    return `¥${amount.toLocaleString('ja-JP')}`;
  }
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: currency as 'JPY' | 'USD' | 'EUR',
  }).format(amount);
};

export const formatDate = (date: string | null, locale: 'ja' | 'en' = 'ja'): string => {
  if (!date) return '-';
  const d = new Date(date);
  if (locale === 'ja') {
    return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const formatDateTime = (date: string | null, locale: 'ja' | 'en' = 'ja'): string => {
  if (!date) return '-';
  const d = new Date(date);
  if (locale === 'ja') {
    return d.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getDaysUntil = (date: string): number => {
  const target = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const isOverdue = (date: string): boolean => {
  return getDaysUntil(date) < 0;
};
