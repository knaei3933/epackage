import {
  getChatModel,
  getChatModelWithFailover,
  getHermesChatModel,
} from '@/lib/ai/providers';

const HERMES_BASE_URL = 'https://hermes.example.test/v1';
const HERMES_MODEL = 'website-chatbot-test-model';
const HERMES_API_KEY = 'hermes-server-test-key';

type ChatModelSelectionContract = {
  baseURL?: string;
  modelId: string;
  name: string;
  type?: string;
  isFailover?: boolean;
};

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

describe('Hermes provider configuration', () => {
  const originalEnv = { ...process.env };
  const fetchMock = jest.spyOn(global, 'fetch');

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      CHAT_PROVIDER: 'hermes',
      HERMES_BASE_URL,
      HERMES_MODEL,
      HERMES_API_KEY,
      FAILOVER_ENABLED: 'true',
      FAILOVER_PROVIDER: 'anthropic-haiku',
      OPENAI_API_KEY: undefined,
      ANTHROPIC_API_KEY: undefined,
    };
    fetchMock.mockReset();
  });

  afterAll(() => {
    fetchMock.mockRestore();
    process.env = originalEnv;
  });

  it('creates the OpenAI-compatible provider and sends the model ID with bearer auth', async () => {
    fetchMock.mockResolvedValue(
      new Response(chatModelPayload, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const config = getHermesChatModel();
    const model = config.provider.chatModel(config.modelId);

    expect(config).toMatchObject({
      baseURL: HERMES_BASE_URL,
      modelId: HERMES_MODEL,
      name: 'Hermes',
      type: 'hermes',
      isFailover: false,
    });

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
    expect(url).toBe(`${HERMES_BASE_URL}/chat/completions`);
    expect(headers.get('authorization')).toBe(`Bearer ${HERMES_API_KEY}`);

    const body = JSON.parse(String(init.body)) as { model?: string };
    expect(body.model).toBe(HERMES_MODEL);
  });

  it('keeps the API key out of provider metadata and auth errors', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ error: { message: 'invalid credentials' } }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    const config = getHermesChatModel();
    const model = config.provider.chatModel(config.modelId);
    const metadataText = JSON.stringify({
      provider: model.provider,
      configModelId: model.modelId,
      selection: {
        baseURL: config.baseURL,
        modelId: config.modelId,
        name: config.name,
        type: config.type,
      },
    });

    expect(metadataText).toContain('hermes.');
    expect(metadataText).not.toContain(HERMES_API_KEY);

    const requestError = await model
      .doGenerate({
        prompt: [
          {
            role: 'user',
            content: [{ type: 'text', text: 'test' }],
          },
        ],
      })
      .catch((error: unknown) => error);

    expect(requestError).toBeInstanceOf(Error);
    expect(JSON.stringify({
      requestError,
      providerMetadata: {
        provider: model.provider,
        modelId: model.modelId,
      },
      selection: {
        baseURL: config.baseURL,
        modelId: config.modelId,
        name: config.name,
        type: config.type,
      },
    })).not.toContain(HERMES_API_KEY);
  });

  it('requires an http(s) Hermes base URL ending in /v1', () => {
    process.env.HERMES_BASE_URL = 'https://hermes.example.test/api';
    expect(getHermesChatModel).toThrow(
      'HERMES_BASE_URL must be an OpenAI-compatible endpoint ending in /v1.'
    );

    process.env.HERMES_BASE_URL = 'file:///tmp/hermes/v1';
    expect(getHermesChatModel).toThrow(
      'HERMES_BASE_URL must be a valid URL ending in /v1. ' +
      'Use HTTPS outside local loopback development.'
    );
  });

  it('allows HTTP only for loopback local development', () => {
    process.env.NODE_ENV = 'development';
    process.env.VERCEL_ENV = undefined;

    process.env.HERMES_BASE_URL = 'http://127.0.0.1:8642/v1';
    expect(getHermesChatModel().baseURL).toBe('http://127.0.0.1:8642/v1');

    process.env.HERMES_BASE_URL = 'http://localhost:8642/v1';
    expect(getHermesChatModel().baseURL).toBe('http://localhost:8642/v1');

    process.env.HERMES_BASE_URL = 'http://[::1]:8642/v1';
    expect(getHermesChatModel().baseURL).toBe('http://[::1]:8642/v1');

    process.env.HERMES_BASE_URL = 'http://hermes.server.local:8642/v1';
    expect(getHermesChatModel).toThrow(
      'HERMES_BASE_URL must be a valid URL ending in /v1. ' +
      'Use HTTPS outside local loopback development.'
    );
  });

  it('allows HTTP loopback for local production starts', () => {
    process.env.HERMES_BASE_URL = 'http://127.0.0.1:8642/v1';
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = undefined;
    expect(getHermesChatModel().baseURL).toBe('http://127.0.0.1:8642/v1');
  });

  it('requires HTTPS for production and preview deployments', () => {
    process.env.HERMES_BASE_URL = 'http://127.0.0.1:8642/v1';

    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'preview';
    expect(getHermesChatModel).toThrow(
      'HERMES_BASE_URL must be a valid URL ending in /v1. ' +
      'Use HTTPS outside local loopback development.'
    );

    process.env.VERCEL_ENV = 'preview';
    expect(getHermesChatModel).toThrow(
      'HERMES_BASE_URL must be a valid URL ending in /v1. ' +
      'Use HTTPS outside local loopback development.'
    );

    process.env.VERCEL_ENV = 'production';
    expect(getHermesChatModel).toThrow(
      'HERMES_BASE_URL must be a valid URL ending in /v1. ' +
      'Use HTTPS outside local loopback development.'
    );
  });

  it('rejects non-loopback HTTP in local and hosted modes', () => {
    process.env.HERMES_BASE_URL = 'http://hermes.server.local:8642/v1';
    const modes = [
      { NODE_ENV: 'production', VERCEL_ENV: undefined },
      { NODE_ENV: 'development', VERCEL_ENV: undefined },
      { NODE_ENV: 'production', VERCEL_ENV: 'production' },
      { NODE_ENV: 'development', VERCEL_ENV: 'preview' },
    ] as const;

    for (const mode of modes) {
      process.env.NODE_ENV = mode.NODE_ENV;
      process.env.VERCEL_ENV = mode.VERCEL_ENV;
      expect(getHermesChatModel).toThrow(
        'HERMES_BASE_URL must be a valid URL ending in /v1. ' +
        'Use HTTPS outside local loopback development.'
      );
    }
  });

  it('allows HTTPS in local and hosted production', () => {
    process.env.HERMES_BASE_URL = 'https://hermes.example.test/v1';

    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = undefined;
    expect(getHermesChatModel().baseURL).toBe(
      'https://hermes.example.test/v1'
    );

    process.env.VERCEL_ENV = 'production';
    expect(getHermesChatModel().baseURL).toBe(
      'https://hermes.example.test/v1'
    );
  });

  it('uses the development model default without selecting an unsafe implicit provider', () => {
    process.env.NODE_ENV = 'development';
    process.env.VERCEL_ENV = undefined;
    delete process.env.HERMES_MODEL;

    expect(getHermesChatModel().modelId).toBe('hermes');
  });

  it('short-circuits commercial failover before LM Studio production validation', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = undefined;
    delete process.env.LMSTUDIO_BASE_URL;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    const config = await getChatModelWithFailover({ sessionId: 'test-session' });

    expect(config.type).toBe('hermes');
    expect(config.isFailover).toBe(false);
    expect(config.name).toBe('Hermes');
  });

  it('fails closed in production for each missing required variable', () => {
    const setProduction = () => {
      process.env.NODE_ENV = 'production';
      process.env.VERCEL_ENV = undefined;
      delete process.env.HERMES_BASE_URL;
      delete process.env.HERMES_API_KEY;
      delete process.env.HERMES_MODEL;
    };

    setProduction();
    expect(getChatModel).toThrow('HERMES_BASE_URL is required');

    process.env.HERMES_BASE_URL = HERMES_BASE_URL;
    expect(getChatModel).toThrow('HERMES_API_KEY is required');

    process.env.HERMES_API_KEY = HERMES_API_KEY;
    expect(getChatModel).toThrow('HERMES_MODEL is required in production');
  });
});

describe('LM Studio rollback provider selection', () => {
  const originalEnv = { ...process.env };

  afterAll(() => {
    process.env = originalEnv;
  });

  it('preserves the default LM Studio contract when Hermes is not selected', () => {
    process.env = {
      ...originalEnv,
      CHAT_PROVIDER: undefined,
      NODE_ENV: 'development',
      VERCEL_ENV: undefined,
    };

    const model = getChatModel() as ChatModelSelectionContract;

    expect(model).toMatchObject({
      modelId: 'qwen/qwen3-vl-4b',
      name: 'LM Studio (Local)',
      type: 'lmstudio',
      isFailover: false,
    });
  });

  it('still applies the existing production LM Studio base URL requirement', () => {
    process.env = {
      ...originalEnv,
      CHAT_PROVIDER: undefined,
      NODE_ENV: 'production',
      VERCEL_ENV: undefined,
      LMSTUDIO_BASE_URL: undefined,
    };

    expect(getChatModel).toThrow('LMSTUDIO_BASE_URL is required in production');
  });
});
