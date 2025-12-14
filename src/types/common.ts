// Common types used throughout the application

export interface BaseResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface ContactForm {
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  inquiryType: string;
  productInterest?: string;
  message: string;
  privacyConsent: boolean;
  newsletterConsent?: boolean;
}

export interface SampleRequest {
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  address: string;
  productTypes: string[];
}