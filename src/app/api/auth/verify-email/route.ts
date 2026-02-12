export const dynamic = 'force-dynamic';

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
  ALREADY_VERIFIED: 'メール認証は既に完了しています。',
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
    console.log('[EmailVerification] ===== VERIFICATION START =====')

    // =====================================================
    // DEV MODE: Mock verification for testing (SECURE: server-side only)
    // =====================================================
    const isDevMode = process.env.NODE_ENV === 'development' &&
                      process.env.ENABLE_DEV_MOCK_AUTH === 'true'

    if (isDevMode) {
      console.log('[DEV MODE] Mock email verification')
      await new Promise((resolve) => setTimeout(resolve, 500))
      return NextResponse.redirect(
        new URL('/auth/pending?message=dev_mock_verification', request.url)
      )
    }

    // =====================================================
    // Create Supabase client
    // =====================================================
    const supabase = createSupabaseClient()

    // =====================================================
    // Check session first (Supabase may have already verified email)
    // =====================================================
    console.log('[EmailVerification] Checking session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.log('[EmailVerification] Session error:', sessionError.message)
    }

    if (session?.user) {
      console.log('[EmailVerification] Session found, user:', session.user.email, 'email_confirmed:', session.user.email_confirmed_at)

      const userId = session.user.id
      const userEmail = session.user.email

      // =====================================================
      // Create service client
      // =====================================================
      const serviceClient = createServiceClient(userId)

      // =====================================================
      // Check if profile exists
      // =====================================================
      const { data: profile } = await serviceClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('[EmailVerification] Profile exists:', !!profile)

      if (!profile) {
        // =====================================================
        // Create profile from user_metadata (stored during registration)
        // =====================================================
        logVerification(userId, 'success', 'Creating profile after email verification')
        await createProfileFromAuthUser(userId, session.user, serviceClient, request.url)
      } else {
        // Profile already exists - just log and redirect to pending
        logVerification(userId, 'success', 'Email verified successfully', {
          email: userEmail,
          currentStatus: profile.status,
        })

        const userName = `${profile.kanji_last_name} ${profile.kanji_first_name}`
        const successMessage = encodeURIComponent(
          `${userName}様、メール認証が完了しました。管理者の承認をお待ちください。`
        )

        return NextResponse.redirect(
          new URL(`/auth/pending?message=${successMessage}`, request.url)
        )
      }
    }

    // =====================================================
    // No session - Try to verify with token parameter
    // =====================================================
    console.log('[EmailVerification] No session, checking token parameter')

    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      logVerification(null, 'error', 'No session and no token found')
      return NextResponse.redirect(
        new URL(
          `/auth/pending?message=${encodeURIComponent(ERROR_MESSAGES.ALREADY_VERIFIED)}`,
          request.url
        )
      )
    }

    // =====================================================
    // Verify OTP token (Supabase email verification)
    // =====================================================
    console.log('[EmailVerification] Verifying OTP token:', token)
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      token: token,
      type: 'email',
    })

    if (verifyError) {
      console.log('[EmailVerification] Token verification error:', verifyError.message)
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
    console.log('[EmailVerification] Token verified, user:', userEmail)

    // =====================================================
    // Create service client
    // =====================================================
    const serviceClient = createServiceClient(userId)

    // =====================================================
    // Check if profile exists
    // =====================================================
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!profile) {
      // =====================================================
      // Create profile from user_metadata (stored during registration)
      // =====================================================
      logVerification(userId, 'success', 'Creating profile after email verification')
      await createProfileFromAuthUser(userId, verifyData.user, serviceClient, request.url)
    } else {
      // Profile already exists - just log and redirect to pending
      logVerification(userId, 'success', 'Email verified successfully', {
        email: userEmail,
        currentStatus: profile.status,
      })

      const userName = `${profile.kanji_last_name} ${profile.kanji_first_name}`
      const successMessage = encodeURIComponent(
        `${userName}様、メール認証が完了しました。管理者の承認をお待ちください。`
      )

      return NextResponse.redirect(
        new URL(`/auth/pending?message=${successMessage}`, request.url)
      )
    }
  } catch (error) {
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

// =====================================================
// Helper: Create profile from auth user metadata
// =====================================================

async function createProfileFromAuthUser(
  userId: string,
  authUser: any,
  serviceClient: any,
  requestUrl: string
) {
  try {
    // Get user metadata
    const metadata = authUser.user_metadata || {}

    // Determine user_type based on business_type
    const businessType = metadata.business_type || 'INDIVIDUAL'
    const userType = businessType === 'CORPORATION' ? 'B2B' : 'B2C'

    console.log('[EmailVerification] Creating profile for user:', userId, 'business_type:', businessType, 'user_type:', userType)

    // Create profile
    const { error: insertError } = await serviceClient
      .from('profiles')
      .insert({
        id: userId,
        email: authUser.email || '',
        kanji_last_name: metadata.kanji_last_name || '',
        kanji_first_name: metadata.kanji_first_name || '',
        kana_last_name: metadata.kana_last_name || '',
        kana_first_name: metadata.kana_first_name || '',
        corporate_phone: metadata.corporate_phone || null,
        personal_phone: metadata.personal_phone || null,
        business_type: businessType,
        user_type: userType,
        company_name: metadata.company_name || null,
        legal_entity_number: metadata.legal_entity_number || null,
        position: metadata.position || null,
        department: metadata.department || null,
        company_url: metadata.company_url || null,
        product_category: metadata.product_category || null,
        acquisition_channel: metadata.acquisition_channel || null,
        postal_code: metadata.postal_code || null,
        prefecture: metadata.prefecture || null,
        city: metadata.city || null,
        street: metadata.street || null,
        role: 'MEMBER',
        status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (insertError) {
      logVerification(userId, 'error', 'Profile creation failed', insertError)
    } else {
      logVerification(userId, 'success', 'Profile created successfully')

      // Create delivery and billing addresses
      const fullName = `${metadata.kanji_last_name || ''} ${metadata.kanji_first_name || ''}`.trim()
      const companyOrProfileName = metadata.company_name || fullName

      // Delivery address
      await serviceClient
        .from('delivery_addresses')
        .insert({
          user_id: userId,
          name: companyOrProfileName,
          postal_code: metadata.postal_code || '',
          prefecture: metadata.prefecture || '',
          city: metadata.city || '',
          address: metadata.street || '',
          building: '',
          phone: metadata.corporate_phone || metadata.personal_phone || '',
          is_default: true,
        })
        .catch(err => {
          logVerification(userId, 'error', 'Delivery address creation failed', err)
        })

      // Billing address
      await serviceClient
        .from('billing_addresses')
        .insert({
          user_id: userId,
          company_name: companyOrProfileName,
          postal_code: metadata.postal_code || '',
          prefecture: metadata.prefecture || '',
          city: metadata.city || '',
          address: metadata.street || '',
          building: '',
          email: authUser.email || '',
          is_default: true,
        })
        .catch(err => {
          logVerification(userId, 'error', 'Billing address creation failed', err)
        })
    }

    // Redirect to pending page
    return NextResponse.redirect(
      new URL(`/auth/pending?email=${encodeURIComponent(authUser.email || '')}`, requestUrl)
    )
  } catch (error) {
    logVerification(userId, 'error', 'Profile creation unexpected error', error)
    return NextResponse.redirect(
      new URL(`/auth/pending?email=${encodeURIComponent(authUser.email || '')}`, requestUrl)
    )
  }
}
