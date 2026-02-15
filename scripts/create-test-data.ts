/**
 * Create Test Data for E2E Testing
 *
 * This script inserts mock data into Supabase for testing:
 * - Orders with order items
 * - Quotations with quotation items
 * - Sample requests
 * - Contact submissions (inquiries)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test user email - this should match the user in the system
const TEST_USER_EMAIL = 'test-member@example.com';

async function getUserId() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Error fetching users:', error);
    return null;
  }

  const testUser = users.find(u => u.email === TEST_USER_EMAIL);

  if (!testUser) {
    console.error(`Test user ${TEST_USER_EMAIL} not found`);
    return null;
  }

  console.log(`Found test user: ${testUser.id}`);
  return testUser.id;
}

async function createTestData() {
  console.log('Starting test data creation...');

  const userId = await getUserId();
  if (!userId) {
    console.error('Cannot proceed without valid user ID');
    return;
  }

  // 1. Create Orders
  console.log('Creating orders...');

  const orders = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      user_id: userId,
      order_number: 'ORD-TEST-001',
      status: 'manufacturing',
      total_amount: 150000,
      notes: 'テスト注文1',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      user_id: userId,
      order_number: 'ORD-TEST-002',
      status: 'processing',
      total_amount: 280000,
      notes: 'テスト注文2',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      user_id: userId,
      order_number: 'ORD-TEST-003',
      status: 'delivered',
      total_amount: 95000,
      notes: 'テスト注文3',
      delivered_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  for (const order of orders) {
    const { error } = await supabase
      .from('orders')
      .upsert(order, { onConflict: 'order_number' });

    if (error) {
      console.error(`Error creating order ${order.order_number}:`, error);
    } else {
      console.log(`✓ Created order ${order.order_number}`);
    }
  }

  // Create Order Items
  const orderItems = [
    {
      order_id: '550e8400-e29b-41d4-a716-446655440001',
      product_name: '化粧箱 A4サイズ',
      quantity: 100,
      unit_price: 1500,
      specifications: { size: 'A4', material: '紙製' }
    },
    {
      order_id: '550e8400-e29b-41d4-a716-446655440002',
      product_name: '段ボール箱',
      quantity: 200,
      unit_price: 1400,
      specifications: { size: '30x20x10', material: '段ボール' }
    },
    {
      order_id: '550e8400-e29b-41d4-a716-446655440003',
      product_name: '透明パッケージ',
      quantity: 50,
      unit_price: 1900,
      specifications: { size: 'カスタム', material: 'PET' }
    }
  ];

  for (const item of orderItems) {
    const { error } = await supabase
      .from('order_items')
      .insert(item);

    if (error) {
      console.error(`Error creating order item:`, error);
    } else {
      console.log(`✓ Created order item for ${item.product_name}`);
    }
  }

  // 2. Create Quotations
  console.log('Creating quotations...');

  const quotations = [
    {
      id: '660e8400-e29b-41d4-a716-446655440001',
      user_id: userId,
      quotation_number: 'Q-TEST-001',
      status: 'approved',
      total_amount: 150000,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      approved_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440002',
      user_id: userId,
      quotation_number: 'Q-TEST-002',
      status: 'sent',
      total_amount: 280000,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      sent_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  for (const quote of quotations) {
    const { error } = await supabase
      .from('quotations')
      .upsert(quote, { onConflict: 'quotation_number' });

    if (error) {
      console.error(`Error creating quotation ${quote.quotation_number}:`, error);
    } else {
      console.log(`✓ Created quotation ${quote.quotation_number}`);
    }
  }

  // Create Quotation Items
  const quotationItems = [
    {
      quotation_id: '660e8400-e29b-41d4-a716-446655440001',
      product_name: 'スタンドパウチ',
      quantity: 500,
      unit_price: 300,
      specifications: { size: '200x300', material: 'CPP' }
    },
    {
      quotation_id: '660e8400-e29b-41d4-a716-446655440002',
      product_name: 'チャック付き袋',
      quantity: 1000,
      unit_price: 280,
      specifications: { size: '250x350', material: 'PE' }
    }
  ];

  for (const item of quotationItems) {
    const { error } = await supabase
      .from('quotation_items')
      .insert(item);

    if (error) {
      console.error(`Error creating quotation item:`, error);
    } else {
      console.log(`✓ Created quotation item for ${item.product_name}`);
    }
  }

  // 3. Create Sample Requests
  console.log('Creating sample requests...');

  const sampleRequests = [
    {
      id: '770e8400-e29b-41d4-a716-446655440001',
      user_id: userId,
      request_number: 'S-TEST-001',
      status: 'received',
      notes: 'ソフトパウチのサンプルを希望',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440002',
      user_id: userId,
      request_number: 'S-TEST-002',
      status: 'processing',
      notes: 'スタンドパウチのサンプルを希望',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  for (const sample of sampleRequests) {
    const { error } = await supabase
      .from('sample_requests')
      .upsert(sample, { onConflict: 'request_number' });

    if (error) {
      console.error(`Error creating sample request ${sample.request_number}:`, error);
    } else {
      console.log(`✓ Created sample request ${sample.request_number}`);
    }
  }

  // 4. Create Contact Submissions (Inquiries)
  console.log('Creating contact submissions...');

  const contactSubmissions = [
    {
      id: '880e8400-e29b-41d4-a716-446655440001',
      name: 'テストユーザー',
      email: 'test-member@example.com',
      phone: '080-6942-7235',
      company: 'テスト株式会社',
      inquiry_type: 'quotation',
      message: '化粧箱の見積もりについてご相談があります',
      status: 'new',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440002',
      name: 'テストユーザー',
      email: 'test-member@example.com',
      phone: '080-6942-7235',
      company: 'テスト株式会社',
      inquiry_type: 'product',
      message: '段ボール箱の耐荷重について教えてください',
      status: 'replied',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  for (const contact of contactSubmissions) {
    const { error } = await supabase
      .from('contact_submissions')
      .upsert(contact);

    if (error) {
      console.error(`Error creating contact submission:`, error);
    } else {
      console.log(`✓ Created contact submission`);
    }
  }

  console.log('\n✓ Test data creation complete!');
  console.log('Summary:');
  console.log('  - 3 orders with items');
  console.log('  - 2 quotations with items');
  console.log('  - 2 sample requests');
  console.log('  - 2 contact submissions');
}

createTestData().catch(console.error);
