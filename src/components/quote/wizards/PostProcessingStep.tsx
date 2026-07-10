import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Settings, Check } from 'lucide-react';
import { useQuote, useQuoteState, checkStepComplete, createStepSummary, getPostProcessingLimitStatusForState } from '@/contexts/QuoteContext';
import { getAvailableSealWidths, isGussetedBag } from '@/lib/sealing-data';

const SEALING_WIDTH_OPTIONS = [
  { id: '5mm', name: 'シール幅 5mm', value: '5mm', priceMultiplier: 1.0, previewImage: '/images/post-processing/seal_5.jpg' },
  { id: '7-5mm', name: 'シール幅 7.5mm', value: '7.5mm', priceMultiplier: 1.0, previewImage: '/images/post-processing/seal_7.5.jpg' },
  { id: '10mm', name: 'シール幅 10mm', value: '10mm', priceMultiplier: 1.0, previewImage: '/images/post-processing/seal_10.jpg' },
];


export function PostProcessingStep() {
  const state = useQuoteState();
  const { updatePostProcessing, setSealWidth } = useQuote();
  const getStepSummary = (step: string) => createStepSummary(state, () => getPostProcessingLimitStatusForState(state), step);

  // 底マチあり判定（3軸: bagTypeId + hasGusset + depth）※ sealing-data.ts の isGussetedBag で共通化
  const isGusseted = isGussetedBag(state.bagTypeId, state.hasGusset, state.depth);

  // 動的シール幅選択肢（Excel D24:J101 厳密一致・Rev.5 必須選択/自動決定/昇順）
  // 依存はプリミティブのみ（effectiveOptions 配列を依存にしない＝無限ループ回避）
  const FALLBACK_SEALING_OPTIONS = SEALING_WIDTH_OPTIONS;
  const effectiveSealingOptions = useMemo(
    () => {
      // depth undefined / 0 ガード（底マチなし）= 従来3択フォールバック
      if (state.depth === undefined || state.depth === 0) return FALLBACK_SEALING_OPTIONS;
      if (!state.width) return FALLBACK_SEALING_OPTIONS;
      const widths = isGusseted
        ? getAvailableSealWidths(state.width, state.depth)
        : [];
      // 底マチあり・Excel該当なし（空配列）= 従来3択フォールバック（必須選択）
      return widths.length > 0
        ? widths.map(n => ({
            id: `${n}mm`.replace('.', '-'),
            name: `シール幅 ${n}mm`,
            value: `${n}mm`,
            priceMultiplier: 1.0,
            previewImage: `/images/post-processing/seal_${n}.jpg`,
          }))
        : FALLBACK_SEALING_OPTIONS;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.width, state.depth, state.bagTypeId, state.hasGusset]
  );

  // 1候補時: 自動決定（useEffect）。複数候補/0候補時: 未選択を許容（必須選択は checkStepComplete で担保）
  useEffect(() => {
    if (!state.width || state.depth === undefined || state.depth === 0) return;
    const widths = isGusseted
      ? getAvailableSealWidths(state.width, state.depth)
      : [];
    if (widths.length === 1) {
      setSealWidth(`${widths[0]}mm`);
    }
  }, [state.width, state.depth, state.bagTypeId, state.hasGusset]);

  // ホバー状態管理（パターンA用）
  const [hoveredOption, setHoveredOption] = useState<{option: any; element: HTMLElement} | null>(null);

  // Define post-processing groups
  const groups = [
    {
      id: 'zipper',
      name: 'ジッパー',
      icon: '🔒',
      required: true,
      options: [
        { id: 'zipper-yes', name: 'ジッパー付き', multiplier: 1.15, previewImage: '/images/post-processing/1.ジッパーあり.png' },
        { id: 'zipper-no', name: 'ジッパーなし', multiplier: 1.0, previewImage: '/images/post-processing/1.ジッパーなし.png' }
      ]
    },
    {
      id: 'finish',
      name: '表面処理',
      icon: '✨',
      required: true,
      options: [
        { id: 'glossy', name: '光沢仕上げ', multiplier: 1.08, previewImage: '/images/post-processing/2.光沢.png' },
        { id: 'matte', name: 'マット仕上げ', multiplier: 1.05, previewImage: '/images/post-processing/2.マット.png' }
      ]
    },
    {
      id: 'notch',
      name: 'ノッチ',
      icon: '✂️',
      required: false,
      options: [
        { id: 'notch-yes', name: 'Vノッチ', multiplier: 1.03, previewImage: '/images/post-processing/3.ノッチあり.png' },
        { id: 'notch-no', name: 'ノッチなし', multiplier: 1.0, previewImage: '/images/post-processing/3.ノッチなし.png' }
      ]
    },
    {
      id: 'hang-hole',
      name: '吊り下げ穴加工',
      icon: '⭕',
      required: false,
      options: [
        { id: 'hang-hole-6mm', name: '吊り下げ穴 (6mm)', multiplier: 1.03, previewImage: '/images/post-processing/4.吊り穴あり.png' },
        { id: 'hang-hole-8mm', name: '吊り下げ穴 (8mm)', multiplier: 1.04, previewImage: '/images/post-processing/4.吊り穴あり.png' },
        { id: 'hang-hole-no', name: '吊り穴なし', multiplier: 1.0, previewImage: '/images/post-processing/4.吊り穴なし.png' }
      ]
    },
    {
      id: 'corner',
      name: '角加工',
      icon: '📐',
      required: false,
      options: [
        { id: 'corner-round', name: '角丸', multiplier: 1.06, previewImage: '/images/post-processing/5.角丸.png' },
        { id: 'corner-square', name: '角直角', multiplier: 1.0, previewImage: '/images/post-processing/5.角直.png' }
      ]
    },
    {
      id: 'valve',
      name: 'ガス抜きバルブ',
      icon: '⚙️',
      required: false,
      options: [
        { id: 'valve-no', name: 'バルブなし', multiplier: 1.0, previewImage: '/images/post-processing/バルブなし.png' },
        { id: 'valve-yes', name: 'バルブ付き', multiplier: 1.08, previewImage: '/images/post-processing/バルブあり.png' }
      ]
    },
    {
      id: 'opening',
      name: '開封位置',
      icon: '📍',
      required: false,
      options: [
        { id: 'top-open', name: '上端開封', multiplier: 1.02, previewImage: '/images/post-processing/6.上端オープン.png' },
        { id: 'bottom-open', name: '下端開封', multiplier: 1.03, previewImage: '/images/post-processing/6.下端オープン.png' }
      ]
    },
    {
      id: 'machi-printing',
      name: 'マチ印刷',
      icon: '🖨️',
      required: false,
      options: [
        { id: 'machi-printing-no', name: 'マチ印刷なし', multiplier: 1.0, previewImage: '/images/post-processing/マッチ印刷無し.png' },
        { id: 'machi-printing-yes', name: 'マチ印刷あり', multiplier: 1.05, previewImage: '/images/post-processing/マッチ印刷あり.png' }
      ]
    }
  ];

  // スパウトパウチ・ロールフィルムの場合は表面処理のみ表示
  // スタンドパウチ、ガゼットパウチ、スパウトパウチの場合は開封位置を上端開封のみに制限
  // スタンドパウチ、ガゼットパウチの場合のみマチ印刷オプションを表示
  const forceTopOpen = state.bagTypeId === 'stand_up' || state.bagTypeId === 'box' || state.bagTypeId === 'spout_pouch';
  const showMachiPrinting = state.bagTypeId === 'stand_up' || state.bagTypeId === 'box';

  const visibleGroups = state.bagTypeId === 'spout_pouch' || state.bagTypeId === 'roll_film'
    ? groups.filter(g => g.id === 'finish')
    : groups.filter(g => {
        // 合掌袋・ガゼットパウチ: ジッパーと角加工を除外
        if ((state.bagTypeId === 'lap_seal' || state.bagTypeId === 'box') && (g.id === 'zipper' || g.id === 'corner')) {
          return false;
        }
        return showMachiPrinting || g.id !== 'machi-printing';
      }).map(group => {
        // 開封位置グループで、強制上端開封が必要な場合はオプションをフィルタリング
        if (forceTopOpen && group.id === 'opening') {
          return {
            ...group,
            options: group.options.filter(opt => opt.id === 'top-open')
          };
        }
        return group;
      });

  // Zipper position options (shown conditionally)
  const zipperPositionOptions = [
    { id: 'zipper-position-any', name: 'ジッパー位置: お任せ', multiplier: 0 },
    { id: 'zipper-position-specified', name: 'ジッパー位置: 指定', multiplier: 1.05 }
  ];

  const handleToggleOption = (optionId: string, multiplier: number) => {
    const currentOptions = state.postProcessingOptions || [];

    console.log('[handleToggleOption] Clicked option:', optionId, 'Current options:', currentOptions);

    // 常に新しい選択を適用 - 同じカテゴリのオプションは自動的に除外される
    // オプションのカテゴリーを取得（visibleGroups定義から）
    const clickedGroup = visibleGroups.find(g => g.options.some(opt => opt.id === optionId));
    const clickedCategory = clickedGroup?.id; // category → id に修正

    console.log('[handleToggleOption] Category:', clickedCategory);

    // 同じカテゴリーのオプションを除外
    // 重要：選択しようとしているオプション自体はフィルタリングから除外する
    const newOptions = currentOptions.filter(id => {
      // 選択しようとしているオプションは削除（toggle処理のため）
      if (id === optionId) return false;

      // クリックされたオプションのグループを探す
      const group = visibleGroups.find(g => g.options.some(opt => opt.id === id));
      return group?.id !== clickedCategory; // category → id に修正
    });

    console.log('[handleToggleOption] After filter:', newOptions);

    // オプションを追加（既に選択されている場合はtoggle処理で削除済みのため追加）
    // 選択されていなかった場合、またはフィルタリングで削除された場合のみ追加
    const isAlreadySelected = currentOptions.includes(optionId);
    if (!isAlreadySelected || newOptions.length < currentOptions.length) {
      newOptions.push(optionId);
    }

    console.log('[handleToggleOption] Final options:', newOptions);

    // Calculate total multiplier
    const allOptions = [...zipperPositionOptions, ...visibleGroups.flatMap(g => g.options)];
    const totalMultiplier = newOptions.reduce((acc, id) => {
      const option = allOptions.find(opt => opt.id === id);
      return acc + (option ? option.multiplier - 1 : 0);
    }, 1.0);

    console.log('[handleToggleOption] Updating with multiplier:', totalMultiplier);
    updatePostProcessing(newOptions, totalMultiplier);
  };

  // Show zipper position selector only when zipper-yes is selected
  // スパウトパウチの場合はジッパー位置の選択も非表示
  // ジッパー位置UIは常に非表示（ユーザー要求により削除）
  const showZipperPosition = false;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-4">
          <Settings className="w-5 h-5 mr-2 text-navy-600" />
          後加工オプション
        </h2>

        {/* Previous Steps Summary */}
        <div className="mb-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">基本仕様</h3>
            </div>
            {getStepSummary('specs')}
          </div>
        </div>

        {/* Sealing Width Selection - Pattern A (水平スクロール) */}
        {state.bagTypeId !== 'roll_film' && (
          <div className="mb-6 bg-gray-50 rounded-xl p-4 border-2 border-gray-200 relative">
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-base font-bold text-gray-900">シール幅</h3>
              {isGusseted && !state.sealWidth && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">必須</span>
              )}
              {state.sealWidth && (
                <Check className="w-5 h-5 text-green-500" />
              )}
            </div>

            {/* Horizontal Scroll Options */}
            <div className="flex gap-2 pb-2 scrollbar-hide flex-wrap">
              {effectiveSealingOptions.map((option) => {
                const isSelected = state.sealWidth === option.value;
                return (
                  <div key={option.id} className="relative flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setSealWidth(option.value)}
                      onMouseEnter={(e) => setHoveredOption({ option, element: e.currentTarget })}
                      onMouseLeave={() => setHoveredOption(null)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium whitespace-nowrap transition-all ${
                        isSelected
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 bg-white text-gray-900 hover:border-navy-300'
                      }`}
                    >
                      {option.name}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Post-processing Groups - Pattern A (水平スクロール) */}
        {visibleGroups.map((group) => {
          const hasSelectedOption = group.options.some(opt => state.postProcessingOptions?.includes(opt.id));

          return (
            <div key={group.id} className="mb-6 bg-gray-50 rounded-xl p-4 border-2 border-gray-200 relative">
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-base font-bold text-gray-900">{group.name}</h3>
                {group.required && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">必須</span>
                )}
                {hasSelectedOption && (
                  <Check className="w-5 h-5 text-green-500" />
                )}
              </div>

              {/* Horizontal Scroll Options */}
              <div className="flex gap-2 pb-2 scrollbar-hide flex-wrap">
                {group.options.map((option) => {
                  const isSelected = state.postProcessingOptions?.includes(option.id);
                  return (
                    <div key={option.id} className="relative flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleOption(option.id, option.multiplier)}
                        onMouseEnter={(e) => setHoveredOption({ option, element: e.currentTarget })}
                        onMouseLeave={() => setHoveredOption(null)}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium whitespace-nowrap transition-all ${
                          isSelected
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-gray-300 bg-white text-gray-900 hover:border-navy-300'
                        }`}
                      >
                        {option.name}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Zipper position selector (conditional) - Pattern A */}
        {showZipperPosition && (
          <div className="mb-6 bg-blue-50 rounded-xl p-4 border-2 border-blue-200 relative">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-base font-bold text-gray-900">ジッパー位置</h3>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {zipperPositionOptions.map((position) => {
                const isSelected = state.postProcessingOptions?.includes(position.id);
                return (
                  <div key={position.id} className="relative flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleOption(position.id, position.multiplier)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium whitespace-nowrap transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 bg-white text-gray-900 hover:border-blue-300'
                      }`}
                    >
                      {position.name}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Global Hover Popup using Portal to avoid parent container constraints */}
      {hoveredOption?.option && hoveredOption.element && createPortal(
        <div className="fixed z-[9999] pointer-events-none" style={{
          left: `${hoveredOption.element.getBoundingClientRect().left + hoveredOption.element.getBoundingClientRect().width / 2}px`,
          top: `${hoveredOption.element.getBoundingClientRect().top}px`,
          transform: 'translate(-50%, -100%)',
        }}>
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-navy-300 p-2">
            <img
              src={hoveredOption.option.previewImage}
              alt={hoveredOption.option.name}
              className="w-[31rem] h-[21rem] object-contain rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/pouch.png';
              }}
            />
            <p className="text-sm text-gray-700 text-center mt-1 font-medium">{hoveredOption.option.name}</p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// Real-time price display component
