import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .envファイルをロード
config({ path: '.env' });

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env');
  process.exit(1);
}

const articles = [
  {
    file: 'docs/blog/articles/01-gazette-pouch.md',
    id: 'a1b2c3d4-0001-4000-8000-000000000001'
  },
  {
    file: 'docs/blog/articles/02-variable-printing.md',
    id: 'a1b2c3d4-0001-4000-8000-000000000002'
  },
  {
    file: 'docs/blog/articles/03-small-lot-guide.md',
    id: 'a0c4a553-16f4-4fcc-8a1d-336a314f59ec'
  },
  {
    file: 'docs/blog/articles/04-stand-pouch.md',
    id: 'a1b2c3d4-0001-4000-8000-000000000004'
  }
];

async function updateContent(article) {
  try {
    const content = fs.readFileSync(article.file, 'utf8');
    console.log(`📄 ${article.file}: ${content.length}文字`);

    const response = await fetch(`${baseUrl}/rest/v1/blog_posts?id=eq.${article.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        content: content,
        updated_at: new Date().toISOString()
      })
    });

    if (response.ok) {
      console.log(`✅ ${article.id}: Updated successfully (${response.status})`);
      return true;
    } else {
      const errorText = await response.text();
      console.log(`❌ ${article.id}: Failed - ${response.status}`);
      console.log(errorText);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${article.id}: Error - ${error.message}`);
    return false;
  }
}

// 全記事を更新
console.log('🔄 Starting content update with service_role key...\n');

let successCount = 0;
for (const article of articles) {
  const success = await updateContent(article);
  if (success) successCount++;
}

console.log(`\n🎉 Complete! ${successCount}/${articles.length} articles updated`);
