/**
 * Timestamp Verification API
 *
 * タイムスタンプ検証API
 * - POST: Verify timestamp token
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';
import {
  verifyTimestamp,
  isTimestampValid,
  getTimestampVerificationStatus,
} from '@/lib/signature/timestamp-service';

// ============================================================
// Types
// ============================================================

interface VerifyTimestampRequestBody {
  timestampToken: string;
  documentHash: string;
  contractId?: string;
}

interface VerifyTimestampResponseBody {
  success: boolean;
  valid: boolean;
  timestamp: string;
  verifiedAt: string;
  status: 'verified' | 'pending' | 'expired' | 'invalid';
  message: string;
  error?: string;
}

// ============================================================
// POST Handler - Verify Timestamp
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
        } as VerifyTimestampResponseBody,
        { status: 401 }
      );
    }

    // Parse request body
    const body: VerifyTimestampRequestBody = await request.json();

    if (!body.timestampToken || !body.documentHash) {
      return NextResponse.json(
        {
          success: false,
          error: 'timestampToken and documentHash are required',
        } as VerifyTimestampResponseBody,
        { status: 400 }
      );
    }

    // Verify timestamp
    const verification = await verifyTimestamp(
      body.timestampToken,
      body.documentHash
    );

    if (!verification.valid) {
      return NextResponse.json({
        success: true,
        valid: false,
        timestamp: verification.timestamp,
        verifiedAt: verification.verifiedAt,
        status: 'invalid',
        message: verification.error || 'タイムスタンプの検証に失敗しました',
      } as VerifyTimestampResponseBody);
    }

    // Check if timestamp is still valid (not expired)
    const stillValid = isTimestampValid({
      token: body.timestampToken,
      timestamp: verification.timestamp,
      tsaUrl: 'mock', // Will be populated from actual token
      verified: true,
      verifiedAt: verification.verifiedAt,
      certificateHash: body.documentHash,
    });

    const statusInfo = getTimestampVerificationStatus({
      token: body.timestampToken,
      timestamp: verification.timestamp,
      tsaUrl: 'mock',
      verified: true,
      verifiedAt: verification.verifiedAt,
      certificateHash: body.documentHash,
    });

    // Update contract if contractId provided
    if (body.contractId && stillValid) {
      const party = user.user_metadata?.role === 'ADMIN' ? 'admin' : 'customer';

      await supabase
        .from('contracts')
        .update({
          [`${party}_timestamp_verified`]: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', body.contractId);
    }

    return NextResponse.json({
      success: true,
      valid: stillValid,
      timestamp: verification.timestamp,
      verifiedAt: verification.verifiedAt,
      status: statusInfo.status,
      message: statusInfo.message,
    } as VerifyTimestampResponseBody);

  } catch (error) {
    console.error('Timestamp verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as VerifyTimestampResponseBody,
      { status: 500 }
    );
  }
}

// ============================================================
// GET Handler - Get Timestamp Status
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

    // Determine which party's timestamp to check
    const party = user.user_metadata?.role === 'ADMIN' ? 'admin' : 'customer';
    const timestampToken = contract[`${party}_timestamp_token`];

    if (!timestampToken) {
      return NextResponse.json({
        success: true,
        hasTimestamp: false,
        message: 'タイムスタンプがありません',
      });
    }

    // Get timestamp status
    const statusInfo = getTimestampVerificationStatus({
      token: timestampToken,
      timestamp: contract[`${party}_signed_at`] || new Date().toISOString(),
      tsaUrl: 'mock',
      verified: contract[`${party}_timestamp_verified`] || false,
      certificateHash: 'mock',
    });

    return NextResponse.json({
      success: true,
      hasTimestamp: true,
      timestamp: contract[`${party}_signed_at`],
      verified: contract[`${party}_timestamp_verified`] || false,
      status: statusInfo.status,
      message: statusInfo.message,
    });

  } catch (error) {
    console.error('Timestamp status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
