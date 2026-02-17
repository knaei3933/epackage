/**
 * Individual System Setting API
 * 개별 시스템 설정 수정 API
 *
 * PATCH /api/admin/settings/[key] - 단일 설정 수정
 * DELETE /api/admin/settings/[key] - 설정 삭제
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

type SettingKeyParams = {
  params: {
    key?: string;
  }
};

/**
 * PATCH - 단일 설정값 수정
 */
export async function PATCH(
  request: NextRequest,
  { params }: SettingKeyParams
): Promise<NextResponse> {
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const key = params.key;
    if (!key) {
      return NextResponse.json(
        { error: '설정 키가 필요합니다' },
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

    // 현재 설정 확인
    const { data: existing } = await supabase
      .from('system_settings')
      .select('*')
      .eq('key', key)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: '설정을 찾을 수 없습니다', key },
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

    // 업데이트
    const { data, error } = await supabase
      .from('system_settings')
      .update({
        value: convertedValue,
        updated_by: auth.userId
      })
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

    // 캐시 무�화화 API 호출
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/settings/cache/invalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: existing.category }),
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
 * DELETE - 설정 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: SettingKeyParams
): Promise<NextResponse> {
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const key = params.key;
    if (!key) {
      return NextResponse.json(
        { error: '설정 키가 필요합니다' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from('system_settings')
      .delete()
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
