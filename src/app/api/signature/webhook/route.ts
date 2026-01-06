/**
 * Signature Webhook Handler
 *
 * POST /api/signature/webhook
 *
 * Receives webhook callbacks from signature providers (DocuSign, HelloSign)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyWebhookSignature } from '@/lib/signature-integration';
import {
  sendSignatureCompletedEmail,
  sendSignatureDeclinedEmail,
} from '@/lib/email';
import {
  DocuSignWebhookPayload,
  HelloSignWebhookPayload,
  SignatureSigner,
  isSignatureSigner,
} from '@/types/signature';
import type { Database } from '@/types/database';

// Type-safe update helper for signatures table
function updateSignatureStatus(supabase: ReturnType<typeof createServiceClient>, envelopeId: string, status: string, signedAt: string | null) {
  return (supabase as any)
    .from('signatures')
    .update({
      status: status as Database['public']['Tables']['signatures']['Row']['status'],
      updated_at: new Date().toISOString(),
      signed_at: signedAt,
    })
    .eq('envelope_id', envelopeId);
}

// Type-safe insert helper for signature_events table
function insertSignatureEvent(supabase: ReturnType<typeof createServiceClient>, envelopeId: string, provider: string, event: string, metadata: unknown) {
  return (supabase as any)
    .from('signature_events')
    .insert({
      envelope_id: envelopeId,
      provider: provider,
      event: event,
      metadata: metadata as Database['public']['Tables']['signature_events']['Insert']['metadata'],
      created_at: new Date().toISOString(),
    });
}

/**
 * DocuSign webhook handler
 */
