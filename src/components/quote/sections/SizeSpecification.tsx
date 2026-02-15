/**
 * SizeSpecification Component
 *
 * Extracted from SpecsStep - handles width, height, and depth inputs
 * マチ（底）サイズはドロップダウンで選択可能
 * ロールフィルムの場合は幅とピッチ（デザインの繰り返し周期）を入力
 *
 * UX 개선사항:
 * - 사용자가 자유롭게 입력 가능 (빈 필드로 시작)
 * - 70mm 미만 입력 시 에러 메시지 표시
 * - 5mm 단위 입력 안내 및 자동 조정
 */

import React, { useMemo, useState, useEffect } from 'react';
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

  // 로컬 입력 상태 (사용자가 입력 중인 값) - state 값으로 초기화
  const [localWidth, setLocalWidth] = useState<string>(() => state.width ? state.width.toString() : '');
  const [localHeight, setLocalHeight] = useState<string>(() => state.height ? state.height.toString() : '');
  const [localPitch, setLocalPitch] = useState<string>(() => state.pitch ? state.pitch.toString() : '');
  const [localSideWidth, setLocalSideWidth] = useState<string>(() => state.sideWidth ? state.sideWidth.toString() : '');
  const [widthError, setWidthError] = useState<string>('');
  const [heightError, setHeightError] = useState<string>('');
  const [pitchError, setPitchError] = useState<string>('');
  const [sideWidthError, setSideWidthError] = useState<string>('');
  const [widthAdjusted, setWidthAdjusted] = useState<boolean>(false);
  const [heightAdjusted, setHeightAdjusted] = useState<boolean>(false);

  // ロールフィルムかどうかを判定
  const isRollFilm = state.bagTypeId === 'roll_film';

  // 合掌袋またはボックス型パウチかどうかを判定（側面入力が必要）
  const needsSideWidth = state.bagTypeId === 'lap_seal' || state.bagTypeId === 'box';

  // state.heightの変更を監視して、ローカルstateとエラーを同期
  useEffect(() => {
    if (state.height !== undefined) {
      setLocalHeight(state.height.toString());

      // バリデーション実行（直接記述）
      const constraints = getSizeConstraints();

      // 最小値検査
      if (state.height < constraints.minHeight) {
        setHeightError(`${constraints.heightHint}（最小${constraints.minHeight}mm）`);
        return;
      }

      // 最大値検査
      if (constraints.maxHeight && state.height > constraints.maxHeight) {
        setHeightError(`${constraints.heightHint}（最大${constraints.maxHeight}mm）`);
        return;
      }

      // 平袋(平袋): 最大 세로 360mm 검사
      if (state.bagTypeId === 'flat_3_side' && state.height > 360) {
        setHeightError('高さは360mm以下で入力してください');
        return;
      }

      // エラーがない場合はクリア
      setHeightError('');
    }
  }, [state.height, state.bagTypeId]);

  // state.widthの変更を監視して、ローカルstateを同期
  useEffect(() => {
    if (state.width !== undefined) {
      setLocalWidth(state.width.toString());
    }
  }, [state.width]);

  // state.pitchの変更を監視して、ローカルstateを同期
  useEffect(() => {
    if (state.pitch !== undefined) {
      setLocalPitch(state.pitch.toString());
    }
  }, [state.pitch]);

  // state.sideWidthの変更を監視して、ローカルstateを同期
  useEffect(() => {
    if (state.sideWidth !== undefined) {
      setLocalSideWidth(state.sideWidth.toString());
    }
  }, [state.sideWidth]);

  // 高さバリデーション関数（抽出して再利用可能に）
  const validateHeight = (heightValue: number) => {
    const constraints = getSizeConstraints();

    // 最小値検査
    if (heightValue < constraints.minHeight) {
      setHeightError(`${constraints.heightHint}（最小${constraints.minHeight}mm）`);
      return;
    }

    // 最大値検査
    if (constraints.maxHeight && heightValue > constraints.maxHeight) {
      setHeightError(`${constraints.heightHint}（最大${constraints.maxHeight}mm）`);
      return;
    }

    // 平袋(平袋): 最大 세로 360mm 검사
    if (state.bagTypeId === 'flat_3_side' && heightValue > 360) {
      setHeightError('高さは360mm以下で入力してください');
      return;
    }

    // エラーがない場合はクリア
    setHeightError('');
  };

  // 各袋タイプに応じたバリデーションルール
  const getSizeConstraints = () => {
    switch (state.bagTypeId) {
      case 'flat_3_side': // 平袋
        return {
          minWidth: 50,
          maxWidth: 9999,
          minHeight: 100,
          maxHeight: 360,
          widthLabel: '平袋',
          widthHint: '50mm以上、横×縦の最小サイズを満たしてください',
          heightHint: '100mm以上360mm以下で入力してください'
        };
      case 'stand_up': // スタンドパウチ
        return {
          minWidth: 80,
          maxWidth: 9999,
          minHeight: 100,
          maxHeight: 9999,
          widthLabel: 'スタンドパウチ',
          widthHint: '80mm以上で入力してください',
          heightHint: '100mm以上で入力してください',
          // 展開サイズの計算: (縦×2)+底=690mm以下
          maxExpandedSize: 690,
          expandedSizeHint: '展開サイズ（高さ×2＋底）は690mm以下'
        };
      case 'box': // ボックス型パウチ
        return {
          minWidth: 50,
          maxWidth: 9999,
          minHeight: 50,
          maxHeight: 9999,
          widthLabel: 'ボックス型パウチ',
          widthHint: '50mm以上で入力してください',
          heightHint: '50mm以上で入力してください',
          // 横+側面=350mm以下 (側面=depth/2)
          maxWidthWithSide: 350,
          widthWithSideHint: '横＋側面は350mm以下'
        };
      case 'lap_seal': // 合掌袋
        return {
          minWidth: 50,
          maxWidth: 9999,
          minHeight: 50,
          maxHeight: 9999,
          widthLabel: '合掌袋',
          widthHint: '50mm以上で入力してください',
          heightHint: '50mm以上で入力してください',
          // 側面の最大値
          maxSideWidth: 175,
          sideWidthHint: '側面は175mm以下で入力してください'
        };
      case 'roll_film': // ロールフィルム
        return {
          minWidth: 80,
          maxWidth: 740,
          widthLabel: 'ロールフィルム',
          widthHint: '80mm以上740mm以下で入力してください'
        };
      default:
        return {
          minWidth: 70,
          maxWidth: 9999,
          minHeight: 70,
          maxHeight: 300,
          widthLabel: '',
          widthHint: '70mm以上で入力してください',
          heightHint: '70mm以上300mm以下で入力してください'
        };
    }
  };

  // Determine if gusset (マチ) should be shown based on bag type
  const shouldShowGusset = () => {
    return state.bagTypeId !== 'flat_3_side' && state.bagTypeId !== 'roll_film';
  };

  const displayDepthField = showDepth !== undefined ? showDepth : shouldShowGusset();

  // 폭에 따른 사용 가능한 마치(밑지) 옵션 계산 (로컬 입력값과 상태값 모두 고려)
  const availableGussetSizes = useMemo(() => {
    // 로컬 입력값 우선 (입력 중일 때 실시간 반영)
    const widthToCheck = localWidth ? parseInt(localWidth) : state.width;
    console.log('[SizeSpecification] availableGussetSizes calculation:', {
      localWidth,
      stateWidth: state.width,
      widthToCheck,
      bagTypeId: state.bagTypeId
    });
    if (!widthToCheck || widthToCheck < 70) return [];
    const sizes = getAvailableGussetSizes(widthToCheck);
    console.log('[SizeSpecification] getAvailableGussetSizes result:', sizes);
    return sizes;
  }, [state.width, localWidth, state.bagTypeId]);

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

    // 비어있으면 에러 표시
    if (inputValue === '' || inputValue === '0' || inputValue === '00') {
      setWidthError('幅を入力してください');
      return;
    }

    // 先行ゼロを除去してパース
    const numValue = parseInt(inputValue, 10);

    // 유효하지 않은 숫자면 처리하지 않음
    if (isNaN(numValue)) {
      return;
    }

    // 각袋 타입에 따른 최소/최대값 검사
    const constraints = getSizeConstraints();

    // 최소값 검사
    if (numValue < constraints.minWidth) {
      setWidthError(`${constraints.widthHint}（最小${constraints.minWidth}mm）`);
      return;
    }

    // 최대값 검사 (로ールフィルムのみ)
    if (isRollFilm && numValue > constraints.maxWidth) {
      setWidthError(`${constraints.widthHint}（最大${constraints.maxWidth}mm）`);
      return;
    }

    // 스탠드파우치: 전개 사이즈 검사 (높이와 바닥이 입력된 경우)
    if (state.bagTypeId === 'stand_up' && state.height && state.depth) {
      const expandedSize = (state.height * 2) + state.depth;
      if (expandedSize > constraints.maxExpandedSize) {
        setWidthError(`${constraints.expandedSizeHint}（현재: ${expandedSize}mm）`);
        return;
      }
    }

    // 박스형 파우치: 가로+옆면 검사 (바닥이 입력된 경우)
    if (state.bagTypeId === 'box' && state.depth) {
      const widthWithSide = numValue + (state.depth / 2);
      if (widthWithSide > constraints.maxWidthWithSide) {
        setWidthError(`${constraints.widthWithSideHint}（현재: 가로${numValue}mm＋옆면${state.depth / 2}mm＝${widthWithSide}mm）`);
        return;
      }
    }

    // 평판: 가로×세로의 최소 사이즈 검사
    if (state.bagTypeId === 'flat_3_side' && state.height) {
      if (numValue < constraints.minWidth || state.height < constraints.minHeight) {
        setWidthError(`${constraints.widthHint}（최소: 가로${constraints.minWidth}mm × 세로${constraints.minHeight}mm）`);
        return;
      }
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

  // 높이 변경 핸들러 (입력 중에도 실시간 검증)
  const handleHeightInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('[SizeSpecification] handleHeightInputChange', { value, bagTypeId: state.bagTypeId });
    setLocalHeight(value);
    setHeightAdjusted(false);

    // 빈 값이면 에러 메시지만 표시하지 않음
    if (value === '' || value === '0' || value === '00') {
      setHeightError('');
      return;
    }

    // 숫자 값 검증 및 에러 표시
    const numValue = parseInt(value, 10);
    console.log('[SizeSpecification] numValue', numValue);
    if (!isNaN(numValue) && value !== '') {
      const constraints = getSizeConstraints();
      console.log('[SizeSpecification] constraints', constraints);
      let hasError = false;

      // 평판(平袋): 최대 세로 360mm 검사
      if (state.bagTypeId === 'flat_3_side' && numValue > 360) {
        console.log('[SizeSpecification] Setting height error for value > 360');
        setHeightError('高さは360mm以下で入力してください');
        hasError = true;
        // returnしないで続けることでエラーを表示
      }

      // 최소값 검사
      if (!hasError && numValue < constraints.minHeight) {
        console.log('[SizeSpecification] Setting height error for value < minHeight');
        setHeightError(`${constraints.heightHint}（最小${constraints.minHeight}mm）`);
        hasError = true;
      }

      // 최대값 검사
      if (!hasError && constraints.maxHeight && numValue > constraints.maxHeight) {
        console.log('[SizeSpecification] Setting height error for value > maxHeight');
        setHeightError(`${constraints.heightHint}（最大${constraints.maxHeight}mm）`);
        hasError = true;
      }

      // 에러가 없으면 클리어
      if (!hasError) {
        console.log('[SizeSpecification] Clearing height error');
        setHeightError('');
      }
    } else {
      setHeightError('');
    }
  };

  // 높이 포커스 아웃 핸들러 (최소값 검사)
  const handleHeightBlur = () => {
    console.log('[SizeSpecification] handleHeightBlur called', { localHeight, stateHeight: state.height, bagTypeId: state.bagTypeId });
    const inputValue = localHeight.trim();

    // 비어있으면 에러 표시
    if (inputValue === '' || inputValue === '0' || inputValue === '00') {
      setHeightError('高さを入力してください');
      return;
    }

    // 先行ゼロを除去してパース
    const numValue = parseInt(inputValue, 10);

    // 유효하지 않은 숫자면 처리하지 않음
    if (isNaN(numValue)) {
      return;
    }

    // 각袋 타입에 따른 최소/최대값 검사
    const constraints = getSizeConstraints();

    // 최소값 검사
    if (numValue < constraints.minHeight) {
      setHeightError(`${constraints.heightHint}（最小${constraints.minHeight}mm）`);
      return;
    }

    // 최대값 검사
    if (constraints.maxHeight && numValue > constraints.maxHeight) {
      setHeightError(`${constraints.heightHint}（最大${constraints.maxHeight}mm）`);
      return;
    }

    // 평판(平袋): 최대 세로 360mm 검사 (maxHeight 설정과 별도로 명시적 체크)
    if (state.bagTypeId === 'flat_3_side' && numValue > 360) {
      setHeightError('高さは360mm以下で入力してください');
      return;
    }

    // 스탠드파우치: 전개 사이즈 검사 (가로와 바닥이 입력된 경우)
    if (state.bagTypeId === 'stand_up' && state.width && state.depth) {
      const expandedSize = (numValue * 2) + state.depth;
      if (expandedSize > constraints.maxExpandedSize) {
        setHeightError(`${constraints.expandedSizeHint}（현재: (세로${numValue}×2)＋바닥${state.depth}＝${expandedSize}mm）`);
        return;
      }
    }

    // 높이는 5mm 단위 조정 없음
    updateBasicSpecs({ height: numValue });
    setLocalHeight(numValue.toString());
  };

  // ピッチ 변경 핸들러 (입력 중에는 로컬 상태만 업데이트)
  const handlePitchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalPitch(value);
    setPitchError('');
  };

  // ピッチ 포커스 아웃 핸들러 (유효성 검사)
  const handlePitchBlur = () => {
    const inputValue = localPitch.trim();

    // 비어있으면 에러 표시
    if (inputValue === '' || inputValue === '0') {
      setPitchError('ピッチを入力してください');
      return;
    }

    // 先行ゼロを除去してパース
    const numValue = parseInt(inputValue, 10);

    // 유효하지 않은 숫자면 처리하지 않음
    if (isNaN(numValue)) {
      return;
    }

    // 최소값 검사 (50mm 미만은 에러)
    if (numValue < 50) {
      setPitchError('ピッチは50mm以上で入力してください');
      return;
    }

    // 최대값 검사 (1000mm 초과는 에러)
    if (numValue > 1000) {
      setPitchError('ピッチは1000mm以下で入力してください');
      return;
    }

    // ピッチ更新
    updateBasicSpecs({ pitch: numValue });
    setLocalPitch(numValue.toString());
  };

  // 側面 (よこめん) 변경 핸들러 (입력 중에는 로컬 상태만 업데이트)
  const handleSideWidthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSideWidth(value);
    setSideWidthError('');
  };

  // 側面 포커스 아웃 핸들러 (유효성 검사)
  const handleSideWidthBlur = () => {
    const inputValue = localSideWidth.trim();

    // 비어있으면 0으로 설정 (옵션)
    if (inputValue === '' || inputValue === '0') {
      updateBasicSpecs({ sideWidth: 0 });
      setLocalSideWidth('0');
      return;
    }

    // 先行ゼロ를 제거하고 파스
    const numValue = parseInt(inputValue, 10);

    // 유효하지 않은 숫자면 처리하지 않음
    if (isNaN(numValue)) {
      return;
    }

    // 각 타입에 따른 최소/최대값 검사
    const constraints = getSizeConstraints();

    // 최소값 검사 (0mm 이상)
    if (numValue < 0) {
      setSideWidthError('側面は0mm以上で入力してください');
      return;
    }

    // 최대값 검사 (合掌袋のみ)
    if (state.bagTypeId === 'lap_seal' && constraints.maxSideWidth && numValue > constraints.maxSideWidth) {
      setSideWidthError(`${constraints.sideWidthHint}（現在: ${numValue}mm）`);
      return;
    }

    // 側面更新
    updateBasicSpecs({ sideWidth: numValue });
    setLocalSideWidth(numValue.toString());
  };

  // 마치 변경 핸들러
  const handleDepthChange = (value: string) => {
    updateBasicSpecs({ depth: parseFloat(value) || 30 });
  };

  // 입력 필드에 표시할 값 - 로컬 상태만 사용 (전역 상태 무시)
  const displayWidth = localWidth;
  const displayHeight = localHeight;
  const displayPitch = localPitch;
  const displaySideWidth = localSideWidth;

  // Determine the grid columns based on displayed fields
  const getGridCols = () => {
    if (isRollFilm) return 'sm:grid-cols-2'; // width + pitch
    if (needsSideWidth) return 'sm:grid-cols-3'; // width + height + sideWidth
    if (displayDepthField) return 'sm:grid-cols-3'; // width + height + depth
    return 'sm:grid-cols-2'; // width + height
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">サイズ (mm)</label>
      <div className={`grid grid-cols-1 gap-4 ${getGridCols()}`}>
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
            {(() => {
              const constraints = getSizeConstraints();
              if (isRollFilm) {
                return `※ ${constraints.widthHint}`;
              }
              if (state.bagTypeId === 'flat_3_side') {
                return `※ 平袋: ${constraints.widthHint}`;
              }
              if (state.bagTypeId === 'stand_up') {
                return `※ スタンドパウチ: ${constraints.widthHint}`;
              }
              if (state.bagTypeId === 'box') {
                return `※ ボックス型パウチ: ${constraints.widthHint}`;
              }
              return `※ 70mm以上、5mm単位で入力してください`;
            })()}
          </p>
        </div>

        {/* 높이 (Height) - ロールフィルムの場合はピッチを表示 */}
        {isRollFilm ? (
          <div>
            <label className="block text-xs text-gray-500 mb-1">ピッチ (デザイン周期)</label>
            <input
              type="number"
              step="1"
              value={displayPitch}
              onChange={handlePitchInputChange}
              onBlur={handlePitchBlur}
              className={`w-full px-3 py-2 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                pitchError
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-navy-500'
              }`}
              placeholder="例: 200"
              aria-label="デザインのピッチ (mm)"
            />
            {pitchError && (
              <p className="mt-1 text-xs text-red-600">
                {pitchError}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              ※ ピッチ: 50mm以上1000mm以下で入力してください
            </p>
            <p className="mt-1 text-xs text-blue-600">
              ※ SKU数量を増やす場合は同じピッチの製品のみ追加できます
            </p>
          </div>
        ) : (
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
              {(() => {
                const constraints = getSizeConstraints();
                if (state.bagTypeId === 'flat_3_side') {
                  return `※ 平袋: ${constraints.heightHint}`;
                }
                if (state.bagTypeId === 'stand_up') {
                  return `※ スタンドパウチ: ${constraints.heightHint}`;
                }
                if (state.bagTypeId === 'box') {
                  return `※ ボックス型パウチ: ${constraints.heightHint}`;
                }
                return `※ 70mm以上300mm以下で入力してください`;
              })()}
            </p>
          </div>
        )}

        {/* 마치/밑지 (Depth/Gusset) */}
        {displayDepthField && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">マチ (底)</label>
            {/* 로컬 입력값 또는 상태값으로 실시간 드롭다운 표시 */}
            {(() => {
              const widthToCheck = localWidth ? parseInt(localWidth) : state.width;
              const hasValidGusset = widthToCheck && widthToCheck >= 70 && availableGussetSizes.length > 0;
              return hasValidGusset ? (
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
              );
            })()}
            {(() => {
              const widthToCheck = localWidth ? parseInt(localWidth) : state.width;
              const hasValidGusset = widthToCheck && widthToCheck >= 70 && availableGussetSizes.length > 0;
              return hasValidGusset && (
                <p className="mt-1 text-xs text-gray-400">
                  幅{widthToCheck}mmで選択可能なマチサイズ
                </p>
              );
            })()}
          </div>
        )}

        {/* 側面 - 合掌袋とボックス型パウチのみ */}
        {needsSideWidth && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">側面</label>
            <input
              type="number"
              step="1"
              min="0"
              value={displaySideWidth}
              onChange={handleSideWidthInputChange}
              onBlur={handleSideWidthBlur}
              className={`w-full px-3 py-2 text-base border rounded-lg focus:ring-2 focus:border-transparent ${
                sideWidthError
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-navy-500'
              }`}
              placeholder="例: 50"
              aria-label="袋の側面 (mm)"
            />
            {sideWidthError && (
              <p className="mt-1 text-xs text-red-600">
                {sideWidthError}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              {(() => {
                const constraints = getSizeConstraints();
                if (state.bagTypeId === 'lap_seal') {
                  return `※ ${constraints.sideWidthHint}`;
                }
                return '※ 側面を入力してください（オプション）';
              })()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
