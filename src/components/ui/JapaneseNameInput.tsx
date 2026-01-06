/**
 * Japanese Name Input Component (Improved)
 *
 * 日本の氏名入力コンポーネント
 * - 姓と名を別フィールドで入力
 * - 漢字（姓・名）とひらがな（姓・名）の4フィールド構成
 * - React Hook Form対応
 * - Zodバリデーション対応
 * - レスポンシブデザイン
 * - 入力ガイドと自動変換ヒント表示
 */

'use client';

import React, { forwardRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input, type InputProps } from './Input';
import { Controller, type Control, type FieldPath, type FieldValues, useWatch, type UseFormSetValue } from 'react-hook-form';

// =====================================================
// Types
// =====================================================

export interface JapaneseNameInputProps {
  /** 漢字 - 姓 */
  kanjiLastName?: string;
  /** 漢字 - 名 */
  kanjiFirstName?: string;
  /** ひらがな - 姓 */
  kanaLastName?: string;
  /** ひらがな - 名 */
  kanaFirstName?: string;
  /** 漢字・姓変更ハンドラー */
  onKanjiLastNameChange?: (value: string) => void;
  /** 漢字・名変更ハンドラー */
  onKanjiFirstNameChange?: (value: string) => void;
  /** ひらがな・姓変更ハンドラー */
  onKanaLastNameChange?: (value: string) => void;
  /** ひらがな・名変更ハンドラー */
  onKanaFirstNameChange?: (value: string) => void;
  /** メインラベル（基本: "氏名"） */
  label?: string;
  /** 必須マーク表示 */
  required?: boolean;
  /** 漢字・姓エラーメッセージ */
  kanjiLastNameError?: string;
  /** 漢字・名エラーメッセージ */
  kanjiFirstNameError?: string;
  /** ひらがな・姓エラーメッセージ */
  kanaLastNameError?: string;
  /** ひらがな・名エラーメッセージ */
  kanaFirstNameError?: string;
  /** 入力フィールドサイズ */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** 追加クラス名 */
  className?: string;
  /** 漢字・姓フィールド無効化 */
  kanjiLastNameDisabled?: boolean;
  /** 漢字・名フィールド無効化 */
  kanjiFirstNameDisabled?: boolean;
  /** ひらがな・姓フィールド無効化 */
  kanaLastNameDisabled?: boolean;
  /** ひらがな・名フィールド無効化 */
  kanaFirstNameDisabled?: boolean;
  /** 漢字・姓プレースホルダー */
  kanjiLastNamePlaceholder?: string;
  /** 漢字・名プレースホルダー */
  kanjiFirstNamePlaceholder?: string;
  /** ひらがな・姓プレースホルダー */
  kanaLastNamePlaceholder?: string;
  /** ひらがな・名プレースホルダー */
  kanaFirstNamePlaceholder?: string;
}

// =====================================================
// Component
// =====================================================

