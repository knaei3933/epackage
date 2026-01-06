/**
 * Send Document for Signature API
 *
 * POST /api/signature/send
 *
 * Sends a document for electronic signature through configured provider
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSignatureIntegration, SignatureRequest } from '@/lib/signature-integration';
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
    const {
      documentId,
      documentName,
      documentContent,
      documentType,
      signers,
      subject,
      message,
      expiresAt,
      signatureType,
      provider,
    } = body;

    // Validate required fields
    if (!documentId || !documentName || !documentContent || !signers || signers.length === 0) {
      return NextResponse.json(
        { success: false, error: '必須項目が不足しています (Missing required fields)' },
        { status: 400 }
      );
    }

    // Validate signers array
    if (!Array.isArray(signers)) {
      return NextResponse.json(
        { success: false, error: '署名者リストが無効です (Invalid signers list)' },
        { status: 400 }
      );
    }

    // Validate each signer
    for (const signer of signers) {
      if (!signer.email || !signer.name || typeof signer.order !== 'number') {
        return NextResponse.json(
          { success: false, error: '各署名者のメールアドレス、名前、順序は必須です (Email, name, and order are required for each signer)' },
          { status: 400 }
        );
      }
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const signer of signers) {
      if (!emailRegex.test(signer.email)) {
        return NextResponse.json(
          { success: false, error: `${signer.email}は無効なメールアドレス形式です` },
          { status: 400 }
        );
      }
    }

    // Create signature request
    const signatureRequest: SignatureRequest = {
      document: {
        id: documentId,
        name: documentName,
        content: documentContent,
        type: documentType || 'pdf',
        metadata: body.documentMetadata,
      },
      signers: signers.map((s: any) => ({
        email: s.email,
        name: s.name,
        order: s.order,
        role: s.role || 'signer',
        language: s.language || 'ja',
      })),
      subject: subject || '署名をお願いいたします (Please sign this document)',
      message: message || '',
      expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      signatureType: signatureType || 'handwritten',
    };

    // Get provider from request or use best available
    const providerName = provider || getBestProvider();

    // Create signature integration
    const signatureIntegration = new (await import('@/lib/signature-integration')).SignatureIntegration(
      providerName
    );

    // Send for signature
    const result = await signatureIntegration.sendForSignature(signatureRequest);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || '署名送信に失敗しました (Failed to send for signature)',
        },
        { status: 500 }
      );
    }

    // Save signature record to database
    if (result.envelopeId) {
      const { error: dbError } = await (supabase as any)
        .from('signatures')
        .insert({
          id: result.envelopeId,
          document_id: documentId,
          provider: result.provider || providerName,
          envelope_id: result.envelopeId,
          status: result.status || 'pending',
          signers: signers,
          signature_type: signatureType || 'handwritten',
          subject,
          message,
          created_by: user.id,
          expires_at: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (dbError) {
        console.error('[Signature API] Database error:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      envelopeId: result.envelopeId,
      status: result.status,
      signingUrl: result.signingUrl,
      provider: result.provider,
    });
  } catch (error) {
    console.error('[Signature API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '署名送信中にエラーが発生しました',
      },
      { status: 500 }
    );
  }
}

function getBestProvider(): 'docusign' | 'hellosign' | 'local' {
  if (process.env.DOCUSIGN_CLIENT_ID && process.env.DOCUSIGN_CLIENT_SECRET) {
    return 'docusign';
  }
  if (process.env.HELLOSIGN_API_KEY) {
    return 'hellosign';
  }
  return 'local';
}
