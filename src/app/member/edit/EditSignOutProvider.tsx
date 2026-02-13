/**
 * Edit SignOut Provider Wrapper
 *
 * Provides signOut, updateProfile, and updatePassword functions from AuthContext to EditClient.
 * This is a thin client component wrapper that passes auth functions to EditClient.
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { EditClient, EditClientProps } from './EditClient';

export interface EditSignOutProviderProps {
  // All props except auth functions from EditClient
  userId: string;
  userEmail: string;
  userCorporatePhone?: string;
  userPersonalPhone?: string;
}

export function EditSignOutProvider({
  userId,
  userEmail,
  userCorporatePhone,
  userPersonalPhone,
}: EditSignOutProviderProps) {
  const { updateProfile, updatePassword, signOut } = useAuth();

  return (
    <EditClient
      userId={userId}
      userEmail={userEmail}
      userCorporatePhone={userCorporatePhone}
      userPersonalPhone={userPersonalPhone}
      updateProfile={updateProfile}
      updatePassword={updatePassword}
      signOut={signOut}
    />
  );
}
