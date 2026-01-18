/**
 * Check Remote Database Tables
 *
 * This script checks what tables exist in the remote Supabase database
 * and verifies if sample_requests and sample_items exist.
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

async function checkTables() {
  console.log('=== Checking Remote Database Tables ===\n');

  // Method 1: Try to query sample_requests directly
  console.log('1. Checking sample_requests table...');
  const { data: requestsData, error: requestsError } = await supabase
    .from('sample_requests')
    .select('id')
    .limit(1);

  if (requestsError) {
    console.log('   ✗ sample_requests table DOES NOT EXIST');
    console.log('   Error:', requestsError.message);
    console.log('   Code:', requestsError.code);
    console.log('   Details:', requestsError.details);
    console.log('   Hint:', requestsError.hint);
  } else {
    console.log('   ✓ sample_requests table EXISTS');
    console.log('   Records:', requestsData?.length || 0);
  }

  // Method 2: Try to query sample_items directly
  console.log('\n2. Checking sample_items table...');
  const { data: itemsData, error: itemsError } = await supabase
    .from('sample_items')
    .select('id')
    .limit(1);

  if (itemsError) {
    console.log('   ✗ sample_items table DOES NOT EXIST');
    console.log('   Error:', itemsError.message);
    console.log('   Code:', itemsError.code);
  } else {
    console.log('   ✓ sample_items table EXISTS');
    console.log('   Records:', itemsData?.length || 0);
  }

  // Method 3: Check if RPC function exists
  console.log('\n3. Checking RPC function create_sample_request_transaction...');

  // Try calling the RPC function with minimal parameters
  const { data: rpcData, error: rpcError } = await supabase.rpc('create_sample_request_transaction', {
    p_user_id: null,
    p_request_number: 'TEST-' + Date.now(),
    p_notes: 'Test',
    p_sample_items: [{ productId: null, productName: 'Test', productCategory: 'other', quantity: 1 }]
  });

  if (rpcError) {
    console.log('   ✗ RPC function error:', rpcError.message);
    console.log('   This could mean:');
    console.log('     - The function does not exist');
    console.log('     - The tables it references do not exist');
    console.log('     - There is a permissions issue');
  } else {
    console.log('   ✓ RPC function exists and executed');
    console.log('   Result:', rpcData);
  }

  console.log('\n=== Done ===');
}

checkTables().catch(console.error);
