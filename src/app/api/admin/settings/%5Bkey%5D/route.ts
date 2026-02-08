import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

/**
 * Individual System Setting API
 * 개별 시스템 설정 관리 API
 *
 * GET /api/admin/settings/{category}/{key} - Get specific setting
 * PUT /api/admin/settings/{category}/{key} - Update setting
 * DELETE /api/admin/settings/{category}/{key} - Delete setting
 */

interface RouteContext {
  params: Promise<{ key: string[] }>; // [category, key]
}

/**
 * GET - 특정 설정 조회
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const params = await context.params;
    const [category, key] = params.key;

    if (!category || !key) {
      return NextResponse.json(
        { error: '올바른 경로가 아닙니다. /api/admin/settings/{category}/{key}' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('category', category)
      .eq('key', key)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: '설정을 찾을 수 없습니다', category, key },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        category: data.category,
        key: data.key,
        value: data.value,
        valueType: data.value_type,
        description: data.description,
        unit: data.unit,
        isActive: data.is_active,
        effectiveDate: data.effective_date
      }
    });
  } catch (error) {
    console.error('Setting API error:', error);
    return NextResponse.json(
      {
        error: '설정 조회 실패',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - 설정 업데이트
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const params = await context.params;
    const [category, key] = params.key;

    if (!category || !key) {
      return NextResponse.json(
        { error: '올바른 경로가 아닙니다' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { value, description, unit, isActive } = body;

    if (value === undefined) {
      return NextResponse.json(
        { error: 'value 필드가 필요합니다' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const updateData: any = {
      value,
      updated_by: auth.userId
    };

    if (description !== undefined) updateData.description = description;
    if (unit !== undefined) updateData.unit = unit;
    if (isActive !== undefined) updateData.is_active = isActive;

    const { data, error } = await supabase
      .from('system_settings')
      .update(updateData)
      .eq('category', category)
      .eq('key', key)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: '설정 업데이트 실패', details: error?.message },
        { status: 500 }
      );
    }

    // Clear the settings cache to force reload
    try {
      const { unifiedPricingEngine } = await import('@/lib/unified-pricing-engine');
      unifiedPricingEngine.clearSettingsCache();
    } catch (cacheError) {
      // Log error but don't fail the request
      console.error('Failed to clear settings cache:', cacheError);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        category: data.category,
        key: data.key,
        value: data.value,
        valueType: data.value_type,
        description: data.description,
        unit: data.unit,
        isActive: data.is_active
      }
    });
  } catch (error) {
    console.error('Setting update error:', error);
    return NextResponse.json(
      {
        error: '설정 업데이트 실패',
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
  context: RouteContext
): Promise<NextResponse> {
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const params = await context.params;
    const [category, key] = params.key;

    if (!category || !key) {
      return NextResponse.json(
        { error: '올바른 경로가 아닙니다' },
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
    console.error('Setting delete error:', error);
    return NextResponse.json(
      {
        error: '설정 삭제 실패',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
