/**
 * API Route: Post-processing Positions for Design Revisions
 *
 * 後加工位置情報API
 * POST: 保存（韓国人デザイナーが入力）
 * GET: 取得（顧客が確認）
 *
 * Route: /api/design-revisions/[revisionId]/postprocessing-positions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/dashboard';

// =====================================================
// Types
// =====================================================

interface PostProcessingPositionData {
  sku_name: string;
  notch_top?: string | null;
  notch_bottom?: string | null;
  hang_hole_diameter?: string | null;
  hang_hole_position?: string | null;
  zipper_position?: string | null;
  print_position?: string | null;
  special_processing?: string | null;
}

// =====================================================
// GET: 後加工位置情報を取得
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ revisionId: string }> }
) {
  try {
    const { revisionId } = await params;
    const supabase = createServiceClient();

    // design_revisionsの存在確認
    const { data: revision, error: revisionError } = await supabase
      .from('design_revisions')
      .select('id, order_id')
      .eq('id', revisionId)
      .single();

    if (revisionError || !revision) {
      return NextResponse.json(
        { error: 'デザインリビジョンが見つかりません' },
        { status: 404 }
      );
    }

    // 現在ユーザーの取得
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 注文の所有権確認（会員の場合）
    if (user.role === 'member') {
      const { data: order } = await supabase
        .from('orders')
        .select('user_id')
        .eq('id', revision.order_id)
        .single();

      if (!order || order.user_id !== user.id) {
        return NextResponse.json(
          { error: 'アクセス権限がありません' },
          { status: 403 }
        );
      }
    }

    // 後加工位置情報を取得
    const { data: positions, error } = await supabase
      .from('design_postprocessing_positions')
      .select('*')
      .eq('revision_id', revisionId);

    if (error) {
      console.error('[PostProcessingPositions] GET error:', error);
      return NextResponse.json(
        { error: '後加工位置情報の取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      positions: positions || [],
    });
  } catch (error) {
    console.error('[PostProcessingPositions] Unexpected error:', error);
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST: 後加工位置情報を保存
// =====================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ revisionId: string }> }
) {
  try {
    const { revisionId } = await params;
    const supabase = createServiceClient();
    const body = await request.json();

    const {
      sku_name,
      notch_top = null,
      notch_bottom = null,
      hang_hole_diameter = null,
      hang_hole_position = null,
      zipper_position = null,
      print_position = null,
      special_processing = null,
    }: PostProcessingPositionData = body;

    // バリデーション
    if (!sku_name) {
      return NextResponse.json(
        { error: 'SKU名は必須です' },
        { status: 400 }
      );
    }

    // design_revisionsの存在確認
    const { data: revision, error: revisionError } = await supabase
      .from('design_revisions')
      .select('id, order_id')
      .eq('id', revisionId)
      .single();

    if (revisionError || !revision) {
      return NextResponse.json(
        { error: 'デザインリビジョンが見つかりません' },
        { status: 404 }
      );
    }

    // 現在ユーザーの取得
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 権限確認（管理者または韓国人デザイナー）
    if (user.role !== 'admin' && user.role !== 'korean_member') {
      return NextResponse.json(
        { error: 'この操作を実行する権限がありません' },
        { status: 403 }
      );
    }

    // 既存データの確認
    const { data: existing } = await supabase
      .from('design_postprocessing_positions')
      .select('*')
      .eq('revision_id', revisionId)
      .eq('sku_name', sku_name)
      .maybeSingle();

    let result;

    if (existing) {
      // 更新
      const { data, error } = await supabase
        .from('design_postprocessing_positions')
        .update({
          notch_top,
          notch_bottom,
          hang_hole_diameter,
          hang_hole_position,
          zipper_position,
          print_position,
          special_processing,
          input_by_type: user.role === 'korean_member' ? 'korea_designer' : 'admin',
          input_by_name: user.email,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('[PostProcessingPositions] UPDATE error:', error);
        return NextResponse.json(
          { error: '後加工位置情報の更新に失敗しました' },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // 新規作成
      const { data, error } = await supabase
        .from('design_postprocessing_positions')
        .insert({
          revision_id: revisionId,
          sku_name,
          notch_top,
          notch_bottom,
          hang_hole_diameter,
          hang_hole_position,
          zipper_position,
          print_position,
          special_processing,
          input_by_type: user.role === 'korean_member' ? 'korea_designer' : 'admin',
          input_by_name: user.email,
        })
        .select()
        .single();

      if (error) {
        console.error('[PostProcessingPositions] INSERT error:', error);
        return NextResponse.json(
          { error: '後加工位置情報の保存に失敗しました' },
          { status: 500 }
        );
      }

      result = data;
    }

    return NextResponse.json({
      success: true,
      position: result,
    });
  } catch (error) {
    console.error('[PostProcessingPositions] Unexpected error:', error);
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' },
      { status: 500 }
    );
  }
}
