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

// Articles 12-16 to add
const ARTICLES = [
  {
    file: '12-package-design-tips.md',
    slug: 'package-design-tips',
    title: '【実践的ノウハウ】パッケージデザインの基本｜売れるパッケージを作る3つのコツ',
    excerpt: 'パッケージデザインは、商品の顔であり、消費者の目に留まる最初の触点です。この記事では、売れるパッケージデザインの3つのコツを具体的に解説します。',
    category: 'design',
    tags: ['実践的ノウハウ', 'デザイン'],
    image: '/images/blog/12-package-design-basics/12-hero-01.png'
  },
  {
    file: '13-small-lot-printing.md',
    slug: 'small-lot-printing',
    title: '【実践的ノウハウ】小ロット印刷の活用｜A/Bテストから多品種展開まで',
    excerpt: '小ロット印刷（1個から製造可能）は、テスト販売からA/Bテスト、多品種展開まで、幅広いシナリオで活用できます。',
    category: 'printing',
    tags: ['実践的ノウハウ', '印刷'],
    image: '/images/blog/13-small-lot-printing/13-hero-01.png'
  },
  {
    file: '14-white-plate-guide.md',
    slug: 'white-plate-guide',
    title: '【実践的ノウハウ】白版（しらはん）とは？パッケージ印刷の品質を高める技術',
    excerpt: '白版（しらはん）は、パッケージ印刷の品質を向上させるための技術です。特に暗色や黒を印刷する際に効果を発揮します。',
    category: 'printing',
    tags: ['実践的ノウハウ', '印刷技術'],
    image: '/images/blog/14-white-plate/14-hero-01.png'
  },
  {
    file: '15-die-cut-package.md',
    slug: 'die-cut-package',
    title: '【実践的ノウハウ】型抜きパッケージ｜形状で差別化する戦略的選択',
    excerpt: '型抜きパッケージは、特別な金型を使って、一般的なシンプルな形状とは違ったオリジナルな形状のパッケージを作る技術です。',
    category: 'package',
    tags: ['実践的ノウハウ', 'パッケージ'],
    image: '/images/blog/15-die-cut-package/15-hero-01.png'
  },
  {
    file: '16-customer-interview.md',
    slug: 'customer-interview',
    title: '【実践的ノウハウ】顧客インタビュー｜健康食品メーカーA社の導入事例',
    excerpt: '健康食品メーカーA社は、Epackage Labを活用して、小ロットでのテストから多品種展開まで成功させました。',
    category: 'case-study',
    tags: ['実践的ノウハウ', '導入事例'],
    image: '/images/blog/16-customer-interview/16-hero-01.png'
  }
];

async function updateArticles() {
  console.log('=== 記事12-16をSupabaseに登録 ===\n');

  for (const article of ARTICLES) {
    try {
      // Read markdown file
      const filePath = join(__dirname, '../docs/blog/articles', article.file);
      const content = readFileSync(filePath, 'utf-8');

      // Check if article already exists
      const { data: existing } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', article.slug)
        .single();

      if (existing) {
        console.log(`⏭️  スキップ: ${article.slug} (既に存在)`);
        continue;
      }

      // Insert new article
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          slug: article.slug,
          title: article.title,
          excerpt: article.excerpt,
          content: content,
          category: article.category,
          tags: article.tags,
          og_image_path: article.image,
          status: 'published',
          published_at: new Date('2025-02-25').toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error(`❌ エラー: ${article.slug}`, error.message);
      } else {
        console.log(`✅ 登録完了: ${article.slug} (ID: ${data[0].id})`);
      }
    } catch (err) {
      console.error(`❌ ファイル読み取りエラー: ${article.file}`, err.message);
    }
  }

  console.log('\n=== 登録完了 ===');

  // Verify total count
  const { count } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  console.log(`\n📊 公開中の記事数: ${count}件`);
}

updateArticles().catch(console.error);
