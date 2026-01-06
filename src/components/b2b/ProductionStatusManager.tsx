'use client';

/**
 * 생산 상태 관리 컴포넌트 (Production Status Manager)
 * 9단계 생산 상태 추적: design_received → work_order_created → material_prepared →
 * printing → lamination → slitting → pouch_making → qc_passed → packaged
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import {
  Check,
  Clock,
  Camera,
  Save,
  AlertCircle,
  User,
  FileText,
  Factory,
  Package,
  Settings,
  Target,
  Truck,
  Calendar
} from 'lucide-react';

// Types
interface ProductionLog {
  id: string;
  order_id: string;
  sub_status: ProductionSubStatus;
  progress_percentage: number;
  assigned_to: string | null;
  photo_url: string | null;
  notes: string | null;
  logged_at: string;
}

type ProductionSubStatus =
  | 'design_received'
  | 'work_order_created'
  | 'material_prepared'
  | 'printing'
  | 'lamination'
  | 'slitting'
  | 'pouch_making'
  | 'qc_passed'
  | 'packaged';

interface ProductionStatusManagerProps {
  orderId: string;
  workOrderId: string;
  currentStatus?: ProductionSubStatus;
  onStatusUpdate?: (newStatus: ProductionSubStatus) => void;
}

// Production stages configuration
const PRODUCTION_STAGES: Record<ProductionSubStatus, { name: string; nameJa: string; icon: any; description: string }> = {
  design_received: {
    name: '디자인 데이터 수령',
    nameJa: 'デザインデータ受領',
    icon: FileText,
    description: '고객으로부터 디자인 파일 수령'
  },
  work_order_created: {
    name: '작업표준서 작성',
    nameJa: '作業標準書作成',
    icon: Settings,
    description: '작업표준서 작성 및 승인'
  },
  material_prepared: {
    name: '자재 준비',
    nameJa: '資材準備',
    icon: Package,
    description: '필름 시트, 잉크 등 자재 준비'
  },
  printing: {
    name: '인쇄',
    nameJa: '印刷',
    icon: Factory,
    description: '그라비아 인쇄 공정'
  },
  lamination: {
    name: '라미네이션',
    nameJa: 'ラミネート',
    icon: Layers,
    description: '필름 라미네이션 가공'
  },
  slitting: {
    name: '슬릿 가공',
    nameJa: 'スリット加工',
    icon: Scissors,
    description: '지정 폭으로 컷팅'
  },
  pouch_making: {
    name: '파우치 성형',
    nameJa: 'パウチ成形',
    icon: Box,
    description: '백 형태로 성형 및 시일'
  },
  qc_passed: {
    name: '품질 검사 합격',
    nameJa: '品質検査合格',
    icon: Target,
    description: '품질 기준 검사 통과'
  },
  packaged: {
    name: '포장 완료',
    nameJa: '包装完了',
    icon: Package,
    description: '박스 포장 및 출하 준비'
  }
};

import { Layers, Scissors, Box } from 'lucide-react';

export default function ProductionStatusManager({
  orderId,
  workOrderId,
  currentStatus,
  onStatusUpdate
}: ProductionStatusManagerProps) {
  const [logs, setLogs] = useState<ProductionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<ProductionSubStatus | null>(null);
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Load production logs
  useEffect(() => {
    loadProductionLogs();
  }, [orderId]);

  const loadProductionLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/b2b/orders/${orderId}/production-logs`);
      const result = await response.json();

      if (result.success) {
        setLogs(result.data);

        // Set current progress
        if (result.data.length > 0) {
          const latestLog = result.data[0];
          setProgress(latestLog.progress_percentage);
        }
      }
    } catch (error) {
      console.error('Error loading production logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get completed stages
  const getCompletedStages = useCallback((): ProductionSubStatus[] => {
    return logs.map(log => log.sub_status);
  }, [logs]);

  // Get current stage index
  const getCurrentStageIndex = useCallback((): number => {
    const stages = Object.keys(PRODUCTION_STAGES) as ProductionSubStatus[];
    if (!currentStatus) return 0;

    const index = stages.indexOf(currentStatus);
    return index >= 0 ? index : 0;
  }, [currentStatus]);

  // Calculate overall progress
  const calculateProgress = useCallback(() => {
    const stages = Object.keys(PRODUCTION_STAGES) as ProductionSubStatus[];
    const completed = getCompletedStages();
    const completedCount = stages.filter(stage => completed.includes(stage)).length;
    return Math.round((completedCount / stages.length) * 100);
  }, [getCompletedStages]);

  const overallProgress = calculateProgress();

  // Handle stage selection
  const handleStageSelect = useCallback((stage: ProductionSubStatus) => {
    setSelectedStage(stage);

    // Set progress based on stage
    const stages = Object.keys(PRODUCTION_STAGES) as ProductionSubStatus[];
    const index = stages.indexOf(stage);
    const stageProgress = Math.round(((index + 1) / stages.length) * 100);
    setProgress(stageProgress);
  }, []);

  // Save production log
  const handleSaveLog = useCallback(async () => {
    if (!selectedStage) {
      setSaveStatus({ type: 'error', message: '생산 단계를 선택해주세요.' });
      return;
    }

    setIsSaving(true);
    setSaveStatus({ type: null, message: '' });

    try {
      const formData = new FormData();
      formData.append('order_id', orderId);
      formData.append('sub_status', selectedStage);
      formData.append('progress_percentage', progress.toString());
      formData.append('notes', notes);

      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const response = await fetch('/api/b2b/production-logs', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setSaveStatus({ type: 'success', message: '생산 로그가 저장되었습니다.' });

        // Reload logs
        await loadProductionLogs();

        // Clear form
        setNotes('');
        setPhotoFile(null);

        if (onStatusUpdate) {
          onStatusUpdate(selectedStage);
        }
      } else {
        setSaveStatus({ type: 'error', message: result.error || '저장 중 오류가 발생했습니다.' });
      }
    } catch (error) {
      console.error('Error saving production log:', error);
      setSaveStatus({ type: 'error', message: '저장 중 오류가 발생했습니다.' });
    } finally {
      setIsSaving(false);
    }
  }, [orderId, selectedStage, progress, notes, photoFile, onStatusUpdate, loadProductionLogs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Clock className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const stages = Object.keys(PRODUCTION_STAGES) as ProductionSubStatus[];

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">생산 진척 현황</h2>
          <div className="text-right">
            <p className="text-sm text-gray-600">전체 진척률</p>
            <p className="text-2xl font-bold text-blue-600">{overallProgress}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        {/* Stage Timeline */}
        <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
          {stages.map((stage, index) => {
            const config = PRODUCTION_STAGES[stage];
            const Icon = config.icon;
            const isCompleted = getCompletedStages().includes(stage);
            const isCurrent = currentStatus === stage;

            return (
              <button
                key={stage}
                onClick={() => handleStageSelect(stage)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedStage === stage
                    ? 'border-blue-500 bg-blue-50'
                    : isCompleted
                      ? 'border-green-500 bg-green-50'
                      : isCurrent
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
                title={`${config.name} (${config.nameJa})`}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className={`p-2 rounded-full ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-center hidden md:block">
                    {index + 1}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Current Stage Detail */}
      {selectedStage && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {PRODUCTION_STAGES[selectedStage].name} ({PRODUCTION_STAGES[selectedStage].nameJa})
          </h3>
          <p className="text-gray-600 mb-4">
            {PRODUCTION_STAGES[selectedStage].description}
          </p>

          {/* Progress Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">진척률 (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">작업 사진</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">작업 메모</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg min-h-[100px]"
              placeholder="이 공정에 대한 메모를 입력하세요..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Status Message */}
          {saveStatus.type && (
            <div className={`p-4 rounded-lg mb-4 ${
              saveStatus.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {saveStatus.type === 'success' ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={saveStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {saveStatus.message}
                </span>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveLog}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              저장
            </Button>
          </div>
        </Card>
      )}

      {/* Production Log History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">생산 로그 기록</h3>

        {logs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">아직 기록된 생산 로그가 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const config = PRODUCTION_STAGES[log.sub_status];
              const Icon = config.icon;

              return (
                <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 p-2 rounded-full bg-blue-500 text-white">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{config.name}</h4>
                      <span className="text-sm text-gray-600">
                        {new Date(log.logged_at).toLocaleString('ja-JP')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>진척률: {log.progress_percentage}%</span>
                      {log.assigned_to && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          담당자 ID: {log.assigned_to.slice(0, 8)}
                        </span>
                      )}
                    </div>
                    {log.notes && (
                      <p className="text-sm mt-2 text-gray-700">{log.notes}</p>
                    )}
                    {log.photo_url && (
                      <div className="mt-2">
                        <img
                          src={log.photo_url}
                          alt="작업 사진"
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
