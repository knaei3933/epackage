/**
 * Admin Samples List API
 *
 * GET /api/admin/samples - サンプル依頼一覧（宛先 + ラベル印刷状態付き）
 *
 * SECURITY:
 * - withAdminAuth で ADMIN ロール + ACTIVE を必須化（第一防御線）
 * - データ取得は service_role client（RLS 第一防御線の補完）
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { withAdminAuth } from '@/lib/api-auth';
import {
  transformSampleRequestRow,
  type SampleRequestListRow,
} from '@/lib/admin/sample-labels';

interface DestinationRow {
  id: string;
  company_name: string | null;
  contact_person: string;
  postal_code: string | null;
  address: string;
  label_prints: { status: string }[] | null;
}

type ListResponse = { items: ReturnType<typeof transformSampleRequestRow>[] } | { error: string };

export const GET = withAdminAuth<ListResponse>(async () => {
  const supabase = createServiceClient();

  const { data: requests, error } = await (supabase as any)
    .from('sample_requests')
    .select(
      `id, request_number, created_at, status, user_id,
       destinations:sample_request_destinations(
         id, company_name, contact_person, postal_code, address,
         label_prints(status)
       )`
    )
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[Admin Samples API] fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch sample requests' }, { status: 500 });
  }

  const rows = (requests ?? []) as (SampleRequestListRow & {
    destinations: DestinationRow[] | null;
  })[];

  // メンバー名は profiles を別途取得（sample_requests.user_id は auth.users 参照のため embed 不可）
  const userIds = [...new Set(rows.map((r) => r.user_id).filter((v): v is string => Boolean(v)))];
  const nameMap = new Map<string, string>();
  let profilesLookupFailed = false;
  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await (supabase as any)
      .from('profiles')
      .select('id, kanji_last_name, kanji_first_name')
      .in('id', userIds);
    if (profilesError) {
      // MINOR fix: log lookup failures instead of silently showing guests
      console.error('[Admin Samples API] profiles fetch error:', profilesError);
      profilesLookupFailed = true;
    }
    for (const p of profiles ?? []) {
      nameMap.set(
        p.id,
        [p.kanji_last_name, p.kanji_first_name].filter(Boolean).join(' ')
      );
    }
  }

  const items = rows.map((row) =>
    transformSampleRequestRow(
      row,
      row.user_id ? nameMap.get(row.user_id) ?? null : null
    )
  );

  return NextResponse.json({ items, profilesLookupFailed });
});
