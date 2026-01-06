/**
 * Save Local Signature API
 *
 * POST /api/signature/local/save
 *
 * Saves a locally captured signature (from canvas or hanko upload)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { signatureToBase64, isValidSignatureData } from '@/lib/signature-integration';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createServiceClient();
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: '認証が必要です (Authentication required)' },
        { status: 401 }
      );
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '無効なトークンです (Invalid token)' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      signatureId,
      signatureType, // 'handwritten' | 'hanko'
      signatureData, // Base64 encoded image
      documentId,
      ipAddress,
      userAgent,
    } = body;

    // Validate required fields
    if (!signatureId || !signatureType || !signatureData) {
      return NextResponse.json(
        { success: false, error: '必須項目が不足しています (Missing required fields)' },
        { status: 400 }
      );
    }

    // Validate signature type
    if (!['handwritten', 'hanko'].includes(signatureType)) {
      return NextResponse.json(
        { success: false, error: '署名タイプが無効です (Invalid signature type)' },
        { status: 400 }
      );
    }

    // Validate signature data
    if (!isValidSignatureData(signatureData)) {
      return NextResponse.json(
        { success: false, error: '署名データが無効です (Invalid signature data)' },
        { status: 400 }
      );
    }

    // Convert signature to base64
    const base64Signature = signatureToBase64(signatureData);

    // Update signature record
    const { data: updatedSignature, error: updateError } = await (supabase as any)
      .from('signatures')
      .update({
        status: 'signed',
        signature_type: signatureType,
        signature_data: {
          type: signatureType,
          [signatureType === 'handwritten' ? 'handwritten' : 'hanko']: {
            signatureImageUrl: `data:image/png;base64,${base64Signature}`,
            canvasWidth: body.canvasWidth || 500,
            canvasHeight: body.canvasHeight || 200,
            strokeCount: body.strokeCount || 0,
            signingDuration: body.signingDuration || 0,
          },
          metadata: {
            signedAt: new Date().toISOString(),
            ipAddress: ipAddress || request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: userAgent || request.headers.get('user-agent') || 'unknown',
          },
        },
        signed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', signatureId)
      .select()
      .single();

    if (updateError) {
      console.error('[Local Save API] Database error:', updateError);
      return NextResponse.json(
        { success: false, error: '署名保存に失敗しました (Failed to save signature)' },
        { status: 500 }
      );
    }

    // Log signature event for audit trail
    await (supabase as any).from('signature_events').insert({
      envelope_id: signatureId,
      provider: 'local',
      event: 'signature_saved',
      metadata: {
        userId: user.id,
        signatureType,
        ipAddress,
        timestamp: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      signatureId: updatedSignature.id,
      status: updatedSignature.status,
      signedAt: updatedSignature.signed_at,
      message: '署名を保存しました (Signature saved successfully)',
    });
  } catch (error) {
    console.error('[Local Save API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '署名保存中にエラーが発生しました',
      },
      { status: 500 }
    );
  }
}

/**
 * Upload hanko image
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createServiceClient();
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: '認証が必要です (Authentication required)' },
        { status: 401 }
      );
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '無効なトークンです (Invalid token)' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const hankoName = formData.get('hankoName') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '画像ファイルが必要です (Image file required)' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: '許可された画像形式: PNG, JPEG, WebP' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'ファイルサイズは5MB以下にしてください' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    // Save hanko to storage or database
    // For demo, we'll just return the base64 data
    return NextResponse.json({
      success: true,
      hankoImageUrl: `data:${file.type};base64,${base64}`,
      hankoName,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('[Hanko Upload API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'はんこアップロード中にエラーが発生しました',
      },
      { status: 500 }
    );
  }
}
