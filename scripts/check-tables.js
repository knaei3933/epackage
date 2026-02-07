#!/usr/bin/env node
/**
 * Quick test script to check if order_comments table exists
 */

const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking if order_comments table exists...');

  // Try to query the table
  const { data, error } = await supabase
    .from('order_comments')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ order_comments table does NOT exist');
    console.error('Error:', error.message);
    console.error('\nYou need to run the SQL migration in Supabase SQL Editor:');
    console.error('https://supabase.com/dashboard/project/ijlgpzjdfipzmjvawofp/sql');
  } else {
    console.log('✅ order_comments table exists!');
    console.log('Data:', data);
  }

  console.log('\nChecking if customer_approval_requests table exists...');

  // Try to query the table
  const { data: data2, error: error2 } = await supabase
    .from('customer_approval_requests')
    .select('*')
    .limit(1);

  if (error2) {
    console.error('❌ customer_approval_requests table does NOT exist');
    console.error('Error:', error2.message);
  } else {
    console.log('✅ customer_approval_requests table exists!');
    console.log('Data:', data2);
  }
}

checkTables().catch(console.error);
