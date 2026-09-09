/**
 * Codec for the middleware-to-server trusted profile header.
 *
 * The payload is derived from the same DB row as the verified role/status
 * headers and is integrity-checked against that RBAC context before use. This
 * is transport encoding only, not encryption or an authorization boundary.
 */

import type { Database } from '@/lib/supabase';

export const TRUSTED_PROFILE_HEADER = 'x-user-profile';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

function defineProfileBindings<
  const Bindings extends ReadonlyArray<readonly [keyof ProfileRow, string | null]>,
>(bindings: Bindings): Bindings {
  return bindings;
}

/**
 * One source for the Supabase projection, profile header payload, and legacy
 * `user_metadata` mapping. Repeating a profile column is intentional when one
 * source field has multiple compatibility names.
 */
export const PROFILE_FIELD_BINDINGS = defineProfileBindings([
  ['id', null],
  ['email', null],
  ['role', 'role'],
  ['status', 'status'],
  ['kanji_last_name', 'kanji_last_name'],
  ['kanji_last_name', 'name_kanji'],
  ['kanji_first_name', 'kanji_first_name'],
  ['kana_last_name', 'kana_last_name'],
  ['kana_last_name', 'name_kana'],
  ['kana_first_name', 'kana_first_name'],
  ['corporate_phone', 'corporate_phone'],
  ['personal_phone', 'personal_phone'],
  ['fax', 'fax'],
  ['company_name', 'company_name'],
  ['position', 'position'],
  ['department', 'department'],
  ['company_url', 'company_url'],
  ['postal_code', 'postal_code'],
  ['prefecture', 'prefecture'],
  ['city', 'city'],
  ['street', 'street'],
  ['product_category', 'product_category'],
  ['business_type', 'business_type'],
  ['created_at', 'created_at'],
  ['last_login_at', 'last_login_at'],
]);

type ProfileColumn = (typeof PROFILE_FIELD_BINDINGS)[number][0];

export const PROFILE_COLUMNS = [
  ...new Set(PROFILE_FIELD_BINDINGS.map(([column]) => column)),
].join(',');

const PROFILE_HEADER_FIELDS = new Set<string>(
  PROFILE_FIELD_BINDINGS.map(([column]) => column),
);

export type TrustedProfilePayload = Pick<ProfileRow, ProfileColumn>;

function encodeBase64Utf8(value: string): string | null {
  try {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    const chunkSize = 0x8000;

    for (let index = 0; index < bytes.length; index += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
    }

    return btoa(binary);
  } catch {
    return null;
  }
}

export function encodeTrustedProfileHeader(
  profile: TrustedProfilePayload,
): string | null {
  try {
    return encodeBase64Utf8(JSON.stringify(profile));
  } catch {
    return null;
  }
}

export type TrustedProfileParseResult =
  | { ok: true; reason?: undefined; profile: TrustedProfilePayload }
  | { ok: false; reason: string; profile?: undefined };

function hasExpectedShape(value: unknown): value is TrustedProfilePayload {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const keys = Object.keys(candidate);
  if (keys.some((key) => !PROFILE_HEADER_FIELDS.has(key))) {
    return false;
  }

  if (keys.some((key) => {
    const field = candidate[key];
    return typeof field !== 'string' && field !== null;
  })) {
    return false;
  }

  return (
    typeof candidate.id === 'string' && candidate.id.length > 0 &&
    typeof candidate.email === 'string' &&
    typeof candidate.role === 'string' && candidate.role.length > 0 &&
    typeof candidate.status === 'string' && candidate.status.length > 0
  );
}

export function parseTrustedProfileHeader(
  value: string,
): TrustedProfileParseResult {
  try {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    const json = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    const profile: unknown = JSON.parse(json);

    if (!hasExpectedShape(profile)) {
      return { ok: false, reason: 'profile payload has an invalid shape' };
    }

    return { ok: true, profile };
  } catch {
    return { ok: false, reason: 'profile payload is not valid Base64 JSON' };
  }
}

export function isTrustedProfileIdentity(
  profile: TrustedProfilePayload,
  context: { userId: string; role: string; status: string },
): boolean {
  return (
    profile.id === context.userId &&
    profile.role.toLowerCase() === context.role.toLowerCase() &&
    profile.status === context.status
  );
}
