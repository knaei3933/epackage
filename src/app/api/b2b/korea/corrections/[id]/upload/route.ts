/**
 * API Route: Upload Corrected Files for Korea Corrections
 *
 * 한국 파트너 수정 파일 업로드 API
 * - POST: 수정된 파일 업로드
 *
 * /api/b2b/korea/corrections/[id]/upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

// ============================================================
// Constants
// ============================================================

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = ['.ai', '.pdf', '.psd', '.png', '.jpg', '.jpeg', '.svg', '.eps'];
const MAX_FILES_PER_CORRECTION = 10;

// ============================================================
// POST: Upload corrected files
// ============================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: correctionId } = await params;

    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get correction record
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'upload_corrected_files',
      userId: user.id,
      route: '/api/b2b/korea/corrections/[id]/upload',
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
