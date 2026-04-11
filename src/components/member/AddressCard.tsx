/**
 * AddressCard Component
 *
 * 汎用住所カードコンポーネント
 * - 納品先/請求先住所の表示
 * - 編集/削除ボタン
 * - デフォルト設定の表示
 */

import React from 'react';
import { Card, Button } from '@/components/ui';
import { MapPin, Edit2, Trash2, Star } from 'lucide-react';

export interface AddressData {
  id: string;
  name?: string;
  postalCode?: string;
  prefecture?: string;
  city?: string;
  address?: string;
  building?: string;
  phone?: string;
  companyName?: string;
  isDefault?: boolean;
}

export interface AddressCardProps {
  address: AddressData;
  type?: 'delivery' | 'billing' | 'general';
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
  showActions?: boolean;
}

export function AddressCard({
  address,
  type = 'general',
  onEdit,
  onDelete,
  onSetDefault,
  showActions = true,
}: AddressCardProps) {
  const formatAddress = () => {
    const parts = [
      address.postalCode,
      address.prefecture,
      address.city,
      address.address,
      address.building,
    ].filter(Boolean);
    return parts.join(' ');
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-text-muted flex-shrink-0" />
            {address.isDefault && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded">
                <Star className="w-3 h-3" />
                デフォルト
              </span>
            )}
            {type === 'billing' && address.companyName && (
              <h3 className="font-semibold text-text-primary">
                {address.companyName}
              </h3>
            )}
            {type !== 'billing' && address.name && (
              <h3 className="font-semibold text-text-primary">
                {address.name}
              </h3>
            )}
          </div>

          <div className="space-y-1 text-sm text-text-muted">
            <p>〒{address.postalCode || '-'}</p>
            <p>{formatAddress() || '-'}</p>
            {address.phone && (
              <p>TEL: {address.phone}</p>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex flex-col gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(address.id)}
              >
                <Edit2 className="w-4 h-4 mr-1" />
                編集
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(address.id)}
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                削除
              </Button>
            )}
            {onSetDefault && !address.isDefault && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSetDefault(address.id)}
              >
                <Star className="w-4 h-4 mr-1" />
                デフォルト設定
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
