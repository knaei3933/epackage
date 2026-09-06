import { NextRequest } from 'next/server';

jest.mock('@/lib/supabase-ssr', () => ({
  createSupabaseSSRClient: jest.fn(),
}));

jest.mock('@/lib/supabase-authenticated', () => ({
  createAuthenticatedServiceClient: jest.fn(),
}));

jest.mock('@/lib/samples/member-sample-notifications', () => ({
  scheduleMemberSampleNotifications: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  createServiceClient: jest.fn(),
}));

jest.mock('@/lib/api-auth', () => ({
  withAdminAuth: (handler: unknown) => handler,
}));

import { POST as postMemberSamples } from '../route';
import { GET as getAdminSamples } from '@/app/api/admin/samples/route';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';
import { scheduleMemberSampleNotifications } from '@/lib/samples/member-sample-notifications';
import { createServiceClient } from '@/lib/supabase';

const mockedCreateAuth = jest.mocked(createSupabaseSSRClient);
const mockedCreateService = jest.mocked(createAuthenticatedServiceClient);
const mockedSchedule = jest.mocked(scheduleMemberSampleNotifications);
const mockedAdminService = jest.mocked(createServiceClient);

const userId = 'member-traceability';
const confirmation = {
  contactPerson: '山田 太郎',
  phone: '03-1234-5678',
  postalCode: '100-0001',
  prefecture: '東京都',
  city: '千代田区',
  street: '千代田1-1',
  companyName: '株式会社サンプル',
  building: 'サンプルビル',
};

function postRequest() {
  return new NextRequest('http://localhost/api/member/samples', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(confirmation),
  });
}

function createMemberServiceClient() {
  const ids: Record<string, string> = {
    inquiries: 'inquiry-1',
    sample_requests: 'request-1',
    sample_items: 'item-1',
    sample_request_destinations: 'destination-1',
    label_prints: 'label-1',
  };
  const inserted: Record<string, unknown[]> = {};
  const service = {
    inserted,
    from: jest.fn((table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  id: userId,
                  status: 'ACTIVE',
                  kana_last_name: 'ヤマダ',
                  kana_first_name: 'タロウ',
                },
                error: null,
              }),
            }),
          }),
        };
      }

      return {
        insert: jest.fn((payload: unknown) => {
          (inserted[table] ??= []).push(payload);
          return {
            select: () => ({
              single: async () => ({ data: { id: ids[table] }, error: null }),
            }),
          };
        }),
      };
    }),
  };
  return service;
}

describe('member submission to label-agent traceability (G008)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('L01: creates a member submission, pending label, and admin traceability', async () => {
    const authClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: userId, email: 'member@example.com' } },
          error: null,
        }),
      },
      from: jest.fn(() => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: {
                id: userId,
                status: 'ACTIVE',
                kana_last_name: 'ヤマダ',
                kana_first_name: 'タロウ',
              },
              error: null,
            }),
          }),
        }),
      })),
    };
    const memberService = createMemberServiceClient();
    mockedCreateAuth.mockResolvedValue({ client: authClient } as never);
    mockedCreateService.mockReturnValue(memberService as never);

    const submission = await postMemberSamples(postRequest());
    const submissionBody = await submission.json();

    expect(submission.status).toBe(201);
    expect(submissionBody).toEqual({
      success: true,
      data: {
        inquiryId: 'inquiry-1',
        sampleRequestId: 'request-1',
        sampleItemId: 'item-1',
        destinationId: 'destination-1',
        labelId: 'label-1',
        inquiryNumber: expect.stringMatching(/^CTC-\d+-[0-9a-z]{9}$/),
        requestNumber: expect.stringMatching(/^SMP-\d{4}-\d{4}$/),
      },
    });
    expect(memberService.inserted.sample_requests?.[0]).toMatchObject({
      user_id: userId,
      status: 'received',
    });
    expect(memberService.inserted.sample_request_destinations?.[0]).toMatchObject({
      sample_request_id: 'request-1',
      contact_person: confirmation.contactPerson,
      phone: confirmation.phone,
    });
    expect(memberService.inserted.label_prints?.[0]).toEqual({
      destination_id: 'destination-1',
      requested_by: userId,
      source: 'batch',
      status: 'pending',
    });
    expect(mockedSchedule).toHaveBeenCalledWith(
      expect.objectContaining({
        inquiryId: 'inquiry-1',
        sampleRequestId: 'request-1',
        sampleItemId: 'item-1',
        destinationId: 'destination-1',
        labelId: 'label-1',
        inquiryNumber: submissionBody.data.inquiryNumber,
        requestNumber: submissionBody.data.requestNumber,
      }),
    );

    const labelRow = {
      id: 'request-1',
      request_number: submissionBody.data.requestNumber,
      created_at: '2026-01-02T00:00:00.000Z',
      status: 'received',
      user_id: userId,
      destinations: [{
        id: 'destination-1',
        company_name: confirmation.companyName,
        contact_person: confirmation.contactPerson,
        postal_code: confirmation.postalCode,
        address: `${confirmation.prefecture}${confirmation.city}${confirmation.street}（${confirmation.building}）`,
        label_prints: [{ status: 'pending' }],
      }],
    };
    mockedAdminService.mockReturnValue({
      from: jest.fn((table: string) => ({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue(
          table === 'sample_requests'
            ? { data: [labelRow], error: null }
            : { data: [{ id: userId, kanji_last_name: '山田', kanji_first_name: '太郎' }], error: null },
        ),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [labelRow], error: null }),
      })),
    } as never);

    const adminResponse = await getAdminSamples(
      new NextRequest('http://localhost/api/admin/samples'),
    );
    const adminBody = await adminResponse.json();

    expect(adminBody.items[0]).toMatchObject({
      id: 'request-1',
      requestNumber: submissionBody.data.requestNumber,
      customerName: confirmation.contactPerson,
      status: 'received',
      printSummary: '0/1',
    });
    expect(adminBody.items[0].destinations[0]).toMatchObject({
      id: 'destination-1',
      printStatus: 'pending',
    });
  });
});
