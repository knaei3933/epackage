import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 記事ごとの設定（実IDを使用）
const articles = [
  {
    file: 'docs/blog/articles/01-gazette-pouch.md',
    id: 'a1b2c3d4-0001-4000-8000-000000000001',
    meta_title: 'ガゼットパウチとは？大容量商品の陳列効果と収納性を両立するパッケージ',
    meta_description: 'ガゼットパウチ（マチ付きパウチ）の特徴・メリット・選び方を解説。スナック・穀物など大容量商品の陳列効果を高め、棚の省スペースも実現。500枚から小ロット発注可能なPackage-Labのパッケージソリューション。'
  },
  {
    file: 'docs/blog/articles/02-variable-printing.md',
    id: 'a1b2c3d4-0001-4000-8000-000000000002',
    meta_title: 'デジタル印刷とは？グラビア印刷との違いと最適な活用シーン',
    meta_description: 'デジタル印刷とグラビア印刷の違いを解説。20,000枚未満ならデジタル印刷推奨、30,000枚以上でグラビア印刷がコスト優位。版代0円、短納期、小ロット対応のPackage-Lab。500枚から製造可能で、最短21日、平均28日で納品。'
  },
  {
    file: 'docs/blog/articles/03-small-lot-guide.md',
    id: 'a0c4a553-16f4-4fcc-8a1d-336a314f59ec',
    meta_title: '小ロットOEMパッケージの始め方｜500枚から見積もりから発注までの完全ガイド',
    meta_description: '小ロットOEMパッケージの始め方を初心者向けに解説。500枚から発注可能で、見積もりから発注までの完全フローをSTEP形式でご紹介。スマート見積りの使い方、デザインデータの準備、納期まで網羅。Package-Labで自社ブランドパッケージを低リスクで始めましょう。'
  },
  {
    file: 'docs/blog/articles/04-stand-pouch.md',
    id: 'a1b2c3d4-0001-4000-8000-000000000004',
    meta_title: 'スタンドパウチとは？陳列効果を高める「自立する」袋の特徴と選び方',
    meta_description: 'スタンドパウチ（自立袋）の特徴・メリット・選び方を解説。底部がW字型に折りたたまれ、内容物を入れると自立して陳列効果を最大化。500枚から小ロット発注可能で、最短21日、平均28日で納品。素材やデザインのポイントも網羅。'
  }
];
// ※ small-lot-oem-package-guideのIDは実際のDB値を使用

const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbGdwempkZmlwem1qdmF3b2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NTgyNzcsImV4cCI6MjA4MjEzNDI3N30.twKmF-IfvvZ-abUmReRk4n7zerZHo01HCOtH1S9ImeA';
const baseUrl = 'https://ijlgpzjdfipzmjvawofp.supabase.co';

// 各記事を更新
for (const article of articles) {
  try {
    const content = fs.readFileSync(article.file, 'utf8');

    const payload = {
      meta_title: article.meta_title,
      meta_description: article.meta_description,
      content: content
    };

    const response = await fetch(`${baseUrl}/rest/v1/blog_posts?id=eq.${article.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok && result.length > 0) {
      console.log(`✅ ${article.id}: Updated successfully`);
      console.log(`   meta_title: ${article.meta_title.substring(0, 30)}...`);
    } else {
      console.log(`❌ ${article.id}: Failed - ${response.status}`);
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.log(`❌ ${article.id}: Error - ${error.message}`);
  }
}

console.log('\n🎉 All articles updated!');
