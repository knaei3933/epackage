/**
 * Blog Post Form Component
 *
 * Form with validation for all blog post fields
 * - Title, slug, category, tags, excerpt, content
 * - SEO fields (meta title, description, OG image)
 * - Status and publish date
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type {
  BlogPostForm,
  BlogPostStatus,
  BlogCategoryId,
} from '@/lib/types/blog';
import { BLOG_CATEGORIES, BLOG_POST_STATUS_LABELS, validateBlogPostForm } from '@/lib/types/blog';
import { X, Plus, Calendar } from 'lucide-react';

// ============================================================
// Props
// ============================================================

export interface BlogPostFormProps {
  initialData?: Partial<BlogPostForm>;
  onSubmit: (data: BlogPostForm) => Promise<void>;
  loading?: boolean;
}

// ============================================================
// Main Component
// ============================================================

export function BlogPostForm({ initialData, onSubmit, loading = false }: BlogPostFormProps) {
  // Form state
  const [formData, setFormData] = useState<BlogPostForm>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    category: initialData?.category || 'news',
    tags: initialData?.tags || [],
    meta_title: initialData?.meta_title || '',
    meta_description: initialData?.meta_description || '',
    og_image_path: initialData?.og_image_path || '',
    canonical_url: initialData?.canonical_url || '',
    status: initialData?.status || 'draft',
    published_at: initialData?.published_at || '',
  });

  // Tag input state
  const [tagInput, setTagInput] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Auto-generate slug from title
  useEffect(() => {
    if (!initialData?.slug && formData.title && !touched.slug) {
      const slug = formData.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, touched.slug, initialData?.slug]);

  // Handle field change
  const handleChange = (field: keyof BlogPostForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle add tag
  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags?.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag],
      }));
      setTagInput('');
    }
  };

  // Handle remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tagToRemove) || [],
    }));
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const validation = validateBlogPostForm(formData);

    if (!validation.valid) {
      setErrors(validation.errors);
      setTouched(
        Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
      );
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({
        _form: error instanceof Error ? error.message : '送信に失敗しました。',
      });
    }
  };

  // Character counts for SEO fields
  const metaTitleLength = formData.meta_title?.length || 0;
  const metaDescLength = formData.meta_description?.length || 0;
  const excerptLength = formData.excerpt?.length || 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Error */}
      {errors._form && (
        <div className="bg-error-50 border border-error-200 text-error-900 px-4 py-3 rounded-md">
          {errors._form}
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <Input
            label="タイトル"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="記事タイトルを入力..."
            error={touched.title ? errors.title : undefined}
            required
            maxLength={200}
            showCharCount
            helperText={`${formData.title.length}/200文字`}
          />

          {/* Slug */}
          <Input
            label="スラッグ (URL)"
            value={formData.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            placeholder="article-slug"
            error={touched.slug ? errors.slug : undefined}
            helperText="URLに使用されます。半角英数字とハイフンのみ使用可能。"
          />

          {/* Category */}
          <Select
            label="カテゴリ"
            options={BLOG_CATEGORIES.map(cat => ({
              value: cat.id,
              label: cat.name_ja,
            }))}
            value={formData.category}
            onChange={(value) => handleChange('category', value as BlogCategoryId)}
            error={touched.category ? errors.category : undefined}
            required
          />

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
              タグ
            </label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="タグを入力..."
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleAddTag}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-error-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Excerpt */}
          <Textarea
            label="抜粋"
            value={formData.excerpt || ''}
            onChange={(e) => handleChange('excerpt', e.target.value)}
            placeholder="記事の抜粋を入力..."
            error={touched.excerpt ? errors.excerpt : undefined}
            rows={3}
            maxLength={160}
            helperText={`検索結果などに表示されます。${excerptLength}/160文字`}
          />
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>本文</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            label="Markdown形式で本文を入力"
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="# 見出し&#10;&#10;本文をMarkdown形式で入力します..."
            error={touched.content ? errors.content : undefined}
            rows={20}
            required
            className="font-mono text-sm"
          />
        </CardContent>
      </Card>

      {/* SEO Settings */}
      <Card>
        <CardHeader>
          <CardTitle>SEO設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Meta Title */}
          <Input
            label="SEOタイトル"
            value={formData.meta_title || ''}
            onChange={(e) => handleChange('meta_title', e.target.value)}
            placeholder="検索結果に表示されるタイトル"
            error={touched.meta_title ? errors.meta_title : undefined}
            maxLength={60}
            showCharCount
            helperText={
              <span className={metaTitleLength > 60 ? 'text-error-500' : ''}>
                {metaTitleLength}/60文字
                {metaTitleLength === 0 && ' - 空欄の場合は記事タイトルが使用されます'}
              </span>
            }
          />

          {/* Meta Description */}
          <Textarea
            label="メタ説明"
            value={formData.meta_description || ''}
            onChange={(e) => handleChange('meta_description', e.target.value)}
            placeholder="検索結果に表示される説明文"
            error={touched.meta_description ? errors.meta_description : undefined}
            rows={3}
            maxLength={160}
            helperText={
              <span className={metaDescLength > 160 ? 'text-error-500' : ''}>
                {metaDescLength}/160文字
                {metaDescLength === 0 && ' - 空欄の場合は抜粋が使用されます'}
              </span>
            }
          />

          {/* OG Image Path */}
          <Input
            label="OG画像パス"
            value={formData.og_image_path || ''}
            onChange={(e) => handleChange('og_image_path', e.target.value)}
            placeholder="/blog-images/og-image.jpg"
            helperText="SNS共有時に表示される画像のパス"
          />

          {/* Canonical URL */}
          <Input
            label="正規URL (Canonical)"
            value={formData.canonical_url || ''}
            onChange={(e) => handleChange('canonical_url', e.target.value)}
            placeholder="https://example.com/original-article"
            helperText="他サイトに转载した場合のオリジナルURL"
          />
        </CardContent>
      </Card>

      {/* Publish Settings */}
      <Card>
        <CardHeader>
          <CardTitle>公開設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <Select
            label="ステータス"
            options={Object.entries(BLOG_POST_STATUS_LABELS).map(([value, labels]) => ({
              value,
              label: labels.ja,
            }))}
            value={formData.status}
            onChange={(value) => handleChange('status', value as BlogPostStatus)}
            required
          />

          {/* Published At */}
          {formData.status === 'published' && (
            <Input
              label="公開日時"
              type="datetime-local"
              value={formData.published_at || ''}
              onChange={(e) => handleChange('published_at', e.target.value)}
              error={touched.published_at ? errors.published_at : undefined}
              required={formData.status === 'published'}
              leftIcon={<Calendar className="h-4 w-4" />}
            />
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={loading}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          loading={loading}
          loadingText="保存中..."
        >
          保存する
        </Button>
      </div>
    </form>
  );
}
