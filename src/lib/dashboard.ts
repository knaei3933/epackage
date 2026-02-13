/**
 * Dashboard Library
 *
 * 会員ダッシュボード用Supabaseクエリ関数
 * - 注文管理
 * - 納品先・請求先
 * - 見積・サンプル・お問い合わせ
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore is used here because Supabase type inference doesn't work correctly for chained query builders

import { createSupabaseWithCookies, createServiceClient } from '@/lib/supabase';
import { isDevMode } from '@/lib/dev-mode';
import { unstable_cache } from 'next/cache';
import type {
  Order,
  OrderStatus,
  OrderFilters,
  PaginationParams,
  PaginatedResponse,
  DeliveryAddress,
  BillingAddress,
  Quotation,
  QuotationStatus,
  DashboardSampleRequest,
  DashboardSampleRequestStatus,
  Inquiry,
  InquiryType,
  InquiryStatus,
  Announcement,
  DashboardStats,
  NotificationBadge,
  ContractStats,
  NotificationStats,
  OrderStatusHistory,
} from '@/types/dashboard';

// =====================================================
// 統合ダッシュボード型定義
// =====================================================

/**
 * 統合ダッシュボード統計型
 * 会員・管理者共通の統計データ構造
 */
export interface UnifiedDashboardStats {
  // 基本統計
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  activeUsers: number;

  // 注文関連
  ordersByStatus?: Array<{ status: string; count: number }>;
  recentOrders?: Order[];

  // 見積関連
  pendingQuotations?: number;
  quotations?: {
    total: number;
    approved: number;
    conversionRate: number;
  };
  recentQuotations?: Quotation[];

  // 生産関連
  production?: {
    avgDays: number;
    completed: number;
  };

  // サンプル関連
  samples?: {
    total: number;
    processing: number;
  };

  // 配送関連
  todayShipments?: number;
  shipments?: {
    today: number;
    inTransit: number;
  };

  // 月別売上
  monthlyRevenue?: Array<{ month: string; revenue: number }>;

  // アクティブ顧客数 (activeUsersのエイリアス)
  activeCustomers?: number;

  // 契約関連
  contracts?: {
    pending: number;
    signed: number;
    total: number;
  };

  // お知らせ
  announcements?: Announcement[];

  // 通知
  notifications?: NotificationStats[];

  // 期間
  period?: number;
}

// =====================================================
// Helper Functions
// =====================================================

// Server-side client (for server components)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createDashboardServerClient(cookieStore: any) {
  return createSupabaseWithCookies(cookieStore);
}

/**
 * Custom error for authentication requirement
 */
export class AuthRequiredError extends Error {
  constructor() {
    super('Authentication required');
    this.name = 'AuthRequiredError';
  }
}

/**
 * 現在のログインユーザー情報を取得
 * Production: server-sideではheaders経由、client-sideではSupabase使用
 */
export async function getCurrentUser(): Promise<{
  id: string;
  email?: string;
  user_metadata?: {
    kanji_last_name?: string;
    kanji_first_name?: string;
    name_kanji?: string;
    name_kana?: string;
  };
} | null> {
  // =====================================================
  // DEV_MODE: Check for mock user cookie first
  // =====================================================
  const isDevMode = process.env.ENABLE_DEV_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';

  if (isDevMode && typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const devMockUserId = cookieStore.get('dev-mock-user-id')?.value;

      if (devMockUserId) {
        console.log('[getCurrentUser] DEV_MODE: Using mock user:', devMockUserId);
        return {
          id: devMockUserId,
          email: 'dev-admin@test.com',
          user_metadata: {
            kanji_last_name: '開発',
            kanji_first_name: '管理者',
            name_kanji: '開発管理者',
            name_kana: 'カイハトカンリシャ',
          },
        };
      }
    } catch (error) {
      console.warn('[getCurrentUser] DEV_MODE: Cookie check failed:', error);
    }
  }

  // =====================================================
  // PRODUCTION: Use Supabase httpOnly cookies only
  // =====================================================

  if (typeof window === 'undefined') {
    try {
      const { createServerClient } = await import('@supabase/ssr');
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
          },
        }
      );

      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        console.log('[getCurrentUser] No authenticated user found');
        return null;
      }

      // Fetch profile data
      const serviceClient = createServiceClient();
      const { data: profile } = await serviceClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const profileAny = profile as any;

      return {
        id: user.id,
        email: user.email,
        user_metadata: {
          kanji_last_name: profileAny?.kanji_last_name || user.user_metadata?.kanji_last_name || '',
          kanji_first_name: profileAny?.kanji_first_name || user.user_metadata?.kanji_first_name || '',
          name_kanji: profileAny?.kanji_last_name || user.user_metadata?.name_kanji || '',
          name_kana: profileAny?.kana_last_name || user.user_metadata?.name_kana || '',
        },
      };
    } catch (e) {
      console.error('[getCurrentUser] Server-side auth error:', e);
    }
  }

  return null;
}

/**
 * 認証を要求しユーザー情報を返す
 * 認証されていない場合AuthRequiredErrorをthrowします
 *
 * FIX: Updated to use getRBACContext() for consistent authentication behavior
 * This matches the admin auth pattern and fixes session persistence issues
 */
