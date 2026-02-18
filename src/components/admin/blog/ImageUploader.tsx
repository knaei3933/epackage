/**
 * Image Uploader Component
 *
 * Drag-drop zone with:
 * - Progress indicator
 * - Preview thumbnail
 * - Alt text input
 * - Error handling
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Upload, X, Image as ImageIcon, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================

export interface UploadResult {
  url: string;
  path: string;
  originalName: string;
  width: number;
  height: number;
  size: number;
  alt?: string;
}

export interface ImageUploaderProps {
  onUploadComplete: (result: UploadResult) => void;
  bucketPath?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  maxSizeBytes?: number;
}

interface UploadError {
  code: 'SIZE_LIMIT' | 'INVALID_TYPE' | 'UPLOAD_FAILED' | 'DIMENSIONS_FAILED';
  message: string;
}

// ============================================================
// Helper Functions
// ============================================================

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

// ============================================================
// Main Component
// ============================================================

export function ImageUploader({
  onUploadComplete,
  bucketPath = 'blog-images',
  maxSizeMB = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxSizeBytes,
}: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<UploadError | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const maxFileSize = maxSizeBytes || maxSizeMB * 1024 * 1024;

  // Validate file
  const validateFile = useCallback((file: File): UploadError | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return {
        code: 'INVALID_TYPE',
        message: `対応していないファイル形式です。次の形式のみ対応しています: ${acceptedTypes.join(', ')}`,
      };
    }

    // Check file size
    if (file.size > maxFileSize) {
      return {
        code: 'SIZE_LIMIT',
        message: `ファイルサイズが大きすぎます。最大 ${maxSizeMB}MB までです。`,
      };
    }

    return null;
  }, [acceptedTypes, maxFileSize, maxSizeMB]);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    setSelectedFile(null);
    setPreview(null);
    setDimensions(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Get dimensions
    try {
      const dims = await getImageDimensions(file);
      setDimensions(dims);
    } catch {
      setError({
        code: 'DIMENSIONS_FAILED',
        message: '画像の読み取りに失敗しました。',
      });
    }
  }, [validateFile]);

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(f => f.type.startsWith('image/'));

    if (imageFile) {
      handleFileSelect(imageFile);
    }
  };

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Call the upload API
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('bucketPath', bucketPath);

      const response = await fetch('/api/admin/blog/upload-image', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      setUploadProgress(100);

      // Call completion callback
      onUploadComplete({
        url: result.url,
        path: result.path,
        originalName: selectedFile.name,
        width: dimensions?.width || 0,
        height: dimensions?.height || 0,
        size: selectedFile.size,
        alt: altText || undefined,
      });

      // Reset form after short delay
      setTimeout(() => {
        reset();
      }, 1000);

    } catch (err) {
      setError({
        code: 'UPLOAD_FAILED',
        message: err instanceof Error ? err.message : 'アップロードに失敗しました。',
      });
    } finally {
      setUploading(false);
    }
  };

  // Reset form
  const reset = () => {
    setSelectedFile(null);
    setPreview(null);
    setAltText('');
    setUploadProgress(0);
    setError(null);
    setDimensions(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove selected file
  const handleRemove = () => {
    reset();
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {!selectedFile ? (
          /* Drop Zone */
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              error ? 'border-error-300 bg-error-50' : 'border-border-medium hover:border-brixa-300 hover:bg-brixa-50'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes.join(',')}
              onChange={handleInputChange}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-3">
              <div className={cn(
                'p-3 rounded-full',
                error ? 'bg-error-100 text-error-600' : 'bg-brixa-100 text-brixa-600'
              )}>
                {error ? (
                  <AlertCircle className="h-6 w-6" />
                ) : (
                  <Upload className="h-6 w-6" />
                )}
              </div>

              <div>
                <p className="font-medium text-text-primary">
                  {error ? error.message : '画像をアップロード'}
                </p>
                <p className="text-sm text-text-tertiary mt-1">
                  ドラッグ＆ドロップまたはクリックして選択
                </p>
              </div>

              <div className="text-xs text-text-tertiary">
                <p>対応形式: {acceptedTypes.map(t => t.split('/')[1]).join(', ')}</p>
                <p>最大サイズ: {maxSizeMB}MB</p>
              </div>
            </div>
          </div>
        ) : (
          /* Preview and Upload */
          <div className="space-y-4">
            {/* Preview */}
            <div className="relative bg-bg-secondary rounded-lg overflow-hidden">
              {preview && (
                <img
                  src={preview}
                  alt={selectedFile.name}
                  className="w-full h-48 object-contain"
                />
              )}

              {/* Remove button */}
              <Button
                size="icon"
                variant="ghost"
                onClick={handleRemove}
                disabled={uploading}
                className="absolute top-2 right-2 bg-white/90 hover:bg-white"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* File info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-white text-sm font-medium truncate">
                  {selectedFile.name}
                </p>
                <div className="flex items-center gap-3 text-white/80 text-xs">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  {dimensions && (
                    <span>{dimensions.width} x {dimensions.height}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Alt Text Input */}
            <Input
              label="代替テキスト (Alt Text)"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="画像の説明を入力..."
              helperText="スクリーンリーダー向けの画像説明（推奨）"
              disabled={uploading}
            />

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-tertiary">アップロード中...</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-brixa-500 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={uploading}
              loading={uploading}
              loadingText="アップロード中..."
              className="w-full"
            >
              {!uploading && (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  画像をアップロード
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
