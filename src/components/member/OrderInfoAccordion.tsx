/**
 * Order Info Accordion Component
 *
 * 注文情報アコーディオンコンポーネント
 * - 注文情報、顧客情報、納品先、請求先を統合して表示
 * - モバイル: 縦積み、タブレット以上: グリッドレイアウト
 * - ステータス履歴は別セクションとして展開表示
 *
 * @client
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { OrderStatusTimeline } from '@/components/orders/OrderStatusTimeline';
import { OrderStatusBadge } from '@/components/orders';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Package,
  FileText,
  MapPin,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Pencil,
} from 'lucide-react';
import type { Order } from '@/types/dashboard';
import { AddressSelectModal, type DeliveryAddress, type BillingAddress } from './AddressSelectModal';
import { useRouter } from 'next/navigation';

// =====================================================
// Types
// =====================================================

interface OrderInfoAccordionProps {
  order: Order;
  statusHistory: any[];
}

// =====================================================
// Helper Functions
// =====================================================

function isValidDate(date: any): date is string | number | Date {
  if (!date) return false;
  const d = new Date(date);
  return !isNaN(d.getTime());
}

function formatDate(date: any, format: 'full' | 'relative' = 'full'): string {
  if (!isValidDate(date)) {
    return '不明';
  }
  const d = new Date(date);
  if (format === 'full') {
    return d.toLocaleString('ja-JP');
  }
  try {
    return formatDistanceToNow(d, { addSuffix: true, locale: ja });
  } catch {
    return d.toLocaleString('ja-JP');
  }
}

// =====================================================
// Sub-Component: Address Section
// =====================================================

interface AddressSectionProps {
  title: string;
  icon: React.ReactNode;
  address: {
    name?: string;
    companyName?: string;
    postalCode?: string;
    prefecture?: string;
    city?: string;
    address?: string;
    building?: string;
    phone?: string;
    email?: string;
    contactPerson?: string;
    taxNumber?: string;
    id?: string;
  };
  onEdit?: () => void;
  canEdit?: boolean;
}

function AddressSection({ title, icon, address, onEdit, canEdit = false }: AddressSectionProps) {
  if (!address || Object.keys(address).length === 0 || (address.id === '' && !address.name)) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-300">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            {icon}
          </div>
          <h4 className="font-bold text-gray-900">{title}</h4>
        </div>
        {canEdit && onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 px-2 text-xs">
            <Pencil className="w-3 h-3 mr-1" />
            変更
          </Button>
        )}
      </div>
      <div className="text-sm space-y-1">
        <p className="font-semibold text-gray-900">
          {address.companyName || address.name}
        </p>
        {address.postalCode && (
          <p className="text-gray-700">〒{address.postalCode}</p>
        )}
        {(address.prefecture || address.city || address.address) && (
          <p className="text-gray-700">
            {address.prefecture} {address.city}
            {address.address && <>{address.address}</>}
          </p>
        )}
        {address.building && (
          <p className="text-gray-700">{address.building}</p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {address.phone && (
            <p className="text-gray-600">
              <span className="font-medium">TEL:</span> {address.phone}
            </p>
          )}
          {address.email && (
            <p className="text-gray-600">
              <span className="font-medium">メール:</span> {address.email}
            </p>
          )}
          {address.contactPerson && (
            <p className="text-gray-600">
              <span className="font-medium">担当者:</span> {address.contactPerson}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Main Component
// =====================================================

export function OrderInfoAccordion({ order, statusHistory }: OrderInfoAccordionProps) {
  const router = useRouter();
  const [statusHistoryExpanded, setStatusHistoryExpanded] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [billingModalOpen, setBillingModalOpen] = useState(false);

  // 住所編集ハンドラー
  const handleEditDelivery = () => setDeliveryModalOpen(true);
  const handleEditBilling = () => setBillingModalOpen(true);

  return (
    <>
      {/* Address Modals */}
      <AddressSelectModal
        isOpen={deliveryModalOpen}
        onClose={() => setDeliveryModalOpen(false)}
        type="delivery"
        currentAddress={order.deliveryAddress}
        onSelect={async (address) => {
          const response = await fetch(`/api/member/orders/${order.id}/delivery-address`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deliveryAddressId: address.id }),
          });
          if (response.ok) {
            window.location.reload();
          }
        }}
        orderId={order.id}
        userId={order.userId}
      />
      <AddressSelectModal
        isOpen={billingModalOpen}
        onClose={() => setBillingModalOpen(false)}
        type="billing"
        currentAddress={order.billingAddress}
        onSelect={async (address) => {
          const response = await fetch(`/api/member/orders/${order.id}/billing-address`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ billingAddressId: address.id }),
          });
          if (response.ok) {
            window.location.reload();
          }
        }}
        orderId={order.id}
        userId={order.userId}
      />

      <Card className="p-6 shadow-sm">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

          {/* Left Column: Order & Customer Info */}
          <div className="space-y-4">
            {/* Header with Status Badge */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-gray-200">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg text-gray-900">注文情報</h3>
              </div>
              <OrderStatusBadge status={order.status} locale="ja" size="sm" />
            </div>

            {/* Order Details */}
            <dl className="space-y-2 text-sm">
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <dt className="text-gray-600 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  注文日
                </dt>
                <dd className="text-gray-900">
                  {formatDate(order.createdAt, 'full')}
                  <span className="text-gray-500 ml-2">
                    ({formatDate(order.createdAt, 'relative')})
                  </span>
                </dd>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <dt className="text-gray-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  最終更新
                </dt>
                <dd className="text-gray-900">
                  {formatDate(order.updatedAt, 'full')}
                </dd>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <dt className="text-gray-600 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  注文番号
                </dt>
                <dd className="text-gray-900 font-medium">{order.orderNumber}</dd>
              </div>
            </dl>

            {/* Customer Info */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                <User className="w-4 h-4 text-gray-600" />
                <h4 className="font-semibold text-gray-800">顧客情報</h4>
              </div>
              <dl className="space-y-1 text-sm">
                {order.customer_name && (
                  <div className="grid grid-cols-[80px_1fr] gap-2">
                    <dt className="text-gray-600">お名前</dt>
                    <dd className="text-gray-900">{order.customer_name}</dd>
                  </div>
                )}
                {order.customer_email && (
                  <div className="grid grid-cols-[80px_1fr] gap-2">
                    <dt className="text-gray-600 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                    </dt>
                    <dd className="text-gray-900 break-all">{order.customer_email}</dd>
                  </div>
                )}
                {order.customer_phone && (
                  <div className="grid grid-cols-[80px_1fr] gap-2">
                    <dt className="text-gray-600 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                    </dt>
                    <dd className="text-gray-900">{order.customer_phone}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Middle Column: Delivery Address */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-gray-200">
              <MapPin className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-lg text-gray-900">納品先</h3>
            </div>

            {order.deliveryAddress && Object.keys(order.deliveryAddress).length > 0 && order.deliveryAddress.id !== '' ? (
              <AddressSection
                title=""
                icon={<MapPin className="w-4 h-4 text-white" />}
                address={order.deliveryAddress}
                onEdit={handleEditDelivery}
                canEdit={order.deliveryAddress.id !== ''}
              />
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 mb-3">納品先住所が未登録です</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/member/deliveries')}
                  className="inline-flex items-center gap-1"
                >
                  登録する
                </Button>
              </div>
            )}
          </div>

          {/* Right Column: Billing Address */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-gray-200">
              <CreditCard className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-lg text-gray-900">請求先</h3>
            </div>

            {order.billingAddress && Object.keys(order.billingAddress).length > 0 && order.billingAddress.id !== '' ? (
              <AddressSection
                title=""
                icon={<CreditCard className="w-4 h-4 text-white" />}
                address={order.billingAddress}
                onEdit={handleEditBilling}
                canEdit={order.billingAddress.id !== ''}
              />
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 mb-3">請求先住所が未登録です</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/member/billing-addresses')}
                  className="inline-flex items-center gap-1"
                >
                  登録する
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Status History Expandable Section */}
        <div className="mt-6 pt-6 border-t-2 border-gray-200">
          <button
            onClick={() => setStatusHistoryExpanded(!statusHistoryExpanded)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <h3 className="font-bold text-gray-900">ステータス履歴</h3>
                <p className="text-sm text-gray-600">{statusHistory.length}件の履歴</p>
              </div>
            </div>
            {statusHistoryExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {statusHistoryExpanded && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
              <OrderStatusTimeline
                statusHistory={statusHistory}
                currentStatus={order.status}
              />
            </div>
          )}
        </div>
      </Card>
    </>
  );
}
