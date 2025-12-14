import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Schema for unified quote submission
const unifiedQuoteSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  company: z.string().optional(),
  projectDetails: z.string().optional(),
  quoteData: z.object({
    productType: z.string(),
    quantity: z.number(),
    size: z.object({
      width: z.number(),
      height: z.number(),
      useManualInput: z.boolean()
    }),
    material: z.string(),
    printing: z.string(),
    urgency: z.string()
  }),
  priceResult: z.object({
    totalCost: z.number(),
    leadTime: z.number(),
    leadScore: z.number(),
    savings: z.number(),
    recommendations: z.array(z.string()),
    postProcessingOptions: z.array(z.string())
  })
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = unifiedQuoteSchema.parse(body)

    // Log the data (in production, you would save this to a database)
    console.log('Unified Quote Submission:', {
      timestamp: new Date().toISOString(),
      customer: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        company: validatedData.company
      },
      quote: validatedData.quoteData,
      result: validatedData.priceResult
    })

    // Prepare email content for admin notification
    const adminEmailContent = {
      to: process.env.ADMIN_EMAIL || 'admin@epackage-lab.com',
      from: process.env.FROM_EMAIL || 'noreply@epackage-lab.com',
      subject: `【高品質リード】見積もり依頼 - ${validatedData.company || validatedData.name}`,
      text: `
新しい見積もり依頼が届きました。

リードスコア: ${validatedData.priceResult.leadScore}/100
${validatedData.priceResult.leadScore >= 70 ? '⭐ 高品質リードです！' : ''}

お客様情報:
- お名前: ${validatedData.name}
- 会社名: ${validatedData.company || '未入力'}
- メール: ${validatedData.email}
- 電話: ${validatedData.phone}
- プロジェクト詳細: ${validatedData.projectDetails || '未入力'}

見積もり内容:
- 製品タイプ: ${validatedData.quoteData.productType}
- サイズ: ${validatedData.quoteData.size.width}×${validatedData.quoteData.size.height}mm
- 数量: ${validatedData.quoteData.quantity.toLocaleString()}枚
- 素材: ${validatedData.quoteData.material}
- 印刷: ${validatedData.quoteData.printing}
- 納期: ${validatedData.quoteData.urgency}

価格情報:
- 総費用: ¥${validatedData.priceResult.totalCost.toLocaleString()}
- 納期: ${validatedData.priceResult.leadTime}日
- 推定節約額: ¥${validatedData.priceResult.savings.toLocaleString()}

AI提案:
${validatedData.priceResult.recommendations.map(rec => `• ${rec}`).join('\n')}
      `.trim(),
      html: `
<h2>新しい見積もり依頼</h2>
<div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3>リードスコア: ${validatedData.priceResult.leadScore}/100</h3>
  ${validatedData.priceResult.leadScore >= 70 ? '<p style="color: #16a34a; font-weight: bold;">⭐ 高品質リードです！</p>' : ''}
</div>

<h3>お客様情報</h3>
<ul>
  <li><strong>お名前:</strong> ${validatedData.name}</li>
  <li><strong>会社名:</strong> ${validatedData.company || '未入力'}</li>
  <li><strong>メール:</strong> ${validatedData.email}</li>
  <li><strong>電話:</strong> ${validatedData.phone}</li>
  <li><strong>プロジェクト詳細:</strong> ${validatedData.projectDetails || '未入力'}</li>
</ul>

<h3>見積もり内容</h3>
<ul>
  <li><strong>製品タイプ:</strong> ${validatedData.quoteData.productType}</li>
  <li><strong>サイズ:</strong> ${validatedData.quoteData.size.width}×${validatedData.quoteData.size.height}mm</li>
  <li><strong>数量:</strong> ${validatedData.quoteData.quantity.toLocaleString()}枚</li>
  <li><strong>素材:</strong> ${validatedData.quoteData.material}</li>
  <li><strong>印刷:</strong> ${validatedData.quoteData.printing}</li>
  <li><strong>納期:</strong> ${validatedData.quoteData.urgency}</li>
</ul>

<h3>価格情報</h3>
<ul>
  <li><strong>総費用:</strong> ¥${validatedData.priceResult.totalCost.toLocaleString()}</li>
  <li><strong>納期:</strong> ${validatedData.priceResult.leadTime}日</li>
  <li><strong>推定節約額:</strong> ¥${validatedData.priceResult.savings.toLocaleString()}</li>
</ul>

<h3>AI提案</h3>
<ul>
  ${validatedData.priceResult.recommendations.map(rec => `<li>${rec}</li>`).join('')}
</ul>
      `
    }

    // Prepare email content for customer confirmation
    const customerEmailContent = {
      to: validatedData.email,
      from: process.env.FROM_EMAIL || 'noreply@epackage-lab.com',
      subject: '【Epackage Lab】お見積もり依頼を受け付けました',
      text: `
${validatedData.name}様

この度は、Epackage Labにお見積もり依頼をいただき、誠にありがとうございます。

お見積もり内容を受け付けましたので、ご連絡いたします。

■お見積もり内容サマリー
・製品タイプ: ${validatedData.quoteData.productType}
・サイズ: ${validatedData.quoteData.size.width}×${validatedData.quoteData.size.height}mm
・数量: ${validatedData.quoteData.quantity.toLocaleString()}枚
・総費用: ¥${validatedData.priceResult.totalCost.toLocaleString()}

■納期
${validatedData.priceResult.leadTime}営業日

後ほど、担当者より詳細なお見積もりとご提案をメールさせていただきます。

お急ぎの場合は、下記までお気軽にご連絡ください。
電話: 03-1234-5678
メール: info@epackage-lab.com

引き続きよろしくお願いいたします。

---
Epackage Lab
URL: https://epackage-lab.com
Email: info@epackage-lab.com
電話: 03-1234-5678
      `.trim(),
      html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #1e40af;">お見積もり依頼を受け付けました</h2>

  <p>${validatedData.name}様</p>

  <p>この度は、Epackage Labにお見積もり依頼をいただき、誠にありがとうございます。</p>

  <p>お見積もり内容を受け付けましたので、ご連絡いたします。</p>

  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #1e40af;">お見積もり内容サマリー</h3>
    <ul>
      <li>製品タイプ: ${validatedData.quoteData.productType}</li>
      <li>サイズ: ${validatedData.quoteData.size.width}×${validatedData.quoteData.size.height}mm</li>
      <li>数量: ${validatedData.quoteData.quantity.toLocaleString()}枚</li>
      <li>総費用: <strong>¥${validatedData.priceResult.totalCost.toLocaleString()}</strong></li>
    </ul>
  </div>

  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #92400e;">納期</h3>
    <p>${validatedData.priceResult.leadTime}営業日</p>
  </div>

  <p>後ほど、担当者より詳細なお見積もりとご提案をメールさせていただきます。</p>

  <p>お急ぎの場合は、下記までお気軽にご連絡ください。</p>

  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p><strong>電話:</strong> 03-1234-5678</p>
    <p><strong>メール:</strong> <a href="mailto:info@epackage-lab.com">info@epackage-lab.com</a></p>
  </div>

  <hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;">

  <p style="font-size: 14px; color: #6b7280;">
    引き続きよろしくお願いいたします。<br><br>
    <strong>Epackage Lab</strong><br>
    URL: <a href="https://epackage-lab.com">https://epackage-lab.com</a><br>
    Email: <a href="mailto:info@epackage-lab.com">info@epackage-lab.com</a><br>
    電話: 03-1234-5678
  </p>
</div>
      `
    }

    // Send emails (you would use SendGrid or another email service here)
    // For now, we'll just log the email content
    console.log('Admin Email:', adminEmailContent)
    console.log('Customer Email:', customerEmailContent)

    // TODO: Integrate with SendGrid
    // Example SendGrid implementation:
    /*
    import sgMail from '@sendgrid/mail'
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

    await Promise.all([
      sgMail.send(adminEmailContent),
      sgMail.send(customerEmailContent)
    ])
    */

    return NextResponse.json({
      success: true,
      message: '見積もり依頼を受け付けました',
      leadScore: validatedData.priceResult.leadScore
    })

  } catch (error) {
    console.error('Unified quote submission error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: '入力内容に誤りがあります',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: '送信に失敗しました。時間をおいて再度お試しください。'
    }, { status: 500 })
  }
}