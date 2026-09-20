/**
 * @jest-environment node
 */

import { GET } from '../route';
import {
  preflightHermesConnection,
} from '@/lib/ai/providers';

jest.mock('@/lib/ai/providers', () => ({
  preflightHermesConnection: jest.fn(),
  isHermesPreflightFailure: (result: unknown) =>
    Boolean(result) && (result as { ok?: unknown }).ok === false,
}));

const mockedPreflight = preflightHermesConnection as jest.Mock;
const HERMES_API_KEY = 'hermes-contract-secret';
const HERMES_BASE_URL = 'https://hermes.example.test/v1';
const OLD_LMSTUDIO_BASE_URL = 'https://old-lmstudio.example.test/v1';

describe('Hermes health route contract', () => {
  const originalEnv = { ...process.env };
  const fetchMock = jest.spyOn(global, 'fetch');

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      CHAT_PROVIDER: 'hermes',
      HERMES_BASE_URL,
      HERMES_API_KEY,
      LMSTUDIO_BASE_URL: OLD_LMSTUDIO_BASE_URL,
    };
    fetchMock.mockReset();
    mockedPreflight.mockReset();
    mockedPreflight.mockResolvedValue({ ok: true });
  });

  afterAll(() => {
    fetchMock.mockRestore();
    process.env = originalEnv;
  });

  it('uses the authenticated serving preflight instead of an unauthenticated health-only request', async () => {
    const response = await GET();

    expect(mockedPreflight).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: 'ok',
      service: 'hermes',
      reasonCode: 'hermes_available',
    });
  });

  it('returns stable available data without URLs, credentials, or provider details', async () => {
    const response = await GET();
    const serialized = await response.text();

    expect(serialized).not.toContain(HERMES_API_KEY);
    expect(serialized).not.toContain(HERMES_BASE_URL);
    expect(serialized).not.toContain(OLD_LMSTUDIO_BASE_URL);
    expect(serialized).not.toContain('provider detail');
  });

  it.each([
    'hermes_auth_error',
    'hermes_invalid_response',
    'hermes_http_error',
    'hermes_provider_rate_limited',
    'hermes_timeout',
    'hermes_unreachable',
  ])('reports %s as degraded without provider detail', async (reasonCode) => {
    mockedPreflight.mockResolvedValue({
      ok: false,
      reasonCode,
      error: `provider detail ${HERMES_API_KEY} ${HERMES_BASE_URL}`,
    });

    const response = await GET();
    const serialized = await response.text();

    expect(response.status).toBe(200);
    expect(JSON.parse(serialized)).toEqual({
      status: 'degraded',
      service: 'hermes',
      reasonCode,
    });
    expect(serialized).not.toContain('provider detail');
    expect(serialized).not.toContain(HERMES_API_KEY);
    expect(serialized).not.toContain(HERMES_BASE_URL);
  });

  it('preserves LM Studio behavior when Hermes is not selected', async () => {
    process.env = {
      ...originalEnv,
      CHAT_PROVIDER: 'lmstudio',
      LMSTUDIO_BASE_URL: OLD_LMSTUDIO_BASE_URL,
    };
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), { status: 200 }),
    );

    const response = await GET();

    expect(mockedPreflight).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith(
      `${OLD_LMSTUDIO_BASE_URL}/models`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(await response.json()).toEqual({
      status: 'ok',
      message: 'LM Studio is available',
      service: 'lmstudio',
      baseURL: OLD_LMSTUDIO_BASE_URL,
    });
  });
});
