import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore is used here because Supabase type inference doesn't work correctly for chained query builders

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// =====================================================
// Browser Client - CLIENT-SIDE ONLY (NO COOKIE ACCESS)
// =====================================================
// This client is specifically designed to NEVER access cookies.
// It uses in-memory storage only and relies on server-side
// cookie management via API routes.
let browserClient: ReturnType<typeof createClient<Database>> | null = null

export const getBrowserClient = () => {
  if (browserClient) return browserClient

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  // Create a minimal client with NO storage and NO auth state management
  browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false, // CRITICAL: Never auto-refresh on client
      persistSession: false, // CRITICAL: Never persist session on client
      detectSessionInUrl: false, // CRITICAL: Don't detect session in URL on client
      storage: {
        // NO-OP storage - prevents ALL cookie/localStorage access
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      },
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    global: {
      headers: {
        'x-application-name': 'epackage-lab-web'
      }
    }
  })

  return browserClient
}

// Legacy export for backward compatibility - DEPRECATED
// Use getBrowserClient() instead for new code
export const supabase = supabaseUrl && supabaseAnonKey
    ? getBrowserClient()
    : null

// Service client for admin operations (server-side only)
export const createServiceClient = () => {
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase service credentials not configured')
    }

    return createClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}

// Alias for API routes that expect createSupabaseClient
export const createSupabaseClient = createServiceClient;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
    return !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co'
}

// Database helper functions for B2B e-commerce
// NOTE: These functions use the browser client for client-side queries only.
// For server-side operations, use createServiceClient() instead.
export const db = {
    // Products (public data - safe for client-side)
    async getProducts(category?: string) {
        const client = getBrowserClient()
        if (!client) return []

        let query = client
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true })

        if (category) {
            query = query.eq('category', category)
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { data, error } = await query
        return data || []
    },

    // Quotes - DEPRECATED: Use API routes instead for auth-required operations
    async createQuote(quoteData: Database['public']['Tables']['quotations']['Insert']) {
        // CRITICAL: Database writes should go through API routes, not client-side
        // This function is kept for backward compatibility but should NOT be used
        console.warn('[db.createQuote] DEPRECATED: Use /api/quotations/save instead')
        throw new Error('Client-side database writes are disabled. Use API routes instead.')
    },

    // Contact inquiries - DEPRECATED: Use API routes instead
    async createInquiry(inquiryData: Database['public']['Tables']['inquiries']['Insert']) {
        // CRITICAL: Database writes should go through API routes, not client-side
        console.warn('[db.createInquiry] DEPRECATED: Use /api/contact instead')
        throw new Error('Client-side database writes are disabled. Use API routes instead.')
    },

    // Sample requests - DEPRECATED: Use API routes instead
    async createSampleRequest(sampleData: Database['public']['Tables']['sample_requests']['Insert']) {
        // CRITICAL: Database writes should go through API routes, not client-side
        console.warn('[db.createSampleRequest] DEPRECATED: Use /api/samples/request instead')
        throw new Error('Client-side database writes are disabled. Use API routes instead.')
    }
}

// =====================================================
// Authentication & Profile Utilities
// =====================================================

export interface Profile {
    id: string;
    email: string;
    kanji_last_name: string;
    kanji_first_name: string;
    kana_last_name: string;
    kana_first_name: string;
    corporate_phone?: string | null;
    personal_phone?: string | null;
    business_type: 'INDIVIDUAL' | 'CORPORATION';
    company_name?: string | null;
    legal_entity_number?: string | null;
    position?: string | null;
    department?: string | null;
    company_url?: string | null;
    product_category: 'COSMETICS' | 'CLOTHING' | 'ELECTRONICS' | 'KITCHEN' | 'FURNITURE' | 'OTHER';
    acquisition_channel?: string | null;
    postal_code?: string | null;
    prefecture?: string | null;
    city?: string | null;
    street?: string | null;
    role: 'ADMIN' | 'MEMBER';
    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
    created_at: string;
    updated_at: string;
    last_login_at?: string | null;
}

