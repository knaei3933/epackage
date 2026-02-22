/**
 * Blog Content Utilities
 *
 * Handles markdown file parsing, frontmatter extraction,
 * and content management for the blog system.
 */

import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import type { Root, Heading, Html } from 'mdast';
import type {
  BlogContent,
  BlogFrontmatter,
  BlogPost,
  TableOfContents,
} from '@/types/blog';

/**
 * Blog content directory
 */
const BLOG_CONTENT_DIR = path.join(process.cwd(), 'src/content/blog');

/**
 * Blog images directory
 */
const BLOG_IMAGES_DIR = path.join(BLOG_CONTENT_DIR, 'images');

/**
 * Parse markdown file with frontmatter
 */
export async function parseMarkdownFile(filePath: string): Promise<BlogContent> {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  // Validate frontmatter
  const frontmatter = validateFrontmatter(data);

  // Process markdown to HTML
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true });

  const vfile = await processor.process(content);
  const html = String(vfile);

  // Generate table of contents
  const toc = generateTableOfContents(content);

  // Count words
  const wordCount = countWords(content);

  return {
    metadata: frontmatter,
    html,
    markdown: content,
    toc,
    word_count: wordCount,
    file_path: filePath,
  };
}

/**
 * Validate and normalize frontmatter data
 */
