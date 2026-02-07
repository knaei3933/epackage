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

  // 生産関連
  activeProduction?: number;
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
 * DEV_MODEではモックユーザー情報を返します
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
  const isDevModeEnabled = isDevMode();

  if (isDevModeEnabled) {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    // DEV_MODE: モックユーザー情報返却
    // server環境ではデフォルト値のみ返却 (localStorageアクセス不可)
    // 必要に応じてクッキーに追加情報を保存可能
    return {
      id: userId,
      email: 'dev@example.com',
      user_metadata: {
        kanji_last_name: 'テスト',
        kanji_first_name: 'ユーザー',
        name_kanji: 'テストユーザー',
        name_kana: 'テストユーザー',
      },
    };
  }

  // =====================================================
  // PRODUCTION: Read user from headers (server-side) or Supabase (client-side)
  // =====================================================

  // Server-side: middlewareが設定したheadersから読み取り
  if (typeof window === 'undefined') {
    try {
      const { headers } = await import('next/headers');
      const headersList = await headers();

      const userId = headersList.get('x-user-id');
      if (userId) {
        // Server-sideではservice clientを使用してprofileを取得
        // (クッキー変更なしで読み取りのみなので安全)
        const serviceClient = createServiceClient();

        const { data: profile } = await serviceClient
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        const profileAny = profile as any;

        return {
          id: userId,
          email: profileAny?.email,
          user_metadata: {
            kanji_last_name: profileAny && profileAny.kanji_last_name ? profileAny.kanji_last_name : '',
            kanji_first_name: profileAny && profileAny.kanji_first_name ? profileAny.kanji_first_name : '',
            name_kanji: profileAny && profileAny.kanji_last_name ? profileAny.kanji_last_name : '',
            name_kana: profileAny && profileAny.kana_last_name ? profileAny.kana_last_name : '',
          },
        };
      }
    } catch (e) {
      console.error('[getCurrentUser] Server-side auth error:', e);
    }
  }

  // Client-side auth removed - use API route /api/auth/session instead
  return null;
}

