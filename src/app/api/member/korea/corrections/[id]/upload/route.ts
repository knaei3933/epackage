/**
 * API Route: Upload Corrected Files for Korea Corrections
 *
 * 韓国パートナー修正ファイルアップロードAPI
 * - POST: 修正されたファイルのアップロード
 *
 * /api/member/korea/corrections/[id]/upload
 *
 * Migrated from /api/b2b/korea/corrections/[id]/upload
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

// ============================================================
// Constants
// ============================================================

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = ['.ai', '.pdf', '.psd', '.png', '.jpg', '.jpeg', '.svg', '.eps'];
const MAX_FILES_PER_CORRECTION = 10;

// ============================================================
// Helper: Get authenticated user ID
// ============================================================

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  // Try to get user from middleware header first (more reliable)
  const userIdFromMiddleware = request.headers.get('x-user-id');
  const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

  if (userIdFromMiddleware && isFromMiddleware) {
    console.log('[Korea Corrections Upload] Using user ID from middleware:', userIdFromMiddleware);
    return userIdFromMiddleware;
  }

  // Fallback to SSR client auth
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const response = NextResponse.json({ success: false });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set() {},
      remove() {},
    },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('[Korea Corrections Upload] Auth error:', authError);
    return null;
  }

  return user.id;
}

// ============================================================
// POST: Upload corrected files
// ============================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: correctionId } = await params;
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get correction record
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'upload_corrected_files',
      userId: userId,
      route: '/api/member/korea/corrections/[id]/upload',
    });

    const { data: correction, error: correctionError } = await supabaseAdmin
      .from('korea_corrections')
      .select('*')
      .eq('id', correctionId)
      .single();

    if (correctionError || !correction) {
      return NextResponse.json(
        { success: false, error: 'Correction not found' },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    // Validate files
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES_PER_CORRECTION) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_FILES_PER_CORRECTION} files allowed` },
        { status: 400 }
      );
    }

    // Get current corrected files
    const currentFiles: string[] = correction.corrected_files || [];

    // Validate and upload each file
    const uploadedFiles: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
        continue;
      }

      // Check file type
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_FILE_TYPES.includes(ext)) {
        errors.push(`${file.name}: File type not allowed. Allowed: ${ALLOWED_FILE_TYPES.join(', ')}`);
        continue;
      }

      try {
        // Upload to Supabase Storage
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `korea-corrections/${correction.order_id}/${correctionId}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('production-files')
          .upload(filePath, file);

        if (uploadError) {
          errors.push(`${file.name}: Upload failed - ${uploadError.message}`);
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('production-files')
          .getPublicUrl(filePath);

        uploadedFiles.push(publicUrl);
      } catch (err: any) {
        errors.push(`${file.name}: ${err.message}`);
      }
    }

    // Update correction record with new file URLs
    if (uploadedFiles.length > 0) {
      const updatedFiles = [...currentFiles, ...uploadedFiles];

      const { error: updateError } = await supabaseAdmin
        .from('korea_corrections')
        .update({
          corrected_files: updatedFiles,
          updated_at: new Date().toISOString(),
        })
        .eq('id', correctionId);

      if (updateError) {
        console.error('[Korea Corrections Upload] Update error:', updateError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        uploadedFiles,
        errors: errors.length > 0 ? errors : undefined,
        totalFiles: (correction.corrected_files?.length || 0) + uploadedFiles.length,
      },
    });
  } catch (error: any) {
    console.error('[Korea Corrections Upload] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
