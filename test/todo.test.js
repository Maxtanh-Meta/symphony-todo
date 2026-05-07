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
assert(Array.isArray(t1.tags) && t1.tags.length === 0, 'add defaults tags to empty array');
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

// Update title
const renamed = app.updateTitle(2, '  Pay mortgage  ');
assert(renamed.title === 'Pay mortgage', 'updateTitle stores trimmed title');
assert(app.list().find(todo => todo.id === 2).title === 'Pay mortgage', 'updateTitle updates existing todo');

// Remove
app.remove(3);
assert(app.list().length === 2, 'remove deletes todo');

// Error handling
try { app.complete(999); assert(false, 'complete throws on missing id'); }
catch (e) { assert(true, 'complete throws on missing id'); }

try { app.remove(999); assert(false, 'remove throws on missing id'); }
catch (e) { assert(true, 'remove throws on missing id'); }

try { app.updateTitle(999, 'Missing'); assert(false, 'updateTitle throws on missing id'); }
catch (e) { assert(e.message === 'Todo 999 not found', 'updateTitle throws on missing id'); }

try { app.updateTitle(1, '   '); assert(false, 'updateTitle rejects empty title'); }
catch (e) { assert(e.message === 'title is required', 'updateTitle rejects empty title'); }

const titleLimitStoragePath = path.join(tempDir, 'title-limit-todos.json');
const titleLimitApp = new TodoApp(titleLimitStoragePath);
const maxTitle = 'a'.repeat(140);
const tooLongTitle = 'a'.repeat(141);
assert(titleLimitApp.add(maxTitle).title === maxTitle, 'add accepts 140 character title');

try { titleLimitApp.add(tooLongTitle); assert(false, 'add rejects title over 140 characters'); }
catch (e) { assert(e.message === 'title must be 140 characters or fewer', 'add rejects title over 140 characters'); }

try { titleLimitApp.updateTitle(1, tooLongTitle); assert(false, 'updateTitle rejects title over 140 characters'); }
catch (e) { assert(e.message === 'title must be 140 characters or fewer', 'updateTitle rejects title over 140 characters'); }

try { app.add('Bad date', '2026-02-30'); assert(false, 'add rejects invalid due date'); }
catch (e) { assert(true, 'add rejects invalid due date'); }

// Persistence
const restored = new TodoApp(storagePath);
assert(restored.list().length === 2, 'constructor restores saved todos');
assert(restored.list()[0].completed === true, 'constructor restores completed status');
assert(restored.list()[1].title === 'Pay mortgage', 'constructor restores updated title');
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

// Tags
const tagStoragePath = path.join(tempDir, 'tag-todos.json');
const tagApp = new TodoApp(tagStoragePath);
const tagged = tagApp.add('Buy groceries', null, 'medium', ' home, Errands, ,urgent ');
const arrayTagged = tagApp.add('File taxes', null, 'high', [' finance ', '', 'Urgent']);
assert(tagged.tags.join(',') === 'home,Errands,urgent', 'add stores normalized comma-separated tags');
assert(arrayTagged.tags.join(',') === 'finance,Urgent', 'add stores normalized array tags');

const restoredTagApp = new TodoApp(tagStoragePath);
assert(restoredTagApp.list().find(todo => todo.title === 'Buy groceries').tags.join(',') === 'home,Errands,urgent', 'constructor restores tags');

const oldTagStoragePath = path.join(tempDir, 'old-tag-todos.json');
fs.writeFileSync(oldTagStoragePath, JSON.stringify({
  nextId: 2,
  todos: [{ id: 1, title: 'Old todo', completed: false, createdAt: new Date().toISOString() }],
}));
const oldTagApp = new TodoApp(oldTagStoragePath);
assert(Array.isArray(oldTagApp.list()[0].tags) && oldTagApp.list()[0].tags.length === 0, 'constructor defaults missing tags to empty array');

const tagFilterStoragePath = path.join(tempDir, 'tag-filter-todos.json');
const tagFilterApp = new TodoApp(tagFilterStoragePath);
tagFilterApp.add('Low home task', null, 'low', 'Home');
const completedUrgent = tagFilterApp.add('High work task', null, 'high', 'work,urgent');
tagFilterApp.add('Medium home task', null, 'medium', 'home,review');
tagFilterApp.complete(completedUrgent.id);
assert(tagFilterApp.list({ tag: 'HOME' }).map(todo => todo.title).join(',') === 'Medium home task,Low home task', 'list filters tags case-insensitively and preserves priority sort');
assert(tagFilterApp.list({ status: 'completed', tag: 'urgent' }).map(todo => todo.title).join(',') === 'High work task', 'list combines status and tag filters');
assert(tagFilterApp.list({ search: 'medium', tag: 'review' }).map(todo => todo.title).join(',') === 'Medium home task', 'list combines search and tag filters');

// Filters
const filterStoragePath = path.join(tempDir, 'filter-todos.json');
const filterApp = new TodoApp(filterStoragePath);
filterApp.add('Write release notes', null, 'low');
const completedHigh = filterApp.add('Fix login bug', null, 'high');
filterApp.add('Review Search UI', null, 'medium');
filterApp.complete(completedHigh.id);

assert(filterApp.list({ status: 'active' }).map(todo => todo.title).join(',') === 'Review Search UI,Write release notes', 'list filters active todos');
assert(filterApp.list({ status: 'completed' }).map(todo => todo.title).join(',') === 'Fix login bug', 'list filters completed todos');
assert(filterApp.list({ search: 'search' }).map(todo => todo.title).join(',') === 'Review Search UI', 'list searches title case-insensitively');
assert(filterApp.list({ status: 'active', search: 're' }).map(todo => todo.priority).join(',') === 'medium,low', 'list combines filters and preserves priority sort');

fs.rmSync(tempDir, { recursive: true, force: true });

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
