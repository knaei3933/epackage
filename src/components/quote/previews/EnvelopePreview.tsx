'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Maximize2 } from 'lucide-react';
import DOMPurify from 'dompurify';

// 素材ID → 見た目色味マッピング（半透明オーバーレイ用）
// 「色」の定義: 素材の見た目色（印刷色数は対象外＝デザイン依存で図反映不可）
// AL(アルミ)系 = 銀 / VMPET(蒸着)系 = 銀（やや暖色）/ クラフト系 = 茶色 /
// NY(ナイロン)系 = 薄黄 / PET+LLDPE 透明系 = クリア（クリアベースの薄青）
interface MaterialTint {
  label: string;
  color: string;   // 見た目色（オーバーレイ用 rgb）
  opacity: number; // オーバーレイ強度（0〜1）
}

const MATERIAL_TINTS: Record<string, MaterialTint> = {
  // AL（アルミ箔）系: 銀色（不透明に近いメタリック）
  'pet_al': { label: '銀（アルミ）', color: '192,197,202', opacity: 0.45 },
  'pet_ny_al': { label: '銀（アルミ）', color: '192,197,202', opacity: 0.45 },
  // VMPET（アルミ蒸着）系: 銀色（やや暖色）
  'pet_vmpet': { label: '銀（蒸着）', color: '186,190,196', opacity: 0.4 },
  'kraft_vmpet_lldpe': { label: '茶（クラフト+蒸着）', color: '160,120,75', opacity: 0.5 },
  // クラフト紙系: 茶色
  'kraft_pet_lldpe': { label: '茶（クラフト）', color: '170,130,80', opacity: 0.5 },
  // NY（ナイロン）系: 薄い黄み
  'ny_lldpe': { label: 'クリア（NY）', color: '210,205,180', opacity: 0.18 },
  // PET+LLDPE 透明系: クリア（クリアベースの薄青）
  'pet_ldpe': { label: 'クリア（透明）', color: '180,210,230', opacity: 0.12 }
};

// 素材色味を取得（未定義IDはクリア）
const getMaterialTint = (materialId?: string): MaterialTint | null => {
  if (!materialId) return null;
  return MATERIAL_TINTS[materialId] || null;
};

// 後加工オーバーレイ表示判定（ジッパー / スパウト / ノッチのみ図反映対象）
const hasPostProcessing = (options: string[], key: string): boolean =>
  options.some(opt => opt.includes(key));

// 素材ラベルマッピング
const MATERIAL_TYPE_LABELS_JA: Record<string, string> = {
  'pet_ldpe': 'PET LLDPE',
  'pet_al': 'PET AL',
  'pet_vmpet': 'PET VMPET',
  'pet_ny_al': 'PET NY AL',
  'ny_lldpe': 'NY LLDPE',
  'kraft_vmpet_lldpe': 'クラフト VMPET LLDPE',
  'kraft_pet_lldpe': 'クラフト PET LLDPE'
};

// 厚さラベルマッピング
const THICKNESS_LABELS: Record<string, string> = {
  'light': '軽量タイプ',
  'light_50': '軽量タイプ (~50g)',
  'medium': '標準タイプ',
  'standard_70': '標準タイプ (~200g)',
  'standard': 'レギュラータイプ',
  'heavy_90': '高耐久タイプ (~500g)',
  'heavy': '高耐久タイプ',
  'ultra_100': '超耐久タイプ (~800g)',
  'ultra': '超耐久タイプ',
  'maximum_110': 'マキシマムタイプ (800g~)'
};

