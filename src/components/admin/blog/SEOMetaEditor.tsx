/**
 * SEO Meta Editor Component
 *
 * SEO fields editor with:
 * - Character counts
 * - Live preview of search result snippet
 * - OG image preview
 * - Canonical URL input
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Check, AlertCircle, Globe, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================

export interface SEOMetaEditorProps {
  title?: string;
  onChangeTitle: (title: string) => void;
  description?: string;
  onChangeDescription: (description: string) => void;
  ogImage?: string | null;
  onChangeOgImage: (path: string | null) => void;
  slug?: string;
  onChangeSlug: (slug: string) => void;
  canonicalUrl?: string | null;
  onChangeCanonicalUrl: (url: string | null) => void;
  siteUrl?: string; // Base URL for preview, e.g., "https://epackagelab.com"
}

// ============================================================
// Helper Functions
// ============================================================

interface CharacterCountProps {
  current: number;
  max: number;
  optimal?: { min: number; max: number };
}

function CharacterCountIndicator({ current, max, optimal }: CharacterCountProps) {
  const percentage = (current / max) * 100;

  let status: 'good' | 'warning' | 'error' = 'good';
  if (current > max) {
    status = 'error';
  } else if (percentage > 90) {
    status = 'warning';
  } else if (optimal && (current < optimal.min || current > optimal.max)) {
    status = 'warning';
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-bg-secondary rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-200',
            status === 'good' && 'bg-success-500',
            status === 'warning' && 'bg-warning-500',
            status === 'error' && 'bg-error-500'
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <span className={cn(
        'text-xs font-medium',
        status === 'good' && 'text-success-600',
        status === 'warning' && 'text-warning-600',
        status === 'error' && 'text-error-600'
      )}>
        {current}/{max}
      </span>
      {status === 'good' && (
        <Check className="h-4 w-4 text-success-500" />
      )}
      {status === 'error' && (
        <AlertCircle className="h-4 w-4 text-error-500" />
      )}
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export function SEOMetaEditor({
  title = '',
  onChangeTitle,
  description = '',
  onChangeDescription,
  ogImage,
  onChangeOgImage,
  slug = '',
  onChangeSlug,
  canonicalUrl,
  onChangeCanonicalUrl,
  siteUrl = 'https://epackagelab.com',
}: SEOMetaEditorProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load image preview
  useEffect(() => {
    if (ogImage) {
      setImagePreview(ogImage);
    } else {
      setImagePreview(null);
    }
  }, [ogImage]);

  const titleLength = title.length;
  const descriptionLength = description.length;

  // Generate preview URL
  const previewUrl = slug ? `${siteUrl}/blog/${slug}` : `${siteUrl}/blog/`;

  return (
    <div className="space-y-6">
      {/* Meta Title */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">SEOタイトル</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            placeholder="記事のタイトル（SEO用）"
            maxLength={60}
            showCharCount
          />

          <div className="space-y-2">
            <CharacterCountIndicator
              current={titleLength}
              max={60}
              optimal={{ min: 30, max: 60 }}
            />
            <p className="text-xs text-text-tertiary">
              {titleLength === 0
                ? '空欄の場合は記事タイトルが使用されます。'
                : titleLength < 30
                  ? '短すぎます。30文字以上が推奨されます。'
                  : titleLength <= 60
                    ? '最適な長さです。'
                    : '長すぎます。'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Meta Description */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">メタ説明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={description}
            onChange={(e) => onChangeDescription(e.target.value)}
            placeholder="記事の説明（SEO用）"
            rows={3}
            maxLength={160}
          />

          <div className="space-y-2">
            <CharacterCountIndicator
              current={descriptionLength}
              max={160}
              optimal={{ min: 120, max: 160 }}
            />
            <p className="text-xs text-text-tertiary">
              {descriptionLength === 0
                ? '空欄の場合は記事抜粋が使用されます。'
                : descriptionLength < 120
                  ? '短すぎます。120文字以上が推奨されます。'
                  : descriptionLength <= 160
                    ? '最適な長さです。'
                    : '長すぎます。'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Slug */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            URLスラッグ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={slug}
            onChange={(e) => onChangeSlug(e.target.value)}
            placeholder="article-slug"
            error={slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) ? '半角英数字とハイフンのみ使用できます' : undefined}
          />

          {slug && (
            <div className="bg-bg-secondary rounded-md p-3">
              <p className="text-xs text-text-tertiary mb-1">プレビューURL:</p>
              <p className="text-sm font-mono text-brixa-700 break-all">
                {previewUrl}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* OG Image */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            OGP画像
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={ogImage || ''}
            onChange={(e) => onChangeOgImage(e.target.value || null)}
            placeholder="/blog-images/og-image.jpg"
          />

          {/* Image Preview */}
          {imagePreview && (
            <div className="bg-bg-secondary rounded-md p-3">
              <p className="text-xs text-text-tertiary mb-2">SNS共有時のプレビュー:</p>
              <div className="bg-white border border-border-light rounded-md overflow-hidden max-w-md">
                <div
                  className="aspect-video bg-cover bg-center"
                  style={{ backgroundImage: `url(${imagePreview})` }}
                />
                <div className="p-3">
                  <p className="text-xs text-text-tertiary">{siteUrl}</p>
                  <p className="font-medium text-sm truncate">{title || '記事タイトル'}</p>
                  <p className="text-xs text-text-secondary truncate">{description || '記事の説明...'}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Canonical URL */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            正規URL (Canonical)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={canonicalUrl || ''}
            onChange={(e) => onChangeCanonicalUrl(e.target.value || null)}
            placeholder="https://example.com/original-article"
          />

          <p className="text-xs text-text-tertiary">
            他サイトに转载した場合のオリジナル記事URLを指定します。
            通常は空欄で問題ありません。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
