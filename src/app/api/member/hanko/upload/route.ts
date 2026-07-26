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
import { createServiceClient } from '@/lib/supabase';
import { validateHankoImage } from '@/lib/signature/hanko-validator';
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

// storage.list の戻り値要素の最小型。
// @supabase/storage-js を直接依存に持たないため FileObject は import せず局所定義。
interface HankoStorageFile {
  id: string;
  name: string;
  created_at: string;
  metadata?: { size?: number };
}

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
    // service client で RLS を bypass（cookie client だと storage.objects の RLS 評価で
    // auth.users を参照し、GRANT 不足で permission denied for table users になるため）。
    const serviceClient = createServiceClient();

    const fileName = `hanko-${userId}-${Date.now()}.png`;
    const filePath = `hanko/${fileName}`;

    const { data: uploadData, error: uploadError } = await serviceClient.storage
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

    // hanko-images は private bucket。response 表示用に signed URL（24h 有効）を生成。
    // hanko は DB 保存なし・GET で都度 signed URL を発行する設計なので期限切れ問題なし。
    const { data: signedData, error: signedError } = await serviceClient.storage
      .from('hanko-images')
      .createSignedUrl(filePath, 86400);

    if (signedError) {
      console.error('Hanko signed URL error:', signedError);
    }

    return NextResponse.json({
      success: true,
      hankoImageUrl: signedData?.signedUrl ?? '',
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

    // service client で RLS を bypass（cookie client だと auth.users GRANT 不足で失敗）。
    // service client は RLS を素通りするため、search: userId の部分一致（情報漏洩リスク）に頼らず、
    // アプリ層で厳密にプレフィックスフィルタ（hanko-{userId}-）して自ユーザー分のみ返す。
    const serviceClient = createServiceClient();

    // List user's hanko images
    const { data: files, error } = await serviceClient.storage
      .from('hanko-images')
      .list(`hanko`, {
        search: userId,
      });

    // service client は RLS bypass なので list 結果をアプリ層で所有者フィルタ。
    // POST の命名規則 hanko-${userId}-${timestamp}.png に基づく厳密プレフィックス一致。
    const ownerPrefix = `hanko-${userId}-`;
    const filteredFiles = ((files || []) as HankoStorageFile[]).filter((f) => f.name.startsWith(ownerPrefix));

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

    // Get signed URLs for each file（private bucket・24h 有効・都度発行）
    const hankoImages = await Promise.all(
      filteredFiles.map(async (file) => {
        const { data: signedData } = await serviceClient.storage
          .from('hanko-images')
          .createSignedUrl(`hanko/${file.name}`, 86400);
        return {
          id: file.id,
          name: file.name,
          url: signedData?.signedUrl ?? '',
          createdAt: file.created_at,
          size: file.metadata?.size || 0,
        };
      })
    );

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
