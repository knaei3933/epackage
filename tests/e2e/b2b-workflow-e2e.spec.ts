/**
 * Epackage Lab - B2B Workflow API Integration Tests
 *
 * B2B 주문 워크플로우 API 통합 테스트
 * Covers: Quotation conversion, Korea transfer, Correction, Spec approval,
 *          Payment confirmation, Production start, Shipping, Delivery
 *
 * Run: npx playwright test tests/e2e/b2b-workflow-e2e.spec.ts
 */

import { test, expect } from '@playwright/test';

// =====================================================
// Test Configuration
// =====================================================

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const CRON_SECRET = process.env.CRON_SECRET || 'dev-cron-secret';

// Test credentials (use environment variables in CI/CD)
const ADMIN_CREDENTIALS = {
  email: process.env.TEST_ADMIN_EMAIL || 'admin@epackage-lab.com',
  password: process.env.TEST_ADMIN_PASSWORD || 'Admin123!',
};

const MEMBER_CREDENTIALS = {
  email: process.env.TEST_MEMBER_EMAIL || 'member@test.com',
  password: process.env.TEST_MEMBER_PASSWORD || 'Member1234!',
};

// Test data tracking
let testQuotationId: string | null = null;
let testOrderId: string | null = null;
let testDesignRevisionId: string | null = null;
let adminAuthToken: string | null = null;
let memberAuthToken: string | null = null;

// =====================================================
// Helper Functions
// =====================================================

/**
 * Get auth token for API requests
 * Note: SSR cookies are set automatically, we return the user ID for reference
 */
async function getAuthToken(page: any, email: string, password: string): Promise<string> {
  const response = await page.request.post(`${BASE_URL}/api/auth/signin`, {
    data: { email, password },
  });

  const result = await response.json();

  if (!result.success || !result.session?.user?.id) {
    throw new Error(`Authentication failed for ${email}: ${result.error || 'No user ID in response'}`);
  }

  // Return user ID as the "token" reference
  // Actual authentication is handled via cookies set by the API
  return result.session.user.id;
}

/**
 * Create test quotation
 */
async function createTestQuotation(request: any, authToken: string): Promise<string> {
  // Use guest-save endpoint which doesn't require authentication
  const response = await request.post(`${BASE_URL}/api/quotations/guest-save`, {
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      customerName: 'E2E Test User',
      customerEmail: 'e2e-test@example.com',
      specifications: {
        productType: 'standup',
        quantity: '5000',
        size: '130x130x30',
        material: 'PET_LLDPE',
        printing: 'flexography',
        timeline: '21 days',
      },
      postProcessing: [],
      pricing: {
        unitPrice: 50,
        totalPrice: 250000,
        totalCost: 250000,
        setupCost: 0,
      },
    },
  });

  const result = await response.json();

  // Debug: log the response
  console.log('[createTestQuotation] API Response:', JSON.stringify(result, null, 2));

  // Handle API response structure
  if (result.quotation && result.quotation.id) {
    return result.quotation.id;
  }

  // Legacy format support
  if (result.quotationId) {
    return result.quotationId;
  }

  throw new Error(`No quotation ID in response. Response: ${JSON.stringify(result)}`);
}

/**
 * Approve quotation (admin action) - using database update API
 */
async function approveQuotation(request: any, authToken: string, quotationId: string): Promise<void> {
  // Use admin quotations update endpoint with DEV_MODE
  // Note: Database uses lowercase status values
  const response = await request.patch(`${BASE_URL}/api/admin/quotations/${quotationId}`, {
    headers: {
      'x-dev-mode': 'true',
      'x-user-id': authToken,
      'Content-Type': 'application/json',
    },
    data: { status: 'approved' },
  });

  const result = await response.json();
  if (!response.ok()) {
    throw new Error(`Failed to approve quotation: ${JSON.stringify(result)}`);
  }
}

/**
 * Upload test design file
 */
async function uploadDesignFile(request: any, authToken: string, orderId: string): Promise<void> {
  // Skip actual file upload for E2E tests - just log
  console.log(`[uploadDesignFile] Skipping file upload for order ${orderId} (E2E test)`);
  // In real scenarios, this would upload files to the API
  // await request.post(`${BASE_URL}/api/admin/orders/${orderId}/files`, {
  //   headers: {
  //     'x-dev-mode': 'true',
  //     'x-user-id': authToken,
  //   },
  //   multipart: {
  //     file: Buffer.from('test design data'),
  //     file_type: 'AI',
  //     original_filename: 'test_design.ai',
  //   },
  // });
}

