/**
 * AI File Upload API
 * Adobe Illustrator .ai 파일 업로드를 처리하는 API 엔드포인트
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
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
 * .ai 파일 업로드 및 파싱 시작
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    // ✅ STEP 1: Check authentication (SECURE: getUser() validates JWT on every request)
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabaseAuth = createRouteHandlerClient({ cookies: () => cookieStore });
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

    // 1. 파일 추출
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userId = user.id;
    const priority = (formData.get('priority') as string) || 'detailed';

    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다' },
        { status: 400 }
      );
    }

    // 2. 파일 크기 검증 (최대 10MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `파일 크기가 ${MAX_FILE_SIZE / 1024 / 1024}MB를 초과합니다`,
          code: 'FILE_TOO_LARGE',
          maxSize: MAX_FILE_SIZE,
        },
        { status: 413 }
      );
    }

    // 3. 파일 타입 검증 (확장자)
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
        { error: '지원하지 않는 파일 형식입니다', code: 'INVALID_FILE_TYPE' },
        { status: 400 }
      );
    }

    // 4. Convert to buffer for magic number validation
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Magic Number 검증 (파일 서명 확인)
    const fileType = file.name.endsWith('.pdf') ? 'pdf' : 'ai';
    if (!validateFileByMagicNumber(buffer, fileType)) {
      return NextResponse.json(
        {
          error: `파일 내용이 예상된 형식(${fileType})과 일치하지 않습니다. 파일이 손상되었거나 확장자가 잘못되었습니다.`,
          code: 'INVALID_FILE_CONTENT',
        },
        { status: 400 }
      );
    }

    // 4. 고유 ID 생성
    const uploadId = randomUUID();
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `${uploadId}_${timestamp}.${extension}`;

    // 5. Supabase Storage에 업로드 (use buffer instead of file)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ai-uploads')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: '파일 업로드에 실패했습니다' },
        { status: 500 }
      );
    }

    // 6. DB 기록 저장
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
        { error: '데이터베이스 저장에 실패했습니다' },
        { status: 500 }
      );
    }

    // 7. 비동기 파싱 시작
    // 실제 구현에서는 백그라운드 작업 큐 사용
    // 예: Bull, AWS SQS, Supabase Edge Functions
    await startParsingTask(uploadId, fileName, priority);

    // 8. 예상 처리 시간 계산
    const estimatedTime = estimateProcessingTime(file.size, priority);

    // 9. 응답 반환
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
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  } finally {
    // Track AI parser upload API execution time
    const duration = Date.now() - startTime;
    perfMonitor.trackQuery(`POST /api/ai-parser/upload`, duration);
  }
}

/**
 * 파싱 작업 시작 (비동기)
 */
async function startParsingTask(
  uploadId: string,
  fileName: string,
  priority: string
): Promise<void> {
  // 실제 구현에서는 별도의 작업자 프로세스나 서버리스 함수로 처리
  // 여기서는 간단히 로그만 출력
  console.log(`Starting parsing task for ${uploadId} with priority ${priority}`);

  // TODO: 작업 큐에 등록
  // 예: await parsingQueue.add({ uploadId, fileName, priority });
}

/**
 * 처리 시간 추정
 */
function estimateProcessingTime(
  fileSize: number,
  priority: string
): number {
  const baseTime = 10; // 초 단위
  const sizeFactor = fileSize / (1024 * 1024); // MB
  const priorityMultiplier = priority === 'fast' ? 0.5 : 1.5;

  return Math.ceil(baseTime * sizeFactor * priorityMultiplier);
}

/**
 * OPTIONS 메서드 (CORS preflight)
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