/**
 * 認証を要求しユーザー情報を返す
 * 認証されていない場合AuthRequiredErrorをthrowします
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
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthRequiredError();
  }
  return user;
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

  // DEV_MODE: Return realistic mock data for testing (SECURE: server-side only)
  if (isDevMode()) {
    console.log('[getOrders] DEV_MODE: Returning mock order data');
    const mockOrders: Order[] = [
      {
        id: 'mock-order-1',
        userId: userId,
        orderNumber: 'ORD-2024-001',
        status: 'PRODUCTION',
        totalAmount: 150000,
        items: [
          {
            id: 'mock-item-1',
            productId: 'prod-001',
            productName: '化粧箱 A4サイズ',
            quantity: 100,
            unitPrice: 1500,
            totalPrice: 150000,
            specifications: {
              size: 'A4',
              material: '紙製',
              printing: 'フルカラー',
              postProcessing: ['光沢加工']
            }
          }
        ],
        deliveryAddress: {
          id: 'mock-delivery-1',
          userId: userId,
          name: 'テスト株式会社A',
          postalCode: '100-0001',
          prefecture: '東京都',
          city: '千代田区',
          address: '丸の内1-1-1',
          phone: '03-1234-5678',
          isDefault: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'mock-order-2',
        userId: userId,
        orderNumber: 'ORD-2024-002',
        status: 'PRODUCTION',
        totalAmount: 280000,
        items: [
          {
            id: 'mock-item-2',
            productId: 'prod-002',
            productName: '段ボール箱',
            quantity: 200,
            unitPrice: 1400,
            totalPrice: 280000,
            specifications: {
              size: '500x400x300',
              material: '段ボール',
              printing: '2色刷り'
            }
          }
        ],
        deliveryAddress: {
          id: 'mock-delivery-1',
          userId: userId,
          name: 'テスト株式会社A',
          postalCode: '100-0001',
          prefecture: '東京都',
          city: '千代田区',
          address: '丸の内1-1-1',
          phone: '03-1234-5678',
          isDefault: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        createdAt: '2024-01-20T14:30:00Z',
        updatedAt: '2024-01-21T09:00:00Z'
      },
      {
        id: 'mock-order-3',
        userId: userId,
        orderNumber: 'ORD-2024-003',
        status: 'SHIPPED',
        totalAmount: 95000,
        items: [
          {
            id: 'mock-item-3',
            productId: 'prod-003',
            productName: '透明パッケージ',
            quantity: 50,
            unitPrice: 1900,
            totalPrice: 95000,
            specifications: {
              size: 'B5',
              material: 'PET',
              printing: 'なし'
            }
          }
        ],
        deliveryAddress: {
          id: 'mock-delivery-2',
          userId: userId,
          name: 'テスト株式会社B',
          postalCode: '150-0001',
          prefecture: '東京都',
          city: '渋谷区',
          address: '神宮前1-2-3',
          phone: '03-9876-5432',
          isDefault: false,
          createdAt: '2024-01-05T00:00:00Z',
          updatedAt: '2024-01-05T00:00:00Z'
        },
        createdAt: '2024-01-10T11:00:00Z',
        updatedAt: '2024-01-18T16:00:00Z',
        shippedAt: '2024-01-18T16:00:00Z'
      },
      {
        id: 'mock-order-4',
        userId: userId,
        orderNumber: 'ORD-2024-004',
        status: 'DELIVERED',
        totalAmount: 420000,
        items: [
          {
            id: 'mock-item-4',
            productId: 'prod-004',
            productName: '高級ギフトボックス',
            quantity: 30,
            unitPrice: 14000,
            totalPrice: 420000,
            specifications: {
              size: 'A3',
              material: '厚紙',
              printing: '箔押し加工',
              postProcessing: ['リボン付属', 'クッション材']
            }
          }
        ],
        deliveryAddress: {
          id: 'mock-delivery-1',
          userId: userId,
          name: 'テスト株式会社A',
          postalCode: '100-0001',
          prefecture: '東京都',
          city: '千代田区',
          address: '丸の内1-1-1',
          phone: '03-1234-5678',
          isDefault: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        createdAt: '2024-01-05T09:00:00Z',
        updatedAt: '2024-01-12T18:00:00Z',
        shippedAt: '2024-01-10T10:00:00Z',
        deliveredAt: '2024-01-12T15:30:00Z'
      },
      {
        id: 'mock-order-5',
        userId: userId,
        orderNumber: 'ORD-2024-005',
        status: 'PENDING',
        totalAmount: 175000,
        items: [
          {
            id: 'mock-item-5',
            productId: 'prod-005',
            productName: '簡易梱包箱',
            quantity: 500,
            unitPrice: 350,
            totalPrice: 175000,
            specifications: {
              size: 'A5',
              material: '再生紙',
              printing: '1色刷り'
            }
          }
        ],
        deliveryAddress: {
          id: 'mock-delivery-3',
          userId: userId,
          name: 'テスト倉庫',
          postalCode: '230-0001',
          prefecture: '神奈川県',
          city: '横浜市鶴見区',
          address: '大黒町4-5',
          phone: '045-123-4567',
          isDefault: false,
          createdAt: '2024-01-25T00:00:00Z',
          updatedAt: '2024-01-25T00:00:00Z'
        },
        createdAt: '2024-01-25T13:00:00Z',
        updatedAt: '2024-01-25T13:00:00Z'
      },
      {
        id: 'mock-order-6',
        userId: userId,
        orderNumber: 'ORD-2024-006',
        status: 'CONTRACT_SIGNED',
        totalAmount: 320000,
        items: [
          {
            id: 'mock-item-6',
            productId: 'prod-006',
            productName: '食品包装パック',
            quantity: 1000,
            unitPrice: 320,
            totalPrice: 320000,
            specifications: {
              size: '200x150x50',
              material: 'アルミ箔',
              printing: 'フルカラー'
            }
          }
        ],
        deliveryAddress: {
          id: 'mock-delivery-1',
          userId: userId,
          name: 'テスト株式会社A',
          postalCode: '100-0001',
          prefecture: '東京都',
          city: '千代田区',
          address: '丸の内1-1-1',
          phone: '03-1234-5678',
          isDefault: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        createdAt: '2024-01-22T10:30:00Z',
        updatedAt: '2024-01-24T11:00:00Z'
      },
      {
        id: 'mock-order-7',
        userId: userId,
        orderNumber: 'ORD-2024-007',
        status: 'WORK_ORDER',
        totalAmount: 195000,
        items: [
          {
            id: 'mock-item-7',
            productId: 'prod-007',
            productName: 'ディスプレイボックス',
            quantity: 80,
            unitPrice: 2437,
            totalPrice: 195000,
            specifications: {
              size: '300x400x500',
              material: 'ダンボール',
              printing: '4色刷り',
              postProcessing: ['ワイヤー留め']
            }
          }
        ],
        deliveryAddress: {
          id: 'mock-delivery-2',
          userId: userId,
          name: 'テスト株式会社B',
          postalCode: '150-0001',
          prefecture: '東京都',
          city: '渋谷区',
          address: '神宮前1-2-3',
          phone: '03-9876-5432',
          isDefault: false,
          createdAt: '2024-01-05T00:00:00Z',
          updatedAt: '2024-01-05T00:00:00Z'
        },
        createdAt: '2024-01-23T15:00:00Z',
        updatedAt: '2024-01-24T09:30:00Z'
      },
      {
        id: 'mock-order-8',
        userId: userId,
        orderNumber: 'ORD-2024-008',
        status: 'STOCK_IN',
        totalAmount: 245000,
        items: [
          {
            id: 'mock-item-8',
            productId: 'prod-008',
            productName: '輸送用梱包材',
            quantity: 150,
            unitPrice: 1633,
            totalPrice: 245000,
            specifications: {
              size: '600x400x300',
              material: '発泡スチロール',
              printing: 'なし'
            }
          }
        ],
        deliveryAddress: {
          id: 'mock-delivery-1',
          userId: userId,
          name: 'テスト株式会社A',
          postalCode: '100-0001',
          prefecture: '東京都',
          city: '千代田区',
          address: '丸の内1-1-1',
          phone: '03-1234-5678',
          isDefault: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        createdAt: '2024-01-19T08:00:00Z',
        updatedAt: '2024-01-24T14:00:00Z'
      }
    ];

    return {
      data: mockOrders,
      total: mockOrders.length,
      page: pagination?.page || 1,
      limit: pagination?.limit || 20,
      totalPages: Math.ceil(mockOrders.length / (pagination?.limit || 20)),
    };
  }

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

  // DEV_MODE: Return null for non-existent orders (simulates RLS)
  // In DEV_MODE, we only return mock data for known mock order IDs
  if (isDevMode()) {
    console.log('[getOrderById] DEV_MODE: Checking for mock order ID:', orderId);

    // Define mock order data inline to avoid circular dependency with getOrders()
    const mockOrdersMap: Record<string, Order> = {
      'mock-order-1': {
        id: 'mock-order-1',
        userId: userId,
        orderNumber: 'ORD-2024-001',
        status: 'PRODUCTION',
        totalAmount: 150000,
        items: [{
          id: 'mock-item-1',
          productId: 'prod-001',
          productName: '化粧箱 A4サイズ',
          quantity: 100,
          unitPrice: 1500,
          totalPrice: 150000,
          specifications: {
            size: 'A4',
            material: '紙製',
            printing: 'フルカラー',
            postProcessing: ['光沢加工']
          }
        }],
        deliveryAddress: {
          id: 'mock-delivery-1',
          userId: userId,
          name: 'テスト株式会社A',
          postalCode: '100-0001',
          prefecture: '東京都',
          city: '千代田区',
          address: '丸の内1-1-1',
          phone: '03-1234-5678',
          isDefault: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        customer_name: 'テスト株式会社A',
        customer_email: 'test@example.com',
        customer_phone: '03-1234-5678',
        subtotal: 150000,
        taxAmount: 15000,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      'mock-order-2': {
        id: 'mock-order-2',
        userId: userId,
        orderNumber: 'ORD-2024-002',
        status: 'PRODUCTION',
        totalAmount: 280000,
        items: [{
          id: 'mock-item-2',
          productId: 'prod-002',
          productName: '段ボール箱',
          quantity: 200,
          unitPrice: 1400,
          totalPrice: 280000,
          specifications: {
            size: '500x400x300',
            material: '段ボール',
            printing: '2色刷り'
          }
        }],
        deliveryAddress: {
          id: 'mock-delivery-1',
          userId: userId,
          name: 'テスト株式会社A',
          postalCode: '100-0001',
          prefecture: '東京都',
          city: '千代田区',
          address: '丸の内1-1-1',
          phone: '03-1234-5678',
          isDefault: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        customer_name: 'テスト株式会社A',
        customer_email: 'test@example.com',
        customer_phone: '03-1234-5678',
        subtotal: 280000,
        taxAmount: 28000,
        createdAt: '2024-01-20T14:30:00Z',
        updatedAt: '2024-01-21T09:00:00Z'
      }
    };

    const order = mockOrdersMap[orderId];
    if (order) {
      console.log('[getOrderById] DEV_MODE: Returning mock order data for:', orderId);
      return order;
    } else {
      console.log('[getOrderById] DEV_MODE: Order ID not found in mock data, returning null (404):', orderId);
      // Return null to trigger notFound() - simulates RLS policy or non-existent order
      return null;
    }
  }

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

  // DEV_MODE: Return mock status history for known mock orders
  if (isDevMode()) {
    console.log('[getOrderStatusHistory] DEV_MODE: Returning mock status history for:', orderId);

    // Mock status history for known orders
    const mockStatusHistory: Record<string, OrderStatusHistory[]> = {
      'mock-order-1': [
        {
          id: 'history-1-1',
          order_id: 'mock-order-1',
          status: 'PENDING',
          changed_at: '2024-01-15T10:00:00Z',
          changed_by: userId,
          notes: '注文を受付しました'
        },
        {
          id: 'history-1-2',
          order_id: 'mock-order-1',
          status: 'PRODUCTION',
          changed_at: '2024-01-16T09:00:00Z',
          changed_by: userId,
          notes: '製造を開始しました'
        }
      ],
      'mock-order-2': [
        {
          id: 'history-2-1',
          order_id: 'mock-order-2',
          status: 'PENDING',
          changed_at: '2024-01-20T14:30:00Z',
          changed_by: userId,
          notes: '注文を受付しました'
        },
        {
          id: 'history-2-2',
          order_id: 'mock-order-2',
          status: 'PRODUCTION',
          changed_at: '2024-01-21T09:00:00Z',
          changed_by: userId,
          notes: '製造を開始しました'
        }
      ]
    };

    return mockStatusHistory[orderId] || [];
  }

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

  // DEV_MODE: Return mock order stats
  if (isDevMode()) {
    console.log('[getOrderStats] DEV_MODE: Returning mock order stats');
    return {
      PENDING: 1,
      QUOTATION: 0,
      DATA_RECEIVED: 0,
      WORK_ORDER: 1,
      CONTRACT_SENT: 0,
      CONTRACT_SIGNED: 1,
      PRODUCTION: 1,
      STOCK_IN: 1,
      SHIPPED: 1,
      DELIVERED: 1,
      CANCELLED: 0,
    };
  }

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

  // DEV_MODE: Return mock delivery addresses
  if (isDevMode()) {
    console.log('[getDeliveryAddresses] DEV_MODE: Returning mock delivery addresses');
    const mockDeliveryAddresses: DeliveryAddress[] = [
      {
        id: 'mock-delivery-1',
        userId: userId,
        name: 'テスト株式会社A',
        postalCode: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        address: '丸の内1-1-1',
        building: '〇〇ビル 5F',
        phone: '03-1234-5678',
        contactPerson: '山田太郎',
        isDefault: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'mock-delivery-2',
        userId: userId,
        name: 'テスト株式会社B',
        postalCode: '150-0001',
        prefecture: '東京都',
        city: '渋谷区',
        address: '神宮前1-2-3',
        building: '××ビル 3F',
        phone: '03-9876-5432',
        contactPerson: '鈴木花子',
        isDefault: false,
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-05T00:00:00Z'
      },
      {
        id: 'mock-delivery-3',
        userId: userId,
        name: 'テスト倉庫',
        postalCode: '230-0001',
        prefecture: '神奈川県',
        city: '横浜市鶴見区',
        address: '大黒町4-5',
        building: '倉庫棟',
        phone: '045-123-4567',
        contactPerson: '佐藤次郎',
        isDefault: false,
        createdAt: '2024-01-25T00:00:00Z',
        updatedAt: '2024-01-25T00:00:00Z'
      }
    ];

    return mockDeliveryAddresses.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

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

  // DEV_MODE: Return mock default delivery address
  if (isDevMode()) {
    console.log('[getDefaultDeliveryAddress] DEV_MODE: Returning mock default delivery address');
    return {
      id: 'mock-delivery-1',
      userId: userId,
      name: 'テスト株式会社A',
      postalCode: '100-0001',
      prefecture: '東京都',
      city: '千代田区',
      address: '丸の内1-1-1',
      building: '〇〇ビル 5F',
      phone: '03-1234-5678',
      contactPerson: '山田太郎',
      isDefault: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };
  }

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

  // DEV_MODE: Return mock billing addresses
  if (isDevMode()) {
    console.log('[getBillingAddresses] DEV_MODE: Returning mock billing addresses');
    const mockBillingAddresses: BillingAddress[] = [
      {
        id: 'mock-billing-1',
        userId: userId,
        companyName: 'テスト株式会社A',
        postalCode: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        address: '丸の内1-1-1',
        building: '〇〇ビル 5F',
        taxNumber: '1234567890123',
        email: 'billing@test-corp-a.co.jp',
        phone: '03-1234-5678',
        isDefault: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'mock-billing-2',
        userId: userId,
        companyName: 'テスト株式会社B',
        postalCode: '150-0001',
        prefecture: '東京都',
        city: '渋谷区',
        address: '神宮前1-2-3',
        building: '××ビル 3F',
        taxNumber: '9876543210987',
        email: 'billing@test-corp-b.co.jp',
        phone: '03-9876-5432',
        isDefault: false,
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-05T00:00:00Z'
      }
    ];

    return mockBillingAddresses.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

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

  // DEV_MODE: Return realistic mock data for testing (SECURE: server-side only)
  if (isDevMode()) {
    console.log('[getQuotations] DEV_MODE: Returning mock quotation data');
    const mockQuotations: Quotation[] = [
      {
        id: 'mock-quote-1',
        userId: userId,
        quotationNumber: 'Q-2024-001',
        status: 'draft',
        totalAmount: 150000,
        validUntil: '2024-03-15T23:59:59Z',
        items: [
          {
            id: 'mock-quote-item-1',
            productId: 'prod-001',
            productName: '化粧箱 A4サイズ',
            quantity: 100,
            unitPrice: 1500,
            totalPrice: 150000,
            specifications: {
              size: 'A4',
              material: '紙製',
              printing: 'フルカラー',
              postProcessing: ['光沢加工']
            }
          }
        ],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'mock-quote-2',
        userId: userId,
        quotationNumber: 'Q-2024-002',
        status: 'sent',
        totalAmount: 280000,
        validUntil: '2024-03-20T23:59:59Z',
        items: [
          {
            id: 'mock-quote-item-2',
            productId: 'prod-002',
            productName: '段ボール箱',
            quantity: 200,
            unitPrice: 1400,
            totalPrice: 280000,
            specifications: {
              size: '500x400x300',
              material: '段ボール',
              printing: '2色刷り'
            }
          }
        ],
        createdAt: '2024-01-20T14:30:00Z',
        updatedAt: '2024-01-20T14:30:00Z',
        sentAt: '2024-01-20T14:30:00Z'
      },
      {
        id: 'mock-quote-3',
        userId: userId,
        quotationNumber: 'Q-2024-003',
        status: 'approved',
        totalAmount: 95000,
        validUntil: '2024-02-28T23:59:59Z',
        items: [
          {
            id: 'mock-quote-item-3',
            productId: 'prod-003',
            productName: '透明パッケージ',
            quantity: 50,
            unitPrice: 1900,
            totalPrice: 95000,
            specifications: {
              size: 'B5',
              material: 'PET',
              printing: 'なし'
            },
            orderId: 'mock-order-3'
          }
        ],
        createdAt: '2024-01-10T11:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z',
        sentAt: '2024-01-10T11:00:00Z',
        approvedAt: '2024-01-15T09:00:00Z'
      },
      {
        id: 'mock-quote-4',
        userId: userId,
        quotationNumber: 'Q-2024-004',
        status: 'draft',
        totalAmount: 420000,
        validUntil: '2024-04-15T23:59:59Z',
        items: [
          {
            id: 'mock-quote-item-4',
            productId: 'prod-004',
            productName: '高級ギフトボックス',
            quantity: 30,
            unitPrice: 14000,
            totalPrice: 420000,
            specifications: {
              size: 'A3',
              material: '厚紙',
              printing: '箔押し加工',
              postProcessing: ['リボン付属', 'クッション材']
            }
          }
        ],
        createdAt: '2024-01-24T16:00:00Z',
        updatedAt: '2024-01-24T16:00:00Z'
      },
      {
        id: 'mock-quote-5',
        userId: userId,
        quotationNumber: 'Q-2024-005',
        status: 'sent',
        totalAmount: 175000,
        validUntil: '2024-03-30T23:59:59Z',
        items: [
          {
            id: 'mock-quote-item-5',
            productId: 'prod-005',
            productName: '簡易梱包箱',
            quantity: 500,
            unitPrice: 350,
            totalPrice: 175000,
            specifications: {
              size: 'A5',
              material: '再生紙',
              printing: '1色刷り'
            }
          }
        ],
        createdAt: '2024-01-25T13:00:00Z',
        updatedAt: '2024-01-25T13:00:00Z',
        sentAt: '2024-01-25T13:00:00Z'
      },
      {
        id: 'mock-quote-6',
        userId: userId,
        quotationNumber: 'Q-2024-006',
        status: 'expired',
        totalAmount: 85000,
        validUntil: '2024-01-10T23:59:59Z',
        items: [
          {
            id: 'mock-quote-item-6',
            productId: 'prod-006',
            productName: '食品包装パック',
            quantity: 250,
            unitPrice: 340,
            totalPrice: 85000,
            specifications: {
              size: '150x100x40',
              material: '紙製',
              printing: '2色刷り'
            }
          }
        ],
        createdAt: '2023-12-15T10:00:00Z',
        updatedAt: '2023-12-15T10:00:00Z'
      },
      {
        id: 'mock-quote-7',
        userId: userId,
        quotationNumber: 'Q-2024-007',
        status: 'rejected',
        totalAmount: 195000,
        validUntil: '2024-02-28T23:59:59Z',
        items: [
          {
            id: 'mock-quote-item-7',
            productId: 'prod-007',
            productName: 'ディスプレイボックス',
            quantity: 80,
            unitPrice: 2437,
            totalPrice: 195000,
            specifications: {
              size: '300x400x500',
              material: 'ダンボール',
              printing: '4色刷り',
              postProcessing: ['ワイヤー留め']
            }
          }
        ],
        createdAt: '2024-01-12T09:00:00Z',
        updatedAt: '2024-01-18T14:30:00Z',
        sentAt: '2024-01-12T09:00:00Z'
      },
      {
        id: 'mock-quote-8',
        userId: userId,
        quotationNumber: 'Q-2024-008',
        status: 'approved',
        totalAmount: 245000,
        validUntil: '2024-03-31T23:59:59Z',
        items: [
          {
            id: 'mock-quote-item-8',
            productId: 'prod-008',
            productName: '輸送用梱包材',
            quantity: 150,
            unitPrice: 1633,
            totalPrice: 245000,
            specifications: {
              size: '600x400x300',
              material: '発泡スチロール',
              printing: 'なし'
            },
            orderId: 'mock-order-8'
          }
        ],
        createdAt: '2024-01-19T08:00:00Z',
        updatedAt: '2024-01-22T10:00:00Z',
        sentAt: '2024-01-19T08:00:00Z',
        approvedAt: '2024-01-22T10:00:00Z'
      }
    ];

    // Filter by status if provided
    let filteredQuotations = mockQuotations;
    if (status) {
      filteredQuotations = mockQuotations.filter(q => q.status === status);
    }

    return filteredQuotations;
  }

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

  // DEV_MODE: Return realistic mock data for testing
  if (isDevMode()) {
    console.log('[getSampleRequests] DEV_MODE: Returning mock sample request data');
    const mockSampleRequests: DashboardSampleRequest[] = [
      {
        id: 'mock-sample-1',
        userId: userId,
        requestNumber: 'S-2024-001',
        status: 'received',
        samples: [
          {
            id: 'mock-sample-item-1',
            productId: 'prod-001',
            productName: '化粧箱 A4サイズ',
            category: 'boxes',
            quantity: 3
          },
          {
            id: 'mock-sample-item-2',
            productId: 'prod-002',
            productName: '段ボール箱',
            category: 'boxes',
            quantity: 2
          }
        ],
        deliveryAddress: {
          id: 'mock-delivery-1',
          userId: userId,
          name: 'テスト株式会社A',
          postalCode: '100-0001',
          prefecture: '東京都',
          city: '千代田区',
          address: '丸の内1-1-1',
          phone: '03-1234-5678',
          isDefault: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        createdAt: '2024-01-24T10:00:00Z',
        updatedAt: '2024-01-24T10:00:00Z'
      },
      {
        id: 'mock-sample-2',
        userId: userId,
        requestNumber: 'S-2024-002',
        status: 'processing',
        samples: [
          {
            id: 'mock-sample-item-3',
            productId: 'prod-003',
            productName: '透明パッケージ',
            category: 'packaging',
            quantity: 5
          }
        ],
        deliveryAddress: {
          id: 'mock-delivery-2',
          userId: userId,
          name: 'テスト株式会社B',
          postalCode: '150-0001',
          prefecture: '東京都',
          city: '渋谷区',
          address: '神宮前1-2-3',
          phone: '03-9876-5432',
          isDefault: false,
          createdAt: '2024-01-05T00:00:00Z',
          updatedAt: '2024-01-05T00:00:00Z'
        },
        createdAt: '2024-01-22T14:00:00Z',
        updatedAt: '2024-01-23T09:00:00Z'
      },
      {
        id: 'mock-sample-3',
        userId: userId,
        requestNumber: 'S-2024-003',
        status: 'shipped',
        samples: [
          {
            id: 'mock-sample-item-4',
            productId: 'prod-004',
            productName: '高級ギフトボックス',
            category: 'boxes',
            quantity: 1
          }
        ],
        deliveryAddress: {
          id: 'mock-delivery-1',
          userId: userId,
          name: 'テスト株式会社A',
          postalCode: '100-0001',
          prefecture: '東京都',
          city: '千代田区',
          address: '丸の内1-1-1',
          phone: '03-1234-5678',
          isDefault: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        createdAt: '2024-01-15T11:00:00Z',
        updatedAt: '2024-01-18T16:00:00Z',
        shippedAt: '2024-01-18T16:00:00Z'
      },
      {
        id: 'mock-sample-4',
        userId: userId,
        requestNumber: 'S-2024-004',
        status: 'delivered',
        samples: [
          {
            id: 'mock-sample-item-5',
            productId: 'prod-005',
            productName: '簡易梱包箱',
            category: 'boxes',
            quantity: 10
          }
        ],
        deliveryAddress: {
          id: 'mock-delivery-3',
          userId: userId,
          name: 'テスト倉庫',
          postalCode: '230-0001',
          prefecture: '神奈川県',
          city: '横浜市鶴見区',
          address: '大黒町4-5',
          phone: '045-123-4567',
          isDefault: false,
          createdAt: '2024-01-25T00:00:00Z',
          updatedAt: '2024-01-25T00:00:00Z'
        },
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-01-14T14:30:00Z',
        shippedAt: '2024-01-12T10:00:00Z'
      },
      {
        id: 'mock-sample-5',
        userId: userId,
        requestNumber: 'S-2024-005',
        status: 'cancelled',
        samples: [
          {
            id: 'mock-sample-item-6',
            productId: 'prod-006',
            productName: '食品包装パック',
            category: 'packaging',
            quantity: 3
          }
        ],
        deliveryAddress: {
          id: 'mock-delivery-2',
          userId: userId,
          name: 'テスト株式会社B',
          postalCode: '150-0001',
          prefecture: '東京都',
          city: '渋谷区',
          address: '神宮前1-2-3',
          phone: '03-9876-5432',
          isDefault: false,
          createdAt: '2024-01-05T00:00:00Z',
          updatedAt: '2024-01-05T00:00:00Z'
        },
        createdAt: '2024-01-08T13:00:00Z',
        updatedAt: '2024-01-09T10:00:00Z'
      }
    ];

    // Filter by status if provided
    let filteredSamples = mockSampleRequests;
    if (status) {
      filteredSamples = mockSampleRequests.filter(s => s.status === status);
    }

    return filteredSamples;
  }

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

  // DEV_MODE: Return realistic mock data for testing
  if (isDevMode()) {
    console.log('[getInquiries] DEV_MODE: Returning mock inquiry data');
    const mockInquiries: Inquiry[] = [
      {
        id: 'mock-inquiry-1',
        userId: userId,
        inquiryNumber: 'I-2024-001',
        type: 'quotation',
        status: 'responded',
        subject: '見積もりについての問い合わせ',
        message: '化粧箱の見積もりについてご相談があります。大量注文の場合の価格について教えてください。',
        response: 'お問い合わせいただきありがとうございます。大量注文の場合は別途お見積もりさせていただきます。担当者より折り返しご連絡いたします。',
        createdAt: '2024-01-24T11:00:00Z',
        updatedAt: '2024-01-24T14:00:00Z',
        respondedAt: '2024-01-24T14:00:00Z'
      },
      {
        id: 'mock-inquiry-2',
        userId: userId,
        inquiryNumber: 'I-2024-002',
        type: 'product',
        status: 'responded',
        subject: '製品仕様に関する質問',
        message: '段ボール箱の耐荷重について教えてください。30kgの荷物を梱包したいのですが。',
        response: '段ボール箱の耐荷重はサイズや厚みによって異なります。30kgの荷物の場合、強化ダンボールのご使用をお勧めいたします。',
        createdAt: '2024-01-23T09:30:00Z',
        updatedAt: '2024-01-23T13:00:00Z',
        respondedAt: '2024-01-23T13:00:00Z'
      },
      {
        id: 'mock-inquiry-3',
        userId: userId,
        inquiryNumber: 'I-2024-003',
        type: 'sample',
        status: 'open',
        subject: 'サンプル請求について',
        message: '新製品のサンプルを請求したいのですが、どのようにすればよいでしょうか。',
        createdAt: '2024-01-22T15:00:00Z',
        updatedAt: '2024-01-22T15:00:00Z'
      },
      {
        id: 'mock-inquiry-4',
        userId: userId,
        inquiryNumber: 'I-2024-004',
        type: 'order',
        status: 'closed',
        subject: '納期に関する問い合わせ',
        message: '注文の納期が遅れているようですが、状況を教えてください。',
        response: 'お問い合わせいただきありがとうございます。現在製造中であり、予定通り納品できる見込みです。',
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-21T16:00:00Z',
        respondedAt: '2024-01-21T14:00:00Z'
      },
      {
        id: 'mock-inquiry-5',
        userId: userId,
        inquiryNumber: 'I-2024-005',
        type: 'other',
        status: 'responded',
        subject: '取引開始について',
        message: '新規取扱を希望しています。必要な書類を教えてください。',
        response: '新規お取扱ありがとうございます。担当者より必要書類についてご連絡いたします。',
        createdAt: '2024-01-18T14:00:00Z',
        updatedAt: '2024-01-19T10:00:00Z',
        respondedAt: '2024-01-19T10:00:00Z'
      },
      {
        id: 'mock-inquiry-6',
        userId: userId,
        inquiryNumber: 'I-2024-006',
        type: 'quotation',
        status: 'open',
        subject: '再見積もりのお願い',
        message: '以前いただいた見積もりについて、仕様変更があります。',
        createdAt: '2024-01-25T09:00:00Z',
        updatedAt: '2024-01-25T09:00:00Z'
      },
      {
        id: 'mock-inquiry-7',
        userId: userId,
        inquiryNumber: 'I-2024-007',
        type: 'billing',
        status: 'responded',
        subject: '請求書の再発行',
        message: '先月の請求書を紛失してしまいました。再発行可能でしょうか。',
        response: '請求書の再発行について承知いたしました。担当者より送付手続きをご連絡いたします。',
        createdAt: '2024-01-17T11:30:00Z',
        updatedAt: '2024-01-17T15:00:00Z',
        respondedAt: '2024-01-17T15:00:00Z'
      }
    ];

    // Filter by status and type if provided
    let filteredInquiries = mockInquiries;
    if (status) {
      filteredInquiries = filteredInquiries.filter(i => i.status === status);
    }
    if (type) {
      filteredInquiries = filteredInquiries.filter(i => i.type === type);
    }

    return filteredInquiries;
  }

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
  // DEV_MODE: Return realistic mock data for testing (SECURE: server-side only)
  if (isDevMode()) {
    console.log('[getDashboardStats] DEV_MODE: Returning mock stats data');
    const userId = await getCurrentUserId();

    // Mock orders for dashboard
    const newOrders: Order[] = [
      {
        id: 'mock-order-5',
        userId: userId || 'mock-user',
        orderNumber: 'ORD-2024-005',
        status: 'PENDING',
        totalAmount: 175000,
        items: [{
          id: 'mock-item-5',
          productId: 'prod-005',
          productName: '簡易梱包箱',
          quantity: 500,
          unitPrice: 350,
          totalPrice: 175000,
          specifications: {
            size: 'A5',
            material: '再生紙',
            printing: '1色刷り'
          }
        }],
        deliveryAddress: {
          id: 'mock-delivery-1',
          userId: userId || 'mock-user',
          name: 'テスト株式会社A',
          postalCode: '100-0001',
          prefecture: '東京都',
          city: '千代田区',
          address: '丸の内1-1-1',
          phone: '03-1234-5678',
          isDefault: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        createdAt: '2024-01-25T13:00:00Z',
        updatedAt: '2024-01-25T13:00:00Z'
      },
      {
        id: 'mock-order-1',
        userId: userId || 'mock-user',
        orderNumber: 'ORD-2024-001',
        status: 'PRODUCTION',
        totalAmount: 150000,
        items: [{
          id: 'mock-item-1',
          productId: 'prod-001',
          productName: '化粧箱 A4サイズ',
          quantity: 100,
          unitPrice: 1500,
          totalPrice: 150000,
          specifications: {
            size: 'A4',
            material: '紙製',
            printing: 'フルカラー',
            postProcessing: ['光沢加工']
          }
        }],
        deliveryAddress: {
          id: 'mock-delivery-1',
          userId: userId || 'mock-user',
          name: 'テスト株式会社A',
          postalCode: '100-0001',
          prefecture: '東京都',
          city: '千代田区',
          address: '丸の内1-1-1',
          phone: '03-1234-5678',
          isDefault: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      }
    ];

    const processingOrders: Order[] = [
      {
        id: 'mock-order-2',
        userId: userId || 'mock-user',
        orderNumber: 'ORD-2024-002',
        status: 'PRODUCTION',
        totalAmount: 280000,
        items: [{
          id: 'mock-item-2',
          productId: 'prod-002',
          productName: '段ボール箱',
          quantity: 200,
          unitPrice: 1400,
          totalPrice: 280000,
          specifications: {
            size: '500x400x300',
            material: '段ボール',
            printing: '2色刷り'
          }
        }],
        deliveryAddress: {
          id: 'mock-delivery-1',
          userId: userId || 'mock-user',
          name: 'テスト株式会社A',
          postalCode: '100-0001',
          prefecture: '東京都',
          city: '千代田区',
          address: '丸の内1-1-1',
          phone: '03-1234-5678',
          isDefault: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        createdAt: '2024-01-20T14:30:00Z',
        updatedAt: '2024-01-21T09:00:00Z'
      }
    ];

    // Mock quotations
    const pendingQuotations: Quotation[] = [
      {
        id: 'mock-quote-1',
        userId: userId || 'mock-user',
        quotationNumber: 'Q-2024-001',
        status: 'draft',
        totalAmount: 150000,
        validUntil: '2024-03-15T23:59:59Z',
        items: [{
          id: 'mock-quote-item-1',
          productId: 'prod-001',
          productName: '化粧箱 A4サイズ',
          quantity: 100,
          unitPrice: 1500,
          totalPrice: 150000,
          specifications: {
            size: 'A4',
            material: '紙製',
            printing: 'フルカラー',
            postProcessing: ['光沢加工']
          }
        }],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'mock-quote-2',
        userId: userId || 'mock-user',
        quotationNumber: 'Q-2024-002',
        status: 'sent',
        totalAmount: 280000,
        validUntil: '2024-03-20T23:59:59Z',
        items: [{
          id: 'mock-quote-item-2',
          productId: 'prod-002',
          productName: '段ボール箱',
          quantity: 200,
          unitPrice: 1400,
          totalPrice: 280000,
          specifications: {
            size: '500x400x300',
            material: '段ボール',
            printing: '2色刷り'
          }
        }],
        createdAt: '2024-01-20T14:30:00Z',
        updatedAt: '2024-01-20T14:30:00Z',
        sentAt: '2024-01-20T14:30:00Z'
      }
    ];

    // Mock sample requests
    const pendingSamples: DashboardSampleRequest[] = [
      {
        id: 'mock-sample-1',
        userId: userId || 'mock-user',
        requestNumber: 'S-2024-001',
        status: 'received',
        samples: [
          {
            id: 'mock-sample-item-1',
            productId: 'prod-001',
            productName: '化粧箱 A4サイズ',
            category: 'boxes',
            quantity: 3
          }
        ],
        deliveryAddress: {
          id: 'mock-delivery-1',
          userId: userId || 'mock-user',
          name: 'テスト株式会社A',
          postalCode: '100-0001',
          prefecture: '東京都',
          city: '千代田区',
          address: '丸の内1-1-1',
          phone: '03-1234-5678',
          isDefault: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        createdAt: '2024-01-24T10:00:00Z',
        updatedAt: '2024-01-24T10:00:00Z'
      },
      {
        id: 'mock-sample-2',
        userId: userId || 'mock-user',
        requestNumber: 'S-2024-002',
        status: 'processing',
        samples: [
          {
            id: 'mock-sample-item-2',
            productId: 'prod-003',
            productName: '透明パッケージ',
            category: 'packaging',
            quantity: 5
          }
        ],
        deliveryAddress: {
          id: 'mock-delivery-2',
          userId: userId || 'mock-user',
          name: 'テスト株式会社B',
          postalCode: '150-0001',
          prefecture: '東京都',
          city: '渋谷区',
          address: '神宮前1-2-3',
          phone: '03-9876-5432',
          isDefault: false,
          createdAt: '2024-01-05T00:00:00Z',
          updatedAt: '2024-01-05T00:00:00Z'
        },
        createdAt: '2024-01-22T14:00:00Z',
        updatedAt: '2024-01-23T09:00:00Z'
      }
    ];

    // Mock inquiries
    const unreadInquiries: Inquiry[] = [
      {
        id: 'mock-inquiry-1',
        userId: userId || 'mock-user',
        inquiryNumber: 'I-2024-001',
        type: 'quotation',
        status: 'responded',
        subject: '見積もりについての問い合わせ',
        message: '化粧箱の見積もりについてご相談があります。',
        response: 'お問い合わせいただきありがとうございます。担当者より折り返しご連絡いたします。',
        createdAt: '2024-01-24T11:00:00Z',
        updatedAt: '2024-01-24T14:00:00Z',
        respondedAt: '2024-01-24T14:00:00Z'
      },
      {
        id: 'mock-inquiry-2',
        userId: userId || 'mock-user',
        inquiryNumber: 'I-2024-002',
        type: 'product',
        status: 'responded',
        subject: '製品仕様に関する質問',
        message: '段ボール箱の耐荷重について教えてください。',
        response: '段ボール箱の耐荷重はサイズや厚みによって異なります。',
        createdAt: '2024-01-23T09:30:00Z',
        updatedAt: '2024-01-23T13:00:00Z',
        respondedAt: '2024-01-23T13:00:00Z'
      }
    ];

    // Mock announcements
    const announcements: Announcement[] = [
      {
        id: 'mock-announcement-1',
        title: '年末年始の営業時間について',
        content: '誠に勝手ながら、以下の日程を休業とさせていただきます。',
        category: 'notice',
        priority: 'medium',
        isPublished: true,
        publishedAt: '2024-01-20T10:00:00Z',
        createdAt: '2024-01-20T10:00:00Z'
      },
      {
        id: 'mock-announcement-2',
        title: '新商品のご案内',
        content: '環境に配慮した再生紙を使用した梱包箱をラインナップに追加しました。',
        category: 'promotion',
        priority: 'high',
        isPublished: true,
        publishedAt: '2024-01-18T15:00:00Z',
        createdAt: '2024-01-18T15:00:00Z'
      },
      {
        id: 'mock-announcement-3',
        title: 'システムメンテナンスのお知らせ',
        content: '2024年2月1日にシステムメンテナンスを実施いたします。',
        category: 'maintenance',
        priority: 'low',
        isPublished: true,
        publishedAt: '2024-01-15T09:00:00Z',
        createdAt: '2024-01-15T09:00:00Z'
      }
    ];

    // Mock contracts for DEV_MODE
    const mockContracts: ContractStats[] = [
      {
        id: 'mock-contract-1',
        contract_number: 'C-2024-001',
        status: 'CUSTOMER_SIGNED',
        total_amount: 150000,
        created_at: '2024-01-20T10:00:00Z',
      },
      {
        id: 'mock-contract-2',
        contract_number: 'C-2024-002',
        status: 'PENDING_SIGNATURE',
        total_amount: 280000,
        created_at: '2024-01-22T14:30:00Z',
      },
    ];

    // Mock notifications for DEV_MODE
    const mockNotifications: NotificationStats[] = [
      {
        id: 'mock-notif-1',
        type: 'order',
        title: '注文が承認されました',
        message: '注文 ORD-2024-001 が承認されました。',
        is_read: false,
        created_at: '2024-01-24T10:00:00Z',
        action_url: '/member/orders/ORD-2024-001',
      },
      {
        id: 'mock-notif-2',
        type: 'production',
        title: '製造が開始されました',
        message: '注文 ORD-2024-002 の製造が開始されました。',
        is_read: true,
        created_at: '2024-01-23T14:00:00Z',
        action_url: '/member/orders/ORD-2024-002',
      },
    ];

    return {
      orders: {
        new: newOrders,
        processing: processingOrders,
        total: 8,
      },
      quotations: {
        pending: pendingQuotations,
        total: 8,
      },
      samples: {
        pending: pendingSamples,
        total: 5,
      },
      inquiries: {
        unread: unreadInquiries,
        total: 7,
      },
      announcements: announcements,
      // B2B integration: contracts and notifications
      contracts: {
        pending: mockContracts,
        total: 3,
        signed: 1,
      },
      notifications: mockNotifications,
    };
  }

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

  // DEV_MODE: Return mock notification badge counts
  if (isDevMode()) {
    console.log('[getNotificationBadge] DEV_MODE: Returning mock badge counts');
    return {
      quotations: 3,    // 2 draft + 1 sent
      samples: 2,       // 1 received + 1 processing
      inquiries: 4,     // 4 responded
      orders: 2,        // 1 pending + 1 processing
      total: 11,
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
 * SSR/CSR両対応、DEV_MODE対応
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

  // DEV_MODE対応
  if (isDevMode()) {
    return getMockUnifiedDashboardStats(userId, userRole, period);
  }

  // 本番データフェッチ（キャッシュ付き）
  const cacheKey = `dashboard_${userRole}_${userId}_${period}`;

  return unstable_cache(
    async () => {
      if (userRole === 'ADMIN') {
        return fetchAdminDashboardStats(userId, period);
      } else {
        return fetchMemberDashboardStats(userId, period);
      }
    },
    [cacheKey],
    { revalidate: 30 } // 30秒キャッシュ
  )();
}

/**
 * SWR用フェッチャー（Client Component）
 */
