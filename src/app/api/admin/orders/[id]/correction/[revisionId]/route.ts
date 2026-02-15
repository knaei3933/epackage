/**
 * Admin Correction Delete API
 *
 * 校正データ削除API
 * - design_revisionsテーブルから削除
 * - 関連するStorageファイルも削除
 *
 * @route /api/admin/orders/[id]/correction/[revisionId]
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// =====================================================
// DELETE Handler - Delete Correction
// =====================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; revisionId: string }> }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('[Correction DELETE] Starting delete...');

    const { revisionId } = await params;

    // Get revision to find file paths
    const { data: revision, error: fetchError } = await supabase
      .from('design_revisions')
      .select('preview_image_url, original_file_url')
      .eq('id', revisionId)
      .single();

    if (fetchError || !revision) {
      return NextResponse.json(
        { success: false, error: '校正データが見つかりません。' },
        { status: 404 }
      );
    }

    // Extract file paths from URLs
    const getStoragePath = (url: string | null | undefined): string | null => {
      if (!url) return null;
      try {
        const urlObj = new URL(url);
        const pathMatch = urlObj.pathname.match(/\/correction-files\/(.+)$/);
        return pathMatch ? pathMatch[1] : null;
      } catch {
        return null;
      }
    };

    const previewPath = getStoragePath(revision.preview_image_url);
    const originalPath = getStoragePath(revision.original_file_url);

    // Delete from database
    const { error: deleteError } = await supabase
      .from('design_revisions')
      .delete()
      .eq('id', revisionId);

    if (deleteError) {
      console.error('[Correction DELETE] DB error:', deleteError);
      return NextResponse.json(
        { success: false, error: '削除に失敗しました: ' + deleteError.message },
        { status: 500 }
      );
    }

    // Delete files from storage
    const pathsToDelete = [previewPath, originalPath].filter((p): p is string => p !== null);
    if (pathsToDelete.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('correction-files')
        .remove(pathsToDelete);

      if (storageError) {
        console.error('[Correction DELETE] Storage cleanup error:', storageError);
        // Don't fail the request if storage cleanup fails
      }
    }

    console.log('[Correction DELETE] Delete successful:', revisionId);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Correction DELETE] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
      },
      { status: 500 }
    );
  }
}

// =====================================================
// OPTIONS Handler for CORS
// =====================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