// Auth utilities for Supabase
export const auth = {
    /**
     * Get current user profile
     * NOTE: This should only be called from server-side code. Use /api/auth/session for client-side.
     */
    async getProfile(userId: string): Promise<Profile | null> {
        // DEV MODE: Skip database query for mock users (SECURE: server-side only)
        if (process.env.NODE_ENV === 'development' && process.env.ENABLE_DEV_MOCK_AUTH === 'true') {
            // Check if this is a mock user ID (starts with 'dev-user-')
            if (userId.startsWith('dev-user-') || userId.startsWith('dev-admin-')) {
                console.log('[getProfile] Dev mode: Skipping database query for mock user:', userId);
                return null; // Return null - AuthContext will use localStorage data instead
            }
        }

        // Use service client for server-side profile queries
        const serviceClient = createServiceClient();

        const { data, error } = await serviceClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully

        if (error) {
            console.error('[getProfile] Database error:', {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint,
                userId
            });
            return null;
        }

        if (!data) {
            console.warn('[getProfile] No profile found for userId:', userId);
            return null;
        }

        return data as Profile;
    },

    /**
     * Check if user has admin role
     */
    async isAdmin(userId: string): Promise<boolean> {
        const profile = await this.getProfile(userId);
        return profile?.role === 'ADMIN' && profile?.status === 'ACTIVE';
    },

    /**
     * Check if user is active (not pending, suspended, or deleted)
     */
    async isActive(userId: string): Promise<boolean> {
        const profile = await this.getProfile(userId);
        return profile?.status === 'ACTIVE';
    },

    /**
     * Update last login timestamp
     */
    async updateLastLogin(userId: string): Promise<void> {
        const serviceClient = createServiceClient();

        await serviceClient
            .from('profiles')
            // @ts-ignore - Supabase update type inference issue
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', userId);
    },

    /**
     * Update user profile fields (user-accessible fields only)
     */
    async updateProfile(userId: string, updates: Partial<Omit<Profile, 'id' | 'email' | 'role' | 'status' | 'created_at' | 'updated_at' | 'last_login_at' | 'kanji_last_name' | 'kanji_first_name' | 'kana_last_name' | 'kana_first_name' | 'business_type' | 'product_category'>>) {
        const serviceClient = createServiceClient();

        // Convert camelCase to snake_case - use indexed type for dynamic keys
        type ProfileUpdate = {
            corporate_phone?: string | null;
            personal_phone?: string | null;
            company_name?: string | null;
            position?: string | null;
            department?: string | null;
            company_url?: string | null;
            acquisition_channel?: string | null;
            postal_code?: string | null;
            prefecture?: string | null;
            city?: string | null;
            street?: string | null;
        };
        const dbUpdates: ProfileUpdate = {};
        if (updates.corporate_phone !== undefined) dbUpdates.corporate_phone = updates.corporate_phone;
        if (updates.personal_phone !== undefined) dbUpdates.personal_phone = updates.personal_phone;
        if (updates.company_name !== undefined) dbUpdates.company_name = updates.company_name;
        if (updates.position !== undefined) dbUpdates.position = updates.position;
        if (updates.department !== undefined) dbUpdates.department = updates.department;
        if (updates.company_url !== undefined) dbUpdates.company_url = updates.company_url;
        if (updates.acquisition_channel !== undefined) dbUpdates.acquisition_channel = updates.acquisition_channel;
        if (updates.postal_code !== undefined) dbUpdates.postal_code = updates.postal_code;
        if (updates.prefecture !== undefined) dbUpdates.prefecture = updates.prefecture;
        if (updates.city !== undefined) dbUpdates.city = updates.city;
        if (updates.street !== undefined) dbUpdates.street = updates.street;

        const { data, error } = await serviceClient
            .from('profiles')
            // @ts-ignore - Supabase update type inference issue
            .update(dbUpdates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data as Profile;
    },

    /**
     * Get all users (admin only)
     */
    async getAllUsers(filters?: { status?: Profile['status']; role?: Profile['role'] }): Promise<Profile[]> {
        const serviceClient = createServiceClient();

        let query = serviceClient
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }
        if (filters?.role) {
            query = query.eq('role', filters.role);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Users fetch error:', error);
            return [];
        }

        return data as Profile[];
    },

    /**
     * Update user status (admin only)
     */
    async updateUserStatus(userId: string, status: Profile['status']): Promise<Profile | null> {
        const serviceClient = createServiceClient();

        const { data, error } = await serviceClient
            .from('profiles')
            // @ts-ignore - Supabase update type inference issue
            .update({ status })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Status update error:', error);
            return null;
        }

        return data as Profile;
    },

    /**
     * Update user role (admin only)
     */
    async updateUserRole(userId: string, role: Profile['role']): Promise<Profile | null> {
        const serviceClient = createServiceClient();

        const { data, error } = await serviceClient
            .from('profiles')
            // @ts-ignore - Supabase update type inference issue
            .update({ role })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Role update error:', error);
            return null;
        }

        return data as Profile;
    },

    /**
     * Get display name from profile
     */
    getDisplayName(profile: Profile): string {
        return `${profile.kanji_last_name} ${profile.kanji_first_name}`;
    },

    /**
     * Get display name in kana
     */
    getDisplayNameKana(profile: Profile): string {
        return `${profile.kana_last_name} ${profile.kana_first_name}`;
    }
};

