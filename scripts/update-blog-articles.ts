/**
 * Blog Articles Update Script
 * ブログ記事のコンテンツを更新するスクリプト
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ijlgpzjdfipzmjvawofp.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is required');
  console.error('Please set the environment variable:');
  console.error('export SUPABASE_SERVICE_ROLE_KEY=your_key_here');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateBlogArticles() {
  console.log('=== Blog Articles Update ===\n');

  // Read SQL file
  const sqlFilePath = path.join(process.cwd(), 'supabase/migrations/20260227020000_update_blog_articles.sql');
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

  // Split SQL into individual statements
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    // Skip comments and empty statements
    if (statement.startsWith('--') || statement.length < 10) {
      continue;
    }

    // Only execute UPDATE statements for blog_posts
    if (statement.toUpperCase().includes('UPDATE blog_posts')) {
      console.log(`Executing statement ${i + 1}/${statements.length}...`);

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

        if (error) {
          console.error(`Error: ${error.message}`);
          // Continue with next statement
        } else {
          console.log('✓ Success');
        }
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
      }
    }
  }

  console.log('\n=== Verification ===\n');

  // Verify updates
  const { data: articles, error } = await supabase
    .from('blog_posts')
    .select('slug, title, content')
    .in('slug', [
      'spout-pouch', 'roll-film', 'chojiu-bag', 'package-design-tips',
      'small-lot-printing', 'white-plate-guide', 'die-cut-package', 'customer-interview'
    ]);

  if (error) {
    console.error('Error verifying updates:', error.message);
  } else {
    console.log('Updated articles:');
    articles?.forEach(article => {
      const status = article.content && article.content.length > 500 ? '✓' : '✗';
      console.log(`  ${status} ${article.slug}: ${article.title} (${article.content?.length || 0} chars)`);
    });
  }

  console.log('\n=== Update Complete ===');
}

updateBlogArticles().catch(console.error);
