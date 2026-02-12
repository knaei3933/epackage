/**
 * Hanko (はんこ) Upload API
 *
 * はんこ画像アップロードAPI
 * - POST: Upload and validate hanko image
 * - GET: List user's hanko images
 *
 * /api/member/hanko/upload
 *
 * Migrated from /api/b2b/hanko/upload
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
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
// Helper: Get authenticated user ID
// ============================================================

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  // Try to get user from middleware header first (more reliable)
  const userIdFromMiddleware = request.headers.get('x-user-id');
  const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

  if (userIdFromMiddleware && isFromMiddleware) {
    console.log('[Hanko Upload] Using user ID from middleware:', userIdFromMiddleware);
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
    console.error('[Hanko Upload] Auth error:', authError);
    return null;
  }

  return user.id;
}

// ============================================================
// Helper: Create Supabase client for database operations
// ============================================================

function createSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set() {},
      remove() {},
    },
  });
}

// ============================================================
// POST Handler - Upload Hanko
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        } as HankoUploadResponseBody,
        { status: 401 }
      );
    }

    const supabase = createSupabaseClient(request);

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
    const fileName = `hanko-${userId}-${Date.now()}.png`;
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
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const supabase = createSupabaseClient(request);

    // List user's hanko images
    const { data: files, error } = await supabase.storage
      .from('hanko-images')
      .list(`hanko`, {
        search: userId,
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