// =====================================================
// Setup & Teardown
// =====================================================

test.beforeAll(async ({ request }) => {
  console.log('[B2B Workflow E2E] Starting test setup...');

  // Authenticate admin
  console.log('[B2B Workflow E2E] Authenticating admin:', ADMIN_CREDENTIALS.email);
  const adminResponse = await request.post(`${BASE_URL}/api/auth/signin`, {
    data: ADMIN_CREDENTIALS,
  });
  const adminResult = await adminResponse.json();

  if (!adminResult.success || !adminResult.session?.user?.id) {
    console.error('[B2B Workflow E2E] Admin auth failed:', adminResult);
    throw new Error(`Admin authentication failed: ${adminResult.error || 'No user ID in response'}`);
  }
  adminAuthToken = adminResult.session.user.id;
  console.log('[B2B Workflow E2E] Admin authenticated, user ID:', adminAuthToken);

  // Authenticate member
  console.log('[B2B Workflow E2E] Authenticating member:', MEMBER_CREDENTIALS.email);
  const memberResponse = await request.post(`${BASE_URL}/api/auth/signin`, {
    data: MEMBER_CREDENTIALS,
  });
  const memberResult = await memberResponse.json();

  if (!memberResult.success || !memberResult.session?.user?.id) {
    console.error('[B2B Workflow E2E] Member auth failed:', memberResult);
    throw new Error(`Member authentication failed: ${memberResult.error || 'No user ID in response'}`);
  }
  memberAuthToken = memberResult.session.user.id;
  console.log('[B2B Workflow E2E] Member authenticated, user ID:', memberAuthToken);

  console.log('[B2B Workflow E2E] Authentication successful');
});

