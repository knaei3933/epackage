jest.mock('server-only', () => ({}), { virtual: true });

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/types/database';
import { sampleRequestConfirmationSchema } from '@/lib/member/sample-prefill';
import {
  createFixedSampleRequest,
  createMemberFixedSampleRequest,
  type SamplePipelineInput,
  type SamplePipelineLogger,
} from '@/lib/samples/create-fixed-sample-request';

type Table =
  | 'inquiries'
  | 'sample_requests'
  | 'sample_items'
  | 'sample_request_destinations'
  | 'label_prints';

type DbResponse = {
  data: Record<string, unknown> | null;
  error: { code?: string; message?: string } | null;
};

type DbCall = {
  operation: 'insert' | 'update' | 'delete';
  table: Table;
  payload?: Record<string, unknown>;
  id?: string;
};

const created = (id: string): DbResponse => ({
  data: { id },
  error: null,
});

const failed = (message: string, code?: string): DbResponse => ({
  data: null,
  error: code ? { code, message } : { message },
});

const confirmation = sampleRequestConfirmationSchema.parse({
  contactPerson: ' 山田 太郎 ',
  phone: '03-1234-5678',
  postalCode: '100-0001',
  prefecture: '東京都',
  city: '千代田区',
  street: '千代田1-1',
  companyName: ' 株式会社サンプル ',
  building: ' サンプルビル ',
});

const confirmationWithoutBuilding = {
  ...confirmation,
  building: '',
};

const now = new Date('2026-09-06T00:00:00Z');

const createMockClient = (config?: {
  inserts?: Partial<Record<Table, DbResponse[]>>;
  deleteErrors?: Partial<Record<Table, DbResponse>>;
}) => {
  const calls: DbCall[] = [];
  const insertedPayloads: Partial<Record<Table, Record<string, unknown>[]>> =
    {};
  const insertQueue = new Map<Table, DbResponse[]>();
  const remainingDeletes = new Map<Table, DbResponse[]>();

  (Object.keys(config?.inserts ?? {}) as Table[]).forEach((table) => {
    insertQueue.set(table, [...(config?.inserts?.[table] ?? [])]);
  });
  (Object.keys(config?.deleteErrors ?? {}) as Table[]).forEach((table) => {
    remainingDeletes.set(table, [config?.deleteErrors?.[table] ?? failed('x')]);
  });

  const takeInsertResponse = (table: Table): DbResponse => {
    const queue = insertQueue.get(table);
    return queue?.shift() ?? failed(`Unexpected ${table} insert.`);
  };

  const from = jest.fn((table: Table) => ({
    insert: jest.fn((payload: Record<string, unknown>) => {
      insertedPayloads[table] = [...(insertedPayloads[table] ?? []), payload];
      const response = takeInsertResponse(table);
      return {
        select: jest.fn(() => ({
          single: jest.fn(() => {
            calls.push({ operation: 'insert', table, payload });
            return response;
          }),
        })),
      };
    }),
    update: jest.fn((payload: Record<string, unknown>) => ({
      eq: jest.fn((_column: string, id: string) => {
        calls.push({ operation: 'update', table, payload, id });
        return Promise.resolve({ error: null });
      }),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn((_column: string, id: string) => {
        calls.push({ operation: 'delete', table, id });
        const response = remainingDeletes.get(table)?.shift() ?? created('deleted');
        return Promise.resolve(response);
      }),
    })),
  }));

  return {
    calls,
    from,
    insertedPayloads,
    client: { from } as unknown as SupabaseClient<Database>,
  };
};

const createInput = (
  client: SupabaseClient<Database>,
  overrides: Partial<SamplePipelineInput> = {},
): SamplePipelineInput => ({
  supabase: client,
  userId: 'member-1',
  sessionEmail: ' session@example.com ',
  confirmation,
  profileKana: { lastName: ' ヤマダ ', firstName: ' タロウ ' },
  now,
  generateInquiryNumber: jest.fn(() => 'CTC-1788652800000-inquiry9'),
  generateRequestNumber: jest
    .fn()
    .mockReturnValueOnce('SMP-2026-0001')
    .mockReturnValueOnce('SMP-2026-0002')
    .mockReturnValueOnce('SMP-2026-0003'),
  ...overrides,
});

