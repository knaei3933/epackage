/**
 * Supabase Client Library
 *
 * Server-side: Uses @supabase/supabase-js
 * Client-side: Use useSupabaseClient hook
 *
 * IMPORTANT: This file is for server-side usage only.
 * Client Components should use useSupabaseClient hook.
 */

import { Database } from '@/types/database'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/\n/g, '').replace(/\r/g, '').trim()

// =====================================================
// Type Exports
// =====================================================

export type { Database }

// =====================================================
// Server-Side Client
// =====================================================

let serverClient: any = null

export const getServerClient = () => {
  if (serverClient) return serverClient

  // During build or when credentials not available, return mock client
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[getServerClient] Credentials not configured, using mock client')

    // Create a chainable query builder mock
    const createQueryMock = () => ({
      select: (columns?: string) => createQueryMock(),
      insert: (data: any) => createQueryMock(),
      update: (data: any) => createQueryMock(),
      delete: () => createQueryMock(),
      eq: (column: string, value: any) => createQueryMock(),
      neq: (column: string, value: any) => createQueryMock(),
      gt: (column: string, value: any) => createQueryMock(),
      gte: (column: string, value: any) => createQueryMock(),
      lt: (column: string, value: any) => createQueryMock(),
      lte: (column: string, value: any) => createQueryMock(),
      like: (column: string, value: any) => createQueryMock(),
      ilike: (column: string, value: any) => createQueryMock(),
      in: (column: string, values: any[]) => createQueryMock(),
      order: (column: string, options?: { ascending: boolean }) => createQueryMock(),
      limit: (n: number) => createQueryMock(),
      range: (from: number, to: number) => createQueryMock(),
      single: () => ({ data: null, error: { message: 'Not configured', code: 'CONFIG_ERROR' } }),
      maybeSingle: () => ({ data: null, error: { message: 'Not configured', code: 'CONFIG_ERROR' } }),
      then: (resolve: any) => resolve({ data: null, error: { message: 'Not configured', code: 'CONFIG_ERROR' } }),
    })

    return {
      from: (table: string) => createQueryMock(),
      select: (columns?: string) => createQueryMock(),
      insert: (data: any) => createQueryMock(),
      update: (data: any) => createQueryMock(),
      delete: () => createQueryMock(),
      rpc: (fn: string, params?: any) => createQueryMock(),
      auth: {
        getUser: async () => ({ data: { user: null }, error: { message: 'Not configured' } }),
        getSession: async () => ({ data: { session: null }, error: { message: 'Not configured' } }),
      },
    } as any
  }

  serverClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return serverClient
}

