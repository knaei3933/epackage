'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, auth, type Profile } from '@/lib/supabase'
import type { User, Session, RegistrationFormData } from '@/types/auth'
import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js'
import { isDevMode } from '@/lib/dev-mode'

// =====================================================
// Type Definitions
// =====================================================

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  // Auth operations
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUp: (data: RegistrationFormData) => Promise<{ success: boolean; message: string }>
  refreshSession: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  // Password reset
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Convert Supabase User to our User type
 */
function convertSupabaseUser(
  supabaseUser: SupabaseUser | null,
  profile: Profile | null
): User | null {
  if (!supabaseUser || !profile) return null

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    emailVerified: supabaseUser.email_confirmed_at ? new Date(supabaseUser.email_confirmed_at) : null,
    kanjiLastName: profile.kanji_last_name,
    kanjiFirstName: profile.kanji_first_name,
    kanaLastName: profile.kana_last_name,
    kanaFirstName: profile.kana_first_name,
    corporatePhone: profile.corporate_phone,
    personalPhone: profile.personal_phone,
    businessType: profile.business_type as User['businessType'],
    companyName: profile.company_name,
    legalEntityNumber: profile.legal_entity_number,
    position: profile.position,
    department: profile.department,
    companyUrl: profile.company_url,
    productCategory: profile.product_category as User['productCategory'],
    acquisitionChannel: profile.acquisition_channel,
    postalCode: profile.postal_code,
    prefecture: profile.prefecture,
    city: profile.city,
    street: profile.street,
    role: profile.role as User['role'],
    status: profile.status as User['status'],
    createdAt: new Date(profile.created_at),
    updatedAt: new Date(profile.updated_at),
    lastLoginAt: profile.last_login_at ? new Date(profile.last_login_at) : null,
  }
}

/**
 * Convert Supabase Session to our Session type
 */
function convertSupabaseSession(supabaseSession: SupabaseSession | null): Session | null {
  if (!supabaseSession) return null

  return {
    token: supabaseSession.access_token,
    expires: new Date(supabaseSession.expires_at! * 1000).toISOString(),
  }
}

// =====================================================
// AuthProvider Component
// =====================================================

// 쿠키에서 mock 사용자 ID를 읽어옵니다
function getDevMockUserIdFromCookie(): string | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';')
  const mockUserIdCookie = cookies.find(cookie =>
    cookie.trim().startsWith('dev-mock-user-id=')
  )
  if (mockUserIdCookie) {
    return mockUserIdCookie.split('=')[1].trim()
  }
  return null
}

