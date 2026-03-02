import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { sendHandoffEmail } from '@/lib/chatbot-email';
import { PHONE_REGEX, HANDOFF_TRIGGER_KEYWORDS } from '@/lib/validation';
import type { UIMessage } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface HandoffRequest {
  phoneNumber: string;
  conversationHistory: UIMessage[];
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit check
    const clientId = getClientIdentifier(req);
    const rateLimitResult = await checkRateLimit(clientId);

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

    const body: HandoffRequest = await req.json();
    const { phoneNumber, conversationHistory } = body;

    // Validate phone number
    if (!phoneNumber || !PHONE_REGEX.test(phoneNumber)) {
      return NextResponse.json(
        { error: '電話番号の形式が正しくありません（例: 050-1793-6500）' },
        { status: 400 }
      );
    }

    // Validate conversation history
    if (!Array.isArray(conversationHistory) || conversationHistory.length === 0) {
      return NextResponse.json(
        { error: '会話履歴が必要です' },
        { status: 400 }
      );
    }

    // Validate conversation history contains handoff trigger
    const lastAssistantMessage = conversationHistory
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
      conversationHistory,
      timestamp: new Date(),
    });

    if (!emailResult.success) {
      console.error('Failed to send handoff email:', emailResult.error);
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
    console.error('Human handoff API error:', error);
    return NextResponse.json(
      { error: 'エラーが発生しました。しばらく待ってから再試行してください。' },
      { status: 500 }
    );
  }
}
