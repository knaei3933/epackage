export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { premiumContentSchema } from '@/types/premium-content'

/**
 * POST /api/premium-content/download
 *
 * Handles premium content download form submissions:
 * 1. Validates form data
 * 2. Stores lead information in database
 * 3. Sends confirmation email
 * 4. Returns secure download URL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate form data
    const validatedData = premiumContentSchema.parse(body)

    // Store download record. NOTE: premium_downloads テーブルは実DBに存在しないため、
    // lead 情報はサーバログへ記録し、機能（downloadUrl 返却）は継続。
    // 将来的に inquiries 等の実在テーブルへ移行する場合はここを復活させること。
    try {
      console.info('[Premium Download] lead received', {
        contentId: validatedData.contentId,
        name: validatedData.name,
        company: validatedData.company || null,
        email: validatedData.email,
        phone: validatedData.phone || null,
        industry: validatedData.industry,
        role: validatedData.role,
        consent: validatedData.consent,
        newsletter: validatedData.newsletter || false,
      })
    } catch (logError) {
      console.error('Premium download log failed:', logError)
    }

    // TODO: Send confirmation email via SendGrid
    // await sendConfirmationEmail(validatedData.email, validatedData.contentId)

    // TODO: Notify sales team for high-score leads
    // if (leadScore >= 8) {
    //   await notifySalesTeam(downloadRecord)
    // }

    // Return success response with download URL
    return NextResponse.json({
      success: true,
      message: 'ダウンロード情報を登録しました',
      downloadUrl: `/api/premium-content/files/${validatedData.contentId}`,
      contentId: validatedData.contentId,
    })

  } catch (error) {
    console.error('Premium content download error:', error)

    // Handle Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: '入力内容を確認してください',
          details: error.message
        },
        { status: 400 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: 'ダウンロードの処理中にエラーが発生しました',
        message: 'しばらくしてからもう一度お試しください'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/premium-content/download
 *
 * Returns download statistics and content info (for admin)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get('contentId')

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      )
    }

    // Get download statistics for this content.
    // NOTE: premium_downloads テーブルは実DBに存在しないため、統計は空を返す。
    return NextResponse.json({
      contentId,
      totalDownloads: 0,
      downloads: [],
    })

  } catch (error) {
    console.error('Premium content stats error:', error)
    return NextResponse.json(
      { error: '統計情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}
