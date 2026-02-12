/**
 * Member Quotation Export API (Unified B2B + Member)
 *
 * B2B見積もり書エクスポートAPIエンドポイント
 * - GET: 見積もりデータをJSON形式で返す
 * - POST: Excel/PDFファイルを生成・保存・メール送信
 *
 * Routes:
 * - GET /api/member/quotations/[id]/export - 見積もりデータ取得
 * - POST /api/member/quotations/[id]/export - ファイル生成
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { Resend } from 'resend';

import { Database } from '@/types/database';
import { mapDatabaseQuotationToExcel } from '@/lib/excel/excelDataMapper';
import { loadTemplate, writeQuotationToWorksheet } from '@/lib/excel/excelTemplateLoader';
import { generatePdfBuffer, validatePdfData } from '@/lib/excel/pdfConverter';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

// ============================================================
// Configuration
// ============================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

// ============================================================
// Types
// ============================================================

interface ExportRequestBody {
  format: 'excel' | 'pdf';
  sendEmail?: boolean;
  emailTo?: string;
  emailCc?: string;
  emailSubject?: string;
  emailBody?: string;
  saveToStorage?: boolean;
}

interface ExportResponse {
  success: boolean;
  data?: {
    quotationId: string;
    quotationNumber: string;
    format: string;
    downloadUrl: string;
    storagePath?: string;
    emailSent?: boolean;
    generatedAt: string;
    fileSize: number;
  };
  error?: string;
  code?: string;
}

/**
 * Helper: Get authenticated user
 */
