const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:/Users/kanei/.claude/projects/C--Users-kanei-claudecode-02-Homepage-Dev-02-epac-homepagever1-1/be11252e-3d8a-4338-b90c-07f73dea9eb6/tool-results/mcp-playwright-browser_console_messages-1769606382794.txt', 'utf8'));

// 検索パターンを広げる
const keywords = ['Film Cost', 'calculateSKUCost', 'lamination', 'material', 'width', 'SKU'];
let count = 0;
data.forEach((entry, i) => {
  const text = entry.text || '';
  for (const keyword of keywords) {
    if (text.toLowerCase().includes(keyword.toLowerCase()) && count < 50) {
      console.log(`[${i}] ${text}`);
      count++;
      break;
    }
  }
});

console.log(`\nTotal matching entries: ${count}`);
