import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sgMail from '@sendgrid/mail'
import { premiumContentSchema } from '@/types/premium-content'

// Initialize SendGrid
if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY environment variable is not set')
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

const downloadRequestSchema = premiumContentSchema.extend({
  contentId: z.string().min(1, 'コンテンツIDが必要です')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = downloadRequestSchema.parse(body)

    // Get premium content info
    const { premiumContents } = await import('@/types/premium-content')
    const content = premiumContents.find(c => c.id === validatedData.contentId)

    if (!content) {
      return NextResponse.json(
        { error: '指定されたコンテンツが見つかりません' },
        { status: 404 }
      )
    }

    // Generate lead score
    let leadScore = content.leadScore

    // Add points for newsletter subscription
    if (validatedData.newsletter) {
      leadScore += 2
    }

    // Add points for company information
    if (validatedData.company) {
      leadScore += 1
    }

    // Add points for phone number
    if (validatedData.phone) {
      leadScore += 1
    }

    // Send notification email to admin
    const adminEmail = {
      to: process.env.ADMIN_EMAIL || 'admin@epackage-lab.com',
      from: process.env.FROM_EMAIL || 'noreply@epackage-lab.com',
      subject: `【プレミアムコンテンツDL】${content.title} - ${validatedData.company || validatedData.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ea580c; margin-bottom: 20px;">📊 プレミアムコンテンツダウンロード</h2>

          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #16a34a; margin-bottom: 10px;">コンテンツ情報</h3>
            <p><strong>タイトル:</strong> ${content.title}</p>
            <p><strong>カテゴリ:</strong> ${content.category}</p>
            <p><strong>ファイル形式:</strong> ${content.format}</p>
            <p><strong>ファイルサイズ:</strong> ${content.fileSize}</p>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #d97706; margin-bottom: 10px;">🎯 リードスコア: ${leadScore}/15</h3>
            <p style="font-size: 14px;">※コンテンツ内容(${content.leadScore}点) + 会社情報(+${validatedData.company ? 1 : 0}点) + 電話番号(+${validatedData.phone ? 1 : 0}点) + ニュースレター(+${validatedData.newsletter ? 2 : 0}点)</p>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px;">お客様情報</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>氏名:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${validatedData.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>会社名:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${validatedData.company || '未入力'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>メール:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${validatedData.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>電話番号:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${validatedData.phone || '未入力'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>業種:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${getIndustryLabel(validatedData.industry)}</td>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>役職:</strong></td>
                <td style="padding: 8px;">${getRoleLabel(validatedData.role)}</td>
              </tr>
            </table>
          </div>

          <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #dc2626; margin-bottom: 10px;">🔥 高リードスコアのお客様</h3>
            <p style="font-size: 14px; margin: 0;">
              リードスコアが${leadScore >= 10 ? '高く' : '標準レベルで'}あります。${leadScore >= 10 ? '優先的なフォローアップをおすすめします。' : ''}
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f0f9ff; border-radius: 8px;">
            <p style="margin: 0; color: #0369a1;">
              <strong>フォローアップ推奨:</strong> ${leadScore >= 10 ? '24時間以内' : '48時間以内'}のご連絡をおすすめします
            </p>
          </div>
        </div>
      `
    }

    // Send confirmation email to customer
    const customerEmail = {
      to: validatedData.email,
      from: process.env.FROM_EMAIL || 'noreply@epackage-lab.com',
      subject: `【Epackage Lab】${content.title}のごダウンロードありがとうございます`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ea580c;">Epackage Lab</h1>
            <h2 style="color: #374151; margin-bottom: 10px;">プレミアムコンテンツダウンロード</h2>
          </div>

          <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 15px;">📊</div>
            <h3 style="color: #16a34a; margin-bottom: 15px;">ダウンロードありがとうございます</h3>
            <p style="font-size: 18px; margin-bottom: 10px;">
              <strong>${content.title}</strong>
            </p>
            <p style="color: #6b7280;">
              ${content.description}
            </p>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: #d97706; margin-bottom: 15px;">📁 コンテンツ情報</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>ファイル形式: ${content.format}</li>
              <li>ファイルサイズ: ${content.fileSize}</li>
              <li>ページ数: ${content.pageCount}ページ</li>
            </ul>
          </div>

          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: #0369a1; margin-bottom: 15px;">💡 活用シーン</h4>
            <p style="margin: 0;">
              このコンテンツは、以下のような場面で活用いただけます。<br>
              ・パウチ導入の検討<br>
              ・予算策定とROI計算<br>
              ・社内への提案資料作成<br>
              ・業界トレンドの把握
            </p>
          </div>

          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: #dc2626; margin-bottom: 15px;">🚀 次のステップ</h4>
            <p style="margin-bottom: 15px;">
              コンテンツをご覧いただき、具体的なご要望やご質問がございましたら、
              お気軽にご相談ください。専門スタッフが最適なソリューションをご提案します。
            </p>
            <div style="text-align: center;">
              <a href="/contact/" style="display: inline-block; background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                無料相談する
              </a>
            </div>
          </div>

          <div style="border-top: 2px solid #f3f4f6; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>このメールは、Epackage Labのプレミアムコンテンツダウンロードフォームより送信されました。</p>
            <p style="margin-top: 10px;">ご質問やご不明な点がございましたら、下記までご連絡ください。</p>
            <p style="margin-top: 15px;">
              <strong>Epackage Lab</strong><br>
              メール: info@epackage-lab.com<br>
              電話: 03-1234-5678
            </p>
          </div>
        </div>
      `
    }

    // Send emails
    if (process.env.SENDGRID_API_KEY) {
      await Promise.all([
        sgMail.send(adminEmail),
        sgMail.send(customerEmail)
      ])
    } else {
      console.warn('SendGrid not configured. Emails not sent.')
    }

    // Store lead data (you can integrate with CRM here)
    const leadData = {
      ...validatedData,
      leadScore,
      contentType: 'premium_content',
      contentTitle: content.title,
      downloadDate: new Date().toISOString(),
      source: 'premium_content_download'
    }

    // TODO: Store in database or CRM
    console.log('Lead data to store:', leadData)

    // Return success response with download URL
    return NextResponse.json({
      success: true,
      message: 'ダウンロード情報を送信しました',
      downloadUrl: `/premium-content/files/${validatedData.contentId}.${content.format.toLowerCase()}`,
      leadScore
    })

  } catch (error) {
    console.error('Premium content download error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '入力内容に誤りがあります', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'エラーが発生しました。時間をおいて再度お試しください' },
      { status: 500 }
    )
  }
}

// Helper functions
function getIndustryLabel(industry: string): string {
  const labels: Record<string, string> = {
    food: '食品',
    cosmetics: '化粧品',
    medical: '医療',
    retail: '小売',
    electronics: '電子機器',
    agriculture: '農業',
    chemical: '化学',
    automotive: '自動車',
    other: 'その他'
  }
  return labels[industry] || industry
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    president: '社長',
    manager: '部長・マネージャー',
    engineer: '技術担当',
    purchasing: '購買担当',
    marketing: 'マーケティング担当',
    other: 'その他'
  }
  return labels[role] || role
}