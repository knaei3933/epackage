import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Articles 01-05 to update
const ARTICLES = [
  { file: '01-gazette-pouch.md', slug: 'gazette-pouch' },
  { file: '02-variable-printing.md', slug: 'variable-printing' },
  { file: '03-small-lot-guide.md', slug: 'small-lot-guide' },
  { file: '04-stand-pouch.md', slug: 'stand-pouch' },
  { file: '05-printing-comparison.md', slug: 'printing-comparison' },
];

async function updateArticles() {
  console.log('=== 記事01-05のコンテンツを更新 ===\n');

  for (const article of ARTICLES) {
    try {
      // Read markdown file
      const filePath = join(__dirname, '../docs/blog/articles', article.file);
      const content = readFileSync(filePath, 'utf-8');

      // Update article content
      const { data, error } = await supabase
        .from('blog_posts')
        .update({ content: content, updated_at: new Date().toISOString() })
        .eq('slug', article.slug)
        .select();

      if (error) {
        console.error(`❌ エラー: ${article.slug}`, error.message);
      } else {
        console.log(`✅ 更新完了: ${article.slug}`);
      }
    } catch (err) {
      console.error(`❌ ファイル読み取りエラー: ${article.file}`, err.message);
    }
  }

  console.log('\n=== 更新完了 ===');
}

updateArticles().catch(console.error);
