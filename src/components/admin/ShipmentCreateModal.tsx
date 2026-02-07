/**
 * Shipment Create Modal Component
 * Modal for creating a new shipment from an order
 */

'use client';

import { useState } from 'react';
import { X, Package, Truck, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  CarrierType,
  ShippingServiceType,
  DeliveryTimeSlot,
  CARRIER_NAMES,
  SERVICE_TYPE_NAMES,
  TIME_SLOT_NAMES,
} from '@/types/shipment';

interface ShipmentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    order_number: string;
    customer_name: string;
    delivery_address: any;  // API는 delivery_address를 반환
  };
  onCreateShipment: (data: any) => Promise<void>;
}

export function ShipmentCreateModal({
  isOpen,
  onClose,
  order,
  onCreateShipment,
}: ShipmentCreateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    carrier: CarrierType.YAMATO,
    service_type: ShippingServiceType.TAKKYUBIN,
    delivery_time_slot: DeliveryTimeSlot.NONE,
    pickup_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    package_count: 1,
    weight_kg: '',
    tracking_number: '', // 사용자 직접 입력
    customer_notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onCreateShipment({
        order_id: order.id,
        ...formData,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : undefined,
        package_count: parseInt(formData.package_count.toString()),
      });
      onClose();
    } catch (error) {
      console.error('Failed to create shipment:', error);
      alert('配送の作成に失敗しました: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">配送作成</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">注文番号</span>
              <span className="font-medium">{order.order_number}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">お客様名</span>
              <span className="font-medium">{order.customer_name}</span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-sm text-gray-600">配送先</span>
              <div className="text-sm text-right max-w-[70%]">
                {order.delivery_address?.name && (
                  <div className="font-medium">{order.delivery_address.name}</div>
                )}
                <div className="text-gray-700">
                  〒{order.delivery_address?.postal_code}
                </div>
                <div className="text-gray-700">
                  {order.delivery_address?.prefecture} {order.delivery_address?.city}
                  {order.delivery_address?.address}
                </div>
                {order.delivery_address?.building && (
                  <div className="text-gray-700">{order.delivery_address.building}</div>
                )}
                {order.delivery_address?.phone && (
                  <div className="text-gray-600 text-xs mt-1">TEL: {order.delivery_address.phone}</div>
                )}
              </div>
            </div>
          </div>

          {/* Carrier Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Truck className="w-4 h-4" />
              配送業者
            </label>
            <Select
              value={formData.carrier}
              onChange={(value) => setFormData({ ...formData, carrier: value as CarrierType })}
              required
              options={Object.values(CarrierType).map((carrier) => ({
                value: carrier,
                label: CARRIER_NAMES[carrier].ja,
              }))}
            />
          </div>

          {/* Tracking Number */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Truck className="w-4 h-4" />
              追跡番号 (운송장 번호)
            </label>
            <Input
              type="text"
              placeholder="例: 1234-5678-9012-3456 (선택 사항, 비워두시 자동 생성)"
              value={formData.tracking_number}
              onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              운송장 번호를 직접 입력하실 수 있습니다. 비워두시 시스템이 자동으로 생성합니다.
            </p>
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Package className="w-4 h-4" />
              サービス種別
            </label>
            <Select
              value={formData.service_type}
              onChange={(value) => setFormData({ ...formData, service_type: value as ShippingServiceType })}
              required
              options={Object.values(ShippingServiceType).map((type) => ({
                value: type,
                label: SERVICE_TYPE_NAMES[type].ja,
              }))}
            />
          </div>

          {/* Pickup Date */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4" />
              集荷予定日
            </label>
            <Input
              type="date"
              value={formData.pickup_date}
              onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
              min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              required
            />
            <p className="text-xs text-gray-500">
              集荷は1営業日前までに予約してください
            </p>
          </div>

          {/* Delivery Time Slot */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock className="w-4 h-4" />
              配達時間帯指定
            </label>
            <Select
              value={formData.delivery_time_slot}
              onChange={(value) => setFormData({ ...formData, delivery_time_slot: value as DeliveryTimeSlot })}
              options={Object.values(DeliveryTimeSlot).map((slot) => ({
                value: slot,
                label: TIME_SLOT_NAMES[slot].ja,
              }))}
            />
          </div>

          {/* Package Count */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">荷物個数</label>
            <Input
              type="number"
              min="1"
              value={formData.package_count}
              onChange={(e) => setFormData({ ...formData, package_count: parseInt(e.target.value) || 1 })}
              required
            />
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">重量 (kg)</label>
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="例: 2.5"
              value={formData.weight_kg}
              onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
            />
          </div>

          {/* Customer Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">備考</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="配送に関する特記事項があれば入力してください"
              value={formData.customer_notes}
              onChange={(e) => setFormData({ ...formData, customer_notes: e.target.value })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? '作成中...' : '配送を作成'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
