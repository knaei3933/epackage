/**
 * Payment Utility Library
 *
 * Utilities for payment processing, webhook signature verification,
 * and payment gateway integration for Japanese payment systems.
 *
 * Supported Gateways:
 * - Square (Japan)
 * - Stripe (Japan)
 * - PayPal
 * - SB Payment Service (SoftBank)
 */

import crypto from 'crypto';
import {
  PaymentGateway,
  WebhookSignature,
  PaymentConfirmationRequest,
  ValidationResult,
  ValidationError,
  PaymentAPIError,
  SignatureVerificationError,
} from '@/types/payment';

// ============================================================
// Configuration
// ============================================================

interface PaymentConfig {
  square?: {
    webhookSignatureKey: string;
    locationId: string;
  };
  stripe?: {
    webhookSecret: string;
    publishableKey: string;
  };
  paypal?: {
    webhookId: string;
    clientId: string;
  };
  sbPayment?: {
    merchantId: string;
    hashKey: string;
  };
}

// Load payment gateway configuration from environment
export const getPaymentConfig = (): PaymentConfig => {
  return {
    square: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
      ? {
          webhookSignatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY,
          locationId: process.env.SQUARE_LOCATION_ID || '',
        }
      : undefined,
    stripe: process.env.STRIPE_WEBHOOK_SECRET
      ? {
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
          publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
        }
      : undefined,
    paypal: process.env.PAYPAL_WEBHOOK_ID
      ? {
          webhookId: process.env.PAYPAL_WEBHOOK_ID,
          clientId: process.env.PAYPAL_CLIENT_ID || '',
        }
      : undefined,
    sbPayment: process.env.SB_PAYMENT_HASH_KEY
      ? {
          merchantId: process.env.SB_PAYMENT_MERCHANT_ID || '',
          hashKey: process.env.SB_PAYMENT_HASH_KEY,
        }
      : undefined,
  };
};

// ============================================================
// Webhook Signature Verification
// ============================================================

/**
 * Verify Square webhook signature
 * @param signature - Signature from X-Square-Signature header
 * @param payload - Raw request body
 * @param key - Webhook signature key
 */
export function verifySquareSignature(
  signature: string,
  payload: string,
  key: string
): boolean {
  try {
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(payload);
    const expectedSignature = hmac.digest('base64');

    // Square sends signature in format: "t=timestamp,v1=signature"
    const signatureParts = signature.split(',');
    const signatureValue = signatureParts.find(part => part.startsWith('v1='));

    if (!signatureValue) {
      return false;
    }

    const receivedSignature = signatureValue.substring(3); // Remove 'v1=' prefix
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(receivedSignature)
    );
  } catch (error) {
    console.error('Error verifying Square signature:', error);
    return false;
  }
}

/**
 * Verify Stripe webhook signature
 * @param signature - Signature from Stripe-Signature header
 * @param payload - Raw request body
 * @param secret - Webhook signing secret
 */
