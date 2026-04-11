/**
 * Register Blog Post #03: Small Lot OEM Package Guide
 *
 * Usage: node scripts/register-03-small-lot-guide.mjs
 */

import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Read markdown file
const content = fs.readFileSync('./docs/blog/articles/03-small-lot-guide.md', 'utf8');

// Post data
const postData = {
  title: '【初心者向け】小ロットOEMパッケージの始め方｜見積もりから発注までの完全ガイド',
  slug: 'small-lot-oem-package-guide',
  content,
  excerpt: 'オリジナルパッケージを作りたいけれど、どこから始めればいいかわからない...Package-Labで初めて小ロットOEMパッケージを発注する方向けに、見積もりから納品までの完全フローをSTEP形式で解説します。',
  category: 'practical-tips',
  tags: ['初心者向け', 'OEM', '小ロット', 'パッケージ発注'],
  meta_title: '小ロットOEMパッケージとは？500枚から発注する完全ガイド【診断チャートあり】',
  meta_description: '小ロットOEMパッケージの発注方法を完全解説。500枚から製造可能、スマート見積りで1分で価格確認。デザイン作成から納品までのSTEPフローを網羅。',
  status: 'published',
  published_at: new Date().toISOString(),
  reading_time_minutes: 8,
  view_count: 0,
};

async function registerPost() {
  try {
    console.log('📝 Registering blog post...');
    console.log(`   Title: ${postData.title}`);
    console.log(`   Slug: ${postData.slug}`);
    console.log('');

    // Check if slug exists
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('id, status')
      .eq('slug', postData.slug)
      .single();

    if (existing) {
      console.log(`⚠️  Post already exists: ${postData.slug}`);
      console.log('Updating...');
      
      const { data, error } = await supabase
        .from('blog_posts')
        .update({ ...postData, updated_at: new Date().toISOString() })
        .eq('slug', postData.slug)
        .select();

      if (error) throw error;
      console.log('✅ Post updated!');
      console.log(`   ID: ${data[0].id}`);
      return;
    }

    // Insert new post
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(postData)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Post registered!');
    console.log(`   ID: ${data.id}`);
    console.log(`   URL: /blog/${postData.slug}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

registerPost();
