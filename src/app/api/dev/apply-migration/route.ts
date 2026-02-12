/**
 * Development API: Apply Sample RPC Migration
 *
 * Temporary endpoint to fix the RPC function schema issue.
 * Remove after applying migration.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

const MIGRATION_SQL = `
-- Drop old function
DROP FUNCTION IF EXISTS create_sample_request_transaction CASCADE;

-- Create new function with SET search_path = public
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
GRANT EXECUTE ON FUNCTION create_sample_request_transaction TO anon;
`;

export async function POST(request: NextRequest) {
  // Security: Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  try {
    const supabase = createServiceClient();

    // Execute the migration SQL
    // Note: We can't execute DDL via RPC, so we need to use raw SQL
    // Use Postgres function execution
    const { data, error } = await supabase
      .rpc('exec_sql', { sql: MIGRATION_SQL });

    if (error) {
      // Try alternative method using direct query
      // This won't work for DDL, but provides more info
      return NextResponse.json({
        success: false,
        message: 'Cannot execute DDL via RPC',
        error: error.message,
        hint: 'Please run the SQL manually in Supabase SQL Editor',
        sql: MIGRATION_SQL
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Migration applied successfully'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      hint: 'DDL cannot be executed via API. Run SQL manually in Supabase SQL Editor.',
      sql: MIGRATION_SQL
    }, { status: 500 });
  }
}

// Provide the SQL for manual execution
export async function GET() {
  return NextResponse.json({
    message: 'SQL migration ready for manual execution',
    instructions: 'Run this SQL in Supabase SQL Editor: https://supabase.com/dashboard/project/ijlgpzjdfipzmjvawofp.supabase.co/sql',
    sql: MIGRATION_SQL
  });
}
