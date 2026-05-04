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
assert(t1.completed === false, 'add defaults to not completed');
assert(fs.existsSync(storagePath), 'add writes todos to storage file');

// List
app.add('Walk dog');
assert(app.list().length === 2, 'list returns all todos');

// Complete
const done = app.complete(1);
assert(done.completed === true, 'complete marks todo done');

// Remove
app.remove(2);
assert(app.list().length === 1, 'remove deletes todo');

// Error handling
try { app.complete(999); assert(false, 'complete throws on missing id'); }
catch (e) { assert(true, 'complete throws on missing id'); }

try { app.remove(999); assert(false, 'remove throws on missing id'); }
catch (e) { assert(true, 'remove throws on missing id'); }

// Persistence
const restored = new TodoApp(storagePath);
assert(restored.list().length === 1, 'constructor restores saved todos');
assert(restored.list()[0].completed === true, 'constructor restores completed status');
assert(restored.add('Read book').id === 3, 'constructor restores next id');

fs.rmSync(tempDir, { recursive: true, force: true });

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
