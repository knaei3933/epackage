/**
 * Server-only creation pipeline for the fixed standup-pouch sample set.
 *
 * The Supabase client is intentionally injected: it keeps the cross-table
 * ordering and compensation rules deterministic without depending on cookies
 * or a particular route. Callers remain responsible for authentication and for
 * passing the authoritative session email.
 */

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/types/database';
import {
  sampleRequestConfirmationSchema,
  type SampleRequestConfirmation,
} from '@/lib/member/sample-prefill';

export const FIXED_ITEM = {
  product_name: 'パウチサンプルセット',
  category: 'standup-pouch',
  quantity: 1,
} as const;

const FIXED_SUBJECT = 'サンプル依頼';
const FIXED_MESSAGE = 'パウチサンプルセットをご依頼いたします。';
const REQUEST_ATTEMPTS = 3;

export type SamplePipelineStage =
  | 'validation'
  | 'inquiry'
  | 'sample_request'
  | 'request_number_retry'
  | 'sample_item'
  | 'destination'
  | 'label';

export interface SamplePipelineProfileKana {
  lastName: string | null | undefined;
  firstName: string | null | undefined;
}

export interface SamplePipelineLogger {
  error: (
    message: string,
    metadata?: Record<string, unknown>,
  ) => void;
}

export interface SamplePipelineInput {
  supabase: SupabaseClient<Database>;
  /**
   * Member callers must pass the authenticated user. Explicit null is allowed
   * only to preserve the shared pipeline for the future guest flow; callers do
   * not invent an owner on behalf of a user.
   */
  userId: string | null;
  sessionEmail: string;
  confirmation: SampleRequestConfirmation;
  profileKana: SamplePipelineProfileKana;
  now?: Date;
  logger?: SamplePipelineLogger;
  generateInquiryNumber?: (now: Date) => string;
  generateRequestNumber?: (now: Date) => string;
}

export type SamplePipelineCreatedRow = {
  stage: Exclude<SamplePipelineStage, 'validation' | 'request_number_retry'>;
  table:
    | 'inquiries'
    | 'sample_requests'
    | 'sample_items'
    | 'sample_request_destinations'
    | 'label_prints';
  id: string;
};

export interface SamplePipelineCompensation {
  status: 'not_needed' | 'completed' | 'failed';
  deleted: SamplePipelineCreatedRow[];
  errors: Array<{
    table: SamplePipelineCreatedRow['table'];
    message: string;
  }>;
}

export type SamplePipelineResult =
  | {
      status: 'created';
      inquiryId: string;
      sampleRequestId: string;
      sampleItemId: string;
      destinationId: string;
      labelId: string;
      inquiryNumber: string;
      requestNumber: string;
    }
  | {
      status: 'failed';
      stage: SamplePipelineStage;
      message: string;
      compensation: SamplePipelineCompensation;
      createdRows: SamplePipelineCreatedRow[];
    };

const defaultLogger: SamplePipelineLogger = {
  error: (message, metadata) => console.error(message, metadata),
};

const normalize = (value: string | null | undefined): string =>
  value?.trim() ?? '';

const assembleKana = (kana: SamplePipelineProfileKana): string =>
  [normalize(kana.lastName), normalize(kana.firstName)]
    .filter(Boolean)
    .join(' ');

const buildDestinationAddress = (
  confirmation: SampleRequestConfirmation,
): string => {
  const base =
    confirmation.prefecture + confirmation.city + confirmation.street;
  return confirmation.building
    ? `${base}（${confirmation.building}）`
    : base;
};

const numberError = (stage: SamplePipelineStage): string =>
  `Fixed sample pipeline failed at ${stage}.`;

const isSuccess = (
  response: { data: unknown; error: { code?: string; message?: string } | null },
): response is { data: Record<string, unknown>; error: null } =>
  !response.error && Boolean(response.data);

const asId = (value: unknown): string => String(value);

/**
 * Generate an SMP number and retry on the database's unique constraint. The
 * inquiry is not duplicated for a collision; only its linked number is moved to
 * the next candidate before the next request insert.
 */
export function generateSampleRequestNumber(now: Date): string {
  const year = now.getFullYear();
  const sequence = Math.floor(Math.random() * 10_000)
    .toString()
    .padStart(4, '0');
  return `SMP-${year}-${sequence}`;
}

