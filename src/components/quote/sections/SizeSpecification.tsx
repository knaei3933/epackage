/**
 * SizeSpecification Component
 *
 * Extracted from SpecsStep - handles width, height, and depth inputs
 * マチ（底）サイズはドロップダウンで選択可能
 *
 * UX 개선사항:
 * - 사용자가 자유롭게 입력 가능 (빈 필드로 시작)
 * - 70mm 미만 입력 시 에러 메시지 표시
 * - 5mm 단위 입력 안내 및 자동 조정
 */

import React, { useMemo, useState } from 'react';
import { useQuote, useQuoteState } from '@/contexts/QuoteContext';
import {
  getAvailableGussetSizes,
  getDefaultGussetSize
} from '@/lib/gusset-data';

interface SizeSpecificationProps {
  showDepth?: boolean;
}

/**
 * Component for specifying bag dimensions
 */
export function SizeSpecification({ showDepth }: SizeSpecificationProps) {
  const state = useQuoteState();
  const { updateBasicSpecs } = useQuote();

  // 로컬 입력 상태 (사용자가 입력 중인 값) - 빈 문자열로 시작
  const [localWidth, setLocalWidth] = useState<string>('');
  const [localHeight, setLocalHeight] = useState<string>('');
  const [widthError, setWidthError] = useState<string>('');
  const [heightError, setHeightError] = useState<string>('');
  const [widthAdjusted, setWidthAdjusted] = useState<boolean>(false);
  const [heightAdjusted, setHeightAdjusted] = useState<boolean>(false);

  // Determine if gusset (マチ) should be shown based on bag type
  const shouldShowGusset = () => {
    return state.bagTypeId !== 'flat_3_side' && state.bagTypeId !== 'roll_film';
  };

  const displayDepthField = showDepth !== undefined ? showDepth : shouldShowGusset();

  // 폭에 따른 사용 가능한 마치(밑지) 옵션 계산
  const availableGussetSizes = useMemo(() => {
    if (!state.width || state.width < 70) return [];
    return getAvailableGussetSizes(state.width);
  }, [state.width]);

  // 5mm 단위로 자동 조정하는 함수
  const adjustTo5mmUnit = (value: number): number => {
    if (value % 5 === 0) return value;
    return Math.round(value / 5) * 5;
  };

  // 폭 변경 핸들러 (입력 중에는 로컬 상태만 업데이트)
  const handleWidthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalWidth(value);
    setWidthError('');
    setWidthAdjusted(false);
  };

  // 폭 포커스 아웃 핸들러 (유효성 검사 및 자동 조정)
  const handleWidthBlur = () => {
    const inputValue = localWidth.trim();

    // 비어있으면 아무것도 하지 않음
    if (inputValue === '') {
      return;
    }

    const numValue = parseInt(inputValue);

    // 유효하지 않은 숫자면 처리하지 않음
    if (isNaN(numValue)) {
      return;
    }

    // 최소값 검사 (70mm 미만은 에러)
    if (numValue < 70) {
      setWidthError('幅は70mm以上で入力してください');
      return;
    }

    let finalValue = numValue;
    let adjusted = false;

    // 5mm 단위 조정
    const adjustedValue = adjustTo5mmUnit(finalValue);
    if (adjustedValue !== finalValue) {
      finalValue = adjustedValue;
      adjusted = true;
    }

    // 상태 업데이트
    updateBasicSpecs({ width: finalValue });
    setLocalWidth(finalValue.toString());

    if (adjusted) {
      setWidthAdjusted(true);
    }

    // 마치가 새로운 폭에 맞게 자동 조정
    const newDefaultGusset = getDefaultGussetSize(finalValue);
    if (displayDepthField && availableGussetSizes.length > 0) {
      const currentGusset = state.depth || 0;
      const newGussetOptions = getAvailableGussetSizes(finalValue);
      if (!newGussetOptions.includes(currentGusset)) {
        updateBasicSpecs({ depth: newDefaultGusset });
      }
    }
  };

  // 높이 변경 핸들러 (입력 중에는 로컬 상태만 업데이트)
  const handleHeightInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalHeight(value);
    setHeightError('');
    setHeightAdjusted(false);
  };

  // 높이 포커스 아웃 핸들러 (최소값 검사)
  const handleHeightBlur = () => {
    const inputValue = localHeight.trim();

    // 비어있으면 아무것도 하지 않음
    if (inputValue === '') {
      return;
    }

    const numValue = parseInt(inputValue);

    // 유효하지 않은 숫자면 처리하지 않음
    if (isNaN(numValue)) {
      return;
    }

    // 최소값 검사 (70mm 미만은 에러)
    if (numValue < 70) {
      setHeightError('高さは70mm以上で入力してください');
      return;
    }

    // 높이는 5mm 단위 조정 없음
    updateBasicSpecs({ height: numValue });
    setLocalHeight(numValue.toString());
  };

  // 마치 변경 핸들러
  const handleDepthChange = (value: string) => {
    updateBasicSpecs({ depth: parseFloat(value) || 30 });
  };

  // 입력 필드에 표시할 값 - 로컬 상태만 사용 (전역 상태 무시)
  const displayWidth = localWidth;
  const displayHeight = localHeight;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">サイズ (mm)</label>
      <div className={`grid grid-cols-1 gap-4 ${displayDepthField ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {/* 폭 (Width) */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">幅</label>
          <input
            type="number"
            step="1"
            value={displayWidth}
            onChange={handleWidthInputChange}
            onBlur={handleWidthBlur}
            className={`w-full px-3 py-2 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
              widthError
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : widthAdjusted
                ? 'border-yellow-400 focus:ring-yellow-500 focus:border-yellow-500'
                : 'border-gray-300 focus:ring-navy-500'
            }`}
            placeholder="例: 200"
            aria-label="袋の幅 (mm)"
          />
          {widthError && (
            <p className="mt-1 text-xs text-red-600">
              {widthError}
            </p>
          )}
          {widthAdjusted && !widthError && (
            <p className="mt-1 text-xs text-yellow-600">
              ✓ {displayWidth}mmに調整しました（5mm単位）
            </p>
          )}
          <p className="mt-1 text-xs text-gray-400">
            ※ 70mm以上、5mm単位で入力してください
          </p>
        </div>

        {/* 높이 (Height) */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">高さ</label>
          <input
            type="number"
            step="1"
            value={displayHeight}
            onChange={handleHeightInputChange}
            onBlur={handleHeightBlur}
            className={`w-full px-3 py-2 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
              heightError
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : heightAdjusted
                ? 'border-yellow-400 focus:ring-yellow-500 focus:border-yellow-500'
                : 'border-gray-300 focus:ring-navy-500'
            }`}
            placeholder="例: 300"
            aria-label="袋の高さ (mm)"
          />
          {heightError && (
            <p className="mt-1 text-xs text-red-600">
              {heightError}
            </p>
          )}
          {heightAdjusted && !heightError && (
            <p className="mt-1 text-xs text-yellow-600">
              ✓ 最小70mmに調整しました
            </p>
          )}
          <p className="mt-1 text-xs text-gray-400">
            ※ 70mm以上で入力してください
          </p>
        </div>

        {/* 마치/밑지 (Depth/Gusset) */}
        {displayDepthField && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">マチ (底)</label>
            {state.width && state.width >= 70 && availableGussetSizes.length > 0 ? (
              <select
                value={state.depth || availableGussetSizes[0] || 30}
                onChange={(e) => handleDepthChange(e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent bg-white"
                aria-label="袋のマチ深さ (mm)"
              >
                {availableGussetSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}mm
                  </option>
                ))}
              </select>
            ) : (
              /* 平袋/ロールフィルム: マチなし（disabled input） */
              <input
                type="number"
                min="0"
                step="0.5"
                value={0}
                disabled
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed opacity-50"
                aria-label="袋のマチ深さ (mm) - 平袋/ロールフィルムは不要"
              />
            )}
            {state.width && state.width >= 70 && availableGussetSizes.length > 0 && (
              <p className="mt-1 text-xs text-gray-400">
                幅{state.width}mmで選択可能なマチサイズ
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
