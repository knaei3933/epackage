import { NextRequest } from 'next/server';

jest.mock('@/lib/rate-limiter', () => ({
  withRateLimit: jest.fn((handler: unknown) => handler),
  createAuthRateLimiter: jest.fn(() => ({})),
}));

jest.mock('@/lib/supabase', () => ({
  createServiceClient: jest.fn(),
}));

import { createServiceClient } from '@/lib/supabase';
import { POST } from '../route';

const validRegistration = {
  email: 'member@example.com',
  password: 'Password123',
  passwordConfirm: 'Password123',
  kanjiLastName: '山田',
  kanjiFirstName: '太郎',
  kanaLastName: 'ヤマダ',
  kanaFirstName: 'タロウ',
  corporatePhone: '03-1234-5678',
  personalPhone: '090-1234-5678',
  companyName: '',
  postalCode: '123-4567',
  prefecture: '東京都',
  city: '千代田区',
  street: '丸の内1-1-1',
  privacyConsent: true,
};

function createRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('POST /api/auth/register required-field validation', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('F01: rejects each missing required field before auth/profile work', async () => {
    const requiredFields = [
      'kanjiLastName',
      'kanjiFirstName',
      'kanaLastName',
      'kanaFirstName',
      'postalCode',
      'prefecture',
      'city',
      'street',
    ] as const;

    for (const field of requiredFields) {
      const response = await POST(createRequest({ ...validRegistration, [field]: '' }));

      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error).toBe('入力データの検証に失敗しました。');
      expect(body.details[field]).toEqual(expect.any(Array));
    }

    const phoneResponse = await POST(
      createRequest({ ...validRegistration, corporatePhone: '', personalPhone: '' }),
    );

    expect(phoneResponse.status).toBe(400);

    const phoneBody = await phoneResponse.json();
    expect(phoneBody.details.corporatePhone).toEqual(expect.any(Array));
    expect(createServiceClient).not.toHaveBeenCalled();
  });
});
