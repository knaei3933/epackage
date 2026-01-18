import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated'

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

// Service client for admin operations (bypasses RLS)
function createServiceClient(userId: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase service credentials not configured')
  }

  return createAuthenticatedServiceClient({
    operation: 'email_verification',
    userId,
    route: '/api/auth/verify-email',
  })
}

// =====================================================
// Japanese Error Messages
// =====================================================

const ERROR_MESSAGES = {
  INVALID_TOKEN: '無効な認証トークンです。',
  EXPIRED_TOKEN: '認証トークンの有効期限が切れています。',
  USER_NOT_FOUND: 'ユーザーが見つかりませんでした。',
  VERIFICATION_FAILED: 'メール認証に失敗しました。',
  UPDATE_FAILED: 'ステータス更新に失敗しました。',
  MISSING_TOKEN: '認証トークンが指定されていません。',
} as const

// =====================================================
// Logging Helper
// =====================================================

function logVerification(
  userId: string | null,
  status: 'success' | 'error',
  message: string,
  error?: any
) {
  const timestamp = new Date().toISOString()
  const logData = {
    timestamp,
    event: 'email_verification',
    userId,
    status,
    message,
    error: error
      ? {
          message: error.message,
          code: error.code,
          hint: error.hint,
        }
      : undefined,
  }

  if (status === 'error') {
    console.error('[EmailVerification]', JSON.stringify(logData, null, 2))
  } else {
    console.log('[EmailVerification]', JSON.stringify(logData, null, 2))
  }
}

// =====================================================
// GET /api/auth/verify-email?token=xxx
// =====================================================

export async function GET(request: NextRequest) {
  try {
    // =====================================================
    // DEV MODE: Mock verification for testing (SECURE: server-side only)
    // =====================================================
    const isDevMode = process.env.NODE_ENV === 'development' &&
                      process.env.ENABLE_DEV_MOCK_AUTH === 'true'

    if (isDevMode) {
      console.log('[DEV MODE] Mock email verification')

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Redirect to pending page
      return NextResponse.redirect(
        new URL('/auth/pending?message=dev_mock_verification', request.url)
      )
    }

    // =====================================================
    // PRODUCTION: Real email verification
    // =====================================================

    // Extract token from query parameters
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      logVerification(null, 'error', 'Missing verification token')
      return NextResponse.redirect(
        new URL(
          `/auth/error?error=verification_failed&message=${encodeURIComponent(ERROR_MESSAGES.MISSING_TOKEN)}`,
          request.url
        )
      )
    }

    // Create Supabase client
    const supabase = createSupabaseClient()

    // =====================================================
    // Step 1: Verify the auth token using Supabase Auth
    // =====================================================

    // Verify OTP token (this is what Supabase uses for email verification)
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    })

    if (verifyError) {
      logVerification(null, 'error', 'Token verification failed', verifyError)

      // Handle specific error types
      if (verifyError.message.includes('expired')) {
        return NextResponse.redirect(
          new URL(
            `/auth/error?error=verification_failed&message=${encodeURIComponent(ERROR_MESSAGES.EXPIRED_TOKEN)}`,
            request.url
          )
        )
      }

      return NextResponse.redirect(
        new URL(
          `/auth/error?error=verification_failed&message=${encodeURIComponent(ERROR_MESSAGES.INVALID_TOKEN)}`,
          request.url
        )
      )
    }

    if (!verifyData?.user) {
      logVerification(null, 'error', 'No user in verification data')
      return NextResponse.redirect(
        new URL(
          `/auth/error?error=verification_failed&message=${encodeURIComponent(ERROR_MESSAGES.USER_NOT_FOUND)}`,
          request.url
        )
      )
    }

    const userId = verifyData.user.id
    const userEmail = verifyData.user.email

    // =====================================================
    // Step 2: Create service client AFTER verification
    // =====================================================
    const serviceClient = createServiceClient(userId)

    // =====================================================
    // Step 3: Verify email in Supabase Auth (already verified by verifyOtp above)
    // User status remains PENDING until admin approval
    // The profiles table should have email_confirmed_at field to track verification
    // =====================================================

    // Note: In the current system, PENDING status covers both:
    // - Email not yet verified
    // - Email verified, waiting for admin approval
    // If you want to distinguish these states, add PENDING_APPROVAL to the database enum

    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      logVerification(userId, 'error', 'Profile fetch failed', profileError)
      return NextResponse.redirect(
        new URL(
          `/auth/error?error=verification_failed&message=${encodeURIComponent(ERROR_MESSAGES.USER_NOT_FOUND)}`,
          request.url
        )
      )
    }

    // =====================================================
    // Step 4: Log successful verification
    // =====================================================

    logVerification(userId, 'success', 'Email verified successfully', {
      email: userEmail,
      currentStatus: profile.status,
      note: 'User email verified in Supabase Auth, awaiting admin approval',
    })

    // =====================================================
    // Step 5: Redirect to pending approval page
    // =====================================================

    // Create success message with user name
    const userName = `${profile.kanji_last_name} ${profile.kanji_first_name}`
    const successMessage = encodeURIComponent(
      `${userName}様、メール認証が完了しました。管理者の承認をお待ちください。`
    )

    return NextResponse.redirect(
      new URL(`/auth/pending?message=${successMessage}`, request.url)
    )
  } catch (error) {
    // =====================================================
    // Error Handling
    // =====================================================

    console.error('[EmailVerification] Unexpected error:', error)
    logVerification(null, 'error', 'Unexpected error', error)

    return NextResponse.redirect(
      new URL(
        `/auth/error?error=verification_failed&message=${encodeURIComponent(ERROR_MESSAGES.VERIFICATION_FAILED)}`,
        request.url
      )
    )
  }
}
