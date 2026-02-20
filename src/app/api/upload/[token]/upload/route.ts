/**
 * API Route: Upload Correction Data via Token
 *
 * トークンによる修正データアップロードAPI
 * - POST: 修正ファイルのアップロード（認証不要、トークンのみ）
 *
 * /api/upload/[token]/upload
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { hashToken, isTokenExpired } from '@/lib/designer-tokens';

// ============================================================
// Constants
// ============================================================

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_PREVIEW_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const ALLOWED_ORIGINAL_EXTENSIONS = ['.ai', '.pdf', '.psd', '.eps'];

// ============================================================
// POST: Upload correction files
// ============================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Validate token format
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
      return NextResponse.json(
        { success: false, error: 'Invalid token format' },
        { status: 400 }
      );
    }

    // Get service client
    const supabase = createServiceClient();
    const tokenHash = hashToken(token);

    // Get Korea correction record
    const { data: correction, error: correctionError } = await supabase
      .from('korea_corrections')
      .select('*')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (correctionError || !correction) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 404 }
      );
    }

    // Check if token is expired
    if (isTokenExpired(new Date(correction.token_expires_at))) {
      return NextResponse.json(
        { success: false, error: 'Token expired' },
        { status: 401 }
      );
    }

    // Check if correction is cancelled
    if (correction.status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'Correction cancelled' },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const previewImage = formData.get('preview_image') as File | null;
    const originalFile = formData.get('original_file') as File | null;
    const commentKo = formData.get('comment_ko') as string | null;

    // Validate files
    if (!previewImage || !originalFile) {
      return NextResponse.json(
        { success: false, error: 'Both preview_image and original_file are required' },
        { status: 400 }
      );
    }

    // Validate preview image
    if (!ALLOWED_PREVIEW_TYPES.includes(previewImage.type)) {
      return NextResponse.json(
        { success: false, error: 'Preview image must be JPG or PNG' },
        { status: 400 }
      );
    }

    if (previewImage.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` },
        { status: 400 }
      );
    }

    // Validate original file
    const ext = '.' + originalFile.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_ORIGINAL_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { success: false, error: 'Original file must be AI, PDF, PSD, or EPS' },
        { status: 400 }
      );
    }

    if (originalFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` },
        { status: 400 }
      );
    }

    // Upload files to storage
    const bucketName = 'korea-corrections';
    const timestamp = Date.now();

    // Upload preview image
    const previewPath = `${correction.order_id}/${correction.id}/preview_${timestamp}_${previewImage.name}`;
    const { data: previewData, error: previewError } = await supabase.storage
      .from(bucketName)
      .upload(previewPath, previewImage);

    if (previewError) {
      console.error('[Token Upload] Preview upload error:', previewError);
      return NextResponse.json(
        { success: false, error: 'Failed to upload preview image' },
        { status: 500 }
      );
    }

    // Upload original file
    const originalPath = `${correction.order_id}/${correction.id}/original_${timestamp}_${originalFile.name}`;
    const { data: originalData, error: originalError } = await supabase.storage
      .from(bucketName)
      .upload(originalPath, originalFile);

    if (originalError) {
      console.error('[Token Upload] Original file upload error:', originalError);
      // Clean up preview image
      await supabase.storage.from(bucketName).remove([previewPath]);
      return NextResponse.json(
        { success: false, error: 'Failed to upload original file' },
        { status: 500 }
      );
    }

    // Get public URLs
    const { data: previewUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(previewPath);

    const { data: originalUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(originalPath);

    // Update correction record
    const currentFiles: string[] = correction.corrected_files || [];
    const newFiles = [
      ...currentFiles,
      originalUrlData.publicUrl,
    ];

    const { error: updateError } = await supabase
      .from('korea_corrections')
      .update({
        preview_image_url: previewUrlData.publicUrl,
        original_file_url: originalUrlData.publicUrl,
        corrected_files: newFiles,
        comment_ko: commentKo || correction.comment_ko,
        translation_status: commentKo ? 'pending' : correction.translation_status,
        status: 'in_progress',
        updated_at: new Date().toISOString(),
      })
      .eq('id', correction.id);

    if (updateError) {
      console.error('[Token Upload] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update correction record' },
        { status: 500 }
      );
    }

    // Add system comment if Korean comment provided
    if (commentKo) {
      await supabase
        .from('korea_correction_comments')
        .insert({
          korea_correction_id: correction.id,
          author_name: 'システム',
          content: `修正データがアップロードされました。\n\nデザイナーコメント: ${commentKo}`,
          content_translated: `Correction data has been uploaded.\n\nDesigner comment: (translation pending)`,
          original_language: 'ja',
          is_designer: true,
        });
    } else {
      await supabase
        .from('korea_correction_comments')
        .insert({
          korea_correction_id: correction.id,
          author_name: 'システム',
          content: '修正データがアップロードされました',
          content_translated: 'Correction data has been uploaded',
          original_language: 'ja',
          is_designer: true,
        });
    }

    return NextResponse.json({
      success: true,
      data: {
        preview_url: previewUrlData.publicUrl,
        original_url: originalUrlData.publicUrl,
        comment: commentKo,
      },
    });
  } catch (error: any) {
    console.error('[Token Upload] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
