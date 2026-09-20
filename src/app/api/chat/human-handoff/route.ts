import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { sendHandoffEmail } from '@/lib/chatbot-email';
import { PHONE_REGEX, HANDOFF_TRIGGER_KEYWORDS } from '@/lib/validation';
import { loggers } from '@/lib/logger';
import { validateChatMessages } from '@/lib/chat/chat-messages';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const logger = loggers.api('/api/chat/human-handoff');
const MAX_HANDOFF_REQUEST_BYTES = 128 * 1024;
const ALLOWED_BODY_KEYS = new Set(['phoneNumber', 'conversationHistory']);

const createBadRequestResponse = (error: string) => NextResponse.json(
  { error },
  { status: 400 },
);

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

export async function POST(req: NextRequest) {
  try {
    if (!isSameOriginRequest(req)) {
      return NextResponse.json(
        { error: 'リクエスト元が不正です' },
        { status: 403 },
      );
    }

    const contentLength = Number(req.headers.get('content-length'));
    if (!Number.isSafeInteger(contentLength) || contentLength < 0) {
      return createBadRequestResponse('リクエストサイズが不正です');
    }
    if (contentLength > MAX_HANDOFF_REQUEST_BYTES) {
      return NextResponse.json(
        { error: 'リクエストサイズが上限を超えました' },
        { status: 413 },
      );
    }

    // Rate limit check
    const clientId = getClientIdentifier(req);
    const rateLimitResult = await checkRateLimit(clientId, 'human-handoff');

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'リクエスト数が上限を超えています。しばらく待ってから再試行してください。' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
          }
        }
      );
    }

    // Parse request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return createBadRequestResponse('リクエスト形式が正しくありません');
    }
    if (
      !isRecord(body) ||
      Object.keys(body).some((key) => !ALLOWED_BODY_KEYS.has(key))
    ) {
      return createBadRequestResponse('リクエスト形式が正しくありません');
    }

    const { phoneNumber, conversationHistory } = body;

    // Validate phone number
    if (
      typeof phoneNumber !== 'string' ||
      !phoneNumber ||
      !PHONE_REGEX.test(phoneNumber)
    ) {
      return NextResponse.json(
        { error: '電話番号の形式が正しくありません（例: 050-1793-6500）' },
        { status: 400 }
      );
    }

    const validatedConversation = validateChatMessages(conversationHistory);
    if (!validatedConversation.success) {
      return createBadRequestResponse('会話履歴の形式が正しくありません');
    }
    const validatedHistory = validatedConversation.messages;

    // Validate conversation history contains handoff trigger
    const lastAssistantMessage = validatedHistory
      .filter(m => m.role === 'assistant')
      .pop();

    if (!lastAssistantMessage) {
      return NextResponse.json(
        { error: 'AI応答が含まれていません' },
        { status: 400 }
      );
    }

    // Extract text from parts array
    let lastMessageContent = '';
    if (lastAssistantMessage.parts && Array.isArray(lastAssistantMessage.parts)) {
      lastMessageContent = lastAssistantMessage.parts
        .filter((part) => part.type === 'text')
        .map((part) => part.text || '')
        .join('');
    }

    const hasTriggerKeyword = HANDOFF_TRIGGER_KEYWORDS.some(kw => lastMessageContent.includes(kw));

    if (!hasTriggerKeyword) {
      return NextResponse.json(
        { error: '有人切り替えリクエストが不正です' },
        { status: 400 }
      );
    }

    // Send email
    const emailResult = await sendHandoffEmail({
      phoneNumber,
      conversationHistory: validatedHistory,
      timestamp: new Date(),
    });

    if (!emailResult.success) {
      logger.error('Failed to send handoff email', { error: emailResult.error });
      return NextResponse.json(
        { error: 'メール送信に失敗しました。しばらく待ってから再試行してください。' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '担当者より折り返しご連絡いたします。',
      remaining: rateLimitResult.remaining - 1,
    });

  } catch (error) {
    logger.error('Human handoff API error', { error });
    return NextResponse.json(
      { error: 'エラーが発生しました。しばらく待ってから再試行してください。' },
      { status: 500 }
    );
  }
}
