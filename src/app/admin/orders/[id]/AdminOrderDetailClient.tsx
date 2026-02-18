/**
 * Admin Order Detail Client Component
 *
 * 管理者注文詳細クライアントコンポーネント
 * - 注文基本情報表示
 * - 商品明細（仕様・オプション詳細表示）
 * - メモ更新機能
 * - 韓国パートナー送信機能
 * - AdminOrderWorkflowTabsを表示
 *
 * @client
 */

'use client';

import { useState, useEffect } from 'react';
import { AdminOrderWorkflowTabs } from '@/components/admin/AdminOrderWorkflowTabs';
import { OrderStatusBadge, OrderStatusTimeline } from '@/components/orders';
import { OrderInfoAccordion, OrderItemsSummary, OrderAddressInfo } from '@/components/member';
import { AdminOrderItemsEditor } from '@/components/admin/AdminOrderItemsEditor';
import { EmailComposer, type Recipient } from '@/components/admin/EmailComposer';
import { adminFetch } from '@/lib/auth-client';
import type { Order as DashboardOrder } from '@/types/dashboard';
import { getMaterialSpecification, MATERIAL_THICKNESS_OPTIONS } from '@/lib/unified-pricing-engine';
import { Package, User, Calendar, MapPin, CreditCard, FileText, AlertCircle, CheckCircle, XCircle, Mail } from 'lucide-react';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  specifications?: any;
}

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  quotation_id?: string;
  status: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  delivery_address?: any;
  billing_address?: any;
  delivery_address_id?: string;
  billing_address_id?: string;
  requested_delivery_date?: string;
  estimated_delivery_date?: string;
  delivery_notes?: string;
  notes?: string;
  payment_term?: 'credit' | 'advance';
  created_at: string;
  updated_at: string;
  shipped_at?: string;
  delivered_at?: string;
  items?: OrderItem[];
  manual_discount_percentage?: number;
  manual_discount_amount?: number;
}

interface AdminOrderDetailClientProps {
  orderId: string;
  initialOrder: Order | null;
  initialStatusHistory?: any[];
  initialAdminNotes?: string;
}

// ============================================================
// Admin Order (snake_case) → DashboardOrder (camelCase) 변환
// ============================================================

function mapAdminOrderToDashboardOrder(adminOrder: Order): DashboardOrder {
  // delivery_address snake_case → camelCase 변환
  const deliveryAddress = adminOrder.delivery_address ? {
    id: adminOrder.delivery_address.id,
    name: adminOrder.delivery_address.name,
    postalCode: adminOrder.delivery_address.postal_code,
    prefecture: adminOrder.delivery_address.prefecture,
    city: adminOrder.delivery_address.city,
    address: adminOrder.delivery_address.address,
    building: adminOrder.delivery_address.building,
    phone: adminOrder.delivery_address.phone,
    contactPerson: adminOrder.delivery_address.contact_person,
    isDefault: adminOrder.delivery_address.is_default,
  } : undefined;

  // billing_address snake_case → camelCase 변환
  const billingAddress = adminOrder.billing_address ? {
    id: adminOrder.billing_address.id,
    companyName: adminOrder.billing_address.company_name,
    postalCode: adminOrder.billing_address.postal_code,
    prefecture: adminOrder.billing_address.prefecture,
    city: adminOrder.billing_address.city,
    address: adminOrder.billing_address.address,
    building: adminOrder.billing_address.building,
    taxNumber: adminOrder.billing_address.tax_number,
    email: adminOrder.billing_address.email,
    phone: adminOrder.billing_address.phone,
    isDefault: adminOrder.billing_address.is_default,
  } : undefined;

  return {
    id: adminOrder.id,
    userId: adminOrder.user_id,
    orderNumber: adminOrder.order_number,
    status: adminOrder.status as any,
    totalAmount: adminOrder.total_amount,
    subtotal: adminOrder.subtotal,
    taxAmount: adminOrder.tax_amount,
    createdAt: adminOrder.created_at,
    updatedAt: adminOrder.updated_at,
    shippedAt: adminOrder.shipped_at,
    deliveredAt: adminOrder.delivered_at,
    customer_name: adminOrder.customer_name,
    customer_email: adminOrder.customer_email,
    customer_phone: adminOrder.customer_phone,
    // items 매핑
    items: adminOrder.items?.map(item => ({
      id: item.id,
      productId: item.id,
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
      specifications: item.specifications,
    })) || [],
    // 주소 정보 (camelCase로 변환)
    deliveryAddress,
    billingAddress,
    // 기타 필드
    notes: adminOrder.notes,
    requested_delivery_date: adminOrder.requested_delivery_date,
    estimated_delivery_date: adminOrder.estimated_delivery_date,
    delivery_notes: adminOrder.delivery_notes,
    // 수동 할인 필드
    manualDiscountPercentage: adminOrder.manual_discount_percentage,
    manualDiscountAmount: adminOrder.manual_discount_amount,
  };
}

