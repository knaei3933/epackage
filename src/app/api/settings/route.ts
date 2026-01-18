/**
 * User Settings API Route
 *
 * ユーザー設定管理：
 * - GET: ユーザー設定の読み込み
 * - PATCH: 設定の更新
 * - user_settingsテーブル連携
 *
 * Security:
 * - 認証されたユーザーのみアクセス可能
 * - 自分の設定のみ取得・修正可能
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { z } from 'zod';

// =====================================================
// Schema Validation
// =====================================================

// Notification settings schema
const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  orderStatusUpdates: z.boolean().default(true),
  productionUpdates: z.boolean().default(true),
  shipmentUpdates: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
});

// Security settings schema
const securitySettingsSchema = z.object({
  twoFactorEnabled: z.boolean().default(false),
  loginNotifications: z.boolean().default(true),
  sessionTimeout: z.number().int().min(5).max(120).default(30), // minutes
});

// User settings update schema
const userSettingsSchema = z.object({
  notificationSettings: notificationSettingsSchema.optional(),
  securitySettings: securitySettingsSchema.optional(),
  displayName: z.string().max(100).optional(),
  language: z.enum(['ja', 'en', 'ko']).default('ja'),
  timezone: z.string().default('Asia/Tokyo'),
});

type UserSettings = z.infer<typeof userSettingsSchema>;

// =====================================================
// GET: ユーザー設定の読み込み
// =====================================================

export async function GET(request: NextRequest) {
  console.log('[Settings API] GET request received');

  try {
    // Get user from session
    const supabase = createServiceClient();

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify user and get user ID
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('[Settings API] Auth error:', authError);
      return NextResponse.json(
        { success: false, error: '無効なトークンです' },
        { status: 401 }
      );
    }

    console.log('[Settings API] Loading settings for user:', user.id);

    // Fetch user settings from database
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If no settings found, return defaults
      if (error.code === 'PGRST116') {
        console.log('[Settings API] No settings found, returning defaults');
        return NextResponse.json({
          success: true,
          data: {
            userId: user.id,
            notificationSettings: notificationSettingsSchema.parse({}),
            securitySettings: securitySettingsSchema.parse({}),
            displayName: user.user_metadata?.displayName || '',
            language: 'ja',
            timezone: 'Asia/Tokyo',
          }
        });
      }

      throw error;
    }

    console.log('[Settings API] Settings loaded successfully');
    return NextResponse.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('[Settings API] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '設定の読み込みに失敗しました',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// =====================================================
// PATCH: ユー設定の更新
// =====================================================

export async function PATCH(request: NextRequest) {
  console.log('[Settings API] PATCH request received');

  try {
    // Get user from session
    const supabase = createServiceClient();

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify user and get user ID
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('[Settings API] Auth error:', authError);
      return NextResponse.json(
        { success: false, error: '無効なトークンです' },
        { status: 401 }
      );
    }

    console.log('[Settings API] Updating settings for user:', user.id);

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = userSettingsSchema.parse(body);

    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;

    if (existingSettings) {
      // Update existing settings
      const { data, error } = await (supabase as any)
        .from('user_settings')
        .update({
          notification_settings: validatedData.notificationSettings,
          security_settings: validatedData.securitySettings,
          display_name: validatedData.displayName,
          language: validatedData.language,
          timezone: validatedData.timezone,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new settings
      const { data, error } = await (supabase as any)
        .from('user_settings')
        .insert({
          user_id: user.id,
          notification_settings: validatedData.notificationSettings || notificationSettingsSchema.parse({}),
          security_settings: validatedData.securitySettings || securitySettingsSchema.parse({}),
          display_name: validatedData.displayName || user.user_metadata?.displayName || '',
          language: validatedData.language,
          timezone: validatedData.timezone,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    console.log('[Settings API] Settings updated successfully');
    return NextResponse.json({
      success: true,
      message: '設定を更新しました',
      data: result
    });

  } catch (error) {
    console.error('[Settings API] PATCH error:', error);

    // Zod validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: '入力データに誤りがあります',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: '設定の更新に失敗しました',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
