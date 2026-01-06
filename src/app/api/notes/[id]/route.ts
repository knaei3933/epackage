/**
 * Note Detail API Route
 *
 * 개별 노트 관리 API:
 * - PATCH: 노트 수정
 * - DELETE: 노트 삭제
 *
 * Security:
 * - 작성자 또는 관리자만 수정/삭제 가능
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { z } from 'zod';

// =====================================================
// Schema Validation
// =====================================================

const noteUpdateSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  isPrivate: z.boolean().optional(),
});

// =====================================================
// PATCH: Update Note
// =====================================================

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: noteId } = await context.params;
  console.log('[Note Detail API] PATCH request received for note:', noteId);

  try {
    const supabase = createServiceClient();

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '無効なトークンです' },
        { status: 401 }
      );
    }

    // Get note to verify ownership
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('created_by')
      .eq('id', noteId)
      .single();

    if (noteError || !note) {
      return NextResponse.json(
        { success: false, error: 'ノートが見つかりません' },
        { status: 404 }
      );
    }

    const noteTyped = note as any;

    // Check if user is admin or note creator
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const profileTyped = profile as any;
    const isAdmin = profileTyped?.role === 'ADMIN';
    const isCreator = noteTyped.created_by === user.id;

    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        { success: false, error: '権限がありません' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const validatedData = noteUpdateSchema.parse(body);

    // Update note
    const { data, error } = await (supabase as any)
      .from('notes')
      .update({
        content: validatedData.content,
        is_private: validatedData.isPrivate,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', noteId)
      .select()
      .single();

    if (error) throw error;

    console.log('[Note Detail API] Note updated successfully');
    return NextResponse.json({
      success: true,
      message: 'ノートを更新しました',
      data
    });

  } catch (error) {
    console.error('[Note Detail API] PATCH error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: '入力データに誤りがあります',
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'ノートの更新に失敗しました',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE: Remove Note
// =====================================================

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: noteId } = await context.params;
  console.log('[Note Detail API] DELETE request received for note:', noteId);

  try {
    const supabase = createServiceClient();

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '無効なトークンです' },
        { status: 401 }
      );
    }

    // Get note to verify ownership
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('created_by')
      .eq('id', noteId)
      .single();

    if (noteError || !note) {
      return NextResponse.json(
        { success: false, error: 'ノートが見つかりません' },
        { status: 404 }
      );
    }

    const noteTyped = note as any;

    // Check if user is admin or note creator
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const profileTyped = profile as any;
    const isAdmin = profileTyped?.role === 'ADMIN';
    const isCreator = noteTyped.created_by === user.id;

    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        { success: false, error: '権限がありません' },
        { status: 403 }
      );
    }

    // Delete note
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;

    console.log('[Note Detail API] Note deleted successfully');
    return NextResponse.json({
      success: true,
      message: 'ノートを削除しました'
    });

  } catch (error) {
    console.error('[Note Detail API] DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'ノートの削除に失敗しました',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
