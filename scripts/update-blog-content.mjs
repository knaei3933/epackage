import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// PostgreSQL用にエスケープ
function escapePostgresString(str) {
  return str.replace(/'/g, "''");
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

const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbGdwempkZmlwem1qdmF3b2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NTgyNzcsImV4cCI6MjA4MjEzNDI3N30.twKmF-IfvvZ-abUmReRk4n7zerZHo01HCOtH1S9ImeA';
const baseUrl = 'https://ijlgpzjdfipzmjvawofp.supabase.co';
const projectId = 'ijlgpzjdfipzmjvawofp';

async function updateContent(article) {
  try {
    const content = fs.readFileSync(article.file, 'utf8');

    const response = await fetch(`${baseUrl}/rest/v1/blog_posts?id=eq.${article.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        content: content,
        updated_at: new Date().toISOString()
      })
    });

    if (response.ok) {
      console.log(`✅ ${article.id}: Content updated successfully (${response.status})`);
    } else {
      const errorText = await response.text();
      console.log(`❌ ${article.id}: Failed - ${response.status}`);
      console.log(errorText);
    }
  } catch (error) {
    console.log(`❌ ${article.id}: Error - ${error.message}`);
  }
}

// 各記事のコンテンツを更新
for (const article of articles) {
  await updateContent(article);
}

console.log('\n🎉 All article contents updated!');
