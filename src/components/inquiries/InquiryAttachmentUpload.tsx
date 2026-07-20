/**
 * InquiryAttachmentUpload
 *
 * お問い合わせスレッドの添付ファイルアップロード（会員側）
 *
 * 仕様（サーバー側 file-validation.ts と一致）:
 * - 一般 inquiry（variant='general'）: 画像（PNG / JPG / GIF / WebP）+ PDF・10MB・5枚
 * - 注文チャット（variant='order'）: 画像 + PDF + デザインデータ（AI/EPS/PSD/PS）・100MB・5枚
 *
 * クライアント側では拡張子・サイズ・枚数で事前ガード。
 * MIME の magic-number 検証はサーバー側の責務（送信時に再検証される）。
 *
 * @client
 */

'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Upload, X, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';

// =====================================================
// Constants（サーバー側 file-validation.ts と一致）
// =====================================================

/** variant 別の許可拡張子（小文字・先頭のドット込み） */
const ALLOWED_EXTENSIONS_BY_VARIANT = {
  // 一般 inquiry: 画像 + PDF（Non-Goals・10MB）
  general: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf'],
  // 注文チャット: 画像 + PDF + デザインデータ（AI/EPS/PSD/PS・100MB）
  // ※ .ai は PDF ベースの AI（magic number %PDF で検証）・古い EPS ベース AI は許容しない（spec Non-Goals）
  order: [
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf',
    '.ai', '.eps', '.ps', '.psd',
  ],
} as const;

/** variant 別の最大サイズ（サーバー側 file-validation.ts の *_MAX_SIZE と一致） */
const MAX_FILE_SIZE_BY_VARIANT = {
  general: 10 * 1024 * 1024, // 10MB
  order: 100 * 1024 * 1024, // 100MB
} as const;

/** 1メッセージあたりの最大添付数: 5枚（一般・注文チャット共通） */
const MAX_FILE_COUNT = 5;

/** 画像系の拡張子（プレビュー表示判定・variant 共通） */
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

// =====================================================
// Variant helpers
// =====================================================

export type InquiryAttachmentUploadVariant = 'general' | 'order';

/** 拡張子を取り出す（小文字・ドット込み） */
function getExtension(fileName: string): string {
  const idx = fileName.lastIndexOf('.');
  if (idx < 0) return '';
  return fileName.slice(idx).toLowerCase();
}

/** variant に応じた許可拡張子リストを返す */
function getAllowedExtensions(variant: InquiryAttachmentUploadVariant): readonly string[] {
  return ALLOWED_EXTENSIONS_BY_VARIANT[variant];
}

/** variant に応じた許可拡張子か */
function isAllowedExtension(
  fileName: string,
  variant: InquiryAttachmentUploadVariant
): boolean {
  return getAllowedExtensions(variant).includes(getExtension(fileName));
}

/** 画像系の拡張子か（プレビュー表示判定） */
function isImageExtension(fileName: string): boolean {
  return IMAGE_EXTENSIONS.includes(getExtension(fileName));
}

/** variant 別の案内文案 */
function getDescription(variant: InquiryAttachmentUploadVariant): string {
  if (variant === 'order') {
    return '画像（PNG / JPG / GIF / WebP）・PDF・デザインデータ（AI / EPS / PSD） ・ 1ファイル最大100MB';
  }
  return '画像（PNG / JPG / GIF / WebP）または PDF ・ 1ファイル最大10MB';
}

/** ファイルサイズを読みやすい形式に */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// =====================================================
// Types
// =====================================================

export interface InquiryAttachmentUploadProps {
  /** 現在の添付ファイル群（親コンポーネントが状態管理） */
  attachments: File[];
  /** ファイルリスト変更時に呼ばれる（追加・削除） */
  onChange: (files: File[]) => void;
  /**
   * 添付種別バリアント（デフォルト='general'）
   * - 'general': 一般 inquiry（画像+PDF・10MB）
   * - 'order': 注文チャット（画像+PDF+デザインデータ・100MB）
   */
  variant?: InquiryAttachmentUploadVariant;
  /** 最大枚数（デフォルト5） */
  maxCount?: number;
  /** 全体無効化（送信中等） */
  disabled?: boolean;
  /** 追加クラス */
  className?: string;
}

/** 個別ファイルのプレビュー情報 */
interface PreviewItem {
  file: File;
  previewUrl: string | null; // 画像のみ・PDF/デザインデータは null
}

// =====================================================
// Component
// =====================================================