// Service client for admin operations (server-side only)
export const createServiceClient = () => {
    // Read env vars at function call time, not module load time
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/\n/g, '').replace(/\r/g, '').trim();

    if (!url || !key) {
        // During build, return a mock client to prevent errors
        console.warn('[createServiceClient] Credentials not configured, using mock client');

        // Create a chainable query builder mock
        const createQueryMock = () => ({
            select: (columns?: string) => createQueryMock(),
            insert: (data: any) => createQueryMock(),
            update: (data: any) => createQueryMock(),
            delete: () => createQueryMock(),
            eq: (column: string, value: any) => createQueryMock(),
            neq: (column: string, value: any) => createQueryMock(),
            gt: (column: string, value: any) => createQueryMock(),
            gte: (column: string, value: any) => createQueryMock(),
            lt: (column: string, value: any) => createQueryMock(),
            lte: (column: string, value: any) => createQueryMock(),
            like: (column: string, value: any) => createQueryMock(),
            ilike: (column: string, value: any) => createQueryMock(),
            in: (column: string, values: any[]) => createQueryMock(),
            order: (column: string, options?: { ascending: boolean }) => createQueryMock(),
            limit: (n: number) => createQueryMock(),
            range: (from: number, to: number) => createQueryMock(),
            single: () => ({ data: null, error: { message: 'Not configured', code: 'CONFIG_ERROR' } }),
            maybeSingle: () => ({ data: null, error: { message: 'Not configured', code: 'CONFIG_ERROR' } }),
            then: (resolve: any) => resolve({ data: null, error: { message: 'Not configured', code: 'CONFIG_ERROR' } }),
        });

        return {
            from: (table: string) => createQueryMock(),
            select: (columns?: string) => createQueryMock(),
            insert: (data: any) => createQueryMock(),
            update: (data: any) => createQueryMock(),
            delete: () => createQueryMock(),
            rpc: (fn: string, params?: any) => createQueryMock(),
        } as any;
    }

    return createClient<Database>(url, key, {
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

// =====================================================
// Database helper functions
// =====================================================

export const db = {
    async getProducts(category?: string) {
        const client = await getServerClient()
        if (!client) return []

        let query = client
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

    async createQuote(_quoteData: any) {
        console.warn('[db.createQuote] DEPRECATED: Use /api/quotations/save instead')
        throw new Error('Client-side database writes are disabled. Use API routes instead.')
    },

    async createInquiry(_inquiryData: any) {
        console.warn('[db.createInquiry] DEPRECATED: Use /api/contact instead')
        throw new Error('Client-side database writes are disabled. Use API routes instead.')
    },

    async createSampleRequest(_sampleData: any) {
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
    user_type?: 'B2B' | 'B2C' | null;
    founded_year?: string | null;
    capital?: string | null;
    representative_name?: string | null;
    business_document_path?: string | null;
    created_at: string;
    updated_at: string;
    last_login_at?: string | null;
}

export const auth = {
    async getProfile(userId: string): Promise<Profile | null> {
        const serviceClient = createServiceClient();

        const { data, error } = await serviceClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            console.error('[getProfile] Database error:', {
                code: error.code,
                message: error.message,
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

    async isAdmin(userId: string): Promise<boolean> {
        const profile = await this.getProfile(userId);
        return profile?.role?.toLowerCase() === 'admin' && profile?.status === 'ACTIVE';
    },

    async isActive(userId: string): Promise<boolean> {
        const profile = await this.getProfile(userId);
        return profile?.status === 'ACTIVE';
    },

    async updateLastLogin(userId: string): Promise<void> {
        const serviceClient = createServiceClient();
        await serviceClient
            .from('profiles')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', userId);
    },

    async updateProfile(userId: string, updates: Partial<Omit<Profile, 'id' | 'email' | 'role' | 'status' | 'created_at' | 'updated_at' | 'last_login_at' | 'kanji_last_name' | 'kanji_first_name' | 'kana_last_name' | 'kana_first_name' | 'business_type' | 'product_category'>>) {
        const serviceClient = createServiceClient();

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
            .update(dbUpdates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data as Profile;
    },

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

    async updateUserStatus(userId: string, status: Profile['status']): Promise<Profile | null> {
        const serviceClient = createServiceClient();

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

    async updateUserRole(userId: string, role: Profile['role']): Promise<Profile | null> {
        const serviceClient = createServiceClient();

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

    getDisplayName(profile: Profile): string {
        return `${profile.kanji_last_name} ${profile.kanji_first_name}`;
    },

    getDisplayNameKana(profile: Profile): string {
        return `${profile.kana_last_name} ${profile.kana_first_name}`;
    }
};

export const getUserEmail = async (userId: string): Promise<string | null> => {
    const profile = await auth.getProfile(userId);
    return profile?.email ?? null;
};

// =====================================================
// Helper to create Supabase client with custom cookie storage
// =====================================================

export const createSupabaseWithCookies = async (cookieStore: {
    get: (key: string) => { value?: string } | undefined;
    set: (key: string, value: string, options?: { httpOnly?: boolean; secure?: boolean; sameSite?: string; path?: string }) => void;
    delete: (key: string) => void;
}) => {
    // Check env vars at runtime, not module load time
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.warn('[createSupabaseWithCookies] Credentials not configured, using mock client');
        return {
            from: () => ({ data: null, error: { message: 'Not configured', code: 'CONFIG_ERROR' } }),
            select: () => ({ data: null, error: { message: 'Not configured', code: 'CONFIG_ERROR' } }),
            insert: () => ({ data: null, error: { message: 'Not configured', code: 'CONFIG_ERROR' } }),
            update: () => ({ data: null, error: { message: 'Not configured', code: 'CONFIG_ERROR' } }),
            delete: () => ({ data: null, error: { message: 'Not configured', code: 'CONFIG_ERROR' } }),
            rpc: () => ({ data: null, error: { message: 'Not configured', code: 'CONFIG_ERROR' } }),
            auth: {
                getUser: async () => ({ data: { user: null }, error: { message: 'Not configured' } }),
            },
        } as any;
    }

    const { createClient } = await import('@supabase/supabase-js');

    return createClient(url, key, {
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

// =====================================================
// NOTE: Client-side Supabase removed from this file
// Client Components should use: useSupabaseClient() hook
// Example: import { useSupabaseClient } from '@/hooks/useSupabaseClient'
// =====================================================