export async function requireAuth(): Promise<{
  id: string;
  email?: string;
  user_metadata?: {
    kanji_last_name?: string;
    kanji_first_name?: string;
    name_kanji?: string;
    name_kana?: string;
  };
}> {
  // ============================================================
  // Use RBAC context for consistent authentication (same as admin)
  // ============================================================
  const { getRBACContext } = await import('@/lib/rbac/rbac-helpers');
  const context = await getRBACContext();

  if (!context) {
    console.log('[requireAuth] No RBAC context found, throwing AuthRequiredError');
    throw new AuthRequiredError();
  }

  console.log('[requireAuth] Got user from RBAC context:', context.userId);

  // Fetch profile data for user metadata
  const serviceClient = createServiceClient();
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('kanji_last_name, kanji_first_name, kana_last_name, email')
    .eq('id', context.userId)
    .maybeSingle();

  const profileAny = profile as any;

  return {
    id: context.userId,
    email: profileAny?.email,
    user_metadata: {
      kanji_last_name: profileAny?.kanji_last_name || '',
      kanji_first_name: profileAny?.kanji_first_name || '',
      name_kanji: profileAny?.kanji_last_name || '',
      name_kana: profileAny?.kana_last_name || '',
    },
  };
}

/**
 * 現在のログインユーザーIDを取得
 * DEV_MODEではクッキーからモックユーザーIDを読み取ります
 */
export async function getCurrentUserId(): Promise<string | null> {
  const isDevModeEnabled = isDevMode();

  if (isDevModeEnabled) {
    // =====================================================
    // DEV_MODE: Check headers first (set by middleware)
    // =====================================================
    // Server-side: middlewareが設定したheadersから読み取り (最優先)
    if (typeof window === 'undefined') {
      try {
        const { headers } = await import('next/headers');
        const headersList = await headers();

        // Check for x-dev-mode header first (middleware sets this in DEV_MODE)
        const devModeHeader = headersList.get('x-dev-mode');
        if (devModeHeader === 'true') {
          const userId = headersList.get('x-user-id');
          if (userId && userId !== '00000000-0000-0000-0000-000000000000') {
            console.log('[getCurrentUserId] DEV_MODE: Found user ID from middleware headers:', userId);
            return userId;
          }
        }
      } catch (e) {
        console.warn('[getCurrentUserId] DEV_MODE: Could not read headers:', e);
      }
    }

    // Client-side: document.cookieから読み取り
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const mockUserIdCookie = cookies.find(cookie =>
        cookie.trim().startsWith('dev-mock-user-id=')
      );
      if (mockUserIdCookie) {
        const userId = mockUserIdCookie.split('=')[1].trim();
        console.log('[getCurrentUserId] DEV_MODE: Found mock user ID from cookie:', userId);
        return userId;
      }
      console.warn('[getCurrentUserId] DEV_MODE: dev-mock-user-id cookie not found in document.cookie');
    }

    // Server-side: cookies() API使用 (この関数はasyncなので可能)
    if (typeof window === 'undefined') {
      try {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const mockUserIdCookie = cookieStore.get('dev-mock-user-id');
        if (mockUserIdCookie) {
          console.log('[getCurrentUserId] DEV_MODE: Found mock user ID from server cookie:', mockUserIdCookie.value);
          return mockUserIdCookie.value;
        }
        console.warn('[getCurrentUserId] DEV_MODE: dev-mock-user-id cookie not found in server cookies');
      } catch (e) {
        console.warn('[getCurrentUserId] DEV_MODE: Could not read server cookies:', e);
      }
    }

    // Last resort: localStorageから読み取り (クライアントサイド専用)
    if (typeof document !== 'undefined') {
      try {
        const mockUserStr = localStorage.getItem('dev-mock-user');
        if (mockUserStr) {
          const mockUserData = JSON.parse(mockUserStr);
          console.log('[getCurrentUserId] DEV_MODE: Found mock user ID from localStorage:', mockUserData.id);
          return mockUserData.id;
        }
      } catch (e) {
        console.warn('[getCurrentUserId] DEV_MODE: Failed to read localStorage:', e);
      }
    }

    // DEV_MODEでユーザーIDが見つからない場合 - 自動的にモックID生成
    const mockUserId = 'dev-mock-user-12345';
    console.log('[getCurrentUserId] DEV_MODE: No user ID found, using mock ID:', mockUserId);

    // クライアントサイドでlocalStorageに保存
    if (typeof document !== 'undefined') {
      try {
        const mockUserData = {
          id: mockUserId,
          email: 'dev@example.com',
          kanjiLastName: 'テスト',
          kanjiFirstName: 'ユーザー',
          kanaLastName: 'テスト',
          kanaFirstName: 'ユーザー',
        };
        localStorage.setItem('dev-mock-user', JSON.stringify(mockUserData));
        document.cookie = `dev-mock-user-id=${mockUserId}; path=/; max-age=86400`;
      } catch (e) {
        console.warn('[getCurrentUserId] DEV_MODE: Could not save mock user to storage:', e);
      }
    }

    return mockUserId;
  }

  // =====================================================
  // PRODUCTION: Supabase認証使用
  // =====================================================

  // Server-side: middlewareが設定したheadersから読み取り
  if (typeof window === 'undefined') {
    try {
      const { headers } = await import('next/headers');
      const headersList = await headers();

      const userId = headersList.get('x-user-id');
      if (userId) {
        console.log('[getCurrentUserId] Server-side: Found user ID from headers:', userId);
        return userId;
      }
    } catch (e) {
      console.error('[getCurrentUserId] Server-side error:', e);
    }

    // Fallback: Use getRBACContext() which reads from cookies directly
    // This is needed for API routes that don't have middleware headers set
    try {
      const { getRBACContext } = await import('@/lib/rbac/rbac-helpers');
      const context = await getRBACContext();
      if (context?.userId) {
        console.log('[getCurrentUserId] Server-side: Found user ID from RBAC context:', context.userId);
        return context.userId;
      }
    } catch (e) {
      console.error('[getCurrentUserId] RBAC context error:', e);
    }
  }

  // Client-side auth removed - use API route /api/auth/session instead
  return null;
}

