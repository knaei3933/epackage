const fs = require('fs');
const data = JSON.parse(fs.readFileSync('.taskmaster/tasks/tasks.json', 'utf8'));
const tasks = data.master?.tasks || [];

// Find pending main tasks with no dependencies
const available = tasks.filter(t => t.status === 'pending' && (!t.dependencies || t.dependencies.length === 0));

console.log('Available tasks (pending, no dependencies):\n');
for (const task of available) {
  console.log(`Task ${task.id}: ${task.title}`);
  if (task.subtasks && task.subtasks.length > 0) {
    const firstSubtask = task.subtasks[0];
    console.log(`  - First subtask: ${firstSubtask.id}: ${firstSubtask.title}`);
  }
  console.log('');
}