const JapaneseNameInput = forwardRef<HTMLDivElement, JapaneseNameInputProps>(
  (
    {
      kanjiLastName = '',
      kanjiFirstName = '',
      kanaLastName = '',
      kanaFirstName = '',
      onKanjiLastNameChange,
      onKanjiFirstNameChange,
      onKanaLastNameChange,
      onKanaFirstNameChange,
      label = '氏名',
      required = false,
      kanjiLastNameError,
      kanjiFirstNameError,
      kanaLastNameError,
      kanaFirstNameError,
      size = 'md',
      className,
      kanjiLastNameDisabled = false,
      kanjiFirstNameDisabled = false,
      kanaLastNameDisabled = false,
      kanaFirstNameDisabled = false,
      kanjiLastNamePlaceholder = '山田',
      kanjiFirstNamePlaceholder = '太郎',
      kanaLastNamePlaceholder = 'やまだ',
      kanaFirstNamePlaceholder = 'たろう',
      ...props
    },
    ref
  ) => {
    // 内部状態管理
    const [kanjiLastNameInput, setKanjiLastNameInput] = useState(kanjiLastName);
    const [kanjiFirstNameInput, setKanjiFirstNameInput] = useState(kanjiFirstName);
    const [kanaLastNameInput, setKanaLastNameInput] = useState(kanaLastName);
    const [kanaFirstNameInput, setKanaFirstNameInput] = useState(kanaFirstName);

    // propsが変更されたときに内部状態を同期
    useEffect(() => {
      setKanjiLastNameInput(kanjiLastName);
    }, [kanjiLastName]);

    useEffect(() => {
      setKanjiFirstNameInput(kanjiFirstName);
    }, [kanjiFirstName]);

    useEffect(() => {
      setKanaLastNameInput(kanaLastName);
    }, [kanaLastName]);

    useEffect(() => {
      setKanaFirstNameInput(kanaFirstName);
    }, [kanaFirstName]);

    // 入力ハンドラー
    const handleKanjiLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setKanjiLastNameInput(value);
      onKanjiLastNameChange?.(value);
    };

    const handleKanjiFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setKanjiFirstNameInput(value);
      onKanjiFirstNameChange?.(value);
    };

    const handleKanaLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setKanaLastNameInput(value);
      onKanaLastNameChange?.(value);
    };

    const handleKanaFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setKanaFirstNameInput(value);
      onKanaFirstNameChange?.(value);
    };

    // ひらがなバリデーション
    const validateKana = (value: string): boolean => {
      return /^[\u3040-\u309F\s]*$/.test(value);
    };

    return (
      <div ref={ref} className={cn('space-y-4', className)} {...props}>
        {/* メインラベル */}
        {label && (
          <div className="flex items-baseline space-x-2">
            <label className="text-sm font-medium text-text-primary">
              {label}
            </label>
            {required && (
              <span className="text-error-500 text-sm" aria-label="required">
                *
              </span>
            )}
          </div>
        )}

        {/* 漢字入力エリア（姓・名） */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="text-xs font-medium text-text-muted">漢字</div>
            <span className="text-xs text-text-secondary">（例：山田 太郎）</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 姓 */}
            <div className="space-y-1">
              <label className="text-sm text-text-primary block">
                姓
              </label>
              <Input
                value={kanjiLastNameInput}
                onChange={handleKanjiLastNameChange}
                placeholder={kanjiLastNamePlaceholder}
                error={kanjiLastNameError}
                required={required}
                disabled={kanjiLastNameDisabled}
                size={size}
                maxLength={50}
                pattern="^[\u4E00-\u9FFF\s]*$"
                helperText="漢字で入力してください"
                onInvalid={(e) => {
                  e.currentTarget.setCustomValidity('漢字のみ入力可能です。');
                }}
                onInput={(e) => {
                  e.currentTarget.setCustomValidity('');
                }}
              />
            </div>

            {/* 名 */}
            <div className="space-y-1">
              <label className="text-sm text-text-primary block">
                名
              </label>
              <Input
                value={kanjiFirstNameInput}
                onChange={handleKanjiFirstNameChange}
                placeholder={kanjiFirstNamePlaceholder}
                error={kanjiFirstNameError}
                required={required}
                disabled={kanjiFirstNameDisabled}
                size={size}
                maxLength={50}
                pattern="^[\u4E00-\u9FFF\s]*$"
                helperText="漢字で入力してください"
                onInvalid={(e) => {
                  e.currentTarget.setCustomValidity('漢字のみ入力可能です。');
                }}
                onInput={(e) => {
                  e.currentTarget.setCustomValidity('');
                }}
              />
            </div>
          </div>
        </div>

        {/* ひらがな入力エリア（姓・名） */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="text-xs font-medium text-text-muted">ひらがな</div>
            <span className="text-xs text-text-secondary">（例：やまだ たろう）</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 姓（ひらがな） */}
            <div className="space-y-1">
              <label className="text-sm text-text-primary block">
                姓
              </label>
              <Input
                value={kanaLastNameInput}
                onChange={handleKanaLastNameChange}
                placeholder={kanaLastNamePlaceholder}
                error={kanaLastNameError}
                required={required}
                disabled={kanaLastNameDisabled}
                size={size}
                maxLength={50}
                onBlur={(e) => {
                  if (!validateKana(e.target.value)) {
                    onKanaLastNameChange?.('');
                    setKanaLastNameInput('');
                  }
                }}
                helperText="全角ひらがなで入力してください（読み仮名）"
              />
            </div>

            {/* 名（ひらがな） */}
            <div className="space-y-1">
              <label className="text-sm text-text-primary block">
                名
              </label>
              <Input
                value={kanaFirstNameInput}
                onChange={handleKanaFirstNameChange}
                placeholder={kanaFirstNamePlaceholder}
                error={kanaFirstNameError}
                required={required}
                disabled={kanaFirstNameDisabled}
                size={size}
                maxLength={50}
                onBlur={(e) => {
                  if (!validateKana(e.target.value)) {
                    onKanaFirstNameChange?.('');
                    setKanaFirstNameInput('');
                  }
                }}
                helperText="全角ひらがなで入力してください（読み仮名）"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

JapaneseNameInput.displayName = 'JapaneseNameInput';

export default JapaneseNameInput;

// =====================================================
// React Hook Form統合コンポーネント
// =====================================================

export interface JapaneseNameInputControllerProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<
    JapaneseNameInputProps,
    | 'kanjiLastName'
    | 'kanjiFirstName'
    | 'kanaLastName'
    | 'kanaFirstName'
    | 'onKanjiLastNameChange'
    | 'onKanjiFirstNameChange'
    | 'onKanaLastNameChange'
    | 'onKanaFirstNameChange'
  > {
  /** React Hook Form Control */
  control: Control<TFieldValues>;
  /** React Hook Form setValue */
  setValue: UseFormSetValue<TFieldValues>;
  /** 漢字・姓フィールド名 */
  kanjiLastNameName: FieldPath<TFieldValues>;
  /** 漢字・名フィールド名 */
  kanjiFirstNameName: FieldPath<TFieldValues>;
  /** ひらがな・姓フィールド名 */
  kanaLastNameName: FieldPath<TFieldValues>;
  /** ひらがな・名フィールド名 */
  kanaFirstNameName: FieldPath<TFieldValues>;
}

/**
 * React Hook Formと連携するJapaneseNameInputコントローラー
 *
 * @example
 * ```tsx
 * <JapaneseNameInputController
 *   control={control}
 *   setValue={setValue}
 *   kanjiLastNameName="kanjiLastName"
 *   kanjiFirstNameName="kanjiFirstName"
 *   kanaLastNameName="kanaLastName"
 *   kanaFirstNameName="kanaFirstName"
 *   required
 * />
 * ```
 */
export function JapaneseNameInputController<TFieldValues extends FieldValues = FieldValues>({
  control,
  setValue,
  kanjiLastNameName,
  kanjiFirstNameName,
  kanaLastNameName,
  kanaFirstNameName,
  ...props
}: JapaneseNameInputControllerProps<TFieldValues>) {
  return (
    <>
      {/* 漢字・姓 */}
      <Controller
        control={control}
        name={kanjiLastNameName}
        render={({ field }) => (
          <div className="hidden">
            <input {...field} />
          </div>
        )}
      />
      {/* 漢字・名 */}
      <Controller
        control={control}
        name={kanjiFirstNameName}
        render={({ field }) => (
          <div className="hidden">
            <input {...field} />
          </div>
        )}
      />
      {/* ひらがな・姓 */}
      <Controller
        control={control}
        name={kanaLastNameName}
        render={({ field }) => (
          <div className="hidden">
            <input {...field} />
          </div>
        )}
      />
      {/* ひらがな・名 */}
      <Controller
        control={control}
        name={kanaFirstNameName}
        render={({ field }) => (
          <div className="hidden">
            <input {...field} />
          </div>
        )}
      />

      <JapaneseNameInput
        kanjiLastName={useWatch({ control, name: kanjiLastNameName }) as string}
        kanjiFirstName={useWatch({ control, name: kanjiFirstNameName }) as string}
        kanaLastName={useWatch({ control, name: kanaLastNameName }) as string}
        kanaFirstName={useWatch({ control, name: kanaFirstNameName }) as string}
        onKanjiLastNameChange={(value) => {
          setValue(kanjiLastNameName, value as any);
        }}
        onKanjiFirstNameChange={(value) => {
          setValue(kanjiFirstNameName, value as any);
        }}
        onKanaLastNameChange={(value) => {
          setValue(kanaLastNameName, value as any);
        }}
        onKanaFirstNameChange={(value) => {
          setValue(kanaFirstNameName, value as any);
        }}
        {...props}
      />
    </>
  );
}

// =====================================================
// Legacy Controller (Backward Compatibility)
// =====================================================

/**
 * @deprecated Use JapaneseNameInputController with separate field names instead
 * レガシーAPI用コントローラー（旧形式との互換性維持）
 */
export interface LegacyJapaneseNameInputControllerProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<
    JapaneseNameInputProps,
    | 'kanjiLastName'
    | 'kanjiFirstName'
    | 'kanaLastName'
    | 'kanaFirstName'
    | 'onKanjiLastNameChange'
    | 'onKanjiFirstNameChange'
    | 'onKanaLastNameChange'
    | 'onKanaFirstNameChange'
  > {
  /** React Hook Form Control */
  control: Control<TFieldValues>;
  /** React Hook Form setValue */
  setValue: UseFormSetValue<TFieldValues>;
  /** 漢字フィールド名 */
  kanjiName: FieldPath<TFieldValues>;
  /** ひらがなフィールド名 */
  kanaName: FieldPath<TFieldValues>;
  /** 漢字ラベル */
  kanjiLabel?: string;
  /** ひらがなラベル */
  kanaLabel?: string;
}

/**
 * @deprecated Use JapaneseNameInputController instead
 * 旧バージョンとの互換性維持用コンポーネント
 * 姓と名を1つのフィールドに入力する簡易版
 */
export function LegacyJapaneseNameInputController<TFieldValues extends FieldValues = FieldValues>({
  control,
  setValue,
  kanjiName,
  kanaName,
  label,
  required,
  kanjiLabel,
  kanaLabel,
  ...props
}: LegacyJapaneseNameInputControllerProps<TFieldValues>) {
  // 簡易版: 1つのフィールドに姓と名をスペース区切りで入力
  const kanjiValue = useWatch({ control, name: kanjiName }) as string;
  const kanaValue = useWatch({ control, name: kanaName }) as string;

  const handleKanjiChange = (value: string) => {
    setValue(kanjiName, value as any);
  };

  const handleKanaChange = (value: string) => {
    setValue(kanaName, value as any);
  };

  return (
    <>
      <Controller
        control={control}
        name={kanjiName}
        render={({ field }) => (
          <div className="hidden">
            <input {...field} />
          </div>
        )}
      />
      <Controller
        control={control}
        name={kanaName}
        render={({ field }) => (
          <div className="hidden">
            <input {...field} />
          </div>
        )}
      />

      <div className="space-y-4">
        {label && (
          <div className="flex items-baseline space-x-2">
            <label className="text-sm font-medium text-text-primary">
              {label}
            </label>
            {required && (
              <span className="text-error-500 text-sm" aria-label="required">
                *
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm text-text-primary block">
              {kanjiLabel || '漢字'}
            </label>
            <Input
              value={kanjiValue || ''}
              onChange={(e) => handleKanjiChange(e.target.value)}
              placeholder="山田 太郎"
              required={required}
              maxLength={100}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-text-primary block">
              {kanaLabel || 'ひらがな'}
            </label>
            <Input
              value={kanaValue || ''}
              onChange={(e) => handleKanaChange(e.target.value)}
              placeholder="やまだ たろう"
              required={required}
              maxLength={100}
              helperText="ひらがなのみ入力可能"
            />
          </div>
        </div>
      </div>
    </>
  );
}

