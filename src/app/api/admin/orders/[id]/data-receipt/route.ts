/**
 * Data Receipt API Endpoint
 *
 * データ入稿API
 * - 注文に関連するファイル一覧を取得
 *
 * @route GET /api/admin/orders/[id]/data-receipt
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface OrderFile {
  id: string;
  order_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  uploaded_at: string;
  uploader_id: string;
  category: 'design' | 'specification' | 'other';
  is_required: boolean;
}

/**
 * GET - Get files for data receipt
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    // Create service client to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get files for this order - using actual database column names
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('id, order_id, file_type, original_filename, file_path, file_size_bytes, uploaded_at, uploaded_by')
      .eq('order_id', orderId)
      .order('uploaded_at', { ascending: false });

    if (filesError) {
      console.error('Failed to load files:', filesError);
      return NextResponse.json(
        { success: false, error: 'ファイルの読み込みに失敗しました' },
        { status: 500 }
      );
    }

    // Transform files to match OrderFile interface
    const orderFiles: OrderFile[] = (files || []).map((file: any) => ({
      id: file.id,
      order_id: file.order_id,
      file_name: file.original_filename || 'Unknown',
      file_type: file.file_type || 'OTHER',
      file_size: file.file_size_bytes || 0,
      file_path: file.file_path || '',
      uploaded_at: file.uploaded_at || new Date().toISOString(),
      uploader_id: file.uploaded_by || '',
      // Determine if it's a design file based on file extension
      category: file.original_filename?.toLowerCase().endsWith('.ai') ? 'design' : 'other',
      // Design files are considered required
      is_required: file.original_filename?.toLowerCase().endsWith('.ai') || false,
    }));

    return NextResponse.json({
      success: true,
      files: orderFiles,
    });

  } catch (error) {
    console.error('Get data receipt error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS - CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
