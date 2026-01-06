/**
 * AI Specification Extractor API
 *
 * AI仕様書抽出API
 * - POST: Adobe Illustrator .aiファイルから製品仕様書を抽出
 * - GET: モックデータまたはAPI情報を返却
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseAiFile } from '@/lib/ai/aiFileParser';
import { extractSpecifications, validateSpecifications } from '@/lib/ai/specExtractor';
import { PouchType } from '@/lib/ai/types';
import type { ProductSpecifications, ValidationResult, ExtractionResult } from '@/lib/ai/types';

// ============================================================
// Types
// ============================================================

interface ExtractRequestBody {
  file?: File;
  base64?: string; // Base64エンコードされたAIファイル
  options?: {
    validate?: boolean;
    crossCheck?: {
      pouchType?: string;
      dimensions?: { width: number; height: number; gusset: number };
      materials?: string[];
    };
  };
}

interface ExtractResponseBody {
  success: boolean;
  specs?: ProductSpecifications;
  validation?: ValidationResult;
  error?: string;
  warnings?: string[];
  processingTime?: number;
}

interface MockSpecResponseBody {
  success: boolean;
  specs?: ProductSpecifications;
}

// ============================================================
// POST Handler - Extract Specifications
// ============================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // リクエストボディの解析
    const contentType = request.headers.get('content-type') || '';

    let fileBuffer: Buffer;
    let fileName: string;
    const options: ExtractRequestBody['options'] = {};

    if (contentType.includes('multipart/form-data')) {
      // フォームデータからファイルを取得
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json(
          {
            success: false,
            error: 'ファイルがアップロードされていません',
          } as ExtractResponseBody,
          { status: 400 }
        );
      }

      fileName = file.name;

      // ファイルバッファを取得
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);

      // オプションを取得
      const optionsStr = formData.get('options') as string | null;
      if (optionsStr) {
        try {
          const parsed = JSON.parse(optionsStr);
          Object.assign(options, parsed);
        } catch {
          // オプションの解析に失敗した場合はデフォルトを使用
        }
      }
    } else if (contentType.includes('application/json')) {
      // JSONリクエストからbase64データを取得
      const body = (await request.json()) as ExtractRequestBody;

      if (body.base64) {
        fileBuffer = Buffer.from(body.base64, 'base64');
        fileName = body.file?.name || 'uploaded.ai';
        Object.assign(options, body.options || {});
      } else if (body.file) {
        // Fileオブジェクトが直接渡された場合
        const arrayBuffer = await body.file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
        fileName = body.file.name;
        Object.assign(options, body.options || {});
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'ファイルまたはbase64データが必要です',
          } as ExtractResponseBody,
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'サポートされていないコンテンツタイプ',
        } as ExtractResponseBody,
        { status: 415 }
      );
    }

    // AIファイルをパース
    const aiData = await parseAiFile(fileBuffer);

    // 仕様書を抽出
    const specs = extractSpecifications(aiData, fileName);

    // バリデーション（オプション）
    let validation: ValidationResult | undefined;
    if (options.validate !== false) {
      validation = validateSpecifications(specs);
    }

    // クロスチェック（オプション）
    if (options.crossCheck && validation) {
      // Import crossCheckWithQuotation only when needed
      const { crossCheckWithQuotation } = await import('@/lib/ai/specExtractor');
      const crossCheckResult = crossCheckWithQuotation(specs, options.crossCheck);
      validation.warnings.push(...crossCheckResult.warnings);
    }

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      specs,
      validation,
      warnings: validation?.warnings || [],
      processingTime,
    } as ExtractResponseBody);

  } catch (error) {
    console.error('仕様書抽出エラー:', error);

    return NextResponse.json(
      {
        success: false,
        error: '抽出エラー',
        details: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      } as ExtractResponseBody,
      { status: 500 }
    );
  }
}

// ============================================================
// GET Handler - Get Mock Data or API Info
// ============================================================

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action') || 'mock'; // mock, info

  try {
    switch (action) {
      case 'mock':
        // モック仕様書データを返す
        const mockSpecs = createMockSpecifications();
        return NextResponse.json({
          success: true,
          specs: mockSpecs,
        } as MockSpecResponseBody);

      case 'info':
        // API情報を返す
        return NextResponse.json({
          name: 'AI Specification Extractor API',
          version: '1.0.0',
          description: 'Adobe Illustrator .aiファイルから製品仕様書を抽出するAPI',
          endpoints: {
            POST: {
              description: 'AIファイルから製品仕様書を抽出',
              contentType: ['multipart/form-data', 'application/json'],
              parameters: {
                file: 'File object (multipart/form-data)',
                base64: 'Base64 encoded AI file (application/json)',
                options: {
                  validate: 'バリデーションを実行するかどうか (default: true)',
                  crossCheck: '見積もりデータとの照合情報 (optional)',
                },
              },
              response: 'ExtractResponseBody',
            },
            GET: {
              description: 'モックデータまたはAPI情報を取得',
              parameters: {
                action: 'mock | info',
              },
            },
          },
          supportedFormats: ['.ai'],
          extractedFields: [
            'pouchType',
            'dimensions (width, height, gusset)',
            'materials (layer composition)',
            'processingFeatures (notch, hangingHole, zipper, etc.)',
            'confidenceScore',
          ],
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: '無効なアクション',
            validActions: ['mock', 'info'],
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

// ============================================================
// Mock Data Generator
// ============================================================

/**
 * モック仕様書データを作成
 * Create mock specification data
 */
function createMockSpecifications(): ProductSpecifications {
  return {
    pouchType: PouchType.STAND_POUCH,
    dimensions: {
      width: 150,
      height: 200,
      gusset: 50,
      tolerance: 2,
    },
    materials: [
      {
        layer: 'outer',
        material: 'PET',
        thickness: 12,
        description: '印刷基材・透明性',
      },
      {
        layer: 'middle',
        material: 'AL',
        thickness: 7,
        description: 'バリア性・遮光性',
      },
      {
        layer: 'inner',
        material: 'PE',
        thickness: 80,
        description: 'ヒートシール性',
      },
    ],
    processing: {
      sealWidth: 10,
      sealPosition: 'top_bottom',
      notch: {
        type: 'round',
        position: 'top_center',
        size: 5,
      },
      hangingHole: {
        type: 'round',
        diameter: 5,
        position: 'center',
      },
      zipperPosition: 'top',
      zipperType: 'standard',
      cornerRadius: 3,
      hasSlit: true,
    },
    confidence: {
      overall: 0.87,
      breakdown: {
        pouchType: 0.9,
        dimensions: 0.85,
        materials: 0.88,
        processing: 0.82,
      },
      flags: [],
      level: 'high',
    },
    extractedAt: new Date(),
    sourceFile: 'mock_sample.ai',
    extractorId: 'system',
    metadata: {
      aiVersion: 'CC2024',
      method: 'automated',
      processingTime: 1250,
    },
  };
}