export function verifyStripeSignature(
  signature: string,
  payload: string,
  secret: string
): boolean {
  try {
    const elements = signature.split(',');
    const timestamp = elements.find(e => e.startsWith('t='));
    const signatureValue = elements.find(e => e.startsWith('v1='));

    if (!timestamp || !signatureValue) {
      return false;
    }

    const timestampValue = timestamp.substring(2);
    const signatureValueString = signatureValue.substring(3);

    // Check timestamp is within tolerance (5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const timestampInt = parseInt(timestampValue, 10);
    if (now - timestampInt > 300) {
      console.error('Stripe webhook timestamp too old');
      return false;
    }

    // Construct expected signature
    const signedPayload = `${timestampValue}.${payload}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signatureValueString)
    );
  } catch (error) {
    console.error('Error verifying Stripe signature:', error);
    return false;
  }
}

/**
 * Verify PayPal webhook signature
 * PayPal uses different verification method - requires API call
 * This is a placeholder for the actual verification
 */
export function verifyPayPalSignature(
  signature: string,
  payload: string,
  webhookId: string
): boolean {
  // PayPal webhook verification requires an API call to PayPal
  // For now, implement basic structure
  // In production, you would:
  // 1. Parse the PayPal webhook ID from headers
  // 2. Verify against PayPal's API
  try {
    const webhookData = JSON.parse(payload);
    // Basic validation: check if webhook_id matches
    return webhookData.webhook_id === webhookId;
  } catch (error) {
    console.error('Error verifying PayPal signature:', error);
    return false;
  }
}

/**
 * Verify SB Payment Service signature
 * Uses HMAC-SHA256 with hash key
 */
export function verifySBPaymentSignature(
  signature: string,
  payload: Record<string, any>,
  hashKey: string
): boolean {
  try {
    // SB Payment uses specific parameters for signature calculation
    const params = new URLSearchParams();

    // Add parameters in alphabetical order
    Object.keys(payload)
      .sort()
      .forEach(key => {
        if (payload[key] && key !== 'signature') {
          params.append(key, String(payload[key]));
        }
      });

    const queryString = params.toString();
    const expectedSignature = crypto
      .createHmac('sha256', hashKey)
      .update(queryString)
      .digest('hex');

    return signature === expectedSignature;
  } catch (error) {
    console.error('Error verifying SB Payment signature:', error);
    return false;
  }
}

/**
 * Generic webhook signature verification
 * Routes to appropriate gateway-specific verification
 */
export function verifyWebhookSignature(
  signatureData: WebhookSignature
): boolean {
  const config = getPaymentConfig();

  switch (signatureData.provider) {
    case 'square':
      if (!config.square) {
        console.error('Square configuration not found');
        return false;
      }
      return verifySquareSignature(
        signatureData.signature,
        signatureData.payload,
        config.square.webhookSignatureKey
      );

    case 'stripe':
      if (!config.stripe) {
        console.error('Stripe configuration not found');
        return false;
      }
      return verifyStripeSignature(
        signatureData.signature,
        signatureData.payload,
        config.stripe.webhookSecret
      );

    case 'paypal':
      if (!config.paypal) {
        console.error('PayPal configuration not found');
        return false;
      }
      return verifyPayPalSignature(
        signatureData.signature,
        signatureData.payload,
        config.paypal.webhookId
      );

    case 'sb_payment':
      if (!config.sbPayment) {
        console.error('SB Payment configuration not found');
        return false;
      }
      const payload = JSON.parse(signatureData.payload);
      return verifySBPaymentSignature(
        signatureData.signature,
        payload,
        config.sbPayment.hashKey
      );

    case 'manual':
    case 'none':
      // Manual and none don't require signature verification
      return true;

    default:
      console.error('Unknown payment gateway:', signatureData.provider);
      return false;
  }
}

// ============================================================
// Payment Validation
// ============================================================

/**
 * Validate payment confirmation request data
 */
export function validatePaymentConfirmation(
  data: PaymentConfirmationRequest
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!data.payment_id || typeof data.payment_id !== 'string') {
    errors.push({
      field: 'payment_id',
      message: 'Payment ID is required and must be a string',
      code: 'REQUIRED_FIELD',
    });
  }

  if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
    errors.push({
      field: 'amount',
      message: 'Amount is required and must be a positive number',
      code: 'INVALID_AMOUNT',
    });
  }

  if (!data.currency || typeof data.currency !== 'string') {
    errors.push({
      field: 'currency',
      message: 'Currency is required and must be a string',
      code: 'REQUIRED_FIELD',
    });
  }

  if (
    !data.payment_date ||
    isNaN(Date.parse(data.payment_date))
  ) {
    errors.push({
      field: 'payment_date',
      message: 'Payment date is required and must be a valid ISO 8601 date',
      code: 'INVALID_DATE',
    });
  }

  // Optional but recommended fields
  if (!data.transaction_id) {
    warnings.push('Transaction ID is recommended for payment tracking');
  }

  // Validate webhook signature if provided
  if (data.webhook_signature) {
    const isValid = verifyWebhookSignature(data.webhook_signature);
    if (!isValid) {
      errors.push({
        field: 'webhook_signature',
        message: 'Invalid webhook signature',
        code: 'INVALID_SIGNATURE',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate external order data
 */
export function validateExternalOrderData(
  data: Record<string, any>
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // Required customer fields
  if (!data.customer_name || typeof data.customer_name !== 'string') {
    errors.push({
      field: 'customer_name',
      message: 'Customer name is required',
      code: 'REQUIRED_FIELD',
    });
  }

  if (!data.customer_email || typeof data.customer_email !== 'string') {
    errors.push({
      field: 'customer_email',
      message: 'Customer email is required',
      code: 'REQUIRED_FIELD',
    });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customer_email)) {
    errors.push({
      field: 'customer_email',
      message: 'Invalid email format',
      code: 'INVALID_EMAIL',
    });
  }

  // Order items
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push({
      field: 'items',
      message: 'At least one order item is required',
      code: 'REQUIRED_FIELD',
    });
  } else {
    data.items.forEach((item: any, index: number) => {
      if (!item.product_name || typeof item.product_name !== 'string') {
        errors.push({
          field: `items[${index}].product_name`,
          message: 'Product name is required',
          code: 'REQUIRED_FIELD',
        });
      }

      if (
        !item.quantity ||
        typeof item.quantity !== 'number' ||
        item.quantity <= 0
      ) {
        errors.push({
          field: `items[${index}].quantity`,
          message: 'Quantity must be a positive number',
          code: 'INVALID_QUANTITY',
        });
      }

      if (
        !item.unit_price ||
        typeof item.unit_price !== 'number' ||
        item.unit_price < 0
      ) {
        errors.push({
          field: `items[${index}].unit_price`,
          message: 'Unit price must be a non-negative number',
          code: 'INVALID_PRICE',
        });
      }
    });
  }

  // Financial fields
  if (
    !data.total_amount ||
    typeof data.total_amount !== 'number' ||
    data.total_amount <= 0
  ) {
    errors.push({
      field: 'total_amount',
      message: 'Total amount must be a positive number',
      code: 'INVALID_AMOUNT',
    });
  }

  if (
    typeof data.subtotal !== 'number' ||
    data.subtotal < 0
  ) {
    errors.push({
      field: 'subtotal',
      message: 'Subtotal must be a non-negative number',
      code: 'INVALID_AMOUNT',
    });
  }

  if (
    typeof data.tax_amount !== 'number' ||
    data.tax_amount < 0
  ) {
    errors.push({
      field: 'tax_amount',
      message: 'Tax amount must be a non-negative number',
      code: 'INVALID_AMOUNT',
    });
  }

  // Validate payment term
  if (!data.payment_term || !['credit', 'advance'].includes(data.payment_term)) {
    errors.push({
      field: 'payment_term',
      message: 'Payment term must be either "credit" or "advance"',
      code: 'INVALID_PAYMENT_TERM',
    });
  }

  // Validate payment method
  const validPaymentMethods = [
    'bank_transfer',
    'credit_card',
    'paypal',
    'square',
    'stripe',
    'sb_payment',
    'other',
  ];

  if (!data.payment_method || !validPaymentMethods.includes(data.payment_method)) {
    errors.push({
      field: 'payment_method',
      message: `Payment method must be one of: ${validPaymentMethods.join(', ')}`,
      code: 'INVALID_PAYMENT_METHOD',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================
// API Key Authentication
// ============================================================

/**
 * Verify API key for external order receipt
 */
export function verifyApiKey(apiKey: string | null): boolean {
  if (!apiKey) {
    return false;
  }

  // Get allowed API keys from environment
  const allowedKeys = process.env.EXTERNAL_API_KEYS?.split(',') || [];

  if (allowedKeys.length === 0) {
    console.warn('No external API keys configured');
    return false;
  }

  return allowedKeys.includes(apiKey);
}

/**
 * Extract and verify API key from request headers
 */
export function authenticateRequest(
  headers: Headers
): { authenticated: boolean; error?: string } {
  // Check for API key in header
  const apiKey = headers.get('x-api-key') || headers.get('authorization');

  if (!apiKey) {
    return {
      authenticated: false,
      error: 'Missing API key. Provide x-api-key or Authorization header.',
    };
  }

  // Remove 'Bearer ' prefix if present
  const cleanKey = apiKey.replace(/^Bearer\s+/i, '');

  if (!verifyApiKey(cleanKey)) {
    return {
      authenticated: false,
      error: 'Invalid API key',
    };
  }

  return { authenticated: true };
}

// ============================================================
// Idempotency Support
// ============================================================

/**
 * Generate idempotency key from request data
 */
export function generateIdempotencyKey(data: Record<string, any>): string {
  const sortedKeys = Object.keys(data).sort();
  const sortedData = sortedKeys.reduce((acc, key) => {
    acc[key] = data[key];
    return acc;
  }, {} as Record<string, any>);

  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(sortedData))
    .digest('hex');

  return hash;
}

/**
 * Check if request is idempotent (already processed)
 */
export async function isIdempotentRequest(
  idempotencyKey: string,
  tableName: string
): Promise<{ idempotent: boolean; existingId?: string }> {
  // This would check a database table for idempotency keys
  // For now, return a placeholder
  // In production, you would:
  // 1. Query idempotency_keys table
  // 2. Check if key exists for this operation
  // 3. Return the existing record ID if found

  return { idempotent: false };
}

// ============================================================
// Payment Processing Utilities
// ============================================================

/**
 * Format currency amount for display (Japanese yen)
 */
export function formatYenAmount(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount);
}

/**
 * Calculate Japanese consumption tax (10%)
 */
export function calculateConsumptionTax(subtotal: number): number {
  const taxRate = 0.1; // 10% consumption tax
  return Math.round(subtotal * taxRate);
}

/**
 * Format payment status for Japanese display
 */
export function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '未入金',
    processing: '処理中',
    completed: '入金済み',
    failed: '入金失敗',
    cancelled: 'キャンセル',
    refunded: '返金済み',
    partial_refund: '一部返金',
  };

  return labels[status] || status;
}

/**
 * Get payment gateway name in Japanese
 */
export function getPaymentGatewayName(gateway: PaymentGateway): string {
  const names: Record<PaymentGateway, string> = {
    square: 'Square (スクエア)',
    stripe: 'Stripe (ストライプ)',
    paypal: 'PayPal (ペイパル)',
    sb_payment: 'SBペイメントサービス',
    manual: '手動入金',
    none: 'なし',
  };

  return names[gateway] || gateway;
}

// ============================================================
// Error Handling
// ============================================================

/**
 * Handle payment API errors with appropriate status codes
 */
export function handlePaymentError(error: unknown): PaymentAPIError {
  if (error instanceof PaymentAPIError) {
    return error;
  }

  if (error instanceof Error) {
    return new PaymentAPIError(
      'PAYMENT_PROCESSING_ERROR',
      error.message,
      500
    );
  }

  return new PaymentAPIError(
    'UNKNOWN_ERROR',
    'An unknown error occurred',
    500
  );
}
