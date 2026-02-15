'use client';

/**
 * Hanko (Stamp) Upload Component
 *
 * はんこ署名アップロードコンポーネント
 * - はんこ画像のアップロード・プレビュー
 * - 位置・サイズ調整
 * - 回転・反転機能
 * - 透明度調整
 * - バリデーション対応
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  Upload,
  X,
  AlertCircle,
  Check,
  Loader2,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Move,
  Eye,
  Trash2,
  ImagePlus,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface HankoUploadProps {
  onUpload?: (imageData: HankoImageData) => void;
  onRemove?: () => void;
  initialData?: HankoImageData;
  maxSize?: number; // bytes
  maxWidth?: number; // pixels
  maxHeight?: number; // pixels
  acceptedFormats?: string[];
  readOnly?: boolean;
  showPreview?: boolean;
  className?: string;
}

export interface HankoImageData {
  /** Base64エンコードされた画像 */
  imageUrl: string;
  /** 配置位置 */
  position: { x: number; y: number };
  /** サイズ */
  size: number;
  /** 回転角度 */
  rotation: number;
  /** 水平反転 */
  flipH: boolean;
  /** 垂直反転 */
  flipV: boolean;
  /** 透明度 */
  opacity: number;
  /** ファイル名 */
  filename?: string;
  /** 画像サイズ */
  dimensions?: { width: number; height: number };
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ============================================================
// Constants
// ============================================================

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_MAX_WIDTH = 2000;
const DEFAULT_MAX_HEIGHT = 2000;
const DEFAULT_ACCEPTED_FORMATS = ['image/png', 'image/jpeg', 'image/webp'];

const MIN_STAMP_SIZE = 30;
const MAX_STAMP_SIZE = 200;
const DEFAULT_STAMP_SIZE = 80;

// ============================================================
// Helper Functions
// ============================================================

/**
 * Validate image file
 */
function validateImageFile(
  file: File,
  maxSize: number,
  maxWidth: number,
  maxHeight: number,
  acceptedFormats: string[]
): ValidationResult {
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `ファイルサイズが大きすぎます（最大 ${Math.round(maxSize / 1024 / 1024)}MB）`,
    };
  }

  // Check file type
  if (!acceptedFormats.includes(file.type)) {
    return {
      valid: false,
      error: `対応していないファイル形式です (${acceptedFormats.join(', ')})`,
    };
  }

  return { valid: true };
}

/**
 * Load image and get dimensions
 */
function loadImage(file: File): Promise<{ dataUrl: string; dimensions: { width: number; height: number } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();

      img.onload = () => {
        resolve({
          dataUrl,
          dimensions: { width: img.width, height: img.height },
        });
      };

      img.onerror = () => {
        reject(new Error('画像の読み込みに失敗しました'));
      };

      img.src = dataUrl;
    };

    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Create processed image with transformations
 */
function createProcessedImage(
  dataUrl: string,
  rotation: number,
  flipH: boolean,
  flipV: boolean,
  opacity: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas contextの取得に失敗しました'));
      return;
    }

    img.onload = () => {
      // Calculate canvas size based on rotation
      const radians = (rotation * Math.PI) / 180;
      const sin = Math.abs(Math.sin(radians));
      const cos = Math.abs(Math.cos(radians));

      canvas.width = img.width * cos + img.height * sin;
      canvas.height = img.width * sin + img.height * cos;

      // Apply transformations
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(radians);
      if (flipH) ctx.scale(-1, 1);
      if (flipV) ctx.scale(1, -1);
      ctx.globalAlpha = opacity;

      // Draw image
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      reject(new Error('画像処理に失敗しました'));
    };

    img.src = dataUrl;
  });
}

// ============================================================
// Component
// ============================================================