// フィルム構成を取得する関数
// pouch-cost-calculator.tsのgetDefaultFilmLayersと厚さ設定を統一
const getFilmStructureSpec = (materialId: string, thicknessId: string): string => {
  // pouch-cost-calculator.tsのthicknessMapとMaterialSelection.tsxのドロップダウン表示値に統一
  const lldpeThicknessMap: Record<string, number> = {
    'light': 50,    // 軽量タイプ (~100g)
    'medium': 70,   // 標準タイプ (~300g)
    'standard': 90, // レギュラータイプ (~500g)
    'heavy': 100,   // 高耐久タイプ (~800g)
    'ultra': 110    // 超耐久タイプ (800g~)
  };

  const materials = [
    {
      id: 'pet_al',
      thicknessOptions: [
        { id: 'light', specificationEn: `PET 12μ + AL 7μ + PET 12μ + LLDPE ${lldpeThicknessMap.light}μ` },
        { id: 'medium', specificationEn: `PET 12μ + AL 7μ + PET 12μ + LLDPE ${lldpeThicknessMap.medium}μ` },
        { id: 'standard', specificationEn: `PET 12μ + AL 7μ + PET 12μ + LLDPE ${lldpeThicknessMap.standard}μ` },
        { id: 'heavy', specificationEn: `PET 12μ + AL 7μ + PET 12μ + LLDPE ${lldpeThicknessMap.heavy}μ` },
        { id: 'ultra', specificationEn: `PET 12μ + AL 7μ + PET 12μ + LLDPE ${lldpeThicknessMap.ultra}μ` }
      ]
    },
    {
      id: 'pet_vmpet',
      thicknessOptions: [
        { id: 'light', specificationEn: `PET 12μ + VMPET 12μ + PET 12μ + LLDPE ${lldpeThicknessMap.light}μ` },
        { id: 'medium', specificationEn: `PET 12μ + VMPET 12μ + PET 12μ + LLDPE ${lldpeThicknessMap.medium}μ` },
        { id: 'heavy', specificationEn: `PET 12μ + VMPET 12μ + PET 12μ + LLDPE ${lldpeThicknessMap.heavy}μ` },
        { id: 'ultra', specificationEn: `PET 12μ + VMPET 12μ + PET 12μ + LLDPE ${lldpeThicknessMap.ultra}μ` },
        { id: 'maximum', specificationEn: `PET 12μ + VMPET 12μ + PET 12μ + LLDPE ${lldpeThicknessMap.ultra}μ` }
      ]
    },
    {
      id: 'pet_ldpe',
      thicknessOptions: [
        { id: 'light', specificationEn: `PET 12μ + LLDPE ${lldpeThicknessMap.light}μ` },
        { id: 'medium', specificationEn: `PET 12μ + LLDPE ${lldpeThicknessMap.medium}μ` },
        { id: 'standard', specificationEn: `PET 12μ + LLDPE ${lldpeThicknessMap.standard}μ` },
        { id: 'heavy', specificationEn: `PET 12μ + LLDPE ${lldpeThicknessMap.heavy}μ` },
        { id: 'ultra', specificationEn: `PET 12μ + LLDPE ${lldpeThicknessMap.ultra}μ` }
      ]
    },
    {
      id: 'pet_ny_al',
      thicknessOptions: [
        { id: 'light', specificationEn: `PET 12μ + NY 16μ + AL 7μ + LLDPE ${lldpeThicknessMap.light}μ` },
        { id: 'light_medium', specificationEn: `PET 12μ + NY 16μ + AL 7μ + LLDPE ${lldpeThicknessMap.medium}μ` },
        { id: 'medium', specificationEn: `PET 12μ + NY 16μ + AL 7μ + LLDPE ${lldpeThicknessMap.standard}μ` },
        { id: 'heavy', specificationEn: `PET 12μ + NY 16μ + AL 7μ + LLDPE ${lldpeThicknessMap.heavy}μ` },
        { id: 'ultra', specificationEn: `PET 12μ + NY 16μ + AL 7μ + LLDPE ${lldpeThicknessMap.ultra}μ` }
      ]
    },
    {
      id: 'ny_lldpe',
      thicknessOptions: [
        { id: 'light', specificationEn: `NY 15μ + LLDPE ${lldpeThicknessMap.light}μ` },
        { id: 'medium', specificationEn: `NY 15μ + LLDPE ${lldpeThicknessMap.medium}μ` },
        { id: 'heavy', specificationEn: `NY 15μ + LLDPE ${lldpeThicknessMap.heavy}μ` }
      ]
    },
    {
      id: 'kraft_vmpet_lldpe',
      thicknessOptions: [
        { id: 'light_50', specificationEn: `Kraft 80g/m² + VMPET 12μ + LLDPE ${lldpeThicknessMap.light}μ` },
        { id: 'standard_70', specificationEn: `Kraft 80g/m² + VMPET 12μ + LLDPE ${lldpeThicknessMap.medium}μ` },
        { id: 'heavy_90', specificationEn: `Kraft 80g/m² + VMPET 12μ + LLDPE ${lldpeThicknessMap.heavy}μ` },
        { id: 'ultra_100', specificationEn: `Kraft 80g/m² + VMPET 12μ + LLDPE ${lldpeThicknessMap.ultra}μ` },
        { id: 'maximum_110', specificationEn: `Kraft 80g/m² + VMPET 12μ + LLDPE ${lldpeThicknessMap.ultra}μ` }
      ]
    },
    {
      id: 'kraft_pet_lldpe',
      thicknessOptions: [
        { id: 'light_50', specificationEn: `Kraft 80g/m² + PET 12μ + LLDPE ${lldpeThicknessMap.light}μ` },
        { id: 'standard_70', specificationEn: `Kraft 80g/m² + PET 12μ + LLDPE ${lldpeThicknessMap.medium}μ` },
        { id: 'heavy_90', specificationEn: `Kraft 80g/m² + PET 12μ + LLDPE ${lldpeThicknessMap.heavy}μ` },
        { id: 'ultra_100', specificationEn: `Kraft 80g/m² + PET 12μ + LLDPE ${lldpeThicknessMap.ultra}μ` },
        { id: 'maximum_110', specificationEn: `Kraft 80g/m² + PET 12μ + LLDPE ${lldpeThicknessMap.ultra}μ` }
      ]
    }
  ];

  const material = materials.find(m => m.id === materialId);
  if (material) {
    const thickness = material.thicknessOptions.find(t => t.id === thicknessId);
    if (thickness) {
      return thickness.specificationEn;
    }
  }
  return '指定なし';
};

