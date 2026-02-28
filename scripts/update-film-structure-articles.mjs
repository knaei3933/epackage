/**
 * Update Supabase blog posts with film structure information
 * Updates articles 06-11 with detailed film structure content
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Articles to update with film structure information
const ARTICLES = [
  { slug: 'flat-pouch', file: '06-flat-pouch.md' },
  { slug: 'stand-pouch-v2', file: '07-stand-pouch-v2.md' },
  { slug: 'gazette-pouch-v2', file: '08-gazette-pouch-v2.md' },
  { slug: 'spout-pouch', file: '09-spout-pouch.md' },
  { slug: 'roll-film', file: '10-roll-film.md' },
  { slug: 'chojiu-bag', file: '11-chojiu-bag.md' },
];

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Updating blog articles with film structure information...`);
  console.log('='.repeat(60));

  let successCount = 0;
  let errorCount = 0;

  for (const article of ARTICLES) {
    const filePath = path.join(process.cwd(), 'docs/blog/articles', article.file);

    if (!fs.existsSync(filePath)) {
      console.log(`\n✗ File not found: ${filePath}`);
      errorCount++;
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    console.log(`\n📄 ${article.slug} (${article.file}):`);
    console.log(`   Content length: ${content.length} chars`);

    if (dryRun) {
      console.log(`   [DRY RUN] Would update ${article.slug}`);
      successCount++;
      continue;
    }

    const { error } = await supabase
      .from('blog_posts')
      .update({ 
        content: content, 
        updated_at: new Date().toISOString() 
      })
      .eq('slug', article.slug);

    if (error) {
      console.log(`   ✗ Error: ${error.message}`);
      errorCount++;
    } else {
      console.log(`   ✓ Successfully updated ${article.slug}`);
      successCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Summary: ${successCount} succeeded, ${errorCount} failed`);
  console.log('Done!');
}

main().catch(console.error);
