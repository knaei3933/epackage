/**
 * Delete Uploaded File API
 * DELETE /api/member/orders/[id]/data-receipt/[fileId] - Delete an uploaded file
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const { id: orderId, fileId } = await params;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

    // Create service role client for admin operations (bypasses RLS)
    const supabaseAdmin = supabaseServiceKey
      ? createClient(supabaseUrl, supabaseServiceKey)
      : null;

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

    // Delete the file from database using service role client (bypasses RLS)
    const deleteClient = supabaseAdmin || supabase;

    // Get original filename before deletion for order_file_uploads lookup
    const originalFilename = fileRecord.original_filename;

    // Delete from files table (member uploads)
    const { error: deleteError } = await deleteClient
      .from('files')
      .delete()
      .eq('id', fileId);

    if (deleteError) {
      console.error('[Delete File] Error deleting file from files table:', deleteError);
    }

    // Also delete from order_file_uploads table by matching filename and order_id
    // (designer page uses this table)
    const { error: deleteUploadError } = await deleteClient
      .from('order_file_uploads')
      .delete()
      .eq('order_id', orderId)
      .eq('file_name', originalFilename);

    if (deleteUploadError) {
      console.error('[Delete File] Error deleting file from order_file_uploads table:', deleteUploadError);
    }

    // Consider it successful if files table deletion succeeded
    if (deleteError) {
      return NextResponse.json(
        { error: 'ファイルの削除中にエラーが発生しました' },
        { status: 500 }
      );
    }

    console.log('[Delete File] Successfully deleted file from database:', fileId);

    // Delete from Google Drive (file_path contains Google Drive file ID)
    if (fileRecord.file_path) {
      try {
        // Get admin access token for Google Drive operations
        const { getAdminAccessTokenForUpload } = await import('@/lib/google-drive');
        const accessToken = await getAdminAccessTokenForUpload();

        // Delete from Google Drive
        const deleteResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileRecord.file_path}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (!deleteResponse.ok) {
          console.warn('[Delete File] Google Drive deletion failed:', deleteResponse.status);
        } else {
          console.log('[Delete File] Google Drive file deleted successfully');
        }
      } catch (driveError) {
        console.warn('[Delete File] Failed to delete from Google Drive:', driveError);
        // Don't fail the request if Drive deletion fails
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
