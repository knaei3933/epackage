/**
 * Test Script for Payment Confirmation API
 *
 * Tests the POST /api/payments/confirm endpoint
 * Run with: npx ts-node scripts/test-payment-confirmation-api.ts
 */

interface PaymentConfirmationRequest {
  payment_id: string;
  order_id?: string;
  external_order_id?: string;
  amount: number;
  currency: string;
  payment_method: 'bank_transfer' | 'credit_card' | 'paypal' | 'square' | 'stripe' | 'sb_payment' | 'other';
  payment_gateway: 'square' | 'stripe' | 'paypal' | 'sb_payment' | 'manual' | 'none';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partial_refund';
  transaction_id?: string;
  reference_number?: string;
  payment_date: string;
  processed_at?: string;
  webhook_signature?: {
    provider: 'square' | 'stripe' | 'paypal' | 'sb_payment' | 'manual' | 'none';
    signature: string;
    timestamp?: string;
    payload: string;
  };
  gateway_data?: Record<string, any>;
  metadata?: Record<string, any>;
  idempotency_key?: string;
}

interface PaymentConfirmationResponse {
  success: boolean;
  payment_id?: string;
  confirmation_id?: string;
  order_id?: string;
  order_number?: string;
  message: string;
  error?: string;
}

// Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_KEY = process.env.EXTERNAL_API_KEY || 'test-api-key-12345';

// Test data
const createTestPaymentConfirmation = (
  overrides: Partial<PaymentConfirmationRequest> = {}
): PaymentConfirmationRequest => {
  return {
    payment_id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount: 275000,
    currency: 'JPY',
    payment_method: 'credit_card',
    payment_gateway: 'stripe',
    status: 'completed',
    transaction_id: `ch_${Math.random().toString(36).substr(2, 9)}`,
    payment_date: new Date().toISOString(),
    processed_at: new Date().toISOString(),
    metadata: {
      test_mode: true,
      source: 'api_test',
    },
    ...overrides,
  };
};

// Test function: Successful payment confirmation
async function testSuccessfulPaymentConfirmation() {
  console.log('=== Test: Successful Payment Confirmation ===\n');

  const paymentData = createTestPaymentConfirmation({
    external_order_id: 'EXT-1704451200000-0001', // Example order ID
    idempotency_key: `idem_${Date.now()}`,
  });

  console.log('Sending payment confirmation:');
  console.log(JSON.stringify(paymentData, null, 2));
  console.log('\n---\n');

  try {
    const response = await fetch(`${API_URL}/api/payments/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(paymentData),
    });

    const data: PaymentConfirmationResponse = await response.json();

    console.log(`Response Status: ${response.status}`);
    console.log('Response Data:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ Payment confirmed successfully!');
      console.log(`Confirmation ID: ${data.confirmation_id}`);
      console.log(`Order ID: ${data.order_id}`);
      console.log(`Order Number: ${data.order_number}`);
    } else {
      console.log('\n❌ Payment confirmation failed!');
      console.log(`Error: ${data.error}`);
    }

    // Test idempotency
    console.log('\n--- Testing Idempotency ---\n');
    console.log('Sending same payment confirmation again...');

    const idempotentResponse = await fetch(`${API_URL}/api/payments/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(paymentData),
    });

    const idempotentData: PaymentConfirmationResponse = await idempotentResponse.json();

    console.log(`Response Status: ${idempotentResponse.status}`);
    console.log('Response Data:');
    console.log(JSON.stringify(idempotentData, null, 2));

    if (idempotentData.success && idempotentData.confirmation_id === data.confirmation_id) {
      console.log('\n✅ Idempotency working correctly!');
    }

  } catch (error) {
    console.error('Error testing payment confirmation API:', error);
  }
}

