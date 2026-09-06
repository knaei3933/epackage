import { NextRequest } from 'next/server';

jest.mock('@/lib/samples/create-fixed-sample-request', () => ({
  createMemberFixedSampleRequest: jest.fn(),
}));

jest.mock('@/lib/samples/member-sample-notifications', () => ({
  scheduleMemberSampleNotifications: jest.fn(),
}));

jest.mock('@/lib/supabase-ssr', () => ({
  createSupabaseSSRClient: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  createServiceClient: jest.fn(),
}));

jest.mock('@/lib/supabase-authenticated', () => ({
  createAuthenticatedServiceClient: jest.fn(),
}));

import { GET, POST } from '../route';
import { createMemberFixedSampleRequest } from '@/lib/samples/create-fixed-sample-request';
import { scheduleMemberSampleNotifications } from '@/lib/samples/member-sample-notifications';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { createServiceClient } from '@/lib/supabase';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

const mockedPipeline = jest.mocked(createMemberFixedSampleRequest);
const mockedScheduleNotifications = jest.mocked(scheduleMemberSampleNotifications);
const mockedCreateAuthClient = jest.mocked(createSupabaseSSRClient);
const mockedCreateServiceClient = jest.mocked(createServiceClient);
const mockedCreateAuthenticatedServiceClient = jest.mocked(
  createAuthenticatedServiceClient,
);

const activeUserId = 'member-active';

const validConfirmation = {
  contactPerson: '山田 太郎',
  phone: '03-1234-5678',
  postalCode: '100-0001',
  prefecture: '東京都',
  city: '千代田区',
  street: '千代田1-1',
  companyName: '株式会社サンプル',
  building: 'サンプルビル',
};

const createdIds = {
  inquiryId: 'inquiry-1',
  sampleRequestId: 'request-1',
  sampleItemId: 'item-1',
  destinationId: 'destination-1',
  labelId: 'label-1',
  inquiryNumber: 'CTC-2026-inquiry',
  requestNumber: 'SMP-2026-0001',
};

function postRequest(body: unknown) {
  return new NextRequest('http://localhost/api/member/samples', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

function setupAuth(
  user: Record<string, unknown> | null,
  options: { authError?: { message: string; status?: number } | null } = {},
) {
  const profileBuilder = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({
      data: user
        ? {
            id: user.id,
            status: 'ACTIVE',
            kana_last_name: 'ヤマダ',
            kana_first_name: 'タロウ',
          }
        : null,
      error: null,
    }),
  };
  const authClient = {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user },
        error: Object.prototype.hasOwnProperty.call(options, 'authError')
          ? options.authError
          : user
            ? null
            : { message: 'not signed in' },
      }),
    },
    from: jest.fn(() => profileBuilder),
  };
  mockedCreateAuthClient.mockResolvedValue({ client: authClient } as never);
  const serviceClient = { from: jest.fn() };
  mockedCreateAuthenticatedServiceClient.mockReturnValue(serviceClient as never);
  return { authClient, serviceClient, profileBuilder };
}

function mockPipeline(result: Record<string, unknown>) {
  mockedPipeline.mockResolvedValueOnce(result as never);
}

