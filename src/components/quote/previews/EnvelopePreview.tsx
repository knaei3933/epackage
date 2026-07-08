'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Maximize2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import { getFilmStructureLabel } from '@/constants/materialTypes';

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

// フィルム実構成ラベルは materialTypes.ts の getFilmStructureLabel（単一データソース: materialData.ts）を使用。
// 本ファイルでのローカル再定義・THICKNESS_LABELS（旧厚さラベル）は廃止済み。

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
  sealWidth?: string;
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
  materialId,
  thicknessSelection,
  postProcessingOptions = [],
  spoutPosition,
  sealWidth
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
              {/* 実寸比率で縮尺された袋レイヤ（静的PNG） */}
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
              </div>
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
                    {getFilmStructureLabel(materialId, thicknessSelection)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 後加工オプション */}
        {(() => {
          if (!postProcessingOptions || postProcessingOptions.length === 0) return null;
          // 表示対象オプションの完全IDリスト
          // 正規表現 `^id(-|$)` で先頭完全一致させるため、部分一致による誤表示を防ぐ
          const displayOptions = [
            'zipper-yes',
            'zipper-no',
            'glossy',
            'matte',
            'notch-yes',
            'notch-straight',
            'notch-no',
            'hang-hole-6mm',
            'hang-hole-8mm',
            'hang-hole-no',
            'corner-round',
            'corner-square',
            'valve-yes',
            'valve-no',
            'top-open',
            'bottom-open',
            'sealing-width-5mm',
            'sealing-width-7-5mm',
            'sealing-width-10mm',
            'machi-printing-yes',
            'machi-printing-no',
            'spout-size-9',
            'spout-size-15',
            'spout-size-18',
            'spout-size-22',
            'spout-size-28'
          ];
          const optionLabels: Record<string, string> = {
            'zipper-yes': 'ジッパー',
            'zipper-no': 'ジッパーなし',
            'glossy': '光沢',
            'matte': 'マット',
            'notch-yes': 'Vノッチ',
            'notch-straight': '直線ノッチ',
            'notch-no': 'ノッチなし',
            'hang-hole-6mm': '吊り穴(6mm)',
            'hang-hole-8mm': '吊り穴(8mm)',
            'hang-hole-no': '吊り穴なし',
            'corner-round': '角丸(R5)',
            'corner-square': '角切り(R0)',
            'valve-yes': 'ガスバルブ',
            'valve-no': 'バルブなし',
            'top-open': '上端開封',
            'bottom-open': '下端開封',
            'sealing-width-5mm': 'シール幅5mm',
            'sealing-width-7-5mm': 'シール幅7.5mm',
            'sealing-width-10mm': 'シール幅10mm',
            'machi-printing-yes': 'マチ印刷あり',
            'machi-printing-no': 'マチ印刷なし',
            'spout-size-9': 'スパウト9パイ',
            'spout-size-15': 'スパウト15パイ',
            'spout-size-18': 'スパウト18パイ',
            'spout-size-22': 'スパウト22パイ',
            'spout-size-28': 'スパウト28パイ'
          };

          // シール幅表示: sealWidth prop優先、なければ過去データ(sealing-width-*)から復元
          const sealWidthDisplay = sealWidth
            ? `シール幅${sealWidth}`
            : (() => {
                const sealOpt = postProcessingOptions.find(o => o.startsWith('sealing-width-'));
                if (!sealOpt) return null;
                const match = sealOpt.match(/sealing-width-(.+)$/);
                if (!match) return null;
                return `シール幅${match[1].replace('-', '.')}`;
              })();

          // 先頭完全一致（部分一致誤表示を防止: zipper-no が zipper に誤ヒットしない）
          let visibleOptions = postProcessingOptions.filter(option =>
            displayOptions.some(display => option === display || option.startsWith(display + '-'))
          );

          // sealWidth表示がある場合は sealing-width-* を重複回避で除外
          if (sealWidthDisplay) {
            visibleOptions = visibleOptions.filter(o => !o.startsWith('sealing-width-'));
          }

          // 表示項目リスト構築（シール幅は先頭）
          const displayItems: { key: string; label: string }[] = [];
          if (sealWidthDisplay) {
            displayItems.push({ key: 'seal-width', label: sealWidthDisplay });
          }
          visibleOptions.forEach(option => {
            displayItems.push({ key: option, label: optionLabels[option] || option });
          });

          if (displayItems.length === 0) return null;

          return (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">後加工</h4>
              <div className="flex flex-wrap gap-1.5">
                {displayItems.map((item) => (
                  <span
                    key={item.key}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white text-gray-700 border border-gray-300 shadow-sm"
                    title={item.label}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* 通知メッセージ */}
      {(dimensions.width === 0 || dimensions.height === 0) && (
        <motion.div
          className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          幅と高さを入力すると、実際のサイズでプレビューが表示されます。
        </motion.div>
      )}
    </div>
  );
};

export default EnvelopePreview;