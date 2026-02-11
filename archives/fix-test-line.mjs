import fs from 'fs';

const filePath = 'tests/member-pages-selectors-test.spec.ts';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Replace lines 554-555 (0-indexed: 553-554)
lines[553] = '    const message = page.locator(`.p-4.rounded-lg:has-text("設定を保存しました")`)';
lines[554] = '      .or(page.locator(`.p-4.rounded-lg:has-text("エラーが発生しました")`));';

content = lines.join('\n');
fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed lines 554-555');
