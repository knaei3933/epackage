import { NextRequest, NextResponse } from 'next/server';
import { getChatLeadCapability } from '@/lib/chat/lead-capture';
import {
  resolveChatParticipantStrict,
  type StrictChatParticipantResolution,
} from '@/lib/chat/participant-context';
import {
  validateChatLeadSubmission,
} from '@/lib/chat/lead-schema';
import {
  checkChatLeadRateLimit,
  submitChatLead,
} from '@/lib/chat/lead-server';
import { parseChatPageContext } from '@/lib/chat/page-context';
import { recordChatFunnelEvents } from '@/lib/chat/chat-analytics';

export const dynamic = 'force-dynamic';

const MAX_LEAD_REQUEST_BYTES = 16 * 1024;

const hasMatchingOrigin = (request: NextRequest): boolean => {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).origin === request.nextUrl.origin;
  } catch {
    return false;
  }
};

const disabled = () => NextResponse.json(
  {
    error: 'この機能は現在利用できません。',
    reasonCode: 'lead_capture_disabled',
  },
  {
    status: 503,
    headers: { 'Cache-Control': 'private, no-store' },
  },
);

const badRequest = (reasonCode: string) => NextResponse.json(
  {
    error: 'リクエスト形式が正しくありません',
    reasonCode,
  },
  { status: 400 },
);

const forbidden = () => NextResponse.json(
  { error: 'リクエスト元が不正です' },
  { status: 403 },
);

const serverError = () => NextResponse.json(
  {
    error: 'ただいま保存できません。しばらく待ってから再試行してください。',
    reasonCode: 'lead_save_unavailable',
  },
  {
    status: 503,
    headers: { 'Cache-Control': 'private, no-store' },
  },
);

async function readJsonWithByteLimit(
  request: NextRequest,
  maximumBytes: number,
): Promise<unknown> {
  const declaredLength = Number(request.headers.get('content-length'));
  if (
    !Number.isSafeInteger(declaredLength) || declaredLength < 0 ||
    declaredLength > maximumBytes
  ) {
    throw new Error('request-too-large');
  }
  if (!request.body) throw new Error('empty-body');

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    received += value.byteLength;
    if (received > maximumBytes) throw new Error('request-too-large');
    chunks.push(value);
  }

  const decoder = new TextDecoder();
  return JSON.parse(chunks.reduce(
    (body, chunk) => body + decoder.decode(chunk, { stream: true }),
    '',
  ) + decoder.decode());
}

export async function POST(req: NextRequest) {
  if (!hasMatchingOrigin(req)) return forbidden();

  // Privacy/capability gate runs before participant resolution, rate limiting,
  // and any request-body access. Production remains disabled by default.
  const capability = await getChatLeadCapability();
  if (!capability.enabled) return disabled();

  const participant: StrictChatParticipantResolution =
    await resolveChatParticipantStrict(req);

  if (participant.status === 'infrastructure-error') return serverError();
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

  const memberUserId = participant.status === 'active' && participant.role === 'MEMBER'
    ? participant.userId
    : undefined;
  const forwardedFor = req.headers.get('x-vercel-forwarded-for') ??
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for') ??
    '';
  const rateLimit = await checkChatLeadRateLimit({
    memberUserId,
    sessionId: 'pending-request',
    forwardedFor,
  });
  if (!rateLimit?.allowed) return serverError();

  let body: unknown;
  try {
    body = await readJsonWithByteLimit(req, MAX_LEAD_REQUEST_BYTES);
  } catch (error) {
    const reason = error instanceof Error && error.message === 'request-too-large'
      ? 'request-too-large'
      : 'malformed';
    return badRequest(reason);
  }

  const validatedLead = validateChatLeadSubmission(body);
  if (!validatedLead.success) {
    const failure = validatedLead as Extract<
      typeof validatedLead,
      { success: false }
    >;
    return badRequest(failure.reason);
  }

  const contextResult = parseChatPageContext(validatedLead.lead.pageContext);
  if (!contextResult.success) return badRequest('invalid-page-context');

  const result = await submitChatLead({
    lead: validatedLead.lead,
    pageContext: contextResult.context,
    memberUserId,
  });
  if (!result?.accepted) return serverError();

  await recordChatFunnelEvents(validatedLead.lead.sessionId, [
    { eventType: 'contact_submitted' },
  ]);

  // Return leadId only to authenticated linked members so they can query status.
  const response: { accepted: boolean; leadId?: string } = { accepted: true };
  if (memberUserId && result.leadId) {
    response.leadId = result.leadId;
  }

  return NextResponse.json(
    response,
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
