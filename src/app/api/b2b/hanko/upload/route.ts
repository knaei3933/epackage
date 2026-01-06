/**
 * Hanko (はんこ) Upload API
 *
 * はんこ画像アップロードAPI
 * - POST: Upload and validate hanko image
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';
import { validateHankoImage, fileToBase64 } from '@/lib/signature/hanko-validator';
import { UploadHankoResponse } from '@/types/signature';

// ============================================================
// Types
// ============================================================

interface HankoUploadRequestBody {
  fileName: string;
  base64Data: string;  // Data URL or base64 string
  hankoName: string;  // はんこの名称 (e.g., "代表者印")
}

interface HankoUploadResponseBody extends UploadHankoResponse {}

// ============================================================
// POST Handler - Upload Hanko
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        } as HankoUploadResponseBody,
        { status: 401 }
      );
    }

    // Parse request body
    const body: HankoUploadRequestBody = await request.json();

    if (!body.fileName || !body.base64Data || !body.hankoName) {
      return NextResponse.json(
        {
          success: false,
          error: 'fileName, base64Data, and hankoName are required',
        } as HankoUploadResponseBody,
        { status: 400 }
      );
    }

    // Convert base64 to File
    const base64Data = body.base64Data.split(',')[1] || body.base64Data;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const file = new File([byteArray], body.fileName, { type: 'image/png' });

    // Validate hanko image
    const validation = await validateHankoImage(file);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.errors.join(', '),
          validation,
        } as HankoUploadResponseBody,
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const fileName = `hanko-${user.id}-${Date.now()}.png`;
    const filePath = `hanko/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('hanko-images')
      .upload(filePath, file, {
        contentType: 'image/png',
        upsert: false,
      });

    if (uploadError) {
      console.error('Hanko upload error:', uploadError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to upload hanko image',
        } as HankoUploadResponseBody,
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('hanko-images')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      hankoImageUrl: urlData.publicUrl,
      hankoImageId: uploadData.path,
      validation,
    } as HankoUploadResponseBody);

  } catch (error) {
    console.error('Hanko upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as HankoUploadResponseBody,
      { status: 500 }
    );
  }
}

// ============================================================
// GET Handler - List User's Hanko Images
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // List user's hanko images
    const { data: files, error } = await supabase.storage
      .from('hanko-images')
      .list(`hanko`, {
        search: user.id,
      });

    if (error) {
      console.error('Hanko list error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to list hanko images',
        },
        { status: 500 }
      );
    }

    // Get public URLs for each file
    const hankoImages = (files || []).map(file => {
      const { data: urlData } = supabase.storage
        .from('hanko-images')
        .getPublicUrl(`hanko/${file.name}`);
      return {
        id: file.id,
        name: file.name,
        url: urlData.publicUrl,
        createdAt: file.created_at,
        size: file.metadata?.size || 0,
      };
    });

    return NextResponse.json({
      success: true,
      hankoImages,
    });

  } catch (error) {
    console.error('Hanko list error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
