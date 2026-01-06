/**
 * B2B Registration API
 *
 * B2B 회원가입 API 엔드포인트
 * - POST: B2B 회원가입 처리 (사업자등록증 업로드 포함)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { randomBytes } from 'crypto';

// ============================================================
// Types
// ============================================================

interface B2BRegistrationResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
  };
  error?: string;
  code?: string;
}

// ============================================================
// Validation Schema
// ============================================================

const b2bRegistrationSchema = z.object({
  businessType: z.enum(['CORPORATION', 'SOLE_PROPRIETOR']),
  companyName: z.string().min(1),
  corporateNumber: z.string().optional(),
  foundedYear: z.string().optional(),
  capital: z.string().optional(),
  representativeName: z.string().optional(),
  kanjiLastName: z.string().min(1),
  kanjiFirstName: z.string().min(1),
  kanaLastName: z.string().min(1),
  kanaFirstName: z.string().min(1),
  email: z.string().email(),
  corporatePhone: z.string().min(1),
  postalCode: z.string().min(1),
  prefecture: z.string().min(1),
  city: z.string().min(1),
  street: z.string().min(1),
  building: z.string().optional(),
  password: z.string().min(8),
});

// ============================================================
// Helper Functions
// ============================================================

/**
 * Generate email verification token
 */
function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Generate verification URL
 */
function generateVerificationUrl(email: string, token: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${appUrl}/b2b/register/verify?email=${encodeURIComponent(email)}&token=${token}`;
}

/**
 * Send verification email
 */
async function sendVerificationEmail(
  email: string,
  token: string,
  companyName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const verifyUrl = generateVerificationUrl(email, token);

    // Development mode: log email details
    if (process.env.NODE_ENV === 'development') {
      console.log('[Email Mock] Verification Email:', {
        to: email,
        companyName,
        verifyUrl,
      });
      return { success: true };
    }

    // Production: Use Resend
    const { Resend } = await import('resend');
    const resendClient = new Resend(process.env.RESEND_API_KEY);

    await resendClient.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@epackage-lab.com',
      to: email,
      subject: '[EPACKAGE Lab] メールアドレス認証',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Noto Sans JP', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a1a1a; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 30px; background: #c9a961; color: #fff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>EPACKAGE Lab</h1>
            </div>
            <div class="content">
              <h2>B2B会員登録ありがとうございます</h2>
              <p>${companyName}様</p>
              <p>以下のボタンをクリックして、メールアドレスを認証してください。</p>
              <a href="${verifyUrl}" class="button">メールアドレスを認証する</a>
              <p>※このリンクの有効期限は24時間です。</p>
              <p>もしリンクが動作しない場合は、以下のURLをブラウザに貼り付けてください：</p>
              <p style="word-break: break-all; font-size: 12px; color: #666;">${verifyUrl}</p>
            </div>
            <div class="footer">
              <p>このメールはシステムより自動送信されています。返信しないようお願いいたします。</p>
              <p>&copy; ${new Date().getFullYear()} EPACKAGE Lab. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Verification email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Store business registration document
 */
async function storeBusinessDocument(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  file: File
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/business-registration.${fileExt}`;
    const filePath = `b2b-documents/${fileName}`;

    const { error } = await supabase.storage
      .from('b2b-documents')
      .upload(filePath, file);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, path: filePath };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================
// POST Handler - B2B Registration
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    // Extract file
    const file = formData.get('businessRegistrationFile') as File | null;

    // Validate data
    const validatedData = b2bRegistrationSchema.parse({
      businessType: data.businessType,
      companyName: data.companyName,
      corporateNumber: data.corporateNumber || undefined,
      foundedYear: data.foundedYear || undefined,
      capital: data.capital || undefined,
      representativeName: data.representativeName || undefined,
      kanjiLastName: data.kanjiLastName,
      kanjiFirstName: data.kanjiFirstName,
      kanaLastName: data.kanaLastName,
      kanaFirstName: data.kanaFirstName,
      email: data.email,
      corporatePhone: data.corporatePhone,
      postalCode: data.postalCode,
      prefecture: data.prefecture,
      city: data.city,
      street: data.street,
      building: data.building || undefined,
      password: data.password,
    });

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', validatedData.email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'このメールアドレスは既に登録されています。',
          code: 'EMAIL_EXISTS',
        } as B2BRegistrationResponse,
        { status: 400 }
      );
    }

    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          user_type: 'B2B',
          business_type: validatedData.businessType,
        },
      },
    });

    if (authError || !authData.user) {
      console.error('Auth user creation error:', authError);
      return NextResponse.json(
        {
          success: false,
          error: '会員登録に失敗しました。',
          code: 'AUTH_ERROR',
        } as B2BRegistrationResponse,
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // Step 2: Store business document if provided
    let documentPath: string | null = null;
    if (file && file.size > 0) {
      const docResult = await storeBusinessDocument(supabase as any, userId, file);
      if (!docResult.success) {
        console.error('Document storage error:', docResult.error);
        // Continue without document
      } else {
        documentPath = docResult.path || null;
      }
    }

    // Step 3: Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: validatedData.email,
        user_type: 'B2B',
        business_type: validatedData.businessType,
        company_name: validatedData.companyName,
        corporate_number: validatedData.corporateNumber || null,
        founded_year: validatedData.foundedYear || null,
        capital: validatedData.capital || null,
        representative_name: validatedData.representativeName || null,
        kanji_last_name: validatedData.kanjiLastName,
        kanji_first_name: validatedData.kanjiFirstName,
        kana_last_name: validatedData.kanaLastName,
        kana_first_name: validatedData.kanaFirstName,
        corporate_phone: validatedData.corporatePhone,
        postal_code: validatedData.postalCode,
        prefecture: validatedData.prefecture,
        city: validatedData.city,
        street: validatedData.street,
        building: validatedData.building || null,
        role: 'MEMBER', // Default role, admin can promote later
        status: 'PENDING', // Requires admin approval
        business_document_path: documentPath,
        verification_token: null,
        verification_expires_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return NextResponse.json(
        {
          success: false,
          error: 'プロフィール作成に失敗しました。',
          code: 'PROFILE_ERROR',
        } as B2BRegistrationResponse,
        { status: 500 }
      );
    }

    // Step 4: Generate verification token and store
    const verificationToken = generateVerificationToken();
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await supabase
      .from('profiles')
      .update({
        verification_token: verificationToken,
        verification_expires_at: verificationExpiresAt.toISOString(),
      })
      .eq('id', userId);

    // Step 5: Send verification email
    const emailResult = await sendVerificationEmail(
      validatedData.email,
      verificationToken,
      validatedData.companyName
    );

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
    }

    const response: B2BRegistrationResponse = {
      success: true,
      message: '会員登録申請を受け付けました。メールアドレス認証を行ってください。',
      user: {
        id: userId,
        email: validatedData.email,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: '입력 데이터 검증에 실패했습니다.',
          message: '입력 데이터 검증에 실패했습니다.',
          details: error.errors,
          code: 'VALIDATION_ERROR',
        } as B2BRegistrationResponse,
        { status: 400 }
      );
    }

    console.error('B2B registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '会員登録に失敗しました。',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as B2BRegistrationResponse,
      { status: 500 }
    );
  }
}
