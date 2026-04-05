/**
 * Quotation Types - 見積もり関連型定義
 */

// SpoutPouchFields タイプ定義
export interface SpoutPouchFields {
  bagTypeId?: 'spout_pouch';
  spoutSize?: number;  // 数字タイプ (9, 15, 18, 22, 28)
  spoutPosition?: 'top-left' | 'top-center' | 'top-right';
  hasGusset?: boolean;
}

export interface QuotationItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  specifications: any;
  breakdown?: {
    quantity: number;
    unit_price: number;
    total_price: number;
    specifications: {
      bag_type?: string;
      bag_type_display?: string;
      bagTypeId?: 'spout_pouch' | string;
      material?: string;
      material_display?: string;
      material_specification?: string;
      weight_range?: string;
      thickness?: string;
      thickness_display?: string;
      size?: string;
      dimensions?: string;
      width?: number;
      height?: number;
      depth?: number;
      printing?: string;
      printing_display?: string;
      printing_type?: string;
      colors?: string;
      isUVPrinting?: boolean;
      post_processing?: string[];
      post_processing_display?: string[];
      zipper?: boolean;
      spout?: boolean;
      spoutSize?: number;
      spoutPosition?: 'top-left' | 'top-center' | 'top-right';
      hasGusset?: boolean;
      urgency?: string;
      contents?: string;
      contentsType?: string;
      productCategory?: string;
      deliveryLocation?: string;
      distributionEnvironment?: string;
      sealWidth?: string;
      doubleSided?: boolean;
    } & Partial<SpoutPouchFields>;
    area?: { mm2: number; m2: number };
    sku_info?: { count: number; quantities: number[]; total: number };
    breakdown?: {
      materialCost: number;
      laminationCost: number;
      slitterCost: number;
      surfaceTreatmentCost: number;
      pouchProcessingCost: number;
      printingCost: number;
      manufacturingMargin: number;
      duty: number;
      delivery: number;
      salesMargin: number;
      totalCost: number;
    };
    filmCostDetails?: {
      materialCost?: number;
      laminationCost?: number;
      slitterCost?: number;
      surfaceTreatmentCost?: number;
      materialLayerDetails?: Array<{
        materialId: string;
        name: string;
        nameJa: string;
        thicknessMicron: number;
        density: number;
        unitPriceKRW: number;
        areaM2: number;
        meters: number;
        widthM: number;
        weightKg: number;
        costKRW: number;
        costJPY: number;
      }>;
      totalCostKRW?: number;
      costJPY?: number;
      totalWeight?: number;
      totalMeters?: number;
      materialWidthMM?: number;
      areaM2?: number;
    } | null;
  };
  cost_breakdown?: {
    pouchProcessingCost?: number;
  };
}

export type QuotationStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED';

export interface Quotation {
  id: string;
  quotation_number: string;
  customer_name: string;
  customer_email: string;
  status: QuotationStatus;
  total_amount: number;
  subtotal_amount?: number;
  tax_amount?: number;
  valid_until: string | null;
  created_at: string;
  notes?: string | null;
  admin_notes?: string | null;
  items?: QuotationItem[];
  items_count?: number;
  pdf_url?: string | null;
  // User profile information
  company_name?: string;
  corporate_phone?: string;
  personal_phone?: string;
  kanji_last_name?: string;
  kanji_first_name?: string;
}

export interface Recipient {
  id: string;
  email: string;
  name: string;
}