export function generateSampleInquiryNumber(now: Date): string {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyz';
  let suffix = '';
  for (let index = 0; index < 9; index += 1) {
    suffix += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return `CTC-${now.getTime()}-${suffix}`;
}

export async function createFixedSampleRequest(
  input: SamplePipelineInput,
): Promise<SamplePipelineResult> {
  const logger = input.logger ?? defaultLogger;
  const now = input.now ?? new Date();
  const parsedConfirmation = sampleRequestConfirmationSchema.safeParse(
    input.confirmation,
  );
  const sessionEmail = normalize(input.sessionEmail);

  if (!parsedConfirmation.success || !sessionEmail) {
    return {
      status: 'failed',
      stage: 'validation',
      message: 'Fixed sample request input is invalid.',
      compensation: {
        status: 'not_needed',
        deleted: [],
        errors: [],
      },
      createdRows: [],
    };
  }

  const confirmation = parsedConfirmation.data;
  const generateRequestNumber =
    input.generateRequestNumber ?? generateSampleRequestNumber;
  const generateInquiryNumber =
    input.generateInquiryNumber ?? generateSampleInquiryNumber;
  const inquiryNumber = generateInquiryNumber(now);
  const client = input.supabase as unknown as {
    from(table: string): {
      insert(payload: unknown): {
        select(): {
          single(): Promise<{
            data: Record<string, unknown> | null;
            error: { code?: string; message?: string } | null;
          }>;
        };
      };
      update(payload: unknown): {
        eq(column: string, value: string): Promise<{
          error: { code?: string; message?: string } | null;
        }>;
      };
      delete(): {
        eq(column: string, value: string): Promise<{
          error: { code?: string; message?: string } | null;
        }>;
      };
    };
  };

  const createdRows: SamplePipelineCreatedRow[] = [];
  const addCreatedRow = (
    row: SamplePipelineCreatedRow,
  ): void => {
    createdRows.push(row);
  };

  const compensate = async (
  ): Promise<SamplePipelineCompensation> => {
    if (createdRows.length === 0) {
      return { status: 'not_needed', deleted: [], errors: [] };
    }

    const deleted: SamplePipelineCreatedRow[] = [];
    const errors: SamplePipelineCompensation['errors'] = [];

    for (const row of [...createdRows].reverse()) {
      const { error } = await client
        .from(row.table)
        .delete()
        .eq('id', row.id);

      if (error) {
        errors.push({ table: row.table, message: error.message ?? 'unknown' });
        continue;
      }
      deleted.push(row);
    }

    return {
      status: errors.length === 0 ? 'completed' : 'failed',
      deleted,
      errors,
    };
  };

  const fail = async (
    stage: SamplePipelineStage,
    error: { code?: string; message?: string } | null,
  ): Promise<SamplePipelineResult> => {
    const message = error?.message
      ? `Fixed sample pipeline failed at ${stage}: ${error.message}`
      : numberError(stage);
    const compensation = await compensate();
    const loggedIds = Object.fromEntries(
      createdRows.map((row) => [row.stage, row.id]),
    );

    logger.error('Fixed sample request pipeline failed', {
      stage,
      rows: loggedIds,
      compensation: compensation.status,
      compensationErrors: compensation.errors.length,
    });

    return {
      status: 'failed',
      stage,
      message,
      compensation,
      createdRows,
    };
  };

  let requestNumber = generateRequestNumber(now);
  const inquiryPayload: Record<string, unknown> = {
    user_id: input.userId,
    inquiry_number: inquiryNumber,
    request_number: requestNumber,
    type: 'sample',
    status: 'pending',
    subject: FIXED_SUBJECT,
    message: FIXED_MESSAGE,
    customer_name: confirmation.contactPerson,
    customer_name_kana: assembleKana(input.profileKana),
    company_name: confirmation.companyName || null,
    email: sessionEmail,
    phone: confirmation.phone,
    postal_code: confirmation.postalCode,
    prefecture: confirmation.prefecture,
    city: confirmation.city,
    street: confirmation.street,
    urgency: 'normal',
    preferred_contact: null,
    privacy_consent: true,
    admin_notes: null,
    response: null,
    responded_at: null,
  };

  const inquiryResponse = await client
    .from('inquiries')
    .insert(inquiryPayload)
    .select()
    .single();

  if (!isSuccess(inquiryResponse)) {
    return fail('inquiry', inquiryResponse.error);
  }

  const inquiryId = asId(inquiryResponse.data.id);
  addCreatedRow({ stage: 'inquiry', table: 'inquiries', id: inquiryId });

  for (let attempt = 0; attempt < REQUEST_ATTEMPTS; attempt += 1) {
    const requestPayload: Record<string, unknown> = {
      user_id: input.userId,
      request_number: requestNumber,
      status: 'received',
      notes: FIXED_MESSAGE,
    };
    const requestResponse = await client
      .from('sample_requests')
      .insert(requestPayload)
      .select()
      .single();

    if (isSuccess(requestResponse)) {
      const sampleRequestId = asId(requestResponse.data.id);
      addCreatedRow({
        stage: 'sample_request',
        table: 'sample_requests',
        id: sampleRequestId,
      });

      const itemPayload: Record<string, unknown> = {
        sample_request_id: sampleRequestId,
        product_name: FIXED_ITEM.product_name,
        category: FIXED_ITEM.category,
        quantity: FIXED_ITEM.quantity,
      };
      const itemResponse = await client
        .from('sample_items')
        .insert(itemPayload)
        .select()
        .single();

      if (!isSuccess(itemResponse)) {
        return fail('sample_item', itemResponse.error);
      }
      const sampleItemId = asId(itemResponse.data.id);
      const destinationPayload: Record<string, unknown> = {
        sample_request_id: sampleRequestId,
        company_name: confirmation.companyName || null,
        contact_person: confirmation.contactPerson,
        phone: confirmation.phone,
        postal_code: confirmation.postalCode,
        address: buildDestinationAddress(confirmation),
      };
      addCreatedRow({
        stage: 'sample_item',
        table: 'sample_items',
        id: sampleItemId,
      });

      const destinationResponse = await client
        .from('sample_request_destinations')
        .insert(destinationPayload)
        .select()
        .single();

      if (!isSuccess(destinationResponse)) {
        return fail('destination', destinationResponse.error);
      }
      const destinationId = asId(destinationResponse.data.id);
      const labelPayload: Record<string, unknown> = {
        destination_id: destinationId,
        requested_by: input.userId,
        source: 'batch',
        status: 'pending',
      };
      addCreatedRow({
        stage: 'destination',
        table: 'sample_request_destinations',
        id: destinationId,
      });

      const labelResponse = await client
        .from('label_prints')
        .insert(labelPayload)
        .select()
        .single();

      if (!isSuccess(labelResponse)) {
        return fail('label', labelResponse.error);
      }

      const labelId = asId(labelResponse.data.id);
      addCreatedRow({
        stage: 'label',
        table: 'label_prints',
        id: labelId,
      });

      return {
        status: 'created',
        inquiryId,
        sampleRequestId,
        sampleItemId,
        destinationId,
        labelId,
        inquiryNumber,
        requestNumber,
      };
    }

    const canRetry =
      attempt + 1 < REQUEST_ATTEMPTS && requestResponse.error?.code === '23505';
    if (!canRetry) {
      return fail('sample_request', requestResponse.error);
    }

    requestNumber = generateRequestNumber(now);
    const updatePayload: Record<string, unknown> = {
      request_number: requestNumber,
    };
    const updateResponse = await client
      .from('inquiries')
      .update(updatePayload)
      .eq('id', inquiryId);

    if (updateResponse.error) {
      return fail('request_number_retry', updateResponse.error);
    }
  }

  return fail('sample_request', {
    code: '23505',
    message: 'Request number generation exhausted its retries.',
  });
}

export interface MemberSamplePipelineInput
  extends Omit<SamplePipelineInput, 'userId'> {
  /** This overload is the compile-time contract for the member-only route. */
  userId: string;
}

export function createMemberFixedSampleRequest(
  input: MemberSamplePipelineInput,
): Promise<SamplePipelineResult> {
  if (typeof input.userId !== 'string' || input.userId.length === 0) {
    return Promise.resolve({
      status: 'failed',
      stage: 'validation',
      message: 'Member sample requests require authenticated ownership.',
      compensation: { status: 'not_needed', deleted: [], errors: [] },
      createdRows: [],
    });
  }
  return createFixedSampleRequest(input);
}
