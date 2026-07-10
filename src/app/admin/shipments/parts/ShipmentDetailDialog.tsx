/**
 * Shipment Detail Dialog for AdminShipmentsClient
 */

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { TrackingTimeline } from '@/components/admin/TrackingTimeline';
import { X, MapPin, Truck, Package, Calendar, Edit3 } from 'lucide-react';
import { SHIPMENT_STATUS_NAMES, CARRIER_NAMES } from '@/types/shipment';
import type { ShipmentStatus, CarrierType } from '@/types/shipment';

interface ShipmentDetailDialogProps {
  selectedShipment: any;
  showDetailModal: boolean;
  setShowDetailModal: (open: boolean) => void;
  onEdit: (shipment: any) => void;
  setShowEditModal: (open: boolean) => void;
  setSelectedShipment: (s: any) => void;
}

export function ShipmentDetailDialog({ selectedShipment, showDetailModal, setShowDetailModal, onEdit, setShowEditModal, setSelectedShipment }: ShipmentDetailDialogProps) {
  return (
    <>
      {/* Shipment Detail Modal */}
      {showDetailModal && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">配送詳細</h2>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowEditModal(true);
                  }}
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  編集
                </Button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedShipment(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Shipment Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">配送番号</span>
                  <p className="font-medium mt-1">{selectedShipment.shipment_number}</p>
                </div>
                <div>
                  <span className="text-gray-600">追跡番号</span>
                  <p className="font-medium mt-1 font-mono">{selectedShipment.tracking_number}</p>
                </div>
                <div>
                  <span className="text-gray-600">配送業者</span>
                  <p className="font-medium mt-1">
                    {CARRIER_NAMES[selectedShipment.carrier as CarrierType]?.ja || selectedShipment.carrier}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">ステータス</span>
                  <p className="font-medium mt-1">
                    {SHIPMENT_STATUS_NAMES[selectedShipment.status as ShipmentStatus]?.ja || selectedShipment.status}
                  </p>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div>
                <h3 className="font-medium mb-4">追跡履歴</h3>
                <TrackingTimeline events={selectedShipment.tracking_history || []} currentStatus={selectedShipment.status as ShipmentStatus} />
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
