/**
 * Database Query Test Script
 * Tests RLS policies and data fetching after login
 *
 * Run: npx tsx scripts/test-rls-query.ts
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

// Test user ID (replace with actual user ID from your database)
const TEST_USER_ID = process.env.TEST_USER_ID || 'test-user-id'

console.log('🔍 Database Query Test')
console.log('=====================\n')

// =====================================================
// Test 1: Service Role Client (bypasses RLS)
// =====================================================
async function testServiceRoleQuery() {
  console.log('1️⃣ Testing Service Role Client (bypasses RLS)')
  console.log('----------------------------------------------')

  const serviceClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Test profiles table
    console.log('\n📊 Query 1: Profiles table')
    const { data: profiles, error: profilesError } = await serviceClient
      .from('profiles')
      .select('*')
      .eq('id', TEST_USER_ID)
      .maybeSingle()

    if (profilesError) {
      console.error('❌ Profiles query failed:', profilesError)
    } else {
      console.log('✅ Profiles query succeeded')
      console.log('   Profile found:', !!profiles)
      if (profiles) {
        console.log('   - Email:', profiles.email)
        console.log('   - Role:', profiles.role)
        console.log('   - Status:', profiles.status)
      }
    }

    // Test sample_requests with nested sample_items
    console.log('\n📦 Query 2: Sample requests with sample_items (nested)')
    const { data: samples, error: samplesError } = await serviceClient
      .from('sample_requests')
      .select('*, sample_items (*)')
      .eq('user_id', TEST_USER_ID)
      .limit(5)

    if (samplesError) {
      console.error('❌ Sample requests query failed:', samplesError)
    } else {
      console.log('✅ Sample requests query succeeded')
      console.log('   Total sample requests:', samples?.length || 0)

      if (samples && samples.length > 0) {
        samples.forEach((sample, index) => {
          console.log(`\n   Sample ${index + 1}:`)
          console.log('   - ID:', sample.id)
          console.log('   - Request Number:', sample.request_number)
          console.log('   - Status:', sample.status)
          console.log('   - Has sample_items:', 'sample_items' in sample)
          console.log('   - sample_items type:', typeof sample.sample_items)
          console.log('   - sample_items value:', sample.sample_items)

          // Check if sample_items is an array
          if (Array.isArray(sample.sample_items)) {
            console.log('   - sample_items length:', sample.sample_items.length)
          } else if (sample.sample_items === null) {
            console.log('   ⚠️  sample_items is NULL')
          } else if (sample.sample_items === undefined) {
            console.log('   ⚠️  sample_items is UNDEFINED')
          } else {
            console.log('   ⚠️  sample_items is unexpected type:', typeof sample.sample_items)
          }
        })
      }
    }

    // Test sample_items directly
    console.log('\n📦 Query 3: Sample items (direct query)')
    const { data: sampleItems, error: sampleItemsError } = await serviceClient
      .from('sample_items')
      .select('*')
      .limit(10)

    if (sampleItemsError) {
      console.error('❌ Sample items query failed:', sampleItemsError)
    } else {
      console.log('✅ Sample items query succeeded')
      console.log('   Total sample items:', sampleItems?.length || 0)
    }

    // Test RLS status
    console.log('\n🔒 Query 4: RLS Status Check')
    const { data: rlsStatus, error: rlsError } = await serviceClient
      .rpc('check_rls_status', { table_name: 'sample_requests' })

    if (rlsError) {
      console.log('⚠️  Could not check RLS status (function might not exist)')
    } else {
      console.log('RLS Status:', rlsStatus)
    }

  } catch (error) {
    console.error('❌ Service role query error:', error)
  }
}

// =====================================================
// Test 2: Anon Client with auth.uid() context
// =====================================================
async function testAnonClientQuery() {
  console.log('\n\n2️⃣ Testing Anon Client (with auth.uid() context)')
  console.log('------------------------------------------------')

  const anonClient = createClient<Database>(supabaseUrl, supabaseAnonKey)

  // Note: This will fail without proper auth context
  // But we can test the query structure

  try {
    console.log('\n📊 Query: Sample requests with sample_items (anon client)')
    const { data: samples, error: samplesError } = await anonClient
      .from('sample_requests')
      .select('*, sample_items (*)')
      .limit(5)

    if (samplesError) {
      console.error('❌ Query failed (expected without auth):', samplesError.message)
      console.log('   Error code:', samplesError.code)
    } else {
      console.log('✅ Query succeeded (unexpected - might have public data)')
      console.log('   Results:', samples?.length || 0)
    }
  } catch (error) {
    console.error('❌ Anon client error:', error)
  }
}

// =====================================================
// Test 3: Verify RLS Policies
// =====================================================
async function testRLSPolicies() {
  console.log('\n\n3️⃣ Verifying RLS Policies')
  console.log('-------------------------')

  const serviceClient = createClient<Database>(supabaseUrl, supabaseServiceKey)

  try {
    // Check if RLS is enabled
    const { data: rlsEnabled, error: rlsError } = await serviceClient
      .rpc('check_rls_enabled', { table_name: 'sample_requests' })

    if (rlsError) {
      console.log('⚠️  Could not check RLS enabled status')
    } else {
      console.log('RLS Enabled on sample_requests:', rlsEnabled)
    }

    // List RLS policies
    console.log('\n📋 RLS Policies for sample_requests:')
    const { data: policies, error: policiesError } = await serviceClient
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'sample_requests')

    if (policiesError) {
      console.log('⚠️  Could not list policies')
    } else {
      console.log('Found policies:', policies?.length || 0)
    }

  } catch (error) {
    console.error('❌ RLS verification error:', error)
  }
}

// =====================================================
// Run all tests
// =====================================================
async function runTests() {
  console.log('Test User ID:', TEST_USER_ID)
  console.log('Supabase URL:', supabaseUrl)
  console.log('')

  await testServiceRoleQuery()
  await testAnonClientQuery()
  await testRLSPolicies()

  console.log('\n\n✅ Test suite completed')
}

runTests().catch(console.error)
