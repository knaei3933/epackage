import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Schema for sharing requests
const ShareRequestSchema = z.object({
  shareId: z.string().uuid().optional(),
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
  options: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    password: z.string().optional(),
    expiryDays: z.number().min(1).max(365).default(30),
    allowDownload: z.boolean().default(true),
    allowComment: z.boolean().default(false),
    language: z.enum(['ja', 'en']).default('ja'),
  }).optional(),
});

const LoadSharedRequestSchema = z.object({
  shareId: z.string().uuid(),
  password: z.string().optional(),
});

// In-memory storage for shared comparisons (replace with database in production)
const sharedComparisons = new Map();
const shareAnalytics = new Map(); // Track views, downloads, etc.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if this is a new share or loading existing
    if (body.shareId) {
      // Load existing shared comparison
      const { shareId, password } = LoadSharedRequestSchema.parse(body);
      return handleLoadShare(shareId, password);
    } else {
      // Create new share
      const validatedData = ShareRequestSchema.parse(body);
      return handleCreateShare(validatedData);
    }

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
        },
        { status: 400 }
      );
    }

    console.error('Share comparison error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '共有処理中にエラーが発生しました。',
        },
      },
      { status: 500 }
    );
  }
}

async function handleCreateShare(data: z.infer<typeof ShareRequestSchema>) {
  const shareId = data.shareId || uuidv4();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + (data.options?.expiryDays || 30) * 24 * 60 * 60 * 1000);

  const shareRecord = {
    id: shareId,
    shareId,
    baseParams: data.baseParams,
    quantities: data.quantities,
    calculations: data.calculations,
    comparison: data.comparison,
    options: data.options || {},
    metadata: {
      createdAt,
      expiresAt,
      isPublic: !data.options?.password,
      password: data.options?.password || null,
      allowDownload: data.options?.allowDownload ?? true,
      allowComment: data.options?.allowComment ?? false,
      viewCount: 0,
      downloadCount: 0,
      lastViewed: null,
      language: data.options?.language || 'ja',
    },
    shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/compare/shared/${shareId}`,
  };

  // Store the shared comparison
  sharedComparisons.set(shareId, shareRecord);

  // Initialize analytics
  shareAnalytics.set(shareId, {
    views: [],
    downloads: [],
    comments: [],
  });

  return NextResponse.json({
    success: true,
    data: {
      shareId,
      shareUrl: shareRecord.shareUrl,
      expiresAt: shareRecord.metadata.expiresAt,
      isPublic: shareRecord.metadata.isPublic,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareRecord.shareUrl)}`,
    },
    metadata: {
      requestId: uuidv4(),
      timestamp: new Date().toISOString(),
      processingTime: 0,
    },
  });
}

async function handleLoadShare(shareId: string, password?: string) {
  const shareRecord = sharedComparisons.get(shareId);

  if (!shareRecord) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '指定された共有コンテンツが見つかりません。',
        },
      },
      { status: 404 }
    );
  }

  // Check if expired
  if (shareRecord.expiresAt < new Date()) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'EXPIRED',
          message: 'この共有コンテンツは有効期限が切れています。',
        },
      },
      { status: 410 }
    );
  }

  // Check password protection
  if (shareRecord.metadata.password && shareRecord.metadata.password !== password) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'パスワードが必要です。',
        },
      },
      { status: 401 }
    );
  }

  // Update analytics
  const analytics = shareAnalytics.get(shareId);
  if (analytics) {
    analytics.views.push({
      timestamp: new Date(),
      userAgent: 'web', // Would get from request headers in real implementation
      ip: '127.0.0.1', // Would get from request in real implementation
    });
    shareAnalytics.set(shareId, analytics);
  }

  // Update view count in record
  shareRecord.metadata.viewCount = (shareRecord.metadata.viewCount || 0) + 1;
  shareRecord.metadata.lastViewed = new Date();
  sharedComparisons.set(shareId, shareRecord);

  // Return sanitized data (exclude sensitive info)
  const responseData = {
    id: shareRecord.id,
    shareId: shareRecord.shareId,
    baseParams: shareRecord.baseParams,
    quantities: shareRecord.quantities,
    calculations: shareRecord.calculations,
    comparison: shareRecord.comparison,
    options: shareRecord.options,
    metadata: {
      createdAt: shareRecord.metadata.createdAt,
      expiresAt: shareRecord.metadata.expiresAt,
      isPublic: shareRecord.metadata.isPublic,
      allowDownload: shareRecord.metadata.allowDownload,
      allowComment: shareRecord.metadata.allowComment,
      language: shareRecord.metadata.language,
      viewCount: shareRecord.metadata.viewCount,
    },
  };

  return NextResponse.json({
    success: true,
    data: responseData,
    metadata: {
      requestId: uuidv4(),
      timestamp: new Date().toISOString(),
      processingTime: 0,
    },
  });
}

// Handle download tracking
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { shareId, action } = body;

    if (action === 'download') {
      const shareRecord = sharedComparisons.get(shareId);
      if (!shareRecord) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: '共有コンテンツが見つかりません。',
            },
          },
          { status: 404 }
        );
      }

      // Update download count
      const analytics = shareAnalytics.get(shareId);
      if (analytics) {
        analytics.downloads.push({
          timestamp: new Date(),
          format: 'pdf', // Would get from request in real implementation
        });
        shareAnalytics.set(shareId, analytics);
      }

      shareRecord.metadata.downloadCount = (shareRecord.metadata.downloadCount || 0) + 1;
      sharedComparisons.set(shareId, shareRecord);

      return NextResponse.json({
        success: true,
        data: {
          message: 'ダウンロードが記録されました。',
          downloadCount: shareRecord.metadata.downloadCount,
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: '無効なアクションです。',
        },
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('Share patch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '処理中にエラーが発生しました。',
        },
      },
      { status: 500 }
    );
  }
}

// Get analytics for a share
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shareId = searchParams.get('shareId');
    const action = searchParams.get('action');

    if (!shareId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PARAMETER',
            message: 'shareIdが必要です。',
          },
        },
        { status: 400 }
      );
    }

    if (action === 'analytics') {
      const analytics = shareAnalytics.get(shareId);
      const shareRecord = sharedComparisons.get(shareId);

      if (!shareRecord) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: '共有コンテンツが見つかりません。',
            },
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          shareId,
          viewCount: shareRecord.metadata.viewCount || 0,
          downloadCount: shareRecord.metadata.downloadCount || 0,
          lastViewed: shareRecord.metadata.lastViewed,
          createdAt: shareRecord.metadata.createdAt,
          expiresAt: shareRecord.metadata.expiresAt,
          analytics: analytics || {
            views: [],
            downloads: [],
            comments: [],
          },
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: '無効なアクションです。',
        },
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('Share GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '処理中にエラーが発生しました。',
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
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}