export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// =====================================================
// Service Client for Profile Creation
// =====================================================

function createServiceClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase service credentials not configured')
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// =====================================================
// Request Validation
// =====================================================

interface CreateProfileRequest {
  userId: string
  email: string
  userMetadata: {
    kanji_last_name?: string
    kanji_first_name?: string
    kana_last_name?: string
    kana_first_name?: string
    corporate_phone?: string
    personal_phone?: string
    business_type?: string
    company_name?: string
    legal_entity_number?: string
    position?: string
    department?: string
    company_url?: string
    product_category?: string
    acquisition_channel?: string
    postal_code?: string
    prefecture?: string
    city?: string
    street?: string
  }
}

// =====================================================
// POST /api/auth/register/create-profile
// =====================================================

export async function POST(request: NextRequest) {
  try {
    console.log('[CREATE-PROFILE] ===== PROFILE CREATION START =====')

    // Parse request body
    const body: CreateProfileRequest = await request.json()
    console.log('[CREATE-PROFILE] Request body:', JSON.stringify(body, null, 2))

    const { userId, email, userMetadata } = body

    // Validate required fields
    if (!userId || !email) {
      console.error('[CREATE-PROFILE] Missing required fields')
      return NextResponse.json(
        { error: 'userId と email は必須です。' },
        { status: 400 }
      )
    }

    // Create service client
    const serviceClient = createServiceClient()

    // =====================================================
    // Check if profile already exists
    // =====================================================
    const { data: existingProfile } = await serviceClient
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      console.log('[CREATE-PROFILE] Profile already exists')
      return NextResponse.json({
        success: true,
        message: 'プロフィールは既に存在します。',
        profile: existingProfile,
      })
    }

    // =====================================================
    // Determine user_type based on business_type
    // =====================================================
    const businessType = userMetadata.business_type || 'INDIVIDUAL'
    const userType = businessType === 'CORPORATION' ? 'B2B' : 'B2C'

    console.log('[CREATE-PROFILE] Creating profile:', {
      userId,
      business_type: businessType,
      user_type: userType,
    })

    // =====================================================
    // Create profile
    // =====================================================
    const { data: profile, error: insertError } = await serviceClient
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        kanji_last_name: userMetadata.kanji_last_name || '',
        kanji_first_name: userMetadata.kanji_first_name || '',
        kana_last_name: userMetadata.kana_last_name || '',
        kana_first_name: userMetadata.kana_first_name || '',
        corporate_phone: userMetadata.corporate_phone || null,
        personal_phone: userMetadata.personal_phone || null,
        business_type: businessType,
        user_type: userType,
        company_name: userMetadata.company_name || null,
        legal_entity_number: userMetadata.legal_entity_number || null,
        position: userMetadata.position || null,
        department: userMetadata.department || null,
        company_url: userMetadata.company_url || null,
        product_category: userMetadata.product_category || null,
        acquisition_channel: userMetadata.acquisition_channel || null,
        postal_code: userMetadata.postal_code || null,
        prefecture: userMetadata.prefecture || null,
        city: userMetadata.city || null,
        street: userMetadata.street || null,
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
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: 'プロフィールの作成に失敗しました。', details: insertError.message },
        { status: 500 }
      )
    }

    console.log('[CREATE-PROFILE] Profile created successfully:', profile)

    // =====================================================
    // Create delivery and billing addresses
    // =====================================================
    const fullName = `${userMetadata.kanji_last_name || ''} ${userMetadata.kanji_first_name || ''}`.trim()
    const companyOrProfileName = userMetadata.company_name || fullName

    // Delivery address
    const { error: deliveryError } = await serviceClient
      .from('delivery_addresses')
      .insert({
        user_id: userId,
        name: companyOrProfileName,
        postal_code: userMetadata.postal_code || '',
        prefecture: userMetadata.prefecture || '',
        city: userMetadata.city || '',
        address: userMetadata.street || '',
        building: '',
        phone: userMetadata.corporate_phone || userMetadata.personal_phone || '',
        is_default: true,
      })

    if (deliveryError) {
      console.error('[CREATE-PROFILE] Delivery address creation error:', deliveryError)
    } else {
      console.log('[CREATE-PROFILE] Delivery address created successfully')
    }

    // Billing address
    const { error: billingError } = await serviceClient
      .from('billing_addresses')
      .insert({
        user_id: userId,
        company_name: companyOrProfileName,
        postal_code: userMetadata.postal_code || '',
        prefecture: userMetadata.prefecture || '',
        city: userMetadata.city || '',
        address: userMetadata.street || '',
        building: '',
        email: email,
        is_default: true,
      })

    if (billingError) {
      console.error('[CREATE-PROFILE] Billing address creation error:', billingError)
    } else {
      console.log('[CREATE-PROFILE] Billing address created successfully')
    }

    console.log('[CREATE-PROFILE] ===== PROFILE CREATION COMPLETE =====')

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
    console.error('[CREATE-PROFILE] Unexpected error:', error)
    return NextResponse.json(
      { error: 'プロフィールの作成中にエラーが発生しました。' },
      { status: 500 }
    )
  }
}
