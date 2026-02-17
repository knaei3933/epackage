export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

/**
 * System Settings API
 * 시스템 설정 관리 API
 *
 * GET /api/admin/settings?category={category} - Get settings by category
 * POST /api/admin/settings - Create new setting
 */

/**
 * GET - 시스템 설정 조회
 * Query Parameters:
 * - category: 설정 카테고리 (예: film_material, printing, delivery)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const supabase = createServiceClient();

    let query = supabase
      .from('system_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Settings fetch error:', error);
      return NextResponse.json(
        { error: '설정 조회 실패', details: error.message },
        { status: 500 }
      );
    }

    // Group by category for easier frontend consumption
    const grouped: Record<string, any[]> = {};
    data?.forEach(setting => {
      if (!grouped[setting.category]) {
        grouped[setting.category] = [];
      }
      grouped[setting.category].push({
        id: setting.id,
        key: setting.key,
        value: setting.value,
        valueType: setting.value_type,
        description: setting.description,
        unit: setting.unit,
        isActive: setting.is_active,
        effectiveDate: setting.effective_date
      });
    });

    return NextResponse.json({
      success: true,
      data: category ? (data || []) : grouped,
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Settings API error:', error);
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
 * POST - 새 설정 생성
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { category, key, value, valueType = 'number', description, unit } = body;

    // Validation
    if (!category || !key || value === undefined) {
      return NextResponse.json(
        { error: '필수 필드 누락: category, key, value' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Check if setting already exists
    const { data: existing } = await supabase
      .from('system_settings')
      .select('id')
      .eq('category', category)
      .eq('key', key)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: '이미 존재하는 설정입니다', category, key },
        { status: 409 }
      );
    }

    // Create new setting
    const { data, error } = await supabase
      .from('system_settings')
      .insert({
        category,
        key,
        value,
        value_type: valueType,
        description,
        unit,
        updated_by: auth.userId
      })
      .select()
      .single();

    if (error) {
      console.error('Settings creation error:', error);
      return NextResponse.json(
        { error: '설정 생성 실패', details: error.message },
        { status: 500 }
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
        unit: data.unit
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json(
      {
        error: '설정 생성 실패',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
