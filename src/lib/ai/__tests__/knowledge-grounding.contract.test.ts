import { POST } from '@/app/api/chat/route';
import {
  getChatModelWithFailover,
  preflightHermesConnection,
} from '@/lib/ai/providers';
import { streamText } from 'ai';

jest.mock('@/lib/ai/providers', () => ({
  getChatModelWithFailover: jest.fn(),
  getSystemPrompt: jest.fn(() => 'site prompt'),
  preflightHermesConnection: jest.fn(),
}));

jest.mock('@/lib/ai/knowledge-base', () => ({
  getRelevantKnowledge: jest.fn(() => ''),
}));

jest.mock('ai', () => ({
  streamText: jest.fn(),
}));

const mockedGetChatModelWithFailover = getChatModelWithFailover as jest.Mock;
const mockedPreflightHermesConnection = preflightHermesConnection as jest.Mock;
const mockedStreamText = streamText as jest.Mock;

function mockHermesProvider(): jest.Mock {
  const provider = jest.fn(() => ({ modelId: 'website-chatbot-test-model' }));
  mockedGetChatModelWithFailover.mockResolvedValue({
    provider,
    modelId: 'website-chatbot-test-model',
    baseURL: 'https://hermes.example.test/v1',
    name: 'Hermes',
    type: 'hermes',
    isFailover: false,
  });
  mockedPreflightHermesConnection.mockResolvedValue({ ok: true });
  return provider;
}

function mockHermesStream(): void {
  mockedStreamText.mockReturnValue({
    toUIMessageStreamResponse: jest.fn(() => new Response(null, { status: 200 })),
  });
}

function createRequest(): Request {
  return new Request('https://package-lab.test/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        {
          id: 'message-1',
          role: 'user',
          parts: [{ type: 'text', text: 'スタンドパウチについて教えてください' }],
        },
      ],
    }),
  });
}

describe('missing knowledge grounding contract', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHermesStream();
    process.env.CHAT_PROVIDER = 'hermes';
    process.env.HERMES_BASE_URL = 'https://hermes.example.test/v1';
    process.env.HERMES_MODEL = 'website-chatbot-test-model';
  });

  it('does not invoke Hermes with a generic business prompt when grounding is unavailable', async () => {
    const provider = mockHermesProvider();

    await POST(createRequest());

    expect(mockedStreamText).not.toHaveBeenCalled();
    expect(provider).not.toHaveBeenCalled();
  });

  it('fails closed to staff escalation with a stable grounding reason', async () => {
    mockHermesProvider();
    const response = await POST(createRequest());
    const body = await response.text();
    const payload = body ? (JSON.parse(body) as Record<string, unknown>) : {};

    expect(response.status).toBe(503);
    expect(payload.reasonCode).toBe('grounding_unavailable');
    expect(String(payload.error)).toMatch(/担当者|お問い合わせ|問い合わせ/);
  });
});
