import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sgMail from '@sendgrid/mail'

// Initialize SendGrid
if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY environment variable is not set')
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

const roiLeadSchema = z.object({
  name: z.string().min(1, 'お名前を入力してください'),
  company: z.string().min(1, '会社名を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  phone: z.string().min(1, '電話番号を入力してください'),
  projectDetails: z.string().optional(),
  consent: z.boolean().refine(val => val === true, '個人情報の取り扱いに同意が必要です'),
  calculatorData: z.object({
    selectedPouch: z.string(),
    size: z.object({ width: z.number(), height: z.number() }),
    quantity: z.number(),
    material: z.string(),
    printing: z.string(),
    addFeatures: z.array(z.string()),
    urgency: z.string(),
    priceResult: z.object({
      unitPrice: z.number(),
      totalPrice: z.number(),
      setupCost: z.number(),
      totalCost: z.number(),
      savings: z.number(),
      savingsRate: z.number(),
      priceBreak: z.string(),
      leadTime: z.number(),
      recommendedQuantity: z.number(),
      bulkDiscount: z.number()
    })
  }),
  leadScore: z.number()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = roiLeadSchema.parse(body)

    const {
      name,
      company,
      email,
      phone,
      projectDetails,
      calculatorData,
      leadScore
    } = validatedData

    // Determine lead quality
    let leadQuality = 'Standard'
    let priorityLevel = 'Normal'

    if (leadScore >= 60) {
      leadQuality = 'High'
      priorityLevel = 'High'
    } else if (leadScore >= 40) {
      leadQuality = 'Medium'
      priorityLevel = 'Medium'
    }

    // Helper functions for getting labels
    const getPouchLabel = (pouchId: string) => {
      const pouches: Record<string, string> = {
        'soft-3seal': 'ソフトパウチ（3シール）',
        'stand-up': 'スタンディングパウチ',
        'gusset': 'ガゼットパウチ',
        'pillow': 'ピローパウチ',
        'triangle': '三角パウチ'
      }
      return pouches[pouchId] || pouchId
    }

    const getMaterialLabel = (materialId: string) => {
      const materials: Record<string, string> = {
        'standard': 'PE（ポリエチレン）',
        'pet': 'PET（ポリエステル）',
        'aluminum': 'アルミラミネート',
        'kraft': 'クラフト紙',
        'bio': '生分解性素材'
      }
      return materials[materialId] || materialId
    }

    const getPrintingLabel = (printingId: string) => {
      const printings: Record<string, string> = {
        'none': '印刷なし',
        'digital': 'デジタル印刷',
        'flexo': 'フレキソ印刷',
        'gravure': 'グラビア印刷'
      }
      return printings[printingId] || printingId
    }

    // Send notification email to admin
    const adminEmail = {
      to: process.env.ADMIN_EMAIL || 'admin@epackage-lab.com',
      from: process.env.FROM_EMAIL || 'noreply@epackage-lab.com',
      subject: `【ROI計算】${leadQuality}リード - ${company}様`,
      html: `
        <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎯 ROI Calculator Lead</h1>
            <p style="margin: 10px 0 0; font-size: 18px; opacity: 0.9;">
              ${leadQuality} Quality Lead | Score: ${leadScore}/100
            </p>
          </div>

          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <!-- Lead Score Section -->
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #fbbf24;">
              <h3 style="margin: 0 0 15px 0; color: #d97706; font-size: 20px;">
                📊 Lead Analysis
              </h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                  <strong>Score:</strong> ${leadScore}/100<br>
                  <strong>Quality:</strong> ${leadQuality}<br>
                  <strong>Priority:</strong> ${priorityLevel}<br>
                  <strong>Source:</strong> ROI Calculator
                </div>
                <div>
                  <strong>Calculated Value:</strong> ¥${calculatorData.priceResult.totalCost.toLocaleString()}<br>
                  <strong>Quantity:</strong> ${calculatorData.quantity.toLocaleString()}<br>
                  <strong>Unit Price:</strong> ¥${calculatorData.priceResult.unitPrice}<br>
                  <strong>Lead Time:</strong> ${calculatorData.priceResult.leadTime} days
                </div>
              </div>
            </div>

            <!-- Basic Info -->
            <div style="margin-bottom: 25px;">
              <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; font-size: 18px;">
                👤 Contact Information
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
              </table>
            </div>

            <!-- Calculator Configuration -->
            <div style="margin-bottom: 25px;">
              <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; font-size: 18px;">
                🧮 Calculator Configuration
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #f9fafb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; width: 30%;">Pouch Type</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${getPouchLabel(calculatorData.selectedPouch)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Size</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${calculatorData.size.width}mm × ${calculatorData.size.height}mm</td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Quantity</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${calculatorData.quantity.toLocaleString()} pieces</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Material</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${getMaterialLabel(calculatorData.material)}</td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Printing</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${getPrintingLabel(calculatorData.printing)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Additional Features</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">
                    ${calculatorData.addFeatures.length > 0 ? calculatorData.addFeatures.join(', ') : 'None'}
                  </td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Urgency</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${calculatorData.urgency}</td>
                </tr>
              </table>
            </div>

            <!-- Price Breakdown -->
            <div style="margin-bottom: 25px;">
              <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; font-size: 18px;">
                💰 Price Breakdown
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #f9fafb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; width: 30%;">Unit Price</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">¥${calculatorData.priceResult.unitPrice.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Product Cost</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">¥${calculatorData.priceResult.totalPrice.toLocaleString()}</td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Setup Cost</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">¥${calculatorData.priceResult.setupCost.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Total Cost</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #ea580c; font-size: 18px;">
                    ¥${calculatorData.priceResult.totalCost.toLocaleString()}
                  </td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Savings</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; color: #16a34a;">
                    ¥${calculatorData.priceResult.savings.toLocaleString()} (${calculatorData.priceResult.savingsRate}%)
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Price Category</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${calculatorData.priceResult.priceBreak}</td>
                </tr>
              </table>
            </div>

            {/* Project Details */}
            {projectDetails && (
              <div style="margin-bottom: 25px;">
                <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; font-size: 18px;">
                  📝 Project Details
                </h3>
                <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0;">
                  <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${projectDetails}</p>
                </div>
              </div>
            )}

            {/* Action Required */}
            <div style="background: #fee2e2; border: 1px solid #fca5a5; padding: 20px; border-radius: 8px;">
              <h4 style="margin: 0 0 10px 0; color: #dc2626; font-size: 18px;">
                🚀 ${leadScore >= 60 ? 'High Priority - Immediate Action Required' : 'Follow Up Required'}
              </h4>
              <p style="margin: 0; color: #991b1b; line-height: 1.6;">
                ${leadScore >= 60
                  ? 'This lead has calculated a significant project value and shows strong purchase intent. Immediate follow-up recommended within 4 hours.'
                  : 'This lead has engaged with the ROI calculator and shows interest. Standard follow-up recommended within 24 hours.'
                }
              </p>
              <div style="margin-top: 15px;">
                <strong>Calculated Project Value:</strong> ¥${calculatorData.priceResult.totalCost.toLocaleString()}<br>
                <strong>Lead Score:</strong> ${leadScore}/100 (${leadQuality})<br>
                <strong>Next Steps:</strong> Contact to discuss specifications and provide detailed quotation
              </div>
            </div>
          </div>
        </div>
      `
    }

    // Send confirmation email to customer
    const customerEmail = {
      to: email,
      from: process.env.FROM_EMAIL || 'noreply@epackage-lab.com',
      subject: `【Epackage Lab】ROI計算結果のお送り`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ea580c;">Epackage Lab</h1>
            <h2 style="color: #374151; margin-bottom: 10px;">ROI計算結果</h2>
          </div>

          <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 15px;">📊</div>
            <h3 style="color: #16a34a; margin-bottom: 15px;">計算結果ありがとうございます</h3>
            <p style="font-size: 18px; margin-bottom: 10px;">
              <strong>${name}様</strong>
            </p>
            <p style="color: #6b7280;">
              パウチ包装のROI計算を完了いただき、ありがとうございます。
            </p>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: #d97706; margin-bottom: 15px;">📋 計算結果の概要</h4>
            <div style="text-align: center; margin-bottom: 15px;">
              <div style="font-size: 32px; font-weight: bold; color: #ea580c;">
                ¥${calculatorData.priceResult.totalCost.toLocaleString()}
              </div>
              <div style="color: #6b7280;">総額（税別）</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #6b7280; margin-bottom: 10px;">
                ¥${calculatorData.priceResult.unitPrice.toLocaleString()}
              </div>
              <div style="color: #6b7280; margin-bottom: 20px;">単価</div>
              <div style="background: #dcfce7; padding: 10px; border-radius: 6px; display: inline-block;">
                <span style="color: #16a34a; font-weight: bold;">
                  Lead Score: ${leadScore}/100 (${leadQuality})
                </span>
              </div>
            </div>
          </div>

          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: #0369a1; margin-bottom: 15px;">🔧 計算条件</h4>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li><strong>パウチタイプ:</strong> ${getPouchLabel(calculatorData.selectedPouch)}</li>
              <li><strong>サイズ:</strong> ${calculatorData.size.width}mm × ${calculatorData.size.height}mm</li>
              <li><strong>数量:</strong> ${calculatorData.quantity.toLocaleString()}個</li>
              <li><strong>素材:</strong> ${getMaterialLabel(calculatorData.material)}</li>
              <li><strong>印刷:</strong> ${getPrintingLabel(calculatorData.printing)}</li>
              <li><strong>納期:</strong> ${calculatorData.priceResult.leadTime}営業日</li>
              ${calculatorData.priceResult.savings > 0 ? `
              <li><strong>節約額:</strong> ¥${calculatorData.priceResult.savings.toLocaleString()}</li>
              ` : ''}
            </ul>
          </div>

          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: #dc2626; margin-bottom: 15px;">🚀 次のステップ</h4>
            <div style="line-height: 1.8;">
              <p style="margin: 0 0 15px 0;">
                計算結果を元に、専門担当者が詳細なご提案をさせていただきます。
              </p>
              <ol style="margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;"><strong>${leadScore >= 60 ? '4時間以内' : '24時間以内'}</strong>に専門担当者よりご連絡</li>
                <li style="margin-bottom: 8px;">詳細なヒアリングと仕様確認</li>
                <li style="margin-bottom: 8px;">正確なお見積もり作成</li>
                <li style="margin-bottom: 8px;">無料サンプルのご提案</li>
                <li>導入支援とアフターフォロー</li>
              </ol>
            </div>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="margin-bottom: 15px;">💡 参考情報</h4>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>この計算結果は参考価格です</li>
              <li>実際の価格は詳細仕様により変動します</li>
              <li>大量注文でさらなる割引が可能です</li>
              <li>納期は仕様により変更の場合があります</li>
            </ul>
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
              このメールは、Epackage LabのROI計算ツールより送信されました。<br>
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
      name,
      company,
      email,
      phone,
      projectDetails,
      calculatorData,
      leadScore,
      leadQuality,
      priorityLevel,
      inquiryType: 'roi_calculator',
      calculatedValue: calculatorData.priceResult.totalCost,
      submissionDate: new Date().toISOString(),
      source: 'roi_calculator'
    }

    // TODO: Store in database or CRM
    console.log('ROI Lead data to store:', leadData)

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'ROI計算結果を送信しました',
      leadScore,
      leadQuality,
      calculatedValue: calculatorData.priceResult.totalCost,
      nextSteps: leadScore >= 60
        ? '高品質リードとして認識されました。4時間以内にご連絡いたします。'
        : '24時間以内に担当者よりご連絡いたします。'
    })

  } catch (error) {
    console.error('ROI calculator lead error:', error)

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