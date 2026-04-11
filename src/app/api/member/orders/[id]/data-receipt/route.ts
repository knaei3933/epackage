/**
 * Order Data Receipt File Upload API (Member Portal)
 *
 * Task P2-12: Order data receipt file upload
 * - POST: Upload production data files (AI, EPS, PDF) to Google Drive
 * - GET: List uploaded files for an order
 * - Uses security-validator for comprehensive file validation
 * - Saves file metadata to database (files table)
 * - Supports files up to 10MB
 *
 * @route /api/member/orders/[id]/data-receipt
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServiceClient } from '@/lib/supabase';
import { quickValidateFile } from '@/lib/file-validator/security-validator';
import { notifyDataReceipt } from '@/lib/admin-notifications';
import { notifyDataReceived as notifyDataReceivedEmail, notifyPartialSKUSubmission } from '@/lib/email/order-status-emails';
import { sendDesignerDataUploadNotificationBatch } from '@/lib/email/designer-emails';
import {
  getAdminAccessTokenForUpload,
  uploadFileToDrive,
  getUploadFolderId
} from '@/lib/google-drive';
import { generateUploadToken } from '@/lib/designer-tokens';

export const dynamic = 'force-dynamic';

// =====================================================
// Helper: Get Supabase client
// =====================================================

async function getSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(_name: string, _value: string, _options: unknown) {
        // We'll use response object later if needed
      },
      remove(_name: string, _options: unknown) {
        // Cookie removal if needed
      },
    },
  });
}

// =====================================================
// Types
// =====================================================

interface DataReceiptUploadResponse {
  success: boolean;
  data?: {
    id: string;
    file_name: string;
    file_type: string;
    file_url: string;
    uploaded_at: string;
    validation_status: string;
    extraction_job_id?: string;
  };
  error?: string;
  errorEn?: string;
  code?: string;
}

// =====================================================
// Constants
// =====================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Admin roles that can access any order
const ADMIN_ROLES = ['ADMIN', 'OPERATOR', 'SALES', 'ACCOUNTING'];

// =====================================================
// Helper Functions
// =====================================================

/**
 * Check if user has admin role
 */
async function checkAdminRole(
  supabase: any,
  userId: string
): Promise<boolean> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    return profile?.role && ADMIN_ROLES.includes(profile.role);
  } catch (error) {
    console.error('[checkAdminRole] Error:', error);
    return false;
  }
}

// File type mapping for database enum
const FILE_TYPE_MAP: Record<string, 'AI' | 'PDF' | 'PSD' | 'PNG' | 'JPG' | 'EXCEL' | 'OTHER'> = {
  'application/pdf': 'PDF',
  'application/postscript': 'OTHER',
  'image/x-eps': 'OTHER',
  'application/illustrator': 'AI',
  'application/photoshop': 'PSD',
  'image/vnd.adobe.photoshop': 'PSD',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'PNG',
  'application/vnd.ms-excel': 'EXCEL',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'EXCEL',
};

/**
 * Get file type enum from MIME type
 */
function getFileType(mimeType: string): 'AI' | 'PDF' | 'PSD' | 'PNG' | 'JPG' | 'EXCEL' | 'OTHER' {
  return FILE_TYPE_MAP[mimeType] || 'OTHER';
}

// ============================================================
// POST Handler - Upload Data Receipt File to Google Drive
// ============================================================

