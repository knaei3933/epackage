import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const content = fs.readFileSync('docs/blog/articles/02-variable-printing.md', 'utf8');

const response = await fetch('https://ijlgpzjdfipzmjvawofp.supabase.co/rest/v1/blog_posts?slug=eq.variable-printing', {
  method: 'PATCH',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbGdwempkZmlwem1qdmF3b2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NTgyNzcsImV4cCI6MjA4MjEzNDI3N30.twKmF-IfvvZ-abUmReRk4n7zerZHo01HCOtH1S9ImeA',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbGdwempkZmlwem1qdmF3b2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NTgyNzcsImV4cCI6MjA4MjEzNDI3N30.twKmF-IfvvZ-abUmReRk4n7zerZHo01HCOtH1S9ImeA',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify({
    content: content,
    excerpt: '小ロットでパッケージを作りたいけれど、初期費用が高くて諦めていませんか？従来のグラビア印刷では版を作成する必要があるため、数千枚単位の発注が当たり前でした。しかし、デジタル印刷の登場により、事情は一変しました。版を作らずに短納期で高品質な印刷が可能になっています。',
    meta_description: 'デジタル印刷とグラビア印刷の違いを解説。20,000枚未満ならデジタル印刷推奨、30,000枚以上でグラビア印刷がコスト優位。版代0円、短納期、小ロット対応のPackage-Lab。'
  })
});

const result = await response.json();
console.log('Status:', response.status);
console.log('Updated:', result.length > 0 ? 'YES' : 'NO');
if (result.length > 0) {
  console.log('Content length:', result[0].content ? result[0].content.length : 'N/A');
}
