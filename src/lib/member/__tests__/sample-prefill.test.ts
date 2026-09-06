jest.mock('server-only', () => ({}), { virtual: true });

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/types/database';
import {
  buildSamplePrefill,
  loadSamplePrefill,
  sampleRequestConfirmationSchema,
} from '@/lib/member/sample-prefill';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type DeliveryRow = Database['public']['Tables']['delivery_addresses']['Row'];

const activeProfile = {
  id: 'member-1',
  kanji_last_name: ' 山田 ',
  kanji_first_name: ' 太郎 ',
  kana_last_name: ' ヤマダ ',
  kana_first_name: ' タロウ ',
  corporate_phone: ' 03-1234-5678 ',
  personal_phone: '090-1234-5678',
  postal_code: '100-0001',
  prefecture: '東京都',
  city: '千代田区',
  street: '千代田1-1',
  company_name: ' 株式会社サンプル ',
  status: 'ACTIVE',
} as ProfileRow;

const defaultDelivery = {
  id: 'delivery-1',
  user_id: 'member-1',
  name: '自宅',
  phone: '03-9999-9999',
  postal_code: '150-0001',
  prefecture: '東京都',
  city: '渋谷区',
  address: '神宮前1-2-3',
  building: ' サンプルビル 3F ',
  contact_person: '配送 担当',
  is_default: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
} as DeliveryRow;

const emptyProfile = {
  ...activeProfile,
  kanji_last_name: '',
  kanji_first_name: '',
  kana_last_name: '',
  kana_first_name: '',
  corporate_phone: '',
  personal_phone: null,
  postal_code: null,
  prefecture: '',
  city: '',
  street: null,
  company_name: null,
} as ProfileRow;

const completeDelivery = {
  ...defaultDelivery,
  contact_person: '鈴木 花子',
} as DeliveryRow;

const createMockClient = (config: {
  profile?: { data?: ProfileRow | null; error?: { message: string } | null };
  deliveries?: DeliveryRow[];
  deliveryError?: { message: string } | null;
}) => {
  const orderedQuery = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({
      data: config.deliveries ?? [],
      error: config.deliveryError ?? null,
    }),
  };
  const profileQuery = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue(
      config.profile ?? { data: activeProfile, error: null },
    ),
  };
  const from = jest.fn((table: string) =>
    table === 'profiles' ? profileQuery : orderedQuery,
  );

  return {
    // The loader only consumes this chain-shaped subset of SupabaseClient.
    client: { from } as unknown as SupabaseClient<Database>,
    from,
    orderedQuery,
    profileQuery,
  };
};

