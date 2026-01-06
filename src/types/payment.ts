/**
 * Payment System Types
 *
 * Types for order receipt and payment confirmation APIs
 * Supports multiple Japanese payment gateways:
 * - Square (Japan)
 * - Stripe (Japan)
 * - PayPal
 * - SB Payment Service (SoftBank)
 * - Bank Transfer
 */

// ============================================================
// Payment Method Types
// ============================================================

export type PaymentMethod =
  | 'bank_transfer'
  | 'credit_card'
  | 'paypal'
  | 'square'
  | 'stripe'
  | 'sb_payment'
  | 'other';

export type PaymentGateway =
  | 'square'
  | 'stripe'
  | 'paypal'
  | 'sb_payment'
  | 'manual'
  | 'none';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partial_refund';

// ============================================================
// Order Receipt Request Types
// ============================================================

/**
 * Order item in external order data
 */
export interface ExternalOrderItem {
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  specifications?: Record<string, any>;
  notes?: string;
}

/**
 * External order data structure for order receipt API
 */
export interface ExternalOrderData {
  // Order identification
  external_order_id?: string; // External system's order ID
  quotation_id?: string; // Link to existing quotation if applicable

  // Customer information
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  company_name?: string;
  company_id?: string;

  // Order details
  items: ExternalOrderItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency?: string; // Default: JPY

  // Payment information
  payment_method: PaymentMethod;
  payment_term: 'credit' | 'advance';

  // Delivery information
  shipping_address?: {
    postal_code: string;
    prefecture: string;
    city: string;
    address: string;
    building?: string;
    contact_person?: string;
    phone?: string;
  };

  billing_address?: {
    postal_code: string;
    prefecture: string;
    city: string;
    address: string;
    building?: string;
    company_name: string;
  };

  requested_delivery_date?: string;
  delivery_notes?: string;

  // Additional information
  notes?: string;
  metadata?: Record<string, any>;
}

// ============================================================
// Payment Confirmation Request Types
// ============================================================

/**
 * Webhook signature verification data
 */
export interface WebhookSignature {
  provider: PaymentGateway;
  signature: string;
  timestamp?: string;
  payload: string;
}

/**
 * Payment confirmation request from payment gateway
 */
export interface PaymentConfirmationRequest {
  // Payment identification
  payment_id: string; // Gateway payment ID
  order_id?: string; // Internal order ID (if known)
  external_order_id?: string; // External order ID

  // Payment details
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_gateway: PaymentGateway;
  status: PaymentStatus;

  // Transaction information
  transaction_id?: string;
  reference_number?: string;

  // Timestamps
  payment_date: string; // ISO 8601 format
  processed_at?: string;

  // Webhook verification
  webhook_signature?: WebhookSignature;

  // Additional gateway-specific data
  gateway_data?: Record<string, any>;

  // Metadata
  metadata?: Record<string, any>;

  // Idempotency key
  idempotency_key?: string;
}

// ============================================================
// Payment Confirmation Response Types
// ============================================================

/**
 * Payment confirmation response
 */
export interface PaymentConfirmationResponse {
  success: boolean;
  payment_id?: string;
  confirmation_id?: string;
  order_id?: string;
  order_number?: string;
  message: string;
  error?: string;
}

/**
 * Order receipt response
 */
export interface OrderReceiptResponse {
  success: boolean;
  order_id?: string;
  order_number?: string;
  message: string;
  error?: string;
  warnings?: string[];
}

// ============================================================
// Database Types
// ============================================================

/**
 * Payment confirmation record (database)
 */
export interface PaymentConfirmationRecord {
  id: string;
  quotation_id: string | null;
  order_id: string | null;
  payment_method: PaymentMethod;
  payment_gateway: PaymentGateway;
  payment_date: string;
  amount: number;
  currency: string;
  reference_number: string | null;
  transaction_id: string | null;
  status: PaymentStatus;
  gateway_response: Record<string, any> | null;
  notes: string | null;
  confirmed_by: string; // user_id
  confirmed_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Payment webhook log (for audit trail)
 */
export interface PaymentWebhookLog {
  id: string;
  gateway: PaymentGateway;
  event_type: string;
  payment_id: string;
  payload: Record<string, any>;
  signature_valid: boolean | null;
  processed: boolean;
  error_message: string | null;
  received_at: string;
  created_at: string;
}

// ============================================================
// Gateway-Specific Types
// ============================================================

/**
 * Square payment data
 */
export interface SquarePaymentData {
  location_id: string;
  tender_type: 'CREDIT_CARD' | 'CASH' | 'OTHER';
  card_brand?: 'VISA' | 'MASTERCARD' | 'AMEX' | 'JCB' | 'DISCOVER' | 'OTHER';
  statement_description?: string;
}

/**
 * Stripe payment data
 */
export interface StripePaymentData {
  payment_intent_id: string;
  payment_method_type: 'card' | 'bank_transfer';
  card_brand?: string;
  card_last4?: string;
  receipt_url?: string;
}

/**
 * PayPal payment data
 */
export interface PayPalPaymentData {
  paypal_order_id: string;
  paypal_payer_id?: string;
  paypal_email?: string;
  purchase_units?: Array<{
    reference_id?: string;
    amount: {
      currency_code: string;
      value: string;
    };
  }>;
}

/**
 * SB Payment Service data
 */
export interface SBPaymentData {
  merchant_id: string;
  transaction_id: string;
  payment_type: 'credit_card' | 'convenience_store' | 'bank_transfer' | 'pay_easy';
  cvs_type?: 'seven_eleven' | 'lawson' | 'familymart' | 'sej_jmb' | 'ministop' | 'daily_yamazaki';
}

// ============================================================
// Validation Types
// ============================================================

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: string[];
}

// ============================================================
// Error Types
// ============================================================

/**
 * Payment API error
 */
export class PaymentAPIError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'PaymentAPIError';
  }
}

/**
 * Signature verification error
 */
export class SignatureVerificationError extends PaymentAPIError {
  constructor(message: string = 'Invalid webhook signature') {
    super('SIGNATURE_VERIFICATION_FAILED', message, 401);
    this.name = 'SignatureVerificationError';
  }
}

/**
 * Idempotency error
 */
export class IdempotencyError extends PaymentAPIError {
  constructor(message: string = 'Request already processed') {
    super('IDEMPOTENCY_KEY_EXISTS', message, 409);
    this.name = 'IdempotencyError';
  }
}

// ============================================================
// Type Guards
// ============================================================

/**
 * Check if payment method is card-based
 */
export function isCardPayment(method: PaymentMethod): boolean {
  return ['credit_card', 'square', 'stripe'].includes(method);
}

/**
 * Check if payment gateway requires webhook signature
 */
export function requiresWebhookSignature(gateway: PaymentGateway): boolean {
  return ['square', 'stripe', 'paypal', 'sb_payment'].includes(gateway);
}

/**
 * Check if payment status is final (no further changes expected)
 */
export function isFinalPaymentStatus(status: PaymentStatus): boolean {
  return ['completed', 'failed', 'cancelled', 'refunded', 'partial_refund'].includes(status);
}
