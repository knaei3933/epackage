/**
 * Request-scoped authentication context
 *
 * React `cache` keeps each value scoped to the current Server render/request.
 * It does not create a shared cache across middleware, route handlers,
 * Server Actions, or separate proxy requests.
 */

import { cache } from 'react';
import { createServiceClient, type Database } from '@/lib/supabase';
import { getRBACContext, type RBACContext } from '@/lib/rbac/rbac-helpers';
import {
  isTrustedProfileIdentity,
  parseTrustedProfileHeader,
  PROFILE_COLUMNS,
  PROFILE_FIELD_BINDINGS,
  TRUSTED_PROFILE_HEADER,
  type TrustedProfilePayload,
} from '@/lib/auth/profile-header';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileColumn = keyof TrustedProfilePayload;

export type RequestProfile = Pick<ProfileRow, ProfileColumn>;

export type RequestAuthUser = {
  id: string;
  email?: string;
  user_metadata?: {
    kanji_last_name?: string;
    kanji_first_name?: string;
    name_kanji?: string;
    name_kana?: string;
    kana_last_name?: string;
    kana_first_name?: string;
    corporate_phone?: string;
    personal_phone?: string;
    fax?: string;
    company_name?: string;
    position?: string;
    department?: string;
    company_url?: string;
    postal_code?: string;
    prefecture?: string;
    city?: string;
    street?: string;
    product_category?: string;
    business_type?: string;
    role?: string;
    status?: string;
    created_at?: string;
    last_login_at?: string | undefined;
    [key: string]: string | null | undefined;
  };
};

const cachedRBACContext = cache(async (): Promise<RBACContext | null> => {
  return getRBACContext();
});

const cachedProfile = cache(async (): Promise<RequestProfile | null> => {
  const context = await cachedRBACContext();
  if (!context) {
    return null;
  }

  const { headers } = await import('next/headers');
  const encodedProfile = (await headers()).get(TRUSTED_PROFILE_HEADER);

  if (encodedProfile !== null) {
    const result = parseTrustedProfileHeader(encodedProfile);

    if (!result.ok) {
      console.error('[RequestContext] Invalid trusted profile header:', result.reason);
      return null;
    }

    if (!isTrustedProfileIdentity(result.profile, context)) {
      console.error(
        '[RequestContext] Invalid trusted profile header:',
        'identity does not match verified RBAC context',
      );
      return null;
    }

    return result.profile;
  }

  const serviceClient = createServiceClient();
  const { data, error } = await serviceClient
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', context.userId)
    .maybeSingle();

  if (error) {
    console.error('[RequestContext] Profile query error:', error.message);
    return null;
  }

  // `GenericStringError` is Supabase's representation of an invalid dynamic
  // projection; exclude it before treating the result as the declared row.
  if (!data || 'error' in data) {
    console.error('[RequestContext] Profile lookup failed: profile row is null');
    return null;
  }

  return data;
});

/**
 * Returns the verified RBAC context once per Server render/request.
 * Role and status are never accepted from a caller.
 */
export async function getRequestRBACContext(): Promise<RBACContext | null> {
  return cachedRBACContext();
}

/**
 * Returns the verified user's profile once per Server render/request.
 */
export async function getRequestProfile(): Promise<RequestProfile | null> {
  return cachedProfile();
}

function toRequestAuthUser(
  context: RBACContext,
  profile: RequestProfile | null
): RequestAuthUser {
  const metadata: RequestAuthUser['user_metadata'] = {};

  for (const [column, metadataKey] of PROFILE_FIELD_BINDINGS) {
    if (!metadataKey) {
      continue;
    }

    metadata[metadataKey] =
      profile?.[column] || (column === 'last_login_at' ? undefined : '');
  }

  return {
    id: context.userId,
    email: profile?.email || '',
    user_metadata: metadata,
  };
}

/**
 * Returns the same user shape as `requireAuth()` once per request.
 */
export async function getRequestAuthUser(): Promise<RequestAuthUser | null> {
  const context = await getRequestRBACContext();

  // A verified RBAC session is the authentication boundary. A missing or
  // failed profile lookup degrades to defaults; it must not invalidate auth.
  if (!context) {
    return null;
  }

  const profile = await getRequestProfile();

  return toRequestAuthUser(context, profile);
}