export function InquiryAttachmentUpload({
  attachments,
  onChange,
  variant = 'general',
  maxCount = MAX_FILE_COUNT,
  disabled = false,
  className = '',
}: InquiryAttachmentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const allowedExtensions = getAllowedExtensions(variant);
  const acceptAttr = allowedExtensions.join(',');
  const maxFileSize = MAX_FILE_SIZE_BY_VARIANT[variant];
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // 画像プレビュー URL を生成（画像のみ・PDF は null）
  const previews = useMemo<PreviewItem[]>(() => {
    return attachments.map((file) => ({
      file,
      previewUrl: isImageExtension(file.name) ? URL.createObjectURL(file) : null,
    }));
  }, [attachments]);

  // コンポーネントのアンマウント・添付変更時にプレビュー URL を解放（メモリリーク防止）
  useEffect(() => {
    return () => {
      for (const item of previews) {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      }
    };
  }, [previews]);

  // -------------------------------------------------
  // ファイル追加のコアロジック（ドラッグ・クリック共通）
  // -------------------------------------------------

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      if (disabled) return;

      const candidates = Array.from(incoming);
      const newErrors: string[] = [];
      const accepted: File[] = [];

      for (const file of candidates) {
        // 枚数チェック（追加後の総数で判定）
        if (attachments.length + accepted.length >= maxCount) {
          newErrors.push(`添付ファイルは最大${maxCount}枚までです。`);
          break;
        }

        // 拡張子チェック（variant 別の許可リスト）
        if (!isAllowedExtension(file.name, variant)) {
          newErrors.push(`対応していないファイル形式です: ${file.name}`);
          continue;
        }

        // サイズチェック（variant 別の上限: general=10MB / order=100MB）
        if (file.size > maxFileSize) {
          newErrors.push(
            `ファイルサイズが上限（${maxFileSize / (1024 * 1024)}MB）を超えています: ${file.name}（${formatFileSize(file.size)}）`
          );
          continue;
        }

        // 0 バイトファイルのガード
        if (file.size === 0) {
          newErrors.push(`ファイルが空です: ${file.name}`);
          continue;
        }

        accepted.push(file);
      }

      setErrors(newErrors);
      if (accepted.length > 0) {
        onChange([...attachments, ...accepted]);
      }
    },
    [attachments, disabled, maxCount, onChange, variant, maxFileSize]
  );

  // -------------------------------------------------
  // 個別削除
  // -------------------------------------------------

  const removeFile = useCallback(
    (index: number) => {
      if (disabled) return;
      const next = attachments.filter((_, i) => i !== index);
      onChange(next);
    },
    [attachments, disabled, onChange]
  );

  // -------------------------------------------------
  // ドラッグ&ドロップ
  // -------------------------------------------------

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (disabled) return;
      addFiles(e.dataTransfer.files);
    },
    [addFiles, disabled]
  );

  // -------------------------------------------------
  // input 変更
  // -------------------------------------------------

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addFiles(e.target.files);
      }
      // 同一ファイルを再選択できるように value をリセット
      e.target.value = '';
    },
    [addFiles]
  );

  // =====================================================
  // Render
  // =====================================================

  const canAddMore = attachments.length < maxCount;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* ドロップエリア */}
      {canAddMore && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
            disabled
              ? 'border-border-secondary bg-bg-secondary opacity-60 cursor-not-allowed'
              : isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-border-secondary hover:border-primary hover:bg-bg-secondary'
          }`}
          aria-label="添付ファイルをドラッグ&ドロップ または クリックして選択"
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptAttr}
            multiple
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />
          <Upload className="w-7 h-7 mx-auto mb-2 text-text-muted" />
          <p className="text-sm font-medium text-text-primary">
            ファイルをドラッグ&ドロップ または クリックして選択
          </p>
          <p className="text-xs text-text-muted mt-1">{getDescription(variant)}</p>
        </div>
      )}

      {/* 枚数カウンター */}
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>
          添付 {attachments.length} / {maxCount} 枚
        </span>
      </div>

      {/* プレビューリスト */}
      {previews.length > 0 && (
        <ul className="space-y-2">
          {previews.map((item, index) => (
            <li
              key={`${item.file.name}-${index}`}
              className="flex items-center gap-3 border border-border-secondary rounded-lg p-2 bg-bg-secondary"
            >
              {/* サムネイル or アイコン */}
              <div className="w-10 h-10 shrink-0 rounded overflow-hidden flex items-center justify-center bg-border-secondary">
                {item.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText className="w-5 h-5 text-text-muted" />
                )}
              </div>

              {/* ファイル情報 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate flex items-center gap-1">
                  {!item.previewUrl && <ImageIcon className="w-3 h-3 inline" />}
                  {item.file.name}
                </p>
                <p className="text-xs text-text-muted">{formatFileSize(item.file.size)}</p>
              </div>

              {/* 削除ボタン */}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1.5 text-text-muted hover:text-red-600 transition-colors"
                  aria-label={`${item.file.name} を削除`}
                  title="削除"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* バリデーションエラー */}
      {errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20 p-3">
          <ul className="space-y-1">
            {errors.map((msg, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-red-700 dark:text-red-400">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{msg}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default InquiryAttachmentUpload;
