/**
 * Apply SQL via Supabase Management API
 *
 * Uses Supabase Management API to execute SQL in the database
 */

import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Extract project ref from URL
const projectRef = supabaseUrl?.split('//')[1];

const SQL = `DROP FUNCTION IF EXISTS create_sample_request_transaction CASCADE;

CREATE OR REPLACE FUNCTION create_sample_request_transaction(
  p_user_id UUID DEFAULT NULL,
  p_request_number VARCHAR(50) DEFAULT NULL,
  p_notes TEXT,
  p_sample_items JSONB
)
RETURNS TABLE (
  success BOOLEAN,
  sample_request_id UUID,
  request_number VARCHAR(50),
  items_created INTEGER,
  error_message TEXT
)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_new_request_id UUID;
  v_final_request_number VARCHAR(50);
  v_items_count INTEGER;
BEGIN
  success := false;
  sample_request_id := NULL;
  request_number := NULL;
  items_created := 0;
  error_message := NULL;

  IF p_sample_items IS NULL OR jsonb_array_length(p_sample_items) = 0 THEN
    error_message := '少なくとも1つのサンプルを選択してください';
    RETURN NEXT;
    RETURN;
  END IF;

  IF jsonb_array_length(p_sample_items) > 5 THEN
    error_message := 'サンプルは最大5点までです';
    RETURN NEXT;
    RETURN;
  END IF;

  IF p_request_number IS NULL OR p_request_number = '' THEN
    v_final_request_number := 'SMP-' || TO_TIMESTAMP(NOW())::TEXT || '-' || UPPER(SUBSTR(ENCODE(GEN_RANDOM_BYTES(2), 'HEX'), 1, 4));
  ELSE
    v_final_request_number := p_request_number;
  END IF;

  BEGIN
    INSERT INTO sample_requests (
      user_id, request_number, status, delivery_address_id,
      tracking_number, notes, shipped_at, created_at
    ) VALUES (
      p_user_id, v_final_request_number, 'received', NULL,
      NULL, p_notes, NULL, NOW()
    ) RETURNING id INTO v_new_request_id;

    IF v_new_request_id IS NULL THEN
      RAISE EXCEPTION 'Failed to create sample request';
    END IF;

    INSERT INTO sample_items (
      sample_request_id, product_id, product_name, category, quantity
    )
    SELECT
      v_new_request_id,
      (item->>'productId')::UUID,
      item->>'productName',
      COALESCE(item->>'productCategory', 'other'),
      (item->>'quantity')::INTEGER
    FROM jsonb_array_elements(p_sample_items) AS item;

    SELECT COUNT(*) INTO v_items_count
    FROM sample_items
    WHERE sample_request_id = v_new_request_id;

    IF v_items_count = 0 THEN
      RAISE EXCEPTION 'No sample items were created';
    END IF;

    success := true;
    sample_request_id := v_new_request_id;
    request_number := v_final_request_number;
    items_created := v_items_count;

  EXCEPTION
    WHEN OTHERS THEN
      success := false;
      sample_request_id := NULL;
      request_number := NULL;
      items_created := 0;
      error_message := SQLERRM;
      RAISE WARNING 'create_sample_request_transaction failed: %', SQLERRM;
      RETURN NEXT;
      RETURN;
  END;

  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION create_sample_request_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION create_sample_request_transaction TO service_role;
GRANT EXECUTE ON FUNCTION create_sample_request_transaction TO anon;`;

async function applySQLViaAPI() {
  console.log('=== Applying SQL via Supabase API ===\n');

  // Try using PostgREST /rpc endpoint with sql query
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey!,
      'Authorization': `Bearer ${serviceRoleKey}`
    },
    body: JSON.stringify({ sql: SQL })
  });

  const result = await response.json();

  if (response.ok) {
    console.log('✓ SQL executed successfully');
    console.log('Result:', result);
  } else {
    console.log('✗ API Error:', response.status, result);

    // Try alternative: Use pg_catalog.execute_sql
    console.log('\nTrying alternative method...');
    const response2 = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey!,
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({ query: SQL })
    });

    const result2 = await response2.json();

    if (response2.ok) {
      console.log('✓ SQL executed successfully via alternative method');
      console.log('Result:', result2);
    } else {
      console.log('✗ Alternative method also failed:', response2.status, result2);
      console.log('\nPlease run the SQL manually in Supabase SQL Editor:');
      console.log(`https://supabase.com/dashboard/project/${projectRef}/sql`);
    }
  }
}

applySQLViaAPI().catch(console.error);
