/**
 * Shipment Edit Modal Component
 * Modal for editing an existing shipment
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Package, Truck, Calendar, Clock, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  CarrierType,
  ShippingServiceType,
  DeliveryTimeSlot,
  ShipmentStatus,
  CARRIER_NAMES,
  SERVICE_TYPE_NAMES,
  TIME_SLOT_NAMES,
  SHIPMENT_STATUS_NAMES,
} from '@/types/shipment';

interface ShipmentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: {
    id: string;
    shipment_number: string;
    tracking_number?: string;
    carrier_name?: string;
    carrier_code?: string;
    service_level?: string;
    status: ShipmentStatus;
    estimated_delivery_date?: string;
    shipped_at?: string;
    shipping_notes?: string;
    package_details?: any;
    order_id?: string;
    order?: {
      order_number: string;
      customer_name: string;
      delivery_address: any;
    };
  };
  onUpdateShipment: (id: string, data: any) => Promise<void>;
}

// Helper function to normalize carrier code to enum
function normalizeCarrierCode(code: string): CarrierType {
  const upperCode = code?.toUpperCase() || '';
  switch (upperCode) {
    case 'YAMATO':
    case 'YTO':
      return CarrierType.YAMATO;
    case 'SAGAWA':
    case 'SGE':
      return CarrierType.SAGAWA;
    case 'JP_POST':
    case 'JPPOST':
    case 'JPP':
      return CarrierType.JP_POST;
    case 'SEINO':
    case 'SNO':
      return CarrierType.SEINO;
    default:
      return CarrierType.YAMATO;
  }
}

// Helper function to normalize service level to enum
function normalizeServiceLevel(level: string): ShippingServiceType {
  const upperLevel = level?.toUpperCase() || '';
  switch (upperLevel) {
    case 'STANDARD':
      return ShippingServiceType.TAKKYUBIN;
    case 'EXPRESS':
      return ShippingServiceType.COOL;
    case 'ECONOMY':
      return ShippingServiceType.REGULAR;
    default:
      return ShippingServiceType.TAKKYUBIN;
  }
}

export function ShipmentEditModal({
  isOpen,
  onClose,
  shipment,
  onUpdateShipment,
}: ShipmentEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeliveryEdit, setShowDeliveryEdit] = useState(false);
  const [formData, setFormData] = useState({
    tracking_number: shipment.tracking_number || '',
    carrier: normalizeCarrierCode(shipment.carrier_code || ''),
    service_type: normalizeServiceLevel(shipment.service_level || ''),
    delivery_time_slot: DeliveryTimeSlot.NONE,
    pickup_date: shipment.shipped_at ? new Date(shipment.shipped_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    estimated_delivery: shipment.estimated_delivery_date || '',
    package_count: shipment.package_details?.packages_count || 1,
    weight_kg: shipment.package_details?.total_weight_kg || '',
    status: shipment.status as ShipmentStatus,
    customer_notes: shipment.shipping_notes || '',
    // 배송처 정보
    delivery_postal_code: shipment.order?.delivery_address?.postal_code || '',
    delivery_prefecture: shipment.order?.delivery_address?.prefecture || '',
    delivery_city: shipment.order?.delivery_address?.city || '',
    delivery_address: shipment.order?.delivery_address?.address || '',
    delivery_building: shipment.order?.delivery_address?.building || '',
    delivery_recipient_name: shipment.order?.delivery_address?.recipient_name || '',
    delivery_recipient_phone: shipment.order?.delivery_address?.recipient_phone || '',
  });

  // Update form data when shipment changes
  useEffect(() => {
    setFormData({
      tracking_number: shipment.tracking_number || '',
      carrier: normalizeCarrierCode(shipment.carrier_code || ''),
      service_type: normalizeServiceLevel(shipment.service_level || ''),
      delivery_time_slot: DeliveryTimeSlot.NONE,
      pickup_date: shipment.shipped_at ? new Date(shipment.shipped_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      estimated_delivery: shipment.estimated_delivery_date || '',
      package_count: shipment.package_details?.packages_count || 1,
      weight_kg: shipment.package_details?.total_weight_kg || '',
      status: shipment.status as ShipmentStatus,
      customer_notes: shipment.shipping_notes || '',
      delivery_postal_code: shipment.order?.delivery_address?.postal_code || '',
      delivery_prefecture: shipment.order?.delivery_address?.prefecture || '',
      delivery_city: shipment.order?.delivery_address?.city || '',
      delivery_address: shipment.order?.delivery_address?.address || '',
      delivery_building: shipment.order?.delivery_address?.building || '',
      delivery_recipient_name: shipment.order?.delivery_address?.recipient_name || '',
      delivery_recipient_phone: shipment.order?.delivery_address?.recipient_phone || '',
    });
  }, [shipment]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Map carrier type to carrier name and code
      const carrierNameMap: Record<string, string> = {
        yamato: 'Yamato Transport',
        sagawa: 'Sagawa Express',
        jp_post: 'Japan Post',
        seino: 'Seino Transport',
      };

      const carrierCodeMap: Record<string, string> = {
        yamato: 'YTO',
        sagawa: 'SGE',
        jp_post: 'JPP',
        seino: 'SNO',
      };

      const serviceLevelMap: Record<string, string> = {
        [ShippingServiceType.TAKKYUBIN]: 'STANDARD',
        [ShippingServiceType.COOL]: 'EXPRESS',
        [ShippingServiceType.REGULAR]: 'ECONOMY',
        [ShippingServiceType.MAIL]: 'STANDARD',
      };

      // Prepare package details
      const packageDetails = {
        packages_count: parseInt(formData.package_count.toString()) || 1,
        total_weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : undefined,
        dimensions: shipment.package_details?.dimensions,
        special_handling: formData.delivery_time_slot !== DeliveryTimeSlot.NONE ? [formData.delivery_time_slot] : [],
      };

      const updateData = {
        tracking_number: formData.tracking_number || undefined,
        carrier_name: carrierNameMap[formData.carrier] || shipment.carrier_name,
        carrier_code: carrierCodeMap[formData.carrier] || shipment.carrier_code,
        service_level: serviceLevelMap[formData.service_type] || shipment.service_level,
        status: formData.status,
        estimated_delivery_date: formData.estimated_delivery || undefined,
        shipping_notes: formData.customer_notes || undefined,
        package_details: packageDetails,
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) delete updateData[key];
      });

      // Update shipment
      await onUpdateShipment(shipment.id, updateData);

      // Update delivery address if changed and order_id exists
      const orderId = shipment.order?.id || shipment.order_id;
      console.log('[ShipmentEditModal] Updating delivery address:', {
        shipmentId: shipment.id,
        orderId,
        shipmentOrder: shipment.order,
        shipmentOrderId: shipment.order_id,
        showDeliveryEdit,
        customAddress: {
          postal_code: formData.delivery_postal_code,
          prefecture: formData.delivery_prefecture,
          city: formData.delivery_city,
          address: formData.delivery_address,
          building: formData.delivery_building,
          recipient_name: formData.delivery_recipient_name,
          recipient_phone: formData.delivery_recipient_phone,
        },
      });

      if (orderId && showDeliveryEdit) {
        const customAddress = {
          postal_code: formData.delivery_postal_code,
          prefecture: formData.delivery_prefecture,
          city: formData.delivery_city,
          address: formData.delivery_address,
          building: formData.delivery_building,
          recipient_name: formData.delivery_recipient_name,
          recipient_phone: formData.delivery_recipient_phone,
        };

        const response = await fetch(`/api/admin/orders/${orderId}/delivery-address`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customAddress }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '配送先住所の更新に失敗しました');
        }
      }

      onClose();
    } catch (error) {
      console.error('Failed to update shipment:', error);
      alert('配送の更新に失敗しました: ' + (error instanceof Error ? error.message : String(error)));
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
            <Edit3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">配送編集</h2>
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
          {/* Shipment Info (Read-only) */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">配送番号</span>
              <span className="font-medium">{shipment.shipment_number}</span>
            </div>
            {shipment.order && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">注文番号</span>
                  <span className="font-medium">{shipment.order.order_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">お客様名</span>
                  <span className="font-medium">{shipment.order.customer_name}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm text-gray-600">配送先</span>
                  <span className="text-sm text-right font-medium">
                    {shipment.order.delivery_address?.prefecture} {shipment.order.delivery_address?.city}{' '}
                    {shipment.order.delivery_address?.address}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Tracking Number */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Truck className="w-4 h-4" />
              追跡番号 (운송장 번호)
            </label>
            <Input
              type="text"
              placeholder="例: 1234-5678-9012-3456"
              value={formData.tracking_number}
              onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Package className="w-4 h-4" />
              ステータス
            </label>
            <Select
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value as ShipmentStatus })}
              required
              options={Object.values(ShipmentStatus).map((status) => ({
                value: status,
                label: SHIPMENT_STATUS_NAMES[status].ja,
              }))}
            />
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
            />
          </div>

          {/* Estimated Delivery Date */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4" />
              配達予定日
            </label>
            <Input
              type="date"
              value={formData.estimated_delivery}
              onChange={(e) => setFormData({ ...formData, estimated_delivery: e.target.value })}
            />
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

          {/* Delivery Address Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">配送先住所</h3>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowDeliveryEdit(!showDeliveryEdit)}
              >
                {showDeliveryEdit ? '閉じる' : '編集'}
              </Button>
            </div>

            {showDeliveryEdit ? (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                {/* Postal Code */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">郵便番号</label>
                  <Input
                    type="text"
                    placeholder="例: 100-0001"
                    value={formData.delivery_postal_code}
                    onChange={(e) => setFormData({ ...formData, delivery_postal_code: e.target.value })}
                  />
                </div>

                {/* Prefecture */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">都道府県</label>
                  <Input
                    type="text"
                    placeholder="例: 東京都"
                    value={formData.delivery_prefecture}
                    onChange={(e) => setFormData({ ...formData, delivery_prefecture: e.target.value })}
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">市区町村</label>
                  <Input
                    type="text"
                    placeholder="例: 千代田区"
                    value={formData.delivery_city}
                    onChange={(e) => setFormData({ ...formData, delivery_city: e.target.value })}
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">番地</label>
                  <Input
                    type="text"
                    placeholder="例: 1-1-1"
                    value={formData.delivery_address}
                    onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                  />
                </div>

                {/* Building */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">建物名</label>
                  <Input
                    type="text"
                    placeholder="例: ○○ビル 101号室"
                    value={formData.delivery_building}
                    onChange={(e) => setFormData({ ...formData, delivery_building: e.target.value })}
                  />
                </div>

                {/* Recipient Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">お届け先のお名前</label>
                  <Input
                    type="text"
                    placeholder="例: 山田 太郎"
                    value={formData.delivery_recipient_name}
                    onChange={(e) => setFormData({ ...formData, delivery_recipient_name: e.target.value })}
                  />
                </div>

                {/* Recipient Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">電話番号</label>
                  <Input
                    type="tel"
                    placeholder="例: 090-1234-5678"
                    value={formData.delivery_recipient_phone}
                    onChange={(e) => setFormData({ ...formData, delivery_recipient_phone: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <p>{formData.delivery_postal_code}</p>
                <p>{formData.delivery_prefecture}{formData.delivery_city}</p>
                <p>{formData.delivery_address}</p>
                {formData.delivery_building && <p>{formData.delivery_building}</p>}
                {formData.delivery_recipient_name && <p className="mt-2">お届け先: {formData.delivery_recipient_name}</p>}
                {formData.delivery_recipient_phone && <p>電話: {formData.delivery_recipient_phone}</p>}
              </div>
            )}
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
              {isSubmitting ? '更新中...' : '更新'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