export const createDashboardFetcher = () => {
  return async (url: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // DEV_MODEヘッダー対応
    if (typeof window !== 'undefined') {
      const devUserId = localStorage.getItem('dev-mock-user-id');
      if (devUserId) {
        headers['x-dev-mode'] = 'true';
        headers['x-user-id'] = devUserId;
      }
    }

    const response = await fetch(url, {
      credentials: 'include',
      headers,
    });

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
 * DEV_MODEヘッダー生成
 */
export function getDevModeHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};

  if (typeof window !== 'undefined') {
    const devUserId = localStorage.getItem('dev-mock-user-id');
    if (devUserId) {
      headers['x-dev-mode'] = 'true';
      headers['x-user-id'] = devUserId;
    }
  }

  return headers;
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
 * DEV_MODE用モック統計データ生成
 */
function getMockUnifiedDashboardStats(
  userId: string,
  userRole: 'ADMIN' | 'MEMBER',
  period: number
): UnifiedDashboardStats {
  const baseStats: UnifiedDashboardStats = {
    totalOrders: Math.floor(Math.random() * 100) + 50,
    pendingOrders: Math.floor(Math.random() * 20) + 5,
    totalRevenue: Math.floor(Math.random() * 1000000) + 500000,
    activeUsers: userRole === 'ADMIN' ? Math.floor(Math.random() * 50) + 10 : 0,
    period,
  };

  if (userRole === 'ADMIN') {
    return {
      ...baseStats,
      ordersByStatus: [
        { status: 'PENDING', count: Math.floor(Math.random() * 10) + 1 },
        { status: 'PRODUCTION', count: Math.floor(Math.random() * 20) + 5 },
        { status: 'SHIPPED', count: Math.floor(Math.random() * 15) + 3 },
      ],
      pendingQuotations: Math.floor(Math.random() * 10) + 3,
      quotations: {
        total: Math.floor(Math.random() * 50) + 20,
        approved: Math.floor(Math.random() * 30) + 10,
        conversionRate: Math.floor(Math.random() * 30) + 50,
      },
      recentQuotations: [],
      samples: {
        total: Math.floor(Math.random() * 30) + 10,
        processing: Math.floor(Math.random() * 10) + 2,
      },
      production: {
        avgDays: Math.floor(Math.random() * 10) + 5,
        completed: Math.floor(Math.random() * 100) + 50,
      },
      shipments: {
        today: Math.floor(Math.random() * 20) + 5,
        inTransit: Math.floor(Math.random() * 30) + 10,
      },
      activeProduction: Math.floor(Math.random() * 15) + 3,
      todayShipments: Math.floor(Math.random() * 10) + 2,
    };
  } else {
    return {
      ...baseStats,
      activeOrders: Math.floor(Math.random() * 10) + 1,
      pendingQuotations: Math.floor(Math.random() * 5) + 1,
      samples: {
        total: Math.floor(Math.random() * 20) + 5,
        processing: Math.floor(Math.random() * 5) + 1,
      },
      contracts: {
        pending: Math.floor(Math.random() * 3) + 1,
        signed: Math.floor(Math.random() * 5) + 1,
        total: Math.floor(Math.random() * 10) + 2,
      },
    };
  }
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

  // 並列クエリ - 見積統計を追加
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

  return {
    totalOrders: totalOrdersResult.count || 0,
    pendingOrders: pendingOrdersResult.count || 0,
    totalRevenue,
    activeUsers: activeUsersResult.count || 0,
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
