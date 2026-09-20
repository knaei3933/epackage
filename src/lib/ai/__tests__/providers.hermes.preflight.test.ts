import {
  preflightHermesConnection,
  resetHermesPreflightCacheForTests,
} from '@/lib/ai/providers';
import {
  HERMES_HARD_BLOCKED_TOOL_NAMES,
  HERMES_TOOL_POLICY,
} from '@/lib/ai/hermes-tool-policy';

const BASE_URL = 'https://hermes.example.test/v1';
const API_KEY = 'hermes-server-test-key';
const MODEL_ID = 'website-chatbot-test-model';
const fetchMock = jest.spyOn(global, 'fetch');

const modelPayload = () => ({ data: [{ id: MODEL_ID }] });
const disabledToolset = (name: string, tools: string[] = []) => ({
  name,
  label: name,
  description: `${name} capability`,
  enabled: false,
  configured: false,
  tools,
});
const emptyToolsets = () => ({
  object: 'list',
  platform: 'api_server',
  data: [],
});
const successResponses = () => {
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify(modelPayload()), { status: 200 }),
  );
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify(emptyToolsets()), { status: 200 }),
  );
};
const healthPayload = (payload: Record<string, unknown> = { status: 'ok' }) =>
  new Response(JSON.stringify(payload), { status: 200 });
const leakAssertions = async (promise: Promise<unknown>) => {
  const result = await promise;
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain(BASE_URL);
  expect(serialized).not.toContain(API_KEY);
  expect(serialized).not.toContain('provider detail');
  return result;
};

