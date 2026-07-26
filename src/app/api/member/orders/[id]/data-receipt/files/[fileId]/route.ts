/**
 * Delete Uploaded File API
 * DELETE /api/member/orders/[id]/data-receipt/[fileId] - Delete an uploaded file
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServiceClient } from '@/lib/supabase';

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
        // getAll/setAll（@supabase/ssr 推奨）: PostgREST(DB) への session 伝播問題により
        // DB 操作は service client に統一。cookie client は getUser()（認証）のみ。
        getAll() {
          return request.cookies.getAll().map((c) => ({ name: c.name, value: c.value }));
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set({ name, value, ...options })
            );
          } catch {
            // read-only コンテキストでは無視
          }
        },
      },
    });

    // DB 操作（files / orders）+ storage 操作は service client。
    // cookie client は @supabase/ssr server context で PostgREST(DB) に session が伝播せず
    // anon 扱いになり RLS で 0 rows / DELETE 拒否されるため（inquiries パターン）。
    // IDOR 予防は order 所有権検証（先）+ file_id/order_id 突合せで担保。
    const serviceClient = createServiceClient();

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

    // Verify the order belongs to the user（先に order 所有権・IDOR 予防。
    // file の有無を漏らさないよう、他人 order は一律 403）
    const { data: order, error: orderError } = await serviceClient
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

    // Verify the file belongs to this order（service client・file_id + order_id 突合せ）
    const { data: fileRecord, error: fileError } = await serviceClient
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

    // Check if this is the only AI file - prevent deletion
    const { data: aiFiles } = await serviceClient
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

    // Delete the file from database（service client）
    const { error: deleteError } = await serviceClient
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

    // Delete from storage（service client・RLS bypass）
    if (fileRecord.file_path) {
      const { error: storageError } = await serviceClient.storage
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