// Helper to get user email
export const getUserEmail = async (userId: string): Promise<string | null> => {
    const profile = await auth.getProfile(userId);
    return profile?.email ?? null;
};

// Helper to create Supabase client with custom cookie storage (for API routes)
export const createSupabaseWithCookies = async (cookieStore: {
    get: (key: string) => { value?: string } | undefined;
    set: (key: string, value: string, options?: { httpOnly?: boolean; secure?: boolean; sameSite?: string; path?: string }) => void;
    delete: (key: string) => void;
}) => {
    // DEV_MODE: Create a mock client for testing (SECURE: server-side only)
    if (process.env.NODE_ENV === 'development' && process.env.ENABLE_DEV_MOCK_AUTH === 'true') {
        console.log('[createSupabaseWithCookies] DEV_MODE: Creating mock client');

        // Try to get mock user ID from cookies
        const mockUserIdCookie = cookieStore.get('dev-mock-user-id');
        const mockUserId = mockUserIdCookie?.value || null;

        if (mockUserId) {
            console.log('[createSupabaseWithCookies] DEV_MODE: Found mock user ID:', mockUserId);
        }

        // Create a minimal mock client that works with the auth interface
        const mockClient = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
            auth: {
                storage: {
                    getItem: (key: string) => {
                        // Return mock tokens for DEV_MODE
                        if (key === 'sb-access-token' && mockUserId) {
                            return JSON.stringify({
                                access_token: 'mock-access-token',
                                refresh_token: 'mock-refresh-token',
                                user: {
                                    id: mockUserId,
                                    email: 'test@epackage-lab.com',
                                    user_metadata: {
                                        kanji_last_name: 'テスト',
                                        kanji_first_name: 'ユーザー',
                                    },
                                },
                            });
                        }
                        const cookie = cookieStore.get(key);
                        return cookie?.value ?? null;
                    },
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    setItem: (key: string, _value: string) => {
                        // In DEV_MODE, don't actually set cookies on server
                        console.log('[createSupabaseWithCookies] DEV_MODE: Skipping cookie set on server:', key);
                    },
                    removeItem: (key: string) => {
                        cookieStore.delete(key);
                    },
                },
            },
        });

        return mockClient;
    }

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase credentials not configured');
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            storage: {
                getItem: (key: string) => {
                    const cookie = cookieStore.get(key);
                    return cookie?.value ?? null;
                },
                setItem: (key: string, value: string) => {
                    cookieStore.set(key, value, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        path: '/',
                    });
                },
                removeItem: (key: string) => {
                    cookieStore.delete(key);
                },
            },
        },
    });
};
