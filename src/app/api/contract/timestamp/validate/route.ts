/**
 * Contract Timestamp Validation API
 *
 * 契約書タイムスタンプ検証API
 * - POST: タイムスタンプの検証
 * - 電子署名法に基づく検証ロジック
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// Types
// ============================================================

interface ValidateRequest {
  token: string;
  tsaUrl: string;
  documentHash?: string;
}

interface ValidateResponse {
  valid: boolean;
  timestampData?: {
    timestamp: string;
    hash: string;
    expiresAt: string;
  };
  error?: string;
  validatedAt: string;
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Verify timestamp token with TSA
 * In production, this would make actual verification request to TSA
 */
async function verifyTimestampWithTSA(
  token: string,
  tsaUrl: string
): Promise<{ valid: boolean; timestamp?: string; hash?: string }> {
  // In production, integrate with real TSA verification endpoint
  // Example TSA verification protocols:
  // - RFC 3161 Time Stamp Protocol (TSP)
  // - TSA's REST API verification endpoints

  // Mock verification - in production, use actual TSA verification
  // const response = await fetch(`${tsaUrl}/verify`, {
  //   method: 'POST',
  //   body: JSON.stringify({ token }),
  // });

  // For now, accept tokens that are properly formatted hex strings
  const isValidHex = /^[a-f0-9]{64}$/i.test(token);

  if (!isValidHex) {
    return { valid: false };
  }

  // Mock timestamp data from token
  return {
    valid: true,
    // In production, extract actual timestamp from TSA response
    timestamp: new Date().toISOString(),
    hash: token,
  };
}

/**
 * Check if timestamp has expired
 */
function isTimestampExpired(expiresAt: string): boolean {
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  return now > expiryDate;
}

// ============================================================
// POST Handler - Validate Timestamp
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ValidateRequest;

    if (!body.token || !body.tsaUrl) {
      return NextResponse.json(
        {
          valid: false,
          error: '必須パラメータが不足しています',
          validatedAt: new Date().toISOString(),
        } as ValidateResponse,
        { status: 400 }
      );
    }

    // Verify timestamp with TSA
    const verification = await verifyTimestampWithTSA(body.token, body.tsaUrl);

    if (!verification.valid) {
      return NextResponse.json({
        valid: false,
        error: 'タイムスタンプの検証に失敗しました。TSAから無効な応答がありました。',
        validatedAt: new Date().toISOString(),
      } as ValidateResponse);
    }

    // In production, retrieve stored timestamp record from database
    // const storedRecord = await db.timestamps.findFirst({
    //   where: { token: body.token },
    // });

    // Calculate expiry date (10 years from timestamp)
    const timestampDate = new Date(verification.timestamp || new Date());
    const expiryDate = new Date(
      timestampDate.getTime() + 10 * 365 * 24 * 60 * 60 * 1000
    );

    // Check if expired
    if (isTimestampExpired(expiryDate.toISOString())) {
      return NextResponse.json({
        valid: false,
        error: 'タイムスタンプの有効期限が切れています',
        validatedAt: new Date().toISOString(),
      } as ValidateResponse);
    }

    // Verify document hash if provided
    if (body.documentHash && verification.hash && body.documentHash !== verification.hash) {
      return NextResponse.json({
        valid: false,
        error: '文書ハッシュが一致しません。文書が改ざんされている可能性があります。',
        validatedAt: new Date().toISOString(),
      } as ValidateResponse);
    }

    return NextResponse.json({
      valid: true,
      timestampData: {
        timestamp: verification.timestamp || new Date().toISOString(),
        hash: verification.hash || body.token,
        expiresAt: expiryDate.toISOString(),
      },
      validatedAt: new Date().toISOString(),
    } as ValidateResponse);
  } catch (error) {
    console.error('Timestamp validation error:', error);

    return NextResponse.json(
      {
        valid: false,
        error: error instanceof Error ? error.message : 'タイムスタンプの検証に失敗しました',
        validatedAt: new Date().toISOString(),
      } as ValidateResponse,
      { status: 500 }
    );
  }
}

// ============================================================
// OPTIONS Handler - CORS preflight
// ============================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
