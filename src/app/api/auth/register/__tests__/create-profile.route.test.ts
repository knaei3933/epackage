import { NextRequest, NextResponse } from 'next/server';

jest.mock('@/lib/supabase-ssr', () => ({
  createSupabaseSSRClient: jest.fn(),
}));

jest.mock('@/lib/supabase-authenticated', () => ({
  createAuthenticatedServiceClient: jest.fn(),
}));

import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';
import { POST } from '../create-profile/route';

const mockedCreateAuthClient = jest.mocked(createSupabaseSSRClient);
const mockedCreateServiceClient = jest.mocked(createAuthenticatedServiceClient);

const userId = '11111111-1111-4111-8111-111111111111';
const email = 'member@example.com';

const validMetadata = {
  kanji_last_name: '山田',
  kanji_first_name: '太郎',
  kana_last_name: 'ヤマダ',
  kana_first_name: 'タロウ',
  corporate_phone: '03-1234-5678',
  personal_phone: '090-1234-5678',
  business_type: 'INDIVIDUAL',
  company_name: '',
  postal_code: '123-4567',
  prefecture: '東京都',
  city: '千代田区',
  street: '丸の内1-1-1',
};

const completeProfile = {
  id: userId,
  email,
  kanji_last_name: '山田',
  kanji_first_name: '太郎',
  kana_last_name: 'ヤマダ',
  kana_first_name: 'タロウ',
  corporate_phone: '03-1234-5678',
  personal_phone: null,
  postal_code: '123-4567',
  prefecture: '東京都',
  city: '千代田区',
  street: '丸の内1-1-1',
};

function createRequest(userMetadata: unknown, overrides: Record<string, unknown> = {}) {
  return new NextRequest('http://localhost/api/auth/register/create-profile', {
    method: 'POST',
    body: JSON.stringify({ userId, email, userMetadata, ...overrides }),
    headers: { 'content-type': 'application/json' },
  });
}

type InsertResult = { data?: Record<string, unknown>; error?: { message: string; code?: string } };

function createServiceHarness(config: {
  existingProfile?: Record<string, unknown> | null;
  existingProfileError?: { message: string };
  profilesInsert?: InsertResult;
  deliveryInsert?: InsertResult;
  billingInsert?: InsertResult;
} = {}) {
  const insertPayloads: Record<string, Record<string, unknown>> = {};
  const insertResults: Record<string, InsertResult> = {
    profiles: config.profilesInsert ?? {
      data: { id: userId, email, ...validMetadata, status: 'PENDING' },
    },
    delivery_addresses: config.deliveryInsert ?? { data: { id: 'delivery-1' } },
    billing_addresses: config.billingInsert ?? { data: { id: 'billing-1' } },
  };
  const deleteCalls: Array<{ table: string; id: string }> = [];

  const createBuilder = (table: string) => {
    const state: { operation?: 'insert' | 'delete'; payload?: Record<string, unknown> } = {};
    const builder = {
      select: jest.fn(() => builder),
      insert: jest.fn((payload: Record<string, unknown>) => {
        state.operation = 'insert';
        state.payload = payload;
        insertPayloads[table] = payload;
        return builder;
      }),
      delete: jest.fn(() => {
        state.operation = 'delete';
        return builder;
      }),
      eq: jest.fn((column: string, value: string) => {
        if (state.operation === 'delete') {
          deleteCalls.push({ table, id: value });
          return Promise.resolve({ error: null });
        }
        expect(column).toBe('id');
        expect(value).toBe(userId);
        return builder;
      }),
      maybeSingle: jest.fn(async () => ({
        data: config.existingProfile ?? null,
        error: config.existingProfileError ?? null,
      })),
      single: jest.fn(async () => {
        expect(state.operation).toBe('insert');
        return insertResults[table];
      }),
    };
    return builder;
  };

  const builders: Record<string, ReturnType<typeof createBuilder>> = {};
  const from = jest.fn((table: string) => {
    builders[table] ??= createBuilder(table);
    return builders[table];
  });

  mockedCreateServiceClient.mockReturnValue({ from } as never);

  return {
    from,
    builders,
    insertPayloads,
    deleteCalls,
    insert: {
      get profiles() {
        return builders.profiles?.insert.mock.calls.length ?? 0;
      },
      get delivery() {
        return builders.delivery_addresses?.insert.mock.calls.length ?? 0;
      },
      get billing() {
        return builders.billing_addresses?.insert.mock.calls.length ?? 0;
      },
    },
  };
}

