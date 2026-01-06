/**
 * Customer Profile API
 * GET /api/customer/profile - Get customer profile with preferences
 * PATCH /api/customer/profile - Update customer profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { ProfileData, UpdateProfileRequest } from '@/types/portal';

// GET /api/customer/profile - Get profile
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません。', error_code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'プロフィールが見つかりません。', error_code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get company info if applicable
    let company = null;
    if (profile.company_name || (profile.business_type === 'CORPORATION')) {
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      company = companyData;
    }

    // Get or create customer preferences
    const { data: preferences } = await supabase
      .rpc('get_or_create_customer_preferences', { user_uuid: user.id });

    const profileData: ProfileData = {
      user: {
        id: profile.id,
        email: profile.email,
        kanji_last_name: profile.kanji_last_name,
        kanji_first_name: profile.kanji_first_name,
        kana_last_name: profile.kana_last_name,
        kana_first_name: profile.kana_first_name,
        corporate_phone: profile.corporate_phone,
        personal_phone: profile.personal_phone,
        business_type: profile.business_type,
        user_type: profile.user_type,
        company_name: profile.company_name,
        position: profile.position,
        department: profile.department,
        company_url: profile.company_url,
        postal_code: profile.postal_code,
        prefecture: profile.prefecture,
        city: profile.city,
        street: profile.street,
        building: profile.building,
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
      data: profileData,
    });

  } catch (error) {
    console.error('Customer Profile API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。', error_code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

// PATCH /api/customer/profile - Update profile
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません。', error_code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json() as UpdateProfileRequest;

    // Build update object (only update provided fields)
    const updates: Record<string, any> = {};
    if (body.corporate_phone !== undefined) updates.corporate_phone = body.corporate_phone;
    if (body.personal_phone !== undefined) updates.personal_phone = body.personal_phone;
    if (body.position !== undefined) updates.position = body.position;
    if (body.department !== undefined) updates.department = body.department;
    if (body.company_url !== undefined) updates.company_url = body.company_url;
    if (body.postal_code !== undefined) updates.postal_code = body.postal_code;
    if (body.prefecture !== undefined) updates.prefecture = body.prefecture;
    if (body.city !== undefined) updates.city = body.city;
    if (body.street !== undefined) updates.street = body.street;
    if (body.building !== undefined) updates.building = body.building;

    // Update profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json(
        { error: 'プロフィールの更新中にエラーが発生しました。', error_code: 'UPDATE_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'プロフィールを更新しました。',
    });

  } catch (error) {
    console.error('Profile Update API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。', error_code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
