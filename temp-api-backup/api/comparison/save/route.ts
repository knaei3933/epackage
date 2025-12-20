import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Schema for saving comparison results
const SaveComparisonSchema = z.object({
  baseParams: z.object({
    bagTypeId: z.string(),
    materialId: z.string(),
    width: z.number(),
    height: z.number(),
    depth: z.number().optional(),
    thicknessSelection: z.string().optional(),
    isUVPrinting: z.boolean().optional(),
    printingType: z.enum(['digital', 'gravure']).optional(),
    printingColors: z.number().optional(),
    doubleSided: z.boolean().optional(),
    postProcessingOptions: z.array(z.string()).optional(),
    deliveryLocation: z.enum(['domestic', 'international']).optional(),
    urgency: z.enum(['standard', 'express']).optional(),
  }),
  quantities: z.array(z.number().min(100)),
  calculations: z.record(z.any()),
  comparison: z.any(),
  metadata: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    customerName: z.string().optional(),
    projectName: z.string().optional(),
    validityDays: z.number().default(30),
  }).optional(),
  userPreferences: z.object({
    includeBreakdown: z.boolean().default(true),
    includeRecommendations: z.boolean().default(true),
    currency: z.string().default('JPY'),
    locale: z.string().default('ja'),
  }).optional(),
});

const LoadComparisonSchema = z.object({
  shareId: z.string().uuid(),
});

