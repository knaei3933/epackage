/**
 * Delivery Address Form Component
 *
 * 納品先住所フォームコンポーネント
 * - 新規作成・編集フォーム
 * - バリデーション
 * - デフォルト設定
 */

'use client';

import { useState } from 'react';
import { Card, Input, Button } from '@/components/ui';
import type { DeliveryAddress, DeliveryAddressFormData } from '@/types/dashboard';

// =====================================================
// Types
// =====================================================

export interface DeliveryAddressFormProps {
  address?: DeliveryAddress;
  onSubmit: (data: DeliveryAddressFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

// =====================================================
// Component
// =====================================================

export function DeliveryAddressForm({
  address,
  onSubmit,
  onCancel,
  submitLabel = '保存する',
}: DeliveryAddressFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<DeliveryAddressFormData>({
    name: address?.name || '',
    postalCode: address?.postalCode || '',
    prefecture: address?.prefecture || '',
    city: address?.city || '',
    address: address?.address || '',
    building: address?.building || '',
    phone: address?.phone || '',
    contactPerson: address?.contactPerson || '',
    isDefault: address?.isDefault || false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DeliveryAddressFormData, string>>>({});

  // 都道府県リスト
  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
  ];

  // バリデーション
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof DeliveryAddressFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = '納品先名を入力してください';
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = '郵便番号を入力してください';
    } else if (!/^\d{3}-\d{4}$/.test(formData.postalCode)) {
      newErrors.postalCode = '郵便番号はXXX-XXXXの形式で入力してください';
    }
    if (!formData.prefecture) {
      newErrors.prefecture = '都道府県を選択してください';
    }
    if (!formData.city.trim()) {
      newErrors.city = '市区町村を入力してください';
    }
    if (!formData.address.trim()) {
      newErrors.address = '番地を入力してください';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = '電話番号を入力してください';
    } else if (!/^0\d{1,4}-\d{1,4}-\d{3,4}$/.test(formData.phone)) {
      newErrors.phone = '電話番号はXXX-XXXX-XXXXの形式で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to save address:', error);
      setErrors({ name: '保存に失敗しました。もう一度お試しください。' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 郵便番号から住所を自動入力
  const handlePostalCodeChange = async (value: string) => {
    setFormData({ ...formData, postalCode: value });

    // 郵便番号が完全に入力されたら自動入力
    if (/^\d{3}-\d{4}$/.test(value)) {
      try {
        const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${value.replace('-', '')}`);
        const data = await response.json();

        if (data.results) {
          const result = data.results[0];
          setFormData({
            ...formData,
            postalCode: value,
            prefecture: result.address1,
            city: result.address2 + result.address3,
            address: '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch address:', error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本情報 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">基本情報</h3>
        <div className="space-y-4">
          {/* 納品先名 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              納品先名 <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例: 株式会社〇〇 本社"
              error={errors.name}
            />
          </div>

          {/* 郵便番号 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              郵便番号 <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.postalCode}
              onChange={(e) => handlePostalCodeChange(e.target.value)}
              placeholder="XXX-XXXX"
              maxLength={8}
              error={errors.postalCode}
            />
          </div>

          {/* 都道府県 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              都道府県 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.prefecture}
              onChange={(e) => setFormData({ ...formData, prefecture: e.target.value })}
              className="w-full px-3 py-2 border border-border-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">選択してください</option>
              {prefectures.map((pref) => (
                <option key={pref} value={pref}>
                  {pref}
                </option>
              ))}
            </select>
            {errors.prefecture && (
              <p className="text-red-500 text-sm mt-1">{errors.prefecture}</p>
            )}
          </div>

          {/* 市区町村 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              市区町村 <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="例: 渋谷区"
              error={errors.city}
            />
          </div>

          {/* 番地 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              番地 <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="例: 1-2-3"
              error={errors.address}
            />
          </div>

          {/* 建物名 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              建物名・部屋番号
            </label>
            <Input
              type="text"
              value={formData.building}
              onChange={(e) => setFormData({ ...formData, building: e.target.value })}
              placeholder="例: 〇〇ビル 5F"
            />
          </div>

          {/* 電話番号 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              電話番号 <span className="text-red-500">*</span>
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="XXX-XXXX-XXXX"
              error={errors.phone}
            />
          </div>

          {/* 担当者名 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              担当者名
            </label>
            <Input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="例: 山田 太郎"
            />
          </div>
        </div>
      </Card>

      {/* デフォルト設定 */}
      <Card className="p-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isDefault}
            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
            className="w-4 h-4 text-primary border-border-secondary rounded focus:ring-primary"
          />
          <span className="text-sm text-text-primary">
            この住所をデフォルトの納品先に設定する
          </span>
        </label>
      </Card>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? '保存中...' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            キャンセル
          </Button>
        )}
      </div>
    </form>
  );
}