function validateFrontmatter(data: any): BlogFrontmatter {
  const required = ['title', 'slug', 'excerpt', 'category', 'tags', 'reading_time_minutes', 'status', 'published_at'];
  const missing = required.filter(field => !data[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required frontmatter fields: ${missing.join(', ')}`);
  }

  // Validate slug format
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
    throw new Error(`Invalid slug format: ${data.slug}. Use lowercase letters, numbers, and hyphens.`);
  }

  // Set defaults
  return {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    category: data.category,
    tags: Array.isArray(data.tags) ? data.tags : [],
    meta_title: data.meta_title || data.title,
    meta_description: data.meta_description || data.excerpt,
    reading_time_minutes: parseInt(data.reading_time_minutes, 10),
    status: data.status,
    published_at: data.published_at,
    featured_image: data.featured_image,
    author: data.author,
    author_avatar: data.author_avatar,
    og_image: data.og_image,
    twitter_card: data.twitter_card || 'summary_large_image',
    canonical_url: data.canonical_url,
    noindex: data.noindex || false,
    schema_type: data.schema_type || 'BlogPosting',
    nosnippet: data.nosnippet || false,
  };
}

/**
 * Generate table of contents from markdown content
 */
function generateTableOfContents(markdown: string): TableOfContents[] {
  const toc: TableOfContents[] = [];

  const lines = markdown.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = generateHeadingId(text);

      toc.push({ id, text, level });
    }
  }

  return toc;
}

/**
 * Generate URL-friendly heading ID
 */
function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Count words in markdown content
 */
function countWords(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Keep link text, remove URL
    .replace(/[#*_~`]/g, '') // Remove markdown syntax
    .trim();

  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Get all markdown files from blog directory
 */
export function getAllMarkdownFiles(): string[] {
  if (!fs.existsSync(BLOG_CONTENT_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BLOG_CONTENT_DIR);
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(BLOG_CONTENT_DIR, file));
}

/**
 * Get markdown files by status
 */
export function getMarkdownFilesByStatus(status: string): string[] {
  const files = getAllMarkdownFiles();
  const filtered: string[] = [];

  for (const file of files) {
    try {
      const { data } = matter.read(file);
      if (data.status === status) {
        filtered.push(file);
      }
    } catch (error) {
      console.warn(`Failed to read ${file}:`, error);
    }
  }

  return filtered;
}

/**
 * Get markdown files by category
 */
export function getMarkdownFilesByCategory(category: string): string[] {
  const files = getAllMarkdownFiles();
  const filtered: string[] = [];

  for (const file of files) {
    try {
      const { data } = matter.read(file);
      if (data.category === category) {
        filtered.push(file);
      }
    } catch (error) {
      console.warn(`Failed to read ${file}:`, error);
    }
  }

  return filtered;
}

/**
 * Get markdown file by slug
 */
export function getMarkdownFileBySlug(slug: string): string | null {
  const files = getAllMarkdownFiles();

  for (const file of files) {
    try {
      const { data } = matter.read(file);
      if (data.slug === slug) {
        return file;
      }
    } catch (error) {
      console.warn(`Failed to read ${file}:`, error);
    }
  }

  return null;
}

/**
 * Parse all markdown files
 */
export async function parseAllMarkdownFiles(): Promise<BlogContent[]> {
  const files = getAllMarkdownFiles();
  const contents: BlogContent[] = [];

  for (const file of files) {
    try {
      const content = await parseMarkdownFile(file);
      contents.push(content);
    } catch (error) {
      console.error(`Failed to parse ${file}:`, error);
    }
  }

  // Sort by published date (newest first)
  return contents.sort((a, b) =>
    new Date(b.metadata.published_at).getTime() - new Date(a.metadata.published_at).getTime()
  );
}

/**
 * Convert BlogContent to BlogPost for Supabase
 */
export function contentToBlogPost(content: BlogContent): Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'view_count'> {
  return {
    title: content.metadata.title,
    slug: content.metadata.slug,
    excerpt: content.metadata.excerpt,
    category: content.metadata.category,
    tags: content.metadata.tags,
    meta_title: content.metadata.meta_title,
    meta_description: content.metadata.meta_description,
    reading_time_minutes: content.metadata.reading_time_minutes,
    status: content.metadata.status,
    published_at: content.metadata.published_at,
    featured_image: content.metadata.featured_image,
    author: content.metadata.author,
    author_avatar: content.metadata.author_avatar,
    og_image: content.metadata.og_image,
    twitter_card: content.metadata.twitter_card,
    canonical_url: content.metadata.canonical_url,
    noindex: content.metadata.noindex,
    schema_type: content.metadata.schema_type,
    nosnippet: content.metadata.nosnippet,
    content_html: content.html,
    content_markdown: content.markdown,
  };
}

/**
 * Watch blog directory for changes
 */
export function watchBlogDirectory(
  callback: (event: string, filename: string) => void
): fs.FSWatcher | null {
  if (!fs.existsSync(BLOG_CONTENT_DIR)) {
    return null;
  }

  return fs.watch(BLOG_CONTENT_DIR, (event, filename) => {
    if (filename && filename.endsWith('.md')) {
      callback(event, filename);
    }
  });
}

/**
 * Validate blog content structure
 */
export function validateBlogContent(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!fs.existsSync(BLOG_CONTENT_DIR)) {
    errors.push('Blog content directory does not exist');
    return { valid: false, errors, warnings };
  }

  const files = getAllMarkdownFiles();

  if (files.length === 0) {
    warnings.push('No markdown files found in blog directory');
  }

  for (const file of files) {
    try {
      const content = parseMarkdownFile(file);

      // Check for duplicate slugs
      const duplicateSlug = files.some(otherFile => {
        if (otherFile === file) return false;
        try {
          const otherContent = matter.read(otherFile);
          return otherContent.data.slug === content.metadata.slug;
        } catch {
          return false;
        }
      });

      if (duplicateSlug) {
        errors.push(`Duplicate slug found: ${content.metadata.slug} in ${path.basename(file)}`);
      }

      // Check if featured image exists
      if (content.metadata.featured_image) {
        const imagePath = path.join(BLOG_IMAGES_DIR, content.metadata.featured_image);
        if (!fs.existsSync(imagePath)) {
          warnings.push(`Featured image not found: ${content.metadata.featured_image} for ${path.basename(file)}`);
        }
      }
    } catch (error) {
      errors.push(`Failed to validate ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get blog content statistics
 */
export function getBlogStats(): {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  totalWords: number;
  totalReadingTime: number;
} {
  const files = getAllMarkdownFiles();
  const stats = {
    total: files.length,
    byStatus: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    totalWords: 0,
    totalReadingTime: 0,
  };

  for (const file of files) {
    try {
      const { data, content } = matter.read(file);

      // Count by status
      const status = data.status || 'unknown';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

      // Count by category
      const category = data.category || 'uncategorized';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

      // Count words
      stats.totalWords += countWords(content);

      // Reading time
      stats.totalReadingTime += parseInt(data.reading_time_minutes || 0, 10);
    } catch (error) {
      // Skip invalid files
    }
  }

  return stats;
}
