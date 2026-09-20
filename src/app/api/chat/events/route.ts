import { NextRequest, NextResponse } from 'next/server';
import {
  isValidChatFunnelEvent,
  recordChatFunnelEvents,
} from '@/lib/chat/chat-analytics';
import {
  checkRateLimit,
  getClientIdentifier,
} from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const MAX_EVENTS_REQUEST_BYTES = 8 * 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasMatchingOrigin = (request: NextRequest): boolean => {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).origin === request.nextUrl.origin;
  } catch {
    return false;
  }
};

const readJsonWithByteLimit = async (
  request: NextRequest,
  maximumBytes: number,
): Promise<unknown> => {
  const declaredLength = Number(request.headers.get('content-length'));
  if (!Number.isSafeInteger(declaredLength) || declaredLength < 0 || declaredLength > maximumBytes) {
    throw new Error('request-too-large');
  }
  if (!request.body) {
    throw new Error('empty-body');
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    received += value.byteLength;
    if (received > maximumBytes) {
      throw new Error('request-too-large');
    }
    chunks.push(value);
  }

  const decoder = new TextDecoder();
  return JSON.parse(chunks.reduce(
    (body, chunk) => body + decoder.decode(chunk, { stream: true }),
    '',
  ) + decoder.decode());
};

const badRequest = (reasonCode: string) => NextResponse.json(
  { error: 'リクエスト形式が正しくありません', reasonCode },
  { status: 400 },
);

export async function POST(req: NextRequest) {
  if (!hasMatchingOrigin(req)) {
    return NextResponse.json(
      { error: 'リクエスト元が不正です' },
      { status: 403 },
    );
  }

  const rateLimit = await checkRateLimit(getClientIdentifier(req), 'events');
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'リクエスト数が上限を超えました。しばらく待ってから再試行してください。' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await readJsonWithByteLimit(req, MAX_EVENTS_REQUEST_BYTES);
  } catch (error) {
    const reason = error instanceof Error && error.message === 'request-too-large'
      ? 'request-too-large'
      : 'invalid-body';
    return badRequest(reason);
  }

  if (
    !isRecord(body) ||
    Object.keys(body).some((key) => key !== 'sessionId' && key !== 'events') ||
    typeof body.sessionId !== 'string' ||
    !UUID_PATTERN.test(body.sessionId) ||
    !Array.isArray(body.events)
  ) {
    return badRequest('invalid-events');
  }

  const validShape = body.events.every((event) =>
    isRecord(event) &&
    Object.keys(event).every((key) => key === 'eventType' || key === 'suggestionId') &&
    isValidChatFunnelEvent(event)
  );
  if (body.events.length === 0 || body.events.length > 20 || !validShape) {
    return badRequest('invalid-events');
  }

  const accepted = await recordChatFunnelEvents(
    body.sessionId,
    body.events,
  );

  return NextResponse.json(
    { accepted },
    {
      status: accepted ? 202 : 503,
      headers: { 'Cache-Control': 'private, no-store' },
    },
  );
}
