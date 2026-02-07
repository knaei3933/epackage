#!/usr/bin/env node
/**
 * Check test@test.com and member@test.com users
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

async function checkUsers() {
  const emails = ['test@test.com', 'member@test.com'];

  for (const email of emails) {
    console.log('\n========== ' + email + ' ==========');

    // Check profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError) {
      console.log('Profile: NOT FOUND');
    } else {
      console.log('Profile ID:', profile.id);
      console.log('Role:', profile.role);
      console.log('Status:', profile.status);
      console.log('Company:', profile.company_name);
      console.log('User Type:', profile.user_type);
    }

    // Check auth users
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (!authError && users) {
      const user = users.find(u => u.email === email);
      if (user) {
        console.log('Auth User ID:', user.id);
        console.log('Email Confirmed:', user.email_confirmed_at ? 'Yes' : 'No');
        console.log('Created At:', user.created_at);
        console.log('Last Sign In:', user.last_sign_in_at);
      } else {
        console.log('Auth User: NOT FOUND');
      }
    }
  }

  // Check order ownership
  const orderId = 'd64c4629-fc81-40c6-b7fe-ea5fa41226b6';
  console.log('\n========== Order: ' + orderId + ' ==========');

  const { data: order } = await supabase
    .from('orders')
    .select('id, user_id, customer_email, customer_name, current_state')
    .eq('id', orderId)
    .single();

  if (order) {
    console.log('Order User ID:', order.user_id);
    console.log('Order Customer Email:', order.customer_email);
    console.log('Order Customer Name:', order.customer_name);
    console.log('Order Current State:', order.current_state);

    // Find which email owns this order
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', order.user_id)
      .single();

    if (profile) {
      console.log('Order Owner Email:', profile.email);
      console.log('Order Owner Role:', profile.role);
    }
  } else {
    console.log('Order: NOT FOUND');
  }

  // Summary
  console.log('\n========== SUMMARY ==========');
  console.log('Both users will have ACCESS if:');
  console.log('1. They are the order owner (user_id matches)');
  console.log('2. OR they have ADMIN role');
}

checkUsers().catch(console.error);
