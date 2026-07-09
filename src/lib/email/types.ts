/**
 * Email Types
 *
 * メール送信関連の型定義
 */

export interface ContactEmailData {
  name: string;
  nameKana?: string;
  email: string;
  company?: string;
  inquiryType: string;
  subject: string;
  message: string;
  urgency?: string;
  preferredContact?: string;
  phone?: string;
  fax?: string;
  postalCode?: string;
  address?: string;
}

export interface SampleRequestEmailData {
  requestId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  company?: string;
  samples: Array<{
    productName: string;
    quantity: number;
  }>;
  deliveryType: string;
  deliveryDestinations: Array<{
    companyName?: string;
    contactPerson: string;
    phone: string;
    address: string;
  }>;
  message: string;
}

export interface AdminNotificationData {
  type: 'contact' | 'sample_request';
  requestId: string;
  timestamp: string;
  data: ContactEmailData | SampleRequestEmailData;
}

export interface WorkOrderData {
  workOrderId: string;
  workOrderNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  estimatedCompletion: string;
  productionTimeline: {
    total_days: number;
    steps: Array<{
      step: string;
      name_ja: string;
      name_en: string;
      duration_days: number;
    }>;
  };
  materialRequirements: Array<{
    material_name: string;
    quantity: number;
    unit: string;
  }>;
  items: Array<{
    product_name: string;
    quantity: number;
  }>;
}

export interface ManufacturerOrderItem {
  productName: string;
  bagType: string;
  quantity: number;
  specifications?: {
    size?: string;
    material?: string;
    printing?: string;
    spoutSize?: number;
  };
  materialCostKRW: number;
  printingCostKRW: number;
  laminationCostKRW: number;
  slitterCostKRW: number;
  pouchProcessingCostKRW: number;
  surfaceTreatmentCostKRW: number;
  postProcessingTotalKRW: number;
  baseCostKRW: number;
  manufacturerMarginRate?: number;
  manufacturerMarginKRW: number;
  manufacturingCostKRW: number;
  spoutPriceKRW?: number;
  spoutQuantity?: number;
  spoutCostKRW?: number;
  spoutRoundTripShippingKRW?: number;
  outsourcingShippingKRW?: number;
  materialMarkupRate?: number;
  laminationUnitPriceKRW?: number;
  laminationCycles?: number;
  hasALMaterial?: boolean;
  slitterUnitPriceKRW?: number;
  slitterMinCostKRW?: number;
}

export interface ManufacturerOrderEmailData {
  quoteNumber: string;
  customerName: string;
  recipientEmail: string;
  items: ManufacturerOrderItem[];
  totalManufacturingCostKRW: number;
  notes?: string;
}