function mockAuthenticatedUser(user: Record<string, unknown> | null, error = null) {
  const getUser = jest.fn().mockResolvedValue({ data: { user }, error });
  mockedCreateAuthClient.mockResolvedValue({
    client: { auth: { getUser } },
    response: new NextResponse(),
  } as never);
  return getUser;
}

describe('POST /api/auth/register/create-profile (G002)', () => {
  let originalEnv: string;
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    originalEnv = process.env.NODE_ENV ?? 'test';
    process.env.NODE_ENV = 'production';
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('G01: returns 401 when there is no server-side Supabase session', async () => {
    mockAuthenticatedUser(null);
    const response = await POST(createRequest(validMetadata));

    expect(response.status).toBe(401);
    expect(mockedCreateServiceClient).not.toHaveBeenCalled();

    const body = await response.json();
    expect(body.error).toBe('認証が必要です。再度ログインしてください。');
  });

  it('G02: rejects an authenticated user-id mismatch with 403 before lookup or writes', async () => {
    mockAuthenticatedUser({ id: userId, email });
    const harness = createServiceHarness();
    const response = await POST(createRequest(validMetadata, { userId: 'other-user' }));

    expect(response.status).toBe(403);
    expect(harness.from).not.toHaveBeenCalled();

    const body = await response.json();
    expect(body.error.code).toBe('IDENTITY_MISMATCH');
  });

  it('G03: rejects an authenticated email mismatch with 403 before lookup or writes', async () => {
    mockAuthenticatedUser({ id: userId, email });
    const harness = createServiceHarness();
    const response = await POST(createRequest(validMetadata, { email: 'attacker@example.com' }));

    expect(response.status).toBe(403);
    expect(harness.from).not.toHaveBeenCalled();

    const body = await response.json();
    expect(body.error.code).toBe('IDENTITY_MISMATCH');
  });

  it('G04: rejects every incomplete metadata requirement with 400 before inserts', async () => {
    mockAuthenticatedUser({ id: userId, email });
    const requiredFields = [
      'kanji_last_name',
      'kanji_first_name',
      'kana_last_name',
      'kana_first_name',
      'postal_code',
      'prefecture',
      'city',
      'street',
    ] as const;

    for (const field of requiredFields) {
      const harness = createServiceHarness();
      const response = await POST(createRequest({ ...validMetadata, [field]: '   ' }));
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('入力データの検証に失敗しました。');
      expect(body.details[field]).toEqual(expect.any(Array));
      expect(harness.from).not.toHaveBeenCalled();
    }

    const phoneHarness = createServiceHarness();
    const phoneResponse = await POST(
      createRequest({ ...validMetadata, corporate_phone: '', personal_phone: '' }),
    );
    const phoneBody = await phoneResponse.json();

    expect(phoneResponse.status).toBe(400);
    expect(phoneBody.details.corporate_phone).toEqual(expect.any(Array));
    expect(phoneHarness.from).not.toHaveBeenCalled();
  });

  it('G05: creates a profile and both required default addresses for valid metadata', async () => {
    mockAuthenticatedUser({ id: userId, email });
    const harness = createServiceHarness();
    const response = await POST(createRequest(validMetadata));

    expect(response.status).toBe(200);
    expect(harness.insert.profiles).toBe(1);
    expect(harness.insertPayloads.profiles).toMatchObject({
      id: userId,
      email,
      role: 'MEMBER',
      status: 'PENDING',
    });
    expect(harness.insert.delivery).toBe(1);
    expect(harness.insertPayloads.delivery_addresses).toMatchObject({
      user_id: userId,
      phone: validMetadata.corporate_phone,
      is_default: true,
    });
    expect(harness.insert.billing).toBe(1);
    expect(harness.insertPayloads.billing_addresses).toMatchObject({
      user_id: userId,
      email,
      phone: validMetadata.corporate_phone,
      is_default: true,
    });

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(harness.deleteCalls).toEqual([]);
  });

  it('G05a: rejects whitespace-only phones and never treats them as a valid phone', async () => {
    mockAuthenticatedUser({ id: userId, email });
    const harness = createServiceHarness();
    const response = await POST(
      createRequest({
        ...validMetadata,
        corporate_phone: '   ',
        personal_phone: '090-1234-5678',
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.details.corporate_phone).toEqual(expect.any(Array));
    expect(harness.from).not.toHaveBeenCalled();
  });

  it('G05b: trims the selected phone and persists null for the empty phone', async () => {
    mockAuthenticatedUser({ id: userId, email });
    const harness = createServiceHarness();
    const response = await POST(
      createRequest({
        ...validMetadata,
        corporate_phone: '',
        personal_phone: ' 090-1234-5678 ',
      }),
    );

    expect(response.status).toBe(200);
    expect(harness.insertPayloads.profiles).toMatchObject({
      corporate_phone: null,
      personal_phone: '090-1234-5678',
    });
    expect(harness.insertPayloads.delivery_addresses).toMatchObject({
      phone: '090-1234-5678',
    });
    expect(harness.insertPayloads.billing_addresses).toMatchObject({
      phone: '090-1234-5678',
    });
  });

  it('G06: compensates the created profile when delivery insert fails', async () => {
    mockAuthenticatedUser({ id: userId, email });
    const harness = createServiceHarness({
      deliveryInsert: { error: { message: 'delivery insert failed' } },
    });
    const response = await POST(createRequest(validMetadata));

    expect(response.status).toBe(500);
    expect(harness.insert.profiles).toBe(1);
    expect(harness.insert.billing).toBe(0);
    expect(harness.deleteCalls).toEqual([{ table: 'profiles', id: userId }]);

    const body = await response.json();
    expect(body.success).toBe(false);
  });

  it('G06: compensates delivery and profile when billing insert fails', async () => {
    mockAuthenticatedUser({ id: userId, email });
    const harness = createServiceHarness({
      billingInsert: { error: { message: 'billing insert failed' } },
    });
    const response = await POST(createRequest(validMetadata));

    expect(response.status).toBe(500);
    expect(harness.deleteCalls).toEqual([
      { table: 'delivery_addresses', id: 'delivery-1' },
      { table: 'profiles', id: userId },
    ]);

    const body = await response.json();
    expect(body.success).toBe(false);
  });

  it('G07: production logs omit all request PII', async () => {
    mockAuthenticatedUser({ id: userId, email });
    createServiceHarness();
    await POST(createRequest(validMetadata));

    const logs = [
      ...consoleLogSpy.mock.calls,
      ...consoleWarnSpy.mock.calls,
      ...consoleErrorSpy.mock.calls,
    ].map((call) => JSON.stringify(call)).join('\n');

    expect(logs).not.toContain(email);
    expect(logs).not.toContain(validMetadata.kanji_last_name);
    expect(logs).not.toContain(validMetadata.kanji_first_name);
    expect(logs).not.toContain(validMetadata.kana_last_name);
    expect(logs).not.toContain(validMetadata.corporate_phone);
    expect(logs).not.toContain(validMetadata.postal_code);
    expect(logs).not.toContain(validMetadata.street);
  });

  it('G08: returns idempotent success for an existing complete profile', async () => {
    mockAuthenticatedUser({ id: userId, email });
    const harness = createServiceHarness({ existingProfile: completeProfile });
    const response = await POST(createRequest(validMetadata));

    expect(response.status).toBe(200);
    expect(harness.insert.profiles).toBe(0);
    expect(harness.insert.delivery).toBe(0);
    expect(harness.insert.billing).toBe(0);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.profile).toEqual({ id: userId, email });
  });

  it('G09: returns PROFILE_INCOMPLETE for an existing incomplete profile without writes', async () => {
    mockAuthenticatedUser({ id: userId, email });
    const harness = createServiceHarness({
      existingProfile: { ...completeProfile, city: null },
    });
    const response = await POST(createRequest(validMetadata));

    expect(response.status).toBe(409);
    expect(harness.insert.profiles).toBe(0);
    expect(harness.insert.delivery).toBe(0);
    expect(harness.insert.billing).toBe(0);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('PROFILE_INCOMPLETE');
    expect(body.error.message).toContain('プロフィール完了画面');
  });

  it('G10: validates metadata before checking the existing-profile early return', async () => {
    mockAuthenticatedUser({ id: userId, email });
    const harness = createServiceHarness({ existingProfile: completeProfile });
    const response = await POST(createRequest({ ...validMetadata, street: '' }));

    expect(response.status).toBe(400);
    expect(harness.from).not.toHaveBeenCalled();

    const body = await response.json();
    expect(body.details.street).toEqual(expect.any(Array));
  });

  it('G11: fails closed with 500 when the existing-profile lookup errors', async () => {
    mockAuthenticatedUser({ id: userId, email });
    const harness = createServiceHarness({
      existingProfileError: { message: 'lookup failed' },
    });
    const response = await POST(createRequest(validMetadata));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('プロフィールの確認に失敗しました。');
    expect(harness.insert.profiles).toBe(0);
    expect(harness.insert.delivery).toBe(0);
    expect(harness.insert.billing).toBe(0);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[CREATE-PROFILE] existing profile lookup failed',
      { requestId: expect.any(String), userId },
    );
  });
});
