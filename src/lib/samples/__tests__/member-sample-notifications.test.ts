import {
  dispatchMemberSampleNotifications,
  type MemberSampleNotificationContext,
} from '../member-sample-notifications';

jest.mock('@/lib/email/send-contact', () => ({
  sendSampleRequestEmail: jest.fn(),
}));

jest.mock('@/lib/admin-notifications', () => ({
  notifySampleRequest: jest.fn(),
}));

import { notifySampleRequest } from '@/lib/admin-notifications';
import { sendSampleRequestEmail } from '@/lib/email/send-contact';

const mockedSendEmail = jest.mocked(sendSampleRequestEmail);
const mockedNotify = jest.mocked(notifySampleRequest);

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

const context: MemberSampleNotificationContext = {
  sessionEmail: 'session@example.com',
  confirmation,
  inquiryId: 'inquiry-1',
  sampleRequestId: 'request-1',
  sampleItemId: 'item-1',
  destinationId: 'destination-1',
  labelId: 'label-1',
  inquiryNumber: 'CTC-2026-inquiry',
  requestNumber: 'SMP-2026-0001',
};

describe('member sample notifications (G007)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('M02: sends customer/admin email and creates an admin notification with trace IDs', async () => {
    mockedSendEmail.mockResolvedValue({ success: true, errors: [] });
    mockedNotify.mockResolvedValue({
      id: 'notification-1',
      type: 'sample',
      title: 'サンプル依頼',
      message: 'created',
      priority: 'normal',
      is_read: false,
      metadata: {},
      created_at: '2026-01-01T00:00:00.000Z',
    });

    await expect(dispatchMemberSampleNotifications(context)).resolves.toBeUndefined();

    expect(mockedSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'SMP-2026-0001',
        customerEmail: 'session@example.com',
        customerName: '山田 太郎',
        customerPhone: '03-1234-5678',
        samples: [{ productName: 'パウチサンプルセット', quantity: 1 }],
        deliveryDestinations: [
          {
            companyName: '株式会社サンプル',
            contactPerson: '山田 太郎',
            phone: '03-1234-5678',
            address: '100-0001 東京都 千代田区 千代田1-1 サンプルビル',
          },
        ],
      }),
    );
    expect(mockedNotify).toHaveBeenCalledWith(
      'request-1',
      '山田 太郎',
      1,
      {
        inquiry_id: 'inquiry-1',
        sample_request_id: 'request-1',
        sample_item_id: 'item-1',
        destination_id: 'destination-1',
        label_id: 'label-1',
        inquiry_number: 'CTC-2026-inquiry',
        request_number: 'SMP-2026-0001',
      },
    );
  });

  it('M03: contains post-commit email and notification failures without exposing PII', async () => {
    mockedSendEmail.mockRejectedValueOnce(new Error('SMTP unavailable'));
    mockedNotify.mockRejectedValueOnce(new Error('notification database unavailable'));
    const errorSpy = jest.spyOn(console, 'error');

    await expect(dispatchMemberSampleNotifications(context)).resolves.toBeUndefined();

    expect(mockedSendEmail).toHaveBeenCalledTimes(1);
    expect(mockedNotify).toHaveBeenCalledTimes(1);
    const logged = JSON.stringify(errorSpy.mock.calls);
    expect(logged).toContain('request-1');
    expect(logged).toContain('destination-1');
    expect(logged).toContain('label-1');
    expect(logged).not.toContain('03-1234-5678');
    expect(logged).not.toContain('100-0001');
    expect(logged).not.toContain('千代田1-1');
  });
});
