/**
 * Middleware Auth Utilities
 */

import { PROFILE_COLUMNS } from '@/lib/auth/profile-header';

/**
 * The middleware invokes this helper once per protected request. A very short
 * instance-local cache removes the repeated cross-region profile lookup inside
 * a navigation burst while keeping role/status staleness bounded to 10 seconds.
 * The cache lives in Edge module memory and is never persisted or shared with
 * callers; the verified JWT remains the authentication boundary.
 */
const PROFILE_CACHE_TTL_MS = 10_000;
const PROFILE_CACHE_MAX_ENTRIES = 1_000;
type CachedProfile = { expiresAt: number; profile: unknown };
const profileCache = new Map<string, CachedProfile>();

export type VerifiedAuthUser = {
  id: string;
  email?: string;
};

type VerifiedClaims = {
  sub?: unknown;
  email?: unknown;
};

/**
 * Verify the access token without calling /auth/v1/user on every request.
 * Supabase asymmetric JWTs are verified locally with a cached JWKS; symmetric
 * projects transparently fall back to getUser inside getClaims.
 */
export async function getVerifiedAuthUser(
  supabase: any,
): Promise<VerifiedAuthUser | null> {
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims as VerifiedClaims | undefined;

  if (
    error ||
    !claims ||
    typeof claims.sub !== 'string' ||
    claims.sub.length === 0
  ) {
    return null;
  }

  return {
    id: claims.sub,
    email: typeof claims.email === 'string' ? claims.email : undefined,
  };
}

// Helper: Check User Status from Profile
// =====================================================

/**
 * Check if user's email is in the korea_designer_emails whitelist
 */
export async function checkDesignerEmailList(supabase: any, email: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('notification_settings')
      .select('value')
      .eq('key', 'korea_designer_emails')
      .maybeSingle();

    if (!data?.value) return false;

    const emailList = data.value as string[];
    return emailList.includes(email);
  } catch {
    return false;
  }
}

export async function getUserProfile(supabase: any, userId: string) {
  const now = Date.now();
  const cached = profileCache.get(userId);
  if (cached && cached.expiresAt > now) {
    // LRU refresh prevents an authenticated browsing burst from being evicted
    // by unrelated one-off users.
    profileCache.delete(userId);
    profileCache.set(userId, cached);
    return cached.profile;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  if (profileCache.size >= PROFILE_CACHE_MAX_ENTRIES) {
    const oldestKey = profileCache.keys().next().value;
    if (oldestKey !== undefined) {
      profileCache.delete(oldestKey);
    }
  }

  profileCache.set(userId, {
    profile: data,
    expiresAt: now + PROFILE_CACHE_TTL_MS,
  });

  return data;
}
