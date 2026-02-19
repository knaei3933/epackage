export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  // Try with service role first (bypasses auth)
  const serviceClient = createServiceClient();

  try {
    // Try to insert a test record with a fake order_id
    // This will fail with foreign key constraint if order doesn't exist
    // but will tell us if the table exists
    const { data: insertResult, error: insertError } = await serviceClient
      .from('files')
      .select('id')
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      tableExists: !insertError || insertError.code !== '42P01', // 42P01 = relation does not exist
      error: insertError ? {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details
      } : null,
      sampleData: insertResult
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
