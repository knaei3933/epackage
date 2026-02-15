'use client'

import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { User, FileText, Settings, ClipboardList, Package } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

function MemberDashboardContent() {
  const { user, profile } = useAuth()

  const displayName = user?.kanjiLastName && user?.kanjiFirstName
    ? `${user.kanjiLastName} ${user.kanjiFirstName} 様`
    : user?.email || 'ゲスト'

  const statsCards = [
    {
      title: '見積もり依頼',
      value: '0',
      description: '過去30日',
      icon: FileText,
      href: '/member/quotations',
    },
    {
      title: 'サンプルリクエスト',
      value: '0',
      description: '過去30日',
      icon: Package,
      href: '/samples',
    },
    {
      title: 'お問い合わせ',
      value: '0',
      description: '過去30日',
      icon: ClipboardList,
      href: '/contact',
    },
  ]

  const quickActions = [
    {
      title: 'プロフィール編集',
      description: '会員情報を更新',
      icon: User,
      href: '/profile',
    },
    {
      title: '見積もり作成',
      description: '新しい見積もり',
      icon: FileText,
      href: '/quote-simulator',
    },
    {
      title: 'アカウント設定',
      description: 'パスワード変更など',
      icon: Settings,
      href: '/member/settings',
    },
  ]

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Header */}
      <div className="bg-bg-primary border-b border-border-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-text-primary">
            会員ダッシュボード
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            ようこそ、{displayName}さん
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        {profile?.status === 'PENDING' && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h3 className="text-yellow-800 dark:text-yellow-200 font-semibold mb-1">
              アカウント承認待ち
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              あなたのアカウントは現在承認待ちです。管理者が承認すると、すべての機能にアクセスできるようになります。
            </p>
          </div>
        )}

        {profile?.status === 'ACTIVE' && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✓ アカウントは有効です
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statsCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Link key={stat.title} href={stat.href}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary">{stat.title}</p>
                      <p className="text-2xl font-bold text-text-primary mt-1">{stat.value}</p>
                      <p className="text-xs text-text-muted mt-1">{stat.description}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-bg-secondary flex items-center justify-center">
                      <Icon className="h-6 w-6 text-brixa-600" />
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            クイックアクション
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.title} href={action.href}>
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-brixa-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-text-primary">{action.title}</h3>
                        <p className="text-sm text-text-secondary mt-1">{action.description}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Account Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            アカウント情報
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-secondary">会社名</p>
              <p className="text-text-primary font-medium">{profile?.company_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">部署</p>
              <p className="text-text-primary font-medium">{profile?.department || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">役職</p>
              <p className="text-text-primary font-medium">{profile?.position || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">メールアドレス</p>
              <p className="text-text-primary font-medium">{user?.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">法人電話番号</p>
              <p className="text-text-primary font-medium">{profile?.corporate_phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">アカウントステータス</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                profile?.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : profile?.status === 'PENDING'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              }`}>
                {profile?.status === 'ACTIVE' && '有効'}
                {profile?.status === 'PENDING' && '承認待ち'}
                {profile?.status === 'SUSPENDED' && '無効'}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/profile">
              <Button variant="outline" size="sm">
                プロフィールを編集
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function MembersPage() {
  return (
    <ProtectedRoute>
      <MemberDashboardContent />
    </ProtectedRoute>
  )
}
