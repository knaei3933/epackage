import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const articles = [
  {
    file: 'docs/blog/articles/02-variable-printing.md',
    id: 'a1b2c3d4-0001-4000-8000-000000000002'
  }
];

const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbGdwempkZmlwem1qdmF3b2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NTgyNzcsImV4cCI6MjA4MjEzNDI3N30.twKmF-IfvvZ-abUmReRk4n7zerZHo01HCOtH1S9ImeA';
const baseUrl = 'https://ijlgpzjdfipzmjvawofp.supabase.co';

async function updateContentChunked(article) {
  try {
    const content = fs.readFileSync(article.file, 'utf8');
    console.log(`📄 ファイルサイズ: ${content.length}文字`);

    // Base64エンコードして転送
    const base64Content = Buffer.from(content, 'utf8').toString('base64');
    console.log(`📦 Base64サイズ: ${base64Content.length}文字`);

    // Supabase RPC関数を呼び出してBase64からデコードして保存
    const response = await fetch(`${baseUrl}/rest/v1/rpc/update_blog_content_base64`, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_post_id: article.id,
        p_content_base64: base64Content
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ ${article.id}: Content updated successfully`);
      console.log(`   Result:`, result);
    } else {
      const errorText = await response.text();
      console.log(`❌ ${article.id}: Failed - ${response.status}`);
      console.log(errorText);

      // RPC関数がない場合は、直接PATCHを試行（チャンク分割）
      console.log(`🔄 通常のPATCHメソッドを試行します...`);
      await updateWithStandardPatch(article, content);
    }
  } catch (error) {
    console.log(`❌ ${article.id}: Error - ${error.message}`);
  }
}

async function updateWithStandardPatch(article, content) {
  try {
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
      const result = await response.json();
      console.log(`✅ ${article.id}: Updated via PATCH (${response.status})`);
      if (result && result.length > 0) {
        console.log(`   Content length: ${result[0].content?.length || 0} chars`);
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ ${article.id}: PATCH Failed - ${response.status}`);
      console.log(errorText);
    }
  } catch (error) {
    console.log(`❌ ${article.id}: PATCH Error - ${error.message}`);
  }
}

// 実行
for (const article of articles) {
  await updateContentChunked(article);
}

console.log('\n🎉 Update complete!');
