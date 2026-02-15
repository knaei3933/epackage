'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type FormSection = 'personal' | 'company' | 'contact' | 'address'

function ProfilePageContent() {
  const { user, profile, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [activeSection, setActiveSection] = useState<FormSection>('personal')
  const [formData, setFormData] = useState({
    // Personal info
    kanjiLastName: '',
    kanjiFirstName: '',
    kanaLastName: '',
    kanaFirstName: '',
    position: '',
    department: '',

    // Company info
    companyName: '',
    legalEntityNumber: '',
    businessType: '',

    // Contact
    corporatePhone: '',
    personalPhone: '',

    // Address
    postalCode: '',
    prefecture: '',
    city: '',
    street: '',

    // Other
    companyUrl: '',
  })

  // Initialize form data when user/profile loads
  useEffect(() => {
    if (user && profile) {
      setFormData({
        kanjiLastName: user.kanjiLastName || '',
        kanjiFirstName: user.kanjiFirstName || '',
        kanaLastName: user.kanaLastName || '',
        kanaFirstName: user.kanaFirstName || '',
        position: profile.position || '',
        department: profile.department || '',
        companyName: profile.company_name || '',
        legalEntityNumber: profile.legal_entity_number || '',
        businessType: profile.business_type || '',
        corporatePhone: profile.corporate_phone || '',
        personalPhone: profile.personal_phone || '',
        postalCode: profile.postal_code || '',
        prefecture: profile.prefecture || '',
        city: profile.city || '',
        street: profile.street || '',
        companyUrl: profile.company_url || '',
      })
    }
  }, [user, profile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setSaveStatus('idle')
  }

  const handleSave = async (section: FormSection) => {
    setIsLoading(true)
    setSaveStatus('idle')

    try {
      // Build updates object based on section
      const updates: Partial<{
        kanjiLastName: string
        kanjiFirstName: string
        kanaLastName: string
        kanaFirstName: string
        corporatePhone: string
        personalPhone: string
        companyName: string
        position: string
        department: string
        companyUrl: string
        postalCode: string
        prefecture: string
        city: string
        street: string
      }> = {}

      switch (section) {
        case 'personal':
          updates.kanjiLastName = formData.kanjiLastName
          updates.kanjiFirstName = formData.kanjiFirstName
          updates.kanaLastName = formData.kanaLastName
          updates.kanaFirstName = formData.kanaFirstName
          updates.position = formData.position
          updates.department = formData.department
          break
        case 'company':
          updates.companyName = formData.companyName
          updates.position = formData.position
          updates.department = formData.department
          updates.companyUrl = formData.companyUrl
          break
        case 'contact':
          updates.corporatePhone = formData.corporatePhone
          updates.personalPhone = formData.personalPhone
          break
        case 'address':
          updates.postalCode = formData.postalCode
          updates.prefecture = formData.prefecture
          updates.city = formData.city
          updates.street = formData.street
          break
      }

      await updateProfile(updates)
      setSaveStatus('success')

      // Reset success message after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Profile update error:', error)
      setSaveStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  const displayName = user?.kanjiLastName && user?.kanjiFirstName
    ? `${user.kanjiLastName} ${user.kanjiFirstName}`
    : user?.email || 'ユーザー'

  const sections = [
    { id: 'personal' as FormSection, label: '個人情報', icon: '👤' },
    { id: 'company' as FormSection, label: '会社情報', icon: '🏢' },
    { id: 'contact' as FormSection, label: '連絡先', icon: '📞' },
    { id: 'address' as FormSection, label: '住所', icon: '📍' },
  ]

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Header */}
      <div className="bg-bg-primary border-b border-border-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-text-primary">
            プロフィール設定
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {displayName}さんのアカウント情報
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors',
                      activeSection === section.id
                        ? 'bg-brixa-50 dark:bg-brixa-900/20 text-brixa-700 dark:text-brixa-300 font-medium'
                        : 'text-text-secondary hover:bg-bg-secondary'
                    )}
                  >
                    <span className="text-xl">{section.icon}</span>
                    <span>{section.label}</span>
                  </button>
                ))}
              </nav>
            </Card>

            {/* Account Status */}
            <Card className="p-4 mt-4">
              <h3 className="font-medium text-text-primary mb-3">アカウント状態</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">メール認証</span>
                  <span className={user?.emailVerified ? 'text-green-600' : 'text-yellow-600'}>
                    {user?.emailVerified ? '完了' : '未完了'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">ステータス</span>
                  <span className={
                    profile?.status === 'ACTIVE'
                      ? 'text-green-600'
                      : profile?.status === 'PENDING'
                      ? 'text-yellow-600'
                      : 'text-gray-600'
                  }>
                    {profile?.status === 'ACTIVE' && '有効'}
                    {profile?.status === 'PENDING' && '承認待ち'}
                    {profile?.status === 'SUSPENDED' && '無効'}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {/* Save Status Indicator */}
              {saveStatus === 'success' && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-sm text-green-700 dark:text-green-300">
                    保存しました
                  </p>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    保存に失敗しました。もう一度お試しください。
                  </p>
                </div>
              )}

              {/* Personal Information Section */}
              {activeSection === 'personal' && (
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-6">
                    個人情報
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        漢字姓
                      </label>
                      <Input
                        name="kanjiLastName"
                        value={formData.kanjiLastName}
                        onChange={handleInputChange}
                        placeholder="山田"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        漢字名
                      </label>
                      <Input
                        name="kanjiFirstName"
                        value={formData.kanjiFirstName}
                        onChange={handleInputChange}
                        placeholder="太郎"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        カナ姓
                      </label>
                      <Input
                        name="kanaLastName"
                        value={formData.kanaLastName}
                        onChange={handleInputChange}
                        placeholder="ヤマダ"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        カナ名
                      </label>
                      <Input
                        name="kanaFirstName"
                        value={formData.kanaFirstName}
                        onChange={handleInputChange}
                        placeholder="タロウ"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        部署
                      </label>
                      <Input
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        placeholder="営業部"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        役職
                      </label>
                      <Input
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        placeholder="部長"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Company Information Section */}
              {activeSection === 'company' && (
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-6">
                    会社情報
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        会社名
                      </label>
                      <Input
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="株式会社〇〇"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        法人番号
                      </label>
                      <Input
                        name="legalEntityNumber"
                        value={formData.legalEntityNumber}
                        onChange={handleInputChange}
                        placeholder="1234567890123"
                        disabled
                      />
                      <p className="text-xs text-text-muted mt-1">
                        ※ 法人番号は変更できません
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        業種
                      </label>
                      <Input
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleInputChange}
                        disabled
                      />
                      <p className="text-xs text-text-muted mt-1">
                        ※ 業種は変更できません
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        会社URL
                      </label>
                      <Input
                        name="companyUrl"
                        value={formData.companyUrl}
                        onChange={handleInputChange}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Section */}
              {activeSection === 'contact' && (
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-6">
                    連絡先
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        メールアドレス
                      </label>
                      <Input
                        value={user?.email || ''}
                        disabled
                      />
                      <p className="text-xs text-text-muted mt-1">
                        ※ メールアドレスは変更できません
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        法人電話番号
                      </label>
                      <Input
                        name="corporatePhone"
                        value={formData.corporatePhone}
                        onChange={handleInputChange}
                        placeholder="03-1234-5678"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        個人携帯電話
                      </label>
                      <Input
                        name="personalPhone"
                        value={formData.personalPhone}
                        onChange={handleInputChange}
                        placeholder="090-1234-5678"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Address Section */}
              {activeSection === 'address' && (
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-6">
                    住所
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        郵便番号
                      </label>
                      <Input
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        都道府県
                      </label>
                      <Input
                        name="prefecture"
                        value={formData.prefecture}
                        onChange={handleInputChange}
                        placeholder="東京都"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        市区町村
                      </label>
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="渋谷区"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        番地・建物名
                      </label>
                      <Input
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        placeholder="1-2-3"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 flex justify-end space-x-3">
                <Button
                  variant="primary"
                  onClick={() => handleSave(activeSection)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    '変更を保存'
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  )
}
