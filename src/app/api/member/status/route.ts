import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/member/status
 *
 * ユーザーの登録ステータスを確認するAPI
 * - メール認証が必要かどうか
 * - 管理者承認待ちかどうか
 * - 承認完了かどうか
 */

// Service role client for admin operations
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'メールアドレスが必要です。' },
        { status: 400 }
      )
    }

    console.log('[STATUS API] Checking status for:', email)

    const serviceRole = await createServiceRoleClient()

    // =====================================================
    // Step 1: auth.users でメール認証状態を確認
    // =====================================================
    const { data: { users }, error: authError } = await serviceRole.auth.admin.listUsers()

    if (authError) {
      console.error('[STATUS API] Auth error:', authError)
      return NextResponse.json(
        { error: 'ユーザー情報の取得に失敗しました。' },
        { status: 500 }
      )
    }

    // メールアドレスが一致するユーザーを検索
    const authUser = users.find(u => u.email === email)

    if (!authUser) {
      console.log('[STATUS API] User not found in auth.users:', email)
      return NextResponse.json({
        requiresEmailConfirmation: true,
        isPending: false,
        isConfirmed: false,
        message: 'ユーザーが見つかりません。',
      })
    }

    console.log('[STATUS API] Auth user found:', {
      id: authUser.id,
      email: authUser.email,
      email_confirmed_at: authUser.email_confirmed_at,
    })

    // メール認証がまだの場合
    if (!authUser.email_confirmed_at) {
      console.log('[STATUS API] Email confirmation required')
      return NextResponse.json({
        requiresEmailConfirmation: true,
        isPending: false,
        isConfirmed: false,
        email: authUser.email,
        message: 'メール認証が必要です。',
      })
    }

    // =====================================================
    // Step 2: profiles テーブルでステータスを確認
    // =====================================================
    const { data: profile, error: profileError } = await serviceRole
      .from('profiles')
      .select('id, email, status, role')
      .eq('email', email)
      .single()

    if (profileError) {
      console.error('[STATUS API] Profile error:', profileError)

      // プロフィールが存在しない場合（メール認証済みだがプロフィール未作成）
      if (profileError.code === 'PGRST116') {
        console.log('[STATUS API] Profile not found, creating default profile')
        return NextResponse.json({
          requiresEmailConfirmation: false,
          isPending: true,
          isConfirmed: false,
          email: authUser.email,
          message: 'プロフィール作成待ちです。',
        })
      }

      return NextResponse.json(
        { error: 'プロフィール情報の取得に失敗しました。' },
        { status: 500 }
      )
    }

    console.log('[STATUS API] Profile found:', {
      id: profile.id,
      email: profile.email,
      status: profile.status,
      role: profile.role,
    })

    // =====================================================
    // Step 3: ステータスに応じてレスポンスを返す
    // =====================================================

    if (profile.status === 'PENDING') {
      console.log('[STATUS API] Status: PENDING (approval required)')
      return NextResponse.json({
        requiresEmailConfirmation: false,
        isPending: true,
        isConfirmed: false,
        email: profile.email,
        status: profile.status,
        message: '管理者による承認待ちです。',
      })
    }

    if (profile.status === 'ACTIVE') {
      console.log('[STATUS API] Status: ACTIVE (confirmed)')
      return NextResponse.json({
        requiresEmailConfirmation: false,
        isPending: false,
        isConfirmed: true,
        email: profile.email,
        status: profile.status,
        message: '承認完了済みです。',
      })
    }

    if (profile.status === 'SUSPENDED') {
      console.log('[STATUS API] Status: SUSPENDED')
      return NextResponse.json({
        requiresEmailConfirmation: false,
        isPending: false,
        isConfirmed: false,
        email: profile.email,
        status: profile.status,
        message: 'アカウントが停止されています。',
      })
    }

    // その他のステータス
    return NextResponse.json({
      requiresEmailConfirmation: false,
      isPending: true,
      isConfirmed: false,
      email: profile.email,
      status: profile.status,
      message: '承認待ちです。',
    })

  } catch (error) {
    console.error('[STATUS API] Error:', error)
    return NextResponse.json(
      { error: 'ステータス確認に失敗しました。' },
      { status: 500 }
    )
  }
}
