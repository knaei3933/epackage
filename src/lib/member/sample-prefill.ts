/**
 * Server-side prefill resolver for the fixed member sample request flow.
 *
 * This module must only be imported from server components or route handlers.
 * The database client is injected so the merge rules remain deterministic and
 * easy to exercise without a real Supabase connection.
 */

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

import type { Database } from '@/types/database';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type DeliveryAddressRow = Database['public']['Tables']['delivery_addresses']['Row'];

const REQUIRED_CONFIRMATION_FIELDS = [
  'contactPerson',
  'phone',
  'postalCode',
  'prefecture',
  'city',
  'street',
] as const;

export type SampleConfirmationRequiredField =
  (typeof REQUIRED_CONFIRMATION_FIELDS)[number];

export const sampleRequestConfirmationSchema = z.object({
  contactPerson: z
    .string()
    .trim()
    .min(1, '担当者名を入力してください。')
    .max(100, '担当者名は100文字以内で入力してください。'),
  phone: z
    .string()
    .trim()
    .min(1, '電話番号を入力してください。')
    .max(20, '電話番号は20文字以内で入力してください。')
    .regex(/^\d{2,4}-?\d{2,4}-?\d{3,4}$/, '有効な電話番号を入力してください。'),
  postalCode: z
    .string()
    .trim()
    .min(1, '郵便番号を入力してください。')
    .regex(/^\d{3}-?\d{4}$/, '有効な郵便番号を入力してください。（例：123-4567）'),
  prefecture: z
    .string()
    .trim()
    .min(1, '都道府県を入力してください。')
    .max(50, '都道府県は50文字以内で入力してください。'),
  city: z
    .string()
    .trim()
    .min(1, '市区町村を入力してください。')
    .max(100, '市区町村は100文字以内で入力してください。'),
  street: z
    .string()
    .trim()
    .min(1, '番地を入力してください。')
    .max(200, '番地は200文字以内で入力してください。'),
  companyName: z
    .string()
    .trim()
    .max(200, '会社名は200文字以内で入力してください。')
    .optional()
    .default(''),
  building: z
    .string()
    .trim()
    .max(200, '建物名は200文字以内で入力してください。')
    .optional()
    .default(''),
});

export type SampleRequestConfirmation = z.infer<
  typeof sampleRequestConfirmationSchema
>;

export interface SamplePrefillData {
  confirmation: SampleRequestConfirmation;
  /** Kana is intentionally separate and is never sourced from delivery data. */
  profileKana: {
    lastName: string;
    firstName: string;
    name: string;
  };
}

export interface SamplePrefillValidationError {
  field: string;
  message: string;
}

export interface SamplePrefillEvaluation {
  data: SamplePrefillData;
  complete: boolean;
  missingFields: SampleConfirmationRequiredField[];
  validationErrors: SamplePrefillValidationError[];
}

export type SamplePrefillFailureStatus =
  | 'profile_query_failed'
  | 'profile_not_found'
  | 'profile_not_active'
  | 'delivery_query_failed';

export type InactiveMemberStatus = 'PENDING' | 'SUSPENDED' | 'DELETED';

export type SamplePrefillOutcome =
  | (SamplePrefillEvaluation & { status: 'loaded' })
  | {
      status: Exclude<SamplePrefillFailureStatus, 'profile_not_active'>;
      data: null;
      complete: false;
      missingFields: [];
      validationErrors: [];
    }
  | {
      status: 'profile_not_active';
      profileStatus: InactiveMemberStatus;
      data: null;
      complete: false;
      missingFields: [];
      validationErrors: [];
    };

const normalizeText = (value: string | null | undefined): string =>
  value?.trim() ?? '';

const firstNonEmpty = (...values: Array<string | null | undefined>): string => {
  for (const value of values) {
    const normalized = normalizeText(value);
    if (normalized) return normalized;
  }
  return '';
};

const pickProfilePhone = (profile: ProfileRow): string =>
  firstNonEmpty(profile.corporate_phone, profile.personal_phone);

const logPrefillQueryFailure = (
  status: Extract<SamplePrefillFailureStatus, 'profile_query_failed' | 'delivery_query_failed'>,
  userId: string,
): void => {
  // Keep the fail-closed behavior intact while making infrastructure failures
  // diagnosable. Never log query payloads, profile fields, or database errors.
  console.error('[sample-prefill] query failed', {
    status,
    route: '/samples',
    userId,
  });
};

