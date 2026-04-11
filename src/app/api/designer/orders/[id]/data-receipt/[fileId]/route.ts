/**
 * Designer Delete Uploaded File API
 * DELETE /api/designer/orders/[id]/data-receipt/[fileId] - Delete a customer uploaded file
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const { id: orderId, fileId } = await params;

    // Get token from query parameter or header
    const url = new URL(request.url);
    const token = url.searchParams.get('token') || request.headers.get('X-Designer-Token');

    console.log('[DELETE File] Request received:', { orderId, fileId, token: token?.substring(0, 20) + '...' });

    if (!token) {
      console.log('[DELETE File] No token found');
      return NextResponse.json(
        { error: 'Authentication token required' },
        { status: 401 }
      );
    }

    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    console.log('[DELETE File] Token hash:', tokenHash.substring(0, 20) + '...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create SSR client
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    });

    // Create service role client for admin operations (bypasses RLS)
    const supabaseAdmin = supabaseServiceKey
      ? createClient(supabaseUrl, supabaseServiceKey)
      : null;

    // Verify designer token and get assignment
    // Use service role client to bypass RLS for token verification
    const verifyClient = supabaseAdmin || supabase;
    const { data: assignment, error: assignmentError } = await verifyClient
      .from('designer_task_assignments')
      .select('*')
      .eq('access_token_hash', tokenHash)
      .eq('order_id', orderId)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if token is expired
    if (assignment.access_token_expires_at && new Date(assignment.access_token_expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      );
    }

    // Verify the file belongs to this order
    // First check order_file_uploads table (designer page uses this)
    const { data: uploadRecord, error: uploadError } = await verifyClient
      .from('order_file_uploads')
      .select('*')
      .eq('id', fileId)
      .eq('order_id', orderId)
      .single();

    // Also check files table for additional info (like file_path for Google Drive deletion)
    const { data: fileRecord, error: fileError } = await verifyClient
      .from('files')
      .select('*')
      .eq('order_id', orderId)
      .eq('original_filename', uploadRecord?.file_name || '')
      .single();

    if (uploadError || !uploadRecord) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Check if this is the only AI file - prevent deletion
    const { data: aiFiles } = await verifyClient
      .from('files')
      .select('id')
      .eq('order_id', orderId)
      .eq('file_type', 'AI');

    if (aiFiles && aiFiles.length === 1 && fileRecord && aiFiles[0].id === fileRecord.id) {
      return NextResponse.json(
        { error: '入稿データ（AI）は必須です。削除できません。' },
        { status: 400 }
      );
    }

    // Delete the file from database using service role client (bypasses RLS)
    const deleteClient = supabaseAdmin || supabase;

    // Delete from order_file_uploads table using the fileId (this is the primary table for designer page)
    const { error: deleteUploadError } = await deleteClient
      .from('order_file_uploads')
      .delete()
      .eq('id', fileId);

    if (deleteUploadError) {
      console.error('Error deleting file from order_file_uploads table:', deleteUploadError);
    }

    // Also delete from files table by matching filename and order_id
    if (uploadRecord.file_name) {
      const { error: deleteError } = await deleteClient
        .from('files')
        .delete()
        .eq('order_id', orderId)
        .eq('original_filename', uploadRecord.file_name);

      if (deleteError) {
        console.error('Error deleting file from files table:', deleteError);
      }
    }

    // Consider it successful if order_file_uploads deletion succeeded
    if (deleteUploadError) {
      return NextResponse.json(
        { error: 'ファイルの削除中にエラーが発生しました' },
        { status: 500 }
      );
    }

    console.log('[Delete File] Successfully deleted file from database:', fileId);

    // Delete from Google Drive (file_path contains Google Drive file ID)
    if (fileRecord && fileRecord.file_path) {
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
