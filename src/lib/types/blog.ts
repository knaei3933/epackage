/**
 * Blog CMS Types
 *
 * Type definitions for blog posts, categories, images, and forms
 * Based on the blog-cms-implementation.md plan
 */

// ============================================================
// Blog Post Status
// ============================================================

export type BlogPostStatus = 'draft' | 'review' | 'published' | 'archived';

export const BLOG_POST_STATUS_LABELS: Record<BlogPostStatus, { ja: string; en: string }> = {
  draft: { ja: '下書き', en: 'Draft' },
  review: { ja: 'レビュー中', en: 'In Review' },
  published: { ja: '公開済み', en: 'Published' },
  archived: { ja: 'アーカイブ', en: 'Archived' },
};

// ============================================================
// Blog Category
// ============================================================

export type BlogCategoryId = 'news' | 'technical' | 'industry' | 'company';

export interface BlogCategory {
  id: BlogCategoryId;
  name_ja: string;
  name_en: string;
  description?: string;
  sort_order: number;
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  { id: 'news', name_ja: 'ニュース', name_en: 'News', sort_order: 1 },
  { id: 'technical', name_ja: '技術情報', name_en: 'Technical', sort_order: 2 },
  { id: 'industry', name_ja: '業界情報', name_en: 'Industry', sort_order: 3 },
  { id: 'company', name_ja: '会社情報', name_en: 'Company', sort_order: 4 },
];

export function getCategoryLabel(id: BlogCategoryId, locale: 'ja' | 'en' = 'ja'): string {
  const category = BLOG_CATEGORIES.find(c => c.id === id);
  return locale === 'ja' ? category?.name_ja || id : category?.name_en || id;
}

// ============================================================
// Blog Image (from Supabase Storage)
// ============================================================

export interface BlogImage {
  id: string;
  post_id: string | null;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  width?: number;
  height?: number;
  alt_text?: string;
  created_at: string;
  created_by: string;
}

// ============================================================
// Blog Post
// ============================================================

export interface BlogPost {
  id: string;
  // Core content
  title: string;
  slug: string;
  content: string; // Markdown
  excerpt?: string;

  // Categorization
  category: BlogCategoryId;
  tags: string[];

  // SEO Fields
  meta_title?: string;
  meta_description?: string;
  og_image_path?: string;
  canonical_url?: string;

  // Author & Status
  author_id: string;
  author?: {
    id: string;
    email: string;
    kanji_last_name?: string;
    kanji_first_name?: string;
    company_name?: string;
  };
  status: BlogPostStatus;

  // Timestamps
  published_at?: string;
  created_at: string;
  updated_at: string;

  // Metrics
  view_count: number;
  reading_time_minutes: number;
}

// ============================================================
// Blog Post List Item (for admin table)
// ============================================================

export interface BlogPostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category: BlogCategoryId;
  status: BlogPostStatus;
  author?: {
    name: string;
  };
  published_at?: string;
  created_at: string;
  view_count: number;
}

// ============================================================
// Blog Post Form (for create/edit)
// ============================================================

export interface BlogPostForm {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  category: BlogCategoryId;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  og_image_path?: string;
  canonical_url?: string;
  status: BlogPostStatus;
  published_at?: string;
}

// ============================================================
// Blog List Query Parameters
// ============================================================

export interface BlogListParams {
  page?: number;
  limit?: number;
  status?: BlogPostStatus | 'all';
  category?: BlogCategoryId;
  search?: string;
  sortBy?: 'created_at' | 'published_at' | 'title' | 'view_count';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================
// Blog List Response
// ============================================================

export interface BlogListResponse {
  posts: BlogPostListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================
// Create Post Request
// ============================================================

export interface CreatePostRequest extends BlogPostForm {
  // All fields from BlogPostForm
}

// ============================================================
// Update Post Request
// ============================================================

export interface UpdatePostRequest extends Partial<BlogPostForm> {
  // All fields from BlogPostForm are optional
}

// ============================================================
// SEO Score (for editor)
// ============================================================

export interface SEOScore {
  score: number; // 0-100
  color: 'red' | 'yellow' | 'green';
  checks: SEOScoreCheck[];
}

export interface SEOScoreCheck {
  id: string;
  label: string;
  label_ja: string;
  passed: boolean;
  points: number;
  maxPoints: number;
}

// ============================================================
// Reading Time Calculation
// ============================================================

export function calculateReadingTime(content: string): number {
  // Average reading speed: 200 words per minute for English
  // For Japanese, average is about 400 characters per minute
  const wordCount = content.split(/\s+/).length;
  const charCount = content.length;

  // Use word count for non-CJK content, character count for CJK
  const cjkRatio = (content.match(/[\u3000-\u9fff]/g) || []).length / charCount;

  if (cjkRatio > 0.3) {
    // Primarily CJK content
    return Math.max(1, Math.ceil(charCount / 400));
  } else {
    // Primarily non-CJK content
    return Math.max(1, Math.ceil(wordCount / 200));
  }
}

// ============================================================
// Slug Generation
// ============================================================

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// ============================================================
// Validation
// ============================================================

export function validateBlogPostForm(form: Partial<BlogPostForm>): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!form.title || form.title.trim().length === 0) {
    errors.title = 'タイトルを入力してください。';
  }

  if (form.title && form.title.length > 200) {
    errors.title = 'タイトルは200文字以内で入力してください。';
  }

  if (!form.content || form.content.trim().length === 0) {
    errors.content = '本文を入力してください。';
  }

  if (!form.category) {
    errors.category = 'カテゴリを選択してください。';
  }

  if (form.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(form.slug)) {
    errors.slug = 'スラッグは半角英数字とハイフンのみ使用できます。';
  }

  if (form.meta_title && form.meta_title.length > 60) {
    errors.meta_title = 'SEOタイトルは60文字以内で入力してください。';
  }

  if (form.meta_description && form.meta_description.length > 160) {
    errors.meta_description = 'メタ説明は160文字以内で入力してください。';
  }

  if (form.excerpt && form.excerpt.length > 160) {
    errors.excerpt = '抜粋は160文字以内で入力してください。';
  }

  if (form.status === 'published' && !form.published_at) {
    errors.published_at = '公開日時を設定してください。';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
