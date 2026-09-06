export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseSSRClient } from '@/lib/supabase-ssr'
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated'

// =====================================================
// Request Validation
// =====================================================

const requiredText = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label}を入力してください。`)

const japanesePhoneSchema = z.union([
  z
    .string()
    .trim()
    .regex(
      /^\d{2,4}-?\d{2,4}-?\d{3,4}$/,
      '有効な電話番号の形式ではありません。',
    ),
  z.literal(''),
])

const createProfileMetadataSchema = z
  .object({
    kanji_last_name: requiredText('姓'),
    kanji_first_name: requiredText('名'),
    kana_last_name: requiredText('姓（カナ）'),
    kana_first_name: requiredText('名（カナ）'),
    corporate_phone: japanesePhoneSchema.optional(),
    personal_phone: japanesePhoneSchema.optional(),
    business_type: z.string().optional(),
    company_name: z.string().optional(),
    legal_entity_number: z.string().nullish(),
    position: z.string().nullish(),
    department: z.string().nullish(),
    company_url: z.string().nullish(),
    product_category: z.string().optional(),
    acquisition_channel: z.string().nullish(),
    postal_code: requiredText('郵便番号'),
    prefecture: requiredText('都道府県'),
    city: requiredText('市区町村'),
    street: requiredText('番地'),
  })
  .refine(
    (metadata) =>
      Boolean(metadata.corporate_phone?.trim()) ||
      Boolean(metadata.personal_phone?.trim()),
    {
      message: '法人電話番号または携帯電話のいずれかを入力してください。',
      path: ['corporate_phone'],
    },
  )

const isPresent = (value: string | null | undefined) =>
  Boolean(value?.trim())

const isProfileComplete = (profile: Record<string, string | null | undefined>) =>
  [
    'kanji_last_name',
    'kanji_first_name',
    'kana_last_name',
    'kana_first_name',
    'postal_code',
    'prefecture',
    'city',
    'street',
  ].every((key) => isPresent(profile[key])) &&
  (isPresent(profile.corporate_phone) || isPresent(profile.personal_phone))

const emptyToNull = (value?: string | null) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

const preferredPhone = (metadata: {
  corporate_phone?: string
  personal_phone?: string
}) => emptyToNull(metadata.corporate_phone) ?? emptyToNull(metadata.personal_phone)

const validationErrorResponse = (error: z.ZodError) =>
  NextResponse.json(
    {
      error: '入力データの検証に失敗しました。',
      details: error.flatten().fieldErrors,
    },
    { status: 400 },
  )

// =====================================================
// POST /api/auth/register/create-profile
// =====================================================

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    console.warn('[CREATE-PROFILE] start', { requestId })

    const body = await request.json()

    // =====================================================
    // Authenticate before granting service-role access
    // =====================================================
    const { client: authClient } = await createSupabaseSSRClient(request)
    const { data: { user }, error: authError } = await authClient.auth.getUser()

    if (authError || !user?.id || !user.email) {
      console.warn('[CREATE-PROFILE] unauthenticated', { requestId })
      return NextResponse.json(
        { error: '認証が必要です。再度ログインしてください。' },
        { status: 401 },
      )
    }

    const userId = user.id
    const email = user.email

    // Identity must match before any profile lookup or write.
    if (body?.userId !== userId || body?.email !== email) {
      console.warn('[CREATE-PROFILE] identity mismatch', { requestId })
      return NextResponse.json(
        {
          error: {
            code: 'IDENTITY_MISMATCH',
            message: 'ユーザー情報が一致しないため、処理できません。',
          },
        },
        { status: 403 },
      )
    }

    const metadataResult = createProfileMetadataSchema.safeParse(
      body?.userMetadata,
    )

    // Validation happens before the existing-profile early return.
    if (!metadataResult.success) {
      console.warn('[CREATE-PROFILE] metadata validation failed', { requestId })
      return validationErrorResponse(metadataResult.error)
    }

    const userMetadata = metadataResult.data

    // Create service client
    const serviceClient = createAuthenticatedServiceClient({
      operation: 'create_profile',
      userId: userId,
      route: '/api/auth/register/create-profile',
    })

    // =====================================================
    // Check whether an existing profile is complete
    // =====================================================
    const { data: existingProfile, error: existingProfileError } = await serviceClient
      .from('profiles')
      .select(
        [
          'id',
          'email',
          'kanji_last_name',
          'kanji_first_name',
          'kana_last_name',
          'kana_first_name',
          'corporate_phone',
          'personal_phone',
          'postal_code',
          'prefecture',
          'city',
          'street',
        ].join(','),
      )
      .eq('id', userId)
      .maybeSingle()

    if (existingProfileError) {
      console.error('[CREATE-PROFILE] existing profile lookup failed', {
        requestId,
        userId,
      })
      return NextResponse.json(
        { error: 'プロフィールの確認に失敗しました。' },
        { status: 500 },
      )
    }

    if (existingProfile) {
      const profile = existingProfile as unknown as Record<string, string | null>

      if (!isProfileComplete(profile)) {
        console.warn('[CREATE-PROFILE] existing profile incomplete', {
          requestId,
          userId,
        })
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'PROFILE_INCOMPLETE',
              message:
                'プロフィールの必須情報が未入力です。プロフィール完了画面から氏名、電話番号、住所をご入力ください。',
            },
          },
          { status: 409 },
        )
      }

      console.warn('[CREATE-PROFILE] existing profile complete', {
        requestId,
        userId,
      })
      return NextResponse.json({
        success: true,
        message: 'プロフィールは既に存在します。',
        profile: {
          id: profile.id,
          email: profile.email,
        },
      })
    }

    // =====================================================
    // Create profile
    // =====================================================
    const businessType = userMetadata.business_type || 'INDIVIDUAL'
    const userType = businessType === 'CORPORATION' ? 'B2B' : 'B2C'

    console.warn('[CREATE-PROFILE] creating profile', {
      requestId,
      userId,
      business_type: businessType,
      user_type: userType,
    })

    const { data: profile, error: insertError } = await serviceClient
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        kanji_last_name: userMetadata.kanji_last_name,
        kanji_first_name: userMetadata.kanji_first_name,
        kana_last_name: userMetadata.kana_last_name,
        kana_first_name: userMetadata.kana_first_name,
        corporate_phone: emptyToNull(userMetadata.corporate_phone),
        personal_phone: emptyToNull(userMetadata.personal_phone),
        business_type: businessType,
        user_type: userType,
        company_name: emptyToNull(userMetadata.company_name),
        legal_entity_number: emptyToNull(userMetadata.legal_entity_number),
        position: emptyToNull(userMetadata.position),
        department: emptyToNull(userMetadata.department),
        company_url: emptyToNull(userMetadata.company_url),
        product_category: userMetadata.product_category || 'OTHER',
        acquisition_channel: emptyToNull(userMetadata.acquisition_channel),
        postal_code: userMetadata.postal_code,
        prefecture: userMetadata.prefecture,
        city: userMetadata.city,
        street: userMetadata.street,
        role: 'MEMBER',
        status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('[CREATE-PROFILE] Profile creation error:', insertError)

      // Check for duplicate error (Postgres error code 23505)
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: { code: '23505', message: 'プロフィールは既に存在します。' } },
          { status: 409 },
        )
      }

      console.error('[CREATE-PROFILE] failed', { requestId, userId })
      return NextResponse.json(
        { error: 'プロフィールの作成に失敗しました。', details: insertError.message },
        { status: 500 },
      )
    }

    console.warn('[CREATE-PROFILE] profile created', {
      requestId,
      userId,
    })

    // =====================================================
    // Create required default addresses
    // =====================================================
    const fullName = `${userMetadata.kanji_last_name} ${userMetadata.kanji_first_name}`
    const companyOrProfileName = userMetadata.company_name?.trim() || fullName

    const { data: delivery, error: deliveryError } = await serviceClient
      .from('delivery_addresses')
      .insert({
        user_id: userId,
        name: companyOrProfileName,
        postal_code: userMetadata.postal_code,
        prefecture: userMetadata.prefecture,
        city: userMetadata.city,
        address: userMetadata.street,
        building: '',
        phone: preferredPhone(userMetadata),
        is_default: true,
      })
      .select('id')
      .single()

    const deliveryAddressId =
      deliveryError || !delivery ? null : (delivery as { id: string }).id

    if (deliveryError) {
      console.error('[CREATE-PROFILE] delivery address creation error:', {
        requestId,
        userId,
        message: deliveryError.message,
      })
    } else {
      console.warn('[CREATE-PROFILE] delivery address created', {
        requestId,
        userId,
      })
    }

    if (deliveryError) {
      const { error: profileDeleteError } = await serviceClient
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileDeleteError) {
        console.error('[CREATE-PROFILE] profile compensation failed', {
          requestId,
          userId,
        })
      }

      console.error('[CREATE-PROFILE] profile creation rolled back', {
        requestId,
        userId,
      })

      return NextResponse.json(
        {
          success: false,
          error: '住所情報の作成に失敗しました。プロフィールの作成は取り消されました。',
        },
        { status: 500 },
      )
    }

    const { data: billing, error: billingError } = await serviceClient
      .from('billing_addresses')
      .insert({
        user_id: userId,
        company_name: companyOrProfileName,
        postal_code: userMetadata.postal_code,
        prefecture: userMetadata.prefecture,
        city: userMetadata.city,
        address: userMetadata.street,
        building: '',
        email: email,
        phone: preferredPhone(userMetadata),
        is_default: true,
      })
      .select('id')
      .single()

    const billingAddressId =
      billingError || !billing ? null : (billing as { id: string }).id

    if (billingError) {
      console.error('[CREATE-PROFILE] billing address creation error:', {
        requestId,
        userId,
        message: billingError.message,
      })
    } else {
      console.warn('[CREATE-PROFILE] billing address created', {
        requestId,
        userId,
      })
    }

    if (deliveryError || billingError) {
      // Compensate only rows this request created, in reverse dependency order.
      if (billingAddressId) {
        const { error: billingDeleteError } = await serviceClient
          .from('billing_addresses')
          .delete()
          .eq('id', billingAddressId)

        if (billingDeleteError) {
          console.error('[CREATE-PROFILE] billing compensation failed', {
            requestId,
            userId,
            billingAddressId,
          })
        }
      }

      if (deliveryAddressId) {
        const { error: deliveryDeleteError } = await serviceClient
          .from('delivery_addresses')
          .delete()
          .eq('id', deliveryAddressId)

        if (deliveryDeleteError) {
          console.error('[CREATE-PROFILE] delivery compensation failed', {
            requestId,
            userId,
            deliveryAddressId,
          })
        }
      }

      const { error: profileDeleteError } = await serviceClient
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileDeleteError) {
        console.error('[CREATE-PROFILE] profile compensation failed', {
          requestId,
          userId,
        })
      }

      console.error('[CREATE-PROFILE] profile creation rolled back', {
        requestId,
        userId,
      })

      return NextResponse.json(
        {
          success: false,
          error: '住所情報の作成に失敗しました。プロフィールの作成は取り消されました。',
        },
        { status: 500 },
      )
    }

    console.warn('[CREATE-PROFILE] complete', {
      requestId,
      userId,
    })

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'プロフィールを作成しました。',
      profile: {
        id: profile.id,
        email: profile.email,
        name: `${profile.kanji_last_name} ${profile.kanji_first_name}`.trim(),
        status: profile.status,
      },
    })
  } catch (error) {
    console.error('[CREATE-PROFILE] Unexpected error:', {
      requestId,
      message: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'プロフィールの作成中にエラーが発生しました。' },
      { status: 500 },
    )
  }
}
