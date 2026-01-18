/**
 * Profile Management API Route (Integrated from /api/customer/profile)
 * Supabase
 *
 * ユーザープロフィール情報を取得・修正します
 * GET: 現在ログイン中のユーザーのプロフィールを取得（company, preferences含む）
 * PATCH: 現在ログイン中のユーザーのプロフィールを修正
 *
 * Integrated for:
 * - Member pages
 * - Portal pages (migrated to /admin/customers)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Type assertions for TypeScript (throw doesn't narrow types in all cases)
const supabaseUrlTyped = supabaseUrl as string;
const supabaseAnonKeyTyped = supabaseAnonKey as string;

// =====================================================
// Zod Schema for Profile Update
// =====================================================

const profileUpdateSchema = z.object({
  // 電話番号
  corporate_phone: z.string().optional(),
  personal_phone: z.string().optional(),

  // 会社情報
  company_name: z.string().max(200).optional(),
  position: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  company_url: z.string().url('有効なURLを入力してください。').optional().or(z.literal('')),

  // 流入経路
  acquisition_channel: z.string().max(100).optional(),

  // 住所情報
  postal_code: z
    .string()
    .regex(/^\d{3}-?\d{4}$/, '有効な郵便番号形式ではありません（例：123-4567）')
    .optional()
    .or(z.literal('')),
  prefecture: z.string().optional(),
  city: z.string().optional(),
  street: z.string().optional(),
  building: z.string().optional(),
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

// =====================================================
// GET: 現在のユーザープロフィール取得
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(supabaseUrlTyped, supabaseAnonKeyTyped, {
      auth: {
        storage: {
          getItem: (key: string) => {
            const cookie = cookieStore.get(key);
            return cookie?.value ?? null;
          },
          setItem: (key: string, value: string) => {
            cookieStore.set(key, value, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            });
          },
          removeItem: (key: string) => {
            cookieStore.delete(key);
          },
        },
      },
    });

    // Check for DEV_MODE header from middleware (DEV_MODE has priority)
    const devModeUserId = request.headers.get('x-user-id');
    const isDevMode = request.headers.get('x-dev-mode') === 'true';

    let userId: string;

    if (isDevMode && devModeUserId) {
      // DEV_MODE: Use header from middleware
      console.log('[Profile API] DEV_MODE: Using x-user-id header:', devModeUserId);
      userId = devModeUserId;
    } else {
      // Normal auth: Use cookie-based auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return NextResponse.json(
          { error: '認証されていません。', error_code: 'UNAUTHORIZED' },
          { status: 401 }
        );
      }
      userId = user.id;
      console.log('[Profile API] Authenticated user:', userId);
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'プロフィールが見つかりませんでした。', error_code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get company info if applicable (integrated from /api/customer/profile)
    let company = null;
    if (profile.company_name || (profile.business_type === 'CORPORATION')) {
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      company = companyData;
    }

    // Get or create customer preferences (integrated from /api/customer/profile)
    let preferences = null;
    try {
      const { data: preferencesData } = await supabase
        .rpc('get_or_create_customer_preferences', { user_uuid: userId });
      preferences = preferencesData;
    } catch (e) {
      console.warn('Customer preferences RPC not available:', e);
    }

    // Build response data (combined format for Member and Portal compatibility)
    const responseData = {
      user: {
        id: profile.id,
        email: profile.email,
        emailVerified: profile.email_confirmed_at,
        kanji_last_name: profile.kanji_last_name,
        kanji_first_name: profile.kanji_first_name,
        kana_last_name: profile.kana_last_name,
        kana_first_name: profile.kana_first_name,
        corporate_phone: profile.corporate_phone,
        personal_phone: profile.personal_phone,
        business_type: profile.business_type,
        user_type: profile.user_type,
        company_name: profile.company_name,
        legal_entity_number: profile.legal_entity_number,
        position: profile.position,
        department: profile.department,
        company_url: profile.company_url,
        product_category: profile.product_category,
        acquisition_channel: profile.acquisition_channel,
        postal_code: profile.postal_code,
        prefecture: profile.prefecture,
        city: profile.city,
        street: profile.street,
        building: profile.building,
        role: profile.role,
        status: profile.status,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        last_login_at: profile.last_login_at,
      },
      company: company ? {
        id: company.id,
        name: company.name,
        name_kana: company.name_kana,
        corporate_number: company.corporate_number,
        industry: company.industry,
        payment_terms: company.payment_terms,
      } : null,
      preferences: preferences,
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('Profile GET error:', error);

    return NextResponse.json(
      {
        error: 'プロフィール情報の取得中にエラーが発生しました。',
        error_code: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}

// =====================================================
// PATCH: 現在のユーザープロフィール修正
// =====================================================

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(supabaseUrlTyped, supabaseAnonKeyTyped, {
      auth: {
        storage: {
          getItem: (key: string) => {
            const cookie = cookieStore.get(key);
            return cookie?.value ?? null;
          },
          setItem: (key: string, value: string) => {
            cookieStore.set(key, value, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            });
          },
          removeItem: (key: string) => {
            cookieStore.delete(key);
          },
        },
      },
    });

    // Check for DEV_MODE header from middleware (DEV_MODE has priority)
    const devModeUserId = request.headers.get('x-user-id');
    const isDevMode = request.headers.get('x-dev-mode') === 'true';

    let userId: string;

    if (isDevMode && devModeUserId) {
      // DEV_MODE: Use header from middleware
      console.log('[Profile Update API] DEV_MODE: Using x-user-id header:', devModeUserId);
      userId = devModeUserId;
    } else {
      // Normal auth: Use cookie-based auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return NextResponse.json(
          { error: '認証されていません。', error_code: 'UNAUTHORIZED' },
          { status: 401 }
        );
      }
      userId = user.id;
    }

    const body = await request.json();

    // スキーマ検証
    const validationResult = profileUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '入力値が正しくありません。',
          error_code: 'VALIDATION_ERROR',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Supabaseで更新
    const updateData: Record<string, any> = {};

    if (data.corporate_phone !== undefined)
      updateData.corporate_phone = data.corporate_phone || null;
    if (data.personal_phone !== undefined)
      updateData.personal_phone = data.personal_phone || null;
    if (data.company_name !== undefined)
      updateData.company_name = data.company_name || null;
    if (data.position !== undefined)
      updateData.position = data.position || null;
    if (data.department !== undefined)
      updateData.department = data.department || null;
    if (data.company_url !== undefined)
      updateData.company_url = data.company_url || null;
    if (data.acquisition_channel !== undefined)
      updateData.acquisition_channel = data.acquisition_channel || null;
    if (data.postal_code !== undefined)
      updateData.postal_code = data.postal_code || null;
    if (data.prefecture !== undefined)
      updateData.prefecture = data.prefecture || null;
    if (data.city !== undefined) updateData.city = data.city || null;
    if (data.street !== undefined) updateData.street = data.street || null;
    if (data.building !== undefined) updateData.building = data.building || null;

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json(
        { error: 'プロフィールの修正中にエラーが発生しました。', error_code: 'UPDATE_ERROR' },
        { status: 500 }
      );
    }

    // 更新されたユーザー情報を返す
    const userProfile = {
      id: updatedProfile.id,
      email: updatedProfile.email,
      kanji_last_name: updatedProfile.kanji_last_name,
      kanji_first_name: updatedProfile.kanji_first_name,
      kana_last_name: updatedProfile.kana_last_name,
      kana_first_name: updatedProfile.kana_first_name,
      corporate_phone: updatedProfile.corporate_phone,
      personal_phone: updatedProfile.personal_phone,
      business_type: updatedProfile.business_type,
      user_type: updatedProfile.user_type,
      company_name: updatedProfile.company_name,
      position: updatedProfile.position,
      department: updatedProfile.department,
      company_url: updatedProfile.company_url,
      postal_code: updatedProfile.postal_code,
      prefecture: updatedProfile.prefecture,
      city: updatedProfile.city,
      street: updatedProfile.street,
      building: updatedProfile.building,
      role: updatedProfile.role,
      status: updatedProfile.status,
      created_at: updatedProfile.created_at,
      updated_at: updatedProfile.updated_at,
      last_login_at: updatedProfile.last_login_at,
    };

    return NextResponse.json({
      success: true,
      message: 'プロフィールを更新しました。',
      data: userProfile,
    });
  } catch (error) {
    console.error('Profile PATCH error:', error);

    return NextResponse.json(
      {
        error: 'プロフィール更新中にエラーが発生しました。',
        error_code: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}

// =====================================================
// OPTIONSメソッド - CORS preflightリクエスト処理
// =====================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