// 後加工オプションの日本語マッピング
const POST_PROCESSING_LABELS: Record<string, string> = {
  'corner-round': '角丸め',
  'glossy': '光沢仕上げ',
  'matte': 'マット仕上げ',
  'hang-hole-6mm': '吊り穴(6mm)',
  'hang-hole-10mm': '吊り穴(10mm)',
  'notch-yes': 'ノッチあり',
  'notch-no': 'ノッチなし',
  'top-open': '上部開放',
  'side-open': '横開放',
  'bottom-open': '下部開放',
  'valve-yes': 'バルブあり',
  'valve-no': 'バルブなし',
  'zipper-yes': 'チャック付き',
  'zipper-no': 'チャックなし',
};

// 素材の日本語マッピング
const MATERIAL_LABELS: Record<string, string> = {
  'pet_al': 'PET/AL (アルミ箔ラミネート)',
  'pet_pe': 'PET/PE',
  'cpp': 'CPP (未延伸ポリプロピレン)',
  'lldpe': 'LLDPE (直鎖状低密度ポリエチレン)',
};

// 袋タイプの日本語マッピング
const BAG_TYPE_LABELS: Record<string, string> = {
  'flat_pouch': 'ピロー袋',
  'flat_3_side': '三方シール平袋',
  'stand_up': 'スタンドアップパウチ',
  'zipper': 'チャック付袋',
};

// 厚さの日本語マッピング
const THICKNESS_LABELS: Record<string, string> = {
  'thin': '薄い',
  'medium': '標準',
  'thick': '厚い',
};

// 納期の日本語マッピング
const URGENCY_LABELS: Record<string, string> = {
  'standard': '標準',
  'urgent': '至急',
};

// 配送先の日本語マッピング
const DELIVERY_LOCATION_LABELS: Record<string, string> = {
  'domestic': '国内',
  'international': '海外',
};

