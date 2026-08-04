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

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';

// =====================================================
// Zod Schema for Profile Update
// =====================================================
// ユーザーが自分で編集できる項目＝連絡先3項目のみ（SoT・単一信頼源）。
// 住所・会社情報は「管理者承認・お問い合わせ経由」が正のためサーバーでは不許可。
// .strict() により許可3項目以外を含むリクエストは 400 拒否（strip ではなく）。
// defense in depth + 移行漏れ早期検出 + API 契約の明確化。
// 将来 B2B 自己編集要件が再拡張された場合は adminApprovedProfileSchema を別途定義すること。

const userEditableProfileSchema = z.object({
  // 電話番号（ユーザー編集可能・連絡先3項目のみ）
  corporate_phone: z.string().optional(),
  personal_phone: z.string().optional(),
  fax: z.string().optional(),
}).strict();

type UserEditableProfileData = z.infer<typeof userEditableProfileSchema>;

// =====================================================
// GET: 現在のユーザープロフィール取得
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase environment variables not configured' },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    const { createServerClient } = await import('@supabase/ssr');
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    });

    // Get authenticated user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: '認証されていません。', error_code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userId = user.id;

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
        fax: profile.fax,
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase environment variables not configured' },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    const { createServerClient } = await import('@supabase/ssr');
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    });

    // Get authenticated user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: '認証されていません。', error_code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userId = user.id;

    const body = await request.json();

    // スキーマ検証（.strict() により許可3項目以外を含むリクエストは 400 拒否）
    const validationResult = userEditableProfileSchema.safeParse(body);

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

    // Supabaseで更新（連絡先3項目のみ・SoT）
    const updateData: Record<string, any> = {};

    if (data.corporate_phone !== undefined)
      updateData.corporate_phone = data.corporate_phone || null;
    if (data.personal_phone !== undefined)
      updateData.personal_phone = data.personal_phone || null;
    if (data.fax !== undefined)
      updateData.fax = data.fax || null;

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
      fax: updatedProfile.fax,
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
