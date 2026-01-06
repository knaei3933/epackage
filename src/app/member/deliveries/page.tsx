/**
 * Delivery Addresses Page
 *
 * 納品先住所一覧・管理ページ
 * - 住所一覧表示
 * - 新規作成・編集・削除
 * - デフォルト設定
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui';
import { DeliveryAddressForm } from '@/components/dashboard/DeliveryAddressForm';
import type { DeliveryAddress, DeliveryAddressFormData } from '@/types/dashboard';

// =====================================================
// API Client Functions
// =====================================================

async function fetchDeliveryAddresses(): Promise<DeliveryAddress[]> {
  const response = await fetch('/api/member/addresses/delivery', {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '住所の取得に失敗しました');
  }

  const result = await response.json();
  return result.data;
}

async function createDeliveryAddressAPI(formData: DeliveryAddressFormData): Promise<void> {
  const response = await fetch('/api/member/addresses/delivery', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '住所の作成に失敗しました');
  }
}

async function updateDeliveryAddressAPI(id: string, formData: DeliveryAddressFormData): Promise<void> {
  const response = await fetch(`/api/member/addresses/delivery/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '住所の更新に失敗しました');
  }
}

async function deleteDeliveryAddressAPI(id: string): Promise<void> {
  const response = await fetch(`/api/member/addresses/delivery/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '住所の削除に失敗しました');
  }
}

// =====================================================
// Page Component
// =====================================================

export default function DeliveryAddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 住所一覧を取得
  const fetchAddresses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchDeliveryAddresses();
      setAddresses(data);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
      setError('住所の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // 新規作成
  const handleCreate = async (formData: DeliveryAddressFormData) => {
    try {
      // Provide default value for isDefault
      const addressData = {
        ...formData,
        isDefault: formData.isDefault ?? false,
      };
      await createDeliveryAddressAPI(addressData);
      await fetchAddresses();
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to create address:', err);
      throw err;
    }
  };

  // 編集
  const handleUpdate = async (id: string, formData: DeliveryAddressFormData) => {
    try {
      // Provide default value for isDefault
      const addressData = {
        ...formData,
        isDefault: formData.isDefault ?? false,
      };
      await updateDeliveryAddressAPI(id, addressData);
      await fetchAddresses();
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update address:', err);
      throw err;
    }
  };

  // 削除
  const handleDelete = async (id: string) => {
    if (!confirm('この住所を削除してもよろしいですか？')) {
      return;
    }

    try {
      await deleteDeliveryAddressAPI(id);
      await fetchAddresses();
    } catch (err) {
      console.error('Failed to delete address:', err);
      setError('削除に失敗しました');
    }
  };

  // 編集中の住所を取得
  const editingAddress = addresses.find((a) => a.id === editingId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-text-muted">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">納品先住所</h1>
          <p className="text-text-muted mt-1">
            商品の納品先住所を管理できます
          </p>
        </div>
        {!isCreating && !editingId && (
          <Button variant="primary" onClick={() => setIsCreating(true)}>
            <span className="mr-2">+</span>新規追加
          </Button>
        )}
      </div>

      {/* エラーメッセージ */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {/* 新規作成フォーム */}
      {isCreating && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">新規納品先登録</h2>
          <DeliveryAddressForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreating(false)}
            submitLabel="登録する"
          />
        </Card>
      )}

      {/* 編集フォーム */}
      {editingId && editingAddress && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">納品先編集</h2>
          <DeliveryAddressForm
            address={editingAddress}
            onSubmit={(formData) => handleUpdate(editingId, formData)}
            onCancel={() => setEditingId(null)}
            submitLabel="更新する"
          />
        </Card>
      )}

      {/* 住所一覧 */}
      {!isCreating && !editingId && (
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-text-muted">
                納品先住所が登録されていません
              </p>
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => setIsCreating(true)}
              >
                最初の住所を登録
              </Button>
            </Card>
          ) : (
            addresses.map((address) => (
              <Card key={address.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* 住所名とデフォルトバッジ */}
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-lg font-semibold text-text-primary">
                        {address.name}
                      </h3>
                      {address.isDefault && (
                        <Badge variant="success" size="sm">
                          デフォルト
                        </Badge>
                      )}
                    </div>

                    {/* 住所詳細 */}
                    <div className="text-sm text-text-muted space-y-1">
                      <p>〒{address.postalCode}</p>
                      <p>
                        {address.prefecture} {address.city}
                        <br />
                        {address.address}
                        {address.building && (
                          <>
                            <br />
                            {address.building}
                          </>
                        )}
                      </p>
                      <p>TEL: {address.phone}</p>
                      {address.contactPerson && (
                        <p>担当者: {address.contactPerson}</p>
                      )}
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditingId(address.id)}
                    >
                      編集
                    </Button>
                    {!address.isDefault && addresses.length > 1 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDelete(address.id)}
                      >
                        削除
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