describe('member sample prefill resolver', () => {
  describe('confirmation schema regression (G008)', () => {
    const validConfirmation = {
      contactPerson: '山田 太郎',
      phone: '03-1234-5678',
      postalCode: '100-0001',
      prefecture: '東京都',
      city: '千代田区',
      street: '千代田1-1',
    };

    it('B01: requires contact person, phone, postal, prefecture, city, and street', () => {
      expect(sampleRequestConfirmationSchema.safeParse({
        ...validConfirmation,
      })).toMatchObject({ success: true });
    });

    it('B02: keeps company and building optional while trimming text', () => {
      const omitted = sampleRequestConfirmationSchema.safeParse(validConfirmation);
      const supplied = sampleRequestConfirmationSchema.safeParse({
        ...validConfirmation,
        companyName: ' 株式会社サンプル ',
        building: ' サンプルビル ',
      });

      expect(omitted).toMatchObject({
        success: true,
        data: { companyName: '', building: '' },
      });
      expect(supplied).toMatchObject({
        success: true,
        data: {
          companyName: '株式会社サンプル',
          building: 'サンプルビル',
        },
      });
    });

    it('B03: rejects whitespace-only confirmation contact/address fields', () => {
      for (const field of Object.keys(validConfirmation) as Array<keyof typeof validConfirmation>) {
        const result = sampleRequestConfirmationSchema.safeParse({
          ...validConfirmation,
          [field]: '   ',
        });

        expect(result.success).toBe(false);
      }
    });

    it.each([
      ['companyName', '会'.repeat(201), 200],
      ['contactPerson', '山'.repeat(101), 100],
      ['phone', '0'.repeat(21), 20],
      ['postalCode', '123456789', 8],
      ['prefecture', '東'.repeat(51), 50],
      ['city', '京'.repeat(101), 100],
      ['street', '番'.repeat(201), 200],
      ['building', 'ビ'.repeat(201), 200],
    ] as const)(
      'B04: rejects an oversized %s value above %s characters',
      (field, oversizedValue, _limit) => {
        const result = sampleRequestConfirmationSchema.safeParse({
          ...validConfirmation,
          [field]: oversizedValue,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.map((issue) => issue.path[0])).toContain(field);
        }
      },
    );

    it('B04: validates Japanese phone and postal formats after size boundaries', () => {
      expect(sampleRequestConfirmationSchema.safeParse({
        ...validConfirmation,
        phone: '1234',
      }).success).toBe(false);
      expect(sampleRequestConfirmationSchema.safeParse({
        ...validConfirmation,
        postalCode: '123-456',
      }).success).toBe(false);
    });
  });

  it('C01: prefers every non-empty profile value over delivery', () => {
    const result = buildSamplePrefill(activeProfile, {
      ...completeDelivery,
      phone: '03-8888-8888',
      postal_code: '160-0022',
      prefecture: '東京都',
      city: '新宿区',
      address: '新宿4-4-4',
      building: '優先されない建物',
    });

    expect(result.data.confirmation).toEqual({
      contactPerson: '山田 太郎',
      phone: '03-1234-5678',
      postalCode: '100-0001',
      prefecture: '東京都',
      city: '千代田区',
      street: '千代田1-1',
      companyName: '株式会社サンプル',
      building: '優先されない建物',
    });
    expect(result.complete).toBe(true);
  });

  it('C02: fills only empty profile fields field-by-field', () => {
    const profile = {
      ...emptyProfile,
      kanji_last_name: '山田',
      kanji_first_name: '太郎',
      postal_code: '100-0001',
      city: '千代田区',
    } as ProfileRow;
    const result = buildSamplePrefill(profile, completeDelivery);

    expect(result.data.confirmation).toMatchObject({
      contactPerson: '山田 太郎',
      phone: completeDelivery.phone,
      postalCode: '100-0001',
      prefecture: completeDelivery.prefecture,
      city: '千代田区',
      street: completeDelivery.address,
    });
  });

  it('C03: builds contact person from both profile kanji names', () => {
    const result = buildSamplePrefill(activeProfile, completeDelivery);
    expect(result.data.confirmation.contactPerson).toBe('山田 太郎');
  });

  it('C04: falls back to delivery contact only when profile kanji is incomplete', () => {
    const incompleteFamily = buildSamplePrefill(
      { ...activeProfile, kanji_last_name: ' ' },
      completeDelivery,
    );
    const incompleteGiven = buildSamplePrefill(
      { ...activeProfile, kanji_first_name: '' },
      completeDelivery,
    );

    expect(incompleteFamily.data.confirmation.contactPerson).toBe('鈴木 花子');
    expect(incompleteGiven.data.confirmation.contactPerson).toBe('鈴木 花子');
  });

  it('C05: uses kana only from profile and never parses delivery display data', () => {
    const result = buildSamplePrefill(emptyProfile, completeDelivery);

    expect(result.data.profileKana).toEqual({
      lastName: '',
      firstName: '',
      name: '',
    });

    const profileKana = buildSamplePrefill(
      { ...emptyProfile, kana_last_name: ' ヤマダ ', kana_first_name: ' タロウ ' },
      completeDelivery,
    );
    expect(profileKana.data.profileKana).toEqual({
      lastName: 'ヤマダ',
      firstName: 'タロウ',
      name: 'ヤマダ タロウ',
    });
  });

  it('C06: takes building from delivery', () => {
    const result = buildSamplePrefill(activeProfile, completeDelivery);
    expect(result.data.confirmation.building).toBe('サンプルビル 3F');
  });

  it('C07: reports explicit missing required fields without treating optional fields as required', () => {
    const result = buildSamplePrefill(emptyProfile, {
      ...completeDelivery,
      phone: '',
      contact_person: null,
      postal_code: '',
      prefecture: '',
      city: '',
      address: '',
      building: '',
    });

    expect(result.complete).toBe(false);
    expect(result.missingFields).toEqual([
      'contactPerson',
      'phone',
      'postalCode',
      'prefecture',
      'city',
      'street',
    ]);
    expect(result.data.confirmation.companyName).toBe('');
    expect(result.data.confirmation.building).toBe('');
  });

  it('C08: handles a missing default delivery row without crashing', () => {
    const result = buildSamplePrefill(activeProfile, null);

    expect(result.complete).toBe(true);
    expect(result.data.confirmation).toEqual({
      contactPerson: '山田 太郎',
      phone: '03-1234-5678',
      postalCode: '100-0001',
      prefecture: '東京都',
      city: '千代田区',
      street: '千代田1-1',
      companyName: '株式会社サンプル',
      building: '',
    });
  });

  it('C09: validates a fully merged result with the confirmation schema', () => {
    const result = buildSamplePrefill(activeProfile, completeDelivery);

    expect(sampleRequestConfirmationSchema.safeParse(
      result.data.confirmation,
    )).toMatchObject({ success: true });
    expect(result.validationErrors).toEqual([]);
  });

  it('C10: prefers non-empty corporate phone, then personal phone', () => {
    const corporate = buildSamplePrefill(activeProfile, null);
    const personal = buildSamplePrefill(
      { ...activeProfile, corporate_phone: '' },
      null,
    );

    expect(corporate.data.confirmation.phone).toBe('03-1234-5678');
    expect(personal.data.confirmation.phone).toBe('090-1234-5678');
  });

  it('C11: applies deterministic delivery ordering and never calls single()', () => {
    const mock = createMockClient({ deliveries: [completeDelivery] });

    return loadSamplePrefill(mock.client, 'member-1').then((result) => {
      expect(result.status).toBe('loaded');
      expect(mock.orderedQuery.order).toHaveBeenNthCalledWith(1, 'is_default', {
        ascending: false,
      });
      expect(mock.orderedQuery.order).toHaveBeenNthCalledWith(2, 'created_at', {
        ascending: false,
      });
      expect(mock.orderedQuery.order).toHaveBeenNthCalledWith(3, 'id', {
        ascending: false,
      });
      expect(mock.orderedQuery.limit).toHaveBeenCalledWith(1);
      expect(mock.profileQuery.maybeSingle).toHaveBeenCalledTimes(1);
      expect(mock.from).toHaveBeenCalledWith('delivery_addresses');
      expect('single' in mock.orderedQuery).toBe(false);
    });
  });

  it('C12: returns no fallback without an error when zero delivery rows exist', async () => {
    const mock = createMockClient({ deliveries: [] });
    const result = await loadSamplePrefill(mock.client, 'member-1');

    expect(result.status).toBe('loaded');
    expect(result.complete).toBe(true);
    expect(result.data?.confirmation.building).toBe('');
  });

  it('C13: selects the first row when legacy data contains multiple defaults', async () => {
    const firstOrderedLegacyDefault = {
      ...completeDelivery,
      id: 'delivery-old',
      created_at: '2026-01-01T00:00:00Z',
    };
    const secondLegacyDefault = {
      ...completeDelivery,
      id: 'delivery-new',
      created_at: '2026-02-01T00:00:00Z',
    };
    const mock = createMockClient({
      // The mock models the database result after the required ORDER BY.
      deliveries: [firstOrderedLegacyDefault, secondLegacyDefault],
    });
    const result = await loadSamplePrefill(mock.client, 'member-1');

    expect(result.status).toBe('loaded');
    expect(mock.orderedQuery.order).toHaveBeenCalledTimes(3);
    expect(result.data?.confirmation.building).toBe('サンプルビル 3F');
  });

  it.each([
    [
      'profile_query_failed',
      { profile: { data: null, error: { message: 'db unavailable' } } },
    ],
    [
      'delivery_query_failed',
      { deliveryError: { message: 'db unavailable' } },
    ],
  ] as const)('D01: logs only the non-PII %s status', async (status, config) => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const mock = createMockClient(config as Parameters<typeof createMockClient>[0]);

    const result = await loadSamplePrefill(mock.client, 'member-1');

    expect(result.status).toBe(status);
    expect(errorSpy).toHaveBeenCalledWith('[sample-prefill] query failed', {
      status,
      route: '/samples',
      userId: 'member-1',
    });
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain('db unavailable');
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain('山田');
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain('03-1234-5678');
  });
});
