import { NextRequest, NextResponse } from 'next/server';
import { getChatLeadCapability } from '@/lib/chat/lead-capture';
import {
  resolveChatParticipantStrict,
  type StrictChatParticipantResolution,
} from '@/lib/chat/participant-context';

export const dynamic = 'force-dynamic';

const hasMatchingOrigin = (request: NextRequest): boolean => {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).origin === request.nextUrl.origin;
  } catch {
    return false;
  }
};

const serviceUnavailable = () => NextResponse.json(
  {
    error: 'この機能は現在利用できません。',
    reasonCode: 'lead_capture_disabled',
  },
  {
    status: 503,
    headers: { 'Cache-Control': 'private, no-store' },
  },
);

const forbidden = () => NextResponse.json(
  { error: 'リクエスト元が不正です' },
  { status: 403 },
);

export async function POST(req: NextRequest) {
  if (!hasMatchingOrigin(req)) {
    return forbidden();
  }

  // Privacy gate is evaluated before any body access or parsing. The capability
  // currently has no enabled path and remains false in every environment.
  if (!(await getChatLeadCapability()).enabled) {
    return serviceUnavailable();
  }

  const participant: StrictChatParticipantResolution =
    await resolveChatParticipantStrict(req);
  if (participant.status === 'infrastructure-error') {
    return serviceUnavailable();
  }
  if (
    participant.status === 'active' &&
    (participant.role === 'ADMIN' ||
      participant.role === 'OPERATOR' ||
      participant.role === 'SALES' ||
      participant.role === 'KOREA_DESIGNER')
  ) {
    return NextResponse.json(
      { error: 'このアカウントでは利用できません。' },
      { status: 403 },
    );
  }

  // No persistence path is enabled. This unreachable guard prevents accidental
  // future body ingestion until the reviewed RPC/limiter/readiness milestones
  // are implemented and tested.
  return serviceUnavailable();
}