// =====================================================
// Order Queries
// =====================================================

/**
 * 注文一覧を取得
 */
export async function getOrders(
  filters?: OrderFilters,
  pagination?: PaginationParams
): Promise<PaginatedResponse<Order>> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  
  const serviceClient = createServiceClient();

  // Build the query - only fetch orders with order_items (addresses not needed for list view)
  let query = serviceClient
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('user_id', userId);

  // Filters
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }
  if (filters?.search) {
    query = query.ilike('order_number', `%${filters.search}%`);
  }

  // Sorting - convert camelCase to snake_case for database columns
  const sortByMap: Record<string, string> = {
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
    'orderNumber': 'order_number',
    'totalAmount': 'total_amount',
    'status': 'status',
  };
  const sortBy = sortByMap[pagination?.sortBy || 'createdAt'] || 'created_at';
  const sortOrder = pagination?.sortOrder || 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Pagination
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  // Transform the data to match TypeScript types
  const orders: Order[] = (data || []).map((orderData: any) => ({
    ...orderData,
    orderNumber: orderData.order_number,
    userId: orderData.user_id,
    totalAmount: orderData.total_amount,
    items: (orderData.order_items || []).map((item: any) => ({
      ...item,
      productId: item.product_id,
      productName: item.product_name,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
    })),
    createdAt: orderData.created_at,
    updatedAt: orderData.updated_at,
    shippedAt: orderData.shipped_at,
    deliveredAt: orderData.delivered_at,
    customer_name: orderData.customer_name,
    customer_email: orderData.customer_email,
    customer_phone: orderData.customer_phone,
    subtotal: orderData.subtotal,
    taxAmount: orderData.tax_amount,
  }));

  return {
    data: orders,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * 注文詳細を取得
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const serviceClient = createServiceClient();

  // 注文情報を取得（order_items、delivery_addresses、billing_addressesを含める）
  const { data: orderData, error: orderError } = await serviceClient
    .from('orders')
    .select(`
      *,
      order_items (*),
      delivery_addresses (
        id,
        name,
        postal_code,
        prefecture,
        city,
        address,
        building,
        phone,
        contact_person
      ),
      billing_addresses (
        id,
        company_name,
        postal_code,
        prefecture,
        city,
        address,
        building,
        tax_number,
        email,
        phone
      )
    `)
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  if (orderError) {
    if (orderError.code === 'PGRST116') return null; // Not found
    console.error('[getOrderById] Error fetching order:', orderError);
    throw orderError;
  }

  if (!orderData) return null;

  // Transform the order data to match TypeScript types
  const orderDataAny = orderData as any;

  // itemsから小計と消費税を計算（データベースに値がない場合）
  const calculatedSubtotal = (orderDataAny.order_items || []).reduce((sum: number, item: any) => {
    return sum + (item.total_price || 0);
  }, 0);
  const calculatedTaxAmount = Math.round(calculatedSubtotal * 0.1);

  const order: any = {
    ...orderDataAny,
    orderNumber: orderDataAny.order_number,
    userId: orderDataAny.user_id,
    totalAmount: orderDataAny.total_amount,
    items: orderDataAny.order_items || [],
    createdAt: orderDataAny.created_at,
    updatedAt: orderDataAny.updated_at,
    shippedAt: orderDataAny.shipped_at,
    deliveredAt: orderDataAny.delivered_at,
    customer_name: orderDataAny.customer_name,
    customer_email: orderDataAny.customer_email,
    customer_phone: orderDataAny.customer_phone,
    // データベースの値がない（null/undefined/0）場合は計算値を使用
    subtotal: (orderDataAny.subtotal === null || orderDataAny.subtotal === undefined || orderDataAny.subtotal === 0) ? calculatedSubtotal : orderDataAny.subtotal,
    taxAmount: (orderDataAny.tax_amount === null || orderDataAny.tax_amount === undefined || orderDataAny.tax_amount === 0) ? calculatedTaxAmount : orderDataAny.tax_amount,
  };

  // 納品先住所を取得（クエリ結果から）
  if (orderDataAny.delivery_addresses) {
    const da = orderDataAny.delivery_addresses;
    order.deliveryAddress = {
      id: da.id,
      userId,
      name: da.name,
      postalCode: da.postal_code,
      prefecture: da.prefecture,
      city: da.city,
      address: da.address,
      building: da.building,
      phone: da.phone,
      contactPerson: da.contact_person,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  // 住所IDがない場合はプロフィールの住所情報を使用
  else if (!order.deliveryAddress) {
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('postal_code, prefecture, city, street, building, kanji_last_name, kanji_first_name, company_name')
      .eq('id', userId)
      .single();

    if (profile) {
      const profileAny = profile as any;
      const fullName = (profileAny.kanji_last_name && profileAny.kanji_first_name)
        ? `${profileAny.kanji_last_name} ${profileAny.kanji_first_name}`
        : profileAny.company_name || 'お客様';

      order.deliveryAddress = {
        id: '', // プロフィール由来なので空文字列
        userId,
        name: fullName,
        postalCode: profileAny.postal_code || '',
        prefecture: profileAny.prefecture || '',
        city: profileAny.city || '',
        address: [profileAny.street, profileAny.building].filter(Boolean).join(''),
        phone: '',
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  }

  // 請求先住所を取得（クエリ結果から）
  if (orderDataAny.billing_addresses) {
    const ba = orderDataAny.billing_addresses;
    order.billingAddress = {
      id: ba.id,
      userId,
      companyName: ba.company_name,
      postalCode: ba.postal_code,
      prefecture: ba.prefecture,
      city: ba.city,
      address: ba.address,
      building: ba.building,
      taxNumber: ba.tax_number,
      email: ba.email,
      phone: ba.phone,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  // 請求先住所IDがない場合はプロフィールの住所情報を使用
  else if (!order.billingAddress) {
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('postal_code, prefecture, city, street, building, kanji_last_name, kanji_first_name, company_name, email')
      .eq('id', userId)
      .single();

    if (profile) {
      const profileAny = profile as any;
      const companyName = profileAny.company_name ||
        ((profileAny.kanji_last_name && profileAny.kanji_first_name)
          ? `${profileAny.kanji_last_name} ${profileAny.kanji_first_name}`
          : 'お客様');

      order.billingAddress = {
        id: '', // プロフィール由来なので空文字列
        userId,
        companyName,
        postalCode: profileAny.postal_code || '',
        prefecture: profileAny.prefecture || '',
        city: profileAny.city || '',
        address: [profileAny.street, profileAny.building].filter(Boolean).join(''),
        email: profileAny.email || '',
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  }

  // Transform order items
  order.items = (orderDataAny.order_items || []).map((item: any) => ({
    ...item,
    productId: item.product_id,
    productName: item.product_name,
    unitPrice: item.unit_price,
    totalPrice: item.total_price,
  }));

  // Remove raw Supabase data
  delete order.order_items;
  delete order.order_number;
  delete order.user_id;
  delete order.total_amount;
  delete order.created_at;
  delete order.updated_at;
  delete order.shipped_at;
  delete order.delivered_at;
  delete order.delivery_address_id;
  delete order.billing_address_id;

  return order as Order;
}

/**
 * 注文ステータス履歴を取得
 */
export async function getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  
  const serviceClient = createServiceClient();

  const { data, error } = await serviceClient
    .from('order_status_history')
    .select('*')
    .eq('order_id', orderId)
    .order('changed_at', { ascending: true });

  if (error) throw error;

  return (data || []) as OrderStatusHistory[];
}

/**
 * ステータス別注文数を取得
 */
export async function getOrderStats(): Promise<Record<OrderStatus, number>> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  
  const serviceClient = createServiceClient();

  const { data, error } = await serviceClient
    .from('orders')
    .select('status')
    .eq('user_id', userId);

  if (error) throw error;

  // Initialize stats with all possible OrderStatus values
  const stats: Record<OrderStatus, number> = {
    PENDING: 0,
    QUOTATION: 0,
    DATA_RECEIVED: 0,
    WORK_ORDER: 0,
    CONTRACT_SENT: 0,
    CONTRACT_SIGNED: 0,
    PRODUCTION: 0,
    STOCK_IN: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };

  // Normalize status to uppercase and count
  data?.forEach((order: { status: string }) => {
    const normalizedStatus = (order.status as string).toUpperCase() as OrderStatus;
    if (normalizedStatus in stats) {
      stats[normalizedStatus]++;
    }
  });

  return stats;
}

// =====================================================
// Delivery Address Queries
// =====================================================

/**
 * 納品先一覧を取得
 */
export async function getDeliveryAddresses(): Promise<DeliveryAddress[]> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  
  const serviceClient = createServiceClient();

  const { data, error } = await serviceClient
    .from('delivery_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data as DeliveryAddress[];
}

/**
 * 納品先を取得
 */
export async function getDeliveryAddressById(id: string): Promise<DeliveryAddress | null> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const serviceClient = createServiceClient();

  const { data, error } = await serviceClient
    .from('delivery_addresses')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data as DeliveryAddress;
}

/**
 * デフォルト納品先を取得
 */
export async function getDefaultDeliveryAddress(): Promise<DeliveryAddress | null> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  
  const serviceClient = createServiceClient();

  const { data, error } = await serviceClient
    .from('delivery_addresses')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data as DeliveryAddress;
}

/**
 * 納品先を作成
 */
export async function createDeliveryAddress(
  address: Omit<DeliveryAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<DeliveryAddress> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const serviceClient = createServiceClient();


  // If setting as default, unset other defaults
  if (address.isDefault) {
    await serviceClient
      .from('delivery_addresses')
      .update({ is_default: false } as never)
      .eq('user_id', userId)
      .eq('is_default', true);
  }

  const { data, error } = await serviceClient
    .from('delivery_addresses')
    .insert({
      user_id: userId,
      name: address.name,
      postal_code: address.postalCode,
      prefecture: address.prefecture,
      city: address.city,
      address: address.address,
      building: address.building,
      phone: address.phone,
      contact_person: address.contactPerson,
      is_default: address.isDefault,
    } as never)
    .select()
    .single();

  if (error) throw error;

  return data as DeliveryAddress;
}

/**
 * 納品先を更新
 */
export async function updateDeliveryAddress(
  id: string,
  updates: Partial<Omit<DeliveryAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<DeliveryAddress> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const serviceClient = createServiceClient();


  // If setting as default, unset other defaults
  if (updates.isDefault) {
    await serviceClient
      .from('delivery_addresses')
      .update({ is_default: false } as never)
      .eq('user_id', userId)
      .eq('is_default', true)
      .neq('id', id);
  }

  const { data, error } = await serviceClient
    .from('delivery_addresses')
    .update({
      name: updates.name,
      postal_code: updates.postalCode,
      prefecture: updates.prefecture,
      city: updates.city,
      address: updates.address,
      building: updates.building,
      phone: updates.phone,
      contact_person: updates.contactPerson,
      is_default: updates.isDefault,
    } as never)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  return data as DeliveryAddress;
}

/**
 * 納品先を削除
 */
export async function deleteDeliveryAddress(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const serviceClient = createServiceClient();

  const { error } = await serviceClient
    .from('delivery_addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

// =====================================================
// Billing Address Queries
// =====================================================

/**
 * 請求先一覧を取得
 */
export async function getBillingAddresses(): Promise<BillingAddress[]> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  
  const serviceClient = createServiceClient();

  const { data, error } = await serviceClient
    .from('billing_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data as BillingAddress[];
}

/**
 * 請求先を作成
 */
export async function createBillingAddress(
  address: Omit<BillingAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<BillingAddress> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const serviceClient = createServiceClient();


  // If setting as default, unset other defaults
  if (address.isDefault) {
    await serviceClient
      .from('billing_addresses')
      .update({ is_default: false } as never)
      .eq('user_id', userId)
      .eq('is_default', true);
  }

  const { data, error } = await serviceClient
    .from('billing_addresses')
    .insert({
      user_id: userId,
      company_name: address.companyName,
      postal_code: address.postalCode,
      prefecture: address.prefecture,
      city: address.city,
      address: address.address,
      building: address.building,
      tax_number: address.taxNumber,
      email: address.email,
      phone: address.phone,
      is_default: address.isDefault,
    } as never)
    .select()
    .single();

  if (error) throw error;

  return data as BillingAddress;
}

/**
 * 請求先を更新
 */
export async function updateBillingAddress(
  id: string,
  updates: Partial<Omit<BillingAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<BillingAddress> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const serviceClient = createServiceClient();


  // If setting as default, unset other defaults
  if (updates.isDefault) {
    await serviceClient
      .from('billing_addresses')
      .update({ is_default: false } as never)
      .eq('user_id', userId)
      .eq('is_default', true)
      .neq('id', id);
  }

  const { data, error } = await serviceClient
    .from('billing_addresses')
    .update({
      company_name: updates.companyName,
      postal_code: updates.postalCode,
      prefecture: updates.prefecture,
      city: updates.city,
      address: updates.address,
      building: updates.building,
      tax_number: updates.taxNumber,
      email: updates.email,
      phone: updates.phone,
      is_default: updates.isDefault,
    } as never)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  return data as BillingAddress;
}

/**
 * 請求先を削除
 */
export async function deleteBillingAddress(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const serviceClient = createServiceClient();

  const { error } = await serviceClient
    .from('billing_addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

// =====================================================
// Quotation Queries
// =====================================================

/**
 * 見積一覧を取得
 */
export async function getQuotations(
  status?: QuotationStatus
): Promise<Quotation[]> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  
  const serviceClient = createServiceClient();

  let query = serviceClient
    .from('quotations')
    .select('*, quotation_items (*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data as Quotation[];
}

/**
 * 見積詳細を取得
 */
export async function getQuotationById(id: string): Promise<Quotation | null> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const serviceClient = createServiceClient();

  const { data, error } = await serviceClient
    .from('quotations')
    .select('*, quotation_items (*)')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data as Quotation;
}

// =====================================================
// Sample Request Queries
// =====================================================

/**
 * サンプル依頼一覧を取得
 */
export async function getSampleRequests(
  status?: DashboardSampleRequestStatus
): Promise<DashboardSampleRequest[]> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  
  const serviceClient = createServiceClient();

  let query = serviceClient
    .from('sample_requests')
    .select('*, sample_items (*), delivery_addresses (*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data as DashboardSampleRequest[];
}

// =====================================================
// Inquiry Queries
// =====================================================

/**
 * お問い合わせ一覧を取得
 */
export async function getInquiries(
  status?: InquiryStatus,
  type?: InquiryType
): Promise<Inquiry[]> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  
  const serviceClient = createServiceClient();

  let query = serviceClient
    .from('inquiries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }
  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data as Inquiry[];
}

// =====================================================
// Announcement Queries
// =====================================================

/**
 * お知らせ一覧を取得
 */
export async function getAnnouncements(limit = 5): Promise<Announcement[]> {
  const serviceClient = createServiceClient();

  const { data, error } = await serviceClient
    .from('announcements')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) return [];

  return (data as Announcement[]) || [];
}

// =====================================================
// Dashboard Stats
// =====================================================

/**
 * ダッシュボード統計情報を取得
 * FIXED: Added safe handling for contracts table (no user_id column) and announcements
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  
  const userId = await getCurrentUserId();
  if (!userId) {
    // Return empty stats for unauthenticated users (static build)
    return {
      orders: { new: [], processing: [], total: 0 },
      quotations: { pending: [], total: 0 },
      samples: { pending: [], total: 0 },
      inquiries: { unread: [], total: 0 },
      announcements: [],
      contracts: { pending: [], total: 0, signed: 0 },
      notifications: [],
    };
  }

  try {
    const serviceClient = createServiceClient();

    // Get new orders
    const { data: newOrders } = await serviceClient
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['PENDING', 'QUOTATION'])
      .order('created_at', { ascending: false })
      .limit(5);

    // Get processing orders
    const { data: processingOrders } = await serviceClient
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'PRODUCTION');

    // Get pending quotations
    const { data: pendingQuotations } = await serviceClient
      .from('quotations')
      .select('*, quotation_items (*)')
      .eq('user_id', userId)
      .in('status', ['draft', 'sent'])
      .order('created_at', { ascending: false })
      .limit(5);

    // Transform quotation_items to items for type compatibility
    // Defensive: Ensure items is always an array, even if nested query fails
    const transformedQuotations = (pendingQuotations as any[])?.map(quotation => ({
      ...quotation,
      // More defensive: explicitly check if quotation_items is an array
      items: Array.isArray(quotation.quotation_items) ? quotation.quotation_items : [],
    })) || [];

    // Get pending sample requests
    const { data: pendingSamples } = await serviceClient
      .from('sample_requests')
      .select('*, sample_items (*)')
      .eq('user_id', userId)
      .in('status', ['received', 'processing'])
      .order('created_at', { ascending: false })
      .limit(5);

    // Transform sample_items to samples for type compatibility
    // Defensive: Ensure samples is always an array, even if nested query fails
    const transformedSamples = (pendingSamples as any[])?.map(request => ({
      ...request,
      // More defensive: explicitly check if sample_items is an array
      samples: Array.isArray(request.sample_items) ? request.sample_items : [],
    })) || [];

    // Get unread inquiries
    const { data: unreadInquiries } = await serviceClient
      .from('inquiries')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'responded')
      .order('created_at', { ascending: false })
      .limit(5);

    // Get announcements - wrapped in try-catch for safety
    let announcements: Announcement[] = [];
    try {
      announcements = await getAnnouncements(3);
    } catch (annError) {
      console.warn('[getDashboardStats] Failed to fetch announcements:', annError);
      announcements = [];
    }

    // Get counts
    const { count: totalOrders } = await serviceClient
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: totalQuotations } = await serviceClient
      .from('quotations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: totalSamples } = await serviceClient
      .from('sample_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: totalInquiries } = await serviceClient
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // B2B integration: Get contracts and notifications
    let pendingContracts: any[] | null = null;
    let totalContracts = 0;
    let signedContracts = 0;
    let notifications: any[] | null = null;

    // Query contracts using the new user_id column
    try {
      const [pendingResult, totalCountResult, signedCountResult] = await Promise.all([
        serviceClient
          .from('contracts')
          .select('*')
          .eq('user_id', userId)
          .in('status', ['DRAFT', 'SENT', 'PENDING_SIGNATURE', 'CUSTOMER_SIGNED'])
          .order('created_at', { ascending: false }),
        serviceClient
          .from('contracts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        serviceClient
          .from('contracts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .in('status', ['SIGNED', 'ADMIN_SIGNED', 'ACTIVE'])
      ]);

      pendingContracts = pendingResult.data;
      totalContracts = totalCountResult.count || 0;
      signedContracts = signedCountResult.count || 0;
    } catch (contractError) {
      console.warn('[getDashboardStats] Error fetching contracts:', contractError);
      pendingContracts = [];
      totalContracts = 0;
      signedContracts = 0;
    }

    try {
      const notifResult = await serviceClient
        .from('admin_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      notifications = notifResult.data;
    } catch (notifError) {
      console.warn('[getDashboardStats] admin_notifications table not available or error:', notifError);
      // notificationsテーブルがない場合はデフォルト値を使用
    }

    return {
      orders: {
        new: (newOrders as Order[]) || [],
        processing: (processingOrders as Order[]) || [],
        total: totalOrders || 0,
      },
      quotations: {
        pending: (transformedQuotations as Quotation[]) || [],
        total: totalQuotations || 0,
      },
      samples: {
        pending: (transformedSamples as DashboardSampleRequest[]) || [],
        total: totalSamples || 0,
      },
      inquiries: {
        unread: (unreadInquiries as Inquiry[]) || [],
        total: totalInquiries || 0,
      },
      announcements: announcements || [],
      // B2B integration: contracts and notifications
      contracts: {
        pending: (pendingContracts as ContractStats[]) || [],
        total: totalContracts || 0,
        signed: signedContracts || 0,
      },
      notifications: (notifications as NotificationStats[]) || [],
    };
  } catch (error) {
    console.error('[getDashboardStats] Error fetching stats:', error);
    // Return empty stats on error
    return {
      orders: { new: [], processing: [], total: 0 },
      quotations: { pending: [], total: 0 },
      samples: { pending: [], total: 0 },
      inquiries: { unread: [], total: 0 },
      announcements: [],
      contracts: { pending: [], total: 0, signed: 0 },
      notifications: [],
    };
  }
}

/**
 * 通知バッジ数を取得
 */
export async function getNotificationBadge(): Promise<NotificationBadge> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return {
      quotations: 0,
      samples: 0,
      inquiries: 0,
      orders: 0,
      total: 0,
    };
  }

  
  const serviceClient = createServiceClient();


  // Count pending quotations
  const { count: quotations } = await serviceClient
    .from('quotations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['draft', 'sent']);

  // Count pending sample requests
  const { count: samples } = await serviceClient
    .from('sample_requests')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['received', 'processing']);

  // Count responded inquiries
  const { count: inquiries } = await serviceClient
    .from('inquiries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'responded');

  // Count new orders
  const { count: orders } = await serviceClient
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['pending', 'processing']);

  const total = (quotations || 0) + (samples || 0) + (inquiries || 0) + (orders || 0);

  return {
    quotations: quotations || 0,
    samples: samples || 0,
    inquiries: inquiries || 0,
    orders: orders || 0,
    total,
  };
}

// =====================================================
// 統合ダッシュボード関数
// =====================================================

/**
 * 統合ダッシュボード統計取得
 * SSR/CSR両対応
 */
export async function getUnifiedDashboardStats(
  userId: string | undefined,
  userRole: 'ADMIN' | 'MEMBER',
  period: number = 30
): Promise<UnifiedDashboardStats> {
  // ユーザーIDがない場合は空の統計を返す
  if (!userId) {
    return getEmptyUnifiedStats();
  }

  // Production対応

  // 本番データフェッチ（キャッシュ付き）
  const cacheKey = `dashboard_${userRole}_${userId}_${period}`;

  return unstable_cache(
    async () => {
      return userRole === 'ADMIN'
        ? fetchAdminDashboardStats(userId, period)
        : fetchMemberDashboardStats(userId, period);
    },
    [cacheKey],
    { revalidate: 30 } // 30秒キャッシュ
  );
}

/**
 * SWR用フェッチャー（Client Component）
 */
export const createDashboardFetcher = () => {
  return async (url: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      credentials: 'include',
      headers,
    }) as Response;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  };
};

/**
 * 統一エラーハンドリングラッパー
 */
export function withDashboardErrorHandling<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  return fn().catch((error) => {
    console.error('[Dashboard] Error:', error);
    return fallback;
  });
}

/**
 * 空の統合統計データを返す
 */
function getEmptyUnifiedStats(): UnifiedDashboardStats {
  return {
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingQuotations: 0,
    ordersByStatus: [],
  };
}

/**
 * 管理者用ダッシュボード統計取得（本番）
 */
async function fetchAdminDashboardStats(
  userId: string,
  period: number
): Promise<UnifiedDashboardStats> {
  const serviceClient = createServiceClient();

  // 期間計算
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);

  // 今日の開始時刻
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 並列クエリ - すべての統計データを取得
  const [
    totalOrdersResult,
    pendingOrdersResult,
    totalRevenueResult,
    activeUsersResult,
    ordersByStatusResult,
    totalQuotationsResult,
    approvedQuotationsResult,
    pendingQuotationsResult,
    recentQuotationsResult,
    // 月別売上
    monthlyRevenueResult,
    // 本日出荷
    todayShipmentsResult,
    // 輸送中注文
    inTransitShipmentsResult,
    // サンプル統計
    totalSamplesResult,
    processingSamplesResult,
    // 生産完了注文（製造期間計算用）
    completedProductionOrdersResult,
  ] = await Promise.all([
    serviceClient.from('orders').select('*', { count: 'exact', head: true }),
    serviceClient.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'QUOTATION_PENDING'),
    serviceClient.from('orders').select('total_amount').gte('created_at', startDate.toISOString()),
    serviceClient.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
    serviceClient.from('orders').select('status').gte('created_at', startDate.toISOString()),
    // 見積統計
    serviceClient.from('quotations').select('*', { count: 'exact', head: true }),
    serviceClient.from('quotations').select('*', { count: 'exact', head: true }).eq('quotation_status', 'APPROVED'),
    serviceClient.from('quotations').select('*', { count: 'exact', head: true }).in('quotation_status', ['DRAFT', 'SUBMITTED', 'PENDING']),
    // 最新見積もり
    serviceClient.from('quotations').select('*').order('created_at', { ascending: false }).limit(5),
    // 月別売上 (過去12ヶ月)
    serviceClient
      .from('orders')
      .select('created_at, total_amount')
      .eq('status', 'SHIPPED')
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()),
    // 本日出荷
    serviceClient
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'SHIPPED')
      .gte('shipped_at', todayStart.toISOString()),
    // 輸送中
    serviceClient
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['SHIPPED']),
    // サンプル統計
    serviceClient
      .from('sample_requests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString()),
    serviceClient
      .from('sample_requests')
      .select('*', { count: 'exact', head: true })
      .in('status', ['received', 'processing'])
      .gte('created_at', startDate.toISOString()),
    // 生産完了注文（製造期間計算用）
    serviceClient
      .from('orders')
      .select('created_at, updated_at')
      .eq('status', 'SHIPPED')
      .gte('created_at', startDate.toISOString()),
  ]);

  // 売上計算
  const totalRevenue = (totalRevenueResult.data || [])
    .reduce((sum, order: any) => sum + (order.total_amount || 0), 0);

  // ステータス別集計
  const statusCounts: Record<string, number> = {};
  (ordersByStatusResult.data || []).forEach((order: any) => {
    const status = order.status || 'UNKNOWN';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
  }));

  // 見積統計計算
  const totalQuotations = totalQuotationsResult.count || 0;
  const approvedQuotations = approvedQuotationsResult.count || 0;
  const pendingQuotationsCount = pendingQuotationsResult.count || 0;
  const conversionRate = totalQuotations > 0 ? Math.round((approvedQuotations / totalQuotations) * 100) : 0;

  // 月別売上データ集計
  const monthlyRevenueMap: Record<string, number> = {};
  (monthlyRevenueResult.data || []).forEach((order: any) => {
    const date = new Date(order.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyRevenueMap[monthKey] = (monthlyRevenueMap[monthKey] || 0) + (order.total_amount || 0);
  });

  const monthlyRevenue = Object.entries(monthlyRevenueMap)
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // 本日と輸送中の荷物数
  const todayShipments = todayShipmentsResult.count || 0;
  const inTransitShipments = inTransitShipmentsResult.count || 0;

  // サンプル統計
  const totalSamples = totalSamplesResult.count || 0;
  const processingSamples = processingSamplesResult.count || 0;

  // 製造期間計算
  const completedOrders = completedProductionOrdersResult.data || [];
  let totalProductionDays = 0;
  completedOrders.forEach((order: any) => {
    const created = new Date(order.created_at);
    const updated = new Date(order.updated_at);
    const days = Math.floor((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    totalProductionDays += days;
  });
  const avgProductionDays = completedOrders.length > 0 ? Math.round(totalProductionDays / completedOrders.length) : 0;

  // アクティブ顧客数
  const activeCustomers = activeUsersResult.count || 0;

  return {
    totalOrders: totalOrdersResult.count || 0,
    pendingOrders: pendingOrdersResult.count || 0,
    totalRevenue,
    activeUsers: activeUsersResult.count || 0,
    activeCustomers,
    ordersByStatus,
    period,
    // 見積統計
    pendingQuotations: pendingQuotationsCount,
    quotations: {
      total: totalQuotations,
      approved: approvedQuotations,
      conversionRate,
    },
    recentQuotations: recentQuotationsResult.data || [],
    // 月別売上
    monthlyRevenue,
    // 配送統計
    todayShipments,
    shipments: {
      today: todayShipments,
      inTransit: inTransitShipments,
    },
    // サンプル統計
    samples: {
      total: totalSamples,
      processing: processingSamples,
    },
    // 製造統計
    production: {
      avgDays: avgProductionDays,
      completed: completedOrders.length,
    },
  };
}

/**
 * 会員用ダッシュボード統計取得（本番）
 */
async function fetchMemberDashboardStats(
  userId: string,
  period: number
): Promise<UnifiedDashboardStats> {
  const serviceClient = createServiceClient();

  // 期間計算
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);

  // 並列クエリ
  const [
    totalOrdersResult,
    pendingOrdersResult,
    pendingQuotationsResult,
    totalSamplesResult,
    pendingSamplesResult,
  ] = await Promise.all([
    serviceClient
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString()),
    serviceClient
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['PENDING', 'PRODUCTION']),
    serviceClient
      .from('quotations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['draft', 'sent']),
    serviceClient
      .from('sample_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
    serviceClient
      .from('sample_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['received', 'processing']),
  ]);

  return {
    totalOrders: totalOrdersResult.count || 0,
    pendingOrders: pendingOrdersResult.count || 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingQuotations: pendingQuotationsResult.count || 0,
    samples: {
      total: totalSamplesResult.count || 0,
      processing: pendingSamplesResult.count || 0,
    },
    period,
  };
}
