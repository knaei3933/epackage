/**
 * B2B 계약서 서명 API (B2B Contract Signing API)
 * POST /api/b2b/contracts/[id]/sign - Sign contract (electronic signature)
 *
 * 일본 전자서명법 (電子署名法) 및 e-문서法 (電子文書法) 준수
 * - IP 주소 검증 (x-forwarded-for 헤더 스푸핑 방지)
 * - 타임스탬프 생성 및 검증
 * - 감사 로그 기록
 *
 * Updated: Transaction-safe contract signing using PostgreSQL RPC function
 * - Replaced manual multi-step operations with ACID transaction
 * - Next.js 15+ compatibility with @supabase/ssr
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { extractIPFromNextRequest, checkJapaneseESignCompliance } from '@/lib/ip-validator';
import { createTimestampToken, saveTimestampToDatabase, generateDocumentHash } from '@/lib/timestamp-service';
import { AuditLogger, withAuditLog } from '@/lib/audit-logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: contractId } = await params;
  // =====================================================
  // 1. IP Address Validation (Japanese e-Sign Law Requirement)
  // =====================================================
  const ipValidation = extractIPFromNextRequest(request);

  // Check compliance with Japanese electronic signature law
  const complianceCheck = checkJapaneseESignCompliance(ipValidation);
  const auditLogger = new AuditLogger();

  // Log IP validation for security audit
  await auditLogger.logIPValidation(ipValidation);

  // Warn if IP trust level is low
  if (ipValidation.trustLevel === 'untrusted' || ipValidation.trustLevel === 'suspicious') {
    await auditLogger.logSecurityAlert(
      'low_trust_ip_signature_attempt',
      ipValidation.trustLevel === 'untrusted' ? 'high' : 'medium',
      {
        contract_id: contractId,
        ip_address: ipValidation.clientIP,
        trust_level: ipValidation.trustLevel,
        warnings: ipValidation.warnings,
        source: ipValidation.source,
      },
      undefined,
      ipValidation
    );
  }

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // =====================================================
    // 2. Authentication Check
    // =====================================================
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      await auditLogger.log({
        event_type: 'signature_created',
        resource_type: 'contract',
        resource_id: contractId,
        ip_address: ipValidation.clientIP,
        ip_validation: {
          trust_level: ipValidation.trustLevel,
          source: ipValidation.source,
          is_private: ipValidation.metadata.isPrivate,
          warnings: ipValidation.warnings,
        },
        outcome: 'failure',
        error_message: '인증되지 않은 요청입니다.',
        details: {
          contract_id: contractId,
        },
      });

      return NextResponse.json(
        {
          error: '인증되지 않은 요청입니다.',
          ip_trust_level: ipValidation.trustLevel,
        },
        { status: 401 }
      );
    }

    // =====================================================
    // 3. Get Contract Data
    // =====================================================
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select(`
        *,
        orders (*),
        companies (*)
      `)
      .eq('id', contractId)
      .single();

    if (contractError || !contract) {
      await auditLogger.log({
        event_type: 'signature_created',
        resource_type: 'contract',
        resource_id: contractId,
        user_id: user.id,
        ip_address: ipValidation.clientIP,
        ip_validation: {
          trust_level: ipValidation.trustLevel,
          source: ipValidation.source,
          is_private: ipValidation.metadata.isPrivate,
          warnings: ipValidation.warnings,
        },
        outcome: 'failure',
        error_message: '계약서를 찾을 수 없습니다.',
        details: {
          contract_id: contractId,
        },
      });

      return NextResponse.json(
        { error: '계약서를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // =====================================================
    // 4. Parse Request Body
    // =====================================================
    const body = await request.json();
    const { signature_data, signer_type } = body; // 'customer' or 'admin'

    if (!signature_data) {
      return NextResponse.json(
        {
          error: '서명 데이터는 필수 항목입니다.',
          compliance: complianceCheck,
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 5. Generate Document Hash (for Timestamp)
    // =====================================================
    const documentContent = JSON.stringify({
      contract_id: contract.id,
      contract_number: contract.contract_number,
      company_id: contract.company_id,
      order_id: contract.order_id,
      status: contract.status,
      terms: contract.terms,
      created_at: contract.created_at,
    });

    const documentHash = await generateDocumentHash(documentContent);

    // =====================================================
    // 6. Create Timestamp Token (Japanese e-Sign Law Requirement)
    // =====================================================
    const timestampToken = await createTimestampToken({
      documentHash,
      documentType: 'contract',
      userId: user.id,
      ipAddress: ipValidation.clientIP,
      additionalData: {
        contract_id: contractId,
        contract_number: contract.contract_number,
        signer_type: signer_type,
        ip_validation: {
          trust_level: ipValidation.trustLevel,
          source: ipValidation.source,
          is_private: ipValidation.metadata.isPrivate,
        },
      },
    });

    // Save timestamp to database
    const timestampResult = await saveTimestampToDatabase(timestampToken);
    if (!timestampResult.success) {
      console.error('Failed to save timestamp:', timestampResult.error);
    }

    // =====================================================
    // 7. Get User Profile for Signer Info
    // =====================================================
    const { data: profile } = await supabase
      .from('profiles')
      .select('kanji_last_name, kanji_first_name, role')
      .eq('id', user.id)
      .single();

    const signerName = profile
      ? `${profile.kanji_last_name} ${profile.kanji_first_name}`
      : user.email?.split('@')[0] || 'Unknown';

    // =====================================================
    // 8. Determine Signature Type
    // =====================================================
    let signatureType = '';

    if (signer_type === 'customer' || profile?.role === 'MEMBER') {
      // Customer signing - validate contract status
      if (contract.status !== 'SENT' && contract.status !== 'DRAFT') {
        return NextResponse.json(
          { error: '서명할 수 없는 상태의 계약서입니다.' },
          { status: 400 }
        );
      }
      signatureType = 'customer';

    } else if (signer_type === 'admin' || profile?.role === 'ADMIN') {
      // Admin signing - validate contract status
      if (contract.status !== 'CUSTOMER_SIGNED' && contract.status !== 'DRAFT') {
        return NextResponse.json(
          { error: '고객 서명 후에만 관리자 서명이 가능합니다.' },
          { status: 400 }
        );
      }
      signatureType = 'admin';

    } else {
      return NextResponse.json(
        { error: '서명자 유형이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    // =====================================================
    // 9. Create Signature Using Transaction-Safe RPC Function
    // =====================================================
    // All operations wrapped in ACID transaction:
    // 1. Update contract signature_data
    // 2. Update contract status
    // 3. Update order status (when both parties signed)
    // 4. Create order status history entry
    //
    // If any operation fails, the entire transaction is rolled back
    // automatically by PostgreSQL.

    const { data: rpcResult, error: rpcError } = await supabase.rpc('sign_contract_transaction', {
      p_contract_id: contractId,
      p_user_id: user.id,
      p_signer_type: signatureType,
      p_signature_data: {
        name: signerName,
        email: user.email,
        signature_data: signature_data,
        signed_at: new Date().toISOString(),
      },
      p_timestamp_id: timestampToken.id,
      p_document_hash: documentHash,
      p_ip_address: ipValidation.clientIP,
      p_ip_validation: {
        trust_level: ipValidation.trustLevel,
        source: ipValidation.source,
        is_private: ipValidation.metadata.isPrivate,
        warnings: ipValidation.warnings,
      },
    });

    if (rpcError) {
      console.error('RPC Error signing contract:', rpcError);

      await auditLogger.log({
        event_type: 'signature_created',
        resource_type: 'contract',
        resource_id: contractId,
        user_id: user.id,
        ip_address: ipValidation.clientIP,
        ip_validation: {
          trust_level: ipValidation.trustLevel,
          source: ipValidation.source,
          is_private: ipValidation.metadata.isPrivate,
          warnings: ipValidation.warnings,
        },
        outcome: 'failure',
        error_message: rpcError.message,
        details: {
          contract_id: contractId,
          timestamp_id: timestampToken.id,
        },
      });

      return NextResponse.json(
        { error: '서명 처리 중 오류가 발생했습니다.', details: rpcError.message },
        { status: 500 }
      );
    }

    // Check RPC function result
    if (!rpcResult || rpcResult.length === 0) {
      return NextResponse.json(
        { error: '서명 처리 중 알 수 없는 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    const result = rpcResult[0];

    // Handle failure case
    if (!result.success) {
      await auditLogger.log({
        event_type: 'signature_created',
        resource_type: 'contract',
        resource_id: contractId,
        user_id: user.id,
        ip_address: ipValidation.clientIP,
        ip_validation: {
          trust_level: ipValidation.trustLevel,
          source: ipValidation.source,
          is_private: ipValidation.metadata.isPrivate,
          warnings: ipValidation.warnings,
        },
        outcome: 'failure',
        error_message: result.error_message,
        details: {
          contract_id: contractId,
          timestamp_id: timestampToken.id,
        },
      });

      return NextResponse.json(
        {
          error: result.error_message || '서명 처리 중 오류가 발생했습니다.',
          contract_id: result.contract_id
        },
        { status: result.error_message?.includes('찾을 수 없습니다') ? 404 : 400 }
      );
    }

    // Fetch the updated contract for response
    const { data: updatedContract, error: fetchError } = await supabase
      .from('contracts')
      .select(`
        *,
        companies (*),
        orders (*)
      `)
      .eq('id', contractId)
      .single();

    if (fetchError) {
      console.error('Error fetching updated contract:', fetchError);
      // Signature was successful, but fetch failed
    }

    // =====================================================
    // 10. Log Successful Signature (Audit Trail)
    // =====================================================
    await auditLogger.logSignatureCreated(
      timestampToken.id,
      contractId,
      user.id,
      ipValidation,
      {
        contract_number: contract.contract_number,
        signer_type: signatureType,
        signer_name: signerName,
        document_hash: documentHash,
        japanese_law_compliance: complianceCheck,
        contract_status: result.contract_status,
        order_status: result.order_status,
      }
    );

    await auditLogger.logContractSigned(
      contractId,
      contract.contract_number,
      user.id,
      ipValidation
    );

    // =====================================================
    // 11. Return Response with Compliance Information
    // =====================================================
    return NextResponse.json({
      success: true,
      data: updatedContract || { id: contractId },
      timestamp: {
        id: timestampToken.id,
        timestamp: timestampToken.timestamp,
        document_hash: documentHash,
      },
      contract_status: result.contract_status,
      order_status: result.order_status,
      ip_validation: {
        trust_level: ipValidation.trustLevel,
        source: ipValidation.source,
        is_private: ipValidation.metadata.isPrivate,
        warnings: ipValidation.warnings,
      },
      compliance: {
        japanese_e_sign_law: complianceCheck.compliant,
        requirements: complianceCheck.requirements,
        issues: complianceCheck.issues,
      },
      message: signatureType === 'customer'
        ? '계약서에 서명했습니다. 관리자 승인을 기다리고 있습니다.'
        : '계약서가 활성화되었습니다.',
    });

  } catch (error: any) {
    console.error('Contract signing API error:', error);

    await auditLogger.log({
      event_type: 'error_occurred',
      resource_type: 'contract',
      resource_id: contractId,
      ip_address: ipValidation.clientIP,
      ip_validation: {
        trust_level: ipValidation.trustLevel,
        source: ipValidation.source,
        is_private: ipValidation.metadata.isPrivate,
        warnings: ipValidation.warnings,
      },
      outcome: 'failure',
      error_message: error.message,
      details: {
        stack: error.stack,
      },
    });

    return NextResponse.json(
      {
        error: '서버 오류가 발생했습니다.',
        ip_trust_level: ipValidation.trustLevel,
      },
      { status: 500 }
    );
  }
}
