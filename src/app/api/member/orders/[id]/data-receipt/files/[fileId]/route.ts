/**
 * Delete Uploaded File API
 * DELETE /api/member/orders/[id]/data-receipt/[fileId] - Delete an uploaded file
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const { id: orderId, fileId } = await params;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create SSR client to read cookies
    const response = NextResponse.json({ success: false });
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.delete({ name, ...options });
        },
      },
    });

    // Get user ID from middleware header or authenticate
    const userIdFromMiddleware = request.headers.get('x-user-id');
    const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

    let userId: string;
    if (userIdFromMiddleware && isFromMiddleware) {
      userId = userIdFromMiddleware;
    } else {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json(
          { error: '認証されていません' },
          { status: 401 }
        );
      }
      userId = user.id;
    }

    // Verify the file belongs to this order (from files table)
    const { data: fileRecord, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('order_id', orderId)
      .single();

    if (fileError || !fileRecord) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 404 }
      );
    }

    // Verify the order belongs to the user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order || order.user_id !== userId) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    // Check if this is the only AI file - prevent deletion
    const { data: aiFiles } = await supabase
      .from('files')
      .select('id')
      .eq('order_id', orderId)
      .eq('file_type', 'AI');

    if (aiFiles && aiFiles.length === 1 && aiFiles[0].id === fileId) {
      return NextResponse.json(
        { error: '入稿データ（AI）は必須です。削除できません。' },
        { status: 400 }
      );
    }

    // Delete the file from database
    const { error: deleteError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);

    if (deleteError) {
      console.error('Error deleting file:', deleteError);
      return NextResponse.json(
        { error: 'ファイルの削除中にエラーが発生しました' },
        { status: 500 }
      );
    }

    // Delete from storage if needed
    if (fileRecord.file_path) {
      const { error: storageError } = await supabase.storage
        .from('production-files')
        .remove([fileRecord.file_path]);

      if (storageError) {
        console.warn('[Delete File] Failed to delete from storage:', storageError);
        // Don't fail the request if storage deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'ファイルを削除しました',
    });

  } catch (error) {
    console.error('Delete file API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
