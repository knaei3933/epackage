'use client'

/**
 * Signout Page
 *
 * 로그아웃 페이지입니다.
 * - Supabase 세션 종료
 * - 홈으로 리다이렉트
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export default function SignoutPage() {
  const router = useRouter()
  const { signOut } = useAuth()

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await signOut()
      } finally {
        // Redirect to home after signout
        setTimeout(() => {
          router.push('/')
        }, 1500)
      }
    }

    handleSignOut()
  }, [signOut, router])

  return (
    <main className="min-h-screen bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-accent flex items-center justify-center px-4">
      <div className="text-center">
        {/* 로딩 스피너 */}
        <div className="flex justify-center mb-6">
          <Loader2 className="w-16 h-16 animate-spin text-brixa-500" />
        </div>

        <h1 className="text-2xl font-bold text-text-primary mb-2">
          로그아웃 중... / ログアウト中...
        </h1>

        <p className="text-text-muted">
          잠시 후 홈으로 이동합니다。/ すぐにホームへ移動します。
        </p>
      </div>
    </main>
  )
}