// localStorage에서 즉시 사용자 데이터를 로드하는 헬퍼 함수
function loadUserFromLocalStorage(): { user: User | null; profile: Profile | null } {
  // DEV_MODE: localStorage에서 mock user 데이터 로드 (signin API에서 저장된 데이터)
  // IMPORTANT: Only load from localStorage if DEV_MODE is enabled
  if (typeof document !== 'undefined' && isDevMode()) {
    try {
      // 쿠키에서 사용자 ID 확인 (우선 사용)
      const cookieUserId = getDevMockUserIdFromCookie()

      const mockUserStr = localStorage.getItem('dev-mock-user')
      if (mockUserStr) {
        const mockUserData = JSON.parse(mockUserStr)
        console.log('[AuthContext] Loading user from localStorage during init:', mockUserData)

        // 쿠키에 있는 사용자 ID로 업데이트 (일관성 유지)
        const userId = cookieUserId || mockUserData.id

        const mockProfile: Profile = {
          id: userId, // 쿠키의 ID 사용
          email: mockUserData.email,
          kanji_last_name: mockUserData.kanjiLastName || 'テスト',
          kanji_first_name: mockUserData.kanjiFirstName || 'ユーザー',
          kana_last_name: mockUserData.kanaLastName || 'テスト',
          kana_first_name: mockUserData.kanaFirstName || 'ユーザー',
          corporate_phone: mockUserData.corporatePhone || '03-1234-5678',
          personal_phone: mockUserData.personalPhone || '090-1234-5678',
          business_type: mockUserData.businessType || 'CORPORATION',
          company_name: mockUserData.companyName || 'テスト会社',
          legal_entity_number: mockUserData.legalEntityNumber || '1234567890123',
          position: mockUserData.position || '担当者',
          department: mockUserData.department || '営業',
          company_url: mockUserData.companyUrl || 'https://example.com',
          product_category: mockUserData.productCategory || 'OTHER',
          acquisition_channel: mockUserData.acquisitionChannel || 'web_search',
          postal_code: mockUserData.postalCode || '123-4567',
          prefecture: mockUserData.prefecture || '東京都',
          city: mockUserData.city || '渋谷区',
          street: mockUserData.street || '1-2-3',
          role: mockUserData.role || 'MEMBER',
          status: mockUserData.status || 'ACTIVE',
          created_at: mockUserData.createdAt || new Date().toISOString(),
          updated_at: mockUserData.updatedAt || new Date().toISOString(),
          last_login_at: mockUserData.lastLoginAt || new Date().toISOString(),
        }

        const mockUser: User = {
          id: mockProfile.id,
          email: mockProfile.email,
          emailVerified: new Date(),
          kanjiLastName: mockProfile.kanji_last_name,
          kanjiFirstName: mockProfile.kanji_first_name,
          kanaLastName: mockProfile.kana_last_name,
          kanaFirstName: mockProfile.kana_first_name,
          corporatePhone: mockProfile.corporate_phone,
          personalPhone: mockProfile.personal_phone,
          businessType: mockProfile.business_type as User['businessType'],
          companyName: mockProfile.company_name,
          legalEntityNumber: mockProfile.legal_entity_number,
          position: mockProfile.position,
          department: mockProfile.department,
          companyUrl: mockProfile.company_url,
          productCategory: mockProfile.product_category as User['productCategory'],
          acquisitionChannel: mockProfile.acquisition_channel,
          postalCode: mockProfile.postal_code,
          prefecture: mockProfile.prefecture,
          city: mockProfile.city,
          street: mockProfile.street,
          role: mockProfile.role as User['role'],
          status: mockProfile.status as User['status'],
          createdAt: new Date(mockProfile.created_at),
          updatedAt: new Date(mockProfile.updated_at),
          lastLoginAt: new Date(mockProfile.last_login_at!),
        }

        return { user: mockUser, profile: mockProfile }
      }
    } catch (e) {
      console.error('[AuthContext] Failed to load from localStorage:', e)
    }
  }
  return { user: null, profile: null }
}

