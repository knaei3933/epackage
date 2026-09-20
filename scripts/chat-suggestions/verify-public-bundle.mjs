import fs from 'node:fs';
import path from 'node:path';

const staticDirectory = path.join(process.cwd(), '.next', 'static');

const protectedSnippets = [
  'マイページでは何を確認できますか？',
  '注文後の流れはどう確認すればよいですか？',
  '担当者確認が必要な業務フローはどう整理すればよいですか？',
  '見積条件の確認ポイントを教えてください。',
  '入稿データの確認ポイントを教えてください。',
  '制作データを確認するときの基本条件を教えてください。',
];

const readFiles = (directory) => {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return readFiles(entryPath);
    return entry.isFile() && /\.(?:js|mjs|css|txt|html)$/.test(entry.name)
      ? [entryPath]
      : [];
  });
};

if (!fs.existsSync(staticDirectory)) {
  console.error(`Missing build output: ${staticDirectory}. Run pnpm run build first.`);
  process.exit(1);
}

const files = readFiles(staticDirectory);
const violations = [];
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  for (const snippet of protectedSnippets) {
    if (content.includes(snippet)) violations.push({ file, snippet });
  }
}

if (violations.length > 0) {
  console.error('Protected chat suggestion text leaked into public static bundles:');
  for (const violation of violations) {
    console.error(`- ${violation.file}: ${violation.snippet}`);
  }
  process.exit(1);
}

console.log(`Verified ${files.length} public static files; no protected suggestion text found.`);
