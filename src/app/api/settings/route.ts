/**
 * User Settings API Route
 *
 * ユーザー設定管理：
 * - GET: ユーザー設定の読み込み
 * - PATCH: 設定の更新
 * - profiles.settings（Json）でユーザー設定を永続化
 *
 * Security:
 * - 認証されたユーザーのみアクセス可能
 * - 自分の設定のみ取得・修正可能
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { z } from 'zod';
import type { Json } from '@/types/database';

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

    // Fetch user settings from profiles.settings (Json)
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    // profiles.settings は Json 型。UserSettings へ unknown 経由で変換（technical debt: DB カラム型が Json のため）
    const stored = (profile?.settings ?? {}) as Partial<UserSettings>;

    if (!profile || !stored) {
      console.log('[Settings API] No settings found, returning defaults');
      return NextResponse.json({
        success: true,
        data: {
          userId: user.id,
          notificationSettings: stored.notificationSettings ?? notificationSettingsSchema.parse({}),
          securitySettings: stored.securitySettings ?? securitySettingsSchema.parse({}),
          displayName: stored.displayName ?? user.user_metadata?.displayName ?? '',
          language: stored.language ?? 'ja',
          timezone: stored.timezone ?? 'Asia/Tokyo',
        }
      });
    }

    console.log('[Settings API] Settings loaded successfully');
    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        notificationSettings: stored.notificationSettings ?? notificationSettingsSchema.parse({}),
        securitySettings: stored.securitySettings ?? securitySettingsSchema.parse({}),
        displayName: stored.displayName ?? user.user_metadata?.displayName ?? '',
        language: stored.language ?? 'ja',
        timezone: stored.timezone ?? 'Asia/Tokyo',
      }
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

    // Get existing settings from profiles.settings (Json)
    const { data: profile } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', user.id)
      .maybeSingle();

    // profiles.settings は Json 型。UserSettings へ unknown 経由で変換
    const existing = (profile?.settings ?? {}) as Partial<UserSettings>;

    const mergedSettings: UserSettings = {
      notificationSettings: validatedData.notificationSettings ?? existing.notificationSettings ?? notificationSettingsSchema.parse({}),
      securitySettings: validatedData.securitySettings ?? existing.securitySettings ?? securitySettingsSchema.parse({}),
      displayName: validatedData.displayName ?? existing.displayName ?? user.user_metadata?.displayName ?? '',
      language: validatedData.language ?? existing.language ?? 'ja',
      timezone: validatedData.timezone ?? existing.timezone ?? 'Asia/Tokyo',
    };

    // profiles.settings (Json) へ保存。UserSettings を unknown 経由で Json 互換へ変換
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ settings: mergedSettings as unknown as Json })
      .eq('id', user.id)
      .select('settings')
      .single();

    if (updateError) throw updateError;
    const result = updatedProfile?.settings;

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
