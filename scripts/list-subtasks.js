const fs = require('fs');
const data = JSON.parse(fs.readFileSync('.taskmaster/tasks/tasks.json', 'utf8'));
const tasks = data.master?.tasks || [];

console.log('=== Tasks with Subtasks ===');
tasks.forEach(task => {
  if (task.subtasks && task.subtasks.length > 0) {
    console.log(`\nTask ${task.id}: ${task.title}`);
    task.subtasks.forEach(sub => {
      console.log(`  ${sub.id}: ${sub.title} - ${sub.status}`);
    });
  }
});
