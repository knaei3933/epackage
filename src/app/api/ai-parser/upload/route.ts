/**
 * AI File Upload API
 * Adobe Illustrator .aiファイルのアップロードを処理するAPIエンドポイント
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { randomUUID } from 'crypto';
import { getPerformanceMonitor } from '@/lib/performance-monitor';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

// Initialize performance monitor
const perfMonitor = getPerformanceMonitor({
  slowQueryThreshold: 1000,
  enableLogging: true,
});

// ============================================================
// Security Constants
// ============================================================

// Maximum file size: 10MB (reduced from 50MB for security)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Magic numbers (file signatures) for security validation
const FILE_MAGIC_NUMBERS: Record<string, RegExp> = {
  pdf: /^%PDF-/,
  ai: /%(AI|Adobe)/,
  psd: /^8BPS/,
};

// ============================================================
// Helper Functions
// ============================================================

/**
 * Validate file by magic number (file signature)
 * Prevents files with misleading extensions from being uploaded
 */
function validateFileByMagicNumber(buffer: Buffer, expectedType: string): boolean {
  const header = buffer.slice(0, 1024).toString('ascii');

  if (expectedType === 'pdf') return FILE_MAGIC_NUMBERS.pdf.test(header);
  if (expectedType === 'ai') return FILE_MAGIC_NUMBERS.ai.test(header);
  if (expectedType === 'psd') return FILE_MAGIC_NUMBERS.psd.test(header);

  // For unknown type, accept any valid format
  return (
    FILE_MAGIC_NUMBERS.pdf.test(header) ||
    FILE_MAGIC_NUMBERS.ai.test(header) ||
    FILE_MAGIC_NUMBERS.psd.test(header)
  );
}

/**
 * POST /api/ai-parser/upload
 * .aiファイルのアップロードおよび解析開始
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    // ✅ STEP 1: Check authentication (SECURE: getUser() validates JWT on every request)
    // Initialize Supabase client using modern @supabase/ssr pattern
    const { client: supabaseAuth } = await createSupabaseSSRClient(request);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません。ログインしてください。' },
        { status: 401 }
      );
    }

    // ✅ STEP 2: Verify user is active member
    const { data: profile } = await supabaseAuth
      .from('profiles')
      .select('id, role, status')
      .eq('id', user.id)
      .single();

    if (!profile || profile.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: '有効なアカウントではありません。' },
        { status: 403 }
      );
    }

    // ✅ STEP 3: Use service role only after authentication
    const supabase = createAuthenticatedServiceClient({
      operation: 'ai_parser_upload',
      userId: user.id,
      route: '/api/ai-parser/upload',
    });

    // 1. ファイル抽出
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userId = user.id;
    const priority = (formData.get('priority') as string) || 'detailed';

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルがありません' },
        { status: 400 }
      );
    }

    // 2. ファイルサイズ検証（最大10MB）
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `ファイルサイズが${MAX_FILE_SIZE / 1024 / 1024}MBを超えています`,
          code: 'FILE_TOO_LARGE',
          maxSize: MAX_FILE_SIZE,
        },
        { status: 413 }
      );
    }

    // 3. ファイルタイプ検証（拡張子）
    const allowedTypes = [
      'application/pdf',
      'application/postscript',
      'application/illustrator',
    ];

    if (
      !allowedTypes.includes(file.type) &&
      !file.name.endsWith('.ai') &&
      !file.name.endsWith('.pdf')
    ) {
      return NextResponse.json(
        { error: 'サポートされていないファイル形式です', code: 'INVALID_FILE_TYPE' },
        { status: 400 }
      );
    }

    // 4. Convert to buffer for magic number validation
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. マジックナンバー検証（ファイル署名確認）
    const fileType = file.name.endsWith('.pdf') ? 'pdf' : 'ai';
    if (!validateFileByMagicNumber(buffer, fileType)) {
      return NextResponse.json(
        {
          error: `ファイルの内容が期待された形式（${fileType}）と一致しません。ファイルが破損しているか、拡張子が間違っています。`,
          code: 'INVALID_FILE_CONTENT',
        },
        { status: 400 }
      );
    }

    // 4. 一意のID生成
    const uploadId = randomUUID();
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `${uploadId}_${timestamp}.${extension}`;

    // 5. Supabase Storageにアップロード（bufferの代わりにファイルを使用）
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ai-uploads')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'ファイルのアップロードに失敗しました' },
        { status: 500 }
      );
    }

    // 6. DB記録保存
    const { data: record, error: dbError } = await supabase
      .from('ai_uploads')
      .insert({
        id: uploadId,
        user_id: userId,
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: extension === 'ai' ? 'ai' : 'pdf',
        uploaded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error('DB error:', dbError);
      return NextResponse.json(
        { error: 'データベースの保存に失敗しました' },
        { status: 500 }
      );
    }

    // 7. 非同期解析開始
    // 実際の実装ではバックグラウンド作業キューを使用
    // 例: Bull, AWS SQS, Supabase Edge Functions
    await startParsingTask(uploadId, fileName, priority);

    // 8. 予想処理時間の計算
    const estimatedTime = estimateProcessingTime(file.size, priority);

    // 9. レスポンス返却
    return NextResponse.json({
      success: true,
      uploadId,
      filePath: uploadData.path,
      fileSize: file.size,
      estimatedTime,
      statusUrl: `/api/ai-parser/status/${uploadId}`,
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  } finally {
    // Track AI parser upload API execution time
    const duration = Date.now() - startTime;
    perfMonitor.trackQuery(`POST /api/ai-parser/upload`, duration);
  }
}

/**
 * 解析作業開始（非同期）
 */
async function startParsingTask(
  uploadId: string,
  fileName: string,
  priority: string
): Promise<void> {
  // 実際の実装では別のワーカープロセスまたはサーバーレス関数で処理
  // ここでは単純にログのみ出力
  console.log(`Starting parsing task for ${uploadId} with priority ${priority}`);

  // TODO: 作業キューに登録
  // 例: await parsingQueue.add({ uploadId, fileName, priority });
}

/**
 * 処理時間の推定
 */
function estimateProcessingTime(
  fileSize: number,
  priority: string
): number {
  const baseTime = 10; // 秒単位
  const sizeFactor = fileSize / (1024 * 1024); // MB
  const priorityMultiplier = priority === 'fast' ? 0.5 : 1.5;

  return Math.ceil(baseTime * sizeFactor * priorityMultiplier);
}

/**
 * OPTIONSメソッド（CORS preflight）
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
