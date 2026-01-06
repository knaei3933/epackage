const fs = require('fs');
const data = JSON.parse(fs.readFileSync('.taskmaster/tasks/tasks.json', 'utf8'));
const tasks = data.master?.tasks || [];

console.log('=== All Tasks ===');
tasks.forEach(t => {
  console.log(`${t.id}: ${t.title} - ${t.status}`);
});
