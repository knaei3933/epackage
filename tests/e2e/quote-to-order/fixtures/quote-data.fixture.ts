import { test as base } from '@playwright/test';

/**
 * Quote Data Fixtures for E2E Testing
 *
 * Provides test data generation for quotations with unique identifiers.
 * Includes helper functions for creating test quotations and cleanup.
 *
 * @example
 * ```ts
 * test('create quotation', async ({ testQuote, testRunId }) => {
 *   console.log('Test Quote:', testQuote);
 *   console.log('Test Run ID:', testRunId);
 * });
 * ```
 */

// =====================================================
// Type Definitions
// =====================================================

type QuoteData = {
  orderNumber: string;
  customerEmail: string;
  companyName: string;
  productCategory: 'spout_pouch' | 'box_pouch' | 'stand_pouch' | 'other';
  language: '日本語' | '英語' | '中国語' | '韓国語';
  quantity: number;
  specifications: {
    width: number;
    length: number;
    capacity: number;
    material: string;
  };
  createdAt: string;
};

type QuoteDataFixtures = {
  testQuote: QuoteData;
  testRunId: string;
};

// =====================================================
// Helper Functions
// =====================================================

/**
 * Generate unique order number for testing
 * Format: TEST-{YYYYMMDD}-{RANDOM}
 */
function generateTestOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TEST-${date}-${random}`;
}

/**
 * Generate unique test run ID for data cleanup
 * Format: test-run-{timestamp}
 */
function generateTestRunId(): string {
  return `test-run-${Date.now()}`;
}

/**
 * Generate test quote data with unique identifiers
 */
function generateTestQuoteData(): QuoteData {
  const orderNumber = generateTestOrderNumber();

  return {
    orderNumber,
    customerEmail: `test-${orderNumber.toLowerCase()}@example.com`,
    companyName: `テスト会社 ${orderNumber}`,
    productCategory: 'spout_pouch',
    language: '日本語',
    quantity: 10000,
    specifications: {
      width: 120,
      length: 180,
      capacity: 500,
      material: 'PET/PE',
    },
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generate multiple test quotes
 */
export function generateTestQuotes(count: number): QuoteData[] {
  return Array.from({ length: count }, (_, index) => ({
    ...generateTestQuoteData(),
    orderNumber: generateTestOrderNumber(),
    customerEmail: `test-batch-${index}-${Date.now()}@example.com`,
  }));
}

/**
 * Create quotation payload for API requests
 */
export function createQuotationPayload(quoteData: QuoteData): Record<string, unknown> {
  return {
    order_number: quoteData.orderNumber,
    customer_email: quoteData.customerEmail,
    company_name: quoteData.companyName,
    product_category: quoteData.productCategory,
    language: quoteData.language,
    quantity: quoteData.quantity,
    specifications: quoteData.specifications,
    test_run_id: generateTestRunId(),
  };
}

// =====================================================
// Fixtures
// =====================================================

export const test = base.extend<QuoteDataFixtures>({
  // Generate test quote data for each test
  testQuote: async ({}, use) => {
    const quoteData = generateTestQuoteData();
    console.log('[quote-data.fixture] Generated test quote:', quoteData.orderNumber);
    await use(quoteData);
  },

  // Generate unique test run ID for cleanup
  testRunId: async ({}, use) => {
    const runId = generateTestRunId();
    console.log('[quote-data.fixture] Generated test run ID:', runId);
    await use(runId);
  },
});

// =====================================================
// Export
// =====================================================

export const expect = test.expect;
export type { QuoteData };
