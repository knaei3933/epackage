/**
 * Cancel Signature Request API
 *
 * POST /api/signature/cancel
 *
 * Cancels an active signature request
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSignatureIntegration } from '@/lib/signature-integration';
import { createServiceClient } from '@/lib/supabase';

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
    const { envelopeId, provider, reason } = body;

    // Validate required fields
    if (!envelopeId) {
      return NextResponse.json(
        { success: false, error: 'エンベロープIDが必要です (Envelope ID required)' },
        { status: 400 }
      );
    }

    // Verify user has permission to cancel this signature
    const { data: signature, error: fetchError } = await supabase
      .from('signatures')
      .select('*')
      .eq('envelope_id', envelopeId)
      .single();

    if (fetchError || !signature) {
      return NextResponse.json(
        { success: false, error: '署名リクエストが見つかりません (Signature request not found)' },
        { status: 404 }
      );
    }

    const signatureTyped = signature as any;

    // Check if user is the creator or admin
    if (signatureTyped.created_by !== user.id) {
      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const profileTyped = profile as any;

      if (!profileTyped || profileTyped.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'この署名をキャンセルする権限がありません (No permission to cancel this signature)' },
          { status: 403 }
        );
      }
    }

    // Create signature integration
    const signatureIntegration = new (await import('@/lib/signature-integration')).SignatureIntegration(
      provider || signatureTyped.provider
    );

    // Cancel signature
    await signatureIntegration.cancelSignature(envelopeId);

    // Update database record
    const { error: updateError } = await (supabase as any)
      .from('signatures')
      .update({
        status: 'cancelled',
        cancel_reason: reason || 'Cancelled by user',
        updated_at: new Date().toISOString(),
      })
      .eq('envelope_id', envelopeId);

    if (updateError) {
      console.error('[Cancel API] Database update error:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: '署名リクエストをキャンセルしました (Signature request cancelled)',
    });
  } catch (error) {
    console.error('[Cancel API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'キャンセル中にエラーが発生しました',
      },
      { status: 500 }
    );
  }
}
