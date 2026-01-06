'use client';

/**
 * 주문 추적 타임라인 컴포넌트 (Order Tracking Timeline)
 * 10단계 B2B 주문 프로세스 시각화
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  FileText,
  Check,
  Clock,
  Truck,
  Package,
  Settings,
  Factory,
  AlertCircle,
  Download,
  Calendar,
  User,
  Building2
} from 'lucide-react';

// Types
interface OrderStatusHistory {
  id: string;
  order_id: string;
  from_status: string | null;
  to_status: string;
  changed_by: string | null;
  changed_at: string;
  reason: string | null;
}

interface ProductionLog {
  id: string;
  order_id: string;
  sub_status: string;
  progress_percentage: number;
  logged_at: string;
  notes: string | null;
  photo_url: string | null;
}

interface OrderTrackingData {
  order: {
    id: string;
    order_number: string;
    status: string;
    current_state: string;
    customer_name: string;
    created_at: string;
    state_metadata: Record<string, any> | null;
  };
  statusHistory: OrderStatusHistory[];
  productionLogs: ProductionLog[];
  workOrder?: {
    work_order_number: string;
    pdf_url: string | null;
    specifications: Record<string, any>;
  };
  contract?: {
    contract_number: string;
    pdf_url: string | null;
    customer_signed_at: string | null;
    admin_signed_at: string | null;
  };
}

interface OrderTimelineProps {
  orderId: string;
}

// 10단계 프로세스 정의
const PROCESS_STAGES = [
  {
    id: 'quotation',
    name: '견적',
    nameJa: '見積',
    icon: FileText,
    description: '견적 요청 및 승인',
    status: 'QUOTATION'
  },
  {
    id: 'data_received',
    name: '데이터 입고',
    nameJa: 'データ入稿',
    icon: Package,
    description: '고객 디자인 데이터 수령',
    status: 'DATA_RECEIVED'
  },
  {
    id: 'work_order',
    name: '작업표준서',
    nameJa: '作業標準書',
    icon: Settings,
    description: '제조 사양서 작성',
    status: 'WORK_ORDER'
  },
  {
    id: 'contract_sent',
    name: '계약서 송부',
    nameJa: '契約書送付',
    icon: FileText,
    description: '계약서 송부',
    status: 'CONTRACT_SENT'
  },
  {
    id: 'contract_signed',
    name: '계약서 서명',
    nameJa: '契約書署名',
    icon: Check,
    description: '양측 전자서명 완료',
    status: 'CONTRACT_SIGNED'
  },
  {
    id: 'production',
    name: '생산',
    nameJa: '生産',
    icon: Factory,
    description: '제조 공정 진행',
    status: 'PRODUCTION'
  },
  {
    id: 'stock_in',
    name: '입고',
    nameJa: '入稿',
    icon: Package,
    description: '제품 입고 및 품질검사',
    status: 'STOCK_IN'
  },
  {
    id: 'shipped',
    name: '출하',
    nameJa: '出荷',
    icon: Truck,
    description: '배송 시작',
    status: 'SHIPPED'
  },
  {
    id: 'delivered',
    name: '배송 완료',
    nameJa: '配達完了',
    icon: Check,
    description: '고객 수령 완료',
    status: 'DELIVERED'
  }
];

export default function OrderTimeline({ orderId }: OrderTimelineProps) {
  const [trackingData, setTrackingData] = useState<OrderTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  useEffect(() => {
    loadTrackingData();
  }, [orderId]);

  const loadTrackingData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/b2b/orders/${orderId}/tracking`);
      const result = await response.json();

      if (result.success) {
        setTrackingData(result.data);
      }
    } catch (error) {
      console.error('Error loading tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get current stage index
  const getCurrentStageIndex = useCallback((): number => {
    if (!trackingData) return 0;

    const currentStatus = trackingData.order.status;
    const index = PROCESS_STAGES.findIndex(stage => stage.status === currentStatus);

    return index >= 0 ? index : 0;
  }, [trackingData]);

  // Check if stage is completed
  const isStageCompleted = useCallback((stageId: string): boolean => {
    if (!trackingData) return false;

    const currentStageIndex = getCurrentStageIndex();
    const stageIndex = PROCESS_STAGES.findIndex(s => s.id === stageId);

    return stageIndex < currentStageIndex;
  }, [trackingData, getCurrentStageIndex]);

  // Check if stage is current
  const isStageCurrent = useCallback((stageId: string): boolean => {
    if (!trackingData) return false;

    return PROCESS_STAGES.find(s => s.id === stageId)?.status === trackingData.order.status;
  }, [trackingData]);

  // Get production progress for current stage
  const getProductionProgress = useCallback((): number => {
    if (!trackingData || trackingData.order.status !== 'PRODUCTION') {
      return 0;
    }

    // Get latest production log
    const latestLog = trackingData.productionLogs?.[0];
    return latestLog?.progress_percentage || 0;
  }, [trackingData]);

  // Format date
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP');
  }, []);

  // Download document
  const downloadDocument = useCallback(async (type: 'work_order' | 'contract' | 'quotation') => {
    if (!trackingData) return;

    let url: string | null = null;
    let filename = '';

    switch (type) {
      case 'work_order':
        url = trackingData.workOrder?.pdf_url || null;
        filename = `作業標準書_${trackingData.workOrder?.work_order_number}.pdf`;
        break;
      case 'contract':
        url = trackingData.contract?.pdf_url || null;
        filename = `契約書_${trackingData.contract?.contract_number}.pdf`;
        break;
      case 'quotation':
        // TODO: Add quotation PDF URL when available
        break;
    }

    if (!url) {
      alert('문서가 아직 준비되지 않았습니다.');
      return;
    }

    // Download file
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  }, [trackingData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Clock className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3">로딩 중...</span>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">주문 정보를 불러올 수 없습니다.</p>
      </Card>
    );
  }

  const currentStageIndex = getCurrentStageIndex();
  const progressPercentage = Math.round(((currentStageIndex + 1) / PROCESS_STAGES.length) * 100);

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">주문 #{trackingData.order.order_number}</h1>
            <p className="text-gray-600 mt-1">{trackingData.order.customer_name} 고객님</p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-600">현재 상태</p>
            <p className="text-lg font-semibold text-blue-600">
              {PROCESS_STAGES[currentStageIndex]?.nameJa || PROCESS_STAGES[currentStageIndex]?.name}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              주문일: {formatDate(trackingData.order.created_at)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">전체 진척률</span>
            <span className="text-sm font-bold text-blue-600">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">진행 상황</h2>

        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

          {/* Stages */}
          <div className="space-y-8">
            {PROCESS_STAGES.map((stage, index) => {
              const Icon = stage.icon;
              const isCompleted = isStageCompleted(stage.id);
              const isCurrent = isStageCurrent(stage.id);

              return (
                <div
                  key={stage.id}
                  className={`relative flex items-start gap-4 ${
                    isCurrent ? 'cursor-pointer hover:bg-gray-50 p-4 -m-4 rounded-lg transition-colors' : ''
                  }`}
                  onClick={() => isCurrent && setSelectedStage(stage.id)}
                >
                  {/* Stage Icon */}
                  <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Stage Content */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-semibold ${
                          isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          {index + 1}. {stage.name} ({stage.nameJa})
                        </h3>
                        <p className="text-sm text-gray-600">{stage.description}</p>
                      </div>

                      {/* Status Icon */}
                      {isCompleted && (
                        <Check className="w-5 h-5 text-green-500" />
                      )}
                      {isCurrent && (
                        <Clock className="w-5 h-5 text-blue-500 animate-pulse" />
                      )}
                    </div>

                    {/* Current Stage Details */}
                    {isCurrent && (
                      <div className="mt-4 space-y-3">
                        {/* Production Progress */}
                        {stage.id === 'production' && trackingData.productionLogs && trackingData.productionLogs.length > 0 && (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm font-medium mb-2">생산 진척률</p>
                            <div className="w-full bg-white rounded-full h-2 mb-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${getProductionProgress()}%` }}
                              />
                            </div>
                            <p className="text-sm text-gray-600 text-right">
                              {getProductionProgress()}%
                            </p>

                            {/* Latest Log */}
                            {trackingData.productionLogs[0] && (
                              <div className="mt-3 text-sm">
                                <p className="text-gray-600">
                                  최신 공정: {trackingData.productionLogs[0].sub_status}
                                </p>
                                {trackingData.productionLogs[0].notes && (
                                  <p className="text-gray-500 mt-1">
                                    {trackingData.productionLogs[0].notes}
                                  </p>
                                )}
                                {trackingData.productionLogs[0].photo_url && (
                                  <img
                                    src={trackingData.productionLogs[0].photo_url}
                                    alt="작업 사진"
                                    className="mt-2 w-32 h-32 object-cover rounded"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-3">
                          {/* Download Work Order */}
                          {stage.id === 'work_order' && trackingData.workOrder?.pdf_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadDocument('work_order')}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              작업표준서 다운로드
                            </Button>
                          )}

                          {/* Download Contract */}
                          {(stage.id === 'contract_sent' || stage.id === 'contract_signed') && trackingData.contract?.pdf_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadDocument('contract')}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              계약서 다운로드
                            </Button>
                          )}

                          {/* Sign Contract (if sent but not signed) */}
                          {stage.id === 'contract_sent' && trackingData.contract && !trackingData.contract.customer_signed_at && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => window.location.href = `/member/contracts/${trackingData.contract?.contract_number}/sign`}
                            >
                              <Check className="w-4 h-4 mr-2" />
                              계약서 서명
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Completed Date */}
                    {isCompleted && (() => {
                      const historyEntry = trackingData.statusHistory.find(
                        h => h.to_status === stage.status
                      );
                      return historyEntry ? (
                        <div className="mt-2 text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          완료: {formatDate(historyEntry.changed_at)}
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Order Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">주문 정보</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">주문 번호</span>
            <p className="font-medium">{trackingData.order.order_number}</p>
          </div>

          <div>
            <span className="text-gray-600">현재 상태</span>
            <p className="font-medium">{PROCESS_STAGES[currentStageIndex]?.name}</p>
          </div>

          <div>
            <span className="text-gray-600">진척률</span>
            <p className="font-medium">{progressPercentage}%</p>
          </div>

          <div>
            <span className="text-gray-600">주문일</span>
            <p className="font-medium">{formatDate(trackingData.order.created_at)}</p>
          </div>
        </div>

        {/* Shipment Info */}
        {trackingData.order.status === 'SHIPPED' && trackingData.order.state_metadata && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">배송 정보</h4>
            <div className="text-sm space-y-1">
              <p>배송업체: {trackingData.order.state_metadata.carrier || '정보 없음'}</p>
              <p>운송장 번호: {trackingData.order.state_metadata.tracking_number || '정보 없음'}</p>
              {trackingData.order.state_metadata.tracking_url && (
                <a
                  href={trackingData.order.state_metadata.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  배송 추적 →
                </a>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
