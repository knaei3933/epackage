'use client';

import { useEffect, useState } from 'react';

import { Tag, Plus, Trash2, Edit } from 'lucide-react';
import { fetchCoupons as fetchCouponsAPI, deleteCoupon as deleteCouponAPI, upsertCoupon as upsertCouponAPI } from '@/lib/api/admin/coupons';

export type CouponType = 'percentage' | 'fixed_amount' | 'free_shipping';
export type CouponStatus = 'active' | 'inactive' | 'expired' | 'scheduled';

export interface Coupon {
  id: string;
  code: string;
  name: string;
  nameJa: string | null;
  description: string | null;
  descriptionJa: string | null;
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

export default function AdminCouponsClient() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadCoupons();
  }, [page]);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const result = await fetchCouponsAPI(page, pageSize);
      setCoupons((result as any).data || []);
      setTotal((result as any).pagination?.total || 0);
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
      await deleteCouponAPI(couponId);
      setCoupons(prev => prev.filter(c => c.id !== couponId));
      showMessage('success', '쿠폰이 삭제되었습니다');
    } catch (error) {
      console.error('Failed to delete coupon:', error);
      showMessage('error', '삭제 실패');
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      await upsertCouponAPI(formData, editingCoupon?.id);
      await loadCoupons();
      setShowForm(false);
      setEditingCoupon(null);
      showMessage('success', editingCoupon ? '쿠폰이 수정되었습니다' : '쿠폰이 생성되었습니다');
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
            data-testid="new-coupon-button"
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
          <>
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

              {coupons.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                  쿠폰이 없습니다.
                </div>
              )}
            </div>

            {/* Pagination */}
            {total > pageSize && (
              <div className="mt-6 flex justify-center items-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  前へ
                </button>
                <span className="text-sm text-gray-600">
                  {page} / {Math.ceil(total / pageSize)} ページ (全{total}件)
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(Math.ceil(total / pageSize), p + 1))}
                  disabled={page >= Math.ceil(total / pageSize)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  次へ
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


import { CouponForm } from './parts/CouponForm';
