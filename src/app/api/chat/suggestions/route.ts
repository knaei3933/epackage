import { NextRequest, NextResponse } from 'next/server';
import { resolveChatPageSuggestions } from '@/lib/chat/page-suggestions';
import { resolveChatParticipant } from '@/lib/chat/participant-context';
import { parseChatPageContext } from '@/lib/chat/page-context';
import { ensureChatSession } from '@/lib/chat/chat-analytics';
import {
  checkRateLimit,
  getClientIdentifier,
} from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const MAX_SUGGESTIONS_REQUEST_BYTES = 4 * 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_BODY_KEYS = new Set(['pathname', 'locale', 'quoteStep', 'fieldId', 'sessionId']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isSameOriginRequest = (req: NextRequest): boolean => {
  const origin = req.headers.get('origin');
  if (origin) {
    try {
      return new URL(origin).origin === req.nextUrl.origin;
    } catch {
      return false;
    }
  }
  return req.headers.get('sec-fetch-site') === 'same-origin';
};

const createBadRequestResponse = () => NextResponse.json(
  {
    error: 'リクエスト形式が正しくありません',
    reasonCode: 'invalid-page-context',
  },
  { status: 400 },
);

export async function POST(req: NextRequest) {
  if (!isSameOriginRequest(req)) {
    return NextResponse.json(
      { error: 'リクエスト元が不正です' },
      { status: 403 },
    );
  }

  const rateLimit = await checkRateLimit(getClientIdentifier(req), 'suggestions');
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'リクエスト数が上限を超えました。しばらく待ってから再試行してください。' },
      { status: 429 },
    );
  }

  const contentLength = Number(req.headers.get('content-length'));
  if (!Number.isSafeInteger(contentLength) || contentLength < 0 ||
      contentLength > MAX_SUGGESTIONS_REQUEST_BYTES) {
    return createBadRequestResponse();
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return createBadRequestResponse();
  }
  if (!isRecord(body)) {
    return createBadRequestResponse();
  }
  if (Object.keys(body).some((key) => !ALLOWED_BODY_KEYS.has(key))) {
    return createBadRequestResponse();
  }
  if (
    body.sessionId !== undefined &&
    (
      typeof body.sessionId !== 'string' ||
      !UUID_PATTERN.test(body.sessionId)
    )
  ) {
    return createBadRequestResponse();
  }
  const existingSessionId = typeof body.sessionId === 'string'
    ? body.sessionId
    : undefined;

  const contextResult = parseChatPageContext({
    pathname: body.pathname,
    locale: body.locale,
    quoteStep: body.quoteStep,
    fieldId: body.fieldId,
  });
  if (!contextResult.success) {
    return createBadRequestResponse();
  }

  const participant = await resolveChatParticipant(req);
  const resolution = resolveChatPageSuggestions({
    ...contextResult.context,
    audience: participant?.audience ?? 'public',
  });
  const sessionId = await ensureChatSession({
    audience: participant?.audience ?? 'public',
    routeFamily: resolution.routeFamily,
    existingSessionId,
  });

  return NextResponse.json(
    {
      sessionId,
      suggestions: resolution.suggestions.map((suggestion) => ({
        id: suggestion.id,
        labelJa: suggestion.labelJa,
        questionJa: suggestion.questionJa,
        audience: suggestion.audience,
      })),
    },
    {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    },
  );
}