/**
 * POST /api/member/orders/[id]/data-receipt
 * Upload production data files for an order to Google Drive
 *
 * Request FormData:
 * - file: File to upload
 * - description: Optional description
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "data": { ...fileInfo }
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('[Data Receipt Upload] ===== POST handler started =====');
  try {
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // 1. Authenticate user using SSR client
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(_name: string, _value: string, _options: unknown) {},
        remove(_name: string, _options: unknown) {},
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      console.error('[Data Receipt Upload] Auth error:', userError?.message);
      return NextResponse.json(
        {
          error: '認証されていません。',
          errorEn: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const userId = user.id;
    const { id: orderId } = await params;

    // For admins, use service role client to bypass RLS
    const adminClient = createServiceClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    const isAdmin = profile?.role && ADMIN_ROLES.includes(profile.role);
    const dataClient = isAdmin ? adminClient : supabase;

    // 2. Verify order exists
    const { data: order, error: orderError } = await dataClient
      .from('orders')
      .select('id, user_id, status, order_number, customer_name')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          error: '注文が見つかりません。',
          errorEn: 'Order not found',
          code: 'ORDER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // 3. Check user permissions (owner or admin)
    if (order.user_id !== userId && !isAdmin) {
      return NextResponse.json(
        {
          error: 'この注文にアクセスする権限がありません。',
          errorEn: 'Access denied',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    // 4. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string | null;
    const productName = formData.get('product_name') as string | null;
    const orderItemId = formData.get('order_item_id') as string | null;

    if (!file) {
      return NextResponse.json(
        {
          error: 'ファイルが選択されていません。',
          errorEn: 'No file provided',
          code: 'NO_FILE',
        },
        { status: 400 }
      );
    }

    // Validate product name is required
    if (!productName || !productName.trim()) {
      return NextResponse.json(
        {
          error: '製品名を入力してください。',
          errorEn: 'Product name is required',
          code: 'NO_PRODUCT_NAME',
        },
        { status: 400 }
      );
    }

    // 5. Validate file security using security-validator
    const validationResult = await quickValidateFile(file, MAX_FILE_SIZE);

    if (!validationResult.isValid) {
      const firstError = validationResult.errors[0];
      return NextResponse.json(
        {
          error: firstError?.message_ja || 'ファイルの検証に失敗しました。',
          errorEn: firstError?.message_en || 'File validation failed',
          code: firstError?.code || 'VALIDATION_ERROR',
          details: validationResult.errors,
        },
        { status: 400 }
      );
    }

    // Log warnings if any
    if (validationResult.warnings.length > 0) {
      console.warn('[Data Receipt Upload] File validation warnings:', validationResult.warnings);
    }

    // ============================================================
    // 6. Upload to Google Drive
    // ============================================================
    console.log('[Data Receipt Upload] ===== Starting Google Drive upload =====');

    // Declare variables outside try block for proper scope
    let driveFileName: string;
    let googleDriveFile: { id: string; webViewLink: string; webContentLink: string; name: string };

    try {
      // Get admin's access token for Google Drive
      console.log('[Data Receipt Upload] Getting admin access token...');
      const accessToken = await getAdminAccessTokenForUpload();
      console.log('[Data Receipt Upload] Access token obtained successfully');

      // Get upload folder ID
      const uploadFolderId = getUploadFolderId();
      if (!uploadFolderId) {
        return NextResponse.json(
          {
            error: 'Google Driveフォルダが設定されていません。',
            errorEn: 'Google Drive folder not configured',
            code: 'NO_DRIVE_FOLDER',
          },
          { status: 500 }
        );
      }

      // Generate file name: {製品名}_入稿データ_{注文番号}_{日付}
      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      // 日本語、韓国語、中国語を含むUTF-8文字を許可
      const sanitizedProductName = productName.trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
      driveFileName = `${sanitizedProductName}_入稿データ_${order.order_number}_${dateStr}${file.name.substring(file.name.lastIndexOf('.'))}`;

      console.log('[Data Receipt Upload] Generated file name:', driveFileName);

      // Upload to Google Drive
      const uploadedFile = await uploadFileToDrive(
        file,
        driveFileName,
        file.type || 'application/octet-stream',
        uploadFolderId,
        accessToken
      );

      googleDriveFile = {
        id: uploadedFile.id,
        webViewLink: uploadedFile.webViewLink,
        webContentLink: uploadedFile.webContentLink,
        name: uploadedFile.name,
      };

      console.log('[Data Receipt Upload] File uploaded to Google Drive:', googleDriveFile.id);
    } catch (driveError) {
      console.error('[Data Receipt Upload] Google Drive upload error:', driveError);
      return NextResponse.json(
        {
          error: 'Google Driveへのアップロードに失敗しました。',
          errorEn: 'Failed to upload to Google Drive',
          code: 'DRIVE_UPLOAD_ERROR',
          details: driveError instanceof Error ? driveError.message : String(driveError),
        },
        { status: 500 }
      );
    }

    // ============================================================
    // 7. Create file record in database (files table)
    // ============================================================
    const fileType = getFileType(file.type);

    // Always use adminClient for file record insertion (bypasses RLS)
    const { data: fileRecord, error: dbError } = await adminClient
      .from('files')
      .insert({
        order_id: orderId,
        order_item_id: orderItemId || null,  // NEW
        file_type: fileType,
        original_filename: driveFileName, // Use Google Drive file name
        file_url: googleDriveFile.webViewLink,
        file_path: googleDriveFile.id, // Store Google Drive file ID
        file_size_bytes: file.size,
        uploaded_by: userId,
        validation_status: 'PENDING',
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Data Receipt Upload] Database insert error:', dbError);
      console.error('[Data Receipt Upload] Error details:', JSON.stringify(dbError, null, 2));
      console.error('[Data Receipt Upload] Insert data:', {
        order_id: orderId,
        file_type: fileType,
        original_filename: driveFileName,
        uploaded_by: userId,
      });
      return NextResponse.json(
        {
          error: 'ファイルレコードの作成に失敗しました。',
          errorEn: 'Failed to create file record',
          code: 'DB_ERROR',
          details: dbError.message,
        },
        { status: 500 }
      );
    }

    // ============================================================
    // 8. Log upload to order_file_uploads table
    // ============================================================
    try {
      await adminClient
        .from('order_file_uploads')
        .insert({
          order_id: orderId,
          file_name: driveFileName,  // Use Google Drive filename
          file_type: 'upload',
          drive_file_id: googleDriveFile.id,
          drive_view_link: googleDriveFile.webViewLink,
          drive_content_link: googleDriveFile.webContentLink,
          drive_file_name: driveFileName,  // Store the actual Google Drive filename
          uploaded_at: new Date().toISOString(),
        });
    } catch (logError) {
      console.error('[Data Receipt Upload] Failed to log file upload:', logError);
      // Don't fail the upload if logging fails
    }

    // ============================================================
    // 9. Trigger AI extraction for eligible file types
    // ============================================================
    let extractionJobId: string | null = null;
    const eligibleFileTypes = ['AI', 'PDF', 'PSD'];

    if (eligibleFileTypes.includes(fileType)) {
      try {
        console.log('[Data Receipt Upload] Triggering AI extraction for file:', fileRecord.id);

        const dataType = fileType === 'AI' ? 'design_file' : 'production_data';

        // Call AI extraction API internally
        const extractionApiUrl = new URL('/api/ai-parser/extract', request.url);
        const extractionFormData = new FormData();
        extractionFormData.append('file', file);
        extractionFormData.append('order_id', orderId);
        extractionFormData.append('data_type', dataType);

        const extractionResponse = await fetch(extractionApiUrl.toString(), {
          method: 'POST',
          body: extractionFormData,
        });

        if (extractionResponse.ok) {
          const extractionResult = await extractionResponse.json();
          extractionJobId = extractionResult.data?.file_id || fileRecord.id;
          console.log('[Data Receipt Upload] AI extraction started successfully:', extractionJobId);
        } else {
          console.error('[Data Receipt Upload] AI extraction API returned error:', extractionResponse.status);
        }
      } catch (extractionError) {
        console.error('[Data Receipt Upload] Failed to trigger AI extraction:', extractionError);
      }
    }

    // ============================================================
    // 10. Create admin notification and send email
    // ============================================================
    try {
      // 管理者への通知
      await notifyDataReceipt(
        orderId,
        order.order_number,
        order.customer_name || 'お客様',
        file.name,
        fileType
      );

      // 顧客へ受領確認メールを送信
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://package-lab.com';
        const customerEmail = user.email;

        if (customerEmail) {
          await notifyDataReceivedEmail(
            {
              orderId,
              orderNumber: order.order_number,
              customerEmail,
              customerName: order.customer_name || 'お客様',
              viewUrl: `${baseUrl}/member/orders/${orderId}`,
            },
            file.name
          );

          console.log('[Data Receipt Upload] Customer notification email sent:', {
            orderId: order.order_number,
            email: customerEmail,
            fileName: file.name,
          });
        } else {
          console.warn('[Data Receipt Upload] No customer email found, skipping email notification');
        }
      } catch (emailError) {
        console.error('[Data Receipt Upload] Customer email notification failed:', emailError);
      }

      // ============================================================
      // 韓国デザイナーへ通知メールを送信
      // ============================================================
      try {
        // notification_settingsテーブルからデザイナーメールアドレスを取得
        const { data: notificationSettings, error: settingsError } = await adminClient
          .from('notification_settings')
          .select('value')
          .eq('key', 'korea_designer_emails')
          .maybeSingle();

        if (settingsError) {
          console.error('[Data Receipt Upload] Failed to fetch designer emails:', settingsError);
        } else if (notificationSettings?.value) {
          // JSONB配列からメールアドレスを抽出
          const designerEmails: string[] = Array.isArray(notificationSettings.value)
            ? notificationSettings.value
            : [];

          if (designerEmails.length > 0) {
            // ============================================================
            // Get or create designer task assignment with access token
            // ============================================================
            let taskAssignment = await adminClient
              .from('designer_task_assignments')
              .select('id, access_token_hash, access_token_expires_at')
              .eq('order_id', orderId)
              .maybeSingle();

            let accessToken: string | undefined;

            if (!taskAssignment.data) {
              // No assignment exists - create one
              console.log('[Data Receipt Upload] Creating designer task assignment...');

              // Get any active profile as placeholder
              const { data: anyProfile } = await adminClient
                .from('profiles')
                .select('id')
                .eq('status', 'ACTIVE')
                .limit(1)
                .maybeSingle();

              if (anyProfile) {
                const { error: insertError } = await adminClient
                  .from('designer_task_assignments')
                  .insert({
                    designer_id: anyProfile.id,
                    order_id: orderId,
                    assigned_by: anyProfile.id,
                    status: 'in_progress',
                  })
                  .select('id')
                  .single();

                if (!insertError) {
                  const { data: newAssignment } = await adminClient
                    .from('designer_task_assignments')
                    .select('id')
                    .eq('order_id', orderId)
                    .single();
                  taskAssignment = { data: newAssignment };
                }
              }
            }

            // Generate new access token
            if (taskAssignment.data) {
              const { rawToken, tokenHash, expiresAt } = generateUploadToken(30);

              await adminClient
                .from('designer_task_assignments')
                .update({
                  access_token_hash: tokenHash,
                  access_token_expires_at: expiresAt.toISOString(),
                })
                .eq('id', taskAssignment.data.id);

              accessToken = rawToken;
              console.log('[Data Receipt Upload] Generated access token for designer');
            }

            // ============================================================
            // Fetch order items with specifications
            // ============================================================
            const { data: orderItems } = await adminClient
              .from('order_items')
              .select('id, product_name, specifications')
              .eq('order_id', orderId);

            // ============================================================
            // Translate specifications to Korean
            // ============================================================
            const translateSpecs = (specs: any) => {
              if (!specs) return undefined;

              // Get material specification from actual data or use defaults
              const materialSpec = specs.material_specification ||
                (specs.materialId === 'pet_al' ? 'PET 12μ + AL 7μ + PET 12μ + LLDPE 70μ' :
                 specs.materialId === 'pet_ldpe' ? 'PET 12μ + LLDPE 70μ' :
                 specs.materialId === 'ny_lldpe' ? 'NY 15μ + LLDPE 70μ' :
                 specs.materialId === 'pet_vmpet' ? 'PET 12μ + VMPET 12μ + PET 12μ + LLDPE 90μ' :
                 specs.materialId === 'pet_ny_al' ? 'PET 12μ + NY 16μ + AL 7μ + LLDPE 90μ' :
                 specs.materialId === 'kraft_vmpet_lldpe' ? 'Kraft 50g/m² + VMPET 12μ + LLDPE 90μ' :
                 specs.materialId === 'kraft_pet_lldpe' ? 'Kraft 50g/m² + PET 12μ + LLDPE 70μ' :
                 undefined);

              return {
                dimensions: specs.dimensions,
                bagType: specs.bagTypeId === 'stand_up' ? '스탠드 파우치' :
                         specs.bagTypeId === 'flat_3_side' ? '플랫 파우치' : specs.bagTypeId,
                material: specs.materialId === 'pet_al' ? 'PET/AL (알루미늄 박 라미네이트)' :
                          specs.materialId === 'pet' ? 'PET' : specs.materialId,
                materialDetail: materialSpec,
                weight: specs.thicknessSelection === 'medium' ? '~500g' :
                         specs.thicknessSelection === 'light' ? '~300g' :
                         specs.thicknessSelection === 'heavy' ? '~1kg' : undefined,
                thickness: specs.thicknessSelection === 'medium' ? '표준 타입 (~500g)' :
                           specs.thicknessSelection === 'light' ? '경량 (~300g)' :
                           specs.thicknessSelection === 'heavy' ? '중량 (~1kg)' : undefined,
                thicknessDetail: materialSpec,
                printingType: specs.printingType === 'digital' ? '디지털 인쇄 (풀 컬러)' :
                              specs.printingType === 'gravure' ? '그라비아 인쇄 (풀 컬러)' : specs.printingType,
                colors: specs.printingColors === 4 ? '풀 컬러' :
                        specs.printingColors === 1 ? '1색' :
                        specs.printingColors === 2 ? '2색' : '풀 컬러',
                urgency: specs.urgency === 'standard' ? '표준' :
                          specs.urgency === 'urgent' ? '긴급' :
                          specs.urgency === 'express' ? '특급' : specs.urgency,
                deliveryLocation: specs.deliveryLocation === 'domestic' ? '국내' :
                                  specs.deliveryLocation === 'international' ? '해외' : specs.deliveryLocation,
                sealWidth: specs.sealWidth ? `${specs.sealWidth}mm` :
                          (specs.postProcessingOptions || []).find((opt: string) => opt.startsWith('sealing-width-'))
                            ?.replace('sealing-width-', '')?.replace('-', '.') + 'mm' || undefined,
                postProcessing: specs.postProcessingOptions
                  ?.filter((opt: string) => !opt.startsWith('sealing-width-'))
                  .map((opt: string) => {
                    const map: Record<string, string> = {
                      'corner-round': '모서리 둥글게',
                      'glossy': '광택 처리',
                      'matte': '무광 처리',
                      'hang-hole-6mm': '걸이 구멍 6mm',
                      'hang-hole-4mm': '걸이 구멍 4mm',
                      'machi-printing-yes': '마치 인쇄 있음',
                      'machi-printing-no': '마치 인쇄 없음',
                      'notch-yes': 'V 노치',
                      'notch-no': 'V 노치 없음',
                      'top-open': '상단 개봉',
                      'bottom-open': '하단 개봉',
                      'side-open': '측면 개봉',
                      'valve-yes': '밸브 있음',
                      'valve-no': '밸브 없음',
                      'zipper-yes': '지퍼 있음',
                      'zipper-no': '지퍼 없음',
                    };
                    return map[opt] || opt;
                  }),
              };
            };

            const specs = orderItems && orderItems.length > 0 ? orderItems[0].specifications : undefined;
            const translatedSpecs = specs ? translateSpecs(specs) : undefined;

            // ============================================================
            // Send notification with specs and token
            // ============================================================
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://package-lab.com';
            const uploadedAt = new Date().toLocaleString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            });

            const results = await sendDesignerDataUploadNotificationBatch(
              designerEmails,
              {
                orderNumber: order.order_number,
                customerName: order.customer_name || '고객',
                fileName: file.name,
                fileType: fileType,
                uploadUrl: `${baseUrl}/member/orders/${orderId}`, // Fallback URL
                uploadedAt,
                productName: productName || (orderItems && orderItems.length > 0 ? orderItems[0].product_name : undefined),
                specifications: translatedSpecs,
                // Use token-based URL for Korean designers
                useTokenUrl: !!accessToken,
                accessToken: accessToken,
              }
            );

            // 結果をログ
            const successCount = results.filter(r => r.success).length;
            const failCount = results.filter(r => !r.success).length;

            console.log('[Data Receipt Upload] Designer notification results:', {
              total: results.length,
              success: successCount,
              failed: failCount,
              hasToken: !!accessToken,
              hasSpecs: !!translatedSpecs,
            });

            // 失敗したメールの詳細をログ
            results.forEach(result => {
              if (!result.success) {
                console.error(`[Data Receipt Upload] Failed to send notification to ${result.email}:`, result.error);
              }
            });
          } else {
            console.log('[Data Receipt Upload] No designer emails configured, skipping designer notification');
          }
        } else {
          console.log('[Data Receipt Upload] No notification settings found for korea_designer_emails');
        }
      } catch (designerEmailError) {
        console.error('[Data Receipt Upload] Designer email notification failed:', designerEmailError);
      }

      // ============================================================
      // Check for partial SKU submission and send warning email
      // ============================================================
      let isAllSkuCompleted = false;
      let totalSkus = 0;
      let submittedSkus = 0;

      try {
        // Get all order items and current files to calculate SKU submission status
        const [orderItemsResult, filesResult] = await Promise.all([
          adminClient
            .from('order_items')
            .select('id, product_name, quantity')
            .eq('order_id', orderId),
          adminClient
            .from('files')
            .select('order_item_id')
            .eq('order_id', orderId)
        ]);

        const orderItems = orderItemsResult.data || [];
        const files = filesResult.data || [];
        totalSkus = orderItems.length;

        // Calculate SKU submission status
        const filesWithItems = files.filter(f => f.order_item_id);
        const uniqueSubmittedSkus = new Set(filesWithItems.map(f => f.order_item_id));
        submittedSkus = uniqueSubmittedSkus.size;
        const pendingSkus = orderItems.filter(item => !uniqueSubmittedSkus.has(item.id));

        // Check if all SKUs have been uploaded
        isAllSkuCompleted = orderItems.length > 0 && uniqueSubmittedSkus.size === orderItems.length;

        console.log('[Data Receipt Upload] SKU submission status:', {
          totalSkus: orderItems.length,
          submittedSkus: uniqueSubmittedSkus.size,
          isAllSkuCompleted,
          pendingSkus: pendingSkus.length,
        });

        // Send warning email for partial submission
        if (orderItems.length > 1 && pendingSkus.length > 0) {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://package-lab.com';
          const customerEmail = user.email;

          if (customerEmail) {
            await notifyPartialSKUSubmission(
              {
                orderId,
                orderNumber: order.order_number,
                customerEmail,
                customerName: order.customer_name || 'お客様',
                viewUrl: `${baseUrl}/member/orders/${orderId}`,
              },
              {
                totalSkus: orderItems.length,
                submittedSkus: uniqueSubmittedSkus.size,
                pendingSkus: pendingSkus.map(item => ({
                  id: item.id,
                  productName: item.product_name,
                  quantity: item.quantity,
                })),
              }
            );

            console.log('[Data Receipt Upload] Partial SKU submission warning email sent:', {
              orderId: order.order_number,
              email: customerEmail,
              submittedSkus: uniqueSubmittedSkus.size,
              totalSkus: orderItems.length,
            });
          }
        }
      } catch (skuCheckError) {
        console.error('[Data Receipt Upload] Partial SKU check failed:', skuCheckError);
        // Don't fail the upload if this check fails
      }

      // ============================================================
      // Auto-transition: DATA_UPLOAD_PENDING → CORRECTION_IN_PROGRESS
      // Only transition when ALL SKUs have been uploaded
      // ============================================================
      if (order.status === 'DATA_UPLOAD_PENDING' && isAllSkuCompleted) {
        console.log('[Data Receipt Upload] Auto-transition: DATA_UPLOAD_PENDING → CORRECTION_IN_PROGRESS');
        console.log('[Data Receipt Upload] All SKUs completed:', { totalSkus, submittedSkus });

        const currentStatus = order.status;

        const { error: updateError } = await adminClient
          .from('orders')
          .update({
            status: 'CORRECTION_IN_PROGRESS',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        if (updateError) {
          console.error('[Data Receipt Upload] Status update error (CORRECTION_IN_PROGRESS):', updateError);
        } else {
          console.log('[Data Receipt Upload] Auto-transition completed to CORRECTION_IN_PROGRESS');

          // 履歴を記録
          await adminClient
            .from('order_status_history')
            .insert({
              order_id: orderId,
              from_status: currentStatus,
              to_status: 'CORRECTION_IN_PROGRESS',
              changed_by: 'SYSTEM',
              changed_at: new Date().toISOString(),
              reason: `全SKUデータ入稿完了（${totalSkus}個）による自動遷移`,
            })
            .then(() => console.log('[Data Receipt Upload] Status history logged'))
            .catch((err) => console.error('[Data Receipt Upload] History logging error:', err));
        }
      } else if (order.status === 'DATA_UPLOAD_PENDING' && !isAllSkuCompleted) {
        console.log('[Data Receipt Upload] Waiting for all SKUs to complete:', {
          totalSkus,
          submittedSkus,
          remaining: totalSkus - submittedSkus,
        });
      }
    } catch (notifyError) {
      console.error('[Data Receipt Upload] Notification error:', notifyError);
    }

    // ============================================================
    // 11. Prepare response
    // ============================================================
    const response: DataReceiptUploadResponse = {
      success: true,
      data: {
        id: fileRecord.id,
        file_name: fileRecord.original_filename,
        file_type: fileRecord.file_type.toLowerCase(),
        file_url: fileRecord.file_url,
        uploaded_at: fileRecord.uploaded_at,
        validation_status: fileRecord.validation_status,
      },
    };

    if (extractionJobId) {
      response.data.extraction_job_id = extractionJobId;
    }

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Data Receipt Upload] Unexpected error:', error);

    return NextResponse.json(
      {
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// =====================================================
// GET Handler - List Data Receipt Files
// =====================================================

/**
 * GET /api/member/orders/[id]/data-receipt
 * Get list of uploaded data receipt files for an order
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "data": { files: [...] }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user using SSR client
    const supabase = await getSupabaseClient(request);

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      console.error('[Data Receipt GET] Auth error:', userError?.message);
      return NextResponse.json(
        {
          error: '認証されていません。',
          errorEn: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const userId = user.id;
    const { id: orderId } = await params;

    // For admins, use service role client to bypass RLS
    const adminClient = createServiceClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    const isAdmin = profile?.role && ADMIN_ROLES.includes(profile.role);
    const dataClient = isAdmin ? adminClient : supabase;

    // 2. Verify order exists
    const { data: order } = await dataClient
      .from('orders')
      .select('id, user_id')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json(
        {
          error: '注文が見つかりません。',
          errorEn: 'Order not found',
        },
        { status: 404 }
      );
    }

    // 3. Check user permissions (owner or admin)
    if (order.user_id !== userId && !isAdmin) {
      return NextResponse.json(
        {
          error: 'アクセス権限がありません。',
          errorEn: 'Access denied',
        },
        { status: 403 }
      );
    }

    // 4. Get files AND order items for this order in parallel
    const [filesResult, orderItemsResult] = await Promise.all([
      dataClient
        .from('files')
        .select('*')
        .eq('order_id', orderId)
        .order('uploaded_at', { ascending: false }),
      dataClient
        .from('order_items')
        .select('id, product_name, quantity, specifications')
        .eq('order_id', orderId),
    ]);

    if (filesResult.error) {
      console.error('[Data Receipt GET] Get files error:', filesResult.error);
    }

    // 5. Transform to expected format
    type OrderItemType = { id: string; product_name: string; quantity: number; specifications?: any };
    const orderItemsMap = new Map<string, OrderItemType>(
      (orderItemsResult.data || []).map(item => [item.id, item as OrderItemType])
    );

    const transformedFiles = (filesResult.data || []).map(file => {
      let skuName = null;
      if (file.order_item_id) {
        const item = orderItemsMap.get(file.order_item_id);
        if (item) {
          skuName = `${item.product_name} (${item.quantity}枚)`;
        }
      }

      return {
        id: file.id,
        file_name: file.original_filename || file.file_name,
        file_type: file.file_type.toLowerCase(),
        file_url: file.file_url,
        uploaded_at: file.uploaded_at || file.created_at,
        validation_status: file.validation_status,
        order_item_id: file.order_item_id,  // NEW
        sku_name: skuName,  // NEW: SKU name snapshot
      };
    });

    // Calculate SKU submission status
    const orderItems = (orderItemsResult.data || []) as Array<{ id: string; product_name: string; quantity: number }>;
    const filesWithItems = transformedFiles.filter(f => f.order_item_id);
    const uniqueSubmittedSkus = new Set(filesWithItems.map(f => f.order_item_id));

    const skuSubmissionStatus = {
      totalSkus: orderItems.length,
      submittedSkus: uniqueSubmittedSkus.size,
      isComplete: orderItems.length > 0 && uniqueSubmittedSkus.size === orderItems.length,
      pendingSkus: orderItems.filter(item => !uniqueSubmittedSkus.has(item.id)).map(item => ({
        id: item.id,
        productName: item.product_name,
        quantity: item.quantity,
      })),
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          files: transformedFiles,
          orderItems: orderItemsResult.data || [],  // NEW: For SKU selector
          skuSubmissionStatus,  // NEW: SKU submission tracking
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Data Receipt GET] Unexpected error:', error);

    return NextResponse.json(
      {
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// =====================================================
// OPTIONS Handler for CORS
// =====================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
