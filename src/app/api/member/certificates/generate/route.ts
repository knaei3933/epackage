/**
 * Signature Certificate Generation API
 *
 * 署名証明書生成API
 * - POST: Generate signature certificate PDF
 * - GET: Get certificate info
 *
 * /api/member/certificates/generate
 *
 * Migrated from /api/b2b/certificate/generate
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database, Json } from '@/types/database';
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
// Helper: Get authenticated user ID
// ============================================================

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  // Try to get user from middleware header first (more reliable)
  const userIdFromMiddleware = request.headers.get('x-user-id');
  const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

  if (userIdFromMiddleware && isFromMiddleware) {
    console.log('[Certificate Generation] Using user ID from middleware:', userIdFromMiddleware);
    return userIdFromMiddleware;
  }

  // Fallback to SSR client auth
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const response = NextResponse.json({ success: false });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set() {},
      remove() {},
    },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('[Certificate Generation] Auth error:', authError);
    return null;
  }

  return user.id;
}

// ============================================================
// Helper: Create Supabase client for database operations
// ============================================================

function createSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set() {},
      remove() {},
    },
  });
}

// ============================================================
// POST Handler - Generate Certificate
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        } as GenerateCertificateResponseBody,
        { status: 401 }
      );
    }

    const supabase = createSupabaseClient(request);

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

    const party = body.signerRole; // 'customer' or 'admin'

    // 署名日時（実在カラム: customer_signed_at / admin_signed_at）
    const signedAt =
      party === 'customer' ? contract.customer_signed_at : contract.admin_signed_at;

    if (!signedAt) {
      return NextResponse.json(
        {
          success: false,
          error: `${party === 'customer' ? '顧客' : '管理者'}の署名がありません`,
        } as GenerateCertificateResponseBody,
        { status: 400 }
      );
    }

    // 署名者IPアドレス（実在カラム: customer_ip_address のみ。admin 側は保持しない）
    const ipAddress =
      party === 'customer' ? (contract.customer_ip_address ?? '') : '';

    // 証明書生成リクエストを構築。
    // 署名タイプ（handwritten/hanko）・タイムスタンプToken は実DBに存在しない（drift）ため、
    // 既定値（handwritten / 未検証タイムスタンプ）で運用する。
    const certificateRequest: CertificateRequest = {
      contractId: body.contractId,
      signerId: userId,
      signerName: contract.customer_name,
      signerRole: body.signerRole,
      signatureData: {
        type: 'handwritten',
        metadata: {
          signedAt,
          ipAddress,
          userAgent: 'unknown',
        },
      },
      timestampData: {
        token: 'unavailable',
        timestamp: signedAt,
        tsaUrl: 'https://tsa.example.com',
        verified: false,
        certificateHash: 'mock_hash',
      },
      contractDetails: {
        contractNumber: contract.contract_number,
        contractTitle: `契約書 - ${contract.contract_number}`,
        totalAmount: contract.total_amount,
        currency: contract.currency,
      },
    };

    // Generate certificate
    const certificate = await generateSignatureCertificate(certificateRequest);

    // 証明書URL・法的有効性・署名期限は実DBのカラムへ存在しない（drift）ため、
    // contract_data(jsonb) のメタデータへ保存する。
    // contract_data(jsonb) は Json 型。スプレッド先も Json 互換へ寄せておく。
    const existingData =
      (contract.contract_data as Record<string, Json> | null) ?? {};
    const existingCertificates =
      (existingData.certificates as Record<string, Json> | undefined) ?? {};
    const mergedContractData = {
      ...existingData,
      certificates: {
        ...existingCertificates,
        [party]: {
          url: certificate.certificateUrl,
          legalValidity: certificate.legalValidity.compliant,
          expiresAt: certificate.legalValidity.expiryDate,
        },
      },
    } as Json;

    await supabase
      .from('contracts')
      .update({
        contract_data: mergedContractData,
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
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

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

    const supabase = createSupabaseClient(request);

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

    // 証明書URL・法的有効性・署名期限は contract_data(jsonb) へ保存されている
    // （実DBの該当カラムは drift のため）
    const contractData =
      (contract.contract_data as Record<string, any> | null) ?? {};
    const certificatesData =
      (contractData.certificates as Record<string, any> | undefined) ?? {};
    const customerCertificate = certificatesData.customer as
      | { url?: string; legalValidity?: boolean; expiresAt?: string }
      | undefined;
    const adminCertificate = certificatesData.admin as
      | { url?: string; legalValidity?: boolean; expiresAt?: string }
      | undefined;

    return NextResponse.json({
      success: true,
      certificates: {
        customer: customerCertificate?.url
          ? {
              url: customerCertificate.url,
              issuedAt: contract.customer_signed_at,
            }
          : null,
        admin: adminCertificate?.url
          ? {
              url: adminCertificate.url,
              issuedAt: contract.admin_signed_at,
            }
          : null,
      },
      legalValidity: {
        confirmed:
          customerCertificate?.legalValidity ??
          adminCertificate?.legalValidity ??
          false,
        expiresAt:
          customerCertificate?.expiresAt ??
          adminCertificate?.expiresAt ??
          contract.expires_at,
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