/**
 * Merge an ACTIVE member profile with the already-selected default delivery.
 * Profile values win field-by-field only while trimmed non-empty. Company is
 * profile-only, building is delivery-only, and kana is never taken from name.
 */
export function buildSamplePrefill(
  profile: ProfileRow,
  delivery: DeliveryAddressRow | null,
): SamplePrefillEvaluation {
  const profilePhone = pickProfilePhone(profile);
  const profileKanjiFamily = normalizeText(profile.kanji_last_name);
  const profileKanjiGiven = normalizeText(profile.kanji_first_name);
  const hasCompleteProfileKanjiName = Boolean(
    profileKanjiFamily && profileKanjiGiven,
  );
  const contactPerson = hasCompleteProfileKanjiName
    ? `${profileKanjiFamily} ${profileKanjiGiven}`
    : normalizeText(delivery?.contact_person);

  const kanaLastName = normalizeText(profile.kana_last_name);
  const kanaFirstName = normalizeText(profile.kana_first_name);
  const candidate = {
    contactPerson,
    phone: profilePhone || normalizeText(delivery?.phone),
    postalCode:
      normalizeText(profile.postal_code) || normalizeText(delivery?.postal_code),
    prefecture:
      normalizeText(profile.prefecture) || normalizeText(delivery?.prefecture),
    city: normalizeText(profile.city) || normalizeText(delivery?.city),
    // delivery.address is the street-level address used by delivery rows.
    street: normalizeText(profile.street) || normalizeText(delivery?.address),
    // Company is deliberately profile-only.
    companyName: normalizeText(profile.company_name),
    // Building is deliberately sourced only from the delivery destination.
    building: normalizeText(delivery?.building),
  };

  const parsed = sampleRequestConfirmationSchema.safeParse(candidate);
  const missingFields = REQUIRED_CONFIRMATION_FIELDS.filter((field) => {
    const value = candidate[field];
    return !normalizeText(value);
  });
  const validationErrors = parsed.success
    ? []
    : parsed.error.issues.map((issue) => ({
        field: issue.path.map((part) => String(part)).join('.') || '_form',
        message: issue.message,
      }));

  return {
    data: {
      confirmation: parsed.success ? parsed.data : candidate,
      profileKana: {
        lastName: kanaLastName,
        firstName: kanaFirstName,
        name: [kanaLastName, kanaFirstName].filter(Boolean).join(' '),
      },
    },
    complete: parsed.success,
    missingFields,
    validationErrors,
  };
}

const PROFILE_SELECT_FIELDS = [
  'id',
  'kanji_last_name',
  'kanji_first_name',
  'kana_last_name',
  'kana_first_name',
  'corporate_phone',
  'personal_phone',
  'postal_code',
  'prefecture',
  'city',
  'street',
  'company_name',
  'status',
].join(',');

const DELIVERY_SELECT_FIELDS = [
  'id',
  'phone',
  'postal_code',
  'prefecture',
  'city',
  'address',
  'building',
  'contact_person',
].join(',');

/**
 * Load one ACTIVE member profile and the deterministic default delivery row.
 * Delivery selection intentionally uses limit(1), never `.single()`.
 */
export async function loadSamplePrefill(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<SamplePrefillOutcome> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT_FIELDS)
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    logPrefillQueryFailure('profile_query_failed', userId);
    return {
      status: 'profile_query_failed',
      data: null,
      complete: false,
      missingFields: [],
      validationErrors: [],
    };
  }

  if (!profile) {
    return {
      status: 'profile_not_found',
      data: null,
      complete: false,
      missingFields: [],
      validationErrors: [],
    };
  }

  const typedProfile = profile as unknown as ProfileRow;

  if (typedProfile.status !== 'ACTIVE') {
    return {
      status: 'profile_not_active',
      profileStatus: typedProfile.status,
      data: null,
      complete: false,
      missingFields: [],
      validationErrors: [],
    };
  }

  const { data: deliveries, error: deliveryError } = await supabase
    .from('delivery_addresses')
    .select(DELIVERY_SELECT_FIELDS)
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(1);

  if (deliveryError) {
    logPrefillQueryFailure('delivery_query_failed', userId);
    return {
      status: 'delivery_query_failed',
      data: null,
      complete: false,
      missingFields: [],
      validationErrors: [],
    };
  }

  const delivery = (deliveries?.[0] ?? null) as unknown as
    | DeliveryAddressRow
    | null;
  return {
    status: 'loaded',
    ...buildSamplePrefill(typedProfile, delivery),
  };
}
