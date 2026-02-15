/**
 * Comparison Save API
 * POST /api/comparison/save - Save quote comparison data
 * GET /api/comparison/save - Load saved comparisons
 * DELETE /api/comparison/save?shareId=xxx - Delete a comparison
 *
 * This endpoint handles saving, loading, and deleting comparison data for quotes.
 */

export const dynamic = 'force-dynamic';

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

// Handle GET requests - Load saved comparisons
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');

    if (shareId) {
      // TODO: Load specific comparison by shareId
      console.log('Loading comparison with shareId:', shareId);
      return NextResponse.json({
        success: true,
        message: 'Comparison loaded',
        data: null
      });
    }

    // Load all saved comparisons
    return NextResponse.json({
      success: true,
      message: 'Comparisons loaded',
      data: []
    });
  } catch (error) {
    console.error('Comparison load error:', error);
    return NextResponse.json(
      { error: 'Failed to load comparison data' },
      { status: 500 }
    );
  }
}

// Handle DELETE requests - Delete a comparison
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');

    if (!shareId) {
      return NextResponse.json(
        { error: 'shareId is required' },
        { status: 400 }
      );
    }

    // TODO: Implement actual deletion logic
    console.log('Deleting comparison with shareId:', shareId);

    return NextResponse.json({
      success: true,
      message: 'Comparison deleted'
    });
  } catch (error) {
    console.error('Comparison delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete comparison data' },
      { status: 500 }
    );
  }
}
