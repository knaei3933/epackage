import { BaseResponse } from './common';
import type { QuotationResult } from './simulation';

// API Request/Response types
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

export interface QuotationResponse extends BaseResponse<{
  requestId: string;
  results: QuotationResult[];
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
    results: QuotationResult[];
    calculation: {
      baseFee: number;
      materialCost: number;
      processingFee: number;
      totalBeforeDiscount: number;
    };
  };
}

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

export interface PDFQuotationRequest {
  requestId: string;
  companyInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

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