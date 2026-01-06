/**
 * Check Signature Status API
 *
 * GET /api/signature/status/[id]
 *
 * Checks the current status of a signature request
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSignatureIntegration } from '@/lib/signature-integration';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: envelopeId } = await context.params;

    if (!envelopeId) {
      return NextResponse.json(
        { success: false, error: 'エンベロープIDが必要です (Envelope ID required)' },
        { status: 400 }
      );
    }

    // Get provider from query parameter or default to best available
    const searchParams = request.nextUrl.searchParams;
    const provider = (searchParams.get('provider') as 'docusign' | 'hellosign' | 'local') || undefined;

    // Create signature integration
    const signatureIntegration = new (await import('@/lib/signature-integration')).SignatureIntegration(
      provider
    );

    // Check status
    const status = await signatureIntegration.checkStatus(envelopeId);

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('[Signature Status API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'ステータス確認中にエラーが発生しました',
      },
      { status: 500 }
    );
  }
}