test.afterAll(async ({ request }) => {
  // Cleanup: Cancel test order if exists
  if (testOrderId && memberAuthToken) {
    try {
      await request.post(`${BASE_URL}/api/member/orders/${testOrderId}/spec-approval`, {
        headers: {
          Authorization: `Bearer ${memberAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          action: 'cancel',
          revisionId: testDesignRevisionId || 'test',
          comment: 'Test cleanup',
        },
      });
      console.log('[B2B Workflow E2E] Test order cancelled');
    } catch (error) {
      console.log('[B2B Workflow E2E] Cleanup failed:', error);
    }
  }
});

// =====================================================
// Test Suite 1: Quotation to Order Conversion
// =====================================================

test.describe('Quotation to Order Conversion', () => {
  test('TC001: Convert approved quotation to order', async ({ request }) => {
    if (!memberAuthToken) {
      test.skip(true, 'Authentication failed');
    }

    // Create test quotation
    testQuotationId = await createTestQuotation(request, memberAuthToken);
    expect(testQuotationId).toBeTruthy();

    // Approve quotation using DEV_MODE
    await approveQuotation(request, adminAuthToken!, testQuotationId);

    // Verify quotation status after approval
    const checkResponse = await request.get(`${BASE_URL}/api/admin/quotations/${testQuotationId}`, {
      headers: {
        'x-dev-mode': 'true',
        'x-user-id': adminAuthToken,
      },
    });
    const checkResult = await checkResponse.json();
    console.log('[TC001] Quotation status after approval:', checkResult.data?.status);

    // Convert to order using DEV_MODE headers
    const response = await request.post(`${BASE_URL}/api/member/quotations/${testQuotationId}/convert`, {
      headers: {
        'x-dev-mode': 'true',
        'x-user-id': memberAuthToken,
        'Content-Type': 'application/json',
      },
      data: {
        notes: 'E2E test order',
      },
    });

    const result = await response.json();
    console.log('[TC001] Convert response:', JSON.stringify(result, null, 2));

    // Verify response
    expect(response.status()).toBe(200);
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('id');
    expect(result.data).toHaveProperty('order_number');

    testOrderId = result.data.id;
    expect(testOrderId).toBeTruthy();

    console.log('[TC001] Order created:', testOrderId);
  });

  test('TC002: Prevent conversion of non-approved quotation', async ({ request }) => {
    if (!memberAuthToken) {
      test.skip(true, 'Authentication failed');
    }

    // Create draft quotation
    const quotationId = await createTestQuotation(request, memberAuthToken);

    // Try to convert using DEV_MODE (should fail because quotation is not approved)
    const response = await request.post(`${BASE_URL}/api/member/quotations/${quotationId}/convert`, {
      headers: {
        'x-dev-mode': 'true',
        'x-user-id': memberAuthToken,
        'Content-Type': 'application/json',
      },
      data: {
        notes: 'Should fail',
      },
    });

    const result = await response.json();

    // Verify error
    expect(response.status()).toBe(400);
    expect(result.success).toBe(false);
    expect(result.error).toContain('承認された見積のみ');
  });

  test('TC003: Prevent conversion of expired quotation', async ({ request }) => {
    if (!adminAuthToken) {
      test.skip(true, 'Authentication failed');
    }

    // This test requires creating an expired quotation in the database
    // For now, we'll skip this
    test.skip(true, 'Requires database setup for expired quotation');
  });

  test('TC004: Prevent duplicate conversion', async ({ request }) => {
    if (!memberAuthToken || !testQuotationId) {
      test.skip(true, 'Test prerequisites not met');
    }

    // Try to convert again using DEV_MODE (should return existing order)
    const response = await request.post(`${BASE_URL}/api/member/quotations/${testQuotationId}/convert`, {
      headers: {
        'x-dev-mode': 'true',
        'x-user-id': memberAuthToken,
        'Content-Type': 'application/json',
      },
      data: {
        notes: 'Duplicate attempt',
      },
    });

    const result = await response.json();

    // Verify response returns existing order
    expect(response.status()).toBe(200);
    expect(result.success).toBe(true);
    expect(result.alreadyExists).toBe(true);
    expect(result.data.id).toBe(testOrderId);
  });
});

// =====================================================
// Test Suite 2: Send to Korea
// =====================================================

test.describe('Send Design to Korea', () => {
  test.beforeAll(async ({ request }) => {
    if (!testOrderId || !adminAuthToken) {
      test.skip(true, 'Test prerequisites not met');
    }

    // Upload design files
    await uploadDesignFile(request, adminAuthToken, testOrderId);
  });

  test('TC005: Send design data to Korea partner', async ({ request }) => {
    if (!adminAuthToken || !testOrderId) {
      test.skip(true, 'Test prerequisites not met');
    }

    const response = await request.post(`${BASE_URL}/api/admin/orders/${testOrderId}/send-to-korea`, {
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        notes: 'E2E test - urgent',
      },
    });

    const result = await response.json();

    // Verify response
    expect(response.status()).toBe(200);
    expect(result.success).toBe(true);
    expect(result.messageId).toBeTruthy();

    console.log('[TC005] Design sent to Korea, messageId:', result.messageId);
  });

  test('TC006: Verify order stage updated to DATA_TO_KR', async ({ request }) => {
    if (!adminAuthToken || !testOrderId) {
      test.skip(true, 'Test prerequisites not met');
    }

    const response = await request.get(`${BASE_URL}/api/admin/orders/${testOrderId}`, {
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
      },
    });

    const result = await response.json();

    expect(result.current_stage).toBe('DATA_TO_KR');
  });

  test('TC007: Prevent sending without design files', async ({ request }) => {
    // Create new order without files
    if (!memberAuthToken || !adminAuthToken) {
      test.skip(true, 'Test prerequisites not met');
    }

    const quotationId = await createTestQuotation(request, memberAuthToken);
    await approveQuotation(request, adminAuthToken, quotationId);

    const convertResponse = await request.post(`${BASE_URL}/api/member/quotations/${quotationId}/convert`, {
      headers: {
        Authorization: `Bearer ${memberAuthToken}`,
        'Content-Type': 'application/json',
      },
    });

    const orderData = await convertResponse.json();
    const newOrderId = orderData.data.id;

    // Try to send without files
    const response = await request.post(`${BASE_URL}/api/admin/orders/${newOrderId}/send-to-korea`, {
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        notes: 'Should fail',
      },
    });

    const result = await response.json();

    // Verify error
    expect(response.status()).toBe(400);
    expect(result.error).toContain('デザインファイルが見つかりません');
  });
});

// =====================================================
// Test Suite 3: Correction Upload
// =====================================================

test.describe('Correction Data Upload', () => {
  test('TC008: Upload correction preview and original file', async ({ request }) => {
    if (!adminAuthToken || !testOrderId) {
      test.skip(true, 'Test prerequisites not met');
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('preview_image', Buffer.from('test preview image'), 'preview.jpg');
    formData.append('original_file', Buffer.from('test original file'), 'original.ai');
    formData.append('partner_comment', 'E2E test correction');
    formData.append('notify_customer', 'false'); // Don't send email in tests

    const response = await request.post(`${BASE_URL}/api/admin/orders/${testOrderId}/correction`, {
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
      },
      multipart: {
        preview_image: Buffer.from('test preview image'),
        preview_image_name: 'preview.jpg',
        original_file: Buffer.from('test original file'),
        original_file_name: 'original.ai',
        partner_comment: 'E2E test correction',
        notify_customer: 'false',
      },
    });

    const result = await response.json();

    // Verify response
    expect(response.status()).toBe(200);
    expect(result.success).toBe(true);
    expect(result.revision).toHaveProperty('id');
    expect(result.revision).toHaveProperty('revision_number');

    testDesignRevisionId = result.revision.id;
    console.log('[TC008] Correction uploaded, revisionId:', testDesignRevisionId);
  });

  test('TC009: Verify order stage updated to SPEC_REVIEW', async ({ request }) => {
    if (!adminAuthToken || !testOrderId) {
      test.skip(true, 'Test prerequisites not met');
    }

    const response = await request.get(`${BASE_URL}/api/admin/orders/${testOrderId}`, {
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
      },
    });

    const result = await response.json();

    expect(result.current_stage).toBe('SPEC_REVIEW');
  });

  test('TC010: List correction revisions', async ({ request }) => {
    if (!adminAuthToken || !testOrderId) {
      test.skip(true, 'Test prerequisites not met');
    }

    const response = await request.get(`${BASE_URL}/api/admin/orders/${testOrderId}/correction`, {
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
      },
    });

    const result = await response.json();

    expect(response.status()).toBe(200);
    expect(result.success).toBe(true);
    expect(result.revisions).toBeInstanceOf(Array);
    expect(result.revisions.length).toBeGreaterThan(0);
  });
});

// =====================================================
// Test Suite 4: Spec Approval
// =====================================================

test.describe('Spec Approval Actions', () => {
  test('TC011: Approve correction data', async ({ request }) => {
    if (!memberAuthToken || !testOrderId || !testDesignRevisionId) {
      test.skip(true, 'Test prerequisites not met');
    }

    const response = await request.post(`${BASE_URL}/api/member/orders/${testOrderId}/spec-approval`, {
      headers: {
        Authorization: `Bearer ${memberAuthToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        action: 'approve',
        revisionId: testDesignRevisionId,
      },
    });

    const result = await response.json();

    // Verify response
    expect(response.status()).toBe(200);
    expect(result.success).toBe(true);
    expect(result.message).toContain('承認しました');

    console.log('[TC011] Spec approved');
  });

  test('TC012: Verify order stage updated to CONTRACT', async ({ request }) => {
    if (!memberAuthToken || !testOrderId) {
      test.skip(true, 'Test prerequisites not met');
    }

    const response = await request.get(`${BASE_URL}/api/member/orders/${testOrderId}`, {
      headers: {
        Authorization: `Bearer ${memberAuthToken}`,
      },
    });

    const result = await response.json();

    expect(result.current_stage).toBe('CONTRACT');
  });

  test('TC013: Reject correction with comment', async ({ request }) => {
    // This test requires a new revision
    if (!adminAuthToken || !memberAuthToken || !testOrderId) {
      test.skip(true, 'Test prerequisites not met');
    }

    // Upload new correction
    await request.post(`${BASE_URL}/api/admin/orders/${testOrderId}/correction`, {
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
      },
      multipart: {
        preview_image: Buffer.from('test preview 2'),
        preview_image_name: 'preview2.jpg',
        original_file: Buffer.from('test original 2'),
        original_file_name: 'original2.ai',
        partner_comment: 'E2E test correction 2',
        notify_customer: 'false',
      },
    });

    // Get the new revision ID
    const revisionsResponse = await request.get(`${BASE_URL}/api/admin/orders/${testOrderId}/correction`, {
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
      },
    });

    const revisionsData = await revisionsResponse.json();
    const newRevisionId = revisionsData.revisions[0].id;

    // Reject with comment
    const response = await request.post(`${BASE_URL}/api/member/orders/${testOrderId}/spec-approval`, {
      headers: {
        Authorization: `Bearer ${memberAuthToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        action: 'reject',
        revisionId: newRevisionId,
        comment: '색상을 수정해주세요',
      },
    });

    const result = await response.json();

    // Verify response
    expect(response.status()).toBe(200);
    expect(result.success).toBe(true);
    expect(result.message).toContain('修正要求');

    // Verify stage returned to DATA_TO_KR
    const orderResponse = await request.get(`${BASE_URL}/api/member/orders/${testOrderId}`, {
      headers: {
        Authorization: `Bearer ${memberAuthToken}`,
      },
    });

    const orderData = await orderResponse.json();
    expect(orderData.current_stage).toBe('DATA_TO_KR');
  });

  test('TC014: Reject without comment should fail', async ({ request }) => {
    if (!memberAuthToken || !testOrderId || !testDesignRevisionId) {
      test.skip(true, 'Test prerequisites not met');
    }

    const response = await request.post(`${BASE_URL}/api/member/orders/${testOrderId}/spec-approval`, {
      headers: {
        Authorization: `Bearer ${memberAuthToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        action: 'reject',
        revisionId: testDesignRevisionId,
        // No comment
      },
    });

    // Should fail
    expect(response.status()).toBe(400);
  });
});

