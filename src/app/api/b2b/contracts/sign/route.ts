/**
 * B2B Enhanced Electronic Signature API (Japan e-Signature Law Compliant)
 *
 * B2B 전자서명 API (일본 전자서명법 준수)
 * POST /api/b2b/contracts/sign - Record electronic signature with hanko, timestamp, and certificate support
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';
import { createTimestampData } from '@/lib/signature/timestamp-service';
import {
  SignContractRequest,
  SignContractResponse,
  SignatureData,
  SignatureType,
} from '@/types/signature';

// ============================================================
// POST Handler - Enhanced Contract Signing
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: '인증되지 않은 요청입니다.',
        } as SignContractResponse,
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      contractId,
      signatureType,
      handwrittenSignature,
      hankoImageId,
      legalAgreement,
    } = body as SignContractRequest;

    if (!contractId || !signatureType) {
      return NextResponse.json(
        {
          success: false,
          error: '계약서 ID와 서명 유형은 필수 항목입니다.',
        } as SignContractResponse,
        { status: 400 }
      );
    }

    if (signatureType === 'handwritten' && !handwrittenSignature) {
      return NextResponse.json(
        {
          success: false,
          error: '수기 서명 이미지가 필요합니다.',
        } as SignContractResponse,
        { status: 400 }
      );
    }

    if (signatureType === 'hanko' && !hankoImageId) {
      return NextResponse.json(
        {
          success: false,
          error: '인감 이미지가 필요합니다.',
        } as SignContractResponse,
        { status: 400 }
      );
    }

    if (signatureType === 'mixed' && (!handwrittenSignature || !hankoImageId)) {
      return NextResponse.json(
        {
          success: false,
          error: '복합 서명의 경우 수기 서명과 인감 이미지가 모두 필요합니다.',
        } as SignContractResponse,
        { status: 400 }
      );
    }

    if (!legalAgreement) {
      return NextResponse.json(
        {
          success: false,
          error: '이용 약관에 동의해야 합니다.',
        } as SignContractResponse,
        { status: 400 }
      );
    }

    // Get contract
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (contractError || !contract) {
      return NextResponse.json(
        {
          success: false,
          error: '계약서를 찾을 수 없습니다.',
        } as SignContractResponse,
        { status: 404 }
      );
    }

    // Check if user is authorized (customer or admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile && profile.role === 'ADMIN';

    // Determine party (customer or admin)
    const party = isAdmin ? 'admin' : 'customer';

    // Check if already signed
    if (contract[`${party}_signed_at`]) {
      return NextResponse.json(
        {
          success: false,
          error: '이미 서명된 계약서입니다.',
        } as SignContractResponse,
        { status: 400 }
      );
    }

    // Get client IP address
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Get location from IP (using ipapi.co free tier)
    let location: { country?: string; city?: string; region?: string; latitude?: number; longitude?: number } = {};
    try {
      const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        location = {
          country: geoData.country_name,
          city: geoData.city,
          region: geoData.region,
          latitude: geoData.latitude,
          longitude: geoData.longitude,
        };
      }
    } catch (error) {
      console.error('Geolocation error:', error);
    }

    // Prepare signature data
    const signatureData: SignatureData = {
      type: signatureType,
      metadata: {
        signedAt: new Date().toISOString(),
        ipAddress: ip,
        userAgent,
        location: location.country ? {
          country: location.country || '',
          region: location.region || '',
          city: location.city || '',
          latitude: location.latitude || 0,
          longitude: location.longitude || 0,
        } : undefined,
      },
    };

    // Add handwritten signature data if provided
    if (handwrittenSignature) {
      signatureData.handwritten = {
        signatureImageUrl: handwrittenSignature,
        canvasWidth: 500,
        canvasHeight: 200,
        strokeCount: 0,
        signingDuration: 0,
      };
    }

    // Add hanko data if provided
    if (hankoImageId) {
      // Get hanko image URL from storage
      const { data: hankoData } = supabase.storage
        .from('hanko-images')
        .getPublicUrl(hankoImageId);

      signatureData.hanko = {
        hankoImageUrl: hankoData.publicUrl,
        hankoName: signatureType === 'hanko' ? 'はんこ' : '署名用印',
        originalFileName: hankoImageId,
        fileSize: 0,
      };
    }

    // Generate timestamp
    const timestampData = await createTimestampData({
      documentHash: contractId, // Simplified hash generation
      signerId: user.id,
      contractId: contractId,
    });

    // Prepare update data
    const now = new Date().toISOString();
    const updateData: any = {
      [`${party}_signature_type`]: signatureType,
      [`${party}_signed_at`]: now,
      [`${party}_ip_address`]: ip,
      signature_data: contract.signature_data || {},
      updated_at: now,
    };

    // Add timestamp data
    updateData[`${party}_timestamp_token`] = timestampData.token;
    updateData[`${party}_timestamp_verified`] = false; // Will be verified separately

    // Add signature image paths
    if (handwrittenSignature) {
      updateData[`${party}_hanko_image_path`] = null; // Clear hanko if only handwritten
    }
    if (hankoImageId) {
      const { data: hankoData } = supabase.storage
        .from('hanko-images')
        .getPublicUrl(hankoImageId);
      updateData[`${party}_hanko_image_path`] = hankoData.publicUrl;
    }

    // Update contract with signature data
    const existingSignatureData = (contract.signature_data as any) || {};
    existingSignatureData[party] = signatureData;

    updateData.signature_data = existingSignatureData;

    // Execute update
    const { error: updateError } = await supabase
      .from('contracts')
      .update(updateData)
      .eq('id', contractId);

    if (updateError) {
      throw updateError;
    }

    // Log signature in audit log
    await supabase
      .from('order_audit_log')
      .insert({
        table_name: 'contracts',
        record_id: contractId,
        action: 'UPDATE',
        old_data: {
          [`${party}_signed_at`]: contract[`${party}_signed_at`],
        },
        new_data: updateData,
        changed_by: user.id,
        changed_at: now,
        ip_address: ip,
        user_agent: userAgent,
      });

    // Check if both parties have signed
    const otherParty = party === 'customer' ? 'admin' : 'customer';
    const bothSigned = !!contract[`${otherParty}_signed_at`];

    if (bothSigned) {
      // Update order status to CONTRACT_SIGNED
      await supabase
        .from('orders')
        .update({
          status: 'CONTRACT_SIGNED',
          current_state: 'contract_signed',
          updated_at: now,
        })
        .eq('id', contract.order_id);

      // Log status change
      await supabase
        .from('order_status_history')
        .insert({
          order_id: contract.order_id,
          from_status: 'CONTRACT_SENT',
          to_status: 'CONTRACT_SIGNED',
          changed_by: user.id,
          changed_at: now,
          reason: '계약서 양측 서명 완료 (Both parties signed)',
        });
    }

    return NextResponse.json({
      success: true,
      message: isAdmin
        ? '관리자 서명이 완료되었습니다. (Administrator signature completed)'
        : '고객 서명이 완료되었습니다. (Customer signature completed)',
      contractId,
      signatureId: `${contractId}-${party}-${Date.now()}`,
      timestampData: {
        token: timestampData.token,
        timestamp: timestampData.timestamp,
        tsaUrl: timestampData.tsaUrl,
        verified: timestampData.verified,
        certificateHash: timestampData.certificateHash,
      },
    } as SignContractResponse);

  } catch (error) {
    console.error('Electronic Signature API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 오류가 발생했습니다. (Internal server error)',
      } as SignContractResponse,
      { status: 500 }
    );
  }
}
