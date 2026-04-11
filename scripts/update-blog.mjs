import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const content = fs.readFileSync('docs/blog/articles/02-variable-printing.md', 'utf8');

const payload = {
  excerpt: '小ロットでパッケージを作りたいけれど、初期費用が高くて諦めていませんか？従来のグラビア印刷では版を作成する必要があるため、数千枚単位の発注が当たり前でした。しかし、デジタル印刷の登場により、事情は一変しました。版を作らずに短納期で高品質な印刷が可能になっています。',
  content: content
};

const response = await fetch('https://ijlgpzjdfipzmjvawofp.supabase.co/rest/v1/blog_posts?slug=eq.variable-printing', {
  method: 'PATCH',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbGdwempkZmlwem1qdmF3b2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NTgyNzcsImV4cCI6MjA4MjEzNDI3N30.twKmF-IfvvZ-abUmReRk4n7zerZHo01HCOtH1S9ImeA',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbGdwempkZmlwem1qdmF3b2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NTgyNzcsImV4cCI6MjA4MjEzNDI3N30.twKmF-IfvvZ-abUmReRk4n7zerZHo01HCOtH1S9ImeA',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify(payload)
});

const result = await response.json();
console.log('Response:', JSON.stringify(result, null, 2));
console.log('Status:', response.status);
