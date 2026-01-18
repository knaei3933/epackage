/**
 * Profile Management API Route (Admin) - Supabase
 *
 * 管理者専用：他のユーザーのプロフィールを取得・修正します
 * GET: 特定のユーザープロフィールを取得
 * PATCH: 特定のユーザープロフィールを修正（管理者のみ）
 * DELETE: 特定のユーザーを削除（管理者のみ）
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
// Admin Schema for Profile Update (full access)
// =====================================================

const adminProfileUpdateSchema = z.object({
  // 日本の氏名
  kanjiLastName: z.string().min(1).max(50).optional(),
  kanjiFirstName: z.string().min(1).max(50).optional(),
  kanaLastName: z.string().min(1).max(50).optional(),
  kanaFirstName: z.string().min(1).max(50).optional(),

  // 電話番号
  corporatePhone: z.string().optional(),
  personalPhone: z.string().optional(),

  // 事業者タイプ
  businessType: z.enum(['INDIVIDUAL', 'CORPORATION']).optional(),

  // 会社情報
  companyName: z.string().max(200).optional(),
  legalEntityNumber: z.string().optional(),
  position: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  companyUrl: z.string().url().optional().or(z.literal('')),

  // 製品カテゴリ
  productCategory: z
    .enum(['COSMETICS', 'CLOTHING', 'ELECTRONICS', 'KITCHEN', 'FURNITURE', 'OTHER'])
    .optional(),

  // 流入経路
  acquisitionChannel: z.string().max(100).optional(),

  // 住所情報
  postalCode: z.string().optional(),
  prefecture: z.string().optional(),
  city: z.string().optional(),
  street: z.string().optional(),

  // ロールおよびステータス（管理者のみ修正可能）
  role: z.enum(['ADMIN', 'MEMBER']).optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED']).optional(),
});

type AdminProfileUpdateData = z.infer<typeof adminProfileUpdateSchema>;

// =====================================================
// Helper: 管理者権限確認
// =====================================================

async function checkAdminPermission(supabase: any, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', userId)
    .single();

  if (!profile) {
    return { authorized: false, error: 'プロフィールが見つかりませんでした。' };
  }

  if (profile.status !== 'ACTIVE') {
    return { authorized: false, error: 'アクティブなアカウントではありません。' };
  }

  if (profile.role !== 'ADMIN') {
    return { authorized: false, error: '管理者権限が必要です。' };
  }

  return { authorized: true };
}

// =====================================================
// GET: 特定のユーザープロフィール取得（管理者のみ）
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // セッション確認
    const { data: { user }, error: userError } =
      await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'ログインが必要です。' },
        { status: 401 }
      );
    }

    // 管理者権限確認
    const permissionCheck = await checkAdminPermission(
      supabase,
      user.id
    );

    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: 403 }
      );
    }

    // リクエストされたユーザープロフィール取得
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'プロフィールの取得中にエラーが発生しました。' },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'プロフィールが見つかりませんでした。' },
        { status: 404 }
      );
    }

    // レスポンスデータ変換
    const userProfile = {
      id: profile.id,
      email: profile.email,
      kanjiLastName: profile.kanji_last_name,
      kanjiFirstName: profile.kanji_first_name,
      kanaLastName: profile.kana_last_name,
      kanaFirstName: profile.kana_first_name,
      corporatePhone: profile.corporate_phone,
      personalPhone: profile.personal_phone,
      businessType: profile.business_type,
      companyName: profile.company_name,
      legalEntityNumber: profile.legal_entity_number,
      position: profile.position,
      department: profile.department,
      companyUrl: profile.company_url,
      productCategory: profile.product_category,
      acquisitionChannel: profile.acquisition_channel,
      postalCode: profile.postal_code,
      prefecture: profile.prefecture,
      city: profile.city,
      street: profile.street,
      role: profile.role,
      status: profile.status,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      lastLoginAt: profile.last_login_at,
    };

    return NextResponse.json({ user: userProfile });
  } catch (error) {
    console.error('Profile GET error:', error);

    return NextResponse.json(
      {
        error: 'プロフィール情報の取得中にエラーが発生しました。',
      },
      { status: 500 }
    );
  }
}

// =====================================================
// PATCH: 特定のユーザープロフィール修正（管理者のみ）
// =====================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // セッション確認
    const { data: { user }, error: userError } =
      await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 管理者権限確認
    const permissionCheck = await checkAdminPermission(
      supabase,
      user.id
    );

    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: 403 }
      );
    }

    const body = await request.json();

    // スキーマ検証
    const validationResult = adminProfileUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '입력값이 올바르지 않습니다.',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Supabaseで更新 (camelCase → snake_case 変換)
    const updateData: Record<string, any> = {};

    if (data.kanjiLastName !== undefined)
      updateData.kanji_last_name = data.kanjiLastName;
    if (data.kanjiFirstName !== undefined)
      updateData.kanji_first_name = data.kanjiFirstName;
    if (data.kanaLastName !== undefined)
      updateData.kana_last_name = data.kanaLastName;
    if (data.kanaFirstName !== undefined)
      updateData.kana_first_name = data.kanaFirstName;
    if (data.corporatePhone !== undefined)
      updateData.corporate_phone = data.corporatePhone || null;
    if (data.personalPhone !== undefined)
      updateData.personal_phone = data.personalPhone || null;
    if (data.businessType !== undefined)
      updateData.business_type = data.businessType;
    if (data.companyName !== undefined)
      updateData.company_name = data.companyName || null;
    if (data.legalEntityNumber !== undefined)
      updateData.legal_entity_number = data.legalEntityNumber || null;
    if (data.position !== undefined)
      updateData.position = data.position || null;
    if (data.department !== undefined)
      updateData.department = data.department || null;
    if (data.companyUrl !== undefined)
      updateData.company_url = data.companyUrl || null;
    if (data.productCategory !== undefined)
      updateData.product_category = data.productCategory;
    if (data.acquisitionChannel !== undefined)
      updateData.acquisition_channel = data.acquisitionChannel || null;
    if (data.postalCode !== undefined)
      updateData.postal_code = data.postalCode || null;
    if (data.prefecture !== undefined)
      updateData.prefecture = data.prefecture || null;
    if (data.city !== undefined) updateData.city = data.city || null;
    if (data.street !== undefined) updateData.street = data.street || null;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.status !== undefined) updateData.status = data.status;

    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json(
        { error: 'プロフィールの修正中にエラーが発生しました。' },
        { status: 500 }
      );
    }

    // 更新されたユーザー情報を返す
    const userProfile = {
      id: profile.id,
      email: profile.email,
      kanjiLastName: profile.kanji_last_name,
      kanjiFirstName: profile.kanji_first_name,
      kanaLastName: profile.kana_last_name,
      kanaFirstName: profile.kana_first_name,
      corporatePhone: profile.corporate_phone,
      personalPhone: profile.personal_phone,
      businessType: profile.business_type,
      companyName: profile.company_name,
      legalEntityNumber: profile.legal_entity_number,
      position: profile.position,
      department: profile.department,
      companyUrl: profile.company_url,
      productCategory: profile.product_category,
      acquisitionChannel: profile.acquisition_channel,
      postalCode: profile.postal_code,
      prefecture: profile.prefecture,
      city: profile.city,
      street: profile.street,
      role: profile.role,
      status: profile.status,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      lastLoginAt: profile.last_login_at,
    };

    return NextResponse.json({
      message: 'プロフィールを更新しました。',
      user: userProfile,
    });
  } catch (error) {
    console.error('Profile PATCH error:', error);

    return NextResponse.json(
      {
        error: 'プロフィール更新中にエラーが発生しました。',
      },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE: 特定のユーザーを削除（管理者のみ）
// =====================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // セッション確認
    const { data: { user }, error: userError } =
      await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 管理者権限確認
    const permissionCheck = await checkAdminPermission(
      supabase,
      user.id
    );

    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: 403 }
      );
    }

    // 自分自身は削除不可
    if (id === user.id) {
      return NextResponse.json(
        { error: '自分自身を削除することはできません。' },
        { status: 400 }
      );
    }

    // ステータスをDELETEDに変更（実際の削除ではない）
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ status: 'DELETED' })
      .eq('id', id);

    if (updateError) {
      console.error('Profile delete error:', updateError);
      return NextResponse.json(
        { error: 'プロフィールの削除中にエラーが発生しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'プロフィールを削除しました。',
    });
  } catch (error) {
    console.error('Profile DELETE error:', error);

    return NextResponse.json(
      {
        error: 'プロフィール削除中にエラーが発生しました。',
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
      'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
