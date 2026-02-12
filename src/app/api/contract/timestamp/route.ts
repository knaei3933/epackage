/**
 * Contract Timestamp API
 *
 * 契約書タイムスタンプAPI
 * - POST: タイムスタンプ付与リクエスト
 * - 日本の電子署名法準拠TSA連携
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// Types
// ============================================================

interface TimestampRequest {
  contractId: string;
  contractNumber: string;
  documentHash: string;
  tsaUrl?: string;
  userId?: string;
}

interface TimestampResponse {
  success: boolean;
  timestampData?: TimestampData;
  error?: string;
}

interface TimestampData {
  token: string;
  timestamp: string;
  tsaUrl: string;
  hash: string;
  expiresAt: string;
  certificate?: string;
}

// ============================================================
// Constants
// ============================================================

const TIMESTAMP_VALIDITY_PERIOD = 10 * 365 * 24 * 60 * 60 * 1000; // 10 years in ms

// ============================================================
// Helper Functions
// ============================================================

/**
 * Generate timestamp token
 * In production, this would call actual TSA service
 */
async function generateTimestampToken(
  documentHash: string,
  tsaUrl: string
): Promise<{ token: string; timestamp: string }> {
  // In production, integrate with real TSA like:
  // - JQA (Japan Quality Assurance Organization)
  // - MRI (Mitsubishi Research Institute)
  // - commercial TSA services

  const timestamp = new Date().toISOString();

  // Mock token generation - in production, use actual TSA protocol
  const tokenData = {
    hash: documentHash,
    timestamp,
    tsaUrl,
    nonce: crypto.randomUUID(),
  };

  const tokenString = JSON.stringify(tokenData);
  const encoder = new TextEncoder();
  const data = encoder.encode(tokenString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const token = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return {
    token,
    timestamp,
  };
}

/**
 * Calculate expiry date
 */
function calculateExpiryDate(timestamp: string): string {
  const date = new Date(timestamp);
  const expiry = new Date(date.getTime() + TIMESTAMP_VALIDITY_PERIOD);
  return expiry.toISOString();
}

// ============================================================
// POST Handler - Request Timestamp
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TimestampRequest;

    if (!body.contractId || !body.contractNumber || !body.documentHash) {
      return NextResponse.json(
        {
          success: false,
          error: '必須パラメータが不足しています',
        } as TimestampResponse,
        { status: 400 }
      );
    }

    const tsaUrl = body.tsaUrl || 'https://tsa.example.com';

    // Generate timestamp token
    const { token, timestamp } = await generateTimestampToken(body.documentHash, tsaUrl);

    const timestampData: TimestampData = {
      token,
      timestamp,
      tsaUrl,
      hash: body.documentHash,
      expiresAt: calculateExpiryDate(timestamp),
    };

    // In production, store timestamp record in database
    // await db.timestamps.create({
    //   contractId: body.contractId,
    //   token,
    //   timestamp,
    //   tsaUrl,
    //   hash: body.documentHash,
    //   expiresAt: timestampData.expiresAt,
    //   userId: body.userId,
    // });

    return NextResponse.json({
      success: true,
      timestampData,
    } as TimestampResponse);
  } catch (error) {
    console.error('Timestamp generation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'タイムスタンプの付与に失敗しました',
      } as TimestampResponse,
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
