/**
 * Admin Sample Label Reprint API
 *
 * POST /api/admin/samples/[id]/reprint
 * - 指定サンプル依頼の全宛先に再印字ジョブ（label_prints: pending）を作成
 * - べき等（I3）: 既に pending の宛先はスキップ
 *
 * SECURITY:
 * - withAdminAuth で ADMIN ロール + ACTIVE を必須化
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { withAdminAuth } from '@/lib/api-auth';
import { buildReprintInserts, type DestinationPrintState } from '@/lib/admin/sample-labels';

export const POST = withAdminAuth<
  { success: boolean; created: number; skipped: number; message: string }
>(async (_request, auth, context) => {
  const params = await context?.params;
  const sampleRequestId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sampleRequestId)) {
    return NextResponse.json(
      { success: false, created: 0, skipped: 0, message: 'Invalid sample request id' },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  const { data: destinations, error } = await (supabase as any)
    .from('sample_request_destinations')
    .select('id, company_name, contact_person, postal_code, address, label_prints(status)')
    .eq('sample_request_id', sampleRequestId);

  if (error) {
    console.error('[Sample Reprint API] fetch error:', error);
    return NextResponse.json(
      { success: false, created: 0, skipped: 0, message: 'Failed to fetch destinations' },
      { status: 500 }
    );
  }

  const dests = (destinations ?? []) as DestinationPrintState[];
  if (dests.length === 0) {
    return NextResponse.json(
      { success: false, created: 0, skipped: 0, message: 'Sample request not found' },
      { status: 404 }
    );
  }

  const { inserts, skipped } = buildReprintInserts(dests, auth.userId);
  let created = 0;
  let skippedDuringInsert = 0;

  for (const insert of inserts) {
    const { error: insertError } = await (supabase as any)
      .from('label_prints')
      .insert(insert);
    if (insertError) {
      // Unique pending violation = another worker enqueued first -> idempotent skip
      const isDuplicate =
        insertError.code === '23505' || /duplicate key/i.test(insertError.message ?? '');
      if (isDuplicate) {
        skippedDuringInsert += 1;
        continue;
      }
      console.error('[Sample Reprint API] insert error:', insertError);
      return NextResponse.json(
        { success: false, created, skipped, message: 'Failed to create print jobs' },
        { status: 500 }
      );
    }
    created += 1;
  }

  return NextResponse.json({
    success: true,
    created,
    skipped: skipped + skippedDuringInsert,
    message:
      created === 0
        ? '印刷待ちのジョブが既に存在します'
        : `${created}件の印刷ジョブを作成しました（エージェントが自動印刷します）`,
  });
});
