/**
 * Signature Certificate Generation API
 *
 * 署名証明書生成API
 * - POST: Generate signature certificate PDF
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';
import {
  generateSignatureCertificate,
  downloadCertificate,
  getValidityStatusDisplay,
} from '@/lib/signature/certificate-generator';
import { CertificateRequest } from '@/types/signature';

// ============================================================
// Types
// ============================================================

interface GenerateCertificateRequestBody {
  contractId: string;
  signerRole: 'customer' | 'admin';
}

interface GenerateCertificateResponseBody {
  success: boolean;
  certificate?: {
    certificateId: string;
    signerName: string;
    signerRole: string;
    signedAt: string;
    certificateUrl: string;
    validUntil: string;
  };
  error?: string;
}

// ============================================================
// POST Handler - Generate Certificate
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        } as GenerateCertificateResponseBody,
        { status: 401 }
      );
    }

    // Parse request body
    const body: GenerateCertificateRequestBody = await request.json();

    if (!body.contractId || !body.signerRole) {
      return NextResponse.json(
        {
          success: false,
          error: 'contractId and signerRole are required',
        } as GenerateCertificateResponseBody,
        { status: 400 }
      );
    }

    // Get contract data
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select(`
        *,
        companies (
          name
        ),
        orders (
          order_number
        )
      `)
      .eq('id', body.contractId)
      .single();

    if (contractError || !contract) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contract not found',
        } as GenerateCertificateResponseBody,
        { status: 404 }
      );
    }

    // Get signer profile
    const party = body.signerRole; // 'customer' or 'admin'
    const signerId = party === 'customer' ? contract.customer_representative : 'admin';

    // Check if signature exists
    const signedAt = contract[`${party}_signed_at`];
    const signatureType = contract[`${party}_signature_type`];

    if (!signedAt) {
      return NextResponse.json(
        {
          success: false,
          error: `${party === 'customer' ? '顧客' : '管理者'}の署名がありません`,
        } as GenerateCertificateResponseBody,
        { status: 400 }
      );
    }

    // Get timestamp data
    const timestampToken = contract[`${party}_timestamp_token`];
    const timestampVerified = contract[`${party}_timestamp_verified`];

    if (!timestampToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'タイムスタンプがありません',
        } as GenerateCertificateResponseBody,
        { status: 400 }
      );
    }

    // Create certificate request
    const certificateRequest: CertificateRequest = {
      contractId: body.contractId,
      signerId: user.id,
      signerName: contract.customer_name,
      signerRole: body.signerRole,
      signatureData: {
        type: signatureType || 'handwritten',
        metadata: {
          signedAt,
          ipAddress: contract[`${party}_ip_address`] || '',
          userAgent: 'unknown',
        },
      },
      timestampData: {
        token: timestampToken,
        timestamp: signedAt,
        tsaUrl: 'https://tsa.example.com',
        verified: timestampVerified || false,
        certificateHash: 'mock_hash',
      },
      contractDetails: {
        contractNumber: contract.contract_number,
        contractTitle: `契約書 - ${contract.company_id || ''}`,
        totalAmount: contract.total_amount,
        currency: contract.currency,
      },
    };

    // Generate certificate
    const certificate = await generateSignatureCertificate(certificateRequest);

    // Update contract with certificate URL
    await supabase
      .from('contracts')
      .update({
        [`${party}_certificate_url`]: certificate.certificateUrl,
        legal_validity_confirmed: certificate.legalValidity.compliant,
        signature_expires_at: certificate.legalValidity.expiryDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.contractId);

    // Return certificate info
    return NextResponse.json({
      success: true,
      certificate: {
        certificateId: certificate.certificateId,
        signerName: certificate.signerName,
        signerRole: certificate.signerRole,
        signedAt: certificate.signedAt,
        certificateUrl: certificate.certificateUrl,
        validUntil: certificate.legalValidity.expiryDate,
      },
    } as GenerateCertificateResponseBody);

  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as GenerateCertificateResponseBody,
      { status: 500 }
    );
  }
}

// ============================================================
// GET Handler - Get Certificate Info
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const contractId = searchParams.get('contractId');

    if (!contractId) {
      return NextResponse.json(
        {
          success: false,
          error: 'contractId is required',
        },
        { status: 400 }
      );
    }

    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // Get contract data
    const { data: contract, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (error || !contract) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contract not found',
        },
        { status: 404 }
      );
    }

    // Check certificates
    const customerCertificate = contract.customer_certificate_url;
    const adminCertificate = contract.admin_certificate_url;

    return NextResponse.json({
      success: true,
      certificates: {
        customer: customerCertificate ? {
          url: customerCertificate,
          issuedAt: contract.customer_signed_at,
        } : null,
        admin: adminCertificate ? {
          url: adminCertificate,
          issuedAt: contract.admin_signed_at,
        } : null,
      },
      legalValidity: {
        confirmed: contract.legal_validity_confirmed,
        expiresAt: contract.signature_expires_at,
      },
    });

  } catch (error) {
    console.error('Certificate info error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
