/**
 * Account Deletion Library
 *
 * アカウント削除ライブラリ
 * - 関連データの削除
 * - Supabase Authユーザーの削除
 * - 削除確認メールの送信
 */

import { createServiceClient } from '@/lib/supabase'
import { sendAccountDeletionEmail } from '@/lib/email/account-deleted'

// =====================================================
// Types
// =====================================================

export interface DeletionResult {
  success: boolean
  message: string
  deletedCounts?: {
    sampleRequests?: number
    sampleItems?: number
    deliveryAddresses?: number
    billingAddresses?: number
    inquiries?: number
    notifications?: number
    contracts?: number
    quotations?: number
    quotationItems?: number
    orders?: number
    orderItems?: number
    productionOrders?: number
    files?: number
    designRevisions?: number
    koreaCorrections?: number
    koreaTransferLog?: number
    profile?: number
  }
}

export interface DeletionOptions {
  sendEmail?: boolean
  retainActiveOrders?: boolean
}

// =====================================================
// Main Functions
// =====================================================

/**
 * Delete user account and all related data
 *
 * @param userId - User ID to delete
 * @param userEmail - User email for confirmation
 * @param options - Deletion options
 * @returns Deletion result
 */
export async function deleteAccount(
  userId: string,
  userEmail: string,
  options: DeletionOptions = {}
): Promise<DeletionResult> {
  const { sendEmail = true, retainActiveOrders = true } = options

  try {
    const supabase = createServiceClient()
    const deletedCounts: DeletionResult['deletedCounts'] = {}

    // ============================================
    // Phase 1: Delete dependent data first (bottom-up)
    // ============================================

    // 1. Delivery addresses (cascade from sample_requests is SET NULL, so delete manually)
    const { count: deliveryAddressesCount } = await supabase
      .from('delivery_addresses')
      .delete()
      .eq('user_id', userId)
      .select('*', { count: 'exact', head: true })

    deletedCounts.deliveryAddresses = deliveryAddressesCount || 0

    // 2. Billing addresses
    const { count: billingAddressesCount } = await supabase
      .from('billing_addresses')
      .delete()
      .eq('user_id', userId)
      .select('*', { count: 'exact', head: true })

    deletedCounts.billingAddresses = billingAddressesCount || 0

    // 3. Inquiries/contact submissions
    const { count: inquiriesCount } = await supabase
      .from('inquiries')
      .delete()
      .eq('user_id', userId)
      .select('*', { count: 'exact', head: true })

    deletedCounts.inquiries = inquiriesCount || 0

    // ============================================
    // Phase 2: Orders and their cascading data
    // ============================================

    // 4. Get orders to be deleted (based on retainActiveOrders flag)
    let ordersToDelete: string[] = []
    if (retainActiveOrders) {
      // Only get cancelled and delivered orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', userId)
        .in('status', ['cancelled', 'delivered'])
      ordersToDelete = ordersData?.map(o => o.id) || []
    } else {
      // Get all orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', userId)
      ordersToDelete = ordersData?.map(o => o.id) || []
    }

    // Note: The following will cascade automatically when orders are deleted:
    // - contracts → contract_reminders
    // - design_revisions
    // - files
    // - korea_corrections
    // - korea_transfer_log
    // - order_items
    // - production_orders → stage_action_history

    // 5. Delete orders (this will cascade to related tables)
    let ordersDeleted = 0
    if (ordersToDelete.length > 0) {
      const { count } = await supabase
        .from('orders')
        .delete()
        .in('id', ordersToDelete)
        .select('*', { count: 'exact', head: true })
      ordersDeleted = count || 0
    }
    deletedCounts.orders = ordersDeleted

    // ============================================
    // Phase 3: Quotations and their cascading data
    // ============================================

    // 6. Quotations (only non-approved and non-converted)
    // Note: This will cascade to quotation_items and files
    const { count: quotationsCount } = await supabase
      .from('quotations')
      .delete()
      .eq('user_id', userId)
      .not('status', 'in', '(approved,converted,sent)')
      .select('*', { count: 'exact', head: true })

    deletedCounts.quotations = quotationsCount || 0

    // ============================================
    // Phase 4: Sample requests and their cascading data
    // ============================================

    // 7. Sample requests
    // Note: This will cascade to sample_items
    const { count: sampleRequestsCount } = await supabase
      .from('sample_requests')
      .delete()
      .eq('user_id', userId)
      .select('*', { count: 'exact', head: true })

    deletedCounts.sampleRequests = sampleRequestsCount || 0

    // ============================================
    // Phase 5: Profile (will cascade to admin_notifications)
    // ============================================

    // 8. Profile
    const { count: profileCount } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)
      .select('*', { count: 'exact', head: true })

    deletedCounts.profile = profileCount || 0

    // ============================================
    // Phase 6: Delete from Supabase Auth
    // ============================================

    // 9. Delete from Supabase Auth
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId)

    if (authDeleteError) {
      console.error('Failed to delete auth user:', authDeleteError)
      throw new Error('認証ユーザーの削除に失敗しました')
    }

    // 8. Send confirmation email
    if (sendEmail && userEmail) {
      try {
        await sendAccountDeletionEmail(userEmail, userId, new Date(), deletedCounts)
      } catch (emailError) {
        console.error('Failed to send deletion email:', emailError)
        // Don't throw error, account deletion is successful
      }
    }

    return {
      success: true,
      message: 'アカウントを正常に削除しました',
      deletedCounts
    }
  } catch (error) {
    console.error('Account deletion error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'アカウント削除に失敗しました'
    }
  }
}

