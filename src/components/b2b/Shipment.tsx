'use client';

/**
 * 출하 처리 컴포넌트 (Shipment Component)
 * 배송 처리 및 송장 번호 입력
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import {
  Truck,
  Save,
  Check,
  AlertCircle,
  Send,
  FileText,
  Package
} from 'lucide-react';

interface ShipmentProps {
  orderId: string;
  onComplete?: () => void;
}

export default function ShipmentComponent({ orderId, onComplete }: ShipmentProps) {
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [carrier, setCarrier] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [trackingUrl, setTrackingUrl] = useState<string>('');
  const [shippingDate, setShippingDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const carriers = [
    { value: 'yamato', label: '야마토 운송 (ヤマト運輸)' },
    { value: 'sagawa', label: '사가와 급급 (佐川急便)' },
    { value: 'jp_post', label: '우편 (ゆうパック)' },
    { value: 'seino', label: '세이노 운수 (西濃運輸)' },
    { value: 'fukuyama', label: '후쿠야마 운송 (福山通運)' },
    { value: 'other', label: '기타' }
  ];

  const handleShip = useCallback(async () => {
    if (!invoiceNumber) {
      setStatus({ type: 'error', message: '송장 번호를 입력해주세요.' });
      return;
    }

    if (!carrier) {
      setStatus({ type: 'error', message: '배송업체를 선택해주세요.' });
      return;
    }

    setIsSaving(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/b2b/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          invoice_number: invoiceNumber,
          carrier: carrier,
          tracking_number: trackingNumber || null,
          tracking_url: trackingUrl || null,
          shipping_date: shippingDate
        })
      });

      const result = await response.json();

      if (result.success) {
        setStatus({ type: 'success', message: '출하 처리가 완료되었습니다.' });

        if (onComplete) {
          onComplete();
        }
      } else {
        setStatus({ type: 'error', message: result.error || '출하 처리 중 오류가 발생했습니다.' });
      }
    } catch (error) {
      console.error('Shipment error:', error);
      setStatus({ type: 'error', message: '출하 처리 중 오류가 발생했습니다.' });
    } finally {
      setIsSaving(false);
    }
  }, [orderId, invoiceNumber, carrier, trackingNumber, trackingUrl, shippingDate, onComplete]);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Truck className="w-5 h-5" />
        출하 처리
      </h2>

      <div className="space-y-4">
        {/* Invoice Number */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            송장 번호 *
          </label>
          <Input
            type="text"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="INV-YYYY-NNNN"
          />
        </div>

        {/* Carrier */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <Truck className="w-4 h-4 inline mr-1" />
            배송업체 *
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
          >
            <option value="">배송업체를 선택하세요</option>
            {carriers.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Tracking Number */}
        <div>
          <label className="block text-sm font-medium mb-2">송장 번호 (운송장 번호)</label>
          <Input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="예: 1234-5678-9012"
          />
        </div>

        {/* Tracking URL */}
        <div>
          <label className="block text-sm font-medium mb-2">추적 URL</label>
          <Input
            type="url"
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        {/* Shipping Date */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <Package className="w-4 h-4 inline mr-1" />
            출하일
          </label>
          <Input
            type="date"
            value={shippingDate}
            onChange={(e) => setShippingDate(e.target.value)}
          />
        </div>

        {/* Status Message */}
        {status.type && (
          <div className={`p-4 rounded-lg ${
            status.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {status.type === 'success' ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={status.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {status.message}
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleShip}
            disabled={isSaving}
            size="lg"
          >
            <Send className="w-4 h-4 mr-2" />
            출하 완료
          </Button>
        </div>
      </div>
    </Card>
  );
}
