/**
 * Product Library - Homepage Dynamic Content
 *
 * Provides functions to fetch featured products and announcements
 * from Supabase for dynamic homepage rendering.
 */

import { createServiceClient } from './supabase'
import type { Database } from '@/types/database'

// =====================================================
// Types
// =====================================================

export interface Announcement {
  id: string
  title: string
  content: string
  category: 'maintenance' | 'update' | 'notice' | 'promotion'
  priority: 'low' | 'medium' | 'high'
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

// Re-export Product type from database types
export type FeaturedProduct = Database['public']['Tables']['products']['Row']

// =====================================================
// Featured Products
// =====================================================

/**
 * Get featured products for homepage display
 * @param limit - Number of products to return (default: 6)
 * @returns Array of featured products sorted by sort_order
 */
export async function getFeaturedProducts(limit: number = 6): Promise<FeaturedProduct[]> {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('[getFeaturedProducts] Error fetching products:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('[getFeaturedProducts] Unexpected error:', error)
    return []
  }
}

/**
 * Get products by category
 * @param category - Product category
 * @param limit - Number of products to return (default: 10)
 * @returns Array of products in the specified category
 */
export async function getProductsByCategory(
  category: string,
  limit: number = 10
): Promise<FeaturedProduct[]> {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .order('sort_order', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('[getProductsByCategory] Error fetching products:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('[getProductsByCategory] Unexpected error:', error)
    return []
  }
}

// =====================================================
// Announcements
// =====================================================

/**
 * Get latest published announcements
 * @param limit - Number of announcements to return (default: 3)
 * @returns Array of published announcements sorted by published_at
 */
export async function getLatestAnnouncements(limit: number = 3): Promise<Announcement[]> {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[getLatestAnnouncements] Error fetching announcements:', error)
      return []
    }

    // Filter out announcements without published_at or with future dates
    const now = new Date()
    const filteredData = (data || []).filter(
      (announcement) =>
        announcement.published_at && new Date(announcement.published_at) <= now
    )

    return filteredData
  } catch (error) {
    console.error('[getLatestAnnouncements] Unexpected error:', error)
    return []
  }
}

/**
 * Get high-priority announcements
 * @returns Array of high-priority published announcements
 */
export async function getPriorityAnnouncements(): Promise<Announcement[]> {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_published', true)
      .eq('priority', 'high')
      .order('published_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('[getPriorityAnnouncements] Error fetching announcements:', error)
      return []
    }

    const now = new Date()
    const filteredData = (data || []).filter(
      (announcement) =>
        announcement.published_at && new Date(announcement.published_at) <= now
    )

    return filteredData
  } catch (error) {
    console.error('[getPriorityAnnouncements] Unexpected error:', error)
    return []
  }
}

/**
 * Get announcements by category
 * @param category - Announcement category
 * @param limit - Number of announcements to return (default: 5)
 * @returns Array of announcements in the specified category
 */
export async function getAnnouncementsByCategory(
  category: Announcement['category'],
  limit: number = 5
): Promise<Announcement[]> {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_published', true)
      .eq('category', category)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[getAnnouncementsByCategory] Error fetching announcements:', error)
      return []
    }

    const now = new Date()
    const filteredData = (data || []).filter(
      (announcement) =>
        announcement.published_at && new Date(announcement.published_at) <= now
    )

    return filteredData
  } catch (error) {
    console.error('[getAnnouncementsByCategory] Unexpected error:', error)
    return []
  }
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Format announcement date for display (Japanese format)
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "2026年1月7日")
 */
export function formatAnnouncementDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Get announcement category label in Japanese
 * @param category - Announcement category
 * @returns Japanese label for the category
 */
export function getAnnouncementCategoryLabel(
  category: Announcement['category']
): string {
  const labels: Record<Announcement['category'], string> = {
    maintenance: 'メンテナンス',
    update: 'アップデート',
    notice: 'お知らせ',
    promotion: 'キャンペーン'
  }
  return labels[category] || category
}

/**
 * Get announcement priority color class
 * @param priority - Announcement priority
 * @returns Tailwind CSS color class
 */
export function getAnnouncementPriorityColor(
  priority: Announcement['priority']
): string {
  const colors: Record<Announcement['priority'], string> = {
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200'
  }
  return colors[priority] || colors.medium
}
