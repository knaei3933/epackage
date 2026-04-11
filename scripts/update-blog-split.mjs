import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbGdwempkZmlwem1qdmF3b2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NTgyNzcsImV4cCI6MjA4MjEzNDI3N30.twKmF-IfvvZ-abUmReRk4n7zerZHo01HCOtH1S9ImeA';
const baseUrl = 'https://ijlgpzjdfipzmjvawofp.supabase.co';

// 記事を読み込んで前半・後半に分割
const content = fs.readFileSync('docs/blog/articles/02-variable-printing.md', 'utf8');
const midPoint = Math.floor(content.length / 2);
const firstHalf = content.substring(0, midPoint);
const secondHalf = content.substring(midPoint);

console.log(`📄 総文字数: ${content.length}`);
console.log(`📊 前半: ${firstHalf.length}, 後半: ${secondHalf.length}`);

async function updateInChunks() {
  const articleId = 'a1b2c3d4-0001-4000-8000-000000000002';

  try {
    // ステップ1: 前半を更新（元のcontentを上書き）
    console.log('\n🔄 ステップ1: 前半を更新...');
    const response1 = await fetch(`${baseUrl}/rest/v1/blog_posts?id=eq.${articleId}`, {
      method: 'PATCH',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        content: firstHalf,
        updated_at: new Date().toISOString()
      })
    });

    if (response1.ok) {
      console.log(`✅ 前半更新成功 (${response1.status})`);
    } else {
      const err = await response1.text();
      console.log(`❌ 前半更新失敗: ${err}`);
      return;
    }

    // ステップ2: 後半を追加
    console.log('\n🔄 ステップ2: 後半を追加...');
    const response2 = await fetch(`${baseUrl}/rest/v1/blog_posts?id=eq.${articleId}`, {
      method: 'PATCH',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        content: firstHalf + secondHalf,
        updated_at: new Date().toISOString()
      })
    });

    if (response2.ok) {
      const result = await response2.json();
      const finalLength = result[0]?.content?.length || 0;
      console.log(`✅ 完全版更新成功! (${response2.status})`);
      console.log(`📊 最終サイズ: ${finalLength}文字`);

      // FAQセクションの存在確認
      const hasFaq = result[0]?.content?.includes('よくある質問') ? 1 : 0;
      const hasRelated = result[0]?.content?.includes('関連記事') ? 1 : 0;
      console.log(`✅ FAQセクション: ${hasFaq ? 'あり' : 'なし'}`);
      console.log(`✅ 関連記事: ${hasRelated ? 'あり' : 'なし'}`);
    } else {
      const err = await response2.text();
      console.log(`❌ 後半追加失敗: ${err}`);
    }

  } catch (error) {
    console.log(`❌ エラー: ${error.message}`);
  }
}

updateInChunks();
