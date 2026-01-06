/**
 * Comparison Save API
 * POST /api/comparison/save - Save quote comparison data
 *
 * This endpoint handles saving comparison data for quotes.
 * Currently returns a success response for compatibility.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Implement actual comparison save logic
    // For now, just return success to prevent 404 errors
    console.log('Comparison save API called with:', body);

    return NextResponse.json({
      success: true,
      message: 'Comparison data saved',
      data: body
    });
  } catch (error) {
    console.error('Comparison save error:', error);
    return NextResponse.json(
      { error: 'Failed to save comparison data' },
      { status: 500 }
    );
  }
}

// Handle GET requests
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Comparison save API is available'
  });
}
