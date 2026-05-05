const TodoApp = require('../src/todo');
const fs = require('fs');
const os = require('os');
const path = require('path');

let passed = 0, failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; console.log(`  ✓ ${msg}`); }
  else { failed++; console.error(`  ✗ ${msg}`); }
}

console.log('TodoApp Tests\n');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-test-'));
const storagePath = path.join(tempDir, 'todos.json');

// Add
const app = new TodoApp(storagePath);
const t1 = app.add('Buy milk');
assert(t1.id === 1, 'add returns todo with id');
assert(t1.title === 'Buy milk', 'add sets title');
assert(t1.dueDate === null, 'add defaults due date to null');
assert(t1.priority === 'medium', 'add defaults priority to medium');
assert(t1.completed === false, 'add defaults to not completed');
assert(fs.existsSync(storagePath), 'add writes todos to storage file');

const due = app.add('Pay rent', '2026-05-15');
assert(due.dueDate === '2026-05-15', 'add stores due date');

// List
app.add('Walk dog');
assert(app.list().length === 3, 'list returns all todos');

// Complete
const done = app.complete(1);
assert(done.completed === true, 'complete marks todo done');

// Remove
app.remove(3);
assert(app.list().length === 2, 'remove deletes todo');

// Error handling
try { app.complete(999); assert(false, 'complete throws on missing id'); }
catch (e) { assert(true, 'complete throws on missing id'); }

try { app.remove(999); assert(false, 'remove throws on missing id'); }
catch (e) { assert(true, 'remove throws on missing id'); }

try { app.add('Bad date', '2026-02-30'); assert(false, 'add rejects invalid due date'); }
catch (e) { assert(true, 'add rejects invalid due date'); }

// Persistence
const restored = new TodoApp(storagePath);
assert(restored.list().length === 2, 'constructor restores saved todos');
assert(restored.list()[0].completed === true, 'constructor restores completed status');
assert(restored.list()[1].dueDate === '2026-05-15', 'constructor restores due date');
assert(restored.add('Read book').id === 4, 'constructor restores next id');

// Priority
const priorityStoragePath = path.join(tempDir, 'priority-todos.json');
const priorityApp = new TodoApp(priorityStoragePath);
const low = priorityApp.add('Low priority', null, 'low');
const high = priorityApp.add('High priority', null, 'high');
const medium = priorityApp.add('Medium priority');
assert(low.priority === 'low', 'add stores low priority');
assert(high.priority === 'high', 'add stores high priority');
assert(medium.priority === 'medium', 'add stores default medium priority');
assert(priorityApp.list().map(todo => todo.priority).join(',') === 'high,medium,low', 'list sorts todos by priority');

try { priorityApp.add('Bad priority', null, 'urgent'); assert(false, 'add rejects invalid priority'); }
catch (e) { assert(true, 'add rejects invalid priority'); }

const restoredPriorityApp = new TodoApp(priorityStoragePath);
assert(restoredPriorityApp.list().find(todo => todo.title === 'Low priority').priority === 'low', 'constructor restores priority');

fs.rmSync(tempDir, { recursive: true, force: true });

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
