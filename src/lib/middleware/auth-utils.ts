/**
 * Middleware Auth Utilities
 */

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
  const { data, error } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

