import { NextRequest } from 'next/server';

jest.mock('@/lib/supabase', () => ({
  createServiceClient: jest.fn(),
}));

jest.mock('@/lib/api-auth', () => ({
  withAdminAuth: (handler: unknown) => handler,
}));

jest.mock('@/lib/api-error-handler', () => ({
  withApiHandler: (handler: unknown) => handler,
}));

import { GET as getAdminSamples } from '../route';
import { GET as getAdminInquiries } from '@/app/api/admin/inquiries/route';
import { createServiceClient } from '@/lib/supabase';

const mockedCreateServiceClient = jest.mocked(createServiceClient);

const requestNumber = 'SMP-2026-1234';
const sampleRow = {
  id: 'request-1',
  request_number: requestNumber,
  created_at: '2026-01-02T00:00:00.000Z',
  status: 'received',
  user_id: 'member-1',
  destinations: [{
    id: 'destination-1',
    company_name: '株式会社サンプル',
    contact_person: '山田 太郎',
    postal_code: '100-0001',
    address: '東京都千代田区千代田1-1',
    label_prints: [{ status: 'pending' }],
  }],
};

function serviceClient() {
  return {
    rpc: jest.fn().mockResolvedValue({
      data: [{
        id: 'inquiry-1',
        request_number: requestNumber,
        inquiry_number: 'CTC-1',
        type: 'sample',
        status: 'pending',
        subject: 'サンプル依頼',
        message: 'パウチサンプルセットをご依頼いたします。',
        customer_name: '山田 太郎',
        email: 'member@example.com',
        order_id: null,
      }],
      error: null,
    }),
    from: jest.fn((table: string) => {
      const builder = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue(
          table === 'sample_requests'
            ? { data: [sampleRow], error: null }
            : { data: [{ id: 'member-1', kanji_last_name: '山田', kanji_first_name: '太郎' }], error: null },
        ),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [sampleRow], error: null }),
      };
      return builder;
    }),
  };
}

describe('G006 admin traceability', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('I09: admin inquiry API traces a member submission by shared request number', async () => {
    const supabase = serviceClient();
    mockedCreateServiceClient.mockReturnValueOnce(supabase as never);

    const response = await getAdminInquiries(
      new NextRequest('http://localhost/api/admin/inquiries?type=sample'),
    );
    const body = await response.json();

    expect(supabase.from).toHaveBeenCalledWith('sample_requests');
    expect(body.data[0]).toMatchObject({
      inquiryNumber: 'CTC-1',
      sampleLabel: {
        id: 'request-1',
        requestNumber,
        destinationCount: 1,
        printStatus: 'printing',
      },
    });
  });

  it('M04/I10: admin sample API preserves request status and pending label status', async () => {
    const supabase = serviceClient();
    mockedCreateServiceClient.mockReturnValueOnce(supabase as never);

    const response = await getAdminSamples(
      new NextRequest('http://localhost/api/admin/samples'),
    );
    const body = await response.json();

    expect(supabase.from).toHaveBeenCalledWith('sample_requests');
    expect(body.items[0]).toMatchObject({
      id: 'request-1',
      requestNumber,
      customerName: '山田 太郎',
      status: 'received',
      printSummary: '0/1',
    });
    expect(body.items[0].destinations[0]).toEqual({
      id: 'destination-1',
      companyName: '株式会社サンプル',
      contactPerson: '山田 太郎',
      printStatus: 'pending',
    });
  });
});
