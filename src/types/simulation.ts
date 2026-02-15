// Pricing and quotation types (required by production pricing system)

export interface SimulationState {
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
  basePrice: number;
  selectedOptions: Record<string, any>;
}

export interface QuotationResult {
  id: string;
  quotationNumber: string;
  totalAmount: number;
  items: QuotationItem[];
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'converted';
  createdAt: string;
  expiresAt: string;
}

export interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
