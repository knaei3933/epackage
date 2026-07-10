/**
 * Coupon Form component for AdminCouponsClient
 */

'use client';

import { useEffect, useState } from 'react';
import { Tag } from 'lucide-react';
import type { Coupon, CouponType, CouponStatus } from '../AdminCouponsClient';

export function CouponForm({
  coupon,
  onSubmit,
  onCancel
}: {
  coupon: Coupon | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    code: coupon?.code || '',
    name: coupon?.name || '',
    nameJa: coupon?.nameJa || '',
    description: coupon?.description || '',
    descriptionJa: coupon?.descriptionJa || '',
    type: coupon?.type || 'percentage' as CouponType,
    value: coupon?.value || 0,
    minimumOrderAmount: coupon?.minimumOrderAmount || 0,
    maximumDiscountAmount: coupon?.maximumDiscountAmount || null,
    maxUses: coupon?.maxUses || null,
    maxUsesPerCustomer: coupon?.maxUsesPerCustomer || 1,
    status: coupon?.status || 'active' as CouponStatus,
    validFrom: coupon?.validFrom || '',
    validUntil: coupon?.validUntil || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {coupon ? '쿠폰 수정' : '새 쿠폰 생성'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              쿠폰 코드 *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
              placeholder="WELCOME5"
              data-testid="coupon-code"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              타입 *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as CouponType })}
              data-testid="coupon-type"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="percentage">퍼센트 (%)</option>
              <option value="fixed_amount">고정 금액 (엔)</option>
              <option value="free_shipping">무료 배송</option>
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름 (한글) *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="웰컴 5% 할인"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Name Ja */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름 (일본어)
            </label>
            <input
              type="text"
              value={formData.nameJa}
              onChange={(e) => setFormData({ ...formData, nameJa: e.target.value })}
              placeholder="新規5%割引"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              값 *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
              required
              min={0}
              max={formData.type === 'percentage' ? 100 : undefined}
              placeholder={formData.type === 'percentage' ? '5' : '5000'}
              data-testid="coupon-value"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.type === 'percentage' && '% (0-100)'}
              {formData.type === 'fixed_amount' && '엔'}
              {formData.type === 'free_shipping' && '무료 배송'}
            </p>
          </div>

          {/* Min Order Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              최소 주문 금액 (엔)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.minimumOrderAmount}
              onChange={(e) => setFormData({ ...formData, minimumOrderAmount: parseFloat(e.target.value) })}
              min={0}
              placeholder="0"
              data-testid="minimum-order-amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Max Discount Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              최대 할인 금액 (엔)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.maximumDiscountAmount || ''}
              onChange={(e) => setFormData({ ...formData, maximumDiscountAmount: e.target.value ? parseFloat(e.target.value) : null })}
              min={0}
              placeholder="무제한"
              data-testid="maximum-discount-amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Valid From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              유효 기간 시작
            </label>
            <input
              type="datetime-local"
              value={formData.validFrom}
              onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
              data-testid="valid-from"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Max Uses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              최대 사용 횟수
            </label>
            <input
              type="number"
              value={formData.maxUses || ''}
              onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? parseInt(e.target.value) : null })}
              min={1}
              placeholder="무제한"
              data-testid="max-uses"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상태 *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as CouponStatus })}
              data-testid="coupon-status"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="scheduled">예약</option>
              <option value="expired">만료</option>
            </select>
          </div>

          {/* Valid Until */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              만료일
            </label>
            <input
              type="datetime-local"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              data-testid="valid-until"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            data-testid="save-coupon-button"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {coupon ? '수정' : '생성'}
          </button>
        </div>
      </form>
    </div>
  );
}
