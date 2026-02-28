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

// Articles to update
const ARTICLES = [
  { file: '01-gazette-pouch.md', slug: 'gazette-pouch' },
  { file: '02-variable-printing.md', slug: 'variable-printing' },
  { file: '03-small-lot-guide.md', slug: 'small-lot-guide' },
  { file: '04-stand-pouch.md', slug: 'stand-pouch' },
  { file: '05-printing-comparison.md', slug: 'printing-comparison' },
  { file: '06-flat-pouch.md', slug: 'flat-pouch' },
  { file: '07-stand-pouch-v2.md', slug: 'stand-pouch-v2' },
  { file: '08-gazette-pouch-v2.md', slug: 'gazette-pouch-v2' },
  { file: '09-spout-pouch.md', slug: 'spout-pouch' },
  { file: '10-roll-film.md', slug: 'roll-film' },
  { file: '11-chojiu-bag.md', slug: 'chojiu-bag' },
  { file: '13-small-lot-printing.md', slug: 'small-lot-printing' },
  { file: '16-customer-interview.md', slug: 'customer-interview' },
];

async function updateArticles() {
  console.log('=== ブログ記事のコンテンツを更新（会社情報の修正反映）===\n');

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