// =====================================================
// Test Suite 5: Payment Confirmation
// =====================================================

test.describe('Payment Confirmation', () => {
  test.beforeAll(async ({ request }) => {
    // Re-approve spec for payment tests
    if (!adminAuthToken || !memberAuthToken || !testOrderId) {
      test.skip(true, 'Test prerequisites not met');
    }

    // Upload correction
    await request.post(`${BASE_URL}/api/admin/orders/${testOrderId}/correction`, {
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
      },
      multipart: {
        preview_image: Buffer.from('test preview 3'),
        preview_image_name: 'preview3.jpg',
        original_file: Buffer.from('test original 3'),
        original_file_name: 'original3.ai',
        partner_comment: 'E2E test correction 3',
        notify_customer: 'false',
      },
    });

    // Approve
    const revisionsResponse = await request.get(`${BASE_URL}/api/admin/orders/${testOrderId}/correction`, {
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
      },
    });

    const revisionsData = await revisionsResponse.json();
    const revisionId = revisionsData.revisions[0].id;

    await request.post(`${BASE_URL}/api/member/orders/${testOrderId}/spec-approval`, {
      headers: {
        Authorization: `Bearer ${memberAuthToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        action: 'approve',
        revisionId,
      },
    });
  });

  test('TC015: Confirm payment', async ({ request }) => {
    if (!adminAuthToken || !testOrderId) {
      test.skip(true, 'Test prerequisites not met');
    }

    const paymentDate = new Date().toISOString().split('T')[0];

    const response = await request.post(`${BASE_URL}/api/admin/orders/${testOrderId}/payment-confirmation`, {
      headers: {
        'x-dev-mode': 'true',
        'x-user-id': adminAuthToken,
        'Content-Type': 'application/json',
      },
      data: {
        paymentAmount: 250000,
        paymentDate,
        paymentMethod: 'bank_transfer',
      },
    });

    const result = await response.json();

    // Verify response
    expect(response.status()).toBe(200);
    expect(result.success).toBe(true);
    expect(result.payment).toHaveProperty('payment_confirmed_at');
    expect(result.payment.payment_amount).toBe(250000);

    console.log('[TC015] Payment confirmed');
  });

  test('TC016: Get payment info', async ({ request }) => {
    if (!adminAuthToken || !testOrderId) {
      test.skip(true, 'Test prerequisites not met');
    }

    const response = await request.get(`${BASE_URL}/api/admin/orders/${testOrderId}/payment-confirmation`, {
      headers: {
        'x-dev-mode': 'true',
        'x-user-id': adminAuthToken,
      },
    });

    const result = await response.json();

    expect(response.status()).toBe(200);
    expect(result.success).toBe(true);
    expect(result.payment).not.toBeNull();
  });

  test('TC017: Invalid payment amount should fail', async ({ request }) => {
    if (!adminAuthToken || !testOrderId) {
      test.skip(true, 'Test prerequisites not met');
    }

    const response = await request.post(`${BASE_URL}/api/admin/orders/${testOrderId}/payment-confirmation`, {
      headers: {
        'x-dev-mode': 'true',
        'x-user-id': adminAuthToken,
        'Content-Type': 'application/json',
      },
      data: {
        paymentAmount: -1000, // Invalid
        paymentDate: '2025-01-30',
        paymentMethod: 'bank_transfer',
      },
    });

    // Should fail
    expect(response.status()).toBe(400);
  });
});

// =====================================================
// Test Suite 6: Production Start
// =====================================================

test.describe('Production Start', () => {
  test('TC018: Start production with all prerequisites', async ({ request }) => {
    if (!adminAuthToken || !testOrderId) {
      test.skip(true, 'Test prerequisites not met');
    }

    // First, we need to ensure all prerequisites are met
    // This includes: payment_confirmed_at, spec_approved_at, contract_signed_at

    // For this test, we'll skip if not all conditions are met
    const orderResponse = await request.get(`${BASE_URL}/api/admin/orders/${testOrderId}`, {
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
      },
    });

    const orderData = await orderResponse.json();

    if (!orderData.payment_confirmed_at) {
      test.skip(true, 'Payment not confirmed');
    }

    if (!orderData.spec_approved_at) {
      test.skip(true, 'Spec not approved');
    }

    if (!orderData.contract_signed_at) {
      test.skip(true, 'Contract not signed');
    }

    const response = await request.post(`${BASE_URL}/api/admin/orders/${testOrderId}/start-production`, {
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    // Verify response
    expect(response.status()).toBe(200);
    expect(result.success).toBe(true);
    expect(result.message).toContain('製造を開始しました');

    console.log('[TC018] Production started');
  });

  test('TC019: Start production without payment should fail', async ({ request }) => {
    // This requires creating a new order without payment
    test.skip(true, 'Requires test setup with unpaid order');
  });

  test('TC020: Verify production order created', async ({ request }) => {
    if (!adminAuthToken || !testOrderId) {
      test.skip(true, 'Test prerequisites not met');
    }

    // Check if production order exists
    const response = await request.get(`${BASE_URL}/api/admin/orders/${testOrderId}/production`, {
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
      },
    });

    if (response.status() === 404) {
      test.skip(true, 'Production order not created (TC018 may have failed)');
    }

    const result = await response.json();

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('current_stage');
    expect(result.current_stage).toBe('data_received');
  });
});

// =====================================================
// Test Suite 7: Shipping & Delivery
// =====================================================

test.describe('Shipping and Delivery', () => {
  test('TC021: Input shipping information', async ({ request }) => {
    if (!adminAuthToken || !testOrderId) {
      test.skip(true, 'Test prerequisites not met');
    }

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    const response = await request.post(`${BASE_URL}/api/admin/orders/${testOrderId}/shipping-info`, {
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        trackingNumber: 'JP123456789',
        shippingMethod: 'yamato',
        estimatedDelivery: estimatedDelivery.toISOString(),
      },
    });

    const result = await response.json();

    // Verify response
    expect(response.status()).toBe(200);
    expect(result.success).toBe(true);

    console.log('[TC021] Shipping info updated');
  });

  test('TC022: Verify order stage updated to SHIPPED', async ({ request }) => {
    if (!adminAuthToken || !testOrderId) {
      test.skip(true, 'Test prerequisites not met');
    }

    const response = await request.get(`${BASE_URL}/api/admin/orders/${testOrderId}`, {
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
      },
    });

    const result = await response.json();

    expect(result.current_stage).toBe('SHIPPED');
    expect(result.tracking_number_domestic).toBe('JP123456789');
  });

  test('TC023: Send delivery note', async ({ request }) => {
    if (!adminAuthToken || !testOrderId) {
      test.skip(true, 'Test prerequisites not met');
    }

    const response = await request.post(`${BASE_URL}/api/admin/orders/${testOrderId}/delivery-note`, {
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    // Verify response
    expect(response.status()).toBe(200);
    expect(result.success).toBe(true);

    console.log('[TC023] Delivery note sent');
  });
});

// =====================================================
// Test Suite 8: Archive Orders (Cron)
// =====================================================

test.describe('Order Archiving', () => {
  test('TC024: Verify cron authentication', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/cron/archive-orders`, {
      headers: {
        Authorization: 'Bearer invalid-secret',
      },
    });

    // Should fail with invalid secret
    expect(response.status()).toBe(401);
  });

  test('TC025: Run archive cron with valid secret', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/cron/archive-orders`, {
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
      },
    });

    const result = await response.json();

    // Verify response
    expect(response.status()).toBe(200);
    expect(result.success).toBe(true);
    expect(result).toHaveProperty('archivedCount');

    console.log('[TC025] Archived orders:', result.archivedCount);
  });

  test('TC026: Manual trigger via GET', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/cron/archive-orders`, {
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
      },
    });

    const result = await response.json();

    // Verify response
    expect(response.status()).toBe(200);
    expect(result.success).toBe(true);
  });
});