// スパウト位置ラベル
const SPOUT_POSITION_LABELS: Record<string, string> = {
  'top-left': '左上',
  'top-center': '上中央',
  'top-right': '右上'
};

interface EnvelopeDimensions {
  width: number;
  height: number;
  depth: number;
  pitch?: number;
  sideWidth?: number; // 側面 (よこめん) - for box_pouch, lap_seal
}

interface EnvelopePreviewProps {
  bagTypeId: string;
  dimensions: EnvelopeDimensions;
  productCategory?: string;
  contentsType?: string;
  mainIngredient?: string;
  distributionEnvironment?: string;
  materialId?: string;
  thicknessSelection?: string;
  postProcessingOptions?: string[];
  spoutPosition?: string;
}

// 封筒タイプ別プレビュー設定
const bagTypeConfigs = {
  'flat_3_side': {
    name: '平袋',
    aspectRatio: 1.5,
    baseWidth: 200,
    baseHeight: 300,
    color: '#4A5568',
    previewImage: '/images/processing-icons/flat-3-side.png'
  },
  'stand_up': {
    name: 'スタンドパウチ',
    aspectRatio: 1.2,
    baseWidth: 200,
    baseHeight: 240,
    color: '#2B6CB0',
    hasGusset: true,
    previewImage: '/images/processing-icons/flat-3-side-stand.png'
  },
  'lap_seal': {
    name: '合掌袋',
    aspectRatio: 1.5,
    baseWidth: 200,
    baseHeight: 300,
    color: '#718096',
    previewImage: '/images/processing-icons/gusset.png'
  },
  'box': {
    name: 'ボックス型パウチ',
    aspectRatio: 1.0,
    baseWidth: 200,
    baseHeight: 200,
    color: '#2F855A',
    previewImage: '/images/processing-icons/box-pouch.png'
  },
  'spout_pouch': {
    name: 'スパウトパウチ',
    aspectRatio: 1.4,
    baseWidth: 200,
    baseHeight: 280,
    color: '#D69E2E',
    previewImage: '/images/processing-icons/spout.png'
  },
  'roll_film': {
    name: 'ロールフィルム',
    aspectRatio: 3.0,
    baseWidth: 300,
    baseHeight: 100,
    color: '#805AD5',
    previewImage: '/images/processing-icons/roll-film.png'
  }
};

