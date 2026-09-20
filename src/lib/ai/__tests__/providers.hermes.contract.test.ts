import { getChatModel } from '@/lib/ai/providers';

const HERMES_BASE_URL = 'https://hermes.example.test/v1';
const HERMES_MODEL = 'website-chatbot-test-model';
const HERMES_API_KEY = 'hermes-server-test-key';

interface ChatModelSelectionContract {
  baseURL?: string;
  modelId: string;
  name: string;
  type?: string;
  isFailover?: boolean;
}

describe('Hermes provider selection contract', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      CHAT_PROVIDER: 'hermes',
      HERMES_BASE_URL,
      HERMES_MODEL,
      HERMES_API_KEY,
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('exposes the configured Hermes model instead of LM Studio qwen', () => {
    const model = getChatModel() as ChatModelSelectionContract;

    expect(model.modelId).toBe(HERMES_MODEL);
    expect(model.name).toBe('Hermes');
    expect(model.baseURL).toBe(HERMES_BASE_URL);
  });

  it('marks synchronous Hermes selection as Hermes mode with commercial failover disabled', () => {
    const model = getChatModel() as ChatModelSelectionContract;

    expect(model.type).toBe('hermes');
    expect(model.isFailover).toBe(false);
  });
});
