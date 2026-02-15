export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { registrationSchema } from '@/types/auth'
import { z } from 'zod'
import { withRateLimit, createAuthRateLimiter } from '@/lib/rate-limiter'

// =====================================================
// Rate Limiter
// =====================================================

const registerRateLimiter = createAuthRateLimiter()

// =====================================================
// Supabase Client Helper
// =====================================================

async function createSupabaseClient() {
  const cookieStore = await cookies()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: {
          getItem: (key: string) => {
            const cookie = cookieStore.get(key)
            return cookie?.value ?? null
          },
          setItem: (key: string, value: string) => {
            cookieStore.set(key, value, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            })
          },
          removeItem: (key: string) => {
            cookieStore.delete(key)
          },
        },
      },
    }
  )
}

// Service role client for admin operations (bypasses RLS)
async function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// =====================================================
// POST /api/auth/register
// =====================================================

async function handleRegisterPost(request: NextRequest) {
  try {
    console.log('[REGISTER API] Received request')
    const body = await request.json()
    console.log('[REGISTER API] Request body:', JSON.stringify(body, null, 2))

    // Validate request body
    const validatedData = registrationSchema.parse(body)
    console.log('[REGISTER API] Validation passed:', JSON.stringify(validatedData, null, 2))

    // =====================================================
    // DEV MODE: Mock registration for testing (SECURE: server-side only)
    // =====================================================
    const isDevMode = process.env.NODE_ENV === 'development' &&
                      process.env.ENABLE_DEV_MOCK_AUTH === 'true'
    console.log('[REGISTER API] DEV MODE:', isDevMode)

    if (isDevMode) {
      console.log('[REGISTER API] Mock registration for:', validatedData.email)

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 500))

      const responseData = {
        success: true,
        message: '会員登録が完了しました。メール認証後、管理者の承認をお待ちください。',
        user: {
          id: 'dev-user-' + Date.now(),
          email: validatedData.email,
          nameKanji: `${validatedData.kanjiLastName} ${validatedData.kanjiFirstName}`,
          nameKana: `${validatedData.kanaLastName} ${validatedData.kanaFirstName}`,
          status: 'PENDING',
        },
      }
      console.log('[REGISTER API] Returning response:', JSON.stringify(responseData, null, 2))

      // Return mock success response
      return NextResponse.json(responseData)
    }

    // =====================================================
    // PRODUCTION: Real Supabase registration
    // =====================================================

    // Step 0: 이메일 중복 확인 (profiles 테이블)
    const serviceRoleCheck = await createServiceRoleClient()
    const { data: existingProfile } = await serviceRoleCheck
      .from('profiles')
      .select('id, email, status')
      .eq('email', validatedData.email)
      .single()

    if (existingProfile) {
      console.log('[REGISTER API] Email already registered:', validatedData.email)
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています。ログインするか、別のメールアドレスで登録してください。' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = await createSupabaseClient()

    // Step 1: Create auth user with all registration data in metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          // 모든 등록 정보를 user_metadata에 저장
          kanji_last_name: validatedData.kanjiLastName,
          kanji_first_name: validatedData.kanjiFirstName,
          kana_last_name: validatedData.kanaLastName,
          kana_first_name: validatedData.kanaFirstName,
          corporate_phone: validatedData.corporatePhone || null,
          personal_phone: validatedData.personalPhone || null,
          business_type: validatedData.businessType,
          company_name: validatedData.companyName || null,
          legal_entity_number: validatedData.legalEntityNumber || null,
          position: validatedData.position || null,
          department: validatedData.department || null,
          company_url: validatedData.companyUrl || null,
          product_category: validatedData.productCategory,
          acquisition_channel: validatedData.acquisitionChannel || null,
          postal_code: validatedData.postalCode || null,
          prefecture: validatedData.prefecture || null,
          city: validatedData.city || null,
          street: validatedData.street || null,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/pending`,
      },
    })

    if (authError) {
      console.error('Auth user creation error:', authError)

      // 이미 존재하는 이메일인지 확인
      if (authError.message.includes('already') ||
          authError.message.includes('registered') ||
          authError.message.includes('User already registered')) {
        return NextResponse.json(
          { error: 'このメールアドレスは既に登録されています。ログインするか、別のメールアドレスで登録してください。' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: '認証ユーザーの作成に失敗しました。', details: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: '認証ユーザーの作成に失敗しました。' },
        { status: 500 }
      )
    }

    const userId = authData.user.id

    // =====================================================
    // 완료: auth.users 생성 + user_metadata 저장
    // =====================================================
    // 이메일 인증 후 profiles 테이블에 레코드 생성됨
    // /api/auth/verify-email에서 처리

    console.log('[REGISTER API] User created, email confirmation required')

    // 이메일 인증 필요 메시지 반환
    return NextResponse.json({
      success: true,
      message: '会員登録ありがとうございます。入力されたメールアドレスに確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。',
      requiresEmailConfirmation: true,
      user: {
        id: userId,
        email: validatedData.email,
        nameKanji: `${validatedData.kanjiLastName} ${validatedData.kanjiFirstName}`,
        status: 'EMAIL_VERIFICATION_PENDING',
      },
    })
  } catch (error) {
    console.error('[REGISTER API] Error:', error)

    if (error instanceof z.ZodError) {
      console.error('[REGISTER API] Zod validation errors:', error.errors)
      return NextResponse.json(
        {
          error: '入力データの検証に失敗しました。',
          details: error.errors.reduce(
            (acc, err) => {
              const field = err.path.join('.')
              acc[field] = acc[field] || []
              acc[field].push(err.message)
              return acc
            },
            {} as Record<string, string[]>
          ),
        },
        { status: 400 }
      )
    }

    console.error('[REGISTER API] Unknown error:', error)
    return NextResponse.json(
      { error: '会員登録に失敗しました。' },
      { status: 500 }
    )
  }
}

export const POST = withRateLimit(handleRegisterPost, registerRateLimiter)
