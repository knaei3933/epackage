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
    async createQuote(quoteData: Database['public']['Tables']['quotes']['Insert']) {
        if (!supabase) throw new Error('Database not configured')

        const { data, error } = await supabase
            .from('quotes')
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