const EnvelopePreview: React.FC<EnvelopePreviewProps> = ({
  bagTypeId,
  dimensions,
  productCategory,
  contentsType,
  mainIngredient,
  distributionEnvironment,
  materialId,
  thicknessSelection,
  postProcessingOptions = [],
  spoutPosition
}) => {
  const config = bagTypeConfigs[bagTypeId as keyof typeof bagTypeConfigs];

  if (!config) return null;

  // 実際の封筒比率計算（実寸 W/H 比率。未入力時は袋タイプ既定比率）
  const actualRatio = dimensions.width > 0 && dimensions.height > 0
    ? dimensions.width / dimensions.height
    : config.aspectRatio;

  // プレビュー領域（300×300 正方形コンテナ）内に、実寸比率で縮尺表示するサイズを計算。
  // 縦長・横長どちらでもコンテナに収まるよう、長辺を最大辺に合わせる。
  const PREVIEW_BOX = 300;
  const previewWidth = actualRatio >= 1 ? PREVIEW_BOX : PREVIEW_BOX * actualRatio;
  const previewHeight = actualRatio >= 1 ? PREVIEW_BOX / actualRatio : PREVIEW_BOX;

  // 素材の見た目色味（オーバーレイ用）
  const materialTint = getMaterialTint(materialId);

  // 後加工オーバーレイ表示判定
  const showZipper = hasPostProcessing(postProcessingOptions, 'zipper');
  const showSpout = hasPostProcessing(postProcessingOptions, 'spout') || bagTypeId === 'spout_pouch';
  const showNotch = hasPostProcessing(postProcessingOptions, 'notch');

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* プレビューヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 min-w-0">
          <Package className="w-5 h-5 text-navy-600 flex-shrink-0" />
          <h3 className="font-semibold text-gray-900 whitespace-nowrap">袋のプレビュー</h3>
        </div>
        <div className="flex items-center space-x-1 text-xs text-gray-500 flex-shrink-0">
          <Maximize2 className="w-3 h-3" />
          <span className="whitespace-nowrap">リアルタイム</span>
        </div>
      </div>

      {/* プレビュー領域 */}
      <div className="flex justify-center mb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${bagTypeId}-${dimensions.width}-${dimensions.height}`}
            className="relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              duration: 0.3,
              scale: { type: "spring", stiffness: 300, damping: 30 }
            }}
          >
            {/* 封筒プレビュー - 300×300 固定コンテナ（実寸比率で縮尺表示） */}
            <div
              className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-white flex items-center justify-center"
              style={{
                width: '300px',
                height: '300px',
                borderColor: config.color
              }}
            >
              {/* 実寸比率で縮尺された袋レイヤ（静的PNG + 色味オーバーレイ） */}
              <div
                className="relative"
                style={{
                  width: `${previewWidth}px`,
                  height: `${previewHeight}px`,
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              >
                {/* 実際の封筒イメージ（静的PNGは維持） */}
                <img
                  src={config.previewImage}
                  alt={config.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // 画像読み込み失敗時フォールバックで抽象形態表示
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'absolute inset-0 flex items-center justify-center';
                      fallback.style.backgroundColor = `${config.color}15`;
                      // ✅ Sanitize HTML to prevent XSS
                      fallback.innerHTML = DOMPurify.sanitize(`
                        <div class="text-center">
                          <div class="text-sm text-gray-500">${config.name}</div>
                          <div class="text-xs text-gray-400 mt-1">イメージ読み込みエラー</div>
                        </div>
                      `);
                      parent.appendChild(fallback);
                    }
                  }}
                />

                {/* 素材色味オーバーレイ（素材IDに応じた見た目色） */}
                {materialTint && (
                  <div
                    className="absolute inset-0 pointer-events-none rounded-sm mix-blend-multiply"
                    style={{
                      backgroundColor: `rgba(${materialTint.color}, ${materialTint.opacity})`
                    }}
                    title={`素材色味: ${materialTint.label}`}
                  />
                )}

                {/* 後加工オーバーレイ: ジッパー（袋上部のライン） */}
                {showZipper && (
                  <div
                    className="absolute left-0 right-0 pointer-events-none flex items-center"
                    style={{ top: '8%', height: '6%' }}
                    title="ジッパー"
                  >
                    <div
                      className="w-full rounded-sm"
                      style={{
                        height: '100%',
                        background: 'repeating-linear-gradient(90deg, #4A5568 0 4px, #CBD5E0 4px 8px)',
                        border: '1px solid #4A5568'
                      }}
                    />
                  </div>
                )}

                {/* 後加工オーバーレイ: スパウト（袋上部中央の円筒） */}
                {showSpout && (
                  <div
                    className="absolute left-1/2 pointer-events-none flex flex-col items-center"
                    style={{ top: '-4%', transform: 'translateX(-50%)' }}
                    title="スパウト"
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '14px',
                        borderRadius: '3px 3px 0 0',
                        backgroundColor: '#A0AEC0',
                        border: '1px solid #4A5568'
                      }}
                    />
                    <div
                      style={{
                        width: '32px',
                        height: '4px',
                        backgroundColor: '#718096',
                        border: '1px solid #4A5568'
                      }}
                    />
                  </div>
                )}

                {/* 後加工オーバーレイ: ノッチ（袋上部両端のV字切り欠き） */}
                {showNotch && (
                  <>
                    <svg
                      className="absolute pointer-events-none"
                      style={{ top: '14%', left: '0' }}
                      width="14" height="14" viewBox="0 0 14 14"
                      role="img"
                      aria-label="ノッチ"
                    >
                      <title>ノッチ</title>
                      <polyline points="0,0 7,7 0,14" fill="none" stroke="#E53E3E" strokeWidth="2" />
                    </svg>
                    <svg
                      className="absolute pointer-events-none"
                      style={{ top: '14%', right: '0' }}
                      width="14" height="14" viewBox="0 0 14 14"
                      role="img"
                      aria-label="ノッチ"
                    >
                      <title>ノッチ</title>
                      <polyline points="14,0 7,7 14,14" fill="none" stroke="#E53E3E" strokeWidth="2" />
                    </svg>
                  </>
                )}
              </div>

              {/* 比率メモ（縮尺参照用、控えめ表示） */}
              {dimensions.width > 0 && dimensions.height > 0 && (
                <div className="absolute bottom-1 right-2 text-[10px] text-gray-400 font-mono pointer-events-none">
                  {actualRatio.toFixed(2)}:1
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 仕様情報 */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        {/* サイズ情報 */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">サイズ</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">タイプ</span>
              <span className="font-medium text-gray-900">{config.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">実寸</span>
              <span className="font-medium text-gray-900">
                {bagTypeId === 'roll_film' ? (
                  `幅: ${dimensions.width}mm`
                ) : (
                  <>
                    {dimensions.width}×{dimensions.height}
                    {(dimensions.depth > 0 && bagTypeId !== 'lap_seal') && `×${dimensions.depth}`}
                    {dimensions.sideWidth && `×側面${dimensions.sideWidth}`}mm
                  </>
                )}
              </span>
            </div>
            {/* ロールフィルム: ピッチ表示 */}
            {bagTypeId === 'roll_film' && dimensions.pitch && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ピッチ</span>
                <span className="font-medium text-gray-900">{dimensions.pitch}mm</span>
              </div>
            )}
            {/* スパウトパウチ: スパウト位置表示 */}
            {bagTypeId === 'spout_pouch' && spoutPosition && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">スパウト位置</span>
                <span className="font-medium text-gray-900">
                  {SPOUT_POSITION_LABELS[spoutPosition] || spoutPosition}
                </span>
              </div>
            )}
            {bagTypeId !== 'roll_film' && dimensions.width > 0 && dimensions.height > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">面積</span>
                <span className="font-medium text-gray-900">
                  {(dimensions.width * dimensions.height / 1000).toFixed(1)}cm²
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 素材・フィルム構成情報 */}
        {materialId && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">素材・構成</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">素材</span>
                <span className="font-medium text-gray-900">
                  {MATERIAL_TYPE_LABELS_JA[materialId] || materialId}
                </span>
              </div>
              {thicknessSelection && (
                <div className="flex flex-col gap-1">
                  <span className="text-gray-600 text-xs">フィルム構成</span>
                  <span className="font-medium text-gray-900 text-xs leading-relaxed">
                    {getFilmStructureSpec(materialId, thicknessSelection)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 後加工オプション */}
        {(() => {
          if (!postProcessingOptions || postProcessingOptions.length === 0) return null;
          // 表示対象オプションをフィルタ
          const displayOptions = [
            'zipper',
            'notch-straight',
            'hang-hole-6mm',
            'hang-hole-8mm',
            'corner-round',
            'corner-square',
            'valve-yes',
            'easy-cut-yes',
            'matte',
            'glossy'
          ];
          const optionLabels: Record<string, string> = {
            'zipper': 'ジッパー',
            'notch-straight': '直線ノッチ',
            'hang-hole-6mm': '吊り穴(6mm)',
            'hang-hole-8mm': '吊り穴(8mm)',
            'corner-round': '角丸(R5)',
            'corner-square': '角切り(R0)',
            'valve-yes': 'ガスバルブ',
            'easy-cut-yes': 'イージーカット',
            'matte': 'マット',
            'glossy': '光沢'
          };
          // フィルタ後のリスト（フィルタ前ではなく、フィルタ後の長さで「なし」を判定）
          const visibleOptions = postProcessingOptions.filter(option =>
            displayOptions.some(display => option.includes(display))
          );
          return (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">後加工</h4>
              <div className="flex flex-wrap gap-1.5">
                {visibleOptions.length === 0 ? (
                  <span className="text-xs text-gray-400 italic">なし</span>
                ) : (
                  visibleOptions.map((option) => {
                    // オプションIDからラベルを取得
                    const label = Object.entries(optionLabels).find(([key]) => option.includes(key))?.[1] || option;
                    return (
                      <span
                        key={option}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white text-gray-700 border border-gray-300 shadow-sm"
                        title={label}
                      >
                        {label}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* 通知メッセージ */}
      {dimensions.width === 0 || dimensions.height === 0 ? (
        <motion.div
          className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          幅と高さを入力すると、実際のサイズでプレビューが表示されます。
        </motion.div>
      ) : (
        <motion.div
          className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          {(() => {
            const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
              'food': '食品',
              'health_supplement': '健康食品',
              'cosmetic': '化粧品',
              'quasi_drug': '医薬部外品',
              'drug': '医薬品',
              'other': 'その他'
            };
            const CONTENTS_TYPE_LABELS: Record<string, string> = {
              'solid': '固体',
              'powder': '粉体',
              'liquid': '液体'
            };
            const MAIN_INGREDIENT_LABELS: Record<string, string> = {
              'general_neutral': '一般/中性',
              'oil_surfactant': 'オイル/界面活性剤',
              'acidic_salty': '酸性/塩分',
              'volatile_fragrance': '揮発性/香料',
              'other': 'その他'
            };
            const DISTRIBUTION_ENVIRONMENT_LABELS: Record<string, string> = {
              'general_roomTemp': '一般/常温',
              'light_oxygen_sensitive': '光/酸素敏感',
              'refrigerated': '冷凍保管',
              'high_temp_sterilized': '高温殺菌',
              'other': 'その他'
            };
            const categoryLabel = PRODUCT_CATEGORY_LABELS[productCategory || ''] || '';
            const typeLabel = CONTENTS_TYPE_LABELS[contentsType || ''] || '';
            const ingredientLabel = MAIN_INGREDIENT_LABELS[mainIngredient || ''] || '';
            const environmentLabel = DISTRIBUTION_ENVIRONMENT_LABELS[distributionEnvironment || ''] || '';
            const contentsDisplay = (categoryLabel && typeLabel && ingredientLabel && environmentLabel)
              ? `${categoryLabel}（${typeLabel}） / ${ingredientLabel} / ${environmentLabel}`
              : '';
            return contentsDisplay ? (
              <div className="mb-2">内容物: {contentsDisplay}</div>
            ) : null;
          })()}
          サイズを変更するとリアルタイムで更新されます。
        </motion.div>
      )}
    </div>
  );
};

export default EnvelopePreview;