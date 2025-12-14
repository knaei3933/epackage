import { NextRequest, NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'
import { z } from 'zod'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

// SendGrid APIキーの設定
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

// お問い合わせリクエストのバリデーションスキーマ
const contactRequestSchema = z.object({
  name: z.string().min(1).max(50),
  company: z.string().max(100).optional(),
  email: z.string().email(),
  phone: z.string().min(1),
  subject: z.string().min(1).max(100),
  message: z.string().min(1).max(1000),
  inquiryType: z.enum(['general', 'technical', 'sales', 'support']),
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),
  preferredContact: z.enum(['email', 'phone']).default('email')
})

type ContactRequest = z.infer<typeof contactRequestSchema>

// お問い合わせ種別の日本語表示名
const inquiryTypeLabels: Record<string, string> = {
  general: '一般お問い合わせ',
  technical: '技術的なお問い合わせ',
  sales: '営業関連',
  support: 'サポート'
}

// 緊急度の日本語表示名
const urgencyLabels: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高'
}

// 希望連絡方法の日本語表示名
const preferredContactLabels: Record<string, string> = {
  email: 'メール',
  phone: '電話'
}

// 管理者向け通知メールテンプレート
function generateAdminEmail(data: ContactRequest): string {
  const inquiryTypeLabel = inquiryTypeLabels[data.inquiryType] || data.inquiryType
  const urgencyLabel = urgencyLabels[data.urgency] || data.urgency
  const preferredContactLabel = preferredContactLabels[data.preferredContact] || data.preferredContact

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>【重要】新しいお問い合わせ通知 - Epackage Lab</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .info-box { background-color: #f8f9fa; border-left: 4px solid #2563eb; padding: 15px; margin: 10px 0; }
        .urgent { border-left-color: #dc2626; }
        .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; }
        .field { margin-bottom: 10px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { margin-left: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>【重要】新しいお問い合わせ通知</h1>
        <p>Epackage Labウェブサイトよりお問い合わせがありました</p>
    </div>

    <div class="content">
        <div class="info-box ${data.urgency === 'high' ? 'urgent' : ''}">
            <h2>お問い合わせ詳細</h2>

            <div class="field">
                <span class="label">お名前:</span>
                <span class="value">${data.name}</span>
            </div>

            ${data.company ? `
            <div class="field">
                <span class="label">会社名:</span>
                <span class="value">${data.company}</span>
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

            <div class="field">
                <span class="label">お問い合わせ種別:</span>
                <span class="value">${inquiryTypeLabel}</span>
            </div>

            <div class="field">
                <span class="label">件名:</span>
                <span class="value">${data.subject}</span>
            </div>

            <div class="field">
                <span class="label">緊急度:</span>
                <span class="value">${urgencyLabel}</span>
            </div>

            <div class="field">
                <span class="label">希望連絡方法:</span>
                <span class="value">${preferredContactLabel}</span>
            </div>

            <div class="field">
                <div class="label">お問い合わせ内容:</div>
                <div style="margin-left: 10px; white-space: pre-wrap; background-color: #f9f9f9; padding: 10px; border-radius: 4px;">
                    ${data.message}
                </div>
            </div>
        </div>

        <div style="margin-top: 20px;">
            <h3>対応アクション</h3>
            <ul>
                <li>お問い合わせ内容を確認し、24時間以内に初回対応</li>
                <li>緊急度が「高」の場合は優先的に対応</li>
                <li>希望連絡方法に従って迅速なご連絡</li>
                <li>CRMシステムに情報を登録し、追跡管理を実施</li>
            </ul>
        </div>

        <div style="margin-top: 20px;">
            <a href="mailto:${data.email}?subject=Epackage Labお問い合わせ受付: ${data.subject}"
               style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                メールで返信する
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
    </div>
</body>
</html>
  `.trim()
}

// 顧客向け確認メールテンプレート
function generateCustomerEmail(data: ContactRequest): string {
  const inquiryTypeLabel = inquiryTypeLabels[data.inquiryType] || data.inquiryType

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>お問い合わせありがとうございます - Epackage Lab</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .confirmation-box { background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 10px 0; }
        .info-box { background-color: #f8f9fa; padding: 15px; margin: 10px 0; }
        .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; }
        .contact-info { background-color: #e5e7eb; padding: 15px; border-radius: 4px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>お問い合わせありがとうございます</h1>
        <p>Epackage Labにご連絡いただき、誠にありがとうございます</p>
    </div>

    <div class="content">
        <div class="confirmation-box">
            <h2>お問い合わせ内容</h2>
            <p>以下の内容でお問い合わせを受け付けました。</p>

            <div class="info-box">
                <p><strong>お名前:</strong> ${data.name}</p>
                ${data.company ? `<p><strong>会社名:</strong> ${data.company}</p>` : ''}
                <p><strong>お問い合わせ種別:</strong> ${inquiryTypeLabel}</p>
                <p><strong>件名:</strong> ${data.subject}</p>
            </div>
        </div>

        <div>
            <h3>今後の対応について</h3>
            <ul>
                <li>お問い合わせ内容を確認し、担当者よりご連絡いたします</li>
                <li>通常、24時間以内に初回のご連絡を差し上げます</li>
                <li>お急ぎの場合はお電話にてお問い合わせください</li>
            </ul>
        </div>

        <div class="contact-info">
            <h3>お問い合わせ先</h3>
            <p>
                <strong>Epackage Lab</strong><br>
                電話: 03-1234-5678<br>
                メール: info@epackage-lab.com<br>
                営業時間: 平日 9:00-18:00
            </p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <a href="https://epackage-lab.com" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                ウェブサイトを訪問する
            </a>
        </div>
    </div>

    <div class="footer">
        <p>このメールは Epackage Lab のお問い合わせフォームから自動的に送信されました。</p>
        <p>もしこのメールに心当たりがない場合は、お手数ですがこのメールを削除してください。</p>
        <p>受信日時: ${new Date().toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}</p>
    </div>
</body>
</html>
  `.trim()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // リクエストのバリデーション
    const validationResult = contactRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '無効なリクエストデータです', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // 1. CRM連携（Supabaseに保存）
    let savedInquiryId = null;
    if (isSupabaseConfigured()) {
      try {
        // まず連絡先(contacts)を確認または作成
        let contactId = null;

        // メールアドレスで既存の連絡先を検索
        const { data: existingContact } = await supabase!
          .from('contacts')
          .select('id')
          .eq('email', data.email)
          .single();

        if (existingContact) {
          contactId = (existingContact as any).id;
        } else {
          // 新規連絡先作成
          const { data: newContact, error: contactError } = await supabase!
            .from('contacts')
            .insert({
              name: data.name,
              email: data.email,
              phone: data.phone,
              company: data.company || null
            } as any)
            .select('id')
            .single();

          if (!contactError && newContact) {
            contactId = (newContact as any).id;
          }
        }

        // お問い合わせ(inquiries)を保存
        const { data: savedData, error } = await supabase!.from('inquiries').insert({
          contact_id: contactId, // null if contact creation failed, which is allowed by schema logic if we relax FK, but here we try our best
          name: data.name,
          company: data.company || null,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          message: data.message,
          inquiry_type: data.inquiryType,
          priority: data.urgency,
          status: 'new'
        } as any).select().single();

        if (error) throw error;
        savedInquiryId = (savedData as any)?.id;
        console.log('CRM data saved successfully:', savedInquiryId);
      } catch (crmError) {
        console.error('CRM integration failed:', crmError);
      }
    } else {
      console.warn('Supabase is not configured. Skipping DB save.');
    }

    // 2. メール送信 (SendGrid)
    if (process.env.SENDGRID_API_KEY && process.env.ADMIN_EMAIL && process.env.FROM_EMAIL) {
      // 管理者向け通知メールの設定
      const adminEmail = {
        to: process.env.ADMIN_EMAIL,
        from: process.env.FROM_EMAIL,
        subject: `【重要】新しいお問い合わせ: ${data.subject}`,
        html: generateAdminEmail(data),
        replyTo: data.email
      }

      // 顧客向け確認メールの設定
      const customerEmail = {
        to: data.email,
        from: process.env.FROM_EMAIL,
        subject: 'お問い合わせありがとうございます - Epackage Lab',
        html: generateCustomerEmail(data)
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
        console.error('Email sending failed:', {
          adminError: adminFailed ? adminResult.reason : null,
          customerError: customerFailed ? customerResult.reason : null
        })

        if (adminFailed && customerFailed) {
          return NextResponse.json(
            { error: 'メール送信に失敗しました', details: ['管理者通知と確認メールの両方が失敗しました'] },
            { status: 500 }
          )
        }
      }
    } else {
      console.warn('SendGrid is not configured. Skipping email sending.');
      if (!savedInquiryId) {
        return NextResponse.json(
          { error: 'システム設定エラー: データベースおよびメール設定が不足しています' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'お問い合わせを受け付けました。',
        contactId: savedInquiryId || `temp-${Date.now()}`
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact form error:', error)
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