// デフォルトエクスポート
export default function AdminOrderDetailClient({
  orderId,
  initialOrder,
  initialStatusHistory,
  initialAdminNotes = '',
}: AdminOrderDetailClientProps) {
  const [adminNotes, setAdminNotes] = useState(initialAdminNotes);
  const [sendingToKorea, setSendingToKorea] = useState(false);
  const [koreaMessage, setKoreaMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 商品明細更新後に注文データを再取得
  const [currentOrder, setCurrentOrder] = useState(initialOrder);

  // Email composer state
  const [emailComposerOpen, setEmailComposerOpen] = useState(false);
  const [selectedCustomersForEmail, setSelectedCustomersForEmail] = useState<Recipient[]>([]);

  const handleAdminNotesChange = (notes: string) => {
    setAdminNotes(notes);
  };

  // 商品明細更新後のリロードハンドラー
  const handleItemsUpdated = async () => {
    // 注文データを再取得
    try {
      const response = await adminFetch(`/api/admin/orders/${orderId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.order) {
          setCurrentOrder(result.order);
        }
      }
    } catch (error) {
      console.error('Failed to refresh order data:', error);
    }
  };

  const handleUpdateNotes = async () => {
    try {
      setSendingToKorea(true);

      const response = await adminFetch(`/api/admin/orders/${orderId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: adminNotes }),
      });

      const result = await response.json();

      if (result.success) {
        setKoreaMessage({ type: 'success', text: 'メモを更新しました' });
      } else {
        setKoreaMessage({ type: 'error', text: result.error || 'メモの更新に失敗しました' });
      }
    } catch (error) {
      console.error('Failed to update notes:', error);
      setKoreaMessage({ type: 'error', text: 'メモの更新に失敗しました' });
    } finally {
      setSendingToKorea(false);
    }

    setTimeout(() => setKoreaMessage(null), 3000);
  };

  const handleSendToKorea = async () => {
    try {
      setSendingToKorea(true);
      setKoreaMessage(null);

      const response = await adminFetch(`/api/admin/orders/${orderId}/notes`, {
        method: 'PUT',
      });

      const result = await response.json();

      if (result.success) {
        setKoreaMessage({ type: 'success', text: '韓国パートナーに送信しました (info@kanei-trade.co.jp)' });
      } else {
        setKoreaMessage({ type: 'error', text: result.error || '送信に失敗しました' });
      }
    } catch (error) {
      console.error('Failed to send to Korea:', error);
      setKoreaMessage({ type: 'error', text: '送信に失敗しました' });
    } finally {
      setSendingToKorea(false);
    }

    setTimeout(() => setKoreaMessage(null), 5000);
  };

  // Handle sending email to customer
  const handleSendEmail = () => {
    if (!order?.customer_email) {
      alert('顧客メールアドレスが見つかりません');
      return;
    }

    const recipient: Recipient = {
      id: order.user_id,
      email: order.customer_email,
      name: order.customer_name,
    };

    setSelectedCustomersForEmail([recipient]);
    setEmailComposerOpen(true);
  };

  const order = currentOrder;

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500">注文が見つかりません。</p>
          </div>
        </div>
      </div>
    );
  }

  // Admin Order → DashboardOrder 변환 (snake_case → camelCase)
  const dashboardOrder = mapAdminOrderToDashboardOrder(order);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" />
                注文詳細: {order.order_number}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                注文ID: {order.id}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSendEmail}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                title="顧客にメールを送信"
              >
                <Mail className="w-4 h-4" />
                メール送信
              </button>
              <OrderStatusBadge status={order.status} locale="ja" />
            </div>
          </div>
        </div>

        {/* キャンセルリクエスト承認UI */}
        <CancellationRequestBanner
          orderId={orderId}
          onRequestProcessed={() => window.location.reload()}
        />

        {/* 注文基本情報 - 統合UI */}
        <OrderInfoAccordion
          order={dashboardOrder}
          statusHistory={initialStatusHistory || []}
        />

        {/* 商品明細と配送・請求先（2列グリッド） */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 商品明細 - 管理者用編集機能付き */}
          <AdminOrderItemsEditor
            order={dashboardOrder}
            editable={true}
            onUpdate={handleItemsUpdated}
          />

          {/* 納品先・請求先 */}
          <OrderAddressInfo order={dashboardOrder} isAdmin={true} />
        </div>

        {/* Koreaメッセージ */}
        {koreaMessage && (
          <div className={`p-4 rounded-lg ${
            koreaMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {koreaMessage.text}
          </div>
        )}

        {/* ワークフロータブ */}
        <AdminOrderWorkflowTabs
          order={dashboardOrder}
          orderId={orderId}
          adminNotes={adminNotes}
          onAdminNotesChange={handleAdminNotesChange}
          onUpdateNotes={handleUpdateNotes}
          onSendToKorea={handleSendToKorea}
          sendingToKorea={sendingToKorea}
          koreaMessage={koreaMessage}
        />

        {/* Email Composer Modal */}
        <EmailComposer
          open={emailComposerOpen}
          onOpenChange={setEmailComposerOpen}
          recipients={selectedCustomersForEmail}
          defaultSubject={`【Epackage Lab】注文 ${order.order_number} について`}
          onSuccess={() => {
            // Optional: Refresh order data or show success message
            console.log('Email sent successfully');
          }}
        />
      </div>
    </div>
  );
}

// ============================================================
// Cancellation Request Banner Component
// ============================================================

interface CancellationRequestBannerProps {
  orderId: string;
  onRequestProcessed: () => void;
}

function CancellationRequestBanner({
  orderId,
  onRequestProcessed,
}: CancellationRequestBannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [requestDetails, setRequestDetails] = useState<any>(null);

  // Fetch cancellation request details on mount
  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const response = await adminFetch(`/api/admin/orders/${orderId}/cancellation`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data.cancellationNote) {
            setRequestDetails(result.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch cancellation request details:', error);
      }
    };
    fetchRequestDetails();
  }, [orderId]);

  const handleApprove = async () => {
    const confirmed = confirm('キャンセルリクエストを承認しますか？\n\n注文がキャンセルされます。');
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const response = await adminFetch(`/api/admin/orders/${orderId}/cancellation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', adminNote }),
      });

      const result = await response.json();
      if (result.success) {
        alert('キャンセルを承認しました');
        onRequestProcessed();
      } else {
        alert(result.error || '承認に失敗しました');
      }
    } catch (error) {
      console.error('Failed to approve cancellation:', error);
      alert('承認に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    const confirmed = confirm('キャンセルリクエストを拒否しますか？\n\n注文ステータスが元に戻ります。');
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const response = await adminFetch(`/api/admin/orders/${orderId}/cancellation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', adminNote }),
      });

      const result = await response.json();
      if (result.success) {
        alert('キャンセルリクエストを拒否しました');
        onRequestProcessed();
      } else {
        alert(result.error || '拒否に失敗しました');
      }
    } catch (error) {
      console.error('Failed to reject cancellation:', error);
      alert('拒否に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // If no cancellation request, don't show banner
  if (!requestDetails || !requestDetails.cancellationNote) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm p-6">
      <div className="flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            キャンセルリクエストが承認待ちです
          </h3>

          {requestDetails && (
            <div className="space-y-3 text-sm text-yellow-800">
              <div>
                <span className="font-medium">注文番号:</span>{' '}
                {requestDetails.order?.order_number}
              </div>

              {requestDetails.order?.created_at && (
                <div>
                  <span className="font-medium">注文日時:</span>{' '}
                  {new Date(requestDetails.order.created_at).toLocaleString('ja-JP')}
                </div>
              )}

              {requestDetails.cancellationNote && (
                <div>
                  <span className="font-medium">キャンセル理由:</span>{' '}
                  {requestDetails.cancellationNote.notes?.split('\n')?.[1]?.replace('理由: ', '') || '-'}
                </div>
              )}

              {requestDetails.requester && (
                <div>
                  <span className="font-medium">注文者:</span>{' '}
                  {requestDetails.requester.kanji_last_name} {requestDetails.requester.kanji_first_name}
                  ({requestDetails.requester.email})
                </div>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start">
            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-sm font-medium text-yellow-900 mb-1">
                管理者メモ（任意）
              </label>
              <input
                type="text"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="承認・拒否のメモを入力..."
                className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
              />
            </div>

            <div className="flex gap-2 mt-4 sm:mt-6">
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <CheckCircle className="w-4 h-4" />
                {isProcessing ? '処理中...' : '承認（キャンセル）'}
              </button>

              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <XCircle className="w-4 h-4" />
                {isProcessing ? '処理中...' : '拒否（継続）'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
