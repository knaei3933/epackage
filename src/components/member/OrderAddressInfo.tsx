/**
 * Order Address Info Component
 *
 * 納品先・請求先情報コンポーネント
 * - 納品先と請求先の情報を表示
 * - 2列グリッドで配置
 * - モバイル: 1列、タブレット以上: 2列
 * - 編集ボタンで住所選択モーダルを開く
 *
 * @client
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { MapPin, CreditCard, Pencil, Plus } from 'lucide-react';
import type { Order } from '@/types/dashboard';
import { useRouter } from 'next/navigation';
import { AddressSelectModal, type DeliveryAddress, type BillingAddress } from './AddressSelectModal';

// =====================================================
// Types
// =====================================================

interface OrderAddressInfoProps {
  order: Order;
  isAdmin?: boolean; // 관리자 모드 여부
}

// =====================================================
// Main Component
// =====================================================

export function OrderAddressInfo({ order, isAdmin = false }: OrderAddressInfoProps) {
  const router = useRouter();
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [orderData, setOrderData] = useState(order);

  // 회원의 주소지 목록 상태 (관리자 모드에서 사용)
  const [memberAddresses, setMemberAddresses] = useState<{
    deliveryAddresses: any[];
    billingAddresses: any[];
  }>({ deliveryAddresses: [], billingAddresses: [] });

  // 관리자 모드에서 회원의 주소지 목록 로드
  useEffect(() => {
    if (isAdmin && orderData.userId) {
      fetchMemberAddresses();
    }
  }, [isAdmin, orderData.userId]);

  const fetchMemberAddresses = async () => {
    try {
      const response = await fetch(`/api/admin/users/${orderData.userId}/addresses`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMemberAddresses({
            deliveryAddresses: result.data.deliveryAddresses || [],
            billingAddresses: result.data.billingAddresses || [],
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch member addresses:', error);
    }
  };

  // 親から渡された order が変更されたときにローカルの orderData も更新
  useEffect(() => {
    setOrderData(order);
  }, [order]);

  const hasDeliveryAddress = orderData.deliveryAddress && Object.keys(orderData.deliveryAddress).length > 0 && orderData.deliveryAddress.id !== '';
  const hasBillingAddress = orderData.billingAddress && Object.keys(orderData.billingAddress).length > 0 && orderData.billingAddress.id !== '';

  // プロフィール由来の住所かどうかを判定
  const isDeliveryFromProfile = orderData.deliveryAddress && orderData.deliveryAddress.id === '';
  const isBillingFromProfile = orderData.billingAddress && orderData.billingAddress.id === '';

  // 住所を選択して注文に適用
  const handleSelectDeliveryAddress = async (address: DeliveryAddress) => {
    // 관리자 모드 또는 멤버 모드에 따른 API 엔드포인트
    const apiUrl = isAdmin
      ? `/api/admin/orders/${orderData.id}/delivery-address`
      : `/api/member/orders/${orderData.id}/delivery-address`;

    const response = await fetch(apiUrl, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliveryAddressId: address.id }),
    });

    if (!response.ok) {
      throw new Error('住所の更新に失敗しました');
    }

    // 注文データ를 업데이트 (관리자 모드에서는 전체 order 객체 반환)
    const { data } = await response.json();

    if (isAdmin) {
      // 관리자 모드: 전체 order 객체가 반환됨 - delivery_address만 업데이트
      setOrderData({
        ...orderData,
        deliveryAddress: data.deliveryAddress || data.order?.delivery_address,
      });
    } else {
      // 멤버 모드: deliveryAddress만 반환
      setOrderData({
        ...orderData,
        deliveryAddress: data.deliveryAddress,
        billingAddress: orderData.billingAddress,
      });
    }
  };

  const handleSelectBillingAddress = async (address: BillingAddress) => {
    // 관리자 모드 또는 멤버 모드에 따른 API 엔드포인트
    const apiUrl = isAdmin
      ? `/api/admin/orders/${orderData.id}/billing-address`
      : `/api/member/orders/${orderData.id}/billing-address`;

    const response = await fetch(apiUrl, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ billingAddressId: address.id }),
    });

    if (!response.ok) {
      throw new Error('住所の更新に失敗しました');
    }

    // 注文 데이터를 업데이트
    const { data } = await response.json();

    if (isAdmin) {
      // 관리자 모드
      setOrderData({
        ...orderData,
        billingAddress: data.billingAddress || data.order?.billing_address,
      });
    } else {
      // 멤버 모드
      setOrderData({
        ...orderData,
        billingAddress: data.billingAddress,
        deliveryAddress: orderData.deliveryAddress,
      });
    }
  };

  return (
    <>
      {/* 住所選択モーダル */}
      <AddressSelectModal
        isOpen={deliveryModalOpen}
        onClose={() => setDeliveryModalOpen(false)}
        type="delivery"
        currentAddress={orderData.deliveryAddress}
        onSelect={handleSelectDeliveryAddress}
        orderId={orderData.id}
        isAdmin={isAdmin}
        userId={orderData.userId}
        preloadedAddresses={isAdmin ? memberAddresses.deliveryAddresses : undefined}
      />
      <AddressSelectModal
        isOpen={billingModalOpen}
        onClose={() => setBillingModalOpen(false)}
        type="billing"
        currentAddress={orderData.billingAddress}
        onSelect={handleSelectBillingAddress}
        orderId={orderData.id}
        isAdmin={isAdmin}
        userId={orderData.userId}
        preloadedAddresses={isAdmin ? memberAddresses.billingAddresses : undefined}
      />

      <Card className="p-4">
        {/* ヘッダー: タイトルのみ（編集ボタンは各セクション内に配置） */}
        <div className="mb-4">
          <h3 className="font-semibold text-text-primary">住所情報</h3>
        </div>

        {/* 2列グリッドレイアウト: モバイル1列、タブレット以上2列 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 納品先 */}
          {orderData.deliveryAddress && Object.keys(orderData.deliveryAddress).length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-border-secondary">
                <h4 className="font-medium text-text-primary flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  納品先
                  {isDeliveryFromProfile && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">プロフィール由来</span>
                  )}
                </h4>
                {!isDeliveryFromProfile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeliveryModalOpen(true)}
                    className="text-xs h-7 px-2"
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    変更
                  </Button>
                )}
              </div>
              <div className="text-sm space-y-1">
                <p className="font-medium text-text-primary">
                  {orderData.deliveryAddress!.name}
                </p>
                <p className="text-text-muted">
                  〒{orderData.deliveryAddress!.postalCode}
                </p>
                <p className="text-text-muted">
                  {orderData.deliveryAddress!.prefecture} {orderData.deliveryAddress!.city}
                  <br />
                  {orderData.deliveryAddress!.address}
                  {orderData.deliveryAddress!.building && (
                    <>
                      <br />
                      {orderData.deliveryAddress!.building}
                    </>
                  )}
                </p>
                <p className="text-text-muted">
                  TEL: {orderData.deliveryAddress!.phone}
                </p>
                {orderData.deliveryAddress!.contactPerson && (
                  <p className="text-text-muted">
                    担当者: {orderData.deliveryAddress!.contactPerson}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-border-secondary rounded">
              <MapPin className="w-8 h-8 mx-auto text-text-muted mb-2" />
              <p className="text-sm text-text-muted mb-3">納品先住所が未登録です</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/member/deliveries')}
                className="inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                登録する
              </Button>
            </div>
          )}

          {/* 請求先 */}
          {orderData.billingAddress && Object.keys(orderData.billingAddress).length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-border-secondary">
                <h4 className="font-medium text-text-primary flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  請求先
                  {isBillingFromProfile && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">プロフィール由来</span>
                  )}
                </h4>
                {!isBillingFromProfile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setBillingModalOpen(true)}
                    className="text-xs h-7 px-2"
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    変更
                  </Button>
                )}
              </div>
              <div className="text-sm space-y-1">
                <p className="font-medium text-text-primary">
                  {orderData.billingAddress!.companyName}
                </p>
                <p className="text-text-muted">
                  〒{orderData.billingAddress!.postalCode}
                </p>
                <p className="text-text-muted">
                  {orderData.billingAddress!.prefecture} {orderData.billingAddress!.city}
                  <br />
                  {orderData.billingAddress!.address}
                  {orderData.billingAddress!.building && (
                    <>
                      <br />
                      {orderData.billingAddress!.building}
                    </>
                  )}
                </p>
                {orderData.billingAddress!.taxNumber && (
                  <p className="text-text-muted">
                    法人番号: {orderData.billingAddress!.taxNumber}
                  </p>
                )}
                {orderData.billingAddress!.email && (
                  <p className="text-text-muted">
                    メール: {orderData.billingAddress!.email}
                  </p>
                )}
                {orderData.billingAddress!.phone && (
                  <p className="text-text-muted">
                    TEL: {orderData.billingAddress!.phone}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-border-secondary rounded">
              <CreditCard className="w-8 h-8 mx-auto text-text-muted mb-2" />
              <p className="text-sm text-text-muted mb-3">請求先住所が未登録です</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/member/billing-addresses')}
                className="inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                登録する
              </Button>
            </div>
          )}
        </div>
      </Card>
    </>
  );
}
