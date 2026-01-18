'use client';

import { useEffect, useState } from 'react';
import { Tag, Plus, Trash2, Edit } from 'lucide-react';

type CouponType = 'percentage' | 'fixed_amount' | 'free_shipping';
type CouponStatus = 'active' | 'inactive' | 'expired' | 'scheduled';

interface Coupon {
  id: string;
  code: string;
  name: string;
  nameJa: string | null;
  description: string | null;
  type: CouponType;
  value: number;
  minimumOrderAmount: number;
  maximumDiscountAmount: number | null;
  maxUses: number | null;
  currentUses: number;
  maxUsesPerCustomer: number;
  status: CouponStatus;
  validFrom: string;
  validUntil: string | null;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/coupons');
      const result = await response.json();

      if (result.success) {
        setCoupons(result.data);
      }
    } catch (error) {
      console.error('Failed to load coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm('쿠폰을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCoupons(prev => prev.filter(c => c.id !== couponId));
        showMessage('success', '쿠폰이 삭제되었습니다');
      }
    } catch (error) {
      console.error('Failed to delete coupon:', error);
      showMessage('error', '삭제 실패');
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon.id}`
        : '/api/admin/coupons';

      const response = await fetch(url, {
        method: editingCoupon ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        await loadCoupons();
        setShowForm(false);
        setEditingCoupon(null);
        showMessage('success', editingCoupon ? '쿠폰이 수정되었습니다' : '쿠폰이 생성되었습니다');
      } else {
        showMessage('error', result.error || '저장 실패');
      }
    } catch (error) {
      console.error('Failed to save coupon:', error);
      showMessage('error', '저장 실패');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">쿠폰 관리</h1>
            <p className="text-sm text-gray-500 mt-1">할인 쿠폰 발급 및 관리</p>
          </div>
          <button
            onClick={() => {
              setEditingCoupon(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            새 쿠폰
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <CouponForm
            coupon={editingCoupon}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingCoupon(null);
            }}
          />
        )}

        {/* List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      코드
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      타입
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      값
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      사용
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-mono font-medium text-gray-900">
                            {coupon.code}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {coupon.nameJa || coupon.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {coupon.type === 'percentage' && '퍼센트 (%)'}
                        {coupon.type === 'fixed_amount' && '고정 금액 (엔)'}
                        {coupon.type === 'free_shipping' && '무료 배송'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {coupon.type === 'percentage' && `${coupon.value}%`}
                        {coupon.type === 'fixed_amount' && `${coupon.value.toLocaleString()}엔`}
                        {coupon.type === 'free_shipping' && '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          coupon.status === 'active' ? 'bg-green-100 text-green-800' :
                          coupon.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          coupon.status === 'expired' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {coupon.status === 'active' && '활성'}
                          {coupon.status === 'inactive' && '비활성'}
                          {coupon.status === 'expired' && '만료'}
                          {coupon.status === 'scheduled' && '예약'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {coupon.currentUses} / {coupon.maxUses || '∞'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingCoupon(coupon);
                              setShowForm(true);
                            }}
                            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="편집"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                            title="삭제"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {coupons.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                쿠폰이 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CouponForm({
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {coupon ? '수정' : '생성'}
          </button>
        </div>
      </form>
    </div>
  );
}