describe('Hermes request preflight', () => {
  const originalEnv = { ...process.env };
  const dateNowMock = jest.spyOn(Date, 'now');

  beforeEach(() => {
    jest.clearAllMocks();
    resetHermesPreflightCacheForTests();
    process.env = {
      ...originalEnv,
      CHAT_PROVIDER: 'hermes',
      HERMES_BASE_URL: BASE_URL,
      HERMES_API_KEY: API_KEY,
      HERMES_MODEL: MODEL_ID,
    };
    fetchMock.mockReset();
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === 'https://hermes.example.test/health') {
        return healthPayload();
      }
      throw new TypeError('unexpected preflight request');
    });
    dateNowMock.mockReturnValue(1_000_000);
  });

  afterAll(() => {
    fetchMock.mockRestore();
    dateNowMock.mockRestore();
    process.env = originalEnv;
  });

  it('authenticates both models and the empty serving-tool policy', async () => {
    successResponses();

    await expect(preflightHermesConnection(10)).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/models`,
      {
        headers: { Authorization: `Bearer ${API_KEY}` },
        signal: expect.any(AbortSignal),
      },
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `https://hermes.example.test${HERMES_TOOL_POLICY.audit.endpoint}`,
      {
        headers: { Authorization: `Bearer ${API_KEY}` },
        signal: expect.any(AbortSignal),
      },
    );
    expect(fetchMock).toHaveBeenCalledWith(
      'https://hermes.example.test/health',
      {
        signal: expect.any(AbortSignal),
      },
    );
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('binds the toolset audit to the endpoint configured by policy', async () => {
    const configuredEndpoint = HERMES_TOOL_POLICY.audit.endpoint;
    HERMES_TOOL_POLICY.audit.endpoint = '/v2/toolsets';

    try {
      successResponses();
      await expect(preflightHermesConnection(10)).resolves.toEqual({ ok: true });
      expect(fetchMock).toHaveBeenCalledWith(
        'https://hermes.example.test/v2/toolsets',
        expect.objectContaining({
          headers: { Authorization: `Bearer ${API_KEY}` },
        }),
      );
    } finally {
      HERMES_TOOL_POLICY.audit.endpoint = configuredEndpoint;
    }
  });

  it('accepts a compatible exposed version and rejects an older one', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(modelPayload()), { status: 200 }),
    );
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(emptyToolsets()), { status: 200 }),
    );
    fetchMock.mockResolvedValueOnce(healthPayload({
      status: 'ok',
      version: HERMES_TOOL_POLICY.minimum_hermes_version,
    }));
    await expect(preflightHermesConnection(10)).resolves.toEqual({ ok: true });

    resetHermesPreflightCacheForTests();
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(modelPayload()), { status: 200 }),
    );
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(emptyToolsets()), { status: 200 }),
    );
    fetchMock.mockResolvedValueOnce(healthPayload({
      status: 'ok',
      version: '0.21.2',
    }));
    await expect(leakAssertions(preflightHermesConnection(10))).resolves
      .toMatchObject({ ok: false, reasonCode: 'hermes_invalid_response' });
  });

  it('rejects malformed or non-ok health JSON', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(modelPayload()), { status: 200 }),
    );
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(emptyToolsets()), { status: 200 }),
    );
    fetchMock.mockResolvedValueOnce(new Response('not-json', { status: 200 }));
    await expect(preflightHermesConnection(10)).resolves.toMatchObject({
      ok: false,
      reasonCode: 'hermes_invalid_response',
    });

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(modelPayload()), { status: 200 }),
    );
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(emptyToolsets()), { status: 200 }),
    );
    fetchMock.mockResolvedValueOnce(healthPayload({ status: 'degraded' }));
    await expect(leakAssertions(preflightHermesConnection(10))).resolves
      .toMatchObject({ ok: false, reasonCode: 'hermes_invalid_response' });
  });

  it('rejects a non-ok health HTTP response even with an ok JSON body', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(modelPayload()), { status: 200 }),
    );
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(emptyToolsets()), { status: 200 }),
    );
    fetchMock.mockResolvedValueOnce(new Response(
      JSON.stringify({ status: 'ok' }),
      { status: 500 },
    ));

    await expect(leakAssertions(preflightHermesConnection(10))).resolves
      .toMatchObject({ ok: false, reasonCode: 'hermes_http_error' });
  });

  it('rejects when the configured model is not advertised', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: [{ id: 'other-model' }] }), { status: 200 }),
    );
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(emptyToolsets()), { status: 200 }),
    );

    await expect(leakAssertions(preflightHermesConnection(10))).resolves
      .toMatchObject({ ok: false, reasonCode: 'hermes_invalid_response' });
  });

  it.each([
    ['hard-blocked toolset', HERMES_HARD_BLOCKED_TOOL_NAMES[0]],
    ['unknown toolset', 'unexpected-toolset'],
  ])('fail-closed rejects an enabled %s', async (_name, toolsetName) => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(modelPayload()), { status: 200 }),
    );
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      object: 'list',
      platform: 'api_server',
      data: [{ name: toolsetName, enabled: true }],
    }), { status: 200 }));

    await expect(leakAssertions(preflightHermesConnection(10))).resolves
      .toMatchObject({ ok: false, reasonCode: 'hermes_invalid_response' });
  });

  it('fail-closed rejects malformed tool envelopes and rows', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(modelPayload()), { status: 200 }),
    );
    fetchMock.mockResolvedValueOnce(new Response('[]', { status: 200 }));
    await expect(leakAssertions(preflightHermesConnection(10))).resolves
      .toMatchObject({ ok: false, reasonCode: 'hermes_invalid_response' });

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(modelPayload()), { status: 200 }),
    );
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      object: 'list',
      platform: 'api_server',
      data: [{ ...disabledToolset('web'), tools: 'browser.open' }],
    }), { status: 200 }));
    await expect(leakAssertions(preflightHermesConnection(10))).resolves
      .toMatchObject({ ok: false, reasonCode: 'hermes_invalid_response' });
  });

  it.each([
    [401, 'hermes_auth_error'],
    [403, 'hermes_auth_error'],
    [429, 'hermes_provider_rate_limited'],
    [500, 'hermes_http_error'],
  ])('classifies HTTP %i', async (status, reasonCode) => {
    fetchMock.mockResolvedValue(new Response('provider detail', { status }));

    const result = await leakAssertions(preflightHermesConnection(10));
    expect(result).toMatchObject({ ok: false, reasonCode });
  });

  it.each([401, 429, 500])('classifies toolsets HTTP %i', async (status) => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(modelPayload()), { status: 200 }),
    );
    fetchMock.mockResolvedValueOnce(new Response('provider detail', { status }));
    const expectedReasonCode = status === 401
      ? 'hermes_auth_error'
      : status === 429
        ? 'hermes_provider_rate_limited'
        : 'hermes_http_error';

    await expect(leakAssertions(preflightHermesConnection(10))).resolves
      .toMatchObject({ ok: false, reasonCode: expectedReasonCode });
  });

  it('classifies malformed JSON and malformed model payloads', async () => {
    fetchMock.mockResolvedValueOnce(new Response('not-json', { status: 200 }));
    fetchMock.mockResolvedValueOnce(new Response('[]', { status: 200 }));
    await expect(preflightHermesConnection(10)).resolves.toMatchObject({
      ok: false,
      reasonCode: 'hermes_invalid_response',
    });

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ models: [] }), { status: 200 }));
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(emptyToolsets()), { status: 200 }));
    await expect(preflightHermesConnection(10)).resolves.toMatchObject({
      ok: false,
      reasonCode: 'hermes_invalid_response',
    });
  });

  it('classifies timeout and network failures', async () => {
    fetchMock.mockRejectedValueOnce(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    await expect(preflightHermesConnection(10)).resolves.toMatchObject({
      ok: false,
      reasonCode: 'hermes_timeout',
    });

    resetHermesPreflightCacheForTests();
    fetchMock.mockRejectedValueOnce(new TypeError(`fetch failed for ${API_KEY}`));
    const result = await preflightHermesConnection(10);
    expect(result).toMatchObject({ ok: false, reasonCode: 'hermes_unreachable' });
    expect(JSON.stringify(result)).not.toContain(API_KEY);
    expect(JSON.stringify(result)).not.toContain(BASE_URL);
  });

  it('reuses one success cache and repolls after reset or TTL expiry', async () => {
    let now = 1_000_000;
    dateNowMock.mockImplementation(() => now);

    successResponses();
    await expect(preflightHermesConnection(10)).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);

    now += 29_999;
    await expect(preflightHermesConnection(10)).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);

    resetHermesPreflightCacheForTests();
    successResponses();
    await expect(preflightHermesConnection(10)).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(6);
    now += 30_001;
    successResponses();
    await expect(preflightHermesConnection(10)).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(9);
  });

  it('negatively caches a serving failure to prevent provider log amplification', async () => {
    let now = 1_000_000;
    dateNowMock.mockImplementation(() => now);

    fetchMock.mockRejectedValueOnce(new TypeError('temporary provider failure'));
    await expect(preflightHermesConnection(10)).resolves.toMatchObject({
      ok: false,
      reasonCode: 'hermes_unreachable',
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);

    now += 4_999;
    await expect(preflightHermesConnection(10)).resolves.toMatchObject({
      ok: false,
      reasonCode: 'hermes_unreachable',
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);

    now += 5_001;
    successResponses();
    await expect(preflightHermesConnection(10)).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(6);
  });

  it('coalesces concurrent cold calls into one audit pair', async () => {
    successResponses();
    const [first, second] = await Promise.all([
      preflightHermesConnection(10),
      preflightHermesConnection(10),
    ]);

    expect(first).toEqual({ ok: true });
    expect(second).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
