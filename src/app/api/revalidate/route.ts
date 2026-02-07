/**
 * revalidate API Route
 *
 * Next.jsのOn-Demand Revalidationを使用するためのエンドポイント
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path } = body;

    if (!path || typeof path !== 'string') {
      return NextResponse.json(
        { error: 'Invalid path parameter' },
        { status: 400 }
      );
    }

    // パスの再検証
    revalidatePath(path);

    return NextResponse.json({
      success: true,
      revalidated: true,
      path,
      now: Date.now(),
    });
  } catch (error) {
    console.error('[Revalidate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    );
  }
}

/**
 * GET - ヘルスチェック
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/revalidate',
    method: 'POST',
    description: 'Revalidate Next.js cache for specific paths',
  });
}
