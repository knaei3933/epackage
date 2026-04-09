/**
 * PostProcessingPositionDisplay Component
 *
 * 後加工位置表示コンポーネント
 * - 韓国人デザイナーが入力した後加工位置を表示
 * - 顧客が最終的な後加工位置を確認
 * - 日本語UIで視覚的に表示
 *
 * @client
 */

'use client';

import { Ruler, Scissors, Circle, Package, MapPin } from 'lucide-react';

// =====================================================
// Types
// =====================================================

interface PostProcessingPositionData {
  notch_top?: string | null;
  notch_bottom?: string | null;
  hang_hole_diameter?: string | null;
  hang_hole_position?: string | null;
  zipper_position?: string | null;
  print_position?: string | null;
  special_processing?: string | null;
  input_by_name?: string | null;
}

interface PostProcessingPositionDisplayProps {
  skuName: string;
  data: PostProcessingPositionData;
}

// =====================================================
// Helper Components
// =====================================================

interface PositionItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}

function PositionItem({ icon, label, value }: PositionItemProps) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-base font-semibold text-gray-900 break-words">{value}</p>
      </div>
    </div>
  );
}

// =====================================================
// Component
// =====================================================

export function PostProcessingPositionDisplay({
  skuName,
  data,
}: PostProcessingPositionDisplayProps) {
  // 检查是否有任何数据
  const hasData = Object.values(data).some(
    val => val !== null && val !== undefined && val !== ''
  );

  if (!hasData) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <Ruler className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600">後加工位置情報がまだ入力されていません</p>
        <p className="text-sm text-gray-500 mt-1">
          韓国人デザイナーが校正データと一緒に入力します
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* SKU名 */}
      <div className="border-b border-gray-200 pb-3">
        <h4 className="font-bold text-gray-900 text-lg">{skuName}</h4>
        {data.input_by_name && (
          <p className="text-sm text-gray-600 mt-1">
            入力者: {data.input_by_name}
          </p>
        )}
      </div>

      {/* ノッチ位置 */}
      {(data.notch_top || data.notch_bottom) && (
        <div className="space-y-2">
          <h5 className="font-semibold text-gray-800 flex items-center gap-2">
            <Scissors className="w-4 h-4" />
            ノッチ位置
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.notch_top && (
              <PositionItem
                icon={<span className="text-xs">⬇️</span>}
                label="上から"
                value={data.notch_top}
              />
            )}
            {data.notch_bottom && (
              <PositionItem
                icon={<span className="text-xs">⬆️</span>}
                label="下から"
                value={data.notch_bottom}
              />
            )}
          </div>
        </div>
      )}

      {/* 吊り下げ加工 */}
      {(data.hang_hole_diameter || data.hang_hole_position) && (
        <div className="space-y-2">
          <h5 className="font-semibold text-gray-800 flex items-center gap-2">
            <Circle className="w-4 h-4" />
            吊り下げ加工
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.hang_hole_diameter && (
              <PositionItem
                icon={<span className="text-xs">⭕</span>}
                label="穴径"
                value={data.hang_hole_diameter}
              />
            )}
            {data.hang_hole_position && (
              <PositionItem
                icon={<span className="text-xs">📍</span>}
                label="位置"
                value={data.hang_hole_position}
              />
            )}
          </div>
        </div>
      )}

      {/* チャック位置 */}
      {data.zipper_position && (
        <div className="space-y-2">
          <h5 className="font-semibold text-gray-800 flex items-center gap-2">
            <Package className="w-4 h-4" />
            チャック位置
          </h5>
          <PositionItem
            icon={<span className="text-xs">📏</span>}
            label="位置"
            value={data.zipper_position}
          />
        </div>
      )}

      {/* 印刷位置 */}
      {data.print_position && (
        <div className="space-y-2">
          <h5 className="font-semibold text-gray-800 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            印刷位置
          </h5>
          <PositionItem
            icon={<span className="text-xs">�️</span>}
            label="位置"
            value={data.print_position}
          />
        </div>
      )}

      {/* その他特殊加工 */}
      {data.special_processing && (
        <div className="space-y-2">
          <h5 className="font-semibold text-gray-800">その他特殊加工</h5>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-gray-800 break-words">{data.special_processing}</p>
          </div>
        </div>
      )}
    </div>
  );
}