export default function HankoUpload({
  onUpload,
  onRemove,
  initialData,
  maxSize = DEFAULT_MAX_SIZE,
  maxWidth = DEFAULT_MAX_WIDTH,
  maxHeight = DEFAULT_MAX_HEIGHT,
  acceptedFormats = DEFAULT_ACCEPTED_FORMATS,
  readOnly = false,
  showPreview = true,
  className = '',
}: HankoUploadProps) {
  // State
  const [imageData, setImageData] = useState<HankoImageData | null>(initialData || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================
  // Handlers
  // ============================================================

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError(null);
      setIsUploading(true);

      try {
        // Validate file
        const validation = validateImageFile(file, maxSize, maxWidth, maxHeight, acceptedFormats);
        if (!validation.valid) {
          setError(validation.error || 'ファイルの検証に失敗しました');
          setIsUploading(false);
          return;
        }

        // Load image
        const { dataUrl, dimensions } = await loadImage(file);

        // Create initial image data
        const newData: HankoImageData = {
          imageUrl: dataUrl,
          position: { x: 50, y: 50 }, // Center position (%)
          size: DEFAULT_STAMP_SIZE,
          rotation: 0,
          flipH: false,
          flipV: false,
          opacity: 1,
          filename: file.name,
          dimensions,
        };

        setImageData(newData);
        setProcessedUrl(dataUrl);

        if (onUpload) {
          onUpload(newData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '画像のアップロードに失敗しました');
      } finally {
        setIsUploading(false);
      }
    },
    [maxSize, maxWidth, maxHeight, acceptedFormats, onUpload]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleRemove = useCallback(() => {
    setImageData(null);
    setProcessedUrl(null);
    setError(null);

    if (onRemove) {
      onRemove();
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onRemove]);

  // ============================================================
  // Edit Mode Handlers
  // ============================================================

  const handleUpdateImageData = useCallback(
    (updates: Partial<HankoImageData>) => {
      if (!imageData) return;

      const newData = { ...imageData, ...updates };
      setImageData(newData);

      // Process image with new transformations
      if (updates.rotation !== undefined || updates.flipH !== undefined || updates.flipV !== undefined || updates.opacity !== undefined) {
        createProcessedImage(
          newData.imageUrl,
          newData.rotation,
          newData.flipH,
          newData.flipV,
          newData.opacity
        )
          .then(setProcessedUrl)
          .catch((err) => setError(err.message));
      }

      if (onUpload) {
        onUpload(newData);
      }
    },
    [imageData, onUpload]
  );

  const handleRotate = useCallback(() => {
    if (!imageData) return;
    handleUpdateImageData({ rotation: (imageData.rotation + 90) % 360 });
  }, [imageData, handleUpdateImageData]);

  const handleFlipH = useCallback(() => {
    if (!imageData) return;
    handleUpdateImageData({ flipH: !imageData.flipH });
  }, [imageData, handleUpdateImageData]);

  const handleFlipV = useCallback(() => {
    if (!imageData) return;
    handleUpdateImageData({ flipV: !imageData.flipV });
  }, [imageData, handleUpdateImageData]);

  const handleSizeChange = useCallback(
    (delta: number) => {
      if (!imageData) return;
      const newSize = Math.min(MAX_STAMP_SIZE, Math.max(MIN_STAMP_SIZE, imageData.size + delta));
      handleUpdateImageData({ size: newSize });
    },
    [imageData, handleUpdateImageData]
  );

  const handleOpacityChange = useCallback(
    (delta: number) => {
      if (!imageData) return;
      const newOpacity = Math.min(1, Math.max(0.1, imageData.opacity + delta));
      handleUpdateImageData({ opacity: newOpacity });
    },
    [imageData, handleUpdateImageData]
  );

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {!imageData && !readOnly && (
        <Card
          className={`border-2 border-dashed transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              {/* Icon */}
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  dragActive ? 'bg-blue-100' : 'bg-gray-100'
                }`}
              >
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                ) : (
                  <Upload
                    className={`w-8 h-8 ${dragActive ? 'text-blue-600' : 'text-gray-400'}`}
                  />
                )}
              </div>

              {/* Text */}
              <div>
                <p className="text-lg font-medium text-gray-700">
                  {isUploading ? 'アップロード中...' : 'はんこ画像をアップロード'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  ドラッグ&ドロップまたはクリックしてファイルを選択
                </p>
              </div>

              {/* File Info */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  対応形式: {acceptedFormats.map((f) => f.split('/')[1]).join(', ')}
                </p>
                <p>
                  最大サイズ: {Math.round(maxSize / 1024 / 1024)}MB | 最大解像度: {maxWidth}x
                  {maxHeight}px
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Browse Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFormats.join(',')}
                onChange={handleInputChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <ImagePlus className="w-4 h-4 mr-2" />
                ファイルを選択
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Area */}
      {imageData && showPreview && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                はんこ画像
              </h3>
              {imageData.filename && (
                <p className="text-sm text-gray-600 mt-1">{imageData.filename}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {editMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(false)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  プレビュー
                </Button>
              )}

              {!editMode && !readOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                >
                  <Move className="w-4 h-4 mr-1" />
                  編集
                </Button>
              )}

              {!readOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Preview Image */}
            <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border">
              <div
                className="relative"
                style={{
                  width: `${imageData.size * 2}px`,
                  height: `${imageData.size * 2}px`,
                }}
              >
                <img
                  src={processedUrl || imageData.imageUrl}
                  alt="はんこ"
                  className="w-full h-full object-contain"
                  style={{
                    opacity: editMode ? imageData.opacity : 1,
                    transform: editMode
                      ? `rotate(${imageData.rotation}deg) scaleX(${imageData.flipH ? -1 : 1}) scaleY(${imageData.flipV ? -1 : 1})`
                      : undefined,
                  }}
                />
              </div>
            </div>

            {/* Image Dimensions */}
            {imageData.dimensions && (
              <div className="text-xs text-gray-500 text-center">
                元のサイズ: {imageData.dimensions.width} x {imageData.dimensions.height} px
              </div>
            )}

            {/* Edit Controls */}
            {editMode && (
              <div className="space-y-4 pt-4 border-t">
                {/* Rotation & Flip */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">回転・反転</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRotate}
                      title="90度回転"
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFlipH}
                      title="水平反転"
                    >
                      <FlipHorizontal className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFlipV}
                      title="垂直反転"
                    >
                      <FlipVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Size */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">サイズ</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSizeChange(-10)}
                      disabled={imageData.size <= MIN_STAMP_SIZE}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="px-4 py-1 bg-white border rounded text-sm min-w-[60px] text-center">
                      {imageData.size}px
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSizeChange(10)}
                      disabled={imageData.size >= MAX_STAMP_SIZE}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Opacity */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">透明度</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpacityChange(-0.1)}
                      disabled={imageData.opacity <= 0.1}
                    >
                      -
                    </Button>
                    <span className="px-4 py-1 bg-white border rounded text-sm min-w-[60px] text-center">
                      {Math.round(imageData.opacity * 100)}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpacityChange(0.1)}
                      disabled={imageData.opacity >= 1}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// Standalone Hanko Positioning Component
// ============================================================

interface HankoPositionerProps {
  imageUrl: string;
  position: { x: number; y: number };
  size: number;
  onChange?: (position: { x: number; y: number }) => void;
  readOnly?: boolean;
}

export function HankoPositioner({
  imageUrl,
  position,
  size,
  onChange,
  readOnly = false,
}: HankoPositionerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (readOnly) return;
      setIsDragging(true);
    },
    [readOnly]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !containerRef.current || !onChange) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      onChange({
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
    },
    [isDragging, onChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Hanko */}
      <div
        className="absolute cursor-move"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: 'translate(-50%, -50%)',
          width: `${size}px`,
          height: `${size}px`,
        }}
        onMouseDown={handleMouseDown}
      >
        <img
          src={imageUrl}
          alt="はんこ"
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />
        {isDragging && (
          <div className="absolute inset-0 border-2 border-blue-500 rounded" />
        )}
      </div>

      {/* Helper text */}
      {readOnly && (
        <div className="absolute bottom-2 left-2 text-xs text-gray-500">
          ドラッグして位置を調整
        </div>
      )}
    </div>
  );
}
