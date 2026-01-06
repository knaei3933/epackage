/**
 * Profile Management API Route (Supabase)
 *
 * 사용자 프로필 정보를 조회하고 수정합니다.
 * GET: 현재 로그인한 사용자의 프로필 조회
 * PATCH: 현재 로그인한 사용자의 프로필 수정
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
  // 전화번호
  corporatePhone: z.string().optional(),
  personalPhone: z.string().optional(),

  // 회사 정보
  companyName: z.string().max(200).optional(),
  position: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  companyUrl: z.string().url('유효한 URL을 입력해주세요.').optional().or(z.literal('')),

  // 유입 경로
  acquisitionChannel: z.string().max(100).optional(),

  // 주소 정보
  postalCode: z
    .string()
    .regex(/^\d{3}-?\d{4}$/, '유효한 우편번호 형식이 아닙니다. (예: 123-4567)')
    .optional()
    .or(z.literal('')),
  prefecture: z.string().optional(),
  city: z.string().optional(),
  street: z.string().optional(),
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

// =====================================================
// GET: 현재 사용자 프로필 조회
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

    // 세션 확인 (SECURE: using getUser() instead of getSession())
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 프로필 조회
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: '프로필 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: '프로필을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 응답 데이터 변환
    const responseData = {
      id: profile.id,
      email: profile.email,
      emailVerified: user.email_confirmed_at,
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

    return NextResponse.json({ user: responseData });
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
// PATCH: 현재 사용자 프로필 수정
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

    // 세션 확인 (SECURE: using getUser() instead of getSession())
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 스키마 검증
    const validationResult = profileUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '入力値が正しくありません。',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Supabase로 업데이트 (camelCase → snake_case 변환)
    const updateData: Record<string, any> = {};

    if (data.corporatePhone !== undefined)
      updateData.corporate_phone = data.corporatePhone || null;
    if (data.personalPhone !== undefined)
      updateData.personal_phone = data.personalPhone || null;
    if (data.companyName !== undefined)
      updateData.company_name = data.companyName || null;
    if (data.position !== undefined)
      updateData.position = data.position || null;
    if (data.department !== undefined)
      updateData.department = data.department || null;
    if (data.companyUrl !== undefined)
      updateData.company_url = data.companyUrl || null;
    if (data.acquisitionChannel !== undefined)
      updateData.acquisition_channel = data.acquisitionChannel || null;
    if (data.postalCode !== undefined)
      updateData.postal_code = data.postalCode || null;
    if (data.prefecture !== undefined)
      updateData.prefecture = data.prefecture || null;
    if (data.city !== undefined) updateData.city = data.city || null;
    if (data.street !== undefined) updateData.street = data.street || null;

    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json(
        { error: '프로필 수정 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 업데이트된 사용자 정보 반환
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
// OPTIONS 메서드 - CORS preflight 요청 처리
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