async function getAuthenticatedUser(request: NextRequest) {
  // Normal auth: Use cookie-based auth with createSupabaseSSRClient
  const { client: supabase } = await createSupabaseSSRClient($$$ARGS);
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  const userId = authUser.id;
  const user = authUser;
  console.log('[Quotation Export] Authenticated user:', userId);

  return { userId, user };
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Send email with attachment
 */
async function sendExportEmail(
  to: string,
  cc: string | undefined,
  subject: string,
  attachmentBuffer: Buffer,
  fileName: string,
  format: 'excel' | 'pdf'
): Promise<{ success: boolean; error?: string }> {
  try {
    // For development: log email details
    if (process.env.NODE_ENV === 'development') {
      console.log('[Email Mock] To:', to);
      console.log('[Email Mock] Subject:', subject);
      console.log('[Email Mock] Attachment:', fileName, `${attachmentBuffer.length} bytes`);
      return { success: true };
    }

    // Production: Use Resend or SendGrid
    const resend = new Resend(process.env.RESEND_API_KEY);

    const contentType = format === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@epackage-lab.com',
      to,
      ...(cc && { cc }),
      subject,
      html: `<p>Please find attached the ${format.toUpperCase()} file.</p>`,
      attachments: [
        {
          filename: fileName,
          content: attachmentBuffer,
          contentType,
        },
      ],
    });

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Upload file to Supabase Storage
 *
 * Note: This function requires an authenticated service client
 * Callers must verify authentication before using this function
 */
async function uploadToStorage(
  bucket: string,
  path: string,
  buffer: Buffer,
  contentType: string,
  userId: string
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    // Use authenticated service client with audit logging
    const supabase = createAuthenticatedServiceClient({
      operation: 'upload_quotation_file',
      userId,
      route: '/api/member/quotations/[id]/export',
    });

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return { success: true, path: urlData.publicUrl };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================
// GET Handler - Return quotation data as JSON
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quotationId } = await params;

    if (!quotationId) {
      return NextResponse.json(
        { error: 'Quotation ID is required', code: 'MISSING_ID' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { userId } = authResult;
    const { client: supabase } = await createSupabaseSSRClient($$$ARGS);

    // Fetch quotation with items
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .select(`
        *,
        quotation_items (*)
      `)
      .eq('id', quotationId)
      .eq('user_id', userId)
      .single();

    if (quotationError || !quotation) {
      return NextResponse.json(
        { error: 'Quotation not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Fetch user profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Return quotation data as JSON
    return NextResponse.json({
      success: true,
      data: {
        quotation,
        userProfile,
        items: quotation.quotation_items,
      },
    });

  } catch (error) {
    console.error('Quotation GET error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// POST Handler - Generate Excel/PDF file
// ============================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quotationId } = await params;

    if (!quotationId) {
      return NextResponse.json(
        { error: 'Quotation ID is required', code: 'MISSING_ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body: ExportRequestBody = await request.json().catch(() => ({}));
    const format = body.format || 'excel';

    if (!['excel', 'pdf'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be "excel" or "pdf"', code: 'INVALID_FORMAT' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { userId } = authResult;
    const { client: supabase } = await createSupabaseSSRClient($$$ARGS);

    // Fetch quotation with items
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .select(`
        *,
        quotation_items (*)
      `)
      .eq('id', quotationId)
      .eq('user_id', userId)
      .single();

    if (quotationError || !quotation) {
      return NextResponse.json(
        { error: 'Quotation not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Fetch user profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Transform database data to Excel format
    const excelData = await mapDatabaseQuotationToExcel(
      quotation,
      quotation.quotation_items || [],
      userProfile || undefined
    );

    let fileBuffer: Buffer;
    let fileName: string;
    let contentType: string;

    if (format === 'excel') {
      // Generate Excel file
      const { workbook } = await loadTemplate();
      const worksheet = workbook.getWorksheet(1);

      if (!worksheet) {
        return NextResponse.json(
          { error: 'Failed to load worksheet template', code: 'TEMPLATE_ERROR' },
          { status: 500 }
        );
      }

      await writeQuotationToWorksheet(worksheet, excelData);

      const buffer = await workbook.xlsx.writeBuffer();
      fileBuffer = Buffer.from(buffer);
      fileName = `${quotation.quotation_number}.xlsx`;
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    } else {
      // Generate PDF file
      // Debug logging to understand data structure
      console.log('[PDF Export] excelData keys:', Object.keys(excelData));
      console.log('[PDF Export] specifications:', JSON.stringify(excelData.specifications, null, 2));
      console.log('[PDF Export] specifications.productType:', excelData.specifications.productType);
      console.log('[PDF Export] options:', JSON.stringify(excelData.options, null, 2));
      console.log('[PDF Export] customer:', JSON.stringify(excelData.customer, null, 2));
      console.log('[PDF Export] metadata:', JSON.stringify(excelData.metadata, null, 2));
      console.log('[PDF Export] orders count:', excelData.orders?.length);

      // Try PDF generation even if validation fails - log errors for debugging
      const validation = validatePdfData(excelData);
      console.log('[PDF Export] validation result:', validation);

      if (!validation.isValid) {
        console.warn('[PDF Export] Validation failed, but attempting PDF generation anyway:', validation.errors);
        // Continue anyway for debugging
      }

      try {
        const pdfBuffer = await generatePdfBuffer(excelData);
        fileBuffer = Buffer.from(pdfBuffer);
        fileName = `${quotation.quotation_number}.pdf`;
        contentType = 'application/pdf';
      } catch (pdfError) {
        console.error('[PDF Export] PDF generation error:', pdfError);
        return NextResponse.json(
          {
            error: 'PDF generation failed',
            code: 'PDF_ERROR',
            message: pdfError instanceof Error ? pdfError.message : 'Unknown error',
            validationErrors: validation.errors,
          },
          { status: 500 }
        );
      }
    }

    // Check file size
    if (fileBuffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size exceeds limit (${MAX_FILE_SIZE / 1024 / 1024}MB)`,
          code: 'FILE_TOO_LARGE',
          actualSize: fileBuffer.length,
          maxSize: MAX_FILE_SIZE,
        },
        { status: 413 }
      );
    }

    // Save to Supabase Storage if requested
    let storagePath: string | undefined;
    if (body.saveToStorage !== false) {
      const bucket = format === 'pdf' ? 'quotation-pdfs' : 'quotation-excels';
      const path = `${userId}/${quotation.quotation_number}/${Date.now()}_${fileName}`;

      const uploadResult = await uploadToStorage(
        bucket,
        path,
        fileBuffer,
        contentType,
        userId // Pass authenticated user ID for audit logging
      );

      if (uploadResult.success && uploadResult.path) {
        storagePath = uploadResult.path;

        // Update quotation record with file URL
        await supabase
          .from('quotations')
          .update({
            [format === 'pdf' ? 'pdf_url' : 'excel_url']: storagePath,
            updated_at: new Date().toISOString(),
          })
          .eq('id', quotationId);
      }
    }

    // Send email if requested
    let emailSent = false;
    if (body.sendEmail && body.emailTo) {
      const emailResult = await sendExportEmail(
        body.emailTo,
        body.emailCc,
        body.emailSubject || `見積書 ${quotation.quotation_number}`,
        fileBuffer,
        fileName,
        format
      );
      emailSent = emailResult.success;
    }

    // Prepare response
    const response: ExportResponse = {
      success: true,
      data: {
        quotationId,
        quotationNumber: quotation.quotation_number,
        format,
        downloadUrl: storagePath || `/api/member/quotations/${quotationId}/export/download?format=${format}`,
        storagePath,
        emailSent,
        generatedAt: new Date().toISOString(),
        fileSize: fileBuffer.length,
      },
    };

    // If not saving to storage and not sending email, return file directly
    if (!body.saveToStorage && !body.sendEmail) {
      return new NextResponse(fileBuffer as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
          'Content-Length': fileBuffer.length.toString(),
          'X-Quotation-Number': quotation.quotation_number,
        },
      });
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Quotation export POST error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
