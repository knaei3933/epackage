/**
 * Address Select Modal Component
 *
 * 住所選択モーダルコンポーネント
 * - 保存済みの住所一覧を表示
 * - 選択した住所を注文に適用
 *
 * @client
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { MapPin, CreditCard, Check } from 'lucide-react';

// =====================================================
// Types
// =====================================================

export interface DeliveryAddress {
  id: string;
  name: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  building?: string;
  phone: string;
  contactPerson?: string;
  isDefault?: boolean;
}

export interface BillingAddress {
  id: string;
  companyName: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  building?: string;
  taxNumber?: string;
  email?: string;
  phone?: string;
  isDefault?: boolean;
}

interface AddressSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'delivery' | 'billing';
  currentAddress?: DeliveryAddress | BillingAddress | null;
  onSelect: (address: DeliveryAddress | BillingAddress) => Promise<void>;
  orderId: string;
  isAdmin?: boolean;  // 관리자 모드 여부
  userId?: string;     // 관리자 모드에서 회원 ID 전달
  preloadedAddresses?: (DeliveryAddress | BillingAddress)[];  // 미리 로드된 주소지 목록
}

// =====================================================
// Main Component
// =====================================================

export function AddressSelectModal({
  isOpen,
  onClose,
  type,
  currentAddress,
  onSelect,
  orderId,
  isAdmin = false,
  userId,
  preloadedAddresses,
}: AddressSelectModalProps) {
  const [addresses, setAddresses] = useState<(DeliveryAddress | BillingAddress)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 住所一覧を取得
  useEffect(() => {
    if (!isOpen) return;

    // 미리 로드된 주소지가 있으면 사용
    if (preloadedAddresses && preloadedAddresses.length > 0) {
      setAddresses(preloadedAddresses);
      if (currentAddress && currentAddress.id) {
        setSelectedId(currentAddress.id);
      }
      return;
    }

    const fetchAddresses = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let endpoint: string;

        if (isAdmin && userId) {
          // 관리자 모드: 회원의 주소지 목록 가져오기
          endpoint = `/api/admin/users/${userId}/addresses`;
        } else {
          // 멤버 모드: 자신의 주소지 목록
          endpoint = type === 'delivery'
            ? '/api/member/addresses/delivery'
            : '/api/member/addresses/billing';
        }

        const response = await fetch(endpoint, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('住所の取得に失敗しました');
        }

        const result = await response.json();

        // 관리자 API와 멤버 API의 응답 구조가 다름
        if (isAdmin) {
          // 관리자 API: { success: true, data: { deliveryAddresses, billingAddresses } }
          const addressData = type === 'delivery'
            ? result.data.deliveryAddresses || []
            : result.data.billingAddresses || [];
          setAddresses(addressData);
        } else {
          // 멤버 API: { data: [...] }
          setAddresses(result.data || []);
        }

        // 現在選択中の住所をセット
        if (currentAddress && currentAddress.id) {
          setSelectedId(currentAddress.id);
        }
      } catch (err) {
        console.error('Failed to fetch addresses:', err);
        setError('住所の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, [isOpen, type, currentAddress, isAdmin, userId, preloadedAddresses]);

  // 住所を選択して適用
  const handleSelect = async () => {
    if (!selectedId) return;

    const selectedAddress = addresses.find((a) => a.id === selectedId);
    if (!selectedAddress) return;

    setIsSaving(true);
    setError(null);

    try {
      await onSelect(selectedAddress);
      onClose();
    } catch (err) {
      console.error('Failed to update address:', err);
      setError('住所の更新に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const title = type === 'delivery' ? '納品先を選択' : '請求先を選択';
  const Icon = type === 'delivery' ? MapPin : CreditCard;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="p-6 border-b border-border-secondary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary"
              disabled={isSaving}
            >
              ✕
            </button>
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* 住所一覧 */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="ml-4 text-text-muted">読み込み中...</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-12">
              <Icon className="w-12 h-12 mx-auto text-text-muted mb-4" />
              <p className="text-text-muted mb-4">
                {type === 'delivery' ? '納品先' : '請求先'}が登録されていません
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  onClose();
                  window.location.href = type === 'delivery' ? '/member/deliveries' : '/member/billing-addresses';
                }}
              >
                {type === 'delivery' ? '納品先を登録' : '請求先を登録'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  onClick={() => setSelectedId(address.id)}
                  disabled={isSaving}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedId === address.id
                      ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/30'
                      : 'border-border-secondary hover:border-primary/50 hover:bg-gray-50'
                  } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* 選択インジケーター - ラジオボタン形式（色付き） */}
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedId === address.id
                        ? 'border-primary'
                        : 'border-gray-400'
                    }`}>
                      {selectedId === address.id && (
                        <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                      )}
                    </div>

                    {/* 住所情報 */}
                    <div className="flex-1 min-w-0">
                      {'name' in address ? (
                        // DeliveryAddress
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <p className={`font-semibold text-base ${selectedId === address.id ? 'text-primary' : 'text-text-primary'}`}>{address.name}</p>
                            {address.isDefault && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded whitespace-nowrap">
                                デフォルト
                              </span>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-text-muted">
                              <span className="font-medium">〒</span>{address.postalCode}
                            </p>
                            <p className="text-sm text-text-muted">
                              {address.prefecture} {address.city}
                            </p>
                            <p className="text-sm text-text-muted">
                              {address.address}
                              {address.building && ` ${address.building}`}
                            </p>
                            <p className="text-sm text-text-muted">
                              <span className="font-medium">TEL:</span> {address.phone}
                            </p>
                            {address.contactPerson && (
                              <p className="text-sm text-text-muted">
                                <span className="font-medium">担当者:</span> {address.contactPerson}
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        // BillingAddress
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <p className={`font-semibold text-base ${selectedId === address.id ? 'text-primary' : 'text-text-primary'}`}>{address.companyName}</p>
                            {address.isDefault && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded whitespace-nowrap">
                                デフォルト
                              </span>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-text-muted">
                              <span className="font-medium">〒</span>{address.postalCode}
                            </p>
                            <p className="text-sm text-text-muted">
                              {address.prefecture} {address.city}
                            </p>
                            <p className="text-sm text-text-muted">
                              {address.address}
                              {address.building && ` ${address.building}`}
                            </p>
                            {address.taxNumber && (
                              <p className="text-sm text-text-muted">
                                <span className="font-medium">法人番号:</span> {address.taxNumber}
                              </p>
                            )}
                            {address.email && (
                              <p className="text-sm text-text-muted">
                                <span className="font-medium">メール:</span> {address.email}
                              </p>
                            )}
                            {address.phone && (
                              <p className="text-sm text-text-muted">
                                <span className="font-medium">TEL:</span> {address.phone}
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="p-6 border-t border-border-secondary flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            キャンセル
          </Button>
          <Button
            variant="primary"
            onClick={handleSelect}
            disabled={!selectedId || isSaving}
          >
            {isSaving ? '保存中...' : '選択した住所を適用'}
          </Button>
        </div>
      </div>
    </div>
  );
}
