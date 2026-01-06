/**
 * Test Script for Order Receipt API
 *
 * Tests the POST /api/orders/receive endpoint
 * Run with: npx ts-node scripts/test-order-receipt-api.ts
 */

interface OrderItem {
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  specifications?: Record<string, any>;
  notes?: string;
}

interface ExternalOrderData {
  external_order_id?: string;
  quotation_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  company_name?: string;
  company_id?: string;
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency?: string;
  payment_method: 'bank_transfer' | 'credit_card' | 'paypal' | 'square' | 'stripe' | 'sb_payment' | 'other';
  payment_term: 'credit' | 'advance';
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
  notes?: string;
  metadata?: Record<string, any>;
}

interface OrderReceiptResponse {
  success: boolean;
  order_id?: string;
  order_number?: string;
  message: string;
  error?: string;
  warnings?: string[];
}

// Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_KEY = process.env.EXTERNAL_API_KEY || 'test-api-key-12345';

// Test data
const createTestOrder = (): ExternalOrderData => {
  return {
    external_order_id: `EXT-${Date.now()}`,
    customer_name: 'テスト顧客',
    customer_email: 'test@example.com',
    customer_phone: '03-1234-5678',
    company_name: 'テスト株式会社',
    items: [
      {
        product_name: '三辺シール袋 (透明)',
        quantity: 1000,
        unit_price: 150,
        specifications: {
          size: '100x150mm',
          material: 'PET/PE',
          thickness: '70ミクロン',
        },
        notes: 'サンプル注文',
      },
      {
        product_name: 'スタンドアップパウチ',
        quantity: 500,
        unit_price: 200,
        specifications: {
          size: '120x180mm',
          material: 'PET/AL/PE',
          thickness: '90ミクロン',
          with_zipper: true,
        },
      },
    ],
    subtotal: 250000,
    tax_amount: 25000,
    total_amount: 275000,
    currency: 'JPY',
    payment_method: 'bank_transfer',
    payment_term: 'advance',
    shipping_address: {
      postal_code: '100-0001',
      prefecture: '東京都',
      city: '千代田区',
      address: '丸の内1-1-1',
      building: 'テストビル10F',
      contact_person: 'テスト担当者',
      phone: '03-1234-5678',
    },
    billing_address: {
      postal_code: '100-0001',
      prefecture: '東京都',
      city: '千代田区',
      address: '丸の内1-1-1',
      building: 'テストビル10F',
      company_name: 'テスト株式会社',
    },
    requested_delivery_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    delivery_notes: '午前中に配送希望',
    notes: 'テスト注文です。',
    metadata: {
      source: 'api_test',
      test_mode: true,
    },
  };
};

// Test function
async function testOrderReceiptAPI() {
  console.log('=== Order Receipt API Test ===\n');

  const testOrder = createTestOrder();

  console.log('Sending order data:');
  console.log(JSON.stringify(testOrder, null, 2));
  console.log('\n---\n');

  try {
    const response = await fetch(`${API_URL}/api/orders/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(testOrder),
    });

    const data: OrderReceiptResponse = await response.json();

    console.log(`Response Status: ${response.status}`);
    console.log('Response Data:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ Order created successfully!');
      console.log(`Order ID: ${data.order_id}`);
      console.log(`Order Number: ${data.order_number}`);
    } else {
      console.log('\n❌ Order creation failed!');
      console.log(`Error: ${data.error}`);
    }

    // Test idempotency (send same order again)
    console.log('\n=== Testing Idempotency ===\n');
    console.log('Sending same order again...');

    const idempotentResponse = await fetch(`${API_URL}/api/orders/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(testOrder),
    });

    const idempotentData: OrderReceiptResponse = await idempotentResponse.json();

    console.log(`Response Status: ${idempotentResponse.status}`);
    console.log('Response Data:');
    console.log(JSON.stringify(idempotentData, null, 2));

    if (idempotentData.success && idempotentData.order_id === data.order_id) {
      console.log('\n✅ Idempotency working correctly!');
    }

  } catch (error) {
    console.error('Error testing order receipt API:', error);
  }
}

// Test validation errors
async function testValidationErrors() {
  console.log('\n=== Testing Validation Errors ===\n');

  // Test 1: Missing required fields
  console.log('Test 1: Missing customer_name');
  const invalidOrder1 = {
    customer_email: 'test@example.com',
    items: [],
    subtotal: 0,
    tax_amount: 0,
    total_amount: 0,
    payment_method: 'bank_transfer',
    payment_term: 'advance',
  };

  try {
    const response = await fetch(`${API_URL}/api/orders/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(invalidOrder1),
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }

  // Test 2: Invalid email
  console.log('\nTest 2: Invalid email format');
  const invalidOrder2 = {
    ...createTestOrder(),
    customer_email: 'invalid-email',
  };

  try {
    const response = await fetch(`${API_URL}/api/orders/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(invalidOrder2),
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test authentication
async function testAuthentication() {
  console.log('\n=== Testing Authentication ===\n');

  console.log('Test: Missing API key');
  const testOrder = createTestOrder();

  try {
    const response = await fetch(`${API_URL}/api/orders/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrder),
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
    const response = await fetch(`${API_URL}/api/orders/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'invalid-key',
      },
      body: JSON.stringify(testOrder),
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

// Run all tests
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   Order Receipt API Test Suite              ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  await testOrderReceiptAPI();
  await testValidationErrors();
  await testAuthentication();

  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   All tests completed!                       ║');
  console.log('╚════════════════════════════════════════════════╝\n');
}

// Run tests
runAllTests().catch(console.error);
