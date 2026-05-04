const TodoApp = require('../src/todo');
let passed = 0, failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; console.log(`  ✓ ${msg}`); }
  else { failed++; console.error(`  ✗ ${msg}`); }
}

console.log('TodoApp Tests\n');

// Add
const app = new TodoApp();
const t1 = app.add('Buy milk');
assert(t1.id === 1, 'add returns todo with id');
assert(t1.title === 'Buy milk', 'add sets title');
assert(t1.completed === false, 'add defaults to not completed');

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

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
