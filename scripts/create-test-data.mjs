/**
 * Create Test Data for Member Portal
 *
 * Generates sample orders, quotations, sample requests, and inquiries
 * for comprehensive member portal testing
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TEST_USER_ID = '3b67b1c5-5f88-40d8-998a-436f0f81fac0';

async function createTestQuotation() {
  console.log('Creating test quotation...');

  const { data, error } = await supabase
    .from('quotations')
    .insert({
      user_id: TEST_USER_ID,
      quotation_number: `QT-${Date.now()}`,
      status: 'sent',
      customer_name: '山田太郎',
      customer_email: 'member@test.com',
      customer_phone: '090-1234-5678',
      subtotal_amount: 100000,
      tax_amount: 10000,
      total_amount: 110000,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'テスト見積もり',
    })
    .select()
    .single();

  if (error) {
    console.error('  ✗ Failed:', error.message);
    return null;
  }

  console.log(`  ✓ Created: ${data.quotation_number}`);

  // Add quotation items
  const { error: itemsError } = await supabase
    .from('quotation_items')
    .insert([
      {
        quotation_id: data.id,
        product_id: 'stand-pouch-001',
        product_name: 'スタンドパウチ (三方止め)',
        quantity: 1000,
        unit_price: 100,
        total_price: 100000,
        specifications: {
          size: '100x150mm',
          material: 'PET/AL/PE',
          thickness: '100μm',
        },
      },
    ]);

  if (itemsError) {
    console.error('  ✗ Failed to add items:', itemsError.message);
  } else {
    console.log('  ✓ Added 1 quotation item');
  }

  return data;
}

async function createTestOrder() {
  console.log('Creating test order...');

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: TEST_USER_ID,
      order_number: `ORD-${Date.now()}`,
      status: 'processing',
      total_amount: 110000,
      subtotal: 100000,
      tax_amount: 10000,
      customer_name: '山田太郎',
      customer_email: 'member@test.com',
      customer_phone: '090-1234-5678',
      delivery_address: {
        postal_code: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        street: '丸の内1-1-1',
        building: 'テストビル',
      },
      billing_address: {
        postal_code: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        street: '丸の内1-1-1',
      },
    })
    .select()
    .single();

  if (error) {
    console.error('  ✗ Failed:', error.message);
    return null;
  }

  console.log(`  ✓ Created: ${data.order_number}`);

  // Add order items
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert([
      {
        order_id: data.id,
        product_id: 'stand-pouch-001',
        product_name: 'スタンドパウチ (三方止め)',
        quantity: 1000,
        unit_price: 100,
        total_price: 100000,
        specifications: {
          size: '100x150mm',
          material: 'PET/AL/PE',
          thickness: '100μm',
        },
      },
    ]);

  if (itemsError) {
    console.error('  ✗ Failed to add items:', itemsError.message);
  } else {
    console.log('  ✓ Added 1 order item');
  }

  return data;
}

async function createTestSampleRequest() {
  console.log('Creating test sample request...');

  const { data, error } = await supabase
    .from('sample_requests')
    .insert({
      user_id: TEST_USER_ID,
      request_number: `SR-${Date.now()}`,
      status: 'received',
      notes: 'テストサンプル依頼',
    })
    .select()
    .single();

  if (error) {
    console.error('  ✗ Failed:', error.message);
    return null;
  }

  console.log(`  ✓ Created: ${data.request_number}`);

  // Add sample items
  const { error: itemsError } = await supabase
    .from('sample_items')
    .insert([
      {
        sample_request_id: data.id,
        product_id: 'stand-pouch-001',
        product_name: 'スタンドパウチ (三方止め)',
        category: 'COSMETICS',
        quantity: 1,
      },
    ]);

  if (itemsError) {
    console.error('  ✗ Failed to add items:', itemsError.message);
  } else {
    console.log('  ✓ Added 1 sample item');
  }

  return data;
}

async function createTestInquiry() {
  console.log('Creating test inquiry...');

  const { data, error } = await supabase
    .from('inquiries')
    .insert({
      user_id: TEST_USER_ID,
      inquiry_number: `INQ-${Date.now()}`,
      type: 'general',
      status: 'open',
      subject: 'テストお問い合わせ',
      message: 'これはテスト用のお問い合わせです。',
      customer_name: '山田太郎',
      customer_name_kana: 'やまだたろう',
      email: 'member@test.com',
      phone: '090-1234-5678',
      privacy_consent: true,
    })
    .select()
    .single();

  if (error) {
    console.error('  ✗ Failed:', error.message);
    return null;
  }

  console.log(`  ✓ Created: ${data.inquiry_number}`);

  return data;
}

async function main() {
  console.log('\n🧪 Creating Test Data for Member Portal\n');

  // Create test data
  const quotation = await createTestQuotation();
  const order = await createTestOrder();
  const sample = await createTestSampleRequest();
  const inquiry = await createTestInquiry();

  console.log('\n=== Test Data Created ===\n');

  console.log('Summary:');
  console.log(`  Quotations: ${quotation ? 1 : 0} created`);
  console.log(`  Orders: ${order ? 1 : 0} created`);
  console.log(`  Sample Requests: ${sample ? 1 : 0} created`);
  console.log(`  Inquiries: ${inquiry ? 1 : 0} created`);

  if (quotation) {
    console.log(`\nQuotation ID: ${quotation.id}`);
    console.log(`  URL: /member/quotations/${quotation.id}`);
  }

  if (order) {
    console.log(`\nOrder ID: ${order.id}`);
    console.log(`  URL: /member/orders/${order.id}`);
  }

  console.log('\n✓ Test data ready for comprehensive testing\n');
}

main().catch(console.error);