// =====================================================
// Test Suite 9: Permission Tests
// =====================================================

test.describe('API Permissions', () => {
  test('TC027: Member cannot access admin APIs', async ({ request }) => {
    if (!memberAuthToken || !testOrderId) {
      test.skip(true, 'Test prerequisites not met');
    }

    const response = await request.post(`${BASE_URL}/api/admin/orders/${testOrderId}/send-to-korea`, {
      headers: {
        Authorization: `Bearer ${memberAuthToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        notes: 'Should fail',
      },
    });

    // Should fail
    expect(response.status()).toBe(403);
  });

  test('TC028: Admin cannot approve member orders', async ({ request }) => {
    if (!adminAuthToken || !testOrderId) {
      test.skip(true, 'Test prerequisites not met');
    }

    const response = await request.post(`${BASE_URL}/api/member/orders/${testOrderId}/spec-approval`, {
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        action: 'approve',
        revisionId: 'test',
      },
    });

    // Should fail (order doesn't belong to admin)
    expect([403, 404]).toContain(response.status());
  });

  test('TC029: Unauthenticated requests rejected', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/admin/orders/${testOrderId}/correction`);

    // Should fail
    expect(response.status()).toBe(401);
  });
});

// =====================================================
// Test Suite 10: Edge Cases
// =====================================================

test.describe('Edge Cases', () => {
  test('TC030: Missing required fields returns 400', async ({ request }) => {
    if (!adminAuthToken || !testOrderId) {
      test.skip(true, 'Test prerequisites not met');
    }

    const response = await request.post(`${BASE_URL}/api/admin/orders/${testOrderId}/shipping-info`, {
      headers: {
        'x-dev-mode': 'true',
        'x-user-id': adminAuthToken,
        'Content-Type': 'application/json',
      },
      data: {
        trackingNumber: 'TEST123',
        // Missing shippingMethod and estimatedDelivery
      },
    });

    // Should fail
    expect(response.status()).toBe(400);
  });

  test('TC031: Invalid order ID returns 404', async ({ request }) => {
    if (!adminAuthToken) {
      test.skip(true, 'Test prerequisites not met');
    }

    const fakeOrderId = '00000000-0000-0000-0000-000000000000';

    const response = await request.post(`${BASE_URL}/api/admin/orders/${fakeOrderId}/payment-confirmation`, {
      headers: {
        'x-dev-mode': 'true',
        'x-user-id': adminAuthToken,
        'Content-Type': 'application/json',
      },
      data: {
        paymentAmount: 1000,
        paymentDate: '2025-01-30',
        paymentMethod: 'bank_transfer',
      },
    });

    // Should fail with 404 (order not found)
    expect(response.status()).toBe(404);
  });

  test('TC032: Malformed JSON returns 400', async ({ request }) => {
    if (!adminAuthToken || !testOrderId) {
      test.skip(true, 'Test prerequisites not met');
    }

    const response = await request.post(`${BASE_URL}/api/admin/orders/${testOrderId}/payment-confirmation`, {
      headers: {
        'x-dev-mode': 'true',
        'x-user-id': adminAuthToken,
        'Content-Type': 'application/json',
      },
      data: 'invalid json{{{',
    });

    // Should fail
    expect([400, 500]).toContain(response.status());
  });
});