async function handleDocuSignWebhook(payload: DocuSignWebhookPayload, headers: Headers) {
  const supabase = createServiceClient();

  // Verify signature (in production)
  const signature = headers.get('x-docusign-signature-1');
  if (signature && !verifyWebhookSignature('docusign', JSON.stringify(payload), signature)) {
    console.error('[DocuSign Webhook] Invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const envelopeId = payload.envelopeId;
  const status = payload.status;
  const event = payload.event;

  // Update signature status in database
  const { error: updateError } = await updateSignatureStatus(
    supabase,
    envelopeId,
    mapDocuSignStatus(status),
    ['completed', 'signed'].includes(status?.toLowerCase()) ? new Date().toISOString() : null
  );

  if (updateError) {
    console.error('[DocuSign Webhook] Database update error:', updateError);
  }

  // Log webhook event
  await insertSignatureEvent(supabase, envelopeId, 'docusign', event, payload);

  // Send notification based on status
  if (status === 'completed' || status === 'signed') {
    // Get signature details
    const { data: signature } = await (supabase as any)
      .from('signatures')
      .select('*')
      .eq('envelope_id', envelopeId)
      .single();

    if (signature) {
      // Send completion notification to all signers
      const signers = (signature.signers as unknown[]) || [];
      for (const signer of signers) {
        if (isSignatureSigner(signer)) {
          await sendSignatureCompletedEmail({
            documentTitle: signature.subject || '書類',
            envelopeId,
            completedAt: new Date().toISOString(),
            signers: signers.filter(isSignatureSigner).map((s: SignatureSigner) => ({
              name: s.name,
              email: s.email,
              signedAt: s.signedAt || new Date().toISOString(),
            })),
            documentUrl: signature.document_url || '',
          }, signer.email, signer.name);
        }
      }

      console.log('[DocuSign Webhook] Envelope completed:', envelopeId);
    }
  } else if (status === 'declined') {
    // Send decline notification to admin
    const { data: signature } = await (supabase as any)
      .from('signatures')
      .select('*')
      .eq('envelope_id', envelopeId)
      .single();

    if (signature) {
      const declinedBy = payload.declinedBy || {
        name: 'Unknown',
        email: 'unknown@example.com',
      };

      await sendSignatureDeclinedEmail({
        documentTitle: signature.subject || '書類',
        envelopeId,
        declinedBy: declinedBy.name || 'Unknown',
        declinedAt: new Date().toISOString(),
        reason: payload.declinedReason || '',
      });

      console.log('[DocuSign Webhook] Envelope declined:', envelopeId);
    }
  }

  return NextResponse.json({ success: true });
}

/**
 * HelloSign webhook handler
 */
async function handleHelloSignWebhook(payload: HelloSignWebhookPayload, headers: Headers) {
  const supabase = createServiceClient();

  // Verify signature (in production)
  const signature = headers.get('signature-hmac-sha256');
  if (signature && !verifyWebhookSignature('hellosign', JSON.stringify(payload), signature)) {
    console.error('[HelloSign Webhook] Invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const envelopeId = payload.signature_request?.signature_request_id || '';
  const event = payload.event?.event_type || '';

  // Update signature status in database
  const { error: updateError } = await updateSignatureStatus(
    supabase,
    envelopeId,
    mapHelloSignStatus(event),
    event === 'signature_request_all_signed' ? new Date().toISOString() : null
  );

  if (updateError) {
    console.error('[HelloSign Webhook] Database update error:', updateError);
  }

  // Log webhook event
  await insertSignatureEvent(supabase, envelopeId, 'hellosign', event, payload);

  // Send notification based on event
  if (event === 'signature_request_all_signed') {
    // Get signature details
    const { data: signature } = await (supabase as any)
      .from('signatures')
      .select('*')
      .eq('envelope_id', envelopeId)
      .single();

    if (signature) {
      // Send completion notification to all signers
      const signers = (signature.signers as unknown[]) || [];
      for (const signer of signers) {
        if (isSignatureSigner(signer)) {
          await sendSignatureCompletedEmail({
            documentTitle: signature.subject || '書類',
            envelopeId,
            completedAt: new Date().toISOString(),
            signers: signers.filter(isSignatureSigner).map((s: SignatureSigner) => ({
              name: s.name,
              email: s.email,
              signedAt: s.signedAt || new Date().toISOString(),
            })),
            documentUrl: signature.document_url || '',
          }, signer.email, signer.name);
        }
      }

      console.log('[HelloSign Webhook] All signed:', envelopeId);
    }
  } else if (event === 'signature_request_declined') {
    // Send decline notification to admin
    const { data: signature } = await (supabase as any)
      .from('signatures')
      .select('*')
      .eq('envelope_id', envelopeId)
      .single();

    if (signature) {
      const declinedBy = payload.signature_request?.declined_by || {
        name: 'Unknown',
        email: 'unknown@example.com',
      };

      await sendSignatureDeclinedEmail({
        documentTitle: signature.subject || '書類',
        envelopeId,
        declinedBy: declinedBy.name || 'Unknown',
        declinedAt: new Date().toISOString(),
        reason: payload.decline_reason || '',
      });

      console.log('[HelloSign Webhook] Signature declined:', envelopeId);
    }
  }

  return NextResponse.json({ success: true });
}

/**
 * Map DocuSign status to internal status
 */
function mapDocuSignStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'created': 'pending',
    'sent': 'pending',
    'delivered': 'delivered',
    'signed': 'signed',
    'completed': 'signed',
    'voided': 'cancelled',
    'declined': 'declined',
    'expired': 'expired',
  };
  return statusMap[status?.toLowerCase()] || 'pending';
}

/**
 * Map HelloSign event to internal status
 */
function mapHelloSignStatus(event: string): string {
  const statusMap: Record<string, string> = {
    'signature_request_sent': 'pending',
    'signature_request_viewed': 'viewed',
    'signature_request_signed': 'signed',
    'signature_request_all_signed': 'signed',
    'signature_request_declined': 'declined',
    'signature_request_canceled': 'cancelled',
  };
  return statusMap[event] || 'pending';
}

/**
 * Main webhook handler
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as DocuSignWebhookPayload | HelloSignWebhookPayload;
    const headers = request.headers;

    // Determine provider from headers or body
    const provider = headers.get('x-provider') || (body as DocuSignWebhookPayload).provider;

    switch (provider) {
      case 'docusign':
        return handleDocuSignWebhook(body as DocuSignWebhookPayload, headers);
      case 'hellosign':
        return handleHelloSignWebhook(body as HelloSignWebhookPayload, headers);
      default:
        console.error('[Webhook] Unknown provider:', provider);
        return NextResponse.json(
          { error: 'Unknown provider' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Webhook] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook processing failed',
      },
      { status: 500 }
    );
  }
}
