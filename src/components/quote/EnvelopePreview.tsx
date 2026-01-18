'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Maximize2 } from 'lucide-react';
import DOMPurify from 'dompurify';

interface EnvelopeDimensions {
  width: number;
  height: number;
  depth: number;
}

interface EnvelopePreviewProps {
  bagTypeId: string;
  dimensions: EnvelopeDimensions;
}

// 封筒タイプ別プレビュー設定
const bagTypeConfigs = {
  'flat_3_side': {
    name: '平袋',
    aspectRatio: 1.5,
    baseWidth: 200,
    baseHeight: 300,
    color: '#4A5568',
    previewImage: '/images/processing-icons/三方.png'
  },
  'stand_up': {
    name: 'スタンドパウチ',
    aspectRatio: 1.2,
    baseWidth: 200,
    baseHeight: 240,
    color: '#2B6CB0',
    hasGusset: true,
    previewImage: '/images/processing-icons/三方スタンド.png'
  },
  'lap_seal': {
    name: '合掌袋',
    aspectRatio: 1.5,
    baseWidth: 200,
    baseHeight: 300,
    color: '#718096',
    previewImage: '/images/processing-icons/合掌.png'
  },
  'box': {
    name: 'ボックス型パウチ',
    aspectRatio: 1.0,
    baseWidth: 200,
    baseHeight: 200,
    color: '#2F855A',
    previewImage: '/images/processing-icons/ボックス型パウチ.png'
  },
  'spout_pouch': {
    name: 'スパウトパウチ',
    aspectRatio: 1.4,
    baseWidth: 200,
    baseHeight: 280,
    color: '#D69E2E',
    previewImage: '/images/processing-icons/スパウト.png'
  },
  'roll_film': {
    name: 'ロールフィルム',
    aspectRatio: 3.0,
    baseWidth: 300,
    baseHeight: 100,
    color: '#805AD5',
    previewImage: '/images/processing-icons/ロールフィルム.png'
  }
};

const EnvelopePreview: React.FC<EnvelopePreviewProps> = ({ bagTypeId, dimensions }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const config = bagTypeConfigs[bagTypeId as keyof typeof bagTypeConfigs];

  // サイズ変更アニメーショントリガー
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [dimensions]);

  if (!config) return null;

  // 実際の封筒比率計算
  const actualRatio = dimensions.width > 0 && dimensions.height > 0
    ? dimensions.width / dimensions.height
    : config.aspectRatio;

  // プレビューサイズ計算 (最大300px幅基準)
  const maxPreviewWidth = 300;
  const previewWidth = Math.min(maxPreviewWidth, config.baseWidth);
  const previewHeight = previewWidth / actualRatio;

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* プレビューヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Package className="w-5 h-5 text-navy-600" />
          <h3 className="font-semibold text-gray-900">袋のプレビュー</h3>
        </div>
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Maximize2 className="w-3 h-3" />
          <span>リアルタイム</span>
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
            {/* 封筒プレビュー */}
            <div
              className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-white"
              style={{
                width: `${previewWidth}px`,
                height: `${previewHeight}px`,
                borderColor: config.color
              }}
            >
              {/* 実際の封筒イメージ */}
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

              {/* サイズ情報オーバーレイ */}
              <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-70 text-white rounded px-2 py-1">
                <div className="text-xs font-semibold text-center leading-tight">
                  {bagTypeId === 'roll_film' ? (
                    <>幅: {dimensions.width}mm</>
                  ) : (
                    <>
                      幅: {dimensions.width}mm<br />
                      高さ: {dimensions.height}mm
                      {dimensions.depth > 0 && <><br />奥行: {dimensions.depth}mm</>}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 改善されたサイズライン表示 */}
            <motion.div
              className="absolute -top-12 left-0 right-0 flex justify-center text-xs text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: isAnimating ? [1, 0.5, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
                {bagTypeId === 'roll_film' ? (
                  `幅: ${dimensions.width}mm`
                ) : (
                  <>
                    幅: {dimensions.width}mm | 高さ: {dimensions.height}mm
                    {dimensions.depth > 0 && ` | 奥行: ${dimensions.depth}mm`}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 封筒情報 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">タイプ:</span>
            <span className="font-medium text-gray-900">{config.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">実寸:</span>
            <span className="font-medium text-gray-900">
              {bagTypeId === 'roll_film' ? (
                `幅: ${dimensions.width}mm`
              ) : (
                <>
                  {dimensions.width}×{dimensions.height}
                  {dimensions.depth > 0 && `×${dimensions.depth}`}mm
                </>
              )}
            </span>
          </div>
          {bagTypeId !== 'roll_film' && dimensions.width > 0 && dimensions.height > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">面積:</span>
              <span className="font-medium text-gray-900">
                {(dimensions.width * dimensions.height / 1000).toFixed(1)}cm²
              </span>
            </div>
          )}
        </div>
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
          現在の設定でプレビューが表示されています。サイズを変更するとリアルタイムで更新されます。
        </motion.div>
      )}
    </motion.div>
  );
};

export default EnvelopePreview;