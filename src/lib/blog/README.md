# Blog Management System

Markdown-based blog management system with SEO support for Epackage Lab.

## Features

- **Markdown Files**: Write blog posts in Markdown with YAML frontmatter
- **Image Optimization**: Automatic WebP conversion and responsive image generation
- **SEO Support**: Complete meta tags, OpenGraph, Twitter Cards, and JSON-LD
- **Supabase Integration**: Sync markdown files to Supabase database
- **Sitemap & RSS**: Automatic generation for search engines

## Directory Structure

```
src/content/blog/
├── *.md                    # Blog post markdown files
└── images/                 # Blog images
    └── *.jpg,*.png,*.webp

src/lib/blog/
├── content.ts              # Markdown parsing utilities
├── images.ts               # Image optimization
└── seo.ts                  # SEO metadata generation

scripts/
└── sync-blog.ts            # Sync script for Supabase
```

## Frontmatter Format

```yaml
---
title: "Blog Post Title"
slug: "blog-post-slug"
excerpt: "Short description for listings"
category: "technical"
tags:
  - tag1
  - tag2
meta_title: "SEO Title"
meta_description: "SEO Description"
reading_time_minutes: 5
status: "draft"
published_at: "2026-02-19T10:00:00+09:00"
featured_image: "image.jpg"
author: "Author Name"
---
```

### Available Categories

- `technical` - Technical articles
- `case-study` - Case studies
- `news` - News and updates
- `tutorial` - Tutorials and guides
- `announcement` - Announcements
- `industry` - Industry insights

### Status Values

- `draft` - Draft (not published)
- `published` - Published (visible on site)
- `archived` - Archived (not visible)

## Usage

### Creating a New Blog Post

1. Create a new markdown file in `src/content/blog/`
2. Add frontmatter with required fields
3. Write your content in Markdown
4. Run sync script to update Supabase

### Syncing to Supabase

```bash
# Basic sync
npm run sync:blog

# Verbose output
npm run sync:blog:verbose

# Custom options
npx ts-node scripts/sync-blog.ts --delete-missing --verbose
```

### Sync Options

- `--delete-missing` - Delete posts in Supabase not in source
- `--no-images` - Skip image processing
- `--no-upload` - Skip Supabase upload (local only)
- `--category <cat>` - Filter by category
- `--status <status>` - Filter by status
- `-v, --verbose` - Show detailed output
- `-q, --quiet` - Suppress output

## API Usage

### Parse Markdown File

```typescript
import { parseMarkdownFile } from '@/lib/blog/content';

const content = await parseMarkdownFile('path/to/file.md');
console.log(content.metadata);
console.log(content.html);
```

### Generate SEO Metadata

```typescript
import { generateSEOMetadata } from '@/lib/blog/seo';

const metadata = generateSEOMetadata(post, fullUrl);
```

### Optimize Images

```typescript
import { optimizeImage } from '@/lib/blog/images';

const optimized = await optimizeImage('path/to/image.jpg');
```

## Type Definitions

See `src/types/blog.ts` for complete type definitions:

- `BlogFrontmatter` - Frontmatter metadata
- `BlogContent` - Parsed content
- `BlogPost` - Complete post with Supabase data
- `SEOMetadata` - SEO metadata
- `ImageOptimizeOptions` - Image optimization options

## Development

### Install Dependencies

```bash
npm install
```

### Run Sync Script

```bash
npm run sync:blog
```

### Test Locally

```bash
npm run dev
```

## Production Build

The sync script should run during build to ensure Supabase is up-to-date:

```bash
npm run build
```

## Notes

- Images are stored in `src/content/blog/images/`
- Optimized images are generated with `-optimized` suffix
- Supabase Storage bucket: `blog-images`
- Sync script requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

## License

Copyright (c) 2026 Epackage Lab. All rights reserved.
