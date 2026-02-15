/**
 * Create Test User and Test Data for E2E Testing
 *
 * This script:
 * 1. Creates a test user using Supabase Auth Admin API
 * 2. Inserts mock data for testing
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
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test user credentials
const TEST_USER = {
  email: 'test-member@example.com',
  password: 'Test1234!',
  firstName: 'テスト',
  lastName: 'ユーザー',
  kanaFirstName: 'ゆーざー',
  kanaLastName: 'てすと',
  company: 'テスト株式会社'
};

async function createTestUser() {
  console.log('Creating test user...');

  // Try to create user with auth.admin API
  const { data: { user }, error } = await supabase.auth.admin.createUser({
    email: TEST_USER.email,
    password: TEST_USER.password,
    email_confirm: true,
    user_metadata: {
      firstName: TEST_USER.firstName,
      lastName: TEST_USER.lastName,
      kanaFirstName: TEST_USER.kanaFirstName,
      kanaLastName: TEST_USER.kanaLastName,
      company: TEST_USER.company
    }
  });

  if (error) {
    // User might already exist, try to get existing user
    console.log('User might already exist, trying to fetch...');
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const existingUser = users?.find(u => u.email === TEST_USER.email);

    if (existingUser) {
      console.log(`✓ Using existing user: ${existingUser.id}`);
      return existingUser.id;
    }

    console.error('Error creating user:', error);
    return null;
  }

  console.log(`✓ Created test user: ${user.id}`);

  // Create profile record
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      first_name: TEST_USER.firstName,
      last_name: TEST_USER.lastName,
      kana_first_name: TEST_USER.kanaFirstName,
      kana_last_name: TEST_USER.kanaLastName,
      company_name: TEST_USER.company,
      email: TEST_USER.email
    });

  if (profileError) {
    console.error('Error creating profile:', profileError);
  } else {
    console.log('✓ Created profile');
  }

  return user.id;
}

async function createTestData(userId: string) {
  console.log('\nCreating test data...');

  // 1. Create Orders
  console.log('Creating orders...');

  const orders = [
    {
      id: crypto.randomUUID(),
      user_id: userId,
      order_number: 'ORD-TEST-001',
      status: 'manufacturing',
      total_amount: 150000,
      notes: 'テスト注文1',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      order_number: 'ORD-TEST-002',
      status: 'processing',
      total_amount: 280000,
      notes: 'テスト注文2',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: crypto.randomUUID(),
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
      order_id: orders[0].id,
      product_name: '化粧箱 A4サイズ',
      quantity: 100,
      unit_price: 1500,
      specifications: { size: 'A4', material: '紙製' }
    },
    {
      order_id: orders[1].id,
      product_name: '段ボール箱',
      quantity: 200,
      unit_price: 1400,
      specifications: { size: '30x20x10', material: '段ボール' }
    },
    {
      order_id: orders[2].id,
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
      id: crypto.randomUUID(),
      user_id: userId,
      quotation_number: 'Q-TEST-001',
      status: 'approved',
      total_amount: 150000,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      approved_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: crypto.randomUUID(),
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
      quotation_id: quotations[0].id,
      product_name: 'スタンドパウチ',
      quantity: 500,
      unit_price: 300,
      specifications: { size: '200x300', material: 'CPP' }
    },
    {
      quotation_id: quotations[1].id,
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
      id: crypto.randomUUID(),
      user_id: userId,
      request_number: 'S-TEST-001',
      status: 'received',
      notes: 'ソフトパウチのサンプルを希望',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
      name: `${TEST_USER.lastName} ${TEST_USER.firstName}`,
      email: TEST_USER.email,
      phone: '080-6942-7235',
      company: TEST_USER.company,
      inquiry_type: 'quotation',
      message: '化粧箱の見積もりについてご相談があります',
      status: 'new',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: `${TEST_USER.lastName} ${TEST_USER.firstName}`,
      email: TEST_USER.email,
      phone: '080-6942-7235',
      company: TEST_USER.company,
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
  console.log('\nYou can now login with:');
  console.log(`  Email: ${TEST_USER.email}`);
  console.log(`  Password: ${TEST_USER.password}`);
}

async function main() {
  console.log('=== E2E Test Data Creation ===\n');

  const userId = await createTestUser();

  if (!userId) {
    console.error('Failed to create/get test user');
    process.exit(1);
  }

  await createTestData(userId);
}

main().catch(console.error);
