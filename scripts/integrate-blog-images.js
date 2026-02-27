/**
 * Blog Image Integration Automation Script
 *
 * Automatically inserts image references into blog article markdown files
 * and updates Supabase database with the modified content.
 *
 * Usage:
 *   node scripts/integrate-blog-images.js --dry-run    # Preview changes
 *   node scripts/integrate-blog-images.js --article 06-flat-pouch  # Process specific article
 *   node scripts/integrate-blog-images.js --all       # Process all articles
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
config({ path: path.join(process.cwd(), '.env.local') });

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// =====================================================
// Slug Mapping: Markdown filename -> Database slug
// =====================================================

const SLUG_MAPPING = {
  '06-flat-pouch': 'flat-pouch',
  '07-stand-pouch-v2': 'stand-pouch-v2',
  '08-gazette-pouch-v2': 'gazette-pouch-v2',
  '09-spout-pouch': 'spout-pouch',
  '10-roll-film': 'roll-film',
  '11-chojiu-bag': 'chojiu-bag',
  '12-package-design-tips': 'package-design-tips',
  '13-small-lot-printing': 'small-lot-printing',
  '14-white-plate-guide': 'white-plate-guide',
  '15-die-cut-package': 'die-cut-package',
  '16-customer-interview': 'customer-interview'
};

// Reverse mapping: Database slug -> Markdown filename
const REVERSE_SLUG_MAPPING = Object.fromEntries(
  Object.entries(SLUG_MAPPING).map(([k, v]) => [v, k])
);

// Get database slug from markdown slug or return original
function getDbSlug(slug) {
  return SLUG_MAPPING[slug] || slug;
}

// Get markdown slug from database slug or return original
function getMarkdownSlug(slug) {
  return REVERSE_SLUG_MAPPING[slug] || slug;
}

// =====================================================
// Article-to-Images Mapping
// =====================================================

const ARTICLE_IMAGES = {
  '06-flat-pouch': {
    hero: '/images/blog/06-flat-pouch/06-hero-01.png',
    section: '/images/blog/06-flat-pouch/06-section-01.png',
    products: [
      '/images/blog/06-flat-pouch/06-product-01.png',
      '/images/blog/06-flat-pouch/06-product-02.png',
      '/images/blog/06-flat-pouch/06-product-03.png'
    ],
    comparison: '/images/blog/06-flat-pouch/06-comparison-01.png',
    sizeGuide: '/images/blog/06-flat-pouch/06-size-guide.png',
    lifestyle: '/images/blog/06-flat-pouch/06-lifestyle-01.png',
    productsGrid: '/images/blog/06-flat-pouch/06-products-grid-01.png'
  },
  '07-stand-pouch-v2': {
    hero: '/images/blog/07-stand-pouch/07-hero-01.png',
    section: '/images/blog/07-stand-pouch/07-section-01.png',
    products: [
      '/images/blog/07-stand-pouch/07-product-01.png',
      '/images/blog/07-stand-pouch/07-product-02.png',
      '/images/blog/07-stand-pouch/07-product-03.png',
      '/images/blog/07-stand-pouch/07-product-04.png'
    ],
    comparison: '/images/blog/07-stand-pouch/07-comparison-01.png'
  },
  '08-gazette-pouch-v2': {
    hero: '/images/blog/08-gusset-pouch/08-hero-01.png',
    section: '/images/blog/08-gusset-pouch/08-section-01.png',
    products: [
      '/images/blog/08-gusset-pouch/08-product-01.png',
      '/images/blog/08-gusset-pouch/08-product-02.png',
      '/images/blog/08-gusset-pouch/08-product-03.png'
    ],
    productsGrid: '/images/blog/08-gusset-pouch/08-products-grid-01.png',
    sizeGuide: '/images/blog/08-gusset-pouch/08-size-guide.png',
    capacity: '/images/blog/08-gusset-pouch/08-capacity-01.png'
  },
  '09-spout-pouch': {
    hero: '/images/blog/09-spout-pouch/09-hero-01.png',
    section: '/images/blog/09-spout-pouch/09-section-01.png',
    products: [
      '/images/blog/09-spout-pouch/09-product-01.png',
      '/images/blog/09-spout-pouch/09-product-02.png',
      '/images/blog/09-spout-pouch/09-product-03.png'
    ],
    productsGrid: '/images/blog/09-spout-pouch/09-products-grid.png',
    caps: '/images/blog/09-spout-pouch/09-caps-01.png',
    pouring: '/images/blog/09-spout-pouch/09-pouring-01.png'
  },
  '10-roll-film': {
    hero: '/images/blog/10-roll-film/10-hero-01.png',
    section: '/images/blog/10-roll-film/10-section-01.png',
    products: [
      '/images/blog/10-roll-film/10-products-01.png',
      '/images/blog/10-roll-film/10-products-02.png'
    ],
    productsGrid: '/images/blog/10-roll-film/10-products-grid-01.png',
    efficiency: '/images/blog/10-roll-film/10-efficiency-01.png',
    machine: '/images/blog/10-roll-film/10-machine-01.png',
    seal: '/images/blog/10-roll-film/10-seal-01.png'
  },
  '11-chojiu-bag': {
    hero: '/images/blog/11-lap-bag/11-hero-01.png',
    section: '/images/blog/11-lap-bag/11-section-01.png',
    products: [
      '/images/blog/11-lap-bag/11-product-01.png',
      '/images/blog/11-lap-bag/11-product-02.png',
      '/images/blog/11-lap-bag/11-product-03.png'
    ],
    productsGrid: '/images/blog/11-lap-bag/11-products-grid-01.png',
    comparison: '/images/blog/11-lap-bag/11-comparison-01.png',
    shapes: '/images/blog/11-lap-bag/11-shapes-01.png'
  },
  '12-package-design-tips': {
    hero: '/images/blog/12-package-design-basics/12-hero-01.png',
    section: '/images/blog/12-package-design-basics/12-section-01.png',
    layout: '/images/blog/12-package-design-basics/12-layout-01.png',
    colors: '/images/blog/12-package-design-basics/12-colors-01.png',
    fonts: '/images/blog/12-package-design-basics/12-fonts-01.png',
    examples: '/images/blog/12-package-design-basics/12-examples-01.png',
    checklist: '/images/blog/12-package-design-basics/12-checklist-01.png',
    process: '/images/blog/12-package-design-basics/12-process-01.png'
  },
  '13-small-lot-printing': {
    hero: '/images/blog/13-small-lot-printing/13-hero-01.png',
    section: '/images/blog/13-small-lot-printing/13-section-01.png',
    cost: '/images/blog/13-small-lot-printing/13-cost-01.png',
    cases: '/images/blog/13-small-lot-printing/13-cases-01.png',
    abtest: '/images/blog/13-small-lot-printing/13-abtest-01.png',
    abtestProcess: '/images/blog/13-small-lot-printing/13-abtest-process-01.png',
    seasonal: '/images/blog/13-small-lot-printing/13-seasonal-01.png'
  },
  '14-white-plate-guide': {
    hero: '/images/blog/14-white-plate/14-hero-01.png',
    section: '/images/blog/14-white-plate/14-section-01.png',
    comparison: '/images/blog/14-white-plate/14-comparison-01.png',
    darkColors: '/images/blog/14-white-plate/14-dark-colors-01.png',
    process: '/images/blog/14-white-plate/14-process-01.png',
    techniques: '/images/blog/14-white-plate/14-techniques-01.png',
    products: '/images/blog/14-white-plate/14-products-01.png'
  },
  '15-die-cut-package': {
    hero: '/images/blog/15-die-cut-package/15-hero-01.png',
    section: '/images/blog/15-die-cut-package/15-section-01.png',
    types: [
      '/images/blog/15-die-cut-package/15-types-01.png',
      '/images/blog/15-die-cut-package/15-types-02.png'
    ],
    benefits: '/images/blog/15-die-cut-package/15-benefits-01.png',
    cases: '/images/blog/15-die-cut-package/15-cases-01.png',
    seasonal: '/images/blog/15-die-cut-package/15-seasonal-01.png',
    strategy: '/images/blog/15-die-cut-package/15-strategy-01.png'
  },
  '16-customer-interview': {
    hero: '/images/blog/16-customer-interview/16-hero-01.png',
    section: '/images/blog/16-customer-interview/16-section-01.png',
    profile: '/images/blog/16-customer-interview/16-profile-01.png',
    problems: '/images/blog/16-customer-interview/16-problems-01.png',
    process: '/images/blog/16-customer-interview/16-process-01.png',
    results: '/images/blog/16-customer-interview/16-results-01.png',
    comparison: '/images/blog/16-customer-interview/16-comparison-01.png',
    growth: '/images/blog/16-customer-interview/16-growth-01.png',
    future: '/images/blog/16-customer-interview/16-future-01.png'
  }
};

// =====================================================
// Image Insertion Patterns
// =====================================================

const INSERTION_RULES = {
  // Hero image: Insert after the lead section (--- after リード文)
  hero: {
    pattern: /##\s+目次/m,
    position: 'before',
    template: (imagePath) => `\n![Hero Image](${imagePath})\n\n`,
    priority: 1
  },

  // Section images: Insert after main section headings (## 数字. ~~~)
  section: {
    pattern: /^##\s+\d+\.\s+.+$/m,
    position: 'after',
    template: (imagePath) => `\n![Section Image](${imagePath})\n`,
    priority: 2
  },

  // Product images: Insert after product description subsections
  products: {
    pattern: /###\s+(製品紹介|主な製品|製品例|製品一覧|商品紹介|基本構造)/m,
    position: 'after',
    template: (imagePath) => `\n![Product Image](${imagePath})\n`,
    priority: 3
  },

  // Comparison images: Insert after comparison sections
  comparison: {
    pattern: /###\s+(比較|メリット・デメリット|使い分け|従来印刷との比較|通常印刷との比較)/m,
    position: 'after',
    template: (imagePath) => `\n![Comparison Image](${imagePath})\n`,
    priority: 4
  },

  // Size guide: Insert after size/selection sections
  sizeGuide: {
    pattern: /###\s+(サイズ|選び方|サイズ選定)/m,
    position: 'after',
    template: (imagePath) => `\n![Size Guide](${imagePath})\n`,
    priority: 5
  },

  // Lifestyle images: Insert after usage/application sections
  lifestyle: {
    pattern: /###\s+(用途|活用方法|使い方)/m,
    position: 'after',
    template: (imagePath) => `\n![Lifestyle Image](${imagePath})\n`,
    priority: 6
  },

  // Products grid: Insert after product grid/table sections
  productsGrid: {
    pattern: /\|.+\|.+\|/m,
    position: 'after',
    template: (imagePath) => `\n![Products Grid](${imagePath})\n`,
    priority: 7
  },

  // Capacity visualization
  capacity: {
    pattern: /###\s+(容量|収容能力)/m,
    position: 'after',
    template: (imagePath) => `\n![Capacity](${imagePath})\n`,
    priority: 8
  },

  // Caps/parts visualization
  caps: {
    pattern: /###\s+(キャップ|部品|オプション)/m,
    position: 'after',
    template: (imagePath) => `\n![Caps](${imagePath})\n`,
    priority: 9
  },

  // Pouring demonstration
  pouring: {
    pattern: /###\s+(注ぎ口|使用方法)/m,
    position: 'after',
    template: (imagePath) => `\n![Pouring](${imagePath})\n`,
    priority: 10
  },

  // Efficiency visualization
  efficiency: {
    pattern: /###\s+(効率|コスト|生産効率)/m,
    position: 'after',
    template: (imagePath) => `\n![Efficiency](${imagePath})\n`,
    priority: 11
  },

  // Machine visualization
  machine: {
    pattern: /###\s+(機械|製造|生産ライン)/m,
    position: 'after',
    template: (imagePath) => `\n![Machine](${imagePath})\n`,
    priority: 12
  },

  // Seal demonstration
  seal: {
    pattern: /###\s+(シール|密封)/m,
    position: 'after',
    template: (imagePath) => `\n![Seal](${imagePath})\n`,
    priority: 13
  },

  // Shapes demonstration - expanded to match more patterns
  shapes: {
    pattern: /###\s+(形状|種類|形状の特徴|種類の分類)/m,
    position: 'after',
    template: (imagePath) => `\n![Shapes](${imagePath})\n`,
    priority: 14
  },

  // Layout design
  layout: {
    pattern: /###\s+(レイアウト|配置|基本的なレイアウト構造)/m,
    position: 'after',
    template: (imagePath) => `\n![Layout](${imagePath})\n`,
    priority: 15
  },

  // Colors design
  colors: {
    pattern: /###\s+(カラー|色|配色|色と心理|色選び)/m,
    position: 'after',
    template: (imagePath) => `\n![Colors](${imagePath})\n`,
    priority: 16
  },

  // Fonts design
  fonts: {
    pattern: /###\s+(フォント|文字|書体|フォント選び)/m,
    position: 'after',
    template: (imagePath) => `\n![Fonts](${imagePath})\n`,
    priority: 17
  },

  // Examples design
  examples: {
    pattern: /###\s+(事例|サンプル|お手本|具体例)/m,
    position: 'after',
    template: (imagePath) => `\n![Examples](${imagePath})\n`,
    priority: 18
  },

  // Checklist design
  checklist: {
    pattern: /###\s+(チェックリスト|確認項目|具体的設計チェックリスト)/m,
    position: 'after',
    template: (imagePath) => `\n![Checklist](${imagePath})\n`,
    priority: 19
  },

  // Process design
  process: {
    pattern: /###\s+(プロセス|工程|流れ|導入プロセス)/m,
    position: 'after',
    template: (imagePath) => `\n![Process](${imagePath})\n`,
    priority: 20
  },

  // Cost visualization
  cost: {
    pattern: /###\s+(コスト|費用|価格|コスト最適化)/m,
    position: 'after',
    template: (imagePath) => `\n![Cost](${imagePath})\n`,
    priority: 21
  },

  // Cases visualization
  cases: {
    pattern: /###\s+(事例|ケーススタディ|成功事例紹介)/m,
    position: 'after',
    template: (imagePath) => `\n![Cases](${imagePath})\n`,
    priority: 22
  },

  // AB Test visualization
  abtest: {
    pattern: /###\s+(A\/Bテスト|テスト|A\/Bテストの基本)/m,
    position: 'after',
    template: (imagePath) => `\n![AB Test](${imagePath})\n`,
    priority: 23
  },

  // AB Test Process
  abtestProcess: {
    pattern: /###\s+(テストプロセス|検証の流れ|実施手順)/m,
    position: 'after',
    template: (imagePath) => `\n![AB Test Process](${imagePath})\n`,
    priority: 24
  },

  // Seasonal visualization
  seasonal: {
    pattern: /###\s+(季節|シーズン|期間限定|季節限定商品)/m,
    position: 'after',
    template: (imagePath) => `\n![Seasonal](${imagePath})\n`,
    priority: 25
  },

  // Dark colors demonstration
  darkColors: {
    pattern: /###\s+(濃色|ダークカラー|暗い色|鮮明な色表現)/m,
    position: 'after',
    template: (imagePath) => `\n![Dark Colors](${imagePath})\n`,
    priority: 26
  },

  // Techniques demonstration
  techniques: {
    pattern: /###\s+(技術|技法|手法|白版を活用した印刷技法)/m,
    position: 'after',
    template: (imagePath) => `\n![Techniques](${imagePath})\n`,
    priority: 27
  },

  // Types demonstration
  types: {
    pattern: /###\s+(タイプ|種類|分類|型抜きの種類|基本的な形状)/m,
    position: 'after',
    template: (imagePath, index) => `\n![Type ${index + 1}](${imagePath})\n`,
    priority: 28
  },

  // Benefits demonstration
  benefits: {
    pattern: /###\s+(メリット|利点|优势|メリット1)/m,
    position: 'after',
    template: (imagePath) => `\n![Benefits](${imagePath})\n`,
    priority: 29
  },

  // Strategy demonstration
  strategy: {
    pattern: /###\s+(戦略|ストラテジー|差別化戦略|戦略1)/m,
    position: 'after',
    template: (imagePath) => `\n![Strategy](${imagePath})\n`,
    priority: 30
  },

  // Profile visualization
  profile: {
    pattern: /###\s+(プロフィール|紹介|会社概要)/m,
    position: 'after',
    template: (imagePath) => `\n![Profile](${imagePath})\n`,
    priority: 31
  },

  // Problems visualization
  problems: {
    pattern: /###\s+(課題|問題|悩み|導入前の課題)/m,
    position: 'after',
    template: (imagePath) => `\n![Problems](${imagePath})\n`,
    priority: 32
  },

  // Results visualization
  results: {
    pattern: /###\s+(結果|成果|効果|経営成果)/m,
    position: 'after',
    template: (imagePath) => `\n![Results](${imagePath})\n`,
    priority: 33
  },

  // Growth visualization
  growth: {
    pattern: /###\s+(成長|拡大|スケール)/m,
    position: 'after',
    template: (imagePath) => `\n![Growth](${imagePath})\n`,
    priority: 34
  },

  // Future visualization
  future: {
    pattern: /###\s+(今後|将来|ビジョン|中期計画)/m,
    position: 'after',
    template: (imagePath) => `\n![Future](${imagePath})\n`,
    priority: 35
  }
};

// =====================================================
// Backup Management
// =====================================================

const BACKUP_DIR = path.join(process.cwd(), '.omc', 'backups', 'blog-content');

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function backupContent(slug, content) {
  ensureBackupDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `${slug}-${timestamp}.md`);
  fs.writeFileSync(backupPath, content, 'utf-8');
  return backupPath;
}

function restoreFromBackup(slug) {
  const backupFiles = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith(slug))
    .sort()
    .reverse();

  if (backupFiles.length === 0) {
    throw new Error(`No backup found for ${slug}`);
  }

  const latestBackup = path.join(BACKUP_DIR, backupFiles[0]);
  return fs.readFileSync(latestBackup, 'utf-8');
}

// =====================================================
// Content Processing
// =====================================================

function hasExistingImages(content) {
  // Check if content already has image markdown references
  return /!\[.*?\]\(\/images\/blog\//.test(content);
}

function insertImages(content, images) {
  let modifiedContent = content;
  const insertions = [];

  // Sort rules by priority
  const sortedRules = Object.entries(INSERTION_RULES)
    .sort(([, a], [, b]) => a.priority - b.priority);

  // Track used positions to avoid overlapping insertions
  const usedPositions = new Set();

  for (const [imageType, rule] of sortedRules) {
    const imagePaths = Array.isArray(images[imageType])
      ? images[imageType]
      : [images[imageType]];

    if (!imagePaths || !imagePaths[0]) continue;

    // Ensure regex has global flag for matchAll
    const pattern = rule.pattern.global ? rule.pattern : new RegExp(rule.pattern.source, rule.pattern.flags + 'g');
    const matches = [...content.matchAll(pattern)];

    if (matches.length === 0) continue;

    // Insert images after matching patterns
    for (let i = 0; i < Math.min(matches.length, imagePaths.length); i++) {
      const match = matches[i];
      const imagePath = imagePaths[i];
      const insertPos = match.index + match[0].length;

      // Check if this position is already used
      if (usedPositions.has(insertPos)) continue;

      // Generate markdown based on template
      const markdown = typeof rule.template === 'function'
        ? rule.template(imagePath, i)
        : rule.template(imagePath);

      insertions.push({
        position: insertPos,
        markdown,
        type: imageType,
        imagePath
      });

      usedPositions.add(insertPos);
    }
  }

  // Sort insertions by position (reverse order for safe insertion)
  insertions.sort((a, b) => b.position - a.position);

  // Apply insertions
  for (const insertion of insertions) {
    const before = modifiedContent.slice(0, insertion.position);
    const after = modifiedContent.slice(insertion.position);
    modifiedContent = before + insertion.markdown + after;
  }

  return {
    content: modifiedContent,
    insertions: insertions.map(i => ({
      type: i.type,
      imagePath: i.imagePath,
      position: i.position
    }))
  };
}

// =====================================================
// Supabase Operations
// =====================================================

async function updateArticleWithImages(slug, updatedContent) {
  const dbSlug = getDbSlug(slug);
  const { data, error } = await supabase
    .from('blog_posts')
    .update({
      content: updatedContent,
      updated_at: new Date().toISOString()
    })
    .eq('slug', dbSlug)
    .select();

  return { data, error };
}

async function getArticleBySlug(slug) {
  const dbSlug = getDbSlug(slug);
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', dbSlug)
    .single();

  return { data, error };
}

// =====================================================
// Main Processing
// =====================================================

async function processArticle(slug, options = {}) {
  const { dryRun = false, skipExisting = true } = options;

  console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Processing article: ${slug}`);
  console.log('━'.repeat(50));

  // Get article from Supabase
  const { data: article, error: fetchError } = await getArticleBySlug(slug);

  if (fetchError || !article) {
    console.error(`❌ Error fetching article: ${fetchError?.message || 'Not found'}`);
    return { success: false, error: fetchError };
  }

  const originalContent = article.content || '';

  // Check if images already exist
  if (skipExisting && hasExistingImages(originalContent)) {
    console.log(`⏭️  Skipping - article already has image references`);
    return { success: true, skipped: true, reason: 'Images already exist' };
  }

  // Get images for this article
  const images = ARTICLE_IMAGES[slug];
  if (!images) {
    console.log(`⚠️  No image mapping found for ${slug}`);
    return { success: false, error: 'No image mapping' };
  }

  console.log(`📸 Found ${Object.keys(images).length} image types for ${slug}`);

  // Insert images
  const { content: updatedContent, insertions } = insertImages(originalContent, images);

  if (insertions.length === 0) {
    console.log(`⏭️  No insertion points found`);
    return { success: true, skipped: true, reason: 'No insertion points' };
  }

  console.log(`✍️  Inserting ${insertions.length} images:`);
  insertions.forEach(insertion => {
    console.log(`   - ${insertion.type}: ${insertion.imagePath}`);
  });

  if (dryRun) {
    console.log(`\n📄 Preview of first 500 characters:`);
    console.log(updatedContent.slice(0, 500) + '...');
    return { success: true, dryRun: true, insertions };
  }

  // Backup original content
  const backupPath = backupContent(slug, originalContent);
  console.log(`💾 Backed up to: ${backupPath}`);

  // Update Supabase
  const { data: updateResult, error: updateError } = await updateArticleWithImages(slug, updatedContent);

  if (updateError) {
    console.error(`❌ Error updating Supabase: ${updateError.message}`);

    // Rollback: restore from backup
    try {
      const restored = restoreFromBackup(slug);
      await updateArticleWithImages(slug, restored);
      console.log(`✅ Rolled back to original content`);
    } catch (rollbackError) {
      console.error(`❌ Rollback failed: ${rollbackError.message}`);
    }

    return { success: false, error: updateError };
  }

  console.log(`✅ Updated article in Supabase`);
  return { success: true, insertions, backupPath };
}

async function processAllArticles(options = {}) {
  const slugs = Object.keys(ARTICLE_IMAGES);
  const results = {
    total: slugs.length,
    processed: 0,
    skipped: 0,
    failed: 0,
    details: []
  };

  console.log(`\n🚀 Starting batch processing of ${slugs.length} articles...`);

  for (const slug of slugs) {
    const result = await processArticle(slug, options);

    results.details.push({ slug, result });

    if (result.success) {
      if (result.skipped) {
        results.skipped++;
      } else {
        results.processed++;
      }
    } else {
      results.failed++;
    }
  }

  console.log('\n' + '━'.repeat(50));
  console.log('📊 Batch Processing Summary:');
  console.log(`   Total: ${results.total}`);
  console.log(`   ✅ Processed: ${results.processed}`);
  console.log(`   ⏭️  Skipped: ${results.skipped}`);
  console.log(`   ❌ Failed: ${results.failed}`);

  return results;
}

// =====================================================
// CLI Entry Point
// =====================================================

async function main() {
  const args = process.argv.slice(2);

  // Parse options
  const dryRun = args.includes('--dry-run');
  const skipExisting = !args.includes('--force');

  let targetSlug = null;
  let processAll = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--article' && args[i + 1]) {
      targetSlug = args[i + 1];
    } else if (args[i] === '--all') {
      processAll = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Blog Image Integration Script

Usage:
  node scripts/integrate-blog-images.js [options]

Options:
  --article <slug>     Process specific article (e.g., 06-flat-pouch)
  --all               Process all articles with image mappings
  --dry-run           Preview changes without updating
  --force             Process even if images already exist
  --help, -h          Show this help message

Examples:
  # Preview changes for one article
  node scripts/integrate-blog-images.js --article 06-flat-pouch --dry-run

  # Process specific article
  node scripts/integrate-blog-images.js --article 06-flat-pouch

  # Process all articles (dry-run first)
  node scripts/integrate-blog-images.js --all --dry-run

  # Process all articles
  node scripts/integrate-blog-images.js --all
      `);
      process.exit(0);
    }
  }

  if (!targetSlug && !processAll) {
    console.error('❌ Please specify --article <slug> or --all');
    console.error('   Use --help for usage information');
    process.exit(1);
  }

  const options = { dryRun, skipExisting };

  try {
    if (processAll) {
      await processAllArticles(options);
    } else {
      await processArticle(targetSlug, options);
    }
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
main();

export { processArticle, processAllArticles, INSERTION_RULES, ARTICLE_IMAGES };
