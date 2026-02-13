export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { z } from 'zod';

/**
 * ============================================================
 * Member Settings API
 * ============================================================
 *
 * GET /api/member/settings - Get user's notification settings
 * POST /api/member/settings - Update user's notification settings
 *
 * Uses direct Supabase auth for reliable authentication
 */

// ============================================================
// Helper: Get authenticated user ID from cookies
// ============================================================

async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const { createServerClient } = await import('@supabase/ssr');
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[settings API] Missing Supabase environment variables');
      return null;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    });

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.log('[settings API] Auth error:', error.message);
      return null;
    }

    if (!user) {
      console.log('[settings API] No user found in session');
      return null;
    }

    console.log('[settings API] Found user:', user.id);
    return user.id;
  } catch (error) {
    console.error('[settings API] Error getting authenticated user:', error);
    return null;
  }
}

// ============================================================
// Types
// ============================================================

interface NotificationSettings {
  email_notifications: boolean;
  order_updates: boolean;
  quotation_updates: boolean;
  shipment_notifications: boolean;
  production_updates: boolean;
  marketing_emails: boolean;
  login_notifications: boolean;
  security_alerts: boolean;
}

interface UserSettings {
  notifications: NotificationSettings;
  language: 'ja' | 'en' | 'ko';
  timezone: string;
}

// ============================================================
// Validation Schema
// ============================================================

const notificationSettingsSchema = z.object({
  email_notifications: z.boolean().optional(),
  order_updates: z.boolean().optional(),
  quotation_updates: z.boolean().optional(),
  shipment_notifications: z.boolean().optional(),
  production_updates: z.boolean().optional(),
  marketing_emails: z.boolean().optional(),
  login_notifications: z.boolean().optional(),
  security_alerts: z.boolean().optional(),
});

const updateSettingsSchema = z.object({
  notifications: notificationSettingsSchema.optional(),
  language: z.enum(['ja', 'en', 'ko']).optional(),
  timezone: z.string().optional(),
});

// ============================================================
// Default Settings
// ============================================================

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  email_notifications: true,
  order_updates: true,
  quotation_updates: true,
  shipment_notifications: true,
  production_updates: true,
  marketing_emails: false,
  login_notifications: true,
  security_alerts: true,
};

const DEFAULT_SETTINGS: UserSettings = {
  notifications: DEFAULT_NOTIFICATION_SETTINGS,
  language: 'ja',
  timezone: 'Asia/Tokyo',
};

// ============================================================
// Helper Functions
// ============================================================

/**
 * Merge partial settings with defaults
 */
function mergeWithDefaults(settings: Partial<UserSettings>): UserSettings {
  return {
    notifications: {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...settings.notifications,
    },
    language: settings.language || DEFAULT_SETTINGS.language,
    timezone: settings.timezone || DEFAULT_SETTINGS.timezone,
  };
}

// ============================================================
// GET Handler - Retrieve Settings
// ============================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getAuthenticatedUserId();

    // 未認証の場合はデフォルト設定を返す（UIを壊さないため）
    if (!userId) {
      console.log('[settings API] No authenticated user, returning default settings');
      return NextResponse.json({
        success: true,
        data: DEFAULT_SETTINGS,
      });
    }

    const supabase = createServiceClient();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Settings fetch error:', error);
      return NextResponse.json(
        { error: '設定の取得に失敗しました', code: 'FETCH_ERROR' },
        { status: 500 }
      );
    }

    // Merge with defaults for missing values
    const existingSettings = (profile?.settings as UserSettings) || {};
    const settings = mergeWithDefaults(existingSettings);

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json(
      {
        error: 'サーバーエラーが発生しました',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// POST Handler - Update Settings
// ============================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { error: '認証されていません', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = updateSettingsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '無効な設定データです',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const updates = validationResult.data;
    const supabase = createServiceClient();

    // Get existing settings
    const { data: profile } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', userId)
      .single();

    const existingSettings = (profile?.settings as UserSettings) || {};

    // Merge updates with existing settings
    const mergedSettings: UserSettings = {
      notifications: {
        ...existingSettings.notifications,
        ...DEFAULT_NOTIFICATION_SETTINGS,
        ...updates.notifications,
      },
      language: updates.language ?? existingSettings.language ?? DEFAULT_SETTINGS.language,
      timezone: updates.timezone ?? existingSettings.timezone ?? DEFAULT_SETTINGS.timezone,
    };

    // Update settings in database
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ settings: mergedSettings })
      .eq('id', userId)
      .select('settings')
      .single();

    if (updateError) {
      console.error('Settings update error:', updateError);
      return NextResponse.json(
        { error: '設定の更新に失敗しました', code: 'UPDATE_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '設定を更新しました',
      data: updatedProfile.settings,
    });
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json(
      {
        error: 'サーバーエラーが発生しました',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