export function AuthProvider({ children }: AuthProviderProps) {
  // useState 초기화 함수 사용 - 컴포넌트 마운트 시 즉시 실행됨
  const initialData = loadUserFromLocalStorage()
  const [user, setUser] = useState<User | null>(initialData.user)
  const [profile, setProfile] = useState<Profile | null>(initialData.profile)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(!initialData.user) // user가 있으면 이미 로딩 완료
  const router = useRouter()

  // =====================================================
  // Session Management & Auth State Listener
  // =====================================================

  useEffect(() => {
    let mounted = true

    // DEV MODE: 이미 user가 로드되었으면 session만 설정
    if (user) {
      console.log('[AuthContext] User already loaded from state, setting session only')
      if (mounted && !session) {
        setSession({
          token: 'dev-mock-token',
          expires: new Date(Date.now() + 3600000).toISOString(),
        })
      }
      setIsLoading(false)
      return
    }

    // Get initial session (PROD or 초기 사용자 없는 경우)
    const getInitialSession = async () => {
      try {
        console.log('[AuthContext] Initializing auth context...')
        console.log('[AuthContext] NODE_ENV:', process.env.NODE_ENV)
        // SECURITY: Client-side dev mode check removed for security

        if (!supabase) {
          console.warn('Supabase client not configured')
          setIsLoading(false)
          return
        }

        // DEV MODE: localStorage에 mock user가 있는지 확인
        if (typeof document !== 'undefined') {
          const mockUserStr = localStorage.getItem('dev-mock-user')
          if (mockUserStr) {
            console.log('[AuthContext] Found mock user in localStorage, using DEV MODE')

            // Get cookies
            const cookies = document.cookie.split(';').reduce((acc, cookie) => {
              const [key, value] = cookie.trim().split('=')
              acc[key] = value
              return acc
            }, {} as Record<string, string>)
            const mockAccessToken = cookies['sb-access-token']
            console.log('[AuthContext] Found sb-access-token in cookies:', !!mockAccessToken)

            let mockUserData = null
            try {
              mockUserData = JSON.parse(mockUserStr)
              console.log('[AuthContext] Using mock user data from localStorage:', mockUserData)
            } catch (e) {
              console.error('[AuthContext] Failed to parse mock user data:', e)
            }

            if (mockUserData) {
              // Create Profile from mockUserData
              const mockProfile: Profile = {
                id: mockUserData.id,
                email: mockUserData.email,
                kanji_last_name: mockUserData.kanjiLastName || 'テスト',
                kanji_first_name: mockUserData.kanjiFirstName || 'ユーザー',
                kana_last_name: mockUserData.kanaLastName || 'テスト',
                kana_first_name: mockUserData.kanaFirstName || 'ユーザー',
                corporate_phone: mockUserData.corporatePhone || '03-1234-5678',
                personal_phone: mockUserData.personalPhone || '090-1234-5678',
                business_type: mockUserData.businessType || 'CORPORATION',
                company_name: mockUserData.companyName || 'テスト会社',
                legal_entity_number: mockUserData.legalEntityNumber || '1234567890123',
                position: mockUserData.position || '担当者',
                department: mockUserData.department || '営業',
                company_url: mockUserData.companyUrl || 'https://example.com',
                product_category: mockUserData.productCategory || 'OTHER',
                acquisition_channel: mockUserData.acquisitionChannel || 'web_search',
                postal_code: mockUserData.postalCode || '123-4567',
                prefecture: mockUserData.prefecture || '東京都',
                city: mockUserData.city || '渋谷区',
                street: mockUserData.street || '1-2-3',
                role: mockUserData.role || 'MEMBER',
                status: mockUserData.status || 'ACTIVE',
                created_at: mockUserData.createdAt || new Date().toISOString(),
                updated_at: mockUserData.updatedAt || new Date().toISOString(),
                last_login_at: mockUserData.lastLoginAt || new Date().toISOString(),
              }

              const mockUser: User = {
                id: mockProfile.id,
                email: mockProfile.email,
                emailVerified: new Date(),
                kanjiLastName: mockProfile.kanji_last_name,
                kanjiFirstName: mockProfile.kanji_first_name,
                kanaLastName: mockProfile.kana_last_name,
                kanaFirstName: mockProfile.kana_first_name,
                corporatePhone: mockProfile.corporate_phone,
                personalPhone: mockProfile.personal_phone,
                businessType: mockProfile.business_type as User['businessType'],
                companyName: mockProfile.company_name,
                legalEntityNumber: mockProfile.legal_entity_number,
                position: mockProfile.position,
                department: mockProfile.department,
                companyUrl: mockProfile.company_url,
                productCategory: mockProfile.product_category as User['productCategory'],
                acquisitionChannel: mockProfile.acquisition_channel,
                postalCode: mockProfile.postal_code,
                prefecture: mockProfile.prefecture,
                city: mockProfile.city,
                street: mockProfile.street,
                role: mockProfile.role as User['role'],
                status: mockProfile.status as User['status'],
                createdAt: new Date(mockProfile.created_at),
                updatedAt: new Date(mockProfile.updated_at),
                lastLoginAt: new Date(mockProfile.last_login_at!),
              }

              if (mounted) {
                console.log('[AuthContext] Setting mock user state:', mockUser)
                setUser(mockUser)
                setProfile(mockProfile)
                setSession({
                  token: mockAccessToken || 'dev-mock-token',
                  expires: new Date(Date.now() + 3600000).toISOString(),
                })
                setIsLoading(false)
              }
              return
            }
          }
        }

        // Get current session from SERVER API
        // IMPORTANT: Call the server endpoint to read cookies (httpOnly cookies can't be read by client JS)
        // CRITICAL: credentials: 'include' is required to send cookies with the request
        const sessionResponse = await fetch('/api/auth/session/', {
          credentials: 'include', // Include cookies in the request
        })
        const sessionData = await sessionResponse.json()

        if (sessionData.session?.user) {
          // Use session data from server (already includes profile)
          const profileData = sessionData.profile

          if (mounted) {
            // Convert server session format to client session format
            setSession({
              token: 'server-managed', // Session is managed by httpOnly cookies
              expires: new Date(Date.now() + 3600000).toISOString(),
            })
            setProfile(profileData)
            setUser(convertSupabaseUser(sessionData.session.user, profileData))
          }
        } else {
          if (mounted) {
            setSession(null)
            setProfile(null)
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setSession(null)
          setProfile(null)
          setUser(null)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    getInitialSession()

    // NOTE: onAuthStateChange listener removed because:
    // 1. Client-side supabase client uses localStorage, but we're using httpOnly cookies
    // 2. Auth state changes are handled by page navigation (full reload after login)
    // 3. The session API endpoint is called on page load to get the current state
    //
    // If needed in the future, we can implement polling or SSE for real-time auth state updates

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // =====================================================
  // Auth Operations
  // =====================================================

  /**
   * Sign in with email and password
   * Uses server-side API to set httpOnly cookies - no client-side auth state
   */
  const signIn = useCallback(async (email: string, password: string) => {
    // Use server-side API route for authentication
    // This sets httpOnly cookies on the server - no client-side storage
    const response = await fetch('/api/auth/signin/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Critical: include cookies in request
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'ログインに失敗しました。')
    }

    if (!data.user || !data.profile) {
      throw new Error('ログインに失敗しました。')
    }

    // Update local state from server response
    // Session is managed by httpOnly cookies on the server
    setProfile(data.profile)
    setUser(data.user)
    setSession({
      token: 'server-managed', // Session is managed by httpOnly cookies
      expires: new Date(Date.now() + 3600000).toISOString(),
    })

    console.log('[AuthContext] Sign in successful:', {
      userId: data.user.id,
      email: data.user.email,
      role: data.profile.role,
      status: data.profile.status,
    })
  }, [])

  /**
   * Sign up new user
   */
  const signUp = useCallback(async (formData: RegistrationFormData) => {
    if (!supabase) throw new Error('Supabase client not configured')

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            kanji_last_name: formData.kanjiLastName,
            kanji_first_name: formData.kanjiFirstName,
            kana_last_name: formData.kanaLastName,
            kana_first_name: formData.kanaFirstName,
          },
        },
      })

      if (authError) {
        throw new Error(authError.message || '会員登録に失敗しました。')
      }

      if (!authData.user) {
        throw new Error('会員登録に失敗しました。')
      }

      // 2. Create profile in database (via API route for security)
      const response = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authData.user.id,
          ...formData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'プロフィールの作成に失敗しました。')
      }

      return {
        success: true,
        message: '会員登録が完了しました。メール認証後、ログインしてください。',
      }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }, [])

  /**
   * Sign out
   * Uses server-side API to clear httpOnly cookies
   */
  const signOut = useCallback(async () => {
    try {
      // Call server-side signout endpoint to clear httpOnly cookies
      await fetch('/api/auth/signout/', {
        method: 'POST',
        credentials: 'include', // Critical: include cookies in request
      })

      // Clear localStorage mock data
      if (typeof document !== 'undefined') {
        localStorage.removeItem('dev-mock-user')
      }
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      // Always clear local state
      setSession(null)
      setProfile(null)
      setUser(null)
      router.push('/')
    }
  }, [router])

  /**
   * Refresh session
   * Uses server-side API to refresh httpOnly cookies
   */
  const refreshSession = useCallback(async () => {
    try {
      // Call server-side session endpoint to refresh httpOnly cookies
      const response = await fetch('/api/auth/session/', {
        credentials: 'include', // Critical: include cookies in request
      })

      if (response.ok) {
        const sessionData = await response.json()

        if (sessionData.session?.user && sessionData.profile) {
          setSession({
            token: 'server-managed', // Session is managed by httpOnly cookies
            expires: new Date(Date.now() + 3600000).toISOString(),
          })
          setProfile(sessionData.profile)
          setUser(convertSupabaseUser(sessionData.session.user, sessionData.profile))
        } else {
          setSession(null)
          setProfile(null)
          setUser(null)
        }
      } else {
        setSession(null)
        setProfile(null)
        setUser(null)
      }
    } catch (error) {
      console.error('Session refresh error:', error)
      setSession(null)
      setProfile(null)
      setUser(null)
    }
  }, [])

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user?.id) throw new Error('User not authenticated')

    // Convert User fields to Profile fields
    const profileUpdates: Partial<Omit<Profile, 'id' | 'email' | 'created_at' | 'updated_at'>> = {}

    if (updates.corporatePhone !== undefined) profileUpdates.corporate_phone = updates.corporatePhone
    if (updates.personalPhone !== undefined) profileUpdates.personal_phone = updates.personalPhone
    if (updates.companyName !== undefined) profileUpdates.company_name = updates.companyName
    if (updates.position !== undefined) profileUpdates.position = updates.position
    if (updates.department !== undefined) profileUpdates.department = updates.department
    if (updates.companyUrl !== undefined) profileUpdates.company_url = updates.companyUrl
    if (updates.acquisitionChannel !== undefined) profileUpdates.acquisition_channel = updates.acquisitionChannel
    if (updates.postalCode !== undefined) profileUpdates.postal_code = updates.postalCode
    if (updates.prefecture !== undefined) profileUpdates.prefecture = updates.prefecture
    if (updates.city !== undefined) profileUpdates.city = updates.city
    if (updates.street !== undefined) profileUpdates.street = updates.street

    const updatedProfile = await auth.updateProfile(user.id, profileUpdates)

    // Update local state
    setProfile(updatedProfile)
    setUser(prev => prev ? { ...prev, ...updates } : null)
  }, [user])

  /**
   * Reset password (send reset email)
   * Uses server-side API to avoid client-side auth state
   */
  const resetPassword = useCallback(async (email: string) => {
    // Use server-side API for password reset
    const response = await fetch('/api/auth/reset-password/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'パスワードリセットメールの送信に失敗しました。')
    }
  }, [])

  /**
   * Update password (for authenticated user)
   * Uses server-side API to avoid client-side auth state
   */
  const updatePassword = useCallback(async (newPassword: string) => {
    // Use server-side API for password update
    const response = await fetch('/api/auth/update-password/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ newPassword }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'パスワード変更に失敗しました。')
    }
  }, [])

  // =====================================================
  // Computed Values
  // =====================================================

  const isAuthenticated = !!user
  const isAdmin = user?.role === 'ADMIN'

  const value: AuthContextType = {
    user,
    session,
    profile,
    isAuthenticated,
    isAdmin,
    isLoading,
    // Auth operations
    signIn,
    signOut,
    signUp,
    refreshSession,
    updateProfile,
    resetPassword,
    updatePassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// =====================================================
// Custom Hook
// =====================================================

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