// In-memory storage for development (replace with database in production)
const comparisonStorage = new Map();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = SaveComparisonSchema.parse(body);

    const shareId = uuidv4();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + (validatedData.metadata?.validityDays || 30) * 24 * 60 * 60 * 1000);

    const comparisonRecord = {
      id: shareId,
      shareId,
      baseParams: validatedData.baseParams,
      quantities: validatedData.quantities,
      calculations: validatedData.calculations,
      comparison: validatedData.comparison,
      metadata: {
        ...validatedData.metadata,
        createdAt,
        expiresAt,
        isShared: false,
        viewCount: 0,
        lastViewed: null,
      },
      userPreferences: validatedData.userPreferences || {
        includeBreakdown: true,
        includeRecommendations: true,
        currency: 'JPY',
        locale: 'ja',
      },
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/compare/shared/${shareId}`,
    };

    // Store in memory (replace with database in production)
    comparisonStorage.set(shareId, comparisonRecord);

    // Also save to local storage for persistence
    if (typeof localStorage !== 'undefined') {
      const savedComparisons = JSON.parse(localStorage.getItem('savedComparisons') || '[]');
      savedComparisons.push({
        id: shareId,
        title: validatedData.metadata?.title || `比較結果 ${new Date().toLocaleDateString()}`,
        createdAt,
        expiresAt,
        shareId,
        shareUrl: comparisonRecord.shareUrl,
      });
      localStorage.setItem('savedComparisons', JSON.stringify(savedComparisons));
    }

    return NextResponse.json({
      success: true,
      data: {
        shareId,
        shareUrl: comparisonRecord.shareUrl,
        expiresAt: comparisonRecord.metadata?.expiresAt,
        createdAt: comparisonRecord.metadata?.createdAt,
      },
      metadata: {
        requestId: uuidv4(),
        timestamp: new Date().toISOString(),
        processingTime: 0,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '入力値が正しくありません。',
            details: error.errors.reduce((acc, err) => {
              const field = err.path.join('.');
              if (!acc[field]) acc[field] = [];
              acc[field].push(err.message);
              return acc;
            }, {} as Record<string, string[]>),
          },
          metadata: {
            requestId: uuidv4(),
            timestamp: new Date().toISOString(),
            processingTime: 0,
          },
        },
        { status: 400 }
      );
    }

    console.error('Save comparison error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '比較結果の保存中にエラーが発生しました。',
        },
        metadata: {
          requestId: uuidv4(),
          timestamp: new Date().toISOString(),
          processingTime: 0,
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shareId = searchParams.get('shareId');

    if (!shareId) {
      // List saved comparisons
      const url = req.url;
      const baseUrl = url.split('?')[0];

      // Get from query parameter or return all
      const savedComparisons = Array.from(comparisonStorage.values())
        .filter(record => record.expiresAt > new Date())
        .map(record => ({
          id: record.id,
          title: record.metadata?.title || `比較結果 ${new Date(record.metadata?.createdAt).toLocaleDateString()}`,
          description: record.metadata?.description,
          createdAt: record.metadata?.createdAt,
          expiresAt: record.metadata?.expiresAt,
          viewCount: record.metadata?.viewCount || 0,
          shareId: record.shareId,
          shareUrl: record.shareUrl,
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return NextResponse.json({
        success: true,
        data: savedComparisons,
        metadata: {
          requestId: uuidv4(),
          timestamp: new Date().toISOString(),
          count: savedComparisons.length,
        },
      });
    }

    // Load specific comparison
    const validatedData = LoadComparisonSchema.parse({ shareId });
    const comparisonRecord = comparisonStorage.get(validatedData.shareId);

    if (!comparisonRecord) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '指定された比較結果が見つかりません。',
          },
          metadata: {
            requestId: uuidv4(),
            timestamp: new Date().toISOString(),
            processingTime: 0,
          },
        },
        { status: 404 }
      );
    }

    // Check if expired
    if (comparisonRecord.expiresAt < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EXPIRED',
            message: 'この比較結果は有効期限が切れています。',
          },
          metadata: {
            requestId: uuidv4(),
            timestamp: new Date().toISOString(),
            processingTime: 0,
          },
        },
        { status: 410 }
      );
    }

    // Update view count and last viewed
    comparisonRecord.metadata.viewCount = (comparisonRecord.metadata.viewCount || 0) + 1;
    comparisonRecord.metadata.lastViewed = new Date();
    comparisonStorage.set(validatedData.shareId, comparisonRecord);

    return NextResponse.json({
      success: true,
      data: comparisonRecord,
      metadata: {
        requestId: uuidv4(),
        timestamp: new Date().toISOString(),
        processingTime: 0,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '無効な共有IDです。',
          },
          metadata: {
            requestId: uuidv4(),
            timestamp: new Date().toISOString(),
            processingTime: 0,
          },
        },
        { status: 400 }
      );
    }

    console.error('Load comparison error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '比較結果の読み込み中にエラーが発生しました。',
        },
        metadata: {
          requestId: uuidv4(),
          timestamp: new Date().toISOString(),
          processingTime: 0,
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shareId = searchParams.get('shareId');

    if (!shareId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PARAMETER',
            message: '共有IDが必要です。',
          },
          metadata: {
            requestId: uuidv4(),
            timestamp: new Date().toISOString(),
            processingTime: 0,
          },
        },
        { status: 400 }
      );
    }

    const validatedData = LoadComparisonSchema.parse({ shareId });
    const exists = comparisonStorage.has(validatedData.shareId);

    if (!exists) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '指定された比較結果が見つかりません。',
          },
          metadata: {
            requestId: uuidv4(),
            timestamp: new Date().toISOString(),
            processingTime: 0,
          },
        },
        { status: 404 }
      );
    }

    comparisonStorage.delete(validatedData.shareId);

    // Also remove from local storage
    if (typeof localStorage !== 'undefined') {
      const savedComparisons = JSON.parse(localStorage.getItem('savedComparisons') || '[]');
      const filtered = savedComparisons.filter((item: any) => item.shareId !== validatedData.shareId);
      localStorage.setItem('savedComparisons', JSON.stringify(filtered));
    }

    return NextResponse.json({
      success: true,
      data: {
        message: '比較結果が削除されました。',
        deletedId: validatedData.shareId,
      },
      metadata: {
        requestId: uuidv4(),
        timestamp: new Date().toISOString(),
        processingTime: 0,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '無効な共有IDです。',
          },
          metadata: {
            requestId: uuidv4(),
            timestamp: new Date().toISOString(),
            processingTime: 0,
          },
        },
        { status: 400 }
      );
    }

    console.error('Delete comparison error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '比較結果の削除中にエラーが発生しました。',
        },
        metadata: {
          requestId: uuidv4(),
          timestamp: new Date().toISOString(),
          processingTime: 0,
        },
      },
      { status: 500 }
    );
  }
}

// CORS configuration
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}