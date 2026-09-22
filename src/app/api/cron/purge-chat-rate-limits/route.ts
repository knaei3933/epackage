import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

export const dynamic = 'force-dynamic';

const authorize = (request: NextRequest): boolean => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return process.env.NODE_ENV !== 'production';
  return request.headers.get('authorization') === `Bearer ${cronSecret}`;
};

const run = async (request: NextRequest) => {
  if (!authorize(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      {
        status: process.env.CRON_SECRET ? 401 : 500,
        headers: { 'Cache-Control': 'private, no-store' },
      },
    );
  }

  try {
    const client = createAuthenticatedServiceClient({
      operation: 'purge_chat_rate_limits',
      route: '/api/cron/purge-chat-rate-limits',
    });
    const { data, error } = await client.rpc('purge_expired_chat_rate_limits', {
      p_batch_limit: 10000,
      p_maximum_rows: 100000,
    });
    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;
    return NextResponse.json(
      {
        success: true,
        deletedExpired: row?.deleted_expired ?? 0,
        deletedOverflow: row?.deleted_overflow ?? 0,
        remainingRows: row?.remaining_rows ?? 0,
        moreWorkRemaining: row?.more_work_remaining ?? false,
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Rate limit cleanup failed' },
      {
        status: 503,
        headers: { 'Cache-Control': 'private, no-store' },
      },
    );
  }
};

export async function GET(request: NextRequest) {
  return run(request);
}

export async function POST(request: NextRequest) {
  return run(request);
}
