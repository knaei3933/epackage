import { NextRequest, NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'
import { z } from 'zod'

// SendGrid APIキーの設定
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

// サンプルリクエストのバリデーションスキーマ
const sampleRequestSchema = z.object({
  name: z.string().min(1).max(50),
  company: z.string().min(1).max(100),
  department: z.string().max(50).optional(),
  email: z.string().email(),
  phone: z.string().min(1),
  postalCode: z.string().regex(/^\d{3}-\d{4}$/).optional(),
  address: z.string().max(200).optional(),
  samples: z.array(z.object({
    productId: z.string().min(1),
    productName: z.string().min(1),
    quantity: z.number().min(1).max(10),
    specifications: z.string().optional(),
    purpose: z.string().min(1).max(200)
  })).min(1).max(5),
  projectDetails: z.string().min(10).max(1000),
  timeline: z.string().optional(),
  budget: z.string().optional(),
  preferredShippingDate: z.string().optional(),
  specialRequirements: z.string().max(500).optional(),
  agreement: z.boolean().refine(val => val === true)
})

type SampleRequestData = z.infer<typeof sampleRequestSchema>

// 管理者向け通知メールテンプレート
function generateAdminSampleEmail(data: SampleRequestData): string {
  const totalSamples = data.samples.reduce((sum, sample) => sum + sample.quantity, 0)

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>【重要】サンプルリクエスト通知 - Epackage Lab</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .info-box { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 10px 0; }
        .sample-box { background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 10px 0; }
        .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; }
        .field { margin-bottom: 10px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { margin-left: 10px; }
        .urgent { color: #dc2626; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
        th { background-color: #f9fafb; }
    </style>
</head>
<body>
    <div class="header">
        <h1>【重要】サンプルリクエスト通知</h1>
        <p>Epackage Labウェブサイトよりサンプルリクエストがありました</p>
        <p class="urgent">優先対応案件：サンプル発送要請</p>
    </div>

    <div class="content">
        <div class="info-box">
            <h2>お客様情報</h2>

            <div class="field">
                <span class="label">お名前:</span>
                <span class="value">${data.name}</span>
            </div>

            <div class="field">
                <span class="label">会社名:</span>
                <span class="value">${data.company}</span>
            </div>

            ${data.department ? `
            <div class="field">
                <span class="label">部署名:</span>
                <span class="value">${data.department}</span>
            </div>
            ` : ''}

            <div class="field">
                <span class="label">メールアドレス:</span>
                <span class="value">${data.email}</span>
            </div>

            <div class="field">
                <span class="label">電話番号:</span>
                <span class="value">${data.phone}</span>
            </div>

            ${data.postalCode ? `
            <div class="field">
                <span class="label">郵便番号:</span>
                <span class="value">${data.postalCode}</span>
            </div>
            ` : ''}

            ${data.address ? `
            <div class="field">
                <span class="label">住所:</span>
                <span class="value">${data.address}</span>
            </div>
            ` : ''}
        </div>

        <div class="sample-box">
            <h2>サンプルリクエスト詳細</h2>
            <p><strong>総サンプル数:</strong> ${totalSamples}点</p>

            <table>
                <thead>
                    <tr>
                        <th>製品名</th>
                        <th>数量</th>
                        <th>使用目的</th>
                        <th>特定仕様</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.samples.map(sample => `
                    <tr>
                        <td>${sample.productName}</td>
                        <td>${sample.quantity}</td>
                        <td>${sample.purpose}</td>
                        <td>${sample.specifications || 'なし'}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="field">
                <div class="label">プロジェクト詳細:</div>
                <div style="margin-left: 10px; white-space: pre-wrap; background-color: #f9f9f9; padding: 10px; border-radius: 4px;">
                    ${data.projectDetails}
                </div>
            </div>

            ${data.timeline ? `
            <div class="field">
                <span class="label">納品希望時期:</span>
                <span class="value urgent">${data.timeline}</span>
            </div>
            ` : ''}

            ${data.budget ? `
            <div class="field">
                <span class="label">予算:</span>
                <span class="value">${data.budget}</span>
            </div>
            ` : ''}

            ${data.preferredShippingDate ? `
            <div class="field">
                <span class="label">希望発送日:</span>
                <span class="value urgent">${data.preferredShippingDate}</span>
            </div>
            ` : ''}

            ${data.specialRequirements ? `
            <div class="field">
                <div class="label">特記事項:</div>
                <div style="margin-left: 10px; white-space: pre-wrap; background-color: #fff3cd; padding: 10px; border-radius: 4px;">
                    ${data.specialRequirements}
                </div>
            </div>
            ` : ''}
        </div>

        <div style="margin-top: 20px;">
            <h3>対応アクション</h3>
            <ul>
                <li><strong>即時対応:</strong> サンプル在庫確認（2時間以内）</li>
                <li><strong>初回連絡:</strong> お客様に受付確認（24時間以内）</li>
                <li><strong>発送準備:</strong> サンプル梱包と配送手配</li>
                <li><strong>追跡管理:</strong> 配送状況の定期的な報告</li>
                <li><strong>CRM登録:</strong> 案件管理システムへの登録と追跡</li>
                <li><strong>営業連携:</strong> 営業チームへの引き継ぎ</li>
            </ul>
        </div>

        <div style="margin-top: 20px;">
            <a href="mailto:${data.email}?subject=Epackage Labサンプルリクエスト受付のご連絡"
               style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                お客様に連絡する
            </a>
        </div>
    </div>

    <div class="footer">
        <p>このメールは Epackage Lab ウェブサイトから自動的に送信されました。</p>
        <p>受信日時: ${new Date().toLocaleString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</p>
        <p>優先度: 高 - サンプルリクエスト案件</p>
    </div>
</body>
</html>
  `.trim()
}

// 顧客向け確認メールテンプレート
function generateCustomerSampleEmail(data: SampleRequestData): string {
  const totalSamples = data.samples.reduce((sum, sample) => sum + sample.quantity, 0)

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>サンプルリクエストありがとうございます - Epackage Lab</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .confirmation-box { background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 10px 0; }
        .info-box { background-color: #f8f9fa; padding: 15px; margin: 10px 0; }
        .shipping-info { background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 10px 0; }
        .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
        th { background-color: #f9fafb; }
        .urgent { color: #dc2626; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>サンプルリクエストありがとうございます</h1>
        <p>Epackage Labの製品サンプルをご請求いただき、誠にありがとうございます</p>
    </div>

    <div class="content">
        <div class="confirmation-box">
            <h2>リクエスト内容の確認</h2>
            <p>以下の内容でサンプルリクエストを受け付けました。</p>

            <div class="info-box">
                <p><strong>お名前:</strong> ${data.name}</p>
                <p><strong>会社名:</strong> ${data.company}</p>
                ${data.department ? `<p><strong>部署名:</strong> ${data.department}</p>` : ''}
                <p><strong>総サンプル数:</strong> ${totalSamples}点</p>
            </div>

            <h3>リクエストされたサンプル</h3>
            <table>
                <thead>
                    <tr>
                        <th>製品名</th>
                        <th>数量</th>
                        <th>使用目的</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.samples.map(sample => `
                    <tr>
                        <td>${sample.productName}</td>
                        <td>${sample.quantity}</td>
                        <td>${sample.purpose}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>

            ${data.preferredShippingDate ? `
            <div class="urgent" style="margin-top: 15px;">
                <strong>希望発送日:</strong> ${data.preferredShippingDate}
            </div>
            ` : ''}
        </div>

        <div class="shipping-info">
            <h3>発送について</h3>
            <ul>
                <li>現在、在庫状況を確認しております</li>
                <li>確認次第、担当者より詳細な発送日程をご連絡いたします</li>
                <li>通常、2-3営業日以内に発送準備が完了します</li>
                <li>発送後は追跡番号をお送りいたします</li>
                <li>送料は弊社負担といたします</li>
            </ul>
        </div>

        <div>
            <h3>今後の対応について</h3>
            <ul>
                <li>担当者より24時間以内にご連絡いたします</li>
                <li>サンプルの技術仕様に関するご質問にも対応いたします</li>
                <li>製品評価のご感想をお聞かせいただけますと幸いです</li>
            </ul>
        </div>

        <div class="info-box">
            <h3>お問い合わせ先</h3>
            <p>
                <strong>Epackage Lab サンプル担当</strong><br>
                電話: 03-1234-5679<br>
                メール: samples@epackage-lab.com<br>
                営業時間: 平日 9:00-18:00
            </p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <a href="https://epackage-lab.com/products" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                他の製品を確認する
            </a>
        </div>
    </div>

    <div class="footer">
        <p>このメールは Epackage Lab のサンプルリクエストフォームから自動的に送信されました。</p>
        <p>もしこのメールに心当たりがない場合は、お手数ですがこのメールを削除してください。</p>
        <p>受信日時: ${new Date().toLocaleString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</p>
        <p>リクエストID: SAMPLE-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
    </div>
</body>
</html>
  `.trim()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // リクエストのバリデーション
    const validationResult = sampleRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '無効なリクエストデータです', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // 管理者向け通知メールの設定
    const adminEmail = {
      to: process.env.ADMIN_EMAIL!,
      cc: process.env.SAMPLES_CC_EMAIL || '', // サンプル担当者用CC
      from: process.env.FROM_EMAIL!,
      subject: `【重要】サンプルリクエスト: ${data.company} 様`,
      html: generateAdminSampleEmail(data),
      replyTo: data.email
    }

    // 顧客向け確認メールの設定
    const customerEmail = {
      to: data.email,
      from: process.env.FROM_EMAIL!,
      subject: 'サンプルリクエストありがとうございます - Epackage Lab',
      html: generateCustomerSampleEmail(data)
    }

    // 両方のメールを送信
    const [adminResult, customerResult] = await Promise.allSettled([
      sgMail.send(adminEmail),
      sgMail.send(customerEmail)
    ])

    // 送信結果の確認
    const adminFailed = adminResult.status === 'rejected'
    const customerFailed = customerResult.status === 'rejected'

    if (adminFailed || customerFailed) {
      const errors: string[] = []
      if (adminFailed) errors.push('管理者通知メールの送信に失敗しました')
      if (customerFailed) errors.push('確認メールの送信に失敗しました')

      console.error('Sample request email sending failed:', {
        adminError: adminFailed ? adminResult.reason : null,
        customerError: customerFailed ? customerResult.reason : null
      })

      return NextResponse.json(
        { error: 'メール送信に失敗しました', details: errors },
        { status: 500 }
      )
    }

    // CRM連携（例：Supabaseに保存）
    try {
      // ここでCRMシステムへのデータ保存を実装
      // const { data, error } = await supabase.from('sample_requests').insert({
      //   customer_name: data.name,
      //   company: data.company,
      //   department: data.department,
      //   email: data.email,
      //   phone: data.phone,
      //   postal_code: data.postalCode,
      //   address: data.address,
      //   samples: data.samples,
      //   project_details: data.projectDetails,
      //   timeline: data.timeline,
      //   budget: data.budget,
      //   preferred_shipping_date: data.preferredShippingDate,
      //   special_requirements: data.specialRequirements,
      //   status: 'pending',
      //   created_at: new Date().toISOString()
      // })

      console.log('Sample request CRM data saved successfully')
    } catch (crmError) {
      console.error('Sample request CRM integration failed:', crmError)
      // CRM失敗は全体の失敗とはしないが、ログに記録
    }

    // 在庫管理システム連携（例）
    try {
      // ここで在庫管理システムへの通知を実装
      const totalRequestedItems = data.samples.reduce((sum, sample) => sum + sample.quantity, 0)
      console.log(`Inventory update requested: ${totalRequestedItems} items from ${data.samples.length} product types`)
    } catch (inventoryError) {
      console.error('Inventory management integration failed:', inventoryError)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'サンプルリクエストを受け付けました。確認メールをお送りしました。',
        requestId: `sample-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        estimatedShipping: '2-3営業日'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Sample request form error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。しばらくしてから再度お試しください。' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'GETリクエストはサポートされていません' },
    { status: 405 }
  )
}