const successfulConfig = {
  inserts: {
    inquiries: [created('inquiry-1')],
    sample_requests: [created('request-1')],
    sample_items: [created('item-1')],
    sample_request_destinations: [created('destination-1')],
    label_prints: [created('label-1')],
  },
};

const createLogger = (): SamplePipelineLogger & { error: jest.Mock } => ({
  error: jest.fn(),
});

describe('shared fixed sample request pipeline', () => {
  it('D01/D02: creates all five rows in the required order and labels last', async () => {
    const { client, calls } = createMockClient(successfulConfig);

    const result = await createFixedSampleRequest(createInput(client));

    expect(result).toEqual({
      status: 'created',
      inquiryId: 'inquiry-1',
      sampleRequestId: 'request-1',
      sampleItemId: 'item-1',
      destinationId: 'destination-1',
      labelId: 'label-1',
      inquiryNumber: 'CTC-1788652800000-inquiry9',
      requestNumber: 'SMP-2026-0001',
    });
    expect(calls.map((call) => `${call.operation}:${call.table}`)).toEqual([
      'insert:inquiries',
      'insert:sample_requests',
      'insert:sample_items',
      'insert:sample_request_destinations',
      'insert:label_prints',
    ]);
    expect(calls.at(-1)).toMatchObject({
      operation: 'insert',
      table: 'label_prints',
    });
  });

  it('D03-D10: links ownership, numbers, fixed item, destination, and label', async () => {
    const { client, calls, insertedPayloads } =
      createMockClient(successfulConfig);

    const result = await createFixedSampleRequest(createInput(client));

    expect(result.status).toBe('created');
    expect(insertedPayloads.inquiries?.[0]).toMatchObject({
      user_id: 'member-1',
      request_number: 'SMP-2026-0001',
    });
    expect(insertedPayloads.sample_requests?.[0]).toMatchObject({
      user_id: 'member-1',
      request_number: 'SMP-2026-0001',
    });
    expect(insertedPayloads.sample_items?.[0]).toEqual({
      sample_request_id: 'request-1',
      product_name: 'パウチサンプルセット',
      category: 'standup-pouch',
      quantity: 1,
    });
    expect(insertedPayloads.sample_request_destinations?.[0]).toEqual({
      sample_request_id: 'request-1',
      company_name: '株式会社サンプル',
      contact_person: '山田 太郎',
      phone: '03-1234-5678',
      postal_code: '100-0001',
      address: '東京都千代田区千代田1-1（サンプルビル）',
    });
    expect(calls.find((call) => call.table === 'label_prints')?.payload).toEqual({
      destination_id: 'destination-1',
      requested_by: 'member-1',
      source: 'batch',
      status: 'pending',
    });
  });

  it('D08: concatenates the address without a delimiter when building is absent', async () => {
    const { client, insertedPayloads } =
      createMockClient(successfulConfig);

    await createFixedSampleRequest(
      createInput(client, { confirmation: confirmationWithoutBuilding }),
    );

    expect(
      insertedPayloads.sample_request_destinations?.[0]?.address,
    ).toBe('東京都千代田区千代田1-1');
  });

  it('D11/D12: stores the exact member inquiry payload using the session email', async () => {
    const divergentEmailFixture = {
      sessionEmail: 'session@example.com',
      profileEmail: 'stale@example.com',
    };
    const { client, insertedPayloads } =
      createMockClient(successfulConfig);

    await createFixedSampleRequest(
      createInput(client, {
        // The resolver intentionally passes only kana, never a profile email.
        profileKana: { lastName: 'ヤマダ', firstName: 'タロウ' },
        sessionEmail: divergentEmailFixture.sessionEmail,
      }),
    );

    // profiles.email is not an input at all; only the session value can reach
    // the inquiry insert below.
    expect(divergentEmailFixture.profileEmail).toBe('stale@example.com');
    expect(insertedPayloads.inquiries?.[0]).toEqual({
      user_id: 'member-1',
      inquiry_number: 'CTC-1788652800000-inquiry9',
      request_number: 'SMP-2026-0001',
      type: 'sample',
      status: 'pending',
      subject: 'サンプル依頼',
      message: 'パウチサンプルセットをご依頼いたします。',
      customer_name: '山田 太郎',
      customer_name_kana: 'ヤマダ タロウ',
      company_name: '株式会社サンプル',
      email: 'session@example.com',
      phone: '03-1234-5678',
      postal_code: '100-0001',
      prefecture: '東京都',
      city: '千代田区',
      street: '千代田1-1',
      urgency: 'normal',
      preferred_contact: null,
      privacy_consent: true,
      admin_notes: null,
      response: null,
      responded_at: null,
    });
  });

  it('D13: accepts explicit null ownership for future guest reuse', async () => {
    const { client, insertedPayloads } =
      createMockClient(successfulConfig);

    const result = await createFixedSampleRequest(
      createInput(client, { userId: null }),
    );

    expect(result.status).toBe('created');
    expect(insertedPayloads.inquiries?.[0]?.user_id).toBeNull();
    expect(insertedPayloads.sample_requests?.[0]?.user_id).toBeNull();
  });

  it('D14: exposes a member-only entry whose ownership is a non-nullable string', async () => {
    const { client, from, insertedPayloads } =
      createMockClient(successfulConfig);
    const memberInput = {
      ...createInput(client),
      userId: 'member-1' as string,
    };

    const result = await createMemberFixedSampleRequest(memberInput);

    expect(result.status).toBe('created');
    expect(insertedPayloads.inquiries?.[0]?.user_id).toBe('member-1');
    expect(from).toHaveBeenCalledTimes(5);
    from.mockClear();

    // The member-only wrapper also rejects a runtime lie that bypasses the
    // static string contract. This remains meaningful while route wiring is
    // intentionally outside G005.
    await expect(
      createMemberFixedSampleRequest({
        ...memberInput,
        userId: null as unknown as string,
      }),
    ).resolves.toMatchObject({ status: 'failed', stage: 'validation' });
    expect(from).not.toHaveBeenCalled();
  });

  it('E01: compensates the inquiry when sample request creation fails', async () => {
    const { client, calls } = createMockClient({
      inserts: {
        ...successfulConfig.inserts,
        sample_requests: [failed('request failed')],
      },
    });

    const result = await createFixedSampleRequest(createInput(client));

    expect(result).toMatchObject({
      status: 'failed',
      stage: 'sample_request',
      compensation: {
        status: 'completed',
        deleted: [{ table: 'inquiries', id: 'inquiry-1' }],
      },
    });
    expect(calls.filter((call) => call.operation === 'delete')).toEqual([
      { operation: 'delete', table: 'inquiries', id: 'inquiry-1' },
    ]);
  });

  it('E02: compensates in reverse when the fixed item fails', async () => {
    const { client, calls } = createMockClient({
      inserts: {
        ...successfulConfig.inserts,
        sample_items: [failed('item failed')],
      },
    });

    const result = await createFixedSampleRequest(createInput(client));

    expect(result).toMatchObject({
      status: 'failed',
      stage: 'sample_item',
    });
    expect(calls.filter((call) => call.operation === 'delete')).toEqual([
      { operation: 'delete', table: 'sample_requests', id: 'request-1' },
      { operation: 'delete', table: 'inquiries', id: 'inquiry-1' },
    ]);
  });

  it('E03: compensates in reverse when the destination fails', async () => {
    const { client, calls } = createMockClient({
      inserts: {
        ...successfulConfig.inserts,
        sample_request_destinations: [failed('destination failed')],
      },
    });

    const result = await createFixedSampleRequest(createInput(client));

    expect(result).toMatchObject({
      status: 'failed',
      stage: 'destination',
    });
    expect(calls.filter((call) => call.operation === 'delete')).toEqual([
      { operation: 'delete', table: 'sample_items', id: 'item-1' },
      { operation: 'delete', table: 'sample_requests', id: 'request-1' },
      { operation: 'delete', table: 'inquiries', id: 'inquiry-1' },
    ]);
  });

  it('E04: compensates all pre-label rows when the pending label fails', async () => {
    const { client, calls } = createMockClient({
      inserts: {
        ...successfulConfig.inserts,
        label_prints: [failed('label failed')],
      },
    });

    const result = await createFixedSampleRequest(createInput(client));

    expect(result).toMatchObject({
      status: 'failed',
      stage: 'label',
    });
    expect(calls.filter((call) => call.operation === 'delete')).toEqual([
      {
        operation: 'delete',
        table: 'sample_request_destinations',
        id: 'destination-1',
      },
      { operation: 'delete', table: 'sample_items', id: 'item-1' },
      { operation: 'delete', table: 'sample_requests', id: 'request-1' },
      { operation: 'delete', table: 'inquiries', id: 'inquiry-1' },
    ]);
  });

  it('E05: never compensates committed rows after label success', async () => {
    const { client, calls } = createMockClient(successfulConfig);
    const result = await createFixedSampleRequest(createInput(client));

    expect(result.status).toBe('created');

    // Story G005 owns only the pipeline. A later caller notification throwing
    // is outside the transaction boundary and must have no rollback effect.
    const notify = jest.fn((_accepted: unknown) => {
      throw new Error('notification transport failed');
    });
    expect(() => {
      notify(result);
    }).toThrow('notification transport failed');
    expect(notify).toHaveBeenCalledTimes(1);
    expect(calls.filter((call) => call.operation === 'delete')).toEqual([]);
  });

  it('E06: reports and logs failed compensation without reporting success', async () => {
    const { client } = createMockClient({
      inserts: {
        ...successfulConfig.inserts,
        label_prints: [failed('label failed')],
      },
      deleteErrors: {
        sample_request_destinations: failed('destination delete failed'),
      },
    });
    const logger = createLogger();

    const result = await createFixedSampleRequest(createInput(client, { logger }));

    expect(result).toMatchObject({
      status: 'failed',
      stage: 'label',
      compensation: {
        status: 'failed',
        deleted: [
          { table: 'sample_items', id: 'item-1' },
          { table: 'sample_requests', id: 'request-1' },
          { table: 'inquiries', id: 'inquiry-1' },
        ],
        errors: [
          {
            table: 'sample_request_destinations',
            message: 'destination delete failed',
          },
        ],
      },
    });
    expect(logger.error).toHaveBeenCalledWith(
      'Fixed sample request pipeline failed',
      expect.objectContaining({
        stage: 'label',
        compensation: 'failed',
        compensationErrors: 1,
      }),
    );
  });

  it('E07: retries a request-number collision without duplicating committed rows', async () => {
    const { client, calls, insertedPayloads } = createMockClient({
      inserts: {
        ...successfulConfig.inserts,
        sample_requests: [failed('duplicate key', '23505'), created('request-1')],
      },
    });

    const result = await createFixedSampleRequest(createInput(client));

    expect(result.status).toBe('created');
    expect(result).toMatchObject({ requestNumber: 'SMP-2026-0002' });
    expect(insertedPayloads.sample_requests).toHaveLength(2);
    expect(insertedPayloads.sample_requests?.map((row) => row.request_number)).toEqual([
      'SMP-2026-0001',
      'SMP-2026-0002',
    ]);
    expect(calls).toContainEqual({
      operation: 'update',
      table: 'inquiries',
      payload: { request_number: 'SMP-2026-0002' },
      id: 'inquiry-1',
    });
    expect(calls.filter((call) => call.operation === 'delete')).toEqual([]);
  });
});
