/**
 * Individual System Setting API (with category)
 * 개별 시스템 설정 수정 API (카테고리 포함)
 *
 * PATCH /api/admin/settings/[category]/[key] - 단일 설정 수정
 * DELETE /api/admin/settings/[category]/[key] - 설정 삭제
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

type SettingCategoryKeyParams = {
  params: Promise<{
    category?: string;
    key?: string;
  }>;
};

/**
 * PATCH - 단일 설정값 수정 (category + key로 식별)
 */
export async function PATCH(
  request: NextRequest,
  { params }: SettingCategoryKeyParams
): Promise<NextResponse> {
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const { category, key } = await params;
    if (!category || !key) {
      return NextResponse.json(
        { error: '카테고리와 설정 키가 필요합니다' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { value, valueType = 'number' } = body;

    if (value === undefined) {
      return NextResponse.json(
        { error: 'value 값이 필요합니다' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // 현재 설정 확인 (category + key로 조회)
    const { data: existing, error: fetchError } = await supabase
      .from('system_settings')
      .select('*')
      .eq('category', category)
      .eq('key', key)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: '설정을 찾을 수 없습니다', category, key },
        { status: 404 }
      );
    }

    // 값 타입 변환
    let convertedValue = value;
    if (valueType === 'number' && typeof value === 'string') {
      convertedValue = parseFloat(value);
    } else if (valueType === 'boolean') {
      convertedValue = value === true || value === 'true';
    }

    // 업데이트 (category + key로 조건 지정)
    const { data, error } = await supabase
      .from('system_settings')
      .update({
        value: convertedValue,
        updated_by: auth.userId
      })
      .eq('category', category)
      .eq('key', key)
      .select()
      .single();

    if (error) {
      console.error('Setting update error:', error);
      return NextResponse.json(
        { error: '설정 수정 실패', details: error.message },
        { status: 500 }
      );
    }

    // 캐시 무효화 API 호출
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/settings/cache/invalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category }),
      });
    } catch (cacheError) {
      console.warn('Cache invalidate failed:', cacheError);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        category: data.category,
        key: data.key,
        value: data.value,
        valueType: data.value_type
      }
    });

  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json(
      {
        error: '설정 수정 실패',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - 설정 삭제 (category + key로 식별)
 */
export async function DELETE(
  request: NextRequest,
  { params }: SettingCategoryKeyParams
): Promise<NextResponse> {
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const { category, key } = await params;
    if (!category || !key) {
      return NextResponse.json(
        { error: '카테고리와 설정 키가 필요합니다' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from('system_settings')
      .delete()
      .eq('category', category)
      .eq('key', key);

    if (error) {
      console.error('Setting delete error:', error);
      return NextResponse.json(
        { error: '설정 삭제 실패', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '설정이 삭제되었습니다'
    });

  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json(
      {
        error: '설정 삭제 실패',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