/**
 * Get summary of data that will be deleted
 *
 * @param userId - User ID to check
 * @returns Summary of data to be deleted
 */
export async function getDeletionSummary(userId: string): Promise<{
  deliveryAddresses: number
  billingAddresses: number
  inquiries: number
  sampleRequests: number
  quotations: number
  orders: number
  activeOrders: number
  canDelete: boolean
  warning?: string
}> {
  try {
    const supabase = createServiceClient()

    // Count delivery addresses
    const { count: deliveryAddresses } = await supabase
      .from('delivery_addresses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Count billing addresses
    const { count: billingAddresses } = await supabase
      .from('billing_addresses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Count inquiries
    const { count: inquiries } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Count sample requests
    const { count: sampleRequests } = await supabase
      .from('sample_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Count deletable quotations (non-approved, non-converted, non-sent)
    const { count: quotations } = await supabase
      .from('quotations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('status', 'in', '(approved,converted,sent)')

    // Count all orders
    const { count: orders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Count active orders (not cancelled or delivered)
    const { count: activeOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('status', 'in', '(cancelled,delivered)')

    // Check if user has active contracts or orders
    const { data: activeContracts } = await supabase
      .from('contracts')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['active', 'pending_signature', 'signed', 'SENT', 'PENDING_SIGNATURE', 'CUSTOMER_SIGNED', 'ADMIN_SIGNED', 'SIGNED'])
      .limit(1)

    const hasActiveContracts = (activeContracts?.length || 0) > 0
    const hasActiveOrders = (activeOrders || 0) > 0

    let warning: string | undefined
    if (hasActiveContracts) {
      warning = '有効な契約が存在するため、アカウントを削除できません。まず契約を解除してください。'
    } else if (hasActiveOrders) {
      warning = '進行中の注文があります。これらの注文は削除後も維持されます。'
    }

    return {
      deliveryAddresses: deliveryAddresses || 0,
      billingAddresses: billingAddresses || 0,
      inquiries: inquiries || 0,
      sampleRequests: sampleRequests || 0,
      quotations: quotations || 0,
      orders: orders || 0,
      activeOrders: activeOrders || 0,
      canDelete: !hasActiveContracts,
      warning
    }
  } catch (error) {
    console.error('Failed to get deletion summary:', error)
    return {
      deliveryAddresses: 0,
      billingAddresses: 0,
      inquiries: 0,
      sampleRequests: 0,
      quotations: 0,
      orders: 0,
      activeOrders: 0,
      canDelete: false,
      warning: 'データの取得に失敗しました'
    }
  }
}
