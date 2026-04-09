/**
 * PostProcessingPositionInput Component
 *
 * 後加工位置入力コンポーネント
 * - 韓国人デザイナーが後加工位置を入力
 * - SKUごとに位置情報を管理
 * - 日本語と韓国語のバイリンガルUI
 *
 * @client
 */

'use client';

import { useState } from 'react';
import { Ruler, Scissors, Circle, Package, MapPin } from 'lucide-react';

// =====================================================
// Types
// =====================================================

interface PostProcessingPositionData {
  notch_top?: string;
  notch_bottom?: string;
  hang_hole_diameter?: string;
  hang_hole_position?: string;
  zipper_position?: string;
  print_position?: string;
  special_processing?: string;
}

interface PostProcessingPositionInputProps {
  skuName: string;
  initialData?: PostProcessingPositionData;
  onSave: (data: PostProcessingPositionData) => void;
  disabled?: boolean;
}

// =====================================================
// Component
// =====================================================

export function PostProcessingPositionInput({
  skuName,
  initialData = {},
  onSave,
  disabled = false,
}: PostProcessingPositionInputProps) {
  const [formData, setFormData] = useState<PostProcessingPositionData>(initialData);

  const handleChange = (field: keyof PostProcessingPositionData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-6 bg-white rounded-lg p-6 border border-gray-200">
      {/* ヘッダー */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Ruler className="w-5 h-5 text-blue-600" />
          後加工位置情報入력 / 후가공 위치 입력
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          SKU: {skuName}
        </p>
      </div>

      {/* ノッチ位置 */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
          <Scissors className="w-4 h-4 text-gray-600" />
          ノッチ位置 / 노치 위치
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              上から / 위에서
            </label>
            <input
              type="text"
              value={formData.notch_top || ''}
              onChange={(e) => handleChange('notch_top', e.target.value)}
              placeholder="例: 20mm / 예: 20mm"
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              下から / 아래에서
            </label>
            <input
              type="text"
              value={formData.notch_bottom || ''}
              onChange={(e) => handleChange('notch_bottom', e.target.value)}
              placeholder="例: 15mm / 예: 15mm"
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* 吊り下げ加工 */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
          <Circle className="w-4 h-4 text-gray-600" />
          吊り下げ加工 / 현수공加工
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              穴径 / 구멍 지름
            </label>
            <select
              value={formData.hang_hole_diameter || ''}
              onChange={(e) => handleChange('hang_hole_diameter', e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">選択してください / 선택하세요</option>
              <option value="6mm">6mm / 6mm</option>
              <option value="8mm">8mm / 8mm</option>
              <option value="10mm">10mm / 10mm</option>
              <option value="その他 / 기타">その他 / 기타</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              位置 / 위치
            </label>
            <input
              type="text"
              value={formData.hang_hole_position || ''}
              onChange={(e) => handleChange('hang_hole_position', e.target.value)}
              placeholder="例: 上から15mm / 예: 위에서 15mm"
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* チャック位置 */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-600" />
          チャック位置 / 지퍼 위치
        </h4>
        <div>
          <input
            type="text"
            value={formData.zipper_position || ''}
            onChange={(e) => handleChange('zipper_position', e.target.value)}
            placeholder="例: 上から30mm / 예: 위에서 30mm"
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* 印刷位置 */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-600" />
          印刷位置 / 인쇄 위치
        </h4>
        <div>
          <input
            type="text"
            value={formData.print_position || ''}
            onChange={(e) => handleChange('print_position', e.target.value)}
            placeholder="印刷位置を入力してください / 인쇄 위치를 입력하세요"
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* その他特殊加工 */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800">
          その他特殊加工 / 기타 특수가공
        </h4>
        <div>
          <textarea
            value={formData.special_processing || ''}
            onChange={(e) => handleChange('special_processing', e.target.value)}
            placeholder="特殊加工に関するメモを入力してください / 특수가공에 대한 메모를 입력하세요"
            disabled={disabled}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* 保存ボタン */}
      {!disabled && (
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            保存する / 저장하기
          </button>
        </div>
      )}
    </div>
  );
}
