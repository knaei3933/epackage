import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Email validation schema
const EmailSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  firstName: z.string().min(1, '名前を入力してください'),
  company: z.string().optional(),
  consent: z.boolean().refine(val => val === true, '同意が必要です'),
});

// Type for download tracking
interface DownloadRecord {
  id: string;
  email: string;
  firstName: string;
  company?: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  downloadSuccess: boolean;
  fileSize: number;
  downloadTime?: number;
}

// In-memory storage for demo (in production, use database)
const downloadRecords: DownloadRecord[] = [];

// PDF file configuration
const CATALOG_FILE_PATH = path.join(process.cwd(), 'public', 'catalog', '회사소개서 JP.pdf');
const FALLBACK_CATALOG_PATH = path.join(process.cwd(), 'public', 'catalog', 'EpackageLab_Catalog.pdf');

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await request.json();
    const validatedData = EmailSchema.parse(body);

    // Get client information
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check if PDF file exists
    const pdfPath = fs.existsSync(CATALOG_FILE_PATH) ? CATALOG_FILE_PATH : FALLBACK_CATALOG_PATH;

    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json(
        { error: 'カタログファイルが見つかりません' },
        { status: 404 }
      );
    }

    // Get file stats
    const fileStats = fs.statSync(pdfPath);
    const fileSize = fileStats.size;

    // Create download record
    const downloadRecord: DownloadRecord = {
      id: `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: validatedData.email,
      firstName: validatedData.firstName,
      company: validatedData.company,
      timestamp: new Date().toISOString(),
      ipAddress,
      userAgent,
      downloadSuccess: true,
      fileSize,
    };

    // Store record (in production, save to database)
    downloadRecords.push(downloadRecord);

    // Log for analytics
    console.log('Catalog download initiated:', {
      email: validatedData.email,
      timestamp: downloadRecord.timestamp,
      fileSize: `${(fileSize / 1024 / 1024).toFixed(2)}MB`,
    });

    // Send email notification (in production)
    // await sendDownloadNotification(validatedData);

    // Create file buffer for download
    const fileBuffer = fs.readFileSync(pdfPath);

    // Set appropriate headers for large file download
    const headers = new Headers({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="EpackageLab_Catalog_${validatedData.firstName}.pdf"`,
      'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });

    // Create response with file
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });

    // Update download record with timing
    downloadRecord.downloadTime = Date.now() - startTime;

    return response;

  } catch (error) {
    console.error('Catalog download error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: '入力エラー',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'ダウンロードに失敗しました。後でもう一度お試しください。' },
      { status: 500 }
    );
  }
}

// GET endpoint for download statistics (protected route)
export async function GET(request: NextRequest) {
  try {
    // In production, add authentication check
    const url = new URL(request.url);
    const stats = url.searchParams.get('stats');

    if (stats === 'summary') {
      const summary = {
        totalDownloads: downloadRecords.length,
        uniqueEmails: [...new Set(downloadRecords.map(r => r.email))].length,
        averageFileSize: downloadRecords.length > 0
          ? downloadRecords.reduce((sum, r) => sum + r.fileSize, 0) / downloadRecords.length
          : 0,
        recentDownloads: downloadRecords.slice(-10).reverse(),
      };

      return NextResponse.json(summary);
    }

    return NextResponse.json({ records: downloadRecords });

  } catch (error) {
    console.error('Download stats error:', error);
    return NextResponse.json(
      { error: '統計データの取得に失敗しました' },
      { status: 500 }
    );
  }
}