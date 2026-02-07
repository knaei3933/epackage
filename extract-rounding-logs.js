const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:/Users/kanei/.claude/projects/C--Users-kanei-claudecode-02-Homepage-Dev-02-epac-homepagever1-1/be11252e-3d8a-4338-b90c-07f73dea9eb6/tool-results/mcp-playwright-browser_console_messages-1769608305605.txt', 'utf8'));

// 丸め処理に関連するログのみを抽出
const patterns = [
  'Rounding',
  'calculateCostBreakdown',
  'sumOfRounded',
  'consistentTotalCost',
  'totalCost',
  'totalPrice',
  'costJPY',
  'unitPrice'
];

patterns.forEach(pattern => {
  console.log(`\n=== Searching for: ${pattern} ===`);
  let count = 0;
  data.forEach((entry, i) => {
    const text = entry.text || '';
    if (text.includes(pattern)) {
      console.log(text);
      count++;
    }
  });
  console.log(`Found ${count} matches`);
});
