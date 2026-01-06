'use client';

/**
 * 작업표준서 생성 컴포넌트 (Work Order Generator)
 * 주문에서 제조 사양서를 생성
 */

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import {
  Save,
  FileText,
  Download,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Settings,
  Package,
  Sliders,
  Target,
  Factory
} from 'lucide-react';

// Types
interface OrderItem {
  id: string;
  product_name: string;
  product_code: string | null;
  quantity: number;
  specifications: Record<string, any>;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  order_items: OrderItem[];
}

interface WorkOrderGeneratorProps {
  order: Order;
  onGenerated?: (workOrderId: string) => void;
}

export default function WorkOrderGenerator({
  order,
  onGenerated
}: WorkOrderGeneratorProps) {
  const router = useRouter();

  // Form state
  const [specifications, setSpecifications] = useState<Record<string, any>>({
    pouch_type: 'stand_up',
    dimensions: {
      width: 200,
      length: 300,
      gusset: 100
    },
    material: {
      type: 'PET_AL_PE',
      thickness: 100,
      transparent: false
    },
    printing: {
      type: 'flexo',
      colors: 4,
      sides: 'outer'
    },
    post_processing: [] as string[]
  });

  const [productionFlow, setProductionFlow] = useState<string[]>([
    'design_file_check',
    'printing',
    'lamination',
    'slitting',
    'pouch_making',
    'qc_inspection',
    'packaging'
  ]);

  const [qualityStandards, setQualityStandards] = useState<Record<string, any>>({
    visual_inspection: true,
    dimension_tolerance: '±2mm',
    seal_strength: '≥10N/15mm',
    appearance_standard: 'A급',
    additional_checks: [] as string[]
  });

  const [packagingSpecs, setPackagingSpecs] = useState<Record<string, any>>({
    packaging_type: 'box',
    quantity_per_box: 1000,
  });

  const [estimatedCompletion, setEstimatedCompletion] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Post processing options
  const postProcessingOptions = [
    { id: 'zipper', label: '지퍼 (チャック)' },
    { id: 'valve', label: '밸브 (バルブ)' },
    { id: 'spout', label: '주불 (ノズル)' },
    { id: 'hang_hole', label: '행홀 (ハングホール)' },
    { id: 'tear_notch', label: '티어노치 (切欠き)' },
    { id: 'eu_hole', label: '유로홀 (ユーロホール)' }
  ];

  // Update specifications
  const handleSpecChange = useCallback((section: string, field: string, value: any) => {
    setSpecifications(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value
      }
    }));
  }, []);

  // Toggle post processing
  const togglePostProcessing = useCallback((option: string) => {
    setSpecifications(prev => ({
      ...prev,
      post_processing: prev.post_processing.includes(option)
        ? prev.post_processing.filter((p: string) => p !== option)
        : [...prev.post_processing, option]
    }));
  }, []);

  // Generate work order
  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/b2b/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: order.id,
          specifications,
          production_flow: productionFlow,
          quality_standards: qualityStandards,
          packaging_specs: packagingSpecs,
          estimated_completion: estimatedCompletion || null
        })
      });

      const result = await response.json();

      if (result.success) {
        setStatus({
          type: 'success',
          message: '작업표준서가 생성되었습니다.'
        });

        if (onGenerated) {
          onGenerated(result.data.id);
        }
      } else {
        setStatus({
          type: 'error',
          message: result.error || '작업표준서 생성 중 오류가 발생했습니다.'
        });
      }
    } catch (error) {
      console.error('Generate work order error:', error);
      setStatus({
        type: 'error',
        message: '작업표준서 생성 중 오류가 발생했습니다.'
      });
    } finally {
      setIsGenerating(false);
    }
  }, [order.id, specifications, productionFlow, qualityStandards, packagingSpecs, estimatedCompletion, onGenerated]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Factory className="w-6 h-6" />
            작업표준서 생성
          </h1>
          <p className="text-gray-600 mt-1">
            주문 #{order.order_number} - {order.customer_name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            취소
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            <FileText className="w-4 h-4 mr-2" />
            작업표준서 생성
          </Button>
        </div>
      </div>

      {/* Status Message */}
      {status.type && (
        <Card className={`p-4 ${
          status.type === 'success'
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
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
        </Card>
      )}

      {/* Specifications */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          제품 사양
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pouch Type */}
          <div>
            <label className="block text-sm font-medium mb-2">파우치 타입</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={specifications.pouch_type}
              onChange={(e) => handleSpecChange('pouch_type', 'type', e.target.value)}
            >
              <option value="stand_up">스탠드파우치 (スタンドパウチ)</option>
              <option value="flat_3_side">3면 시일 평판 (三方シール平袋)</option>
              <option value="flat_2_side">2면 시일 평판 (両方シール平袋)</option>
              <option value="zipper">지퍼백 (チャック袋)</option>
              <option value="roll">롤 필름 (ロールフィルム)</option>
            </select>
          </div>

          {/* Dimensions */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">치수 (mm)</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">폭</label>
                <Input
                  type="number"
                  value={specifications.dimensions.width}
                  onChange={(e) => handleSpecChange('dimensions', 'width', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">길이</label>
                <Input
                  type="number"
                  value={specifications.dimensions.length}
                  onChange={(e) => handleSpecChange('dimensions', 'length', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">마치</label>
                <Input
                  type="number"
                  value={specifications.dimensions.gusset}
                  onChange={(e) => handleSpecChange('dimensions', 'gusset', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Material */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">재질</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={specifications.material.type}
              onChange={(e) => handleSpecChange('material', 'type', e.target.value)}
            >
              <option value="PET_AL_PE">PET/AL/PE (알루미늄 증착)</option>
              <option value="PET_PE">PET/PE (투명)</option>
              <option value="NY_PE">NY/PE (나일론)</option>
              <option value="KPET_AL_PE">KPET/AL/PE (유광 알루미늄)</option>
              <option value="MPET_AL_PE">MPET/AL/PE (증착 알루미늄)</option>
              <option value="PE">PE (폴리에틸린 단층)</option>
            </select>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">두께 (μm)</label>
                <Input
                  type="number"
                  value={specifications.material.thickness}
                  onChange={(e) => handleSpecChange('material', 'thickness', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">투명도</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={specifications.material.transparent ? 'transparent' : 'opaque'}
                  onChange={(e) => handleSpecChange('material', 'transparent', e.target.value === 'transparent')}
                >
                  <option value="transparent">투명</option>
                  <option value="opaque">불투명</option>
                </select>
              </div>
            </div>
          </div>

          {/* Printing */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">인쇄</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">인쇄 방식</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={specifications.printing.type}
                  onChange={(e) => handleSpecChange('printing', 'type', e.target.value)}
                >
                  <option value="flexo">그라비아 인쇄 (グラビア印刷)</option>
                  <option value="rotogravure">로토그라비아 (ロトグラビア)</option>
                  <option value="digital">디지털 인쇄 (デジタル印刷)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">색상 수</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={specifications.printing.colors}
                  onChange={(e) => handleSpecChange('printing', 'colors', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">인쇄 위치</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={specifications.printing.sides}
                onChange={(e) => handleSpecChange('printing', 'sides', e.target.value)}
              >
                <option value="outer">외부 (外側のみ)</option>
                <option value="inner">내부 (内側のみ)</option>
                <option value="both">양면 (両面)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Post Processing */}
        <div className="mt-6">
          <label className="block text-sm font-medium mb-3">후가공</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {postProcessingOptions.map(option => (
              <label key={option.id} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={specifications.post_processing.includes(option.id)}
                  onChange={() => togglePostProcessing(option.id)}
                  className="rounded"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </Card>

      {/* Production Flow */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          생산 공정 플로우
        </h2>

        <div className="space-y-3">
          {productionFlow.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                {getProductionStepName(step)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quality Standards */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          품질 기준
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">외관 검사</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={qualityStandards.appearance_standard}
              onChange={(e) => setQualityStandards(prev => ({ ...prev, appearance_standard: e.target.value }))}
            >
              <option value="S급">S급 (프리미엄)</option>
              <option value="A급">A급 (일반)</option>
              <option value="B급">B급 (허용 범위)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">치수 공차</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={qualityStandards.dimension_tolerance}
              onChange={(e) => setQualityStandards(prev => ({ ...prev, dimension_tolerance: e.target.value }))}
            >
              <option value="±1mm">±1mm (엄격)</option>
              <option value="±2mm">±2mm (표준)</option>
              <option value="±3mm">±3mm (허용)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">시일 강도</label>
            <Input
              type="text"
              value={qualityStandards.seal_strength}
              onChange={(e) => setQualityStandards(prev => ({ ...prev, seal_strength: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="visual-inspection"
              checked={qualityStandards.visual_inspection}
              onChange={(e) => setQualityStandards(prev => ({ ...prev, visual_inspection: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="visual-inspection" className="text-sm">외관 검사 실시</label>
          </div>
        </div>
      </Card>

      {/* Packaging & Completion */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">포장 및 납기</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">포장 단위 (매/박스)</label>
            <Input
              type="number"
              min="1"
              value={packagingSpecs.quantity_per_box}
              onChange={(e) => setPackagingSpecs(prev => ({ ...prev, quantity_per_box: parseInt(e.target.value) || 1000 }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">예정 완료일</label>
            <Input
              type="date"
              value={estimatedCompletion}
              onChange={(e) => setEstimatedCompletion(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Order Summary */}
      <Card className="p-6 bg-gray-50">
        <h3 className="font-semibold mb-3">주문 정보</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>주문 번호:</span>
            <span className="font-medium">#{order.order_number}</span>
          </div>
          <div className="flex justify-between">
            <span>고객:</span>
            <span className="font-medium">{order.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span>주문 항목:</span>
            <span className="font-medium">{order.order_items.length}종류</span>
          </div>
          <div className="flex justify-between">
            <span>총 수량:</span>
            <span className="font-medium">
              {order.order_items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()}매
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Helper function
function getProductionStepName(step: string): string {
  const names: Record<string, string> = {
    'design_file_check': '디자인 파일 확인 (デザインファイル確認)',
    'printing': '인쇄 (印刷)',
    'lamination': '라미네이션 (ラミネート)',
    'slitting': '슬릿 (スリット)',
    'pouch_making': '파우치 성형 (パウチ成形)',
    'qc_inspection': '품질 검사 (品質検査)',
    'packaging': '포장 (包装)'
  };
  return names[step] || step;
}
