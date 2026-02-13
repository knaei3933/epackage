/**
 * Settings SignOut Provider Wrapper
 *
 * Provides signOut function from AuthContext to SettingsClient.
 * This is a thin client component wrapper that passes signOut to the SettingsClient.
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { SettingsClient, SettingsClientProps } from './SettingsClient';

export interface SettingsSignOutProviderProps {
  // All props except signOut from SettingsClient
  userId: string;
  userEmail: string;
  userName: string;
  userLastName: string;
  userFirstName: string;
  userCreatedAt: string;
  userStatus: string;
}

export function SettingsSignOutProvider({
  userId,
  userEmail,
  userName,
  userLastName,
  userFirstName,
  userCreatedAt,
  userStatus,
}: SettingsSignOutProviderProps) {
  const { signOut } = useAuth();

  return (
    <SettingsClient
      userId={userId}
      userEmail={userEmail}
      userName={userName}
      userLastName={userLastName}
      userFirstName={userFirstName}
      userCreatedAt={userCreatedAt}
      userStatus={userStatus}
      signOut={signOut}
    />
  );
}
