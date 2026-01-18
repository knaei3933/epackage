/**
 * Check and Create Sample Tables
 *
 * This script checks if sample_requests and sample_items tables exist,
 * and creates them if they don't exist.
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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkAndCreateTables() {
  console.log('=== Checking Sample Tables ===\n');

  // Check sample_requests table
  console.log('1. Checking sample_requests table...');
  const { data: requestsData, error: requestsError } = await supabase
    .from('sample_requests')
    .select('id')
    .limit(1);

  if (requestsError) {
    console.log('   ✗ sample_requests table DOES NOT EXIST');
    console.log('   Error:', requestsError.message);
    console.log('\n   Creating sample_requests table...');

    // Create sample_requests table using SQL
    const createRequestsSQL = `
      CREATE TABLE IF NOT EXISTS sample_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        request_number VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_name_kana VARCHAR(255),
        company_name VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        fax VARCHAR(50),
        postal_code VARCHAR(20),
        prefecture VARCHAR(50),
        city VARCHAR(100),
        street VARCHAR(255),
        building VARCHAR(255),
        delivery_type VARCHAR(20) NOT NULL DEFAULT 'normal',
        delivery_address TEXT,
        notes TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_sample_requests_user_id ON sample_requests(user_id);
      CREATE INDEX IF NOT EXISTS idx_sample_requests_status ON sample_requests(status);
      CREATE INDEX IF NOT EXISTS idx_sample_requests_created_at ON sample_requests(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_sample_requests_request_number ON sample_requests(request_number);

      -- Enable RLS
      ALTER TABLE sample_requests ENABLE ROW LEVEL SECURITY;

      -- RLS Policies
      CREATE POLICY "Service role full access sample_requests"
        ON sample_requests FOR ALL
        TO service_role
        USING (true) WITH CHECK (true);

      CREATE POLICY "Users can view own sample_requests"
        ON sample_requests FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);

      CREATE POLICY "Users can create own sample_requests"
        ON sample_requests FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);

      -- Trigger for updated_at
      CREATE OR REPLACE TRIGGER update_sample_requests_updated_at
        BEFORE UPDATE ON sample_requests
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

    const { error: createError } = await supabase.rpc('exec_sql', { sql: createRequestsSQL });
    if (createError) {
      console.log('   ✗ Failed to create table:', createError.message);
      console.log('   Trying alternative method...');

      // Try using raw SQL execution
      console.log('\n   Please run this SQL manually in Supabase SQL Editor:');
      console.log('   https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1] + '/sql');
      console.log('\n' + createRequestsSQL);
    } else {
      console.log('   ✓ sample_requests table created successfully');
    }
  } else {
    console.log('   ✓ sample_requests table EXISTS');
    console.log('   Records:', requestsData?.length || 0);
  }

  // Check sample_items table
  console.log('\n2. Checking sample_items table...');
  const { data: itemsData, error: itemsError } = await supabase
    .from('sample_items')
    .select('id')
    .limit(1);

  if (itemsError) {
    console.log('   ✗ sample_items table DOES NOT EXIST');
    console.log('   Error:', itemsError.message);
    console.log('\n   Creating sample_items table...');

    // Create sample_items table
    const createItemsSQL = `
      CREATE TABLE IF NOT EXISTS sample_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sample_request_id UUID NOT NULL REFERENCES sample_requests(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE SET NULL,
        product_name VARCHAR(255) NOT NULL,
        product_category VARCHAR(100),
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        specifications JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_sample_items_sample_request_id ON sample_items(sample_request_id);
      CREATE INDEX IF NOT EXISTS idx_sample_items_product_id ON sample_items(product_id);

      -- Enable RLS
      ALTER TABLE sample_items ENABLE ROW LEVEL SECURITY;

      -- RLS Policies
      CREATE POLICY "Service role full access sample_items"
        ON sample_items FOR ALL
        TO service_role
        USING (true) WITH CHECK (true);

      CREATE POLICY "Users can view items of own sample_requests"
        ON sample_items FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM sample_requests sr
            WHERE sr.id = sample_items.sample_request_id
              AND sr.user_id = auth.uid()
          )
        );
    `;

    const { error: createItemsError } = await supabase.rpc('exec_sql', { sql: createItemsSQL });
    if (createItemsError) {
      console.log('   ✗ Failed to create table:', createItemsError.message);
      console.log('\n   Please run this SQL manually in Supabase SQL Editor:');
      console.log('   https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1] + '/sql');
      console.log('\n' + createItemsSQL);
    } else {
      console.log('   ✓ sample_items table created successfully');
    }
  } else {
    console.log('   ✓ sample_items table EXISTS');
    console.log('   Records:', itemsData?.length || 0);
  }

  console.log('\n=== Done ===');
}

checkAndCreateTables().catch(console.error);
