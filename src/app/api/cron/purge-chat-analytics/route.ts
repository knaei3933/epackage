import { NextRequest, NextResponse } from 'next/server';
import { purgeExpiredChatAnalytics } from '@/lib/chat/chat-analytics';

export const dynamic = 'force-dynamic';

const authorize = (request: NextRequest): boolean => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return process.env.NODE_ENV !== 'production';
  }
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

  const result = await purgeExpiredChatAnalytics();
  if (!result) {
    return NextResponse.json(
      { success: false, error: 'Chat analytics purge failed' },
      {
        status: 503,
        headers: { 'Cache-Control': 'private, no-store' },
      },
    );
  }

  return NextResponse.json(
    {
      success: true,
      deletedEvents: result.deletedEvents,
      deletedSessions: result.deletedSessions,
      cutoff: result.cutoff,
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
};

export async function GET(request: NextRequest) {
  return run(request);
}

export async function POST(request: NextRequest) {
  return run(request);
}
