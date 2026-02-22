/**
 * Blog Sync Script
 *
 * Syncs markdown blog files to Supabase database.
 * This script should be run during build or via npm script.
 *
 * Usage:
 *   npm run sync-blog
 *   node scripts/sync-blog.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import {
  parseAllMarkdownFiles,
  contentToBlogPost,
  validateBlogContent,
  getBlogStats,
} from '../src/lib/blog/content';
import {
  optimizeAllImages,
  uploadToSupabase,
  uploadVariantsToSupabase,
  getImageStats,
} from '../src/lib/blog/images';
import type { BlogSyncStats, BlogSyncOptions } from '../src/types/blog';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

/**
 * Main sync function
 */
async function syncBlog(options: BlogSyncOptions = {}): Promise<BlogSyncStats> {
  const startTime = Date.now();
  const stats: BlogSyncStats = {
    processed: 0,
    created: 0,
    updated: 0,
    deleted: 0,
    imagesProcessed: 0,
    duration: 0,
    errors: [],
  };

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    console.log('🚀 Starting blog sync...\n');

    // Step 1: Validate blog content
    if (options.verbose) {
      console.log('📋 Validating blog content...');
    }
    const validation = validateBlogContent();

    if (!validation.valid) {
      console.error('❌ Blog content validation failed:');
      validation.errors.forEach(error => console.error(`  - ${error}`));
      process.exit(1);
    }

    if (validation.warnings.length > 0) {
      console.warn('⚠️  Warnings:');
      validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }

    // Step 2: Parse all markdown files
    if (options.verbose) {
      console.log('📝 Parsing markdown files...');
    }
    const contents = await parseAllMarkdownFiles();

    // Filter by category/status if specified
    const filteredContents = contents.filter(content => {
      if (options.category && content.metadata.category !== options.category) {
        return false;
      }
      if (options.status && content.metadata.status !== options.status) {
        return false;
      }
      return true;
    });

    stats.processed = filteredContents.length;

    if (stats.processed === 0) {
      console.log('✅ No posts to sync');
      return stats;
    }

    // Step 3: Process images if enabled
    if (options.processImages !== false) {
      if (options.verbose) {
        console.log('🖼️  Processing images...');
      }

      const imageStats = getImageStats();
      if (options.verbose) {
        console.log(`  Found ${imageStats.total} images`);
      }

      const optimizedImages = await optimizeAllImages();
      stats.imagesProcessed = optimizedImages.length;

      // Upload images to Supabase if enabled
      if (options.uploadToSupabase !== false) {
        for (const image of optimizedImages) {
          try {
            await uploadToSupabase(image, SUPABASE_URL, SUPABASE_SERVICE_KEY);
            await uploadVariantsToSupabase(image, SUPABASE_URL, SUPABASE_SERVICE_KEY);
          } catch (error) {
            stats.errors.push({
              file: image.originalPath,
              message: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }
      }
    }

    // Step 4: Sync posts to Supabase
    if (options.verbose) {
      console.log('💾 Syncing posts to Supabase...');
    }

    // Get existing posts from Supabase
    const { data: existingPosts, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, slug');

    if (fetchError) {
      throw new Error(`Failed to fetch existing posts: ${fetchError.message}`);
    }

    const existingSlugs = new Set(existingPosts?.map(p => p.slug) || []);
    const syncedSlugs = new Set<string>();

    // Upsert each post
    for (const content of filteredContents) {
      try {
        const post = contentToBlogPost(content);

        // Add image URLs if images were uploaded
        if (post.featured_image && options.processImages !== false) {
          // TODO: Map local image path to Supabase URL
          post.featured_image_url = `${SUPABASE_URL}/storage/v1/object/public/blog-images/${post.featured_image}`;
        }

        const { error } = await supabase
          .from('blog_posts')
          .upsert(post, {
            onConflict: 'slug',
            ignoreDuplicates: false,
          });

        if (error) {
          throw new Error(`Failed to upsert post: ${error.message}`);
        }

        syncedSlugs.add(post.slug);

        if (existingSlugs.has(post.slug)) {
          stats.updated++;
          if (options.verbose) {
            console.log(`  ✓ Updated: ${post.title}`);
          }
        } else {
          stats.created++;
          if (options.verbose) {
            console.log(`  ✓ Created: ${post.title}`);
          }
        }
      } catch (error) {
        stats.errors.push({
          file: content.file_path,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        console.error(`  ✗ Failed to sync ${path.basename(content.file_path)}:`, error);
      }
    }

    // Step 5: Delete posts not in source (if enabled)
    if (options.deleteMissing && existingPosts) {
      if (options.verbose) {
        console.log('🗑️  Removing posts not in source...');
      }

      for (const existingPost of existingPosts) {
        if (!syncedSlugs.has(existingPost.slug)) {
          const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('slug', existingPost.slug);

          if (error) {
            stats.errors.push({
              file: existingPost.slug,
              message: `Failed to delete: ${error.message}`,
            });
          } else {
            stats.deleted++;
            if (options.verbose) {
              console.log(`  ✓ Deleted: ${existingPost.slug}`);
            }
          }
        }
      }
    }

    stats.duration = Date.now() - startTime;

    // Print summary
    console.log('\n✅ Sync complete!\n');
    console.log(`📊 Statistics:`);
    console.log(`  Processed: ${stats.processed}`);
    console.log(`  Created: ${stats.created}`);
    console.log(`  Updated: ${stats.updated}`);
    console.log(`  Deleted: ${stats.deleted}`);
    console.log(`  Images: ${stats.imagesProcessed}`);
    console.log(`  Duration: ${(stats.duration / 1000).toFixed(2)}s`);

    if (stats.errors.length > 0) {
      console.log(`\n⚠️  Errors (${stats.errors.length}):`);
      stats.errors.forEach(error => console.log(`  - ${error.file}: ${error.message}`));
    }

    return stats;
  } catch (error) {
    console.error('❌ Sync failed:', error);
    stats.duration = Date.now() - startTime;
    throw error;
  }
}

/**
 * CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const options: BlogSyncOptions = {
    deleteMissing: args.includes('--delete-missing'),
    processImages: !args.includes('--no-images'),
    uploadToSupabase: !args.includes('--no-upload'),
    verbose: !args.includes('--quiet') || args.includes('-v') || args.includes('--verbose'),
  };

  // Parse filters
  const categoryIndex = args.indexOf('--category');
  if (categoryIndex !== -1 && args[categoryIndex + 1]) {
    options.category = args[categoryIndex + 1] as any;
  }

  const statusIndex = args.indexOf('--status');
  if (statusIndex !== -1 && args[statusIndex + 1]) {
    options.status = args[statusIndex + 1] as any;
  }

  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Blog Sync Script

Syncs markdown blog files to Supabase database.

Usage:
  node scripts/sync-blog.ts [options]

Options:
  --delete-missing    Delete posts in Supabase that are not in source
  --no-images         Skip image processing
  --no-upload         Skip uploading to Supabase (local processing only)
  --category <cat>    Only sync posts from specific category
  --status <status>   Only sync posts with specific status
  -v, --verbose       Show detailed output
  -q, --quiet         Suppress detailed output
  -h, --help          Show this help message

Examples:
  node scripts/sync-blog.ts
  node scripts/sync-blog.ts --delete-missing --verbose
  node scripts/sync-blog.ts --category technical --status published
  node scripts/sync-blog.ts --no-images
    `);
    process.exit(0);
  }

  try {
    await syncBlog(options);
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { syncBlog };
