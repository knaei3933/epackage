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
    // Create Supabase client
    const supabase = await createSupabaseClient()

    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          kanji_last_name: validatedData.kanjiLastName,
          kanji_first_name: validatedData.kanjiFirstName,
          kana_last_name: validatedData.kanaLastName,
          kana_first_name: validatedData.kanaFirstName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email`,
      },
    })

    if (authError) {
      console.error('Auth user creation error:', authError)
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

    // Step 2: Create profile in database
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: validatedData.email,
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
        role: 'MEMBER',
        status: 'PENDING', // Requires admin approval
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Profile creation error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        {
          error: 'プロフィールの作成に失敗しました。',
          details: error.message,
          code: error.code,
          hint: error.hint,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '会員登録が完了しました。メール認証後、管理者の承認をお待ちください。',
      user: {
        id: profile.id,
        email: profile.email,
        nameKanji: `${profile.kanji_last_name} ${profile.kanji_first_name}`,
        nameKana: `${profile.kana_last_name} ${profile.kana_first_name}`,
        status: profile.status,
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
