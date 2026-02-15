'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase-browser'
import { auth, type Profile } from '@/lib/supabase'
import type { User, Session, RegistrationFormData } from '@/types/auth'
import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js'

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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Track previous route to detect changes
  const previousPathname = useRef(pathname)
  // Track pending fetch to prevent race conditions
  const pendingFetchId = useRef<number>(0)
  // Persist user state across route changes to prevent loss
  const previousUserRef = useRef<User | null>(null)

  // =====================================================
  // Session Management & Auth State Listener
  // =====================================================

  // Memoized fetch session function that can be called on route changes
  // Uses fetchId to prevent race conditions from concurrent requests
  const fetchSessionAndUpdateState = useCallback(async (fetchId?: number) => {
    // Generate a new fetch ID if not provided
    const currentFetchId = fetchId ?? ++pendingFetchId.current

    try {
      console.log('[AuthContext] Fetching session from /api/auth/current-user...', { fetchId: currentFetchId })

      const response = await fetch('/api/auth/current-user', {
        credentials: 'include', // Critical: include cookies in request
      })

      // Check if this is still the latest request
      if (currentFetchId !== pendingFetchId.current) {
        console.log('[AuthContext] Discarding stale session response', { fetchId: currentFetchId, latest: pendingFetchId.current })
        return
      }

      if (response.ok) {
        const sessionData = await response.json()

        if (sessionData.session?.user && sessionData.profile) {
          const convertedUser = convertSupabaseUser(sessionData.session.user, sessionData.profile)
          setSession({
            token: 'server-managed',
            expires: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          })
          setProfile(sessionData.profile)
          setUser(convertedUser)
          // Update ref for state persistence
          previousUserRef.current = convertedUser
          console.log('[AuthContext] Session updated successfully', { fetchId: currentFetchId })
        } else {
          // Session is invalid or expired - only clear if we have valid previous state
          // to prevent flickering during route changes
          setSession(null)
          setProfile(null)
          setUser(null)
          previousUserRef.current = null
        }
      } else {
        // Only clear user state on explicit 401 unauthorized
        // For other errors, preserve existing state to prevent flicker
        if (response.status === 401) {
          console.warn('[AuthContext] Session unauthorized (401), clearing state')
          setSession(null)
          setProfile(null)
          setUser(null)
          previousUserRef.current = null
        } else {
          console.warn('[AuthContext] Session fetch failed:', response.status, '- preserving existing state')
          // Preserve current user state - don't clear on transient failures
        }
      }
    } catch (error) {
      // Check if this is still the latest request
      if (currentFetchId !== pendingFetchId.current) {
        console.log('[AuthContext] Discarding stale error response', { fetchId: currentFetchId })
        return
      }
      // Gracefully handle fetch errors (redirect loops, network issues, etc.)
      // Preserve existing user state to prevent flickering during navigation
      console.log('[AuthContext] Session fetch unavailable - preserving existing state')
      // Don't clear user state on network errors - use fallback to previousUserRef if needed
      if (previousUserRef.current && !user) {
        // Restore from ref if user was unexpectedly lost
        console.log('[AuthContext] Restoring user state from previous ref')
        setUser(previousUserRef.current)
      }
    }
  }, [user])

  useEffect(() => {
    let mounted = true

    // IMPORTANT: Call the server endpoint to read cookies (httpOnly cookies can't be read by client JS)
    // CRITICAL: credentials: 'include' is required to send cookies with the request

    const getInitialSession = async () => {
      try {
        console.log('[AuthContext] Initializing auth context...')

        if (!supabase) {
          console.warn('Supabase client not configured')
          setIsLoading(false)
          return
        }

        // Use the shared fetch session function
        await fetchSessionAndUpdateState()

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

    // =====================================================
    // ✅ Session Refresh Logic (30分セッション維持)
    // =====================================================
    // 1分ごとにセッションを確認し、期限切れ5分前に自動リフレッシュ

    const refreshInterval = setInterval(async () => {
      if (!mounted || !session) return;

      try {
        // セッション有効期限をチェック
        const expiresAt = new Date(session.expires).getTime();
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;

        // 期限切れ5分前（300,000ms）または既に期限切れの場合にリフレッシュ
        if (timeUntilExpiry <= 5 * 60 * 1000) {
          console.log('[AuthContext] Session expiring soon, refreshing...')

          // Use the shared fetch session function
          await fetchSessionAndUpdateState()
        }
      } catch (error) {
        console.error('[AuthContext] Session refresh error:', error);
      }
    }, 60 * 1000); // ✅ 1分ごとにチェック

    // NOTE: onAuthStateChange listener removed because:
    // 1. Client-side supabase client uses localStorage, but we're using httpOnly cookies
    // 2. Auth state changes are handled by page navigation (full reload after login)
    // 3. The session API endpoint is called on page load to get the current state
    //
    // ✅ セッションリフレッシュ: 1分ごとにチェックし、5分前に自動リフレッシュ

    return () => {
      mounted = false
      clearInterval(refreshInterval) // ✅ インターバルをクリア
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // =====================================================
  // Route Change Detection for Auth State Refresh
  // =====================================================
  // When navigating between member pages using Next.js Link, the AuthContext
  // needs to re-fetch the session to ensure the auth state is up-to-date.
  // This effect detects route changes and refreshes the session accordingly.
  //
  // CRITICAL: fetchSessionAndUpdateState is NOT in dependency array because:
  // 1. It's stable (useCallback with empty deps)
  // 2. Including it would cause the effect to run on every render
  // 3. The function itself handles race conditions via fetchId

  useEffect(() => {
    // Detect route changes by comparing current and previous pathnames
    const routeChanged = pathname !== previousPathname.current

    if (routeChanged) {
      console.log('[AuthContext] Route changed, refreshing auth state:', {
        from: previousPathname.current,
        to: pathname,
      })

      // Refresh session on route change to ensure auth state is current
      // Pass a new fetch ID to track this specific request
      const fetchId = ++pendingFetchId.current
      fetchSessionAndUpdateState(fetchId)

      // Update previous values
      previousPathname.current = pathname
    }
  }, [pathname, fetchSessionAndUpdateState])

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
    await fetchSessionAndUpdateState()
  }, [fetchSessionAndUpdateState])

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

  const isAuthenticated = !!user && !!session && new Date(session.expires) > new Date()
  // Normalize role to lowercase for consistency with rbac-helpers.ts normalizeRole()
  const isAdmin = user?.role?.toLowerCase() === 'admin'

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
