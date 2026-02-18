/**
 * Blog Image Upload API
 *
 * Handles multipart upload to Supabase Storage
 * - Validates file type and size
 * - Stores in blog-images bucket
 * - Returns public URL
 * - Records to blog_images table
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { createServiceClient } from '@/lib/supabase';

// ============================================================
// Configuration
// ============================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const BUCKET_NAME = 'blog-images';

// ============================================================
// POST /api/admin/blog/upload-image
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const userId = auth.userId;

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucketPath = formData.get('bucketPath') as string || BUCKET_NAME;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません。' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `対応していないファイル形式です。次の形式のみ対応しています: ${ALLOWED_MIME_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `ファイルサイズが大きすぎます。最大 ${MAX_FILE_SIZE / 1024 / 1024}MB までです。` },
        { status: 400 }
      );
    }

    // Get file extension
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

    // Create storage path
    const storagePath = `${bucketPath}/${fileName}`;

    // Upload to Supabase Storage
    const supabase = createServiceClient();

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[Image Upload API] Storage upload error:', uploadError);
      return NextResponse.json(
        { error: '画像のアップロードに失敗しました。', details: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // Get image dimensions
    let width: number | undefined;
    let height: number | undefined;

    try {
      // For a simple implementation, we'll need to use sharp or similar
      // For now, we'll skip dimension detection or implement a basic version
      // In production, you'd use sharp to get dimensions
      const config = require('sharp');
      const metadata = await config(buffer).metadata();
      width = metadata.width;
      height = metadata.height;
    } catch (error) {
      console.warn('[Image Upload API] Could not get image dimensions:', error);
      // Continue without dimensions
    }

    // Record to blog_images table
    const { data: imageData, error: dbError } = await supabase
      .from('blog_images')
      .insert({
        post_id: null, // Not associated with a post yet
        storage_path: storagePath,
        original_filename: file.name,
        mime_type: file.type,
        file_size: file.size,
        width,
        height,
        alt_text: null, // Will be set when associated with content
        created_by: userId,
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Image Upload API] Database insert error:', dbError);
      // Don't fail the request if DB insert fails - the image is already uploaded
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: storagePath,
      id: imageData?.id,
      width,
      height,
      size: file.size,
      originalName: file.name,
    }, { status: 201 });

  } catch (error) {
    console.error('[Image Upload API] Unexpected error:', error);
    return NextResponse.json(
      {
        error: '予期しないエラーが発生しました。',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// ============================================================
// OPTIONS handler for CORS
// ============================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
