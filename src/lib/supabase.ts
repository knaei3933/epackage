import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Enhanced client for client-side usage
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
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
export const db = {
    // Products
    async getProducts(category?: string) {
        if (!supabase) return []

        let query = supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true })

        if (category) {
            query = query.eq('category', category)
        }

        const { data, error } = await query
        return data || []
    },

    // Quotes
    async createQuote(quoteData: Database['public']['Tables']['quotations']['Insert']) {
        if (!supabase) throw new Error('Database not configured')

        const { data, error } = await supabase
            .from('quotations')
            .insert(quoteData as any)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Contact inquiries
    async createInquiry(inquiryData: Database['public']['Tables']['inquiries']['Insert']) {
        if (!supabase) throw new Error('Database not configured')

        const { data, error } = await supabase
            .from('inquiries')
            .insert(inquiryData as any)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Sample requests
    async createSampleRequest(sampleData: Database['public']['Tables']['sample_requests']['Insert']) {
        if (!supabase) throw new Error('Database not configured')

        const { data, error } = await supabase
            .from('sample_requests')
            .insert(sampleData as any)
            .select()
            .single()

        if (error) throw error
        return data
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
     */
    async getProfile(userId: string): Promise<Profile | null> {
        if (!supabase) {
            console.warn('[getProfile] Supabase client not initialized');
            return null;
        }

        // DEV MODE: Skip database query for mock users
        if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
            // Check if this is a mock user ID (starts with 'dev-user-')
            if (userId.startsWith('dev-user-') || userId.startsWith('dev-admin-')) {
                console.log('[getProfile] Dev mode: Skipping database query for mock user:', userId);
                return null; // Return null - AuthContext will use localStorage data instead
            }
        }

        const sb = supabase as any;
        const { data, error } = await sb
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
        if (!supabase) return;

        const sb = supabase as any;
        await sb
            .from('profiles')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', userId);
    },

    /**
     * Update user profile fields (user-accessible fields only)
     */
    async updateProfile(userId: string, updates: Partial<Omit<Profile, 'id' | 'email' | 'role' | 'status' | 'created_at' | 'updated_at' | 'last_login_at' | 'kanji_last_name' | 'kanji_first_name' | 'kana_last_name' | 'kana_first_name' | 'business_type' | 'product_category'>>) {
        if (!supabase) throw new Error('Database not configured');

        // Convert camelCase to snake_case
        const dbUpdates: Record<string, any> = {};
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

        const sb = supabase as any;
        const { data, error } = await sb
            .from('profiles')
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
        if (!supabase) return [];

        let query = supabase
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
        const serviceClient = createServiceClient() as any;

        const { data, error } = await serviceClient
            .from('profiles')
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
        const serviceClient = createServiceClient() as any;

        const { data, error } = await serviceClient
            .from('profiles')
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
export const createSupabaseWithCookies = async (cookieStore: any) => {
    // DEV_MODE: Create a mock client for testing
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
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
                    setItem: (key: string, value: string) => {
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
