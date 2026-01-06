/**
 * AI File Parser API
 *
 * AIファイルパーサーAPI
 * - POST: Adobe Illustrator .aiファイルをアップロードして解析
 * - 構造化されたデザインデータをJSONとして返却
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  parseAiFile,
  validateAiFile,
  validateAiBuffer,
  createMockAiData,
} from '@/lib/ai/aiFileParser';
import type { AiFileData, ParseOptions, ValidationOptions } from '@/types/aiFile';

// ============================================================
// Types
// ============================================================

interface ParseRequestBody {
  file?: File;
  base64?: string; // Base64エンコードされたAIファイル
  options?: ParseOptions;
}

interface ParseResponseBody {
  success: boolean;
  data?: AiFileData;
  error?: string;
  warnings?: string[];
  processingTime?: number;
}

interface ValidateRequestBody {
  fileName?: string;
  fileSize?: number;
  options?: ValidationOptions;
}

interface ValidateResponseBody {
  success: boolean;
  isValid?: boolean;
  errors?: string[];
  warnings?: string[];
}

// ============================================================
// POST Handler - Parse AI File
// ============================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // リクエストボディの解析
    const contentType = request.headers.get('content-type') || '';

    let fileBuffer: Buffer;
    let fileName: string;
    let parseOptions: ParseOptions = {};
    const validationOptions: ValidationOptions = {};

    if (contentType.includes('multipart/form-data')) {
      // フォームデータからファイルを取得
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json(
          {
            success: false,
            error: 'ファイルがアップロードされていません',
          } as ParseResponseBody,
          { status: 400 }
        );
      }

      fileName = file.name;

      // ファイル検証
      const validation = await validateAiFile(file, validationOptions);
      if (!validation.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: '無効なAIファイル',
            errors: validation.errors,
            warnings: validation.warnings,
          } as ParseResponseBody,
          { status: 400 }
        );
      }

      // ファイルバッファを取得
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);

      // オプションを取得（文字列として渡される場合がある）
      const optionsStr = formData.get('options') as string | null;
      if (optionsStr) {
        try {
          parseOptions = JSON.parse(optionsStr);
        } catch {
          // オプションの解析に失敗した場合はデフォルトを使用
        }
      }
    } else if (contentType.includes('application/json')) {
      // JSONリクエストからbase64データを取得
      const body = (await request.json()) as ParseRequestBody;

      if (body.base64) {
        fileBuffer = Buffer.from(body.base64, 'base64');
        fileName = body.file?.name || 'uploaded.ai';
        parseOptions = body.options || {};

        // バッファ検証
        const validation = await validateAiBuffer(fileBuffer, fileName, validationOptions);
        if (!validation.isValid) {
          return NextResponse.json(
            {
              success: false,
              error: '無効なAIファイル',
              errors: validation.errors,
              warnings: validation.warnings,
            } as ParseResponseBody,
            { status: 400 }
          );
        }
      } else if (body.file) {
        // Fileオブジェクトが直接渡された場合
        const arrayBuffer = await body.file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
        fileName = body.file.name;
        parseOptions = body.options || {};
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'ファイルまたはbase64データが必要です',
          } as ParseResponseBody,
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'サポートされていないコンテンツタイプ',
        } as ParseResponseBody,
        { status: 415 }
      );
    }

    // ファイルパース
    const aiData = await parseAiFile(fileBuffer, parseOptions);
    aiData.fileName = fileName;

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: aiData,
      processingTime,
    } as ParseResponseBody);

  } catch (error) {
    console.error('AIファイルパースエラー:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'パースエラー',
        details: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      } as ParseResponseBody,
      { status: 500 }
    );
  }
}

// ============================================================
// GET Handler - Get Mock Data or Validation Info
// ============================================================

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action') || 'mock'; // mock, validate, info

  try {
    switch (action) {
      case 'mock':
        // モックデータを返す
        const mockData = createMockAiData();
        return NextResponse.json({
          success: true,
          data: mockData,
        } as ParseResponseBody);

      case 'validate':
        // 検証情報を返す
        const fileName = searchParams.get('fileName') || 'test.ai';
        const fileSize = parseInt(searchParams.get('fileSize') || '0');

        const mockBuffer = Buffer.alloc(fileSize || 1024);
        const validation = await validateAiBuffer(mockBuffer, fileName);

        return NextResponse.json({
          success: true,
          isValid: validation.isValid,
          errors: validation.errors,
          warnings: validation.warnings,
        } as ValidateResponseBody);

      case 'info':
        // API情報を返す
        return NextResponse.json({
          name: 'AI File Parser API',
          version: '1.0.0',
          description: 'Adobe Illustrator .aiファイル解析API',
          endpoints: {
            POST: {
              description: 'AIファイルをアップロードして解析',
              contentType: ['multipart/form-data', 'application/json'],
              parameters: {
                file: 'File object (multipart/form-data)',
                base64: 'Base64 encoded AI file (application/json)',
                options: 'ParseOptions object (optional)',
              },
              response: 'ParseResponseBody',
            },
            GET: {
              description: 'モックデータまたは検証情報を取得',
              parameters: {
                action: 'mock | validate | info',
                fileName: 'File name for validation (optional)',
                fileSize: 'File size in bytes for validation (optional)',
              },
            },
          },
          supportedFormats: ['.ai'],
          supportedVersions: ['CS3', 'CS4', 'CS5', 'CS6', 'CC', 'CC2014+'],
          maxFileSize: '100MB',
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: '無効なアクション',
            validActions: ['mock', 'validate', 'info'],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
