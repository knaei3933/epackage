'use client';

/**
 * 生産状態管理コンポーネント (Production Status Manager)
 * 9段階生産状態追跡: design_received → work_order_created → material_prepared →
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
    name: 'デザインデータ受領',
    nameJa: 'デザインデータ受領',
    icon: FileText,
    description: '顧客からデザインファイルを受領'
  },
  work_order_created: {
    name: '作業標準書作成',
    nameJa: '作業標準書作成',
    icon: Settings,
    description: '作業標準書の作成および承認'
  },
  material_prepared: {
    name: '資材準備',
    nameJa: '資材準備',
    icon: Package,
    description: 'フィルムシート、インク等資材の準備'
  },
  printing: {
    name: '印刷',
    nameJa: '印刷',
    icon: Factory,
    description: 'グラビア印刷工程'
  },
  lamination: {
    name: 'ラミネート',
    nameJa: 'ラミネート',
    icon: Layers,
    description: 'フィルムラミネート加工'
  },
  slitting: {
    name: 'スリット加工',
    nameJa: 'スリット加工',
    icon: Scissors,
    description: '指定幅にカッティング'
  },
  pouch_making: {
    name: 'パウチ成形',
    nameJa: 'パウチ成形',
    icon: Box,
    description: '袋形状に成形およびシール'
  },
  qc_passed: {
    name: '品質検査合格',
    nameJa: '品質検査合格',
    icon: Target,
    description: '品質基準検査に合格'
  },
  packaged: {
    name: '包装完了',
    nameJa: '包装完了',
    icon: Package,
    description: '箱包装および出荷準備'
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
      const response = await fetch(`/api/member/orders/${orderId}/production-logs`);
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
      setSaveStatus({ type: 'error', message: '生産段階を選択してください。' });
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

      const response = await fetch('/api/member/production-logs', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setSaveStatus({ type: 'success', message: '生産ログが保存されました。' });

        // Reload logs
        await loadProductionLogs();

        // Clear form
        setNotes('');
        setPhotoFile(null);

        if (onStatusUpdate) {
          onStatusUpdate(selectedStage);
        }
      } else {
        setSaveStatus({ type: 'error', message: result.error || '保存中にエラーが発生しました。' });
      }
    } catch (error) {
      console.error('Error saving production log:', error);
      setSaveStatus({ type: 'error', message: '保存中にエラーが発生しました。' });
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
          <h2 className="text-xl font-semibold">生産進捗状況</h2>
          <div className="text-right">
            <p className="text-sm text-gray-600">全体進捗率</p>
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
              <label className="block text-sm font-medium mb-2">進捗率 (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">作業写真</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">作業メモ</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg min-h-[100px]"
              placeholder="この工程に関するメモを入力してください..."
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
              保存
            </Button>
          </div>
        </Card>
      )}

      {/* Production Log History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">生産ログ記録</h3>

        {logs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">まだ記録された生産ログがありません。</p>
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
                      <span>進捗率: {log.progress_percentage}%</span>
                      {log.assigned_to && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          担当者ID: {log.assigned_to.slice(0, 8)}
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
                          alt="作業写真"
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
