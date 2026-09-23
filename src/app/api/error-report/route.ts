/**
 * POST /api/error-report — 클라이언트 에러 에어백 수신
 * Rate-limit·재귀방지는 lib/error-airbag 내부 처리
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendErrorAirbag } from '@/lib/error-airbag';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await sendErrorAirbag({
      digest: body.digest,
      message: String(body.message || 'unknown').slice(0, 300),
      stack: body.stack ? String(body.stack).slice(0, 3000) : undefined,
      url: body.url ? String(body.url).slice(0, 500) : undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      source: 'client',
    });
    return NextResponse.json({ ok: true, sent: result.sent });
  } catch {
    // 에어백 수신 실패는 200으로 — 클라이언트 재시도 유발하지 않음
    return NextResponse.json({ ok: false });
  }
}
