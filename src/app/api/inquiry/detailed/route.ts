import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sgMail from '@sendgrid/mail'
import { detailedInquirySchema } from '@/types/inquiry'
import { calculateLeadScore } from '@/types/inquiry'

// Initialize SendGrid
if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY environment variable is not set')
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

const detailedInquiryRequestSchema = detailedInquirySchema.and(
  z.object({
    leadScore: z.number().min(0).max(100)
  })
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = detailedInquiryRequestSchema.parse(body)

    // Calculate or verify lead score
    const calculatedScore = calculateLeadScore(validatedData)
    const leadScore = validatedData.leadScore || calculatedScore

    // Determine lead quality
    let leadQuality = 'Standard'
    let priorityLevel = 'Normal'

    if (leadScore >= 70) {
      leadQuality = 'High'
      priorityLevel = 'High'
    } else if (leadScore >= 40) {
      leadQuality = 'Medium'
      priorityLevel = 'Medium'
    }

    // Format data for email
    const {
      name,
      company,
      email,
      phone,
      department,
      position,
      industry,
      employeeCount,
      annualRevenue,
      website,
      location,
      pouchTypes,
      productType,
      monthlyQuantity,
      timeline,
      budget,
      materials,
      printing,
      features,
      specialRequirements,
      currentSupplier,
      challenges,
      decisionMaker,
      competitorAnalysis,
      message,
      fileAttachment
    } = validatedData

    // Helper function for getting labels
    const getIndustryLabel = (industry: string) => {
      const labels: Record<string, string> = {
        'food': '食品・飲料',
        'cosmetics': '化粧品・トイレタリー',
        'medical': '医療・医薬品',
        'retail': '小売・流通',
        'electronics': '電子機器・精密機器',
        'agriculture': '農業・畜産',
        'chemical': '化学工業',
        'automotive': '自動車・部品',
        'other': 'その他'
      }
      return labels[industry] || industry
    }

    const getTimelineLabel = (timeline: string) => {
      const labels: Record<string, string> = {
        'urgent-1month': '1ヶ月以内（急ぎ）',
        'normal-3months': '3ヶ月以内',
        'planned-6months': '6ヶ月以内（計画的）',
        'researching': '検討段階'
      }
      return labels[timeline] || timeline
    }

    const getBudgetLabel = (budget: string) => {
      const labels: Record<string, string> = {
        'under-500k': '50万円未満',
        '500k-1m': '50万〜100万円',
        '1m-5m': '100万〜500万円',
        '5m-10m': '500万〜1000万円',
        '10m-50m': '1000万〜5000万円',
        '50m+': '5000万円以上',
        'consultation': 'ご相談（予算未定）'
      }
      return labels[budget] || budget
    }

    // Send notification email to admin
    const adminEmail = {
      to: process.env.ADMIN_EMAIL || 'admin@epackage-lab.com',
      from: process.env.FROM_EMAIL || 'noreply@epackage-lab.com',
      subject: `【詳細お問い合わせ】${leadQuality}リード - ${company}様`,
      html: `
        <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎯 詳細お問い合わせ受付</h1>
            <p style="margin: 10px 0 0; font-size: 18px; opacity: 0.9;">${leadQuality} Quality Lead | Score: ${leadScore}/100</p>
          </div>

          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <!-- Lead Score Section -->
            <div style="background: ${leadScore >= 70 ? '#fef3c7' : '#f0fdf4'}; padding: 20px; border-radius: 8px; margin-bottom: 25px; border: 1px solid ${leadScore >= 70 ? '#fbbf24' : '#22c55e'};">
              <h3 style="margin: 0 0 15px 0; color: ${leadScore >= 70 ? '#d97706' : '#16a34a'}; font-size: 20px;">
                📊 Lead Analysis
              </h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                  <strong>Score:</strong> ${leadScore}/100<br>
                  <strong>Quality:</strong> ${leadQuality}<br>
                  <strong>Priority:</strong> ${priorityLevel}
                </div>
                <div>
                  <strong>Timeline:</strong> ${getTimelineLabel(timeline)}<br>
                  <strong>Budget:</strong> ${getBudgetLabel(budget)}<br>
                  <strong>Quantity:</strong> ${monthlyQuantity}
                </div>
              </div>
            </div>

            <!-- Basic Info -->
            <div style="margin-bottom: 25px;">
              <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; font-size: 18px;">
                👤 Basic Information
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #f9fafb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; width: 30%;">Name</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Company</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${company}</td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Email</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Phone</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${phone}</td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Department/Position</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${department || '-'} / ${position || '-'}</td>
                </tr>
              </table>
            </div>

            <!-- Company Info -->
            <div style="margin-bottom: 25px;">
              <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; font-size: 18px;">
                🏢 Company Profile
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #f9fafb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; width: 30%;">Industry</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${getIndustryLabel(industry)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Employees</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${employeeCount}</td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Annual Revenue</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${annualRevenue}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Location</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${location || '-'}</td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Website</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${website || '-'}</td>
                </tr>
              </table>
            </div>

            <!-- Project Requirements -->
            <div style="margin-bottom: 25px;">
              <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; font-size: 18px;">
                📦 Project Requirements
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #f9fafb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; width: 30%;">Pouch Types</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${Array.isArray(pouchTypes) ? pouchTypes.join(', ') : '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Product Type</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${productType}</td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Monthly Quantity</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${monthlyQuantity}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Timeline</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${getTimelineLabel(timeline)}</td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Budget</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${getBudgetLabel(budget)}</td>
                </tr>
              </table>
            </div>

            <!-- Technical Requirements -->
            <div style="margin-bottom: 25px;">
              <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; font-size: 18px;">
                ⚙️ Technical Requirements
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #f9fafb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; width: 30%;">Materials</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${Array.isArray(materials) ? materials.join(', ') : '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Printing</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${printing?.type || '-'} ${printing?.colors ? `(${printing.colors})` : ''}</td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Features</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${Array.isArray(features) ? features.join(', ') : '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Special Requirements</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${specialRequirements || '-'}</td>
                </tr>
              </table>
            </div>

            <!-- Additional Information -->
            <div style="margin-bottom: 25px;">
              <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; font-size: 18px;">
                📝 Additional Information
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #f9fafb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; width: 30%;">Current Supplier</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${currentSupplier || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Challenges</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${challenges || '-'}</td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Decision Maker</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${decisionMaker || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Competitor Analysis</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${competitorAnalysis || '-'}</td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">File Attachment</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${fileAttachment || '-'}</td>
                </tr>
              </table>
            </div>

            <!-- Message -->
            <div style="margin-bottom: 25px;">
              <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; font-size: 18px;">
                💬 Message
              </h3>
              <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
              </div>
            </div>

            <!-- Action Required -->
            <div style="background: #fee2e2; border: 1px solid #fca5a5; padding: 20px; border-radius: 8px;">
              <h4 style="margin: 0 0 10px 0; color: #dc2626; font-size: 18px;">
                ${leadScore >= 70 ? '🚀 High Priority - Immediate Action Required' : '📞 Follow Up Required'}
              </h4>
              <p style="margin: 0; color: #991b1b; line-height: 1.6;">
                ${leadScore >= 70
                  ? 'This is a high-quality lead with strong purchase intent. Immediate follow-up recommended within 4 hours.'
                  : 'Standard lead follow-up recommended within 24 hours.'
                }
              </p>
            </div>
          </div>
        </div>
      `
    }

    // Send confirmation email to customer
    const customerEmail = {
      to: email,
      from: process.env.FROM_EMAIL || 'noreply@epackage-lab.com',
      subject: `【Epackage Lab】詳細お問い合わせありがとうございます`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ea580c;">Epackage Lab</h1>
            <h2 style="color: #374151; margin-bottom: 10px;">詳細お問い合わせ受付完了</h2>
          </div>

          <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
            <h3 style="color: #16a34a; margin-bottom: 15px;">お問い合わせありがとうございます</h3>
            <p style="font-size: 18px; margin-bottom: 10px;">
              <strong>${name}様</strong>
            </p>
            <p style="color: #6b7280;">
              詳細な情報をご提供いただき、誠にありがとうございます。
            </p>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: #d97706; margin-bottom: 15px;">📊 お客様のリードスコア</h4>
            <div style="text-align: center; margin-bottom: 10px;">
              <div style="font-size: 32px; font-weight: bold; color: #ea580c;">${leadScore}/100</div>
              <div style="color: #6b7280;">${leadQuality} Quality Lead</div>
            </div>
            <p style="margin: 15px 0 0 0; color: #92400e; font-size: 14px;">
              ${leadScore >= 70
                ? '高品質リードと評価されております。優先的なご対応を予定しております。'
                : 'お客様のご要望に基づき、最適なご提案を準備いたします。'
              }
            </p>
          </div>

          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: #0369a1; margin-bottom: 15px;">📋 ご提供いただいた情報の概要</h4>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>企業名: ${company}</li>
              <li>業種: ${getIndustryLabel(industry)}</li>
              <li>希望パウチタイプ: ${Array.isArray(pouchTypes) ? pouchTypes.join(', ') : '-'}</li>
              <li>月産数量: ${monthlyQuantity}</li>
              <li>希望納期: ${getTimelineLabel(timeline)}</li>
              <li>予算規模: ${getBudgetLabel(budget)}</li>
            </ul>
          </div>

          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: #dc2626; margin-bottom: 15px;">🚀 次のステップ</h4>
            <div style="line-height: 1.8;">
              <p style="margin: 0 0 15px 0;">
                専門担当者より詳細なヒアリングとご提案をさせていただきます。
              </p>
              <ol style="margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;"><strong>${leadScore >= 70 ? '4時間以内' : '24時間以内'}</strong>に担当者よりご連絡</li>
                <li style="margin-bottom: 8px;">詳細なヒアリングと要件確認</li>
                <li style="margin-bottom: 8px;">無料サンプルのご提案</li>
                <li style="margin-bottom: 8px;">詳細お見積もり作成</li>
                <li>導入支援とアフターフォロー</li>
              </ol>
            </div>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="margin-bottom: 15px;">📞 お問い合わせ</h4>
            <p style="margin: 0; line-height: 1.8;">
              ご不明な点や急ぎのご用件がございましたら、お気軽にご連絡ください。<br><br>
              <strong>Epackage Lab</strong><br>
              電話: 03-1234-5678（平日 9:00-18:00）<br>
              メール: info@epackage-lab.com（24時間受付）
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f3f4f6; border-radius: 8px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              このメールは、Epackage Labの詳細お問い合わせフォームより送信されました。<br>
              ご心配な点がございましたら、お気軽にご返信ください。
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
      leadQuality,
      priorityLevel,
      inquiryType: 'detailed_inquiry',
      submissionDate: new Date().toISOString(),
      source: 'detailed_inquiry_form'
    }

    // TODO: Store in database or CRM
    console.log('Lead data to store:', leadData)

    // Return success response
    return NextResponse.json({
      success: true,
      message: '詳細お問い合わせを送信しました',
      leadScore,
      leadQuality,
      nextSteps: leadScore >= 70
        ? '高品質リードとして認識されました。4時間以内にご連絡いたします。'
        : '24時間以内に担当者よりご連絡いたします。'
    })

  } catch (error) {
    console.error('Detailed inquiry error:', error)

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