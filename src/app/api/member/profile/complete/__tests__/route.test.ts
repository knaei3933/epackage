import { NextRequest, NextResponse } from 'next/server';

jest.mock('@/lib/supabase-ssr', () => ({
  createSupabaseSSRClient: jest.fn(),
}));

import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { POST } from '../route';

const mockedCreateAuthClient = jest.mocked(createSupabaseSSRClient);

const userId = '11111111-1111-4111-8111-111111111111';
const email = 'member@example.com';

const completeInput = {
  kanji_last_name: '山田',
  kanji_first_name: '太郎',
  kana_last_name: 'ヤマダ',
  kana_first_name: 'タロウ',
  corporate_phone: '03-1234-5678',
  postal_code: '123-4567',
  prefecture: '東京都',
  city: '千代田区',
  street: '丸の内1-1-1',
};

const emptyProfile = {
  id: userId,
  kanji_last_name: null,
  kanji_first_name: null,
  kana_last_name: null,
  kana_first_name: null,
  corporate_phone: null,
  personal_phone: null,
  postal_code: null,
  prefecture: null,
  city: null,
  street: null,
  status: 'ACTIVE',
  updated_at: '2026-01-01T00:00:00.000Z',
};

function createRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/member/profile/complete', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

function mockAuthenticatedUser(user: Record<string, unknown> | null, error = null) {
  const getUser = jest.fn().mockResolvedValue({ data: { user }, error });
  mockedCreateAuthClient.mockResolvedValue({
    client: { auth: { getUser }, from: createFrom() },
    response: new NextResponse(),
  } as never);
  return getUser;
}

function createFrom(config: {
  profile?: Record<string, unknown> | null;
  updateError?: { message: string };
  updateRows?: Array<Record<string, unknown>>;
} = {}) {
  const updatePayloads: Record<string, unknown>[] = [];
  const builder = {
    select: jest.fn(() => builder),
    update: jest.fn((payload: Record<string, unknown>) => {
      updatePayloads.push(payload);
      return builder;
    }),
    eq: jest.fn(() => builder),
    maybeSingle: jest.fn(async () => ({
      data: config.profile ?? null,
      error: null,
    })),
  };

  builder.select.mockImplementation(() => {
    if (builder.update.mock.calls.length === 0) return builder;
    return Promise.resolve({
      data: config.updateError ? [] : config.updateRows ?? [{ id: userId }],
      error: config.updateError ?? null,
    });
  });

  return {
    from: jest.fn(() => builder),
    builder,
    updatePayloads,
  };
}

function useProfileHarness(config?: Parameters<typeof createFrom>[0]) {
  const harness = createFrom(config);
  mockedCreateAuthClient.mockResolvedValue({
    client: {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: userId, email }, error: null } }) },
      from: harness.from,
    },
    response: new NextResponse(),
  } as never);
  return harness;
}

describe('POST /api/member/profile/complete (G003)', () => {
  it('H01: rejects an unauthenticated completion with 401', async () => {
    mockAuthenticatedUser(null);
    const response = await POST(createRequest(completeInput));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error_code).toBe('UNAUTHORIZED');
    expect(body.success).toBe(false);
  });

  it('H02/B07: rejects a cross-user id with 403 before profile access', async () => {
    const harness = useProfileHarness({ profile: emptyProfile });
    const response = await POST(createRequest({
      ...completeInput,
      userId: '22222222-2222-4222-8222-222222222222',
    }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error_code).toBe('PROFILE_OWNER_MISMATCH');
    expect(harness.from).not.toHaveBeenCalled();
  });

  it('H03/B07: rejects a PENDING member with 403 without updates', async () => {
    const harness = useProfileHarness({ profile: { ...emptyProfile, status: 'PENDING' } });
    const response = await POST(createRequest(completeInput));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error_code).toBe('PROFILE_NOT_ACTIVE');
    expect(harness.builder.update).not.toHaveBeenCalled();
  });

  it('H04/B05: fills only submitted empty required fields and returns the return path', async () => {
    const harness = useProfileHarness({ profile: emptyProfile });
    const response = await POST(createRequest({ ...completeInput, returnTo: '/samples?from=profile' }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.returnTo).toBe('/samples?from=profile');
    expect(harness.builder.update).toHaveBeenCalledTimes(1);
    expect(harness.updatePayloads[0]).toEqual({
      ...completeInput,
      updated_at: expect.any(String),
    });
    expect(harness.builder.eq).toHaveBeenNthCalledWith(1, 'id', userId);
    expect(harness.builder.eq).toHaveBeenNthCalledWith(2, 'id', userId);
    expect(harness.builder.eq).toHaveBeenNthCalledWith(
      3,
      'updated_at',
      emptyProfile.updated_at,
    );
  });

  it('H05/B06: rejects an attempt to overwrite a non-empty approved phone with 409 and no update', async () => {
    const harness = useProfileHarness({
      profile: { ...emptyProfile, corporate_phone: '03-0000-0000' },
    });
    const response = await POST(createRequest(completeInput));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error_code).toBe('APPROVED_FIELD_CONFLICT');
    expect(body.details.corporate_phone).toEqual(expect.any(Array));
    expect(harness.builder.update).not.toHaveBeenCalled();
  });

  it('keeps the completion schema on signup Japanese rules', async () => {
    useProfileHarness({ profile: emptyProfile });
    const response = await POST(createRequest({ ...completeInput, kana_last_name: 'Yamada' }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error_code).toBe('VALIDATION_ERROR');
    expect(body.details.kana_last_name).toEqual(['ひらがなで入力してください。']);
  });

  it('rejects completion when a required phone is still missing', async () => {
    const harness = useProfileHarness({ profile: emptyProfile });
    const response = await POST(createRequest({
      ...completeInput,
      corporate_phone: '',
    }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error_code).toBe('PROFILE_INCOMPLETE');
    expect(body.details._form).toEqual(expect.any(Array));
    expect(harness.builder.update).not.toHaveBeenCalled();
  });

  it('returns 409 and leaves the snapshot untouched when optimistic locking updates zero rows', async () => {
    const harness = useProfileHarness({
      profile: emptyProfile,
      updateError: null,
      updateRows: [],
    });
    const response = await POST(createRequest(completeInput));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toMatchObject({
      success: false,
      error_code: 'PROFILE_CONCURRENCY_CONFLICT',
      error: expect.stringContaining('画面を再読み込み'),
    });
    expect(harness.builder.update).toHaveBeenCalledTimes(1);
    expect(harness.updatePayloads[0]).toMatchObject(completeInput);
    expect(harness.builder.eq).toHaveBeenCalledWith(
      'updated_at',
      emptyProfile.updated_at,
    );
  });
});
