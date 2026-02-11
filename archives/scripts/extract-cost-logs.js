const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:/Users/kanei/.claude/projects/C--Users-kanei-claudecode-02-Homepage-Dev-02-epac-homepagever1-1/be11252e-3d8a-4338-b90c-07f73dea9eb6/tool-results/mcp-playwright-browser_console_messages-1769606382794.txt', 'utf8'));

// より具体的な検索パターン
const patterns = [
  'calculateSKUCost',
  'Total Film Cost',
  'laminationCost',
  'materialCost',
  'printingCost',
  'totalCostKRW',
  '[QuoteContext]',
  '[QuoteProvider]'
];

patterns.forEach(pattern => {
  console.log(`\n=== Searching for: ${pattern} ===`);
  let found = false;
  data.forEach((entry, i) => {
    const text = entry.text || '';
    if (text.includes(pattern)) {
      console.log(text);
      found = true;
    }
  });
  if (!found) {
    console.log('(No matches found)');
  }
});
