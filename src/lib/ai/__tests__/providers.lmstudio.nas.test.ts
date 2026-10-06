import { getChatModel } from '@/lib/ai/providers';

const NAS_BASE_URL = 'https://nas-relay.example.test/v1';
const NAS_MODEL = 'qwen3-existing-model-id';
const NAS_API_KEY = 'nas-server-test-key';

const chatModelPayload = JSON.stringify({
  id: 'chatcmpl-test',
  choices: [
    {
      message: { role: 'assistant', content: 'ok' },
      finish_reason: 'stop',
    },
  ],
  usage: {
    prompt_tokens: 1,
    completion_tokens: 1,
    total_tokens: 2,
  },
});

describe('OpenAI-compatible provider NAS migration configuration', () => {
  const originalEnv = { ...process.env };
  const fetchMock = jest.spyOn(global, 'fetch');

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'development',
      VERCEL_ENV: undefined,
      CHAT_PROVIDER: 'lmstudio',
      LMSTUDIO_BASE_URL: undefined,
      LMSTUDIO_MODEL: undefined,
      LMSTUDIO_API_KEY: undefined,
      FAILOVER_ENABLED: 'false',
    };
    fetchMock.mockReset();
  });

  afterAll(() => {
    fetchMock.mockRestore();
    process.env = originalEnv;
  });

  it('keeps the existing local OpenAI-compatible contract by default', () => {
    expect(getChatModel()).toMatchObject({
      baseURL: 'http://localhost:1234/v1',
      modelId: 'qwen/qwen3-vl-4b',
      name: 'OpenAI-compatible (Local)',
      type: 'lmstudio',
      isFailover: false,
    });
  });

  it('selects the NAS relay and exact existing model ID', () => {
    process.env.LMSTUDIO_BASE_URL = `${NAS_BASE_URL}/`;
    process.env.LMSTUDIO_MODEL = NAS_MODEL;

    expect(getChatModel()).toMatchObject({
      baseURL: NAS_BASE_URL,
      modelId: NAS_MODEL,
      name: 'OpenAI-compatible (NAS Relay)',
      type: 'lmstudio',
      isFailover: false,
    });
  });

  it('sends the optional NAS relay key as bearer authentication only', async () => {
    process.env.LMSTUDIO_BASE_URL = NAS_BASE_URL;
    process.env.LMSTUDIO_MODEL = NAS_MODEL;
    process.env.LMSTUDIO_API_KEY = NAS_API_KEY;

    fetchMock.mockResolvedValue(
      new Response(chatModelPayload, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const config = getChatModel();
    const model = config.provider.chatModel(config.modelId);
    await model.doGenerate({
      prompt: [
        {
          role: 'user',
          content: [{ type: 'text', text: 'test' }],
        },
      ],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(url).toBe(`${NAS_BASE_URL}/chat/completions`);
    expect(headers.get('authorization')).toBe(`Bearer ${NAS_API_KEY}`);

    const body = JSON.parse(String(init.body)) as { model?: string };
    expect(body.model).toBe(NAS_MODEL);
    expect(JSON.stringify(config)).not.toContain(NAS_API_KEY);
  });

  it('accepts loopback HTTP but rejects non-loopback HTTP', () => {
    process.env.LMSTUDIO_BASE_URL = 'http://127.0.0.1:1234/v1';
    expect(getChatModel().baseURL).toBe('http://127.0.0.1:1234/v1');

    process.env.LMSTUDIO_BASE_URL = 'http://nas.server.local:8443/v1';
    expect(getChatModel).toThrow(
      'LMSTUDIO_BASE_URL must be a valid URL ending in /v1. ' +
        'Use HTTPS outside local loopback development.'
    );
  });

  it('requires an OpenAI-compatible /v1 base URL', () => {
    process.env.LMSTUDIO_BASE_URL = 'https://nas-relay.example.test/api';
    expect(getChatModel).toThrow(
      'LMSTUDIO_BASE_URL must be an OpenAI-compatible endpoint ending in /v1.'
    );

    process.env.LMSTUDIO_BASE_URL = 'file:///tmp/lmstudio/v1';
    expect(getChatModel).toThrow(
      'LMSTUDIO_BASE_URL must be a valid URL ending in /v1. ' +
        'Use HTTPS outside local loopback development.'
    );
  });

  it('requires a production base URL ending in /v1', () => {
    process.env.NODE_ENV = 'production';
    process.env.LMSTUDIO_BASE_URL = undefined;

    expect(getChatModel).toThrow(
      'LMSTUDIO_BASE_URL is required in production. ' +
        'Please set LMSTUDIO_BASE_URL in your Vercel environment variables. ' +
        'Expected format: https://chatbot.package-lab.com/v1'
    );
  });
});
