import { NextRequest } from 'next/server';

jest.mock('@/lib/supabase', () => ({
  createServiceClient: jest.fn(),
}));

jest.mock('@/lib/admin-notifications', () => ({
  createAdminNotification: jest.fn(),
}));

jest.mock('@/lib/email', () => ({
  sendSampleRequestEmail: jest.fn(),
}));

import { POST } from '../route';
import { createServiceClient } from '@/lib/supabase';
import { createAdminNotification } from '@/lib/admin-notifications';
import { sendSampleRequestEmail } from '@/lib/email';

const mockedCreateServiceClient = jest.mocked(createServiceClient);
const mockedCreateAdminNotification = jest.mocked(createAdminNotification);
const mockedSendEmail = jest.mocked(sendSampleRequestEmail);

const guestRequest = {
  customerInfo: {
    companyName: '株式会社ゲスト',
    contactPerson: '鈴木 花子',
    email: 'guest@example.com',
    phone: '03-1234-5678',
  },
  deliveryType: 'normal',
  deliveryDestinations: [{
    companyName: '株式会社ゲスト',
    contactPerson: '鈴木 花子',
    phone: '03-1234-5678',
    postalCode: '150-0001',
    address: '渋谷区神宮前1-2-3',
    isPrimary: true,
  }],
  samples: [{
    productId: 'pouch-01',
    productName: 'パウチサンプル',
    category: 'PACKAGING',
    quantity: 1,
  }],
  message: '既存の公開申込経路の回帰確認です。',
  urgency: 'normal',
  privacyConsent: true,
};

function createRequest(body: unknown) {
  return new NextRequest('http://localhost/api/samples/request', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function createGuestServiceClient() {
  const inserted: Record<string, unknown[]> = {};
  return {
    inserted,
    client: {
      auth: { getUser: jest.fn() },
      from: jest.fn((table: string) => {
        if (table === 'profiles') {
          return {
            select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
          };
        }
        return {
          insert: jest.fn((payload: unknown) => {
            (inserted[table] ??= []).push(payload);
            if (table === 'sample_requests') {
              return { select: () => ({ single: async () => ({ data: { id: 'guest-request-1' }, error: null }) }) };
            }
            return { select: () => ({ single: async () => ({ data: { id: `${table}-1` }, error: null }) }) };
          }),
          delete: jest.fn(() => ({ eq: jest.fn() })),
        };
      }),
    },
  };
}

describe('guest sample request route regression (G008)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockedSendEmail.mockResolvedValue({
      success: true,
      customerEmail: { messageId: 'customer-1' },
      adminEmail: { messageId: 'admin-1' },
      errors: [],
    } as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('J03 guard: rejects a guest with no contact path before any public-path writes', async () => {
    const { customerInfo, ...withoutContact } = guestRequest;
    const supabase = createGuestServiceClient();
    mockedCreateServiceClient.mockReturnValue(supabase.client as never);

    const response = await POST(createRequest(withoutContact));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe('お客様情報が不足しています');
    expect(supabase.client.from).not.toHaveBeenCalled();
    expect(mockedSendEmail).not.toHaveBeenCalled();
  });

  it('J02/L02: preserves the public contact path and writes a printable guest destination', async () => {
    const supabase = createGuestServiceClient();
    mockedCreateServiceClient.mockReturnValue(supabase.client as never);

    const response = await POST(createRequest(guestRequest));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.sampleRequestId).toBe('guest-request-1');
    expect(supabase.inserted.sample_requests?.[0]).toMatchObject({
      user_id: null,
      status: 'received',
      notes: guestRequest.message,
    });
    expect(supabase.inserted.sample_request_destinations?.[0]).toEqual({
      sample_request_id: 'guest-request-1',
      company_name: guestRequest.customerInfo.companyName,
      contact_person: guestRequest.customerInfo.contactPerson,
      phone: guestRequest.customerInfo.phone,
      postal_code: guestRequest.deliveryDestinations[0]!.postalCode,
      address: guestRequest.deliveryDestinations[0]!.address,
    });
    expect(mockedCreateAdminNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        relatedId: 'guest-request-1',
        relatedType: 'sample_requests',
      }),
    );
    expect(mockedSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        customerEmail: guestRequest.customerInfo.email,
        customerPhone: guestRequest.customerInfo.phone,
      }),
    );
  });
});
