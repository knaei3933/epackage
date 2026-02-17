export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase-ssr';
import { createServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await getAuthenticatedUser(request);
  if (!authResult) {
    return NextResponse.json({ success: false, error: '認証が必要です', code: 'UNAUTHORIZED' }, { status: 401 });
  }
  const { id: userId } = authResult;
  const supabase = createServiceClient();
  const { data, error } = await supabase.from('profiles').select('markup_rate, markup_rate_note').eq('id', userId).maybeSingle();
  if (error) {
    return NextResponse.json({ success: true, data: { markupRate: 0.0, markupRateNote: null } }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache' }
    });
  }
  return NextResponse.json({ success: true, data: { markupRate: data?.markup_rate ?? 0.0, markupRateNote: data?.markup_rate_note ?? null } }, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache' }
  });
}
