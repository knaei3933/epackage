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

import { supabase, createSupabaseWithCookies, createServiceClient } from '@/lib/supabase';
import { isDevMode } from '@/lib/dev-mode';
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
} from '@/types/dashboard';

// =====================================================
// Helper Functions
// =====================================================

// Server-side client (for server components)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createDashboardServerClient(cookieStore: any) {
  return createSupabaseWithCookies(cookieStore);
}

// Re-export supabase client for convenience
export { supabase };

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
 * DEV_MODEでは mock 사용자 정보를 반환합니다
 * Production: server-side에서는 headers를 통해, client-side에서는 Supabase 사용
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

    // DEV_MODE: mock 사용자 정보 반환
    // server 환경에서는 기본값만 반환 (localStorage 접근 불가)
    // 필요한 경우 쿠키에 추가 정보를 저장할 수 있음
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

  // Server-side: middleware가 설정한 headers에서 읽기
  if (typeof window === 'undefined') {
    try {
      const { headers } = await import('next/headers');
      const headersList = await headers();

      const userId = headersList.get('x-user-id');
      if (userId) {
        // Server-side에서는 service client를 사용해서 profile을 가져옴
        // (쿠키 수정 없이 읽기만 하므로 안전)
        const serviceClient = createServiceClient();

        const { data: profile } = await serviceClient
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        return {
          id: userId,
          email: profile?.email,
          user_metadata: {
            kanji_last_name: profile?.kanji_last_name,
            kanji_first_name: profile?.kanji_first_name,
            name_kanji: profile?.kanji_last_name,
            name_kana: profile?.kana_last_name,
          },
        };
      }
    } catch (e) {
      console.error('[getCurrentUser] Server-side auth error:', e);
    }
  }

  // Client-side: Supabase auth 사용 (fallback)
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * 인증을 요구하고 사용자 정보를 반환
 * 인증되지 않은 경우 AuthRequiredError를 throw합니다
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
 * DEV_MODEでは쿠키에서 mock 사용자 ID를 읽어옵니다
 */
export async function getCurrentUserId(): Promise<string | null> {
  const isDevModeEnabled = isDevMode();

  if (isDevModeEnabled) {
    // Client-side: document.cookie에서 읽기
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

    // Server-side: cookies() API 사용 (이 함수는 async이므로 가능)
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

    // Last resort: localStorage에서 읽기 (클라이언트 사이드 전용)
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

    // DEV_MODE에서 사용자 ID를 찾지 못한 경우 - 자동으로 mock ID 생성
    const mockUserId = 'dev-mock-user-12345';
    console.log('[getCurrentUserId] DEV_MODE: No user ID found, using mock ID:', mockUserId);

    // 클라이언트 사이드에서 localStorage에 저장
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
  // PRODUCTION: Supabase 인증 사용
  // =====================================================

  // Server-side: middleware가 설정한 headers에서 읽기
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

  // Client-side: Supabase auth 사용 (fallback)
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
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
        status: 'PROCESSING',
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

  let query = serviceClient
    .from('orders')
    .select(`
      *,
      order_items (*),
      delivery_addresses (*),
      billing_addresses (*)
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

  // Sorting
  const sortBy = pagination?.sortBy || 'created_at';
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

  return {
    data: data as Order[],
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

  const { data, error } = await serviceClient
    .from('orders')
    .select(`
      *,
      order_items (*),
      delivery_addresses (*),
      billing_addresses (*)
    `)
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data as Order;
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
      // @ts-ignore - Supabase update type inference issue
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true);
  }

  const { data, error } = await serviceClient
    .from('delivery_addresses')
    // @ts-ignore - Supabase insert type inference issue
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
    })
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
      // @ts-ignore - Supabase update type inference issue
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true)
      .neq('id', id);
  }

  const { data, error } = await serviceClient
    .from('delivery_addresses')
    // @ts-ignore - Supabase update type inference issue
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
    })
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
      // @ts-ignore - Supabase update type inference issue
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true);
  }

  const { data, error } = await serviceClient
    .from('billing_addresses')
    // @ts-ignore - Supabase insert type inference issue
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
    })
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
      // @ts-ignore - Supabase update type inference issue
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true)
      .neq('id', id);
  }

  const { data, error } = await serviceClient
    .from('billing_addresses')
    // @ts-ignore - Supabase update type inference issue
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
    })
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
        shippedAt: '2024-01-12T10:00:00Z',
        deliveredAt: '2024-01-14T14:30:00Z'
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
        status: 'pending',
        subject: 'サンプル請求について',
        message: '新製品のサンプルを請求したいのですが、どのようにすればよいでしょうか。',
        createdAt: '2024-01-22T15:00:00Z',
        updatedAt: '2024-01-22T15:00:00Z'
      },
      {
        id: 'mock-inquiry-4',
        userId: userId,
        inquiryNumber: 'I-2024-004',
        type: 'delivery',
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
        status: 'pending',
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
        status: 'PROCESSING',
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
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: false })
      .limit(5);

    // Get processing orders
    const { data: processingOrders } = await serviceClient
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'manufacturing');

    // Get pending quotations
    const { data: pendingQuotations } = await serviceClient
      .from('quotations')
      .select('*, quotation_items (*)')
      .eq('user_id', userId)
      .in('status', ['draft', 'sent'])
      .order('created_at', { ascending: false })
      .limit(5);

    // Get pending sample requests
    const { data: pendingSamples } = await serviceClient
      .from('sample_requests')
      .select('*, sample_items (*)')
      .eq('user_id', userId)
      .in('status', ['received', 'processing'])
      .order('created_at', { ascending: false })
      .limit(5);

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
      // notifications 테이블이 없으면 기본값 사용
    }

    return {
      orders: {
        new: (newOrders as Order[]) || [],
        processing: (processingOrders as Order[]) || [],
        total: totalOrders || 0,
      },
      quotations: {
        pending: (pendingQuotations as Quotation[]) || [],
        total: totalQuotations || 0,
      },
      samples: {
        pending: (pendingSamples as DashboardSampleRequest[]) || [],
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
