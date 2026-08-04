/**
 * Profile SignOut Provider Wrapper
 *
 * Provides updateProfile function from AuthContext to ProfileClient.
 * This is a thin client component wrapper that passes auth functions to ProfileClient.
 * Server Component から受け取った props をそのまま伝播し、updateProfile のみを内部で注入する。
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ProfileClient, ProfileClientProps } from './ProfileClient';

// ProfileClient の props から updateProfile を除外したものが wrapper の受け取る props
export type ProfileSignOutProviderProps = Omit<ProfileClientProps, 'updateProfile'>;

export function ProfileSignOutProvider(props: ProfileSignOutProviderProps) {
  const { updateProfile } = useAuth();

  return <ProfileClient {...props} updateProfile={updateProfile} />;
}