describe('member samples API (G006)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('I11: returns an empty GET history only when authentication confirms no user', async () => {
    setupAuth(null, { authError: null });

    const response = await GET(
      new NextRequest('http://localhost/api/member/samples'),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true, data: [] });
  });

  it('I12: returns 500 when GET cannot construct the auth client', async () => {
    mockedCreateAuthClient.mockRejectedValueOnce(
      new Error('missing Supabase environment'),
    );

    const response = await GET(
      new NextRequest('http://localhost/api/member/samples'),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toMatchObject({
      success: false,
      error_code: 'AUTH_CLIENT_UNAVAILABLE',
    });
    expect(body.error).toMatch(/[ぁ-ん]/);
    expect(mockedCreateServiceClient).not.toHaveBeenCalled();
  });

  it('I12: returns 500 when the GET authentication check itself fails', async () => {
    setupAuth(
      { id: activeUserId },
      { authError: { message: 'auth unavailable' } },
    );

    const response = await GET(
      new NextRequest('http://localhost/api/member/samples'),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toMatchObject({
      success: false,
      error_code: 'AUTHENTICATION_CHECK_FAILED',
    });
    expect(body.error).toMatch(/[ぁ-ん]/);
  });

  it('I12: returns 500 when GET client/query infrastructure fails', async () => {
    setupAuth({ id: activeUserId });
    mockedCreateServiceClient.mockImplementationOnce(() => {
      throw new Error('service client unavailable');
    });

    const response = await GET(
      new NextRequest('http://localhost/api/member/samples'),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toMatchObject({ success: false, code: 'FETCH_ERROR' });
    expect(body.error).toMatch(/[ぁ-ん]/);
  });

  it('I12: returns 500 when a successful GET result cannot be transformed', async () => {
    setupAuth({ id: activeUserId });
    mockedCreateServiceClient.mockReturnValue({
      from: jest.fn(() => {
        throw new Error('transformation fixture');
      }),
    } as never);

    const response = await GET(
      new NextRequest('http://localhost/api/member/samples'),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toMatchObject({ success: false, code: 'FETCH_ERROR' });
    expect(body.error).toMatch(/[ぁ-ん]/);
  });

  it('I12: distinguishes POST auth-client infrastructure failure from 401', async () => {
    mockedCreateAuthClient.mockRejectedValueOnce(
      new Error('invalid auth configuration'),
    );

    const response = await POST(postRequest(validConfirmation));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toMatchObject({
      success: false,
      error_code: 'AUTH_CLIENT_UNAVAILABLE',
    });
    expect(body.error).toMatch(/[ぁ-ん]/);
    expect(mockedPipeline).not.toHaveBeenCalled();
  });

  it('I12: distinguishes POST service-client infrastructure failure from 401', async () => {
    setupAuth({ id: activeUserId });
    mockedCreateAuthenticatedServiceClient.mockImplementationOnce(() => {
      throw new Error('service role configuration unavailable');
    });

    const response = await POST(postRequest(validConfirmation));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toMatchObject({
      success: false,
      error_code: 'SERVICE_CLIENT_UNAVAILABLE',
    });
    expect(body.error).toMatch(/[ぁ-ん]/);
    expect(mockedPipeline).not.toHaveBeenCalled();
  });

  it('I01: rejects unauthenticated POST with 401', async () => {
    setupAuth(null);
    const response = await POST(postRequest(validConfirmation));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toMatchObject({ success: false, error_code: 'UNAUTHORIZED' });
    expect(mockedPipeline).not.toHaveBeenCalled();
  });

  it.each(['PENDING', 'SUSPENDED', 'DELETED'])(
    'I02: rejects a %s member with 403',
    async (status) => {
      const { profileBuilder } = setupAuth({ id: `member-${status}`, email: 'm@example.com' });
      profileBuilder.maybeSingle.mockResolvedValueOnce({
        data: { id: `member-${status}`, status },
        error: null,
      });

      const response = await POST(postRequest(validConfirmation));
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error_code).toBe('MEMBER_NOT_ACTIVE');
    expect(mockedPipeline).not.toHaveBeenCalled();
    },
  );

  it('I03: submits an ACTIVE member with an audited service client and session ownership', async () => {
    const { serviceClient, profileBuilder } = setupAuth({
      id: activeUserId,
      email: 'session@example.com',
    });
    mockPipeline({ status: 'created', ...createdIds });

    const response = await POST(postRequest(validConfirmation));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({ success: true, data: createdIds });
    expect(mockedCreateAuthenticatedServiceClient).toHaveBeenCalledWith({
      operation: 'create_member_fixed_sample_request',
      userId: activeUserId,
      route: '/api/member/samples',
    });
    expect(profileBuilder.eq).toHaveBeenCalledWith('id', activeUserId);
    expect(mockedPipeline).toHaveBeenCalledWith(
      expect.objectContaining({
        supabase: serviceClient,
        userId: activeUserId,
        sessionEmail: 'session@example.com',
        confirmation: validConfirmation,
        profileKana: { lastName: 'ヤマダ', firstName: 'タロウ' },
      }),
    );
  });

  it('M01: logs committed IDs without full phone or address data', async () => {
    setupAuth({ id: activeUserId, email: 'session@example.com' });
    mockPipeline({ status: 'created', ...createdIds });
    const logSpy = jest.spyOn(console, 'log');

    const response = await POST(postRequest(validConfirmation));

    expect(response.status).toBe(201);
    expect(logSpy).toHaveBeenCalledWith(
      '[samples API] Fixed member sample created',
      {
        inquiryId: 'inquiry-1',
        sampleRequestId: 'request-1',
        sampleItemId: 'item-1',
        destinationId: 'destination-1',
        labelId: 'label-1',
        inquiryNumber: 'CTC-2026-inquiry',
        requestNumber: 'SMP-2026-0001',
      },
    );
    expect(logSpy.mock.calls.map(([, metadata]) => JSON.stringify(metadata)).join('\n'))
      .not.toContain('03-1234-5678');
    expect(logSpy.mock.calls.map(([, metadata]) => JSON.stringify(metadata)).join('\n'))
      .not.toContain('100-0001');
    expect(mockedScheduleNotifications).toHaveBeenCalledTimes(1);
  });

  it('I04: rejects an invalid confirmation with 400 and creates no records', async () => {
    setupAuth({ id: 'member-invalid', email: 'm@example.com' });
    const response = await POST(postRequest({ ...validConfirmation, phone: 'invalid' }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error_code).toBe('VALIDATION_ERROR');
    expect(body.details.phone).toEqual([expect.any(String)]);
    expect(mockedPipeline).not.toHaveBeenCalled();
  });

  it('I05: returns 500 for a pre-label pipeline failure without exposing created rows', async () => {
    setupAuth({ id: 'member-pipeline', email: 'm@example.com' });
    mockPipeline({
      status: 'failed',
      stage: 'destination',
      compensation: { status: 'completed', deleted: [], errors: [] },
      createdRows: [],
    });

    const response = await POST(postRequest(validConfirmation));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toMatchObject({
      success: false,
      error_code: 'SAMPLE_PIPELINE_FAILED',
      stage: 'destination',
    });
  });

  it('I06: exposes the pending label ID only after the pipeline reports successful creation', async () => {
    setupAuth({ id: 'member-label', email: 'm@example.com' });
    mockPipeline({ status: 'created', ...createdIds });

    const response = await POST(postRequest(validConfirmation));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.labelId).toBe('label-1');
    expect(mockedPipeline).toHaveBeenCalledTimes(1);
  });

  it('I07: keeps submission successful when post-label notification handling fails', async () => {
    setupAuth({ id: 'member-notify', email: 'm@example.com' });
    mockPipeline({ status: 'created', ...createdIds });
    mockedScheduleNotifications.mockImplementationOnce(() => {
      throw new Error('notification scheduling failed');
    });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const response = await POST(postRequest(validConfirmation));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(mockedScheduleNotifications).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(
      '[samples API] Notification scheduling failed',
      expect.objectContaining({ sampleRequestId: 'request-1' }),
    );
  });

  it('I08: filters member history GET by sample_requests.user_id', async () => {
    const history = [{
      id: 'request-1',
      user_id: activeUserId,
      request_number: 'SMP-2026-0001',
      status: 'received',
      sample_items: [],
    }];
    const historyBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn((resolve: (value: unknown) => void) =>
        resolve({ data: history, error: null }),
      ),
    };
    const { authClient } = setupAuth({ id: activeUserId, email: 'm@example.com' });
    authClient.from.mockImplementation((table: string) =>
      table === 'sample_requests' ? historyBuilder : profileBuilder,
    );

    const request = new NextRequest('http://localhost/api/member/samples');
    const response = await GET(request);
    const body = await response.json();

    expect(historyBuilder.eq).toHaveBeenCalledWith('user_id', activeUserId);
    expect(mockedCreateServiceClient).not.toHaveBeenCalled();
    expect(body.data[0]).toMatchObject({
      id: 'request-1',
      userId: activeUserId,
      requestNumber: 'SMP-2026-0001',
      status: 'received',
    });
  });

  it('returns 429 after three POST submissions for the same member', async () => {
    const memberId = 'member-rate-limited';
    for (let index = 0; index < 3; index += 1) {
      setupAuth({ id: memberId, email: 'm@example.com' });
      mockPipeline({ status: 'created', ...createdIds });
      const response = await POST(postRequest(validConfirmation));
      expect(response.status).toBe(201);
    }

    setupAuth({ id: memberId, email: 'm@example.com' });
    const response = await POST(postRequest(validConfirmation));
    expect(response.status).toBe(429);
    expect(mockedPipeline).toHaveBeenCalledTimes(3);
  });
});