// Test function: Different payment gateways
async function testPaymentGateways() {
  console.log('\n=== Test: Different Payment Gateways ===\n');

  const gateways = [
    { gateway: 'stripe', method: 'credit_card' },
    { gateway: 'square', method: 'credit_card' },
    { gateway: 'paypal', method: 'paypal' },
    { gateway: 'sb_payment', method: 'credit_card' },
    { gateway: 'manual', method: 'bank_transfer' },
  ];

  for (const { gateway, method } of gateways) {
    console.log(`\nTesting ${gateway} gateway...`);

    const paymentData = createTestPaymentConfirmation({
      payment_id: `pay_${gateway}_${Date.now()}`,
      payment_gateway: gateway as any,
      payment_method: method as any,
      idempotency_key: `idem_${gateway}_${Date.now()}`,
    });

    try {
      const response = await fetch(`${API_URL}/api/payments/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
        body: JSON.stringify(paymentData),
      });

      const data: PaymentConfirmationResponse = await response.json();

      if (data.success) {
        console.log(`✅ ${gateway}: Success (Confirmation ID: ${data.confirmation_id})`);
      } else {
        console.log(`❌ ${gateway}: Failed (${data.error})`);
      }
    } catch (error) {
      console.error(`❌ ${gateway}: Error -`, error);
    }
  }
}

// Test function: Different payment statuses
async function testPaymentStatuses() {
  console.log('\n=== Test: Different Payment Statuses ===\n');

  const statuses: Array<'completed' | 'failed' | 'pending' | 'cancelled'> = [
    'completed',
    'failed',
    'pending',
    'cancelled',
  ];

  for (const status of statuses) {
    console.log(`\nTesting status: ${status}`);

    const paymentData = createTestPaymentConfirmation({
      payment_id: `pay_${status}_${Date.now()}`,
      status,
      idempotency_key: `idem_${status}_${Date.now()}`,
    });

    try {
      const response = await fetch(`${API_URL}/api/payments/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
        body: JSON.stringify(paymentData),
      });

      const data: PaymentConfirmationResponse = await response.json();

      if (data.success) {
        console.log(`✅ ${status}: Success`);
      } else {
        console.log(`❌ ${status}: Failed (${data.error})`);
      }
    } catch (error) {
      console.error(`❌ ${status}: Error -`, error);
    }
  }
}

// Test function: Validation errors
async function testValidationErrors() {
  console.log('\n=== Test: Validation Errors ===\n');

  // Test 1: Missing payment_id
  console.log('Test 1: Missing payment_id');
  const invalidPayment1 = {
    amount: 1000,
    currency: 'JPY',
    payment_method: 'credit_card',
    payment_gateway: 'stripe',
    status: 'completed',
    payment_date: new Date().toISOString(),
  };

  try {
    const response = await fetch(`${API_URL}/api/payments/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(invalidPayment1),
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(JSON.stringify(data, null, 2));

    if (response.status === 400) {
      console.log('✅ Validation error correctly detected!');
    }
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 2: Invalid amount
  console.log('\nTest 2: Invalid amount (negative)');
  const invalidPayment2 = createTestPaymentConfirmation({
    payment_id: `pay_invalid_${Date.now()}`,
    amount: -100,
  });

  try {
    const response = await fetch(`${API_URL}/api/payments/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(invalidPayment2),
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(JSON.stringify(data, null, 2));

    if (response.status === 400) {
      console.log('✅ Invalid amount correctly rejected!');
    }
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 3: Invalid date format
  console.log('\nTest 3: Invalid payment_date format');
  const invalidPayment3 = createTestPaymentConfirmation({
    payment_id: `pay_invalid_date_${Date.now()}`,
    payment_date: 'not-a-date',
  });

  try {
    const response = await fetch(`${API_URL}/api/payments/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(invalidPayment3),
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(JSON.stringify(data, null, 2));

    if (response.status === 400) {
      console.log('✅ Invalid date format correctly rejected!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test function: Authentication
async function testAuthentication() {
  console.log('\n=== Test: Authentication ===\n');

  const paymentData = createTestPaymentConfirmation();

  console.log('Test: Missing API key');
  try {
    const response = await fetch(`${API_URL}/api/payments/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(JSON.stringify(data, null, 2));

    if (response.status === 401) {
      console.log('✅ Authentication working correctly!');
    }
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\nTest: Invalid API key');
  try {
    const response = await fetch(`${API_URL}/api/payments/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'invalid-key',
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(JSON.stringify(data, null, 2));

    if (response.status === 401) {
      console.log('✅ Invalid key rejected correctly!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test function: GET payment confirmation status
async function testGetPaymentConfirmation() {
  console.log('\n=== Test: GET Payment Confirmation Status ===\n');

  // First, create a payment confirmation
  const paymentData = createTestPaymentConfirmation({
    idempotency_key: `idem_get_${Date.now()}`,
  });

  console.log('Creating payment confirmation...');
  const createResponse = await fetch(`${API_URL}/api/payments/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify(paymentData),
  });

  const createData: PaymentConfirmationResponse = await createResponse.json();

  if (!createData.success || !createData.confirmation_id) {
    console.log('❌ Failed to create payment confirmation');
    return;
  }

  console.log(`✅ Payment confirmation created: ${createData.confirmation_id}`);

  // Now retrieve it
  console.log('\nRetrieving payment confirmation...');

  try {
    const response = await fetch(
      `${API_URL}/api/payments/confirm?payment_id=${createData.confirmation_id}`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': API_KEY,
        },
      }
    );

    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ Payment confirmation retrieved successfully!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   Payment Confirmation API Test Suite       ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  await testSuccessfulPaymentConfirmation();
  await testPaymentGateways();
  await testPaymentStatuses();
  await testValidationErrors();
  await testAuthentication();
  await testGetPaymentConfirmation();

  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   All tests completed!                       ║');
  console.log('╚════════════════════════════════════════════════╝\n');
}

// Run tests
runAllTests().catch(console.error);
