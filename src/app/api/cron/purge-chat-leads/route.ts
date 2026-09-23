/**
 * Chat Lead Purge Cron
 *
 * リードデータ保持期間経過後の自動redaction/delete
 * Uses purge_expired_chat_lead_data RPC (readiness-controlled retention).
 */

import { NextRequest, NextResponse } from 'next/server';
import { purgeExpiredChatLeadData } from '@/lib/chat/lead-purge';

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

  const result = await purgeExpiredChatLeadData();
  if (!result) {
    return NextResponse.json(
      { success: false, error: 'Chat lead purge failed' },
      { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }

  return NextResponse.json(
    {
      success: true,
      redactedContacts: result.redactedContacts,
      deletedLeads: result.deletedLeads,
      deletedAuditEvents: result.deletedAuditEvents,
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
};

export async function GET(request: NextRequest) {
  return run(request);
}
