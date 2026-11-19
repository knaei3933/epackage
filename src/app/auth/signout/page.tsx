'use client'

/**
 * Signout Page
 *
 * ログアウトページです。
 * - Supabaseセッション終了
 * - ホームへリダイレクト
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import { AuthStatusCard } from '@/components/auth/AuthShell'

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
    <AuthStatusCard tone="neutral" icon={Loader2} spin title="ログアウト中...">
      <p className="text-text-secondary">
        まもなくホームへ移動します。
      </p>
    </AuthStatusCard>
  )
}
