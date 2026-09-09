import {
  encodeTrustedProfileHeader,
  parseTrustedProfileHeader,
  type TrustedProfilePayload,
} from '@/lib/auth/profile-header';

const validProfile: TrustedProfilePayload = {
  id: 'user-a',
  email: 'a@example.com',
  role: 'MEMBER',
  status: 'ACTIVE',
  kanji_last_name: '山田',
  kanji_first_name: '太郎',
  kana_last_name: 'ヤマダ',
  kana_first_name: 'タロウ',
  corporate_phone: null,
  personal_phone: null,
  fax: null,
  company_name: 'A株式会社',
  position: null,
  department: null,
  company_url: null,
  postal_code: null,
  prefecture: '東京',
  city: '千代田区',
  street: '1-1',
  product_category: null,
  business_type: null,
  created_at: '2026-01-01T00:00:00Z',
  last_login_at: null,
};

function encode(profile: unknown): string {
  return Buffer.from(JSON.stringify(profile), 'utf8').toString('base64');
}

describe('trusted profile header codec', () => {
  it('round-trips a valid profile payload', () => {
    const result = parseTrustedProfileHeader(
      encodeTrustedProfileHeader(validProfile)!,
    );

    expect(result).toEqual({ ok: true, profile: validProfile });
  });

  it('rejects unknown fields', () => {
    const result = parseTrustedProfileHeader(
      encode({
        ...validProfile,
        privileged: true,
      }),
    );

    expect(result).toEqual({
      ok: false,
      reason: 'profile payload has an invalid shape',
    });
  });

  it('rejects missing required fields', () => {
    for (const field of ['id', 'email', 'role', 'status'] as const) {
      const profile: Record<string, unknown> = { ...validProfile };
      delete profile[field];

      expect(parseTrustedProfileHeader(encode(profile))).toEqual({
        ok: false,
        reason: 'profile payload has an invalid shape',
      });
    }
  });

  it('rejects wrong field types', () => {
    const profiles = [
      { ...validProfile, id: 123 },
      { ...validProfile, email: { address: 'a@example.com' } },
      { ...validProfile, role: ['MEMBER'] },
      { ...validProfile, status: null },
      { ...validProfile, created_at: 123 },
    ];

    for (const profile of profiles) {
      expect(parseTrustedProfileHeader(encode(profile))).toEqual({
        ok: false,
        reason: 'profile payload has an invalid shape',
      });
    }
  });
